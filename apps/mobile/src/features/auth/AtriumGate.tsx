import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useHnkAuth } from './AuthContext';

export function AtriumGate({ children }: { children: ReactNode }) {
  const auth = useHnkAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'in' | 'up' | null>(null);
  const [demo, setDemo] = useState(false);

  if (auth.phase === 'loading') {
    return (
      <View style={styles.loading}>
        <View style={styles.point} />
        <ActivityIndicator color="#fff8df" />
        <Text style={styles.loadingText}>O ÁTRIO RECONHECE A SESSÃO</Text>
      </View>
    );
  }

  if (auth.phase === 'signed-in' || demo) return <>{children}</>;

  const canSubmit = email.trim().length > 4 && password.length >= 6 && !busy;

  async function submit(mode: 'in' | 'up') {
    if (!canSubmit) return;
    setBusy(mode);
    try {
      if (mode === 'in') await auth.signIn(email, password);
      else await auth.signUp(email, password);
    } catch {
      // AuthContext preserves the provider message for deliberate UX display.
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.glyph}>
        <View style={styles.ringOuter} />
        <View style={styles.ringInner} />
        <View style={styles.point} />
      </View>

      <Text style={styles.eyebrow}>HNK CODEX · O ÁTRIO</Text>
      <Text style={styles.title}>Antes do portal, identidade.</Text>
      <Text style={styles.body}>
        O Átrio cuida da sessão e do progresso. O conteúdo íntimo do Espelho permanece fora desta camada e só entra no Vault depois de cifrado no dispositivo.
      </Text>

      {!auth.configured ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>MODO DE DESENVOLVIMENTO</Text>
          <Text style={styles.noticeBody}>
            As variáveis EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY não estão configuradas neste build. É possível atravessar a demonstração, mas nenhum XP será persistido.
          </Text>
          <Pressable style={styles.primary} onPress={() => setDemo(true)}>
            <Text style={styles.primaryText}>ABRIR DEMONSTRAÇÃO</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.panel}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="E-MAIL"
            placeholderTextColor="#65676e"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
            textContentType="password"
            placeholder="SENHA"
            placeholderTextColor="#65676e"
            style={styles.input}
          />

          {auth.message ? <Text style={styles.message}>{auth.message}</Text> : null}

          <Pressable
            disabled={!canSubmit}
            onPress={() => void submit('in')}
            style={[styles.primary, !canSubmit && styles.disabled]}
          >
            <Text style={styles.primaryText}>{busy === 'in' ? 'ABRINDO…' : 'ENTRAR NO ÁTRIO'}</Text>
          </Pressable>

          <Pressable
            disabled={!canSubmit}
            onPress={() => void submit('up')}
            style={[styles.secondary, !canSubmit && styles.disabled]}
          >
            <Text style={styles.secondaryText}>{busy === 'up' ? 'CRIANDO…' : 'CRIAR ACESSO'}</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.footer}>
        Sessão e progresso usam Supabase Auth/RLS. Diário, intenção, sonhos e distrações não são armazenados em claro nessa camada.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#030406', alignItems: 'center', justifyContent: 'center', gap: 20 },
  loadingText: { color: '#8f825e', fontSize: 10, letterSpacing: 2.2 },
  screen: { flexGrow: 1, backgroundColor: '#030406', alignItems: 'center', justifyContent: 'center', padding: 28, paddingVertical: 64 },
  glyph: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  ringOuter: { position: 'absolute', width: 174, height: 174, borderRadius: 87, borderWidth: 1, borderColor: 'rgba(219,196,115,0.22)' },
  ringInner: { position: 'absolute', width: 92, height: 92, borderRadius: 46, borderWidth: 1, borderColor: 'rgba(255,249,222,0.28)' },
  point: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fffbe8', shadowColor: '#fff1b4', shadowOpacity: 0.8, shadowRadius: 14 },
  eyebrow: { color: '#9d8b55', fontSize: 11, letterSpacing: 2.4, fontWeight: '600' },
  title: { color: '#fffdf4', fontSize: 34, lineHeight: 40, fontWeight: '300', textAlign: 'center', maxWidth: 560, marginTop: 14 },
  body: { color: '#a9abb2', fontSize: 15, lineHeight: 23, maxWidth: 560, textAlign: 'center', marginTop: 16, marginBottom: 28 },
  panel: { width: '100%', maxWidth: 520, gap: 12 },
  notice: { width: '100%', maxWidth: 520, borderWidth: 1, borderColor: '#40391f', backgroundColor: '#0c0d11', padding: 20, borderRadius: 22 },
  noticeTitle: { color: '#d8c889', fontSize: 10, letterSpacing: 1.8, fontWeight: '700' },
  noticeBody: { color: '#a9abb2', fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 18 },
  input: { minHeight: 54, borderWidth: 1, borderColor: '#33343a', backgroundColor: '#090a0e', color: '#fffdf4', borderRadius: 16, paddingHorizontal: 16, fontSize: 15 },
  message: { color: '#d8c889', fontSize: 13, lineHeight: 19, paddingHorizontal: 4 },
  primary: { minHeight: 54, borderRadius: 16, backgroundColor: '#e2cf82', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#12120f', fontSize: 12, letterSpacing: 1.7, fontWeight: '800' },
  secondary: { minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: '#5a5030', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#d8c889', fontSize: 11, letterSpacing: 1.5, fontWeight: '700' },
  disabled: { opacity: 0.42 },
  footer: { color: '#62646b', maxWidth: 540, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 28 },
});
