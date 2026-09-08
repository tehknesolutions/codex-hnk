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
const day1Renderer = read(d1, 'day-001.renderer-profile.json');
const registrySource = fs.readFileSync(path.join(root, 'packages', 'quest-engine', 'src', 'registry.ts'), 'utf8');
const day2CompletionSource = fs.readFileSync(path.join(root, 'packages', 'completion-contract', 'src', 'day002.ts'), 'utf8');
const migrationSource = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20260908164103_day002_completion_contract_v1_reviewed.sql'), 'utf8');

const WORD_RE = /[0-9A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-’'][0-9A-Za-zÀ-ÖØ-öø-ÿ]+)*/gu;
function officialCount(text) {
  return (text
    .replace(/<!--.*?-->/gs, ' ')
    .replace(/\[(?:\d+\s*(?:,\s*\d+\s*)*)\]/g, ' ')
    .replace(/[`*_#>]/g, ' ')
    .match(WORD_RE) ?? []).length;
}

if (quest.id !== 'HNK-KETHER-D002-V1') fail('quest id drift');
if (quest.version !== '1.1.0') fail('quest version drift');
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
  const actual = officialCount(block.text);
  total += actual;
  if (block.target_words !== target || block.word_count !== target || actual !== target) {
    fail(`${id} count drift: target=${target} manifest=${block.word_count} actual=${actual}`);
  }
}
if (total !== 705 || canon.counted_core?.word_count !== 705) fail(`counted core must be 705, got ${total}`);

const day1Types = new Set(Object.keys(day1Renderer.phase_renderers ?? {}));
const day2Types = new Set(quest.phases.map((phase) => phase.type));
for (const type of day2Types) if (!day1Types.has(type)) fail(`Day 002 introduces renderer type ${type}`);
if (renderer.scalability_assertion?.new_scene_classes?.length !== 0) fail('new scene class declared');
if (renderer.scalability_assertion?.new_renderer_code_required !== false) fail('renderer code must not be required');
if (renderer.scalability_assertion?.reuses_day001_renderer_contract !== true) fail('Day 001 renderer contract reuse not asserted');
if (quest.scalability_proof?.new_renderer_required !== false) fail('quest says new renderer required');
if ((quest.scalability_proof?.new_phase_types ?? []).length !== 0) fail('quest declares new phase type');

if (!registrySource.includes('export class QuestRegistry')) fail('generic QuestRegistry missing');
if (!registrySource.includes('resolveDay(day: number)')) fail('QuestRegistry day resolver missing');
if (!registrySource.includes('requireDay(day: number)')) fail('QuestRegistry required day resolver missing');
if (/HNK-KETHER-D00[12]/.test(registrySource)) fail('QuestRegistry must not hardcode Day 001/002 ids');

const audio = quest.phases.find((phase) => phase.id === 'audio_528_binaural');
if (!audio) fail('Day 002 canonical audio phase missing');
else {
  if (audio.audio?.frequency_hz !== 528) fail('canonical 528 reference drift');
  if (audio.audio?.binaural_difference_hz !== null) fail('binaural difference must remain unresolved');
  if (audio.audio?.production_enabled !== false) fail('unresolved binaural profile must remain disabled');
  if (audio.audio?.operator !== 'PENDING_CANONICAL_TECHNICAL_MAPPING') fail('audio operator was invented');
}

const boaz = quest.phases.find((phase) => phase.id === 'boaz_asana');
if (!boaz?.interaction?.components?.includes('RITUAL_TIMER')) fail('Boaz must reuse timer');
if (!boaz?.interaction?.components?.includes('ATTENTION_RETURN')) fail('Boaz impulse count must reuse generic counter-capable control');
if (boaz?.interaction?.counter_semantics?.event_label !== 'IMPULSO_PERCEBIDO') fail('impulse counter alias drift');
if (boaz?.safety?.movement_allowed !== true || boaz?.safety?.pain_is_stop_signal !== true) fail('Boaz safe execution overlay missing');

const safetyOverlay = quest.phases.find((phase) => phase.id === 'boaz_safety_overlay');
const safetyText = (safetyOverlay?.content_intent ?? []).join(' ');
for (const phrase of ['Do not force absolute immobility.', 'Natural breathing is required', 'may move, pause or stop']) {
  if (!safetyText.includes(phrase)) fail(`safety overlay missing: ${phrase}`);
}

const attr = quest.phases.find((phase) => phase.id === 'attribute_notice')?.attribute_effect;
if (attr?.attribute !== 'DIS' || attr?.state !== 'PENDING_MATRIX' || attr?.gain !== null) fail('DIS progression must remain pending/null');
const evidenceAttr = evidence.properties?.attribute_progression?.properties;
if (evidenceAttr?.dis_gain_applied?.const !== false) fail('evidence must forbid invented DIS gain');

const evidenceString = JSON.stringify(evidence);
for (const privateKey of ['distraction_text', 'journal_text', 'soul_mirror_text', 'itch_description']) {
  if (evidenceString.includes(privateKey)) fail(`private text leaked into evidence schema: ${privateKey}`);
}
if (evidence.properties?.boaz?.properties?.impulse_count?.minimum !== 0) fail('impulse_count must be non-punitive and allow zero');

const completionPhase = quest.phases.find((phase) => phase.id === 'completion');
if (completionPhase?.completion_contract_id !== 'HNK-KETHER-D002-COMP-V1') fail('quest completion contract binding drift');
if (completionPhase?.completion_contract_state !== 'DEPLOYED_REVIEWED_INACTIVE_PENDING_AUDIO') fail('quest completion deployment state drift');
if (completion.properties?.completion_contract_id?.const !== 'HNK-KETHER-D002-COMP-V1') fail('completion schema id drift');
if (completion.properties?.quest_definition_id?.const !== quest.id) fail('completion schema quest id drift');
if (completionService.deployment?.migration !== '20260908164103_day002_completion_contract_v1_reviewed') fail('completion migration id drift');
if (completionService.deployment?.registry_status !== 'reviewed') fail('Day 002 contract must remain reviewed until audio approval');
if (completionService.deployment?.activation_gate !== 'AUDIO-002-BINAURAL-528') fail('audio activation gate drift');
if (!day2CompletionSource.includes('HNK-KETHER-D002-COMP-V1')) fail('typed Day 002 completion contract missing');
if (!migrationSource.includes("'day002_v1', 'reviewed'")) fail('reviewed registry binding missing from migration');
if (!migrationSource.includes('validate_day002_completion_v1')) fail('Day 002 database validator missing');

const blockerIds = new Set(pack.blockers.map((entry) => entry.id));
for (const id of ['AUDIO-002-BINAURAL-528', 'PROGRESSION-002-DIS-MATRIX']) {
  if (!blockerIds.has(id)) fail(`missing explicit Day 002 blocker ${id}`);
}
if (blockerIds.has('COMPLETION-002-CONTRACT')) fail('resolved completion contract blocker still present');
if (blockerIds.size !== 2) fail(`expected exactly 2 Day 002 blockers, got ${blockerIds.size}`);
if (pack.server_completion?.contract_state !== 'DEPLOYED_REVIEWED_INACTIVE') fail('Quest Pack completion state drift');
if (pack.reuse?.new_scene_classes !== 0 || pack.reuse?.new_practice_renderer_classes !== 0) fail('Quest Pack reuse proof drift');
if (pack.proof_result !== 'PASS_ARCHITECTURE_REUSE__COMPLETION_CONTRACT_DEPLOYED_REVIEWED__RELEASE_NOT_READY') fail('proof result drift');

if (!process.exitCode) console.log('DAY002 SCALABILITY PASS: 705-word canon; generic registry; Day 001 renderer reused; completion contract reviewed; 2 blockers remain');
