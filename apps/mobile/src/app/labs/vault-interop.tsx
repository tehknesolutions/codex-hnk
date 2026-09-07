import { useEffect, useRef, useState } from 'react';
import { File, Paths } from 'expo-file-system';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  runNativeVaultInteropVector,
  type NativeVaultInteropResult,
} from '../../features/vault/NativeVaultInteropHarness';

const AUTO_RUN = process.env.EXPO_PUBLIC_HNK_NATIVE_INTEROP_AUTORUN === '1';
const CI_PROOF_FILENAME = 'hnk-native-interop-proof-v1.json';
const CI_PROOF_SCHEMA = 'hnk-native-interop-proof-v1';

interface NativeInteropCiProof {
  schema: typeof CI_PROOF_SCHEMA;
  platform: string;
  vector?: string;
  status: 'PASS' | 'FAIL' | 'NATIVE_DEVICE_REQUIRED';
  checks: Array<{ name: string; ok: boolean }>;
  errorCode?: string;
  secretsCaptured: false;
}

function sanitizeErrorCode(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9_-]+/g, '_').slice(0, 80);
  return normalized || 'native_vault_interop_failed';
}

async function persistCiProof(proof: NativeInteropCiProof): Promise<void> {
  if (!AUTO_RUN || (Platform.OS !== 'android' && Platform.OS !== 'ios')) return;
  const file = new File(Paths.document, CI_PROOF_FILENAME);
  file.create({ overwrite: true, intermediates: true });
  await file.write(JSON.stringify(proof));
}

export default function NativeVaultInteropLabRoute() {
  const [result, setResult] = useState<NativeVaultInteropResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRunStarted = useRef(false);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const nextResult = await runNativeVaultInteropVector();
      setResult(nextResult);
      await persistCiProof({
        schema: CI_PROOF_SCHEMA,
        platform: nextResult.platform,
        vector: nextResult.vectorId,
        status: nextResult.status,
        checks: nextResult.checks.map((check) => ({ name: check.name, ok: check.ok })),
        secretsCaptured: false,
      });
    } catch (reason) {
      const errorCode = sanitizeErrorCode(
        reason instanceof Error ? reason.message : 'native_vault_interop_failed',
      );
      setResult(null);
      setError(errorCode);
      try {
        await persistCiProof({
          schema: CI_PROOF_SCHEMA,
          platform: Platform.OS,
          status: 'FAIL',
          checks: [],
          errorCode,
          secretsCaptured: false,
        });
      } catch {
        // The CI runner will fail closed when the redacted proof file is absent.
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (
      AUTO_RUN &&
      !autoRunStarted.current &&
      (Platform.OS === 'android' || Platform.OS === 'ios')
    ) {
      autoRunStarted.current = true;
      void run();
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.shell}>
      <Text style={styles.eyebrow}>HNK SECURITY LAB · EXPERIMENTAL · NO VAULT WRITES</Text>
      <Text style={styles.title}>Native Vault Interop</Text>
      <Text style={styles.body}>
        Executa o vetor público congelado diretamente no expo-crypto nativo. Não acessa SecureStore,
        Supabase, diário, XP ou o Vault de produção.
      </Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>PLATFORM · {Platform.OS.toUpperCase()}</Text>
        <Text style={styles.metaText}>REQUIRED · ANDROID / IOS</Text>
        {AUTO_RUN ? <Text style={styles.metaText}>CI MODE · AUTO RUN</Text> : null}
      </View>
      <Pressable
        testID="native-interop-run"
        accessibilityLabel="native-interop-run"
        style={[styles.button, busy && styles.buttonDisabled]}
        disabled={busy}
        onPress={() => void run()}
      >
        <Text style={styles.buttonText}>{busy ? 'EXECUTANDO…' : 'EXECUTAR VETOR NATIVO'}</Text>
      </Pressable>
      {error ? (
        <Text
          testID="native-interop-error"
          accessibilityLabel="native-interop-error"
          style={styles.error}
        >
          FAIL · {error}
        </Text>
      ) : null}
      {result ? (
        <View testID="native-interop-result" style={styles.result}>
          <Text
            testID="native-interop-status"
            accessibilityLabel={`native-interop-status-${result.status}`}
            style={styles.status}
          >
            {result.status}
          </Text>
          <Text testID="native-interop-vector" style={styles.vector}>{result.vectorId}</Text>
          {result.checks.map((check) => (
            <View
              accessible
              accessibilityLabel={`native-interop-check-${check.name}-${check.ok ? 'PASS' : 'FAIL'}`}
              testID={`native-interop-check-${check.name}`}
              key={check.name}
              style={styles.checkRow}
            >
              <Text style={styles.checkName}>{check.name}</Text>
              <Text style={styles.checkValue}>{check.ok ? 'PASS' : 'FAIL'}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  shell: { minHeight: '100%', padding: 24, paddingTop: 72, backgroundColor: '#07080a' },
  eyebrow: { color: '#cbb06d', fontSize: 11, letterSpacing: 1.5, marginBottom: 18 },
  title: { color: '#f7f4e8', fontSize: 44, lineHeight: 46, marginBottom: 20 },
  body: { maxWidth: 720, color: '#b8b7b0', fontSize: 16, lineHeight: 26 },
  meta: { marginTop: 28, paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#3c392f', gap: 6 },
  metaText: { color: '#8f8d84', fontSize: 11, letterSpacing: 1.2 },
  button: { marginTop: 28, padding: 18, borderWidth: 1, borderColor: '#cbb06d', alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#cbb06d', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  result: { marginTop: 28 },
  status: { color: '#f7f4e8', fontSize: 30, marginBottom: 8 },
  vector: { color: '#8f8d84', marginBottom: 18 },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#2a2b2e' },
  checkName: { color: '#d7d4c9' },
  checkValue: { color: '#cbb06d', fontWeight: '700' },
  error: { marginTop: 24, color: '#f3a6a6' },
});
