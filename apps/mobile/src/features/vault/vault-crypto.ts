import { Platform } from 'react-native';
import {
  AESEncryptionKey,
  AESSealedData,
  CryptoDigestAlgorithm,
  aesDecryptAsync,
  aesEncryptAsync,
  digestStringAsync,
} from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const VAULT_KEY_PREFIX = 'hnk.vault.aes256.v1';
const VAULT_KEYCHAIN_SERVICE = 'hnk.vault.aes256.v1';
const VAULT_CRYPTO_ALG = 'AES-256-GCM';
const VAULT_CRYPTO_VERSION = 1;
const GCM_TAG_BYTES = 16;

export type VaultEntryKind = 'mirror' | 'intention' | 'dream' | 'distraction' | 'journal';

export interface VaultCiphertextPayload {
  ciphertext: string;
  nonce: string;
  aad: string;
  cryptoAlg: typeof VAULT_CRYPTO_ALG;
  cryptoVersion: typeof VAULT_CRYPTO_VERSION;
  checksumSha256: string;
}

export interface EncryptVaultTextInput {
  userId: string;
  day: number | null;
  kind: VaultEntryKind;
  plaintext: string;
}

export interface DecryptVaultTextInput {
  userId: string;
  payload: VaultCiphertextPayload;
}

function assertUserId(userId: string): void {
  if (!userId.trim()) throw new Error('vault_user_id_required');
}

function assertDay(day: number | null): void {
  if (day === null) return;
  if (!Number.isInteger(day) || day < 1 || day > 365) throw new Error('vault_invalid_day');
}

function keyName(userId: string): string {
  assertUserId(userId);
  return `${VAULT_KEY_PREFIX}.${userId}`;
}

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;

    output += alphabet[(triple >> 18) & 63];
    output += alphabet[(triple >> 12) & 63];
    output += i + 1 < bytes.length ? alphabet[(triple >> 6) & 63] : '=';
    output += i + 2 < bytes.length ? alphabet[triple & 63] : '=';
  }

  return output;
}

function base64ToBytes(value: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = value.replace(/\s+/g, '');
  if (clean.length % 4 !== 0) throw new Error('vault_invalid_base64');

  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  const output = new Uint8Array((clean.length / 4) * 3 - padding);
  let out = 0;

  for (let i = 0; i < clean.length; i += 4) {
    const chars = clean.slice(i, i + 4);
    const values = [...chars].map((char) => (char === '=' ? 0 : alphabet.indexOf(char)));
    if (values.some((index) => index < 0)) throw new Error('vault_invalid_base64');

    const triple = (values[0] << 18) | (values[1] << 12) | (values[2] << 6) | values[3];
    if (out < output.length) output[out++] = (triple >> 16) & 255;
    if (out < output.length) output[out++] = (triple >> 8) & 255;
    if (out < output.length) output[out++] = triple & 255;
  }

  return output;
}

function utf8ToBase64(value: string): string {
  return bytesToBase64(new TextEncoder().encode(value));
}

function base64ToUtf8(value: string): string {
  return new TextDecoder().decode(base64ToBytes(value));
}

function buildAad(input: Pick<EncryptVaultTextInput, 'userId' | 'day' | 'kind'>): string {
  return JSON.stringify({
    schema: 'hnk-vault-v1',
    user: input.userId,
    day: input.day,
    kind: input.kind,
  });
}

async function assertSecureStoreAvailable(): Promise<void> {
  if (Platform.OS === 'web') throw new Error('vault_secure_storage_unavailable_on_web');
  const available = await SecureStore.isAvailableAsync();
  if (!available) throw new Error('vault_secure_storage_unavailable');
}

async function getOrCreateVaultKey(userId: string): Promise<AESEncryptionKey> {
  await assertSecureStoreAvailable();
  const storageKey = keyName(userId);
  const options: SecureStore.SecureStoreOptions = {
    keychainService: VAULT_KEYCHAIN_SERVICE,
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };

  const existing = await SecureStore.getItemAsync(storageKey, options);
  if (existing) {
    return (await AESEncryptionKey.import(existing, 'base64')) as AESEncryptionKey;
  }

  const generated = (await AESEncryptionKey.generate()) as AESEncryptionKey;
  const encoded = await generated.encoded('base64');
  await SecureStore.setItemAsync(storageKey, encoded, options);
  return generated;
}

async function getVaultKey(userId: string): Promise<AESEncryptionKey> {
  await assertSecureStoreAvailable();
  const options: SecureStore.SecureStoreOptions = {
    keychainService: VAULT_KEYCHAIN_SERVICE,
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  const existing = await SecureStore.getItemAsync(keyName(userId), options);
  if (!existing) throw new Error('vault_key_not_found');
  return (await AESEncryptionKey.import(existing, 'base64')) as AESEncryptionKey;
}

async function checksum(payload: Pick<VaultCiphertextPayload, 'ciphertext' | 'nonce' | 'aad'>): Promise<string> {
  return digestStringAsync(
    CryptoDigestAlgorithm.SHA256,
    `${payload.nonce}.${payload.ciphertext}.${payload.aad}`,
  );
}

/**
 * Encrypts sensitive prose before it can enter any network/storage adapter.
 *
 * The returned payload contains only ciphertext + nonce + AAD + integrity
 * checksum. The AES-256 key remains in device SecureStore and is never included
 * in the payload sent to Supabase.
 */
export async function encryptVaultText(input: EncryptVaultTextInput): Promise<VaultCiphertextPayload> {
  assertUserId(input.userId);
  assertDay(input.day);
  if (input.plaintext.length === 0) throw new Error('vault_plaintext_required');

  const key = await getOrCreateVaultKey(input.userId);
  const aad = utf8ToBase64(buildAad(input));
  const plaintextBytes = new TextEncoder().encode(input.plaintext);

  const sealed = await aesEncryptAsync(plaintextBytes, key, {
    additionalData: aad,
    nonce: { length: 12 },
    tagLength: GCM_TAG_BYTES,
  });

  const ciphertext = await sealed.ciphertext({ encoding: 'base64', includeTag: true });
  const nonce = await sealed.iv('base64');
  if (typeof ciphertext !== 'string' || typeof nonce !== 'string') {
    throw new Error('vault_invalid_crypto_output');
  }

  const payloadBase = { ciphertext, nonce, aad };
  return {
    ...payloadBase,
    cryptoAlg: VAULT_CRYPTO_ALG,
    cryptoVersion: VAULT_CRYPTO_VERSION,
    checksumSha256: await checksum(payloadBase),
  };
}

export async function decryptVaultText(input: DecryptVaultTextInput): Promise<string> {
  assertUserId(input.userId);
  if (input.payload.cryptoAlg !== VAULT_CRYPTO_ALG || input.payload.cryptoVersion !== VAULT_CRYPTO_VERSION) {
    throw new Error('vault_crypto_version_unsupported');
  }

  const calculated = await checksum(input.payload);
  if (calculated !== input.payload.checksumSha256) throw new Error('vault_checksum_mismatch');

  const key = await getVaultKey(input.userId);
  const sealed = AESSealedData.fromParts(input.payload.nonce, input.payload.ciphertext, GCM_TAG_BYTES);
  const plaintext = await aesDecryptAsync(sealed, key, {
    additionalData: input.payload.aad,
    output: 'bytes',
  });

  if (!(plaintext instanceof Uint8Array)) throw new Error('vault_invalid_plaintext_output');
  return new TextDecoder().decode(plaintext);
}

export async function deleteLocalVaultKey(userId: string): Promise<void> {
  await assertSecureStoreAvailable();
  await SecureStore.deleteItemAsync(keyName(userId), {
    keychainService: VAULT_KEYCHAIN_SERVICE,
  });
}

export function decodeVaultAad(aadBase64: string): {
  schema: string;
  user: string;
  day: number | null;
  kind: VaultEntryKind;
} {
  const parsed = JSON.parse(base64ToUtf8(aadBase64)) as Record<string, unknown>;
  if (
    parsed.schema !== 'hnk-vault-v1' ||
    typeof parsed.user !== 'string' ||
    !(
      parsed.day === null ||
      (typeof parsed.day === 'number' && Number.isInteger(parsed.day) && parsed.day >= 1 && parsed.day <= 365)
    ) ||
    !['mirror', 'intention', 'dream', 'distraction', 'journal'].includes(String(parsed.kind))
  ) {
    throw new Error('vault_invalid_aad');
  }

  return parsed as {
    schema: string;
    user: string;
    day: number | null;
    kind: VaultEntryKind;
  };
}
