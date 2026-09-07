import { existsSync, readFileSync } from 'node:fs';

const recoveryMigrationPath = 'supabase/migrations/20260905011011_add_vault_key_envelopes.sql';

const required = [
  'packages/database/src/database.vault-key-envelopes.generated.ts',
  'packages/supabase-client/src/vault-key-envelopes.ts',
  'packages/supabase-client/src/vault-key-envelopes.test.ts',
  'packages/supabase-client/src/index.ts',
  recoveryMigrationPath,
  'supabase/tests/vault_key_envelopes.sql',
  'apps/web/app/day-001/Day001WebExperience.tsx',
  'apps/mobile/src/features/kether/Day001MasterVerticalSlice.tsx',
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing Vault recovery-envelope adapter files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const generated = readFileSync('packages/database/src/database.vault-key-envelopes.generated.ts', 'utf8');
const adapter = readFileSync('packages/supabase-client/src/vault-key-envelopes.ts', 'utf8');
const adapterTest = readFileSync('packages/supabase-client/src/vault-key-envelopes.test.ts', 'utf8');
const clientIndex = readFileSync('packages/supabase-client/src/index.ts', 'utf8');
const migration = readFileSync(recoveryMigrationPath, 'utf8');
const pgTap = readFileSync('supabase/tests/vault_key_envelopes.sql', 'utf8');
const webDay001 = readFileSync('apps/web/app/day-001/Day001WebExperience.tsx', 'utf8');
const mobileDay001 = readFileSync('apps/mobile/src/features/kether/Day001MasterVerticalSlice.tsx', 'utf8');

const inputMatch = adapter.match(/export interface SaveRecoveryEnvelopeInput\s*\{([\s\S]*?)\n\}/);
const publicInput = inputMatch?.[1] ?? '';
const forbiddenInputNames = [
  'userId',
  'plaintext',
  'recoveryRootSecret',
  'recoverySecret',
  'rrs',
  'rawKey',
  'rawVdk',
  'vdk',
];

const invariants = [
  ['Database augmentation cites generated type proof', generated.includes('33772590525') && generated.includes('9900307150') && generated.includes('5bcb7aee221ae75ba4d20050ce781681d42ba19997bae558568dca837e83fc7d')],
  ['Database augmentation exposes vault_key_envelopes', generated.includes('vault_key_envelopes: VaultKeyEnvelopesTable')],
  ['Adapter is exported through supabase-client', clientIndex.includes("export * from './vault-key-envelopes'")],
  ['Public input contains no ownership or secret/plaintext field', inputMatch !== null && forbiddenInputNames.every((name) => !publicInput.toLowerCase().includes(name.toLowerCase()))],
  ['Adapter derives ownership from authenticated session', adapter.includes('client.auth.getUser()') && adapter.includes('user_id: userId')],
  ['Adapter only targets recovery-envelope table', adapter.includes(".from('vault_key_envelopes')") && !adapter.includes(".from('journal_vault')")],
  ['Adapter freezes AES-KW-256', adapter.includes("wrapAlg: 'AES-KW-256'") && adapter.includes("input.wrapAlg !== 'AES-KW-256'")],
  ['Adapter freezes HKDF-SHA-256', adapter.includes("kdfAlg: 'HKDF-SHA-256'") && adapter.includes("input.kdfAlg !== 'HKDF-SHA-256'")],
  ['Adapter freezes KDF info version 1', adapter.includes('kdfInfoVersion: 1') && adapter.includes('input.kdfInfoVersion !== 1')],
  ['Adapter exposes save/list/getActive/revoke only', ['saveRecoveryEnvelope', 'listRecoveryEnvelopes', 'getActiveRecoveryEnvelope', 'revokeRecoveryEnvelope'].every((name) => adapter.includes(`function ${name}`)) && !adapter.includes('rotateRecoveryEnvelope')],
  ['Adapter contract tests cover save/list/getActive/revoke', ['saveRecoveryEnvelope', 'listRecoveryEnvelopes', 'getActiveRecoveryEnvelope', 'revokeRecoveryEnvelope'].every((name) => adapterTest.includes(name))],
  ['Adapter contract tests prove auth-owned insert and no raw secret fields', adapterTest.includes('derives ownership from authenticated session') && adapterTest.includes("'plaintext' in insertCall[1]") && adapterTest.includes("'rrs' in insertCall[1]") && adapterTest.includes("'vdk' in insertCall[1]")],
  ['Adapter contract tests prove active/revoked semantics', adapterTest.includes("call[1] === 'revoked_at'") && adapterTest.includes('returns null when no active envelope exists')],
  ['Adapter contract tests reject frozen-contract mismatch', adapterTest.includes('vault_recovery_envelope_contract_mismatch')],
  ['Migration remains owner-only RLS', migration.includes('vault_key_envelopes_select_own') && migration.includes('vault_key_envelopes_insert_own') && migration.includes('vault_key_envelopes_update_own') && migration.includes('vault_key_envelopes_delete_own')],
  ['pgTAP still carries 20 envelope assertions', pgTap.includes('select plan(20)') && pgTap.includes('VKE-020')],
  ['Web Day 001 remains disconnected from adapter', !webDay001.includes('saveRecoveryEnvelope') && !webDay001.includes('vault-key-envelopes')],
  ['Mobile Day 001 remains disconnected from adapter', !mobileDay001.includes('saveRecoveryEnvelope') && !mobileDay001.includes('vault-key-envelopes')],
];

const failed = invariants.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('HNK Vault recovery-envelope adapter validation failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log(`HNK Vault recovery-envelope adapter: valid (${invariants.length} invariants)`);
