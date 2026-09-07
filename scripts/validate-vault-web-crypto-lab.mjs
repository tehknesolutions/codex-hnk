import { existsSync, readFileSync } from 'node:fs';

const required = [
  'packages/vault-interop-vectors/src/index.ts',
  'packages/vault-web-crypto-lab/package.json',
  'packages/vault-web-crypto-lab/src/index.ts',
  'packages/vault-web-crypto-lab/src/indexeddb.ts',
  'packages/vault-web-crypto-lab/src/vectors.ts',
  'packages/vault-web-crypto-lab/test/crypto.test.ts',
  'apps/web/app/labs/vault-crypto/page.tsx',
  'apps/web/app/labs/vault-crypto/VaultCryptoLab.tsx',
  'scripts/verify-vault-web-crypto-lab.mjs',
  'docs/security/HNK_WEB_E2EE_KEY_RECOVERY_V1_PROPOSAL.md',
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing Web Vault Crypto Lab files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const core = readFileSync('packages/vault-web-crypto-lab/src/index.ts', 'utf8');
const idb = readFileSync('packages/vault-web-crypto-lab/src/indexeddb.ts', 'utf8');
const vectors = readFileSync('packages/vault-web-crypto-lab/src/vectors.ts', 'utf8');
const sharedVector = readFileSync('packages/vault-interop-vectors/src/index.ts', 'utf8');
const browserLab = readFileSync('apps/web/app/labs/vault-crypto/VaultCryptoLab.tsx', 'utf8');
const labPage = readFileSync('apps/web/app/labs/vault-crypto/page.tsx', 'utf8');
const day001 = readFileSync('apps/web/app/day-001/Day001WebExperience.tsx', 'utf8');
const webPackage = readFileSync('apps/web/package.json', 'utf8');
const labPackage = readFileSync('packages/vault-web-crypto-lab/package.json', 'utf8');
const proposal = readFileSync('docs/security/HNK_WEB_E2EE_KEY_RECOVERY_V1_PROPOSAL.md', 'utf8');
const packageSource = `${core}\n${idb}`;

const invariants = [
  ['Lab package is wired to Web', webPackage.includes('"@hnk/vault-web-crypto-lab": "workspace:*"')],
  ['Lab consumes neutral interop vector package', labPackage.includes('"@hnk/vault-interop-vectors": "workspace:*"') && vectors.includes("from '@hnk/vault-interop-vectors'")],
  ['Recovery uses HKDF-SHA-256', core.includes("name: 'HKDF'") && core.includes("hash: 'SHA-256'")],
  ['Wrapping uses AES-KW', core.includes("const AES_KW_ALG = 'AES-KW'") && core.includes("wrapKey('raw'")],
  ['Vault payload uses AES-GCM 256-bit', core.includes("const AES_GCM_ALG = 'AES-GCM'") && core.includes("length: 256")],
  ['Web AAD decodes frozen base64 before AES-GCM', core.includes('additionalData: base64ToBytes(aad)') && core.includes('additionalData: base64ToBytes(payload.aad)')],
  ['DKEK is generated non-extractable', core.includes("generateKey({ name: AES_KW_ALG, length: 256 }, false")],
  ['IndexedDB stores CryptoKey objects', idb.includes('deviceKek: CryptoKey') && idb.includes('indexedDB')],
  ['Lab package never uses localStorage/sessionStorage', !packageSource.includes('localStorage') && !packageSource.includes('sessionStorage')],
  ['Lab package has no Supabase/network persistence', !packageSource.includes('@hnk/supabase-client') && !packageSource.includes('fetch(')],
  ['Deterministic Native-compatible vector frozen in neutral source', sharedVector.includes('HNK Native ↔ Web vector 001') && sharedVector.includes('157c92b5e1b1da403003fe1fd244bb7d46f3a3f085bc407373388491055a4020')],
  ['Browser lab explicitly says no Vault writes', browserLab.includes('EXPERIMENTAL · NO VAULT WRITES')],
  ['Browser lab tests IndexedDB round-trip', browserLab.includes('indexeddb-cryptokey-roundtrip')],
  ['Browser lab tests multi-device recovery', browserLab.includes('multi-device-recovery')],
  ['Lab route is noindex', labPage.includes('index: false') && labPage.includes('follow: false')],
  ['Day 001 remains disconnected from experimental crypto lab', !day001.includes('@hnk/vault-web-crypto-lab') && !day001.includes('@hnk/vault-interop-vectors')],
  ['Day 001 still blocks authenticated Web mirror completion', day001.includes('mirrorSecurityBlocked')],
  ['Proposal remains explicitly not enabled', proposal.includes('NOT ENABLED') && proposal.includes('does **not** authorize enabling Web Vault writes')],
];

const failed = invariants.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('HNK Web Vault Crypto Lab validation failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log(`HNK Web Vault Crypto Lab: valid (${invariants.length} invariants)`);
