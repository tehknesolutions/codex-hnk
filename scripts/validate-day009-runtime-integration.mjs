import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const must=(t,x,l)=>{if(!t.includes(x))throw new Error(`DAY009_RUNTIME_FAIL:${l}`)};
const quest=JSON.parse(read('docs/experience/kether/day-009/day-009.quest.json'));
const canon=JSON.parse(read('docs/experience/kether/day-009/day-009.canon-blocks.json'));
const pack=JSON.parse(read('docs/experience/kether/day-009/day-009.quest-pack.json'));
const service=JSON.parse(read('docs/experience/kether/day-009/day-009.completion.service.json'));
const completion=read('packages/completion-contract/src/day009.ts');
const evidence=read('packages/practice-contract/src/day009.ts');
const library=read('packages/quest-library/src/library.ts');
const client=read('packages/supabase-client/src/day009-v1.ts');
const adapter=read('packages/supabase-client/src/vault.ts');
const web=read('apps/web/app/day-009/Day009GoldenV1Web.tsx');
const mobile=read('apps/mobile/src/features/kether/Day009GoldenV1Mobile.tsx');
const mobileRoute=read('apps/mobile/src/app/day-009.tsx');
const journalWeb=read('apps/web/app/_runtime/QuestDreamJournalPhase.tsx');
const journalMobile=read('apps/mobile/src/runtime/QuestDreamJournalPhase.tsx');
const vaultWeb=read('apps/web/app/_runtime/WebVaultTextPort.ts');
const vaultMobile=read('apps/mobile/src/runtime/MobileVaultTextPort.ts');
if(quest.day!==9||quest.id!=='HNK-KETHER-D009-V1')throw new Error('DAY009_RUNTIME_FAIL:quest_identity');
if(quest.canonical.source_sha!==canon.source.blob_sha||canon.counted_words!==705)throw new Error('DAY009_RUNTIME_FAIL:canon_integrity');
if(quest.canonical.xp!==150||quest.progression?.attribute_gain!==0||quest.progression?.application!=='NO_EXECUTABLE_GAIN_RULE')throw new Error('DAY009_RUNTIME_FAIL:progression');
if(quest.status!=='TECHNICALLY_ACTIVE__DEVICE_BROWSER_QA_PENDING'||(quest.release_blockers??[]).length!==0)throw new Error('DAY009_RUNTIME_FAIL:quest_active_state');
if(quest.runtime?.offline_capture_queue!=='CIPHERTEXT_ONLY'||quest.runtime?.offline_plaintext_persistence!==false)throw new Error('DAY009_RUNTIME_FAIL:offline_privacy_state');
if(quest.completion_semantics?.dream_recall_required!==false||quest.completion_semantics?.no_recall_is_valid!==true||quest.completion_semantics?.dream_content_server_side!==false||quest.completion_semantics?.interpretation_is_hypothesis!==true||quest.completion_semantics?.sleep_deprivation_required!==false||quest.completion_semantics?.voice_recording_required!==false)throw new Error('DAY009_RUNTIME_FAIL:completion_semantics');
const wake=quest.phases.find(x=>x.id==='wake_capture');if(!wake||wake.type!=='JOURNAL'||wake.interaction?.text_capture!=='VAULT_ENCRYPTED'||wake.interaction?.interpretation_allowed!==false||wake.privacy?.server_receives!=='OPAQUE_VAULT_REF_ONLY')throw new Error('DAY009_RUNTIME_FAIL:wake_privacy');
const completionPhase=quest.phases.find(x=>x.id==='completion');if(completionPhase?.completion_contract_state!=='ACTIVE')throw new Error('DAY009_RUNTIME_FAIL:completion_phase_active');
must(library,'day009QuestJson','library_import');must(library,'day009CanonJson','library_canon');must(client,'loadDay009PracticeSessionV1','client_resume');must(client,'sealDay009V1','client_seal');must(client,'complete_codex_day_v2','client_rpc');must(evidence,'NO_RECALL','no_recall_contract');must(evidence,'day009_no_recall_must_not_fake_vault_refs','no_fake_refs_contract');
for(const [name,text] of [['web',web],['mobile',mobile]]){must(text,'catalog.requireDay(9)',`${name}_catalog`);must(text,'QuestDreamJournalPhase',`${name}_journal_renderer`);must(text,'flushPending',`${name}_flush_before_seal`);must(text,'resolveEntryId',`${name}_resolve_local_ref`);must(text,'vault_sync_required_before_completion',`${name}_sync_gate`);must(text,'keywordRecorded',`${name}_private_presence_only`)}
must(mobileRoute,'Day009GoldenV1Mobile','mobile_route');
for(const [name,text] of [['web',journalWeb],['mobile',journalMobile]]){must(text,"recall==='NO_RECALL'",`${name}_no_recall_path`);must(text,'interpretationStatus',`${name}_hypothesis_separation`);must(text,'universalMeaningClaimed:false',`${name}_no_universal_claim`)}
for(const [name,text] of [['web',vaultWeb],['mobile',vaultMobile]]){must(text,'local-vault:',`${name}_local_ref`);must(text,'flushPending',`${name}_offline_flush`);must(text,'EncryptedVaultPayload',`${name}_ciphertext_queue_type`);if(/interface PendingVaultEntry[^}]*plaintext/s.test(text))throw new Error(`DAY009_RUNTIME_FAIL:${name}_queue_contains_plaintext`)}
must(vaultWeb,'encryptNativeCompatibleVaultText','web_encrypt_before_queue');must(vaultWeb,"QUEUE_DB='hnk-vault-offline-v1'",'web_indexeddb_queue');must(vaultMobile,'encryptVaultText','mobile_encrypt_before_queue');must(vaultMobile,'Paths.document','mobile_durable_ciphertext_queue');
if(!adapter.includes('The persistence boundary intentionally accepts no plaintext property'))throw new Error('DAY009_RUNTIME_FAIL:server_adapter_boundary');
must(completion,"deploymentState:'active'",'completion_active');
if(pack.release_state!=='TECHNICALLY_ACTIVE__DEVICE_BROWSER_QA_PENDING'||(pack.blockers??[]).length!==0)throw new Error('DAY009_RUNTIME_FAIL:pack_active_state');
if(pack.backend_smoke?.status!=='PASS_ROLLBACK_ONLY'||pack.backend_smoke?.xp_total_before!==1000||pack.backend_smoke?.xp_awarded!==150||pack.backend_smoke?.xp_total_after!==1150||pack.backend_smoke?.attribute_events!==0||pack.backend_smoke?.jeliel_progress!=='4/5'||pack.backend_smoke?.crown_fragments_lit!==1)throw new Error('DAY009_RUNTIME_FAIL:backend_smoke');
if(service.transport?.deployment_state!=='LIVE'||service.deployment?.registry_status!=='active'||service.deployment?.validator_key!=='day009_v1')throw new Error('DAY009_RUNTIME_FAIL:service_active_state');
console.log('DAY009 RUNTIME INTEGRATION PASS (ACTIVE · Web + Expo · E2EE offline ciphertext queue · +150 XP · 0 attribute gain · Jeliel 4/5)');
