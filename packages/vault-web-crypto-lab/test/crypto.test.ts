import assert from 'node:assert/strict';
import test from 'node:test';
import { webcrypto } from 'node:crypto';
import {
  base64ToBytes,
  buildNativeCompatibleAad,
  checksumVaultPayload,
  createDeviceEnvelope,
  createRecoveryEnvelope,
  decryptNativeCompatibleVaultText,
  encryptNativeCompatibleVaultText,
  generateDeviceKek,
  hexToBytes,
  importVaultDataKey,
  recoveryInfo,
  unwrapDeviceVaultDataKey,
  unwrapRecoveryVaultDataKey,
} from '../src/index.ts';
import { WEB_VAULT_VECTOR_V1 } from '../src/vectors.ts';

const cryptoApi = webcrypto as unknown as Crypto;
const vector = WEB_VAULT_VECTOR_V1;

async function fixedVdk(extractable = true): Promise<CryptoKey> {
  return importVaultDataKey(hexToBytes(vector.vdkHex), cryptoApi, extractable);
}

test('freezes HKDF + AES-KW recovery vector', async () => {
  assert.equal(recoveryInfo(vector.userId, vector.keyVersion), vector.recoveryInfo);
  const envelope = await createRecoveryEnvelope({
    userId: vector.userId,
    keyVersion: vector.keyVersion,
    recoveryRootSecret: base64ToBytes(vector.recoveryRootSecretBase64),
    salt: base64ToBytes(vector.recoverySaltBase64),
    vdk: await fixedVdk(true),
    crypto: cryptoApi,
  });
  assert.equal(envelope.kdfSalt, vector.recoverySaltBase64);
  assert.equal(envelope.wrappedVdk, vector.wrappedVdkBase64);

  const recovered = await unwrapRecoveryVaultDataKey(
    envelope,
    base64ToBytes(vector.recoveryRootSecretBase64),
    { crypto: cryptoApi },
  );
  assert.equal(recovered.extractable, false);
  await assert.rejects(() => cryptoApi.subtle.exportKey('raw', recovered));
});

test('freezes Native-compatible AES-256-GCM payload format', async () => {
  assert.equal(
    buildNativeCompatibleAad({ userId: vector.userId, day: vector.day, kind: vector.kind }),
    vector.aadBase64,
  );
  const payload = await encryptNativeCompatibleVaultText(
    await fixedVdk(false),
    {
      userId: vector.userId,
      day: vector.day,
      kind: vector.kind,
      plaintext: vector.plaintext,
      nonce: base64ToBytes(vector.nonceBase64),
    },
    cryptoApi,
  );
  assert.equal(payload.nonce, vector.nonceBase64);
  assert.equal(payload.aad, vector.aadBase64);
  assert.equal(payload.ciphertext, vector.ciphertextBase64);
  assert.equal(payload.checksumSha256, vector.checksumSha256);
  assert.equal(await decryptNativeCompatibleVaultText(await fixedVdk(false), payload, cryptoApi), vector.plaintext);
});

test('rejects wrong recovery secret and wrong user context', async () => {
  const envelope = await createRecoveryEnvelope({
    userId: vector.userId,
    keyVersion: vector.keyVersion,
    recoveryRootSecret: base64ToBytes(vector.recoveryRootSecretBase64),
    salt: base64ToBytes(vector.recoverySaltBase64),
    vdk: await fixedVdk(true),
    crypto: cryptoApi,
  });
  const wrongSecret = base64ToBytes(vector.recoveryRootSecretBase64);
  wrongSecret[0] ^= 0xff;
  await assert.rejects(() => unwrapRecoveryVaultDataKey(envelope, wrongSecret, { crypto: cryptoApi }));
  await assert.rejects(() =>
    unwrapRecoveryVaultDataKey({ ...envelope, userId: '00000000-0000-4000-8000-000000000099' }, base64ToBytes(vector.recoveryRootSecretBase64), { crypto: cryptoApi }),
  );
});

test('binds AAD cryptographically and rejects ciphertext tampering', async () => {
  const key = await fixedVdk(false);
  const payload = await encryptNativeCompatibleVaultText(
    key,
    {
      userId: vector.userId,
      day: vector.day,
      kind: vector.kind,
      plaintext: vector.plaintext,
      nonce: base64ToBytes(vector.nonceBase64),
    },
    cryptoApi,
  );

  const tamperedCiphertext = `${payload.ciphertext.slice(0, -2)}AA`;
  const cipherPayload = {
    ...payload,
    ciphertext: tamperedCiphertext,
    checksumSha256: await checksumVaultPayload({ ...payload, ciphertext: tamperedCiphertext }, cryptoApi),
  };
  await assert.rejects(() => decryptNativeCompatibleVaultText(key, cipherPayload, cryptoApi));

  const wrongAad = buildNativeCompatibleAad({ userId: vector.userId, day: 2, kind: vector.kind });
  const aadPayload = {
    ...payload,
    aad: wrongAad,
    checksumSha256: await checksumVaultPayload({ ...payload, aad: wrongAad }, cryptoApi),
  };
  await assert.rejects(() => decryptNativeCompatibleVaultText(key, aadPayload, cryptoApi));
});

test('device envelope returns a non-extractable working VDK', async () => {
  const deviceKek = await generateDeviceKek(cryptoApi);
  assert.equal(deviceKek.extractable, false);
  await assert.rejects(() => cryptoApi.subtle.exportKey('raw', deviceKek));

  const envelope = await createDeviceEnvelope({
    userId: vector.userId,
    keyVersion: vector.keyVersion,
    deviceId: 'node-lab-device-a',
    vdk: await fixedVdk(true),
    deviceKek,
    crypto: cryptoApi,
  });
  const working = await unwrapDeviceVaultDataKey(envelope, deviceKek, cryptoApi);
  assert.equal(working.extractable, false);
  await assert.rejects(() => cryptoApi.subtle.exportKey('raw', working));
});

test('database-compromise fixture is insufficient without RRS or device key', async () => {
  const rrs = base64ToBytes(vector.recoveryRootSecretBase64);
  const recoveryEnvelope = await createRecoveryEnvelope({
    userId: vector.userId,
    keyVersion: vector.keyVersion,
    recoveryRootSecret: rrs,
    salt: base64ToBytes(vector.recoverySaltBase64),
    vdk: await fixedVdk(true),
    crypto: cryptoApi,
  });
  const journalDump = await encryptNativeCompatibleVaultText(
    await fixedVdk(false),
    {
      userId: vector.userId,
      day: vector.day,
      kind: vector.kind,
      plaintext: vector.plaintext,
      nonce: base64ToBytes(vector.nonceBase64),
    },
    cryptoApi,
  );

  const attackerSecret = new Uint8Array(32);
  await assert.rejects(() => unwrapRecoveryVaultDataKey(recoveryEnvelope, attackerSecret, { crypto: cryptoApi }));
  assert.equal(JSON.stringify({ recoveryEnvelope, journalDump }).includes(vector.plaintext), false);
});
