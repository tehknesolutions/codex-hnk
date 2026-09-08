import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const fail = (message) => { console.error(`DAY004 RUNTIME FAIL: ${message}`); process.exitCode = 1; };

const quest = json('docs/experience/kether/day-004/day-004.quest.json');
const pack = json('docs/experience/kether/day-004/day-004.quest-pack.json');
const renderer = json('docs/experience/kether/day-004/day-004.renderer-profile.json');
const web = read('apps/web/app/day-004/Day004GoldenV1Web.tsx');
const webRoute = read('apps/web/app/day-004/page.tsx');
const mobile = read('apps/mobile/src/features/kether/Day004GoldenV1Mobile.tsx');
const mobileRoute = read('apps/mobile/src/app/day-004.tsx');
const webExperiment = read('apps/web/app/_runtime/QuestBehavioralExperimentPhase.tsx');
const mobileExperiment = read('apps/mobile/src/runtime/QuestBehavioralExperimentPhase.tsx');
const engineTypes = read('packages/quest-engine/src/types.ts');
const renderSurface = read('packages/quest-engine/src/render-surface.ts');
const library = read('packages/quest-library/src/library.ts');
const practice = read('packages/practice-contract/src/day004.ts');
const completion = read('packages/completion-contract/src/day004.ts');
const client = read('packages/supabase-client/src/day004-v1.ts');

if (quest.canonical?.source_sha !== '376964a263f3d4f07542fcf55ca3bf2c18c5fd94') fail('canonical SHA drift');
if (quest.canonical?.xp !== 100) fail('canonical XP drift');
const experiments = quest.phases.filter((phase) => phase.type === 'EXPERIMENT');
if (experiments.length !== 2) fail('expected exactly two EXPERIMENT phases');
for (const phase of experiments) {
  if (phase.interaction?.design !== 'BEFORE_AFTER') fail(`${phase.id} must use BEFORE_AFTER`);
  if (phase.interaction?.causality_claim_allowed !== false) fail(`${phase.id} must forbid causal claim`);
}
if (renderer.phase_renderers?.EXPERIMENT !== 'BehavioralExperimentScene') fail('renderer profile missing BehavioralExperimentScene');
if (!engineTypes.includes('| "EXPERIMENT"')) fail('QuestPhaseType EXPERIMENT missing');
for (const token of ['START_EXPERIMENT','RECORD_OBSERVATION']) if (!renderSurface.includes(token)) fail(`render control missing ${token}`);

for (const [label, source] of [['web', web], ['mobile', mobile]]) {
  for (const token of ['createBundledQuestLibrary','createQuestCatalog','requireDay(4)','QuestRuntime','QuestBehavioralExperimentPhase','sealDay004V1']) {
    if (!source.includes(token)) fail(`${label} missing ${token}`);
  }
  if (source.includes('attribute_gain: 1') || source.includes('attributeGain: 1')) fail(`${label} must not award Day004 attribute`);
}
if (!webRoute.includes('Day004GoldenV1Web')) fail('Web /day-004 route missing');
if (!mobileRoute.includes('Day004GoldenV1Mobile')) fail('Expo /day-004 route missing');

for (const [label, source] of [['web experiment', webExperiment], ['mobile experiment', mobileExperiment]]) {
  if (source.includes('DAY004') || source.includes('day004')) fail(`${label} must remain day-agnostic`);
  if (!source.includes('Nenhuma mudança perceptível')) fail(`${label} must accept no noticeable change`);
  if (!source.includes('causality_claim_allowed')) fail(`${label} must expose causal boundary`);
}

if (!library.includes('[4,')) fail('QuestLibrary Day 004 bundle missing');
if (!practice.includes('buildDay004EvidenceV1')) fail('typed Day004 evidence builder missing');
if (!practice.includes("HNK-THETA432-BINAURAL-V1")) fail('Day004 audio profile guard missing');
if (!completion.includes("HNK-KETHER-D004-COMP-V1")) fail('Day004 completion contract missing');
if (!client.includes('buildDay004EvidenceV1') || !client.includes('complete_codex_day_v2')) fail('Day004 Supabase completion client incomplete');
if (pack.progression?.attribute_gain !== 0) fail('Day004 attribute gain must remain zero');
const blockers = new Set((pack.blockers ?? []).map((entry) => entry.id));
if (blockers.has('RUNTIME-004-EXPERIMENT-ADAPTER')) fail('runtime adapter blocker must be removed once Web/Expo are wired');
if (![0,1].includes(blockers.size)) fail('unexpected Day004 blocker count');
if (blockers.size === 1 && !blockers.has('COMPLETION-004-CONTRACT')) fail('only completion activation may remain blocked');

if (!process.exitCode) console.log('DAY004 RUNTIME PASS (generic experiment + Web/Expo + typed evidence)');
