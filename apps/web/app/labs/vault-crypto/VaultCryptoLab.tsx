'use client';

import { useEffect, useState } from 'react';
import {
  bytesToBase64,
  createDeviceEnvelope,
  createRecoveryEnvelope,
  decryptNativeCompatibleVaultText,
  encryptNativeCompatibleVaultText,
  generateDeviceKek,
  generateRecoveryRootSecret,
  generateVaultDataKey,
  unwrapDeviceVaultDataKey,
  unwrapRecoveryVaultDataKey,
} from '@hnk/vault-web-crypto-lab';
import {
  deleteDeviceEnrollment,
  deleteVaultLabDatabase,
  loadDeviceEnrollment,
  persistDeviceEnrollment,
} from '@hnk/vault-web-crypto-lab/indexeddb';
import styles from './vault-crypto-lab.module.css';

type Check = { name: string; ok: boolean; detail: string };

const USER_ID = '00000000-0000-4000-8000-000000000001';
const DB_NAME = 'hnk-vault-crypto-lab-browser-v1';

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

async function runBrowserLab(): Promise<Check[]> {
  assert(window.isSecureContext, 'secure_context_required');
  assert(Boolean(window.crypto?.subtle), 'web_crypto_required');
  assert(typeof indexedDB !== 'undefined', 'indexeddb_required');
  await deleteVaultLabDatabase(DB_NAME).catch(() => undefined);

  const checks: Check[] = [];
  const recoveryRootSecret = generateRecoveryRootSecret();
  const vdk = await generateVaultDataKey(undefined, true);
  const recoveryEnvelope = await createRecoveryEnvelope({
    userId: USER_ID,
    keyVersion: 1,
    recoveryRootSecret,
    vdk,
  });
  checks.push({ name: 'recovery-envelope', ok: true, detail: 'HKDF-SHA-256 + AES-KW-256' });

  const deviceKekA = await generateDeviceKek();
  assert(deviceKekA.extractable === false, 'device_kek_extractable');
  await crypto.subtle.exportKey('raw', deviceKekA).then(
    () => { throw new Error('device_kek_export_succeeded'); },
    () => undefined,
  );
  checks.push({ name: 'non-extractable-dkek', ok: true, detail: 'exportKey rejected' });

  const deviceEnvelopeA = await createDeviceEnvelope({
    userId: USER_ID,
    keyVersion: 1,
    deviceId: 'browser-a',
    vdk,
    deviceKek: deviceKekA,
  });
  await persistDeviceEnrollment({
    userId: USER_ID,
    keyVersion: 1,
    deviceId: 'browser-a',
    deviceKek: deviceKekA,
    envelope: deviceEnvelopeA,
  }, DB_NAME);
  const storedA = await loadDeviceEnrollment(USER_ID, 1, 'browser-a', DB_NAME);
  assert(storedA?.deviceKek.extractable === false, 'indexeddb_key_roundtrip_failed');
  checks.push({ name: 'indexeddb-cryptokey-roundtrip', ok: true, detail: 'CryptoKey survived structured clone' });

  const workingA = await unwrapDeviceVaultDataKey(storedA.envelope, storedA.deviceKek);
  assert(workingA.extractable === false, 'working_vdk_extractable');
  const payload = await encryptNativeCompatibleVaultText(workingA, {
    userId: USER_ID,
    day: 1,
    kind: 'mirror',
    plaintext: 'browser-lab-private-fixture',
  });
  assert(await decryptNativeCompatibleVaultText(workingA, payload) === 'browser-lab-private-fixture', 'device_a_decrypt_failed');
  checks.push({ name: 'device-a-encrypt-decrypt', ok: true, detail: 'AES-256-GCM + frozen AAD format' });

  const recoveredForEnrollment = await unwrapRecoveryVaultDataKey(recoveryEnvelope, recoveryRootSecret, { extractable: true });
  const deviceKekB = await generateDeviceKek();
  const deviceEnvelopeB = await createDeviceEnvelope({
    userId: USER_ID,
    keyVersion: 1,
    deviceId: 'browser-b',
    vdk: recoveredForEnrollment,
    deviceKek: deviceKekB,
  });
  const workingB = await unwrapDeviceVaultDataKey(deviceEnvelopeB, deviceKekB);
  assert(await decryptNativeCompatibleVaultText(workingB, payload) === 'browser-lab-private-fixture', 'device_b_recovery_failed');
  checks.push({ name: 'multi-device-recovery', ok: true, detail: 'RRS recovered same historical fixture' });

  const recoverySecretBase64 = bytesToBase64(recoveryRootSecret);
  const browserStorage = [
    ...Object.entries(localStorage),
    ...Object.entries(sessionStorage),
  ].map(([key, value]) => `${key}=${value}`).join('\n');
  assert(!browserStorage.includes(recoverySecretBase64), 'recovery_secret_leaked_to_web_storage');
  assert(!/hnk\.vault/i.test(browserStorage), 'vault_material_found_in_web_storage');
  checks.push({ name: 'no-localstorage-vault-material', ok: true, detail: 'no RRS/Vault material in localStorage or sessionStorage' });

  await deleteDeviceEnrollment(USER_ID, 1, 'browser-a', DB_NAME);
  assert(await loadDeviceEnrollment(USER_ID, 1, 'browser-a', DB_NAME) === null, 'device_delete_failed');
  checks.push({ name: 'local-enrollment-delete', ok: true, detail: 'deleted device cannot load local envelope' });

  await deleteVaultLabDatabase(DB_NAME);
  return checks;
}

export function VaultCryptoLab() {
  const [status, setStatus] = useState<'RUNNING' | 'PASS' | 'FAIL'>('RUNNING');
  const [checks, setChecks] = useState<Check[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void runBrowserLab().then(
      (result) => {
        if (!active) return;
        setChecks(result);
        setStatus('PASS');
      },
      (reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'vault_crypto_lab_failed');
        setStatus('FAIL');
      },
    );
    return () => { active = false; };
  }, []);

  return (
    <main className={styles.shell}>
      <p className={styles.eyebrow}>HNK SECURITY LAB · EXPERIMENTAL · NO VAULT WRITES</p>
      <h1>Web Vault Crypto Lab V1</h1>
      <p className={styles.body}>
        Browser-only acceptance surface for non-extractable keys, IndexedDB structured-clone,
        recovery envelopes and Native-compatible AES-GCM payloads. No Supabase persistence is used here.
      </p>
      <div className={styles.status} data-lab-status={status}>{status}</div>
      {error ? <pre className={styles.error} data-lab-error>{error}</pre> : null}
      <ol className={styles.list}>
        {checks.map((check) => (
          <li key={check.name} data-check={check.name} data-check-ok={String(check.ok)}>
            <strong>{check.name}</strong><span>{check.detail}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
