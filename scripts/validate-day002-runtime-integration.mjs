import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { console.error(`DAY002 RUNTIME INTEGRATION FAIL: ${message}`); process.exitCode = 1; };

const engineRegistry = read('packages/quest-engine/src/registry.ts');
const engineCatalog = read('packages/quest-engine/src/catalog.ts');
const engineAudio = read('packages/quest-engine/src/audio-runtime.ts');
const library = read('packages/quest-library/src/library.ts');
const webPage = read('apps/web/app/day-002/page.tsx');
const webJourney = read('apps/web/app/day-002/Day002GoldenV1Web.tsx');
const webAudioRenderer = read('apps/web/app/_runtime/QuestAudioPhase.tsx');
const webAudioRegistry = read('apps/web/app/_runtime/quest-audio-runtime.ts');
const mobileRoute = read('apps/mobile/src/app/day-002.tsx');
const mobileJourney = read('apps/mobile/src/features/kether/Day002GoldenV1Mobile.tsx');
const mobileAudioRenderer = read('apps/mobile/src/runtime/QuestAudioPhase.tsx');
const mobileAudioRegistry = read('apps/mobile/src/runtime/quest-audio-runtime.ts');
const day2Client = read('packages/supabase-client/src/day002-v1.ts');
const quest = JSON.parse(read('docs/experience/kether/day-002/day-002.quest.json'));
const pack = JSON.parse(read('docs/experience/kether/day-002/day-002.quest-pack.json'));

if (!engineRegistry.includes('resolveDay(day: number)')) fail('generic QuestRegistry.resolveDay missing');
if (!engineCatalog.includes('async getDay(day: number)') || !engineCatalog.includes('async requireDay(day: number)')) fail('generic QuestCatalog loader missing');
for (const source of [engineRegistry, engineCatalog, engineAudio]) {
  if (/day\s*===?\s*2|HNK-KETHER-D002/.test(source)) fail('Day 002 hardcoded inside generic engine');
}

if (!library.includes('implements RuntimeQuestBundleLoader, QuestDefinitionLoader')) fail('bundled Quest library must implement QuestDefinitionLoader');
if (!library.includes('day002QuestJson') || !library.includes('day002CanonJson') || !library.includes('day002PackJson')) fail('Day 002 bundle is not build-time bundled');
if (!library.includes('quest_library_source_sha_mismatch')) fail('Quest library SHA coherence guard missing');

if (!webPage.includes('<Day002GoldenV1Web') || !webPage.includes('redirectPath="/day-002"')) fail('Web /day-002 route not active');
if (!mobileRoute.includes('<Day002GoldenV1Mobile')) fail('Expo /day-002 route not active');

for (const [label, journey] of [['web', webJourney], ['mobile', mobileJourney]]) {
  if (!journey.includes('createBundledQuestLibrary')) fail(`${label} journey does not use bundled Quest library`);
  if (!journey.includes('createQuestCatalog')) fail(`${label} journey does not use QuestCatalog`);
  if (!journey.includes('catalog.requireDay(2)')) fail(`${label} journey does not resolve Day 002 through generic catalog`);
  if (!journey.includes('new QuestRuntime(definition)')) fail(`${label} journey does not execute QuestRuntime`);
  if (!journey.includes('new ExperienceDirector(bundle.quest)')) fail(`${label} journey does not execute ExperienceDirector`);
  if (!journey.includes('sealDay002V1')) fail(`${label} journey is not wired to Completion V2 client`);
  if (!journey.includes('startDay002PracticeSessionV1')) fail(`${label} journey does not open PracticeSession V2`);
  if (!journey.includes('safetyStop')) fail(`${label} journey lacks Safety Stop`);
  if (!journey.includes("phase.type === 'RETURN'")) fail(`${label} journey lacks Return Gate rendering`);
  if (!journey.includes("phase.type === 'AUDIO'")) fail(`${label} journey lacks generic AUDIO renderer binding`);
  if (!journey.includes('firstFiveMinutesReflectionCompleted: true')) fail(`${label} journey missing structured Boaz reflection evidence`);
  if (!journey.includes('impulseCount')) fail(`${label} journey missing impulse counter evidence`);
  if (/journal_text|soul_mirror_text|private_note/.test(journey)) fail(`${label} journey leaks private prose into structured Evidence`);
}

for (const [label, renderer] of [['web', webAudioRenderer], ['mobile', mobileAudioRenderer]]) {
  if (!renderer.includes('createQuestAudioController')) fail(`${label} AUDIO renderer does not use generic controller`);
  if (renderer.includes('Day002WebAudioRuntime') || renderer.includes('Day002ExpoAudioRuntime')) fail(`${label} AUDIO renderer imports Day-specific runtime`);
  if (!renderer.includes('headphones_required_for_binaural_difference')) fail(`${label} AUDIO renderer lacks headphone disclosure`);
  if (!renderer.includes('onSafetyStop')) fail(`${label} AUDIO renderer lacks Safety Stop`);
}

if (!webAudioRegistry.includes('.register(DAY002_AUDIO_PRESET_V1.id') || !mobileAudioRegistry.includes('.register(DAY002_AUDIO_PRESET_V1.id')) fail('platform profile registries incomplete');
if (!day2Client.includes("name: 'complete_codex_day_v2'")) fail('Day 002 client is not using complete_codex_day_v2');
if (!day2Client.includes('buildDay002EvidenceV1')) fail('Day 002 client missing Evidence V1 builder');

const phaseTypes = new Set(quest.phases.map((phase) => phase.type));
const expected = ['NARRATIVE','TERM_REVEAL','READ','FOCUS','AUDIO','RETURN','INSTRUCTION','JOURNAL','STRUCTURED_JOURNAL','CORRESPONDENCE_REVEAL','COMPLETION','UNLOCK'];
for (const type of expected) if (!phaseTypes.has(type)) fail(`expected reused phase type missing: ${type}`);
if (quest.scalability_proof?.new_renderer_required !== false || quest.scalability_proof?.new_practice_renderer_required !== false) fail('Day 002 renderer reuse assertion drift');
if ((pack.blockers ?? []).length !== 0) fail('technical blockers reappeared in Day 002 pack');

if (!process.exitCode) console.log('DAY002 RUNTIME INTEGRATION PASS: QuestCatalog + QuestRuntime + bundled Canon + generic AUDIO renderer + Web/Expo Completion V2 wiring');
