import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const must = (text, token, label) => { if (!text.includes(token)) throw new Error(`DAY006_RUNTIME_FAIL:${label}`); };

const quest = JSON.parse(read('docs/experience/kether/day-006/day-006.quest.json'));
const canon = JSON.parse(read('docs/experience/kether/day-006/day-006.canon-blocks.json'));
const pack = JSON.parse(read('docs/experience/kether/day-006/day-006.quest-pack.json'));
const service = JSON.parse(read('docs/experience/kether/day-006/day-006.completion.service.json'));
const library = read('packages/quest-library/src/library.ts');
const client = read('packages/supabase-client/src/day006-v1.ts');
const web = read('apps/web/app/day-006/Day006GoldenV1Web.tsx');
const mobile = read('apps/mobile/src/features/kether/Day006GoldenV1Mobile.tsx');
const voiceWeb = read('apps/web/app/_runtime/QuestVoicePhase.tsx');
const voiceMobile = read('apps/mobile/src/runtime/QuestVoicePhase.tsx');

if (quest.day !== 6 || quest.id !== 'HNK-KETHER-D006-V1') throw new Error('DAY006_RUNTIME_FAIL:quest_identity');
if (quest.canonical.source_sha !== canon.source.blob_sha) throw new Error('DAY006_RUNTIME_FAIL:source_sha');
if (canon.counted_words !== 705) throw new Error('DAY006_RUNTIME_FAIL:canon_705');
if (quest.progression?.primary_attribute !== 'PER' || quest.progression?.attribute_gain !== 1) throw new Error('DAY006_RUNTIME_FAIL:progression');
const voice = quest.phases.find((p) => p.id === 'jeliel_voice');
if (!voice || voice.type !== 'VOICE' || voice.interaction?.recording_optional !== true || voice.privacy?.recording_not_required_for_completion !== true) throw new Error('DAY006_RUNTIME_FAIL:voice_policy');
const boaz = quest.phases.find((p) => p.id === 'boaz_silence');
if (!boaz || boaz.safety?.thought_suppression_not_required !== true || boaz.safety?.absolute_immobility_not_required !== true) throw new Error('DAY006_RUNTIME_FAIL:safety_reframe');

must(library, 'day006QuestJson', 'library_import'); must(library, '[6, { day: 6', 'library_registry');
must(client, "day:6", 'client_day'); must(client, 'sealDay006V1', 'client_seal'); must(client, "complete_codex_day_v2", 'client_rpc_v2');
must(web, 'catalog.requireDay(6)', 'web_catalog'); must(web, 'QuestVoicePhase', 'web_voice_renderer'); must(web, 'sealDay006V1', 'web_seal');
must(mobile, 'catalog.requireDay(6)', 'mobile_catalog'); must(mobile, 'QuestVoicePhase', 'mobile_voice_renderer'); must(mobile, 'sealDay006V1', 'mobile_seal');
must(voiceWeb, 'CONCLUIR PRÁTICA SEM GRAVAR', 'web_optional_recording'); must(voiceMobile, 'CONCLUIR PRÁTICA SEM GRAVAR', 'mobile_optional_recording');
if ((pack.blockers ?? []).length !== 0 || pack.runtime?.backend_status !== 'ACTIVE') throw new Error('DAY006_RUNTIME_FAIL:active_pack_state');
if (service.transport?.deployment_state !== 'LIVE' || service.deployment?.registry_status !== 'active') throw new Error('DAY006_RUNTIME_FAIL:completion_service_state');
if (pack.backend_smoke?.xp_awarded !== 100 || pack.backend_smoke?.per_after !== 6 || pack.backend_smoke?.crown_fragments_lit !== 1 || pack.backend_smoke?.jeliel_completed_days !== 1) throw new Error('DAY006_RUNTIME_FAIL:smoke_ledger');
console.log('DAY006 RUNTIME INTEGRATION PASS (ACTIVE · Web + Expo + optional voice + PER server-side · Jeliel 1/5)');
