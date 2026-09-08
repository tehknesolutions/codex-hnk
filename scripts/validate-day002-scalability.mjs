import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`DAY002 SCALABILITY FAIL: ${message}`); process.exitCode = 1; };

const base = 'docs/experience/kether/day-002';
const quest = readJson(`${base}/day-002.quest.json`);
const canon = readJson(`${base}/day-002.canon-blocks.json`);
const evidence = readJson(`${base}/day-002.evidence.schema.json`);
const completion = readJson(`${base}/day-002.completion.schema.json`);
const service = readJson(`${base}/day-002.completion.service.json`);
const renderer = readJson(`${base}/day-002.renderer-profile.json`);
const audio = readJson(`${base}/day-002.audio.manifest.json`);
const pack = readJson(`${base}/day-002.quest-pack.json`);
const day1Renderer = readJson('docs/experience/kether/day-001/day-001.renderer-profile.json');
const matrix = readJson('docs/progression/attribute-progression-matrix.v1.json');
const registry = readText('packages/quest-engine/src/registry.ts');
const activationMigration = readText('supabase/migrations/20260908184234_activate_day002_audio_and_completion_v1.sql');
const progressionMigration = readText('supabase/migrations/20260908173643_attribute_progression_matrix_v1_kether.sql');

const WORD_RE = /[0-9A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-’'][0-9A-Za-zÀ-ÖØ-öø-ÿ]+)*/gu;
const count = (text) => (text.replace(/<!--.*?-->/gs, ' ').replace(/\[(?:\d+\s*(?:,\s*\d+\s*)*)\]/g, ' ').replace(/[`*_#>]/g, ' ').match(WORD_RE) ?? []).length;

if (quest.id !== 'HNK-KETHER-D002-V1' || quest.version !== '1.3.0') fail('Quest identity/version drift');
if (quest.canonical?.source_sha !== '71019573414493ee9e5521f4d27ed744748c0d2b' || quest.canonical?.xp !== 100) fail('Canon binding drift');

const targets = new Map([
  ['jachin-doctrine',137],['jachin-kavanah',72],['jachin-ordalia',26],
  ['boaz-doctrine',137],['boaz-kavanah',72],['boaz-ordalia',26],
  ['middle-doctrine',137],['middle-kavanah',72],['middle-ordalia',26],
]);
let total = 0;
for (const [id, target] of targets) {
  const block = canon.blocks.find((entry) => entry.id === id);
  if (!block || block.target_words !== target || block.word_count !== target || count(block.text) !== target) fail(`${id} count drift`);
  else total += target;
}
if (total !== 705 || canon.counted_core?.word_count !== 705) fail('705-word counted core drift');

const day1Types = new Set(Object.keys(day1Renderer.phase_renderers ?? {}));
for (const type of new Set(quest.phases.map((phase) => phase.type))) if (!day1Types.has(type)) fail(`new renderer type introduced: ${type}`);
if (quest.scalability_proof?.new_renderer_required !== false || quest.scalability_proof?.new_practice_renderer_required !== false) fail('renderer reuse assertion drift');
if (!registry.includes('resolveDay(day: number)') || /HNK-KETHER-D00[12]/.test(registry)) fail('generic QuestRegistry drift');

const audioPhase = quest.phases.find((phase) => phase.id === 'audio_528_binaural')?.audio;
if (audioPhase?.profile_id !== 'HNK-KETHER-D002-AUDIO-V1' || audioPhase?.production_enabled !== true) fail('published audio binding drift');
if (audioPhase?.carrier_left_hz !== 432 || audioPhase?.carrier_right_hz !== 438 || audioPhase?.binaural_difference_hz !== 6 || audioPhase?.ritual_tone_hz !== 528) fail('audio frequency mapping drift');
if (audio.id !== 'HNK-KETHER-D002-AUDIO-V1' || audio.status !== 'PUBLISHED') fail('audio manifest drift');
if (audioPhase?.neurological_state_claim !== false) fail('neurological-state claim must remain false');

const row = matrix.rows?.find((entry) => entry.day === 2);
if (row?.primary_attribute !== 'DIS' || row?.secondary_attribute !== 'PER' || row?.attribute_gain !== 1 || row?.source_basis?.type !== 'CANON_EXPLICIT') fail('Day 002 progression row drift');
if (evidence.properties?.attribute_progression) fail('client Evidence must not self-apply attributes');
if (!progressionMigration.includes("('1.0.0',2,'Imobilidade Corporal','DIS','PER',1") || !progressionMigration.includes('xp_events_apply_attribute_progression_v1')) fail('server progression rule drift');

if (evidence.properties?.audio_528_binaural?.properties?.profile_id?.const !== 'HNK-KETHER-D002-AUDIO-V1') fail('Evidence audio profile drift');
if (evidence.properties?.boaz?.properties?.impulse_count?.minimum !== 0) fail('impulse_count must allow zero');
const evidenceText = JSON.stringify(evidence);
for (const key of ['journal_text','soul_mirror_text','private_note','itch_description']) if (evidenceText.includes(key)) fail(`private text leaked: ${key}`);

const completionPhase = quest.phases.find((phase) => phase.type === 'COMPLETION');
if (completionPhase?.completion_contract_id !== 'HNK-KETHER-D002-COMP-V1' || completionPhase?.completion_contract_state !== 'DEPLOYED_ACTIVE') fail('completion phase drift');
if (completion.properties?.completion_contract_id?.const !== 'HNK-KETHER-D002-COMP-V1') fail('completion schema drift');
if (service.deployment?.registry_status !== 'active' || service.deployment?.migration !== '20260908184234_activate_day002_audio_and_completion_v1') fail('completion service deployment drift');
if (!activationMigration.includes("when 'day002_v1'") || !activationMigration.includes("set status = 'active'")) fail('backend activation migration drift');

if ((quest.release_blockers ?? []).length !== 0 || (pack.blockers ?? []).length !== 0) fail('technical blocker reappeared');
if (pack.version !== '0.5.1') fail('Quest Pack version drift');
if (pack.release_state !== 'WEB_EXPO_RUNTIME_INTEGRATED__DEVICE_AND_AUTHENTICATED_QA_PENDING') fail('Quest Pack release state drift');
if (pack.runtime_integration?.catalog_api !== 'QuestCatalog.requireDay(2)' || pack.runtime_integration?.audio_port !== 'AudioRuntimePort') fail('runtime integration ledger drift');
if (pack.qa?.browser_runtime !== 'PENDING' || pack.qa?.expo_device_runtime !== 'PENDING' || pack.qa?.ci_is_release_evidence !== false) fail('QA boundary drift');
if (renderer.scalability_assertion?.new_scene_classes?.length !== 0) fail('renderer-profile scene class drift');

if (!process.exitCode) console.log('DAY002 SCALABILITY PASS: 705 Canon; renderer reuse; profile-driven audio; server +1 DIS; Completion V2 active; Web/Expo integrated; runtime QA pending');
