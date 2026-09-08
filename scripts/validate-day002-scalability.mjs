import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const d1 = path.join(root, 'docs', 'experience', 'kether', 'day-001');
const d2 = path.join(root, 'docs', 'experience', 'kether', 'day-002');
const read = (base, name) => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'));
const fail = (message) => { console.error(`DAY002 SCALABILITY FAIL: ${message}`); process.exitCode = 1; };

const quest = read(d2, 'day-002.quest.json');
const canon = read(d2, 'day-002.canon-blocks.json');
const evidence = read(d2, 'day-002.evidence.schema.json');
const completion = read(d2, 'day-002.completion.schema.json');
const completionService = read(d2, 'day-002.completion.service.json');
const renderer = read(d2, 'day-002.renderer-profile.json');
const pack = read(d2, 'day-002.quest-pack.json');
const audioManifest = read(d2, 'day-002.audio.manifest.json');
const day1Renderer = read(d1, 'day-001.renderer-profile.json');
const matrix = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'progression', 'attribute-progression-matrix.v1.json'), 'utf8'));
const registrySource = fs.readFileSync(path.join(root, 'packages', 'quest-engine', 'src', 'registry.ts'), 'utf8');
const day2CompletionSource = fs.readFileSync(path.join(root, 'packages', 'completion-contract', 'src', 'day002.ts'), 'utf8');
const progressionMigration = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20260908173643_attribute_progression_matrix_v1_kether.sql'), 'utf8');
const activationMigration = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20260908184234_activate_day002_audio_and_completion_v1.sql'), 'utf8');

const WORD_RE = /[0-9A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-’'][0-9A-Za-zÀ-ÖØ-öø-ÿ]+)*/gu;
function officialCount(text) {
  return (text.replace(/<!--.*?-->/gs, ' ').replace(/\[(?:\d+\s*(?:,\s*\d+\s*)*)\]/g, ' ').replace(/[`*_#>]/g, ' ').match(WORD_RE) ?? []).length;
}

if (quest.id !== 'HNK-KETHER-D002-V1') fail('quest id drift');
if (quest.version !== '1.3.0') fail('quest version drift');
if (quest.canonical?.source_sha !== '71019573414493ee9e5521f4d27ed744748c0d2b') fail('source SHA drift');
if (quest.canonical?.xp !== 100) fail('canonical XP must be 100');
if (canon.source?.counter !== 'scripts/validate_pages.py') fail('official counter pointer missing');

const expected = new Map([
  ['jachin-doctrine', 137], ['jachin-kavanah', 72], ['jachin-ordalia', 26],
  ['boaz-doctrine', 137], ['boaz-kavanah', 72], ['boaz-ordalia', 26],
  ['middle-doctrine', 137], ['middle-kavanah', 72], ['middle-ordalia', 26],
]);
let total = 0;
for (const [id, target] of expected) {
  const block = canon.blocks.find((entry) => entry.id === id);
  if (!block) { fail(`missing canonical block ${id}`); continue; }
  const actual = officialCount(block.text); total += actual;
  if (block.target_words !== target || block.word_count !== target || actual !== target) fail(`${id} count drift`);
}
if (total !== 705 || canon.counted_core?.word_count !== 705) fail(`counted core must be 705, got ${total}`);

const day1Types = new Set(Object.keys(day1Renderer.phase_renderers ?? {}));
for (const type of new Set(quest.phases.map((phase) => phase.type))) if (!day1Types.has(type)) fail(`Day 002 introduces renderer type ${type}`);
if (renderer.scalability_assertion?.new_scene_classes?.length !== 0 || renderer.scalability_assertion?.new_renderer_code_required !== false) fail('renderer reuse drift');
if (quest.scalability_proof?.new_renderer_required !== false || (quest.scalability_proof?.new_phase_types ?? []).length !== 0) fail('quest scalability drift');
if (!registrySource.includes('export class QuestRegistry') || !registrySource.includes('resolveDay(day: number)')) fail('generic QuestRegistry missing');
if (/HNK-KETHER-D00[12]/.test(registrySource)) fail('QuestRegistry must not hardcode Day 001/002 ids');

const audio = quest.phases.find((phase) => phase.id === 'audio_528_binaural')?.audio;
if (!audio || audio.profile_id !== 'HNK-KETHER-D002-AUDIO-V1' || audio.production_enabled !== true) fail('Day 002 published audio binding drift');
if (audio.carrier_left_hz !== 432 || audio.carrier_right_hz !== 438 || audio.binaural_difference_hz !== 6 || audio.ritual_tone_hz !== 528) fail('Day 002 audio mapping drift');
if (audio.neurological_state_claim !== false) fail('Day 002 audio must not claim neurological state');
if (audioManifest.id !== 'HNK-KETHER-D002-AUDIO-V1' || audioManifest.status !== 'PUBLISHED') fail('audio manifest drift');

const boaz = quest.phases.find((phase) => phase.id === 'boaz_asana');
if (!boaz?.interaction?.components?.includes('RITUAL_TIMER') || !boaz?.interaction?.components?.includes('ATTENTION_RETURN')) fail('Boaz reusable components drift');
if (boaz?.interaction?.counter_semantics?.event_label !== 'IMPULSO_PERCEBIDO') fail('impulse counter alias drift');
if (boaz?.safety?.movement_allowed !== true || boaz?.safety?.pain_is_stop_signal !== true) fail('Boaz safe execution overlay missing');

const attr = quest.phases.find((phase) => phase.id === 'attribute_notice')?.attribute_effect;
if (attr?.attribute !== 'DIS' || attr?.secondary_attribute !== 'PER' || attr?.state !== 'FROZEN_SERVER_SIDE' || attr?.gain !== 1 || attr?.client_may_apply !== false) fail('Day 002 frozen DIS progression drift');
if (quest.progression?.matrix_id !== 'HNK-ATTRIBUTE-PROGRESSION-MATRIX-V1' || quest.progression?.attribute_gain !== 1 || quest.progression?.primary_attribute !== 'DIS') fail('Quest progression binding drift');
const matrixD2 = matrix.rows?.find((row) => row.day === 2);
if (matrixD2?.primary_attribute !== 'DIS' || matrixD2?.secondary_attribute !== 'PER' || matrixD2?.attribute_gain !== 1 || matrixD2?.source_basis?.type !== 'CANON_EXPLICIT') fail('Matrix Day 002 row drift');
if (evidence.properties?.attribute_progression) fail('client evidence must not contain attribute progression');
if (!progressionMigration.includes("('1.0.0',2,'Imobilidade Corporal','DIS','PER',1")) fail('server Day 002 gain rule missing');
if (!progressionMigration.includes('xp_events_apply_attribute_progression_v1')) fail('server attribute idempotency trigger missing');

const evidenceString = JSON.stringify(evidence);
for (const privateKey of ['distraction_text','journal_text','soul_mirror_text','itch_description']) if (evidenceString.includes(privateKey)) fail(`private text leaked: ${privateKey}`);
if (evidence.properties?.boaz?.properties?.impulse_count?.minimum !== 0) fail('impulse_count must allow zero');
if (evidence.properties?.audio_528_binaural?.properties?.profile_id?.const !== 'HNK-KETHER-D002-AUDIO-V1') fail('Evidence profile id drift');

const completionPhase = quest.phases.find((phase) => phase.id === 'completion');
if (completionPhase?.completion_contract_id !== 'HNK-KETHER-D002-COMP-V1' || completionPhase?.completion_contract_state !== 'DEPLOYED_ACTIVE') fail('completion binding drift');
if (completion.properties?.completion_contract_id?.const !== 'HNK-KETHER-D002-COMP-V1' || completion.properties?.quest_definition_id?.const !== quest.id) fail('completion schema drift');
if (completionService.deployment?.migration !== '20260908184234_activate_day002_audio_and_completion_v1' || completionService.deployment?.registry_status !== 'active') fail('completion deployment drift');
if (completionService.deployment?.audio_profile_id !== 'HNK-KETHER-D002-AUDIO-V1') fail('completion audio profile drift');
if (!day2CompletionSource.includes('HNK-KETHER-D002-COMP-V1')) fail('typed completion contract missing');
if (!activationMigration.includes("when 'day002_v1'")) fail('V2 dispatcher Day002 support missing');
if (!activationMigration.includes("set status = 'active'")) fail('active registry migration missing');

if ((quest.release_blockers ?? []).length !== 0) fail('Quest still has blockers');
if ((pack.blockers ?? []).length !== 0) fail('Quest Pack still has blockers');
if (pack.version !== '0.4.1') fail('Quest Pack version drift');
if (pack.release_state !== 'BACKEND_ACTIVE__AUDIO_PUBLISHED__RUNTIME_ADAPTERS_READY__DEVICE_QA_PENDING') fail('Quest Pack release state drift');
if (pack.qa?.device_runtime !== 'PENDING' || pack.qa?.ci_is_release_evidence !== false) fail('Quest Pack QA boundary drift');
if (pack.progression?.matrix_id !== 'HNK-ATTRIBUTE-PROGRESSION-MATRIX-V1' || pack.progression?.attribute_DIS?.gain !== 1 || pack.progression?.client_may_apply_attribute_gain !== false) fail('Quest Pack progression drift');
if (pack.reuse?.new_scene_classes !== 0 || pack.reuse?.new_practice_renderer_classes !== 0) fail('Quest Pack reuse proof drift');
if (pack.server_completion?.contract_state !== 'DEPLOYED_ACTIVE') fail('Quest Pack completion state drift');
if (pack.proof_result !== 'PASS_ARCHITECTURE_REUSE__PROGRESSION_FROZEN__AUDIO_PUBLISHED__COMPLETION_ACTIVE') fail('proof result drift');

if (!process.exitCode) console.log('DAY002 SCALABILITY PASS: 705-word canon; generic registry; renderer reused; +1 DIS frozen server-side; audio published; completion active; zero technical blockers; device QA pending');
