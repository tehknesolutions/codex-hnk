'use client';

import type { VaultTextPort } from '@hnk/vault-contract';
import {
  createDeviceEnvelope,
  encryptNativeCompatibleVaultText,
  generateDeviceKek,
  generateVaultDataKey,
  unwrapDeviceVaultDataKey,
} from '@hnk/vault-web-crypto-lab';
import { loadDeviceEnrollment, persistDeviceEnrollment } from '@hnk/vault-web-crypto-lab/indexeddb';
import { saveEncryptedVaultEntry, type HnkSupabaseClient } from '@hnk/supabase-client';

const KEY_VERSION = 1;
const DEVICE_ID_PREFIX = 'hnk.vault.web.device-id.v1';

function deviceId(userId: string): string {
  const key = `${DEVICE_ID_PREFIX}:${userId}`;
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = globalThis.crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}

async function loadOrCreateVdk(userId: string): Promise<CryptoKey> {
  const id = deviceId(userId);
  const existing = await loadDeviceEnrollment(userId, KEY_VERSION, id);
  if (existing) return unwrapDeviceVaultDataKey(existing.envelope, existing.deviceKek);

  const extractableVdk = await generateVaultDataKey(undefined, true);
  const kek = await generateDeviceKek();
  const envelope = await createDeviceEnvelope({ userId, keyVersion: KEY_VERSION, deviceId: id, vdk: extractableVdk, deviceKek: kek });
  await persistDeviceEnrollment({ userId, keyVersion: KEY_VERSION, deviceId: id, deviceKek: kek, envelope });
  return unwrapDeviceVaultDataKey(envelope, kek);
}

export function createWebVaultTextPort(client: HnkSupabaseClient): VaultTextPort {
  return {
    capability() {
      return { encryptedText: true, serverReceivesPlaintext: false, deviceBound: true, recoveryConfigured: false };
    },
    async saveText(input) {
      if (typeof window === 'undefined') throw new Error('web_vault_requires_browser');
      const key = await loadOrCreateVdk(input.userId);
      const payload = await encryptNativeCompatibleVaultText(key, {
        userId: input.userId,
        day: input.day,
        kind: input.kind,
        plaintext: input.plaintext,
      });
      const entry = await saveEncryptedVaultEntry(client, { day: input.day, payload });
      return {
        entryId: entry.id,
        day: input.day,
        kind: input.kind,
        cryptoAlg: 'AES-256-GCM',
        cryptoVersion: 1,
        recoveryState: 'DEVICE_BOUND',
      };
    },
  };
}
