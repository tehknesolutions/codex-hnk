import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import {
  parseAuthCallbackUrl,
  type HnkSupabaseClient,
} from '@hnk/supabase-client';
import {
  hnkSupabase,
  hnkSupabaseConfigured,
  registerMobileAuthLifecycle,
} from './mobile-supabase';

export type AuthPhase = 'loading' | 'offline' | 'signed-out' | 'signed-in';

export interface HnkAuthState {
  phase: AuthPhase;
  configured: boolean;
  userId: string | null;
  email: string | null;
  accessToken: string | null;
  client: HnkSupabaseClient | null;
  message: string | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const HnkAuthContext = createContext<HnkAuthState | null>(null);

function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Não foi possível concluir a autenticação.';
}

function resolveAuthRedirectUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim();
  if (explicit) return explicit;

  if (Platform.OS === 'web') {
    const location = (globalThis as { location?: { origin?: string } }).location;
    if (location?.origin) return location.origin;
  }

  return Linking.createURL('auth/callback');
}

function clearWebAuthCallbackUrl(): void {
  if (Platform.OS !== 'web') return;

  const browser = globalThis as {
    location?: { pathname?: string };
    history?: { replaceState(data: unknown, unused: string, url?: string): void };
  };

  browser.history?.replaceState(null, '', browser.location?.pathname ?? '/');
}

export function HnkAuthProvider({ children }: PropsWithChildren) {
  const [phase, setPhase] = useState<AuthPhase>(hnkSupabaseConfigured ? 'loading' : 'offline');
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => registerMobileAuthLifecycle(), []);

  useEffect(() => {
    if (!hnkSupabase) return;
    let active = true;

    void hnkSupabase.auth.getSession().then(({ data, error }) => {
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

    const { data } = hnkSupabase.auth.onAuthStateChange((_event, session) => {
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
  }, []);

  useEffect(() => {
    if (!hnkSupabase) return;
    const client = hnkSupabase;
    let active = true;

    async function consumeAuthCallback(url: string): Promise<void> {
      const callback = parseAuthCallbackUrl(url);
      if (!callback || !active) return;

      if (callback.kind === 'error') {
        setMessage(callback.message);
        setPhase('signed-out');
        clearWebAuthCallbackUrl();
        return;
      }

      try {
        if (callback.kind === 'tokens') {
          const { error } = await client.auth.setSession({
            access_token: callback.accessToken,
            refresh_token: callback.refreshToken,
          });
          if (error) throw error;
        } else {
          const { error } = await client.auth.exchangeCodeForSession(callback.code);
          if (error) throw error;
        }

        if (active) setMessage(null);
      } catch (error) {
        if (active) {
          setMessage(normalizeError(error));
          setPhase('signed-out');
        }
      } finally {
        clearWebAuthCallbackUrl();
      }
    }

    void Linking.getInitialURL()
      .then((url) => {
        if (url) return consumeAuthCallback(url);
      })
      .catch((error) => {
        if (active) setMessage(normalizeError(error));
      });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void consumeAuthCallback(url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const value = useMemo<HnkAuthState>(() => ({
    phase,
    configured: hnkSupabaseConfigured,
    userId,
    email,
    accessToken,
    client: hnkSupabase,
    message,
    async signIn(inputEmail, password) {
      if (!hnkSupabase) throw new Error('supabase_not_configured');
      setMessage(null);
      const { error } = await hnkSupabase.auth.signInWithPassword({
        email: inputEmail.trim(),
        password,
      });
      if (error) {
        setMessage(error.message);
        throw error;
      }
    },
    async signUp(inputEmail, password) {
      if (!hnkSupabase) throw new Error('supabase_not_configured');
      setMessage(null);
      const { data, error } = await hnkSupabase.auth.signUp({
        email: inputEmail.trim(),
        password,
        options: {
          emailRedirectTo: resolveAuthRedirectUrl(),
        },
      });
      if (error) {
        setMessage(error.message);
        throw error;
      }
      if (!data.session) {
        setMessage('Conta criada. Confirme o e-mail; o link retornará ao Átrio para concluir a sessão.');
      }
    },
    async signOut() {
      if (!hnkSupabase) return;
      const { error } = await hnkSupabase.auth.signOut();
      if (error) {
        setMessage(normalizeError(error));
        throw error;
      }
      setMessage(null);
    },
  }), [phase, userId, email, accessToken, message]);

  return <HnkAuthContext.Provider value={value}>{children}</HnkAuthContext.Provider>;
}

export function useHnkAuth(): HnkAuthState {
  const value = useContext(HnkAuthContext);
  if (!value) throw new Error('HnkAuthProvider is required');
  return value;
}
