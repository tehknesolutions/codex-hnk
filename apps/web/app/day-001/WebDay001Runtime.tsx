'use client';

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createHnkSupabaseClient,
  parseAuthCallbackUrl,
  type HnkAuthStorage,
  type HnkSupabaseClient,
} from '@hnk/supabase-client';
import runtimeStyles from './web-runtime.module.css';

type WebAuthPhase = 'loading' | 'offline' | 'signed-out' | 'signed-in';

export type WebDay001RuntimeState = {
  phase: WebAuthPhase;
  configured: boolean;
  userId: string | null;
  email: string | null;
  accessToken: string | null;
  client: HnkSupabaseClient | null;
  message: string | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

const RuntimeContext = createContext<WebDay001RuntimeState | null>(null);
const AUTH_PREFIX = 'hnk.web.auth.v1';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
const webSupabaseConfigured =
  supabaseUrl.startsWith('https://') &&
  publishableKey.length > 20 &&
  !publishableKey.includes('replace-with');

function storageKey(key: string): string {
  return `${AUTH_PREFIX}.${key.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

const webStorage: HnkAuthStorage = {
  getItem(key) {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(storageKey(key));
  },
  setItem(key, value) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey(key), value);
  },
  removeItem(key) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(storageKey(key));
  },
};

function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Não foi possível concluir a autenticação do Átrio Web.';
}

export function WebDay001RuntimeProvider({ children }: PropsWithChildren) {
  const client = useMemo<HnkSupabaseClient | null>(() => {
    if (!webSupabaseConfigured) return null;
    return createHnkSupabaseClient(supabaseUrl, publishableKey, {
      auth: {
        storage: webStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }, []);

  const [phase, setPhase] = useState<WebAuthPhase>(webSupabaseConfigured ? 'loading' : 'offline');
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    let active = true;

    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setMessage(error.message);
        setPhase('signed-out');
        return;
      }
      const session = data.session;
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
      setAccessToken(session?.access_token ?? null);
      setPhase(session ? 'signed-in' : 'signed-out');
    });

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
      setAccessToken(session?.access_token ?? null);
      setPhase(session ? 'signed-in' : 'signed-out');
      if (session) setMessage(null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!client || typeof window === 'undefined') return;
    const parsedCallback = parseAuthCallbackUrl(window.location.href);
    if (!parsedCallback) return;

    const authClient = client;
    const callback = parsedCallback;
    let active = true;

    async function consumeCallback() {
      try {
        if (callback.kind === 'error') throw new Error(callback.message);
        if (callback.kind === 'tokens') {
          const { error } = await authClient.auth.setSession({
            access_token: callback.accessToken,
            refresh_token: callback.refreshToken,
          });
          if (error) throw error;
        } else {
          const { error } = await authClient.auth.exchangeCodeForSession(callback.code);
          if (error) throw error;
        }
        if (active) setMessage(null);
      } catch (error) {
        if (active) {
          setMessage(normalizeError(error));
          setPhase('signed-out');
        }
      } finally {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    void consumeCallback();
    return () => {
      active = false;
    };
  }, [client]);

  const value = useMemo<WebDay001RuntimeState>(() => ({
    phase,
    configured: webSupabaseConfigured,
    userId,
    email,
    accessToken,
    client,
    message,
    async signIn(inputEmail, password) {
      if (!client) throw new Error('supabase_not_configured');
      setMessage(null);
      const { error } = await client.auth.signInWithPassword({
        email: inputEmail.trim(),
        password,
      });
      if (error) {
        setMessage(error.message);
        throw error;
      }
    },
    async signUp(inputEmail, password) {
      if (!client) throw new Error('supabase_not_configured');
      setMessage(null);
      const redirect = typeof window === 'undefined' ? undefined : `${window.location.origin}/day-001`;
      const { data, error } = await client.auth.signUp({
        email: inputEmail.trim(),
        password,
        options: redirect ? { emailRedirectTo: redirect } : undefined,
      });
      if (error) {
        setMessage(error.message);
        throw error;
      }
      if (!data.session) {
        setMessage('Conta criada. Confirme o e-mail para retornar ao Átrio Web e concluir a sessão.');
      }
    },
    async signOut() {
      if (!client) return;
      const { error } = await client.auth.signOut();
      if (error) {
        setMessage(error.message);
        throw error;
      }
      setMessage(null);
    },
  }), [phase, userId, email, accessToken, client, message]);

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export function useWebDay001Runtime(): WebDay001RuntimeState {
  const value = useContext(RuntimeContext);
  if (!value) throw new Error('WebDay001RuntimeProvider is required');
  return value;
}

export function WebAtriumBoundary({ children }: PropsWithChildren) {
  const runtime = useWebDay001Runtime();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (!runtime.configured || runtime.phase === 'offline' || runtime.phase === 'signed-in') {
    return children;
  }

  if (runtime.phase === 'loading') {
    return (
      <main className={runtimeStyles.shell} data-hnk-theme="kether">
        <div className={runtimeStyles.originPoint} />
        <p className={runtimeStyles.systemCopy}>LENDO O ESTADO DO ÁTRIO WEB</p>
      </main>
    );
  }

  async function submit() {
    if (!email.trim() || password.length < 6 || busy) return;
    setBusy(true);
    try {
      if (mode === 'sign-in') await runtime.signIn(email, password);
      else await runtime.signUp(email, password);
    } catch {
      // Runtime state exposes the normalized message without logging credentials.
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={runtimeStyles.shell} data-hnk-theme="kether">
      <section className={runtimeStyles.gate}>
        <div className={runtimeStyles.glyph} aria-hidden="true">
          <i className={runtimeStyles.glyphRing} />
          <i className={runtimeStyles.glyphAxis} />
          <i className={runtimeStyles.glyphPoint} />
        </div>
        <p className={runtimeStyles.eyebrow}>O ÁTRIO · WEB</p>
        <h1>{mode === 'sign-in' ? 'Retorne ao limiar.' : 'Abra uma passagem.'}</h1>
        <p className={runtimeStyles.body}>
          A sessão é hospedada pelo Supabase. Conteúdo íntimo do Vault continua bloqueado no browser até a política E2EE Web ser congelada.
        </p>
        <label className={runtimeStyles.field}>
          <span>E-MAIL</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className={runtimeStyles.field}>
          <span>SENHA</span>
          <input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {runtime.message ? <p className={runtimeStyles.message}>{runtime.message}</p> : null}
        <button className={runtimeStyles.primary} type="button" disabled={busy || !email.trim() || password.length < 6} onClick={() => void submit()}>
          {busy ? 'AGUARDE…' : mode === 'sign-in' ? 'ENTRAR NO ÁTRIO' : 'CRIAR CONTA'}
        </button>
        <button className={runtimeStyles.secondary} type="button" onClick={() => setMode((value) => value === 'sign-in' ? 'sign-up' : 'sign-in')}>
          {mode === 'sign-in' ? 'CRIAR UMA CONTA' : 'JÁ TENHO UMA CONTA'}
        </button>
      </section>
    </main>
  );
}
