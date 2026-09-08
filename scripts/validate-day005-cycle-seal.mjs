import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const json = (p) => JSON.parse(read(p));
const quest = json('docs/experience/kether/day-005/day-005.quest.json');
const canon = json('docs/experience/kether/day-005/day-005.canon-blocks.json');
const pack = json('docs/experience/kether/day-005/day-005.quest-pack.json');
const evidence = json('docs/experience/kether/day-005/day-005.evidence.schema.json');
const completion = read('packages/completion-contract/src/day005.ts');
const web = read('apps/web/app/day-005/Day005GoldenV1Web.tsx');
const mobile = read('apps/mobile/src/features/kether/Day005GoldenV1Mobile.tsx');
const reviewedSql = read('supabase/migrations/20260908231328_day005_completion_contract_v1_reviewed.sql');
const activeSql = read('supabase/migrations/20260908231431_activate_day005_completion_v1.sql');
const smoke = read('supabase/tests/day005_completion_v1_smoke.sql');

function ok(condition, message) { if (!condition) throw new Error(message); }
ok(quest.day === 5 && quest.canonical.xp === 100, 'day005_identity');
ok(quest.canonical.source_sha === canon.source.blob_sha, 'day005_source_sha');
ok(canon.counted_core.word_count === 705, 'day005_705');
ok(quest.progression.attribute_gain === 1 && quest.progression.primary_attribute === 'VNT', 'day005_vnt_gain');
ok(quest.release_blockers.length === 0, 'day005_blockers');
ok(quest.phases.some((p) => p.id === 'boaz_gesture' && p.safety?.sharp_objects_prohibited === true), 'day005_empty_hand_safety');
ok(quest.phases.some((p) => p.id === 'theta432_audio' && p.audio?.profile_id === 'HNK-THETA432-BINAURAL-V1'), 'day005_audio_profile');
ok(quest.phases.some((p) => p.id === 'dai_koo_myo_focus' && p.presentation?.asset_id === 'HNK-KETHER-DAI-KOO-MYO-USUI-MASTER-V1'), 'day005_asset');
ok(quest.phases.some((p) => p.id === 'vehuiah_cycle_seal' && p.unlock?.visual_event === 'KETHER_FRAGMENT_LIT'), 'day005_cycle_seal');
ok(evidence.properties.boaz.properties.empty_hand_confirmed.const === true, 'day005_evidence_empty_hand');
ok(evidence.properties.middle.properties.asset_id.const === 'HNK-KETHER-DAI-KOO-MYO-USUI-MASTER-V1', 'day005_evidence_asset');
ok(pack.blockers.length === 0 && pack.cycle_seal.crown_fragments_lit_after === 1, 'day005_pack_active');
ok(completion.includes("deploymentState: 'active'"), 'day005_completion_active');
ok(web.includes('sealDay005V1') && web.includes('KETHER_FRAGMENT_LIT') && web.includes('/assets/kether/dai-koo-myo-usui-hnk-master-v1.svg'), 'day005_web_integration');
ok(mobile.includes('sealDay005V1') && mobile.includes('KETHER_FRAGMENT_LIT') && mobile.includes('EMPTY') === false, 'day005_mobile_integration');
ok(reviewedSql.includes('validate_day005_completion_v1') && reviewedSql.includes("'day005_v1'"), 'day005_reviewed_migration');
ok(activeSql.includes("status='active'"), 'day005_active_migration');
ok(smoke.includes("attribute_code='VNT'") && smoke.includes('KETHER_FRAGMENT_LIT') && smoke.includes('rollback;'), 'day005_smoke');
console.log('DAY005 CYCLE SEAL PASS (705 words, +100 XP, +1 VNT, Vehuiah 5/5, Fragment I)');
