import { existsSync, readFileSync } from 'node:fs';

const required = [
  'README.md',
  'package.json',
  'pnpm-workspace.yaml',
  'turbo.json',
  'docs/HNK_PLATFORM_MASTER_SPEC.md',
  'docs/HNK_ARCHITECTURE.md',
  'docs/HNK_ASSET_MANIFEST.md',
  'docs/HNK_VISUAL_BIBLE.md',
];

const missing = required.filter((path) => !existsSync(path));

if (missing.length) {
  console.error('Missing required architecture files:');
  for (const path of missing) console.error(`- ${path}`);
  process.exit(1);
}

const master = readFileSync('docs/HNK_PLATFORM_MASTER_SPEC.md', 'utf8');
const architecture = readFileSync('docs/HNK_ARCHITECTURE.md', 'utf8');

const invariants = [
  ['master source-of-truth repo', master.includes('hnk-codex-365')],
  ['platform repo identity', master.includes('codex-hnk-app')],
  ['Kether vertical slice', master.includes('Kether completo — Dias 1 a 36')],
  ['zero-knowledge journal', master.includes('Diário Zero-Knowledge')],
  ['Supabase RLS', master.includes('RLS')],
  ['architecture asset boundary', architecture.includes('AssetRegistryEntry')],
];

const failed = invariants.filter(([, ok]) => !ok);

if (failed.length) {
  console.error('Architecture invariant validation failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log('HNK platform architecture baseline: valid');
