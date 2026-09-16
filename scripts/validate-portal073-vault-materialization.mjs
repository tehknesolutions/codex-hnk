import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync('apps/mobile/src/features/chokmah/portal073-vault.ts', 'utf8');
const adapter = fs.readFileSync('packages/supabase-client/src/vault.ts', 'utf8');
const crypto = fs.readFileSync('apps/mobile/src/features/vault/vault-crypto.ts', 'utf8');

assert.match(bridge, /PORTAL073_VAULT_SCHEMA = 'hnk-portal073-vault-v1'/);
assert.match(bridge, /day: 73/);
assert.match(bridge, /kind: 'journal'/);
assert.match(bridge, /encryptVaultText/);
assert.match(bridge, /saveEncryptedVaultEntry/);
assert.ok(bridge.indexOf('encryptVaultText') < bridge.lastIndexOf('saveEncryptedVaultEntry'));
assert.match(bridge, /entry\.userId !== input\.userId/);
assert.match(bridge, /entry\.day !== 73/);
assert.match(bridge, /entry\.checksumSha256 !== encrypted\.checksumSha256/);

assert.match(adapter, /The persistence boundary intentionally accepts no plaintext property/);
assert.doesNotMatch(adapter, /plaintext\s*:/);
assert.match(crypto, /AES-256-GCM/);
assert.match(crypto, /SecureStore/);
assert.match(crypto, /keychainAccessible: SecureStore\.WHEN_UNLOCKED_THIS_DEVICE_ONLY/);

console.log('PORTAL073_VAULT_MATERIALIZATION_STATIC_PASS');
