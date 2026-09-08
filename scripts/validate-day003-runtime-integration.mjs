import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const fail = (message) => {
  console.error(`DAY003 RUNTIME FAIL: ${message}`);
  process.exitCode = 1;
};

const quest = json('docs/experience/kether/day-003/day-003.quest.json');
const pack = json('docs/experience/kether/day-003/day-003.quest-pack.json');
const renderer = json('docs/experience/kether/day-003/day-003.renderer-profile.json');
const service = json('docs/experience/kether/day-003/day-003.completion.service.json');
const web = read('apps/web/app/day-003/Day003GoldenV1Web.tsx');
const webRoute = read('apps/web/app/day-003/page.tsx');
const mobile = read('apps/mobile/src/features/kether/Day003GoldenV1Mobile.tsx');
const mobileRoute = read('apps/mobile/src/app/day-003.tsx');
const webAction = read('apps/web/app/_runtime/QuestRealWorldActionPhase.tsx');
const mobileAction = read('apps/mobile/src/runtime/QuestRealWorldActionPhase.tsx');
const engine = read('packages/quest-engine/src/runtime.ts');
const library = read('packages/quest-library/src/library.ts');
const client = read('packages/supabase-client/src/day003-v1.ts');
const actionClient = read('packages/supabase-client/src/real-world-action.ts');

if (quest.version !== '0.4.0') fail('quest version drift');
if (quest.canonical?.source_sha !== '3cb60ed208c24ee885cbe95d974c7468419120aa') fail('canonical SHA drift');
if (quest.canonical?.xp !== 100) fail('canonical XP drift');
if ((quest.release_blockers ?? []).length !== 0) fail('Day003 technical blockers must be zero');
const action = quest.phases.find((phase) => phase.id === 'boaz_24h_action');
if (!action || action.type !== 'REAL_WORLD_ACTION') fail('missing REAL_WORLD_ACTION phase');
if (action.interaction?.action_contract_id !== 'HNK-KETHER-D003-BOAZ-24H-V1') fail('action contract id drift');
if (action.interaction?.target_elapsed_seconds !== 86400) fail('24h target drift');
if (action.interaction?.completion_requires_server_elapsed_window !== true) fail('server elapsed window must be authoritative');
if (action.interaction?.lapse_policy !== 'RESTART_WINDOW_WITHOUT_PUNISHMENT') fail('lapse policy drift');
const completion = quest.phases.find((phase) => phase.type === 'COMPLETION');
if (completion?.completion_contract_state !== 'DEPLOYED_ACTIVE') fail('Day003 Completion Contract must be active');

if (renderer.phase_renderers?.REAL_WORLD_ACTION !== 'RealWorldActionScene') fail('renderer profile missing real-world action scene');
if (renderer.policies?.real_world_action?.server_clock_authoritative !== true) fail('renderer server clock policy drift');
if (renderer.policies?.real_world_action?.quest_snapshot_persistence_required !== true) fail('quest snapshot persistence policy missing');
if (renderer.policies?.real_world_action?.practice_session_persistence_required !== true) fail('practice session persistence policy missing');

for (const [label, source] of [['web', web], ['mobile', mobile]]) {
  for (const token of [
    'createBundledQuestLibrary', 'createQuestCatalog', 'requireDay(3)', 'QuestRuntime',
    'createSupabaseRealWorldActionPort', 'createDay003ClientActionId',
    'QuestRealWorldActionPhase', 'sealDay003V1', 'loadDay003PracticeSessionV1',
  ]) if (!source.includes(token)) fail(`${label} missing ${token}`);
  if (source.includes('86400')) fail(`${label} must not self-qualify by hardcoded 86400`);
}
if (!web.includes('createWebQuestSnapshotStore') || !web.includes('localStorage')) fail('Web persistent resume missing');
if (!mobile.includes('createMobileQuestSnapshotStore') || !mobile.includes('SecureStore')) fail('Expo persistent resume missing');
if (!webRoute.includes('Day003GoldenV1Web')) fail('Web /day-003 route missing');
if (!mobileRoute.includes('Day003GoldenV1Mobile')) fail('Expo /day-003 route missing');

for (const [label, source] of [['web action renderer', webAction], ['mobile action renderer', mobileAction]]) {
  for (const token of ['remaining_seconds', "state === 'qualified'", 'port.start', 'port.refresh', 'port.restart', 'port.stop', 'onSnapshotChange']) {
    if (!source.includes(token)) fail(`${label} missing ${token}`);
  }
}

if (!engine.includes('restore(saved: SessionSnapshot)')) fail('QuestRuntime restore capability missing');
if (!library.includes('[3,')) fail('QuestLibrary Day 003 bundle missing');
if (!client.includes('buildDay003EvidenceV1') || !client.includes("row.day !== 3")) fail('Day003 completion adapter drift');
for (const token of ['start_real_world_action_v1', 'refresh_real_world_action_v1', 'restart_real_world_action_v1', 'stop_real_world_action_v1']) {
  if (!actionClient.includes(token)) fail(`real-world action transport missing ${token}`);
}

if (service.transport?.deployment_state !== 'LIVE') fail('Day003 completion service must be LIVE');
if (service.deployment?.registry_status !== 'active') fail('Day003 completion registry must be active');
if (service.deployment?.validator_key !== 'day003_v1') fail('Day003 validator key drift');
if (service.deployment?.dispatcher !== 'hnk_private.validate_completion_contract_v2') fail('generic validator dispatcher drift');
if (service.qa?.transactional_smoke !== 'PASS_ROLLBACK_ONLY') fail('Day003 completion smoke result missing');

if (pack.version !== '0.3.0') fail('Quest Pack version drift');
if (pack.server?.completion_contract_status !== 'active') fail('Quest Pack completion state drift');
if ((pack.blockers ?? []).length !== 0) fail('Quest Pack technical blockers must be zero');
if (pack.qa?.first_completion_xp !== 100 || pack.qa?.revisit_xp !== 0) fail('Quest Pack XP QA drift');
if (pack.qa?.attribute_events !== 0) fail('Day003 must not grant an attribute event');
if (pack.runtime?.web_component !== 'Day003GoldenV1Web' || pack.runtime?.expo_component !== 'Day003GoldenV1Mobile') fail('pack runtime entries drift');

if (!process.exitCode) console.log('DAY003 RUNTIME PASS (server-clock 24h + persistent Web/Expo + active Completion V2)');
