export type VaultEntryKind = 'mirror' | 'intention' | 'dream' | 'distraction' | 'journal';

export interface VaultCiphertextPayload {
  ciphertext: string;
  nonce: string;
  aad: string;
  cryptoAlg: 'AES-256-GCM';
  cryptoVersion: 1;
  checksumSha256: string;
}

export interface RecoveryEnvelopeV1 {
  schema: 'hnk-vault-key-envelope-v1';
  userId: string;
  keyVersion: number;
  envelopeKind: 'recovery';
  wrapAlg: 'AES-KW-256';
  kdfAlg: 'HKDF-SHA-256';
  kdfSalt: string;
  kdfInfoVersion: 1;
  wrappedVdk: string;
}

export interface DeviceEnvelopeV1 {
  schema: 'hnk-vault-device-envelope-v1';
  userId: string;
  keyVersion: number;
  deviceId: string;
  wrapAlg: 'AES-KW-256';
  wrappedVdk: string;
}

export interface EncryptVaultTextInput {
  userId: string;
  day: number | null;
  kind: VaultEntryKind;
  plaintext: string;
  nonce?: Uint8Array;
}

const AES_GCM_ALG = 'AES-GCM';
const AES_KW_ALG = 'AES-KW';
const VAULT_CRYPTO_ALG = 'AES-256-GCM';
const VAULT_CRYPTO_VERSION = 1 as const;
const GCM_TAG_BITS = 128;
const RRS_BYTES = 32;
const RECOVERY_SALT_BYTES = 16;

function cryptoApi(explicit?: Crypto): Crypto {
  const value = explicit ?? globalThis.crypto;
  if (!value?.subtle || !value.getRandomValues) throw new Error('web_crypto_unavailable');
  return value;
}

function copyBytes(value: Uint8Array): Uint8Array<ArrayBuffer> {
  return new Uint8Array(value);
}

function utf8(value: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(value);
}

export function bytesToBase64(bytes: Uint8Array): string {
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

export function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = value.replace(/\s+/g, '');
  if (!clean || clean.length % 4 !== 0) throw new Error('invalid_base64');
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  const output = new Uint8Array((clean.length / 4) * 3 - padding);
  let out = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const chars = clean.slice(i, i + 4);
    const values = [...chars].map((char) => (char === '=' ? 0 : alphabet.indexOf(char)));
    if (values.some((index) => index < 0)) throw new Error('invalid_base64');
    const triple = (values[0] << 18) | (values[1] << 12) | (values[2] << 6) | values[3];
    if (out < output.length) output[out++] = (triple >> 16) & 255;
    if (out < output.length) output[out++] = (triple >> 8) & 255;
    if (out < output.length) output[out++] = triple & 255;
  }
  return output;
}

export function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (!/^[a-f0-9]+$/i.test(hex) || hex.length % 2 !== 0) throw new Error('invalid_hex');
  const output = new Uint8Array(hex.length / 2);
  for (let i = 0; i < output.length; i += 1) output[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return output;
}

function assertUserId(userId: string): void {
  if (!userId.trim()) throw new Error('vault_user_id_required');
}

function assertKeyVersion(keyVersion: number): void {
  if (!Number.isInteger(keyVersion) || keyVersion < 1) throw new Error('vault_invalid_key_version');
}

function assertDay(day: number | null): void {
  if (day === null) return;
  if (!Number.isInteger(day) || day < 1 || day > 365) throw new Error('vault_invalid_day');
}

export function recoveryInfo(userId: string, keyVersion: number): string {
  assertUserId(userId);
  assertKeyVersion(keyVersion);
  return `hnk-vault-recovery-v1:${userId}:${keyVersion}`;
}

export function buildNativeCompatibleAad(input: {
  userId: string;
  day: number | null;
  kind: VaultEntryKind;
}): string {
  assertUserId(input.userId);
  assertDay(input.day);
  return bytesToBase64(
    utf8(JSON.stringify({ schema: 'hnk-vault-v1', user: input.userId, day: input.day, kind: input.kind })),
  );
}

export async function checksumVaultPayload(
  input: Pick<VaultCiphertextPayload, 'ciphertext' | 'nonce' | 'aad'>,
  explicitCrypto?: Crypto,
): Promise<string> {
  const c = cryptoApi(explicitCrypto);
  const digest = await c.subtle.digest('SHA-256', utf8(`${input.nonce}.${input.ciphertext}.${input.aad}`));
  return bytesToHex(new Uint8Array(digest));
}

export function generateRecoveryRootSecret(explicitCrypto?: Crypto): Uint8Array<ArrayBuffer> {
  const c = cryptoApi(explicitCrypto);
  return c.getRandomValues(new Uint8Array(RRS_BYTES));
}

export function generateRecoverySalt(explicitCrypto?: Crypto): Uint8Array<ArrayBuffer> {
  const c = cryptoApi(explicitCrypto);
  return c.getRandomValues(new Uint8Array(RECOVERY_SALT_BYTES));
}

export async function deriveRecoveryKek(
  recoveryRootSecret: Uint8Array,
  salt: Uint8Array,
  userId: string,
  keyVersion: number,
  explicitCrypto?: Crypto,
): Promise<CryptoKey> {
  assertUserId(userId);
  assertKeyVersion(keyVersion);
  if (recoveryRootSecret.byteLength !== RRS_BYTES) throw new Error('vault_invalid_recovery_secret_length');
  if (salt.byteLength < 16) throw new Error('vault_invalid_recovery_salt_length');
  const c = cryptoApi(explicitCrypto);
  const material = await c.subtle.importKey('raw', copyBytes(recoveryRootSecret), 'HKDF', false, ['deriveKey']);
  return c.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: copyBytes(salt),
      info: utf8(recoveryInfo(userId, keyVersion)),
    },
    material,
    { name: AES_KW_ALG, length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  );
}

export async function generateVaultDataKey(
  explicitCrypto?: Crypto,
  extractable = true,
): Promise<CryptoKey> {
  const c = cryptoApi(explicitCrypto);
  return c.subtle.generateKey({ name: AES_GCM_ALG, length: 256 }, extractable, ['encrypt', 'decrypt']);
}

export async function importVaultDataKey(
  raw: Uint8Array,
  explicitCrypto?: Crypto,
  extractable = true,
): Promise<CryptoKey> {
  if (raw.byteLength !== 32) throw new Error('vault_invalid_vdk_length');
  const c = cryptoApi(explicitCrypto);
  return c.subtle.importKey('raw', copyBytes(raw), { name: AES_GCM_ALG, length: 256 }, extractable, ['encrypt', 'decrypt']);
}

export async function generateDeviceKek(explicitCrypto?: Crypto): Promise<CryptoKey> {
  const c = cryptoApi(explicitCrypto);
  return c.subtle.generateKey({ name: AES_KW_ALG, length: 256 }, false, ['wrapKey', 'unwrapKey']);
}

export async function createRecoveryEnvelope(input: {
  userId: string;
  keyVersion: number;
  recoveryRootSecret: Uint8Array;
  vdk: CryptoKey;
  salt?: Uint8Array;
  crypto?: Crypto;
}): Promise<RecoveryEnvelopeV1> {
  if (!input.vdk.extractable) throw new Error('vault_vdk_must_be_extractable_for_wrapping');
  const c = cryptoApi(input.crypto);
  const salt = input.salt ? copyBytes(input.salt) : generateRecoverySalt(c);
  const rkek = await deriveRecoveryKek(input.recoveryRootSecret, salt, input.userId, input.keyVersion, c);
  const wrapped = await c.subtle.wrapKey('raw', input.vdk, rkek, AES_KW_ALG);
  return {
    schema: 'hnk-vault-key-envelope-v1',
    userId: input.userId,
    keyVersion: input.keyVersion,
    envelopeKind: 'recovery',
    wrapAlg: 'AES-KW-256',
    kdfAlg: 'HKDF-SHA-256',
    kdfSalt: bytesToBase64(salt),
    kdfInfoVersion: 1,
    wrappedVdk: bytesToBase64(new Uint8Array(wrapped)),
  };
}

export async function unwrapRecoveryVaultDataKey(
  envelope: RecoveryEnvelopeV1,
  recoveryRootSecret: Uint8Array,
  options: { extractable?: boolean; crypto?: Crypto } = {},
): Promise<CryptoKey> {
  if (envelope.schema !== 'hnk-vault-key-envelope-v1' || envelope.envelopeKind !== 'recovery') {
    throw new Error('vault_recovery_envelope_invalid');
  }
  if (envelope.wrapAlg !== 'AES-KW-256' || envelope.kdfAlg !== 'HKDF-SHA-256' || envelope.kdfInfoVersion !== 1) {
    throw new Error('vault_recovery_envelope_unsupported');
  }
  const c = cryptoApi(options.crypto);
  const rkek = await deriveRecoveryKek(
    recoveryRootSecret,
    base64ToBytes(envelope.kdfSalt),
    envelope.userId,
    envelope.keyVersion,
    c,
  );
  return c.subtle.unwrapKey(
    'raw',
    base64ToBytes(envelope.wrappedVdk),
    rkek,
    AES_KW_ALG,
    { name: AES_GCM_ALG, length: 256 },
    options.extractable ?? false,
    ['encrypt', 'decrypt'],
  );
}

export async function createDeviceEnvelope(input: {
  userId: string;
  keyVersion: number;
  deviceId: string;
  vdk: CryptoKey;
  deviceKek: CryptoKey;
  crypto?: Crypto;
}): Promise<DeviceEnvelopeV1> {
  assertUserId(input.userId);
  assertKeyVersion(input.keyVersion);
  if (!input.deviceId.trim()) throw new Error('vault_device_id_required');
  if (!input.vdk.extractable) throw new Error('vault_vdk_must_be_extractable_for_wrapping');
  if (input.deviceKek.extractable) throw new Error('vault_device_kek_must_be_non_extractable');
  const c = cryptoApi(input.crypto);
  const wrapped = await c.subtle.wrapKey('raw', input.vdk, input.deviceKek, AES_KW_ALG);
  return {
    schema: 'hnk-vault-device-envelope-v1',
    userId: input.userId,
    keyVersion: input.keyVersion,
    deviceId: input.deviceId,
    wrapAlg: 'AES-KW-256',
    wrappedVdk: bytesToBase64(new Uint8Array(wrapped)),
  };
}

export async function unwrapDeviceVaultDataKey(
  envelope: DeviceEnvelopeV1,
  deviceKek: CryptoKey,
  explicitCrypto?: Crypto,
): Promise<CryptoKey> {
  if (envelope.schema !== 'hnk-vault-device-envelope-v1' || envelope.wrapAlg !== 'AES-KW-256') {
    throw new Error('vault_device_envelope_invalid');
  }
  const c = cryptoApi(explicitCrypto);
  return c.subtle.unwrapKey(
    'raw',
    base64ToBytes(envelope.wrappedVdk),
    deviceKek,
    AES_KW_ALG,
    { name: AES_GCM_ALG, length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptNativeCompatibleVaultText(
  key: CryptoKey,
  input: EncryptVaultTextInput,
  explicitCrypto?: Crypto,
): Promise<VaultCiphertextPayload> {
  assertUserId(input.userId);
  assertDay(input.day);
  if (!input.plaintext.length) throw new Error('vault_plaintext_required');
  const c = cryptoApi(explicitCrypto);
  const aad = buildNativeCompatibleAad(input);
  const nonce = input.nonce ? copyBytes(input.nonce) : c.getRandomValues(new Uint8Array(12));
  if (nonce.byteLength !== 12) throw new Error('vault_invalid_nonce_length');
  const ciphertext = await c.subtle.encrypt(
    {
      name: AES_GCM_ALG,
      iv: nonce,
      additionalData: base64ToBytes(aad),
      tagLength: GCM_TAG_BITS,
    },
    key,
    utf8(input.plaintext),
  );
  const payloadBase = {
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    nonce: bytesToBase64(nonce),
    aad,
  };
  return {
    ...payloadBase,
    cryptoAlg: VAULT_CRYPTO_ALG,
    cryptoVersion: VAULT_CRYPTO_VERSION,
    checksumSha256: await checksumVaultPayload(payloadBase, c),
  };
}

export async function decryptNativeCompatibleVaultText(
  key: CryptoKey,
  payload: VaultCiphertextPayload,
  explicitCrypto?: Crypto,
): Promise<string> {
  if (payload.cryptoAlg !== VAULT_CRYPTO_ALG || payload.cryptoVersion !== VAULT_CRYPTO_VERSION) {
    throw new Error('vault_crypto_version_unsupported');
  }
  const c = cryptoApi(explicitCrypto);
  const expected = await checksumVaultPayload(payload, c);
  if (expected !== payload.checksumSha256) throw new Error('vault_checksum_mismatch');
  const plaintext = await c.subtle.decrypt(
    {
      name: AES_GCM_ALG,
      iv: base64ToBytes(payload.nonce),
      additionalData: base64ToBytes(payload.aad),
      tagLength: GCM_TAG_BITS,
    },
    key,
    base64ToBytes(payload.ciphertext),
  );
  return new TextDecoder().decode(plaintext);
}
