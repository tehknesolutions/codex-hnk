import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { console.error(`DAY001 RUNTIME FAIL: ${message}`); process.exit(1); };
const requireText = (source, needle, label) => { if (!source.includes(needle)) fail(`${label}: missing ${needle}`); };
const forbidText = (source, needle, label) => { if (source.includes(needle)) fail(`${label}: forbidden ${needle}`); };

const files = [
  'apps/web/app/day-001/page.tsx',
  'apps/web/app/day-001/Day001GoldenV2Web.tsx',
  'apps/web/app/day-001/day001-golden-v2.module.css',
  'apps/mobile/src/features/kether/Day001GoldenV2Mobile.tsx',
  'apps/mobile/src/features/kether/Day001LiveVerticalSlice.tsx',
  'packages/supabase-client/src/day001-v2.ts',
  'packages/practice-contract/src/day001.ts',
  'packages/completion-contract/src/day001.ts',
  'packages/ritual-tone/src/index.ts',
  'docs/experience/kether/day-001/day-001.quest.json',
  'docs/experience/kether/day-001/day-001.audio.manifest.json',
];
for (const file of files) if (!exists(file)) fail(`missing file ${file}`);

const page = read(files[0]);
const web = read(files[1]);
const mobile = read(files[3]);
const mobileEntry = read(files[4]);
const adapter = read(files[5]);
const practice = read(files[6]);
const completion = read(files[7]);
const tone = read(files[8]);
const quest = JSON.parse(read(files[9]));
const audio = JSON.parse(read(files[10]));
const mobilePackage = JSON.parse(read('apps/mobile/package.json'));
const supabaseIndex = read('packages/supabase-client/src/index.ts');

requireText(page, 'Day001GoldenV2Web', 'web entrypoint');
forbidText(page, 'Day001ImmersiveExperience', 'web entrypoint');
requireText(mobileEntry, 'Day001GoldenV2Mobile', 'mobile entrypoint');
forbidText(mobileEntry, 'Day001ImmersiveMobileVerticalSlice', 'mobile entrypoint');

for (const source of [web, mobile]) {
  requireText(source, 'sealDay001V2', 'active runtime');
  requireText(source, 'startDay001PracticeSessionV2', 'active runtime');
  requireText(source, 'toneStarted', '528 evidence gate');
  requireText(source, 'ReturnGate', 'return gate');
  requireText(source, 'safetyStop', 'safety stop');
  requireText(source, 'voiceRecorded: false', 'voice privacy default');
  forbidText(source, 'completeCodexDay(', 'legacy completion path');
  forbidText(source, 'savePracticeRecord(', 'legacy practice evidence path');
}

requireText(web, 'source_sha,status', 'web canon verification');
requireText(web, 'data.source_sha !== DAY001_CANON_SOURCE_SHA', 'web canon verification');
requireText(web, 'new AudioContext()', 'web 528 synthesis');
requireText(web, 'source.frequency.value = 528', 'web 528 synthesis');
requireText(web, 'environmentDistractionsCount: distractionCount', 'web privacy boundary');
forbidText(web, 'distractions:', 'web evidence privacy');
forbidText(web, 'mirror:', 'web evidence privacy');

requireText(mobile, 'createDay001RitualTone528WavBase64', 'mobile 528 synthesis');
requireText(mobile, 'saveEncryptedVaultEntry', 'mobile vault boundary');
requireText(mobile, 'encryptVaultText', 'mobile vault boundary');
requireText(mobile, 'vaultEntryRef: vaultEntry.id', 'mobile opaque vault evidence');

requireText(adapter, "mode: 'first_completion'", 'practice session v2');
requireText(adapter, "client.rpc('complete_codex_day_v2'", 'completion rpc v2');
requireText(adapter, 'buildDay001EvidenceV2', 'evidence v2 adapter');
requireText(adapter, 'buildDay001CompletionRequest', 'completion contract adapter');
requireText(adapter, 'createDay001ClientCompletionId', 'completion idempotency');
requireText(supabaseIndex, "export * from './day001-v2';", 'supabase client exports');

requireText(practice, 'ritual_tone_528', 'practice contract');
requireText(practice, 'voluntary_completion_confirmed: true', 'practice contract');
requireText(completion, 'HNK-KETHER-D001-COMP-V2', 'completion contract');
requireText(tone, '528', 'ritual tone package');

if (mobilePackage.dependencies?.['@hnk/ritual-tone'] !== 'workspace:*') fail('mobile missing @hnk/ritual-tone workspace dependency');
if (!mobilePackage.dependencies?.['expo-audio']) fail('mobile missing expo-audio dependency');

if (quest.id !== 'HNK-KETHER-D001-V2') fail('quest id drift');
if (quest.canonical?.source_sha !== 'a01d13b43cbddb92236fc1e3b6c2a7e140d87d29') fail('quest canonical SHA drift');
const requiredPhases = ['jachin_practice','ritual_tone_528','jachin_return','boaz_practice','boaz_return','middle_voice_practice','middle_return','soul_mirror','completion'];
const phaseIds = new Set(quest.phases?.map((phase) => phase.id));
for (const id of requiredPhases) if (!phaseIds.has(id)) fail(`quest missing required phase ${id}`);

const ritual528 = audio.profiles?.ritual_528;
if (ritual528?.frequency_hz !== 528 || ritual528?.required_for_completion !== true || ritual528?.autoplay !== false || ritual528?.delivery !== 'RUNTIME_SYNTHESIS') {
  fail('528 audio manifest drift');
}
const theta432 = audio.profiles?.theta_432;
if (theta432?.required_for_completion !== false || theta432?.status !== 'CANONICAL_MAPPING_PENDING' || theta432?.included_in_release_payload !== false) {
  fail('Theta/432 pending contract drift');
}

console.log('DAY001 RUNTIME PASS: Web/Mobile active on V2 completion + evidence + 528 + privacy/safety gates');
