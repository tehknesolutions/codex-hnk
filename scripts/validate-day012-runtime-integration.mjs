import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
const fail=(m)=>{console.error(`DAY012 RUNTIME INTEGRATION FAIL: ${m}`);process.exitCode=1};
const quest=json('docs/experience/kether/day-012/day-012.quest.json');
const canon=json('docs/experience/kether/day-012/day-012.canon-blocks.json');
const pack=json('docs/experience/kether/day-012/day-012.quest-pack.json');
const service=json('docs/experience/kether/day-012/day-012.completion.service.json');
const completion=read('packages/completion-contract/src/day012.ts');
const practice=read('packages/practice-contract/src/day012.ts');
const client=read('packages/supabase-client/src/day012-v1.ts');
const cycle=read('packages/supabase-client/src/kether-cycle03.ts');
const library=read('packages/quest-library/src/library.ts');
const migration=read('supabase/migrations/20260909172000_day012_completion_contract_v1_reviewed_and_active.sql');
const progression=read('packages/progression/src/attribute-progression.ts');
const web=read('apps/web/app/day-012/Day012GoldenV1Web.tsx');
const webRoute=read('apps/web/app/day-012/page.tsx');
const mobile=read('apps/mobile/src/features/kether/Day012GoldenV1Mobile.tsx');
const mobileRoute=read('apps/mobile/src/app/day-012.tsx');
const webVault=read('apps/web/app/_runtime/WebVaultTextPort.ts');
const mobileVault=read('apps/mobile/src/runtime/MobileVaultTextPort.ts');

if(quest.day!==12||canon.source.day!==12)fail('day mismatch');
if(quest.canonical.source_sha!=='a3be33e6d390b6c507e284d6dad6aaf94ebd4294'||canon.source.blob_sha!==quest.canonical.source_sha)fail('canonical source SHA drift');
if(canon.counted_words!==705)fail('canon must remain 705 counted words');
if(quest.canonical.xp!==100)fail('canonical XP must remain 100');
if(quest.progression?.primary_attribute!=='PER'||quest.progression?.secondary_attribute!=='DIS'||quest.progression?.attribute_gain!==1||quest.progression?.client_may_apply!==false||quest.progression?.application!=='SERVER_XP_EVENT_TRIGGER_ONLY')fail('attribute progression contract drift');
if(quest.status!=='TECHNICALLY_ACTIVE__DEVICE_BROWSER_QA_PENDING')fail('quest not technically active');
if((quest.release_blockers??[]).length!==1||quest.release_blockers[0]?.id!=='DEVICE_BROWSER_QA')fail('quest release blockers drift');
if(pack.release_state!=='TECHNICALLY_ACTIVE__DEVICE_BROWSER_QA_PENDING'||pack.release_blockers?.join(',')!=='DEVICE_BROWSER_QA')fail('quest pack not technically active');
if(pack.runtime?.web!=='ACTIVE'||pack.runtime?.expo!=='ACTIVE'||pack.runtime?.active_timer_persisted!==false||pack.runtime?.completed_duration_persisted!==true)fail('foreground-safe runtime proof missing');
if(pack.safety?.background_time_never_counted!==true||pack.safety?.safe_early_stop_valid!==true||pack.safety?.flame_extinguished_before_completion!==true)fail('fire timer safety proof missing');
if(pack.privacy?.server_plaintext!==false||pack.privacy?.offline_plaintext_persistence!==false||pack.privacy?.offline_capture_queue!=='CIPHERTEXT_ONLY')fail('privacy pack drift');
if(pack.progression?.smoke?.per_before!==5||pack.progression?.smoke?.per_after!==6||pack.progression?.smoke?.dis_before!==5||pack.progression?.smoke?.dis_after!==5||pack.progression?.smoke?.attribute_event_code!=='PER'||pack.progression?.smoke?.attribute_event_amount!==1)fail('PER +1 server smoke proof drift');
if(pack.cycle_progress?.expected_after_day!==2||pack.cycle_progress?.fragment!==3||pack.cycle_progress?.expected_lit!==false||pack.cycle_progress?.client_may_light_fragment!==false)fail('Sitael 2/5 progression proof drift');
if(!completion.includes("deploymentState:'active'")||!completion.includes("primaryAttribute:'PER'")||!completion.includes("secondaryAttribute:'DIS'")||!completion.includes("application:'SERVER_XP_EVENT_TRIGGER'"))fail('completion attribute contract not active');
for(const token of ['stable_surface_confirmed','continuous_supervision_confirmed','alert_not_sleepy_confirmed','natural_blinking_confirmed','flame_extinguished_confirmed'])if(!practice.includes(token))fail(`practice safety field missing ${token}`);
for(const token of ['return_vault_entry_ref','distraction_discomfort_vault_entry_ref','final_vault_entry_ref','attention_distraction_return_vault_entry_ref'])if(!practice.includes(token))fail(`Vault evidence ref missing ${token}`);
if(!practice.includes('v<1||v>600')&&!practice.includes('v<1||v>600'))fail('1..600 second early-stop contract missing');
if(!client.includes('startDay012PracticeSessionV1')||!client.includes('loadDay012PracticeSessionV1')||!client.includes('sealDay012V1'))fail('Day012 Supabase client missing');
if(!cycle.includes("fragment:3")||!cycle.includes("angel:'Sitael'")||!cycle.includes('expectedLit=expectedCompletedDays===5'))fail('Sitael authoritative guard missing');
if(!library.includes('day012QuestJson')||!library.includes('[12,{day:12'))fail('Quest Library Day012 bundle missing');
if(!migration.includes("'day012_v1'")||!migration.includes("'HNK-KETHER-D012-COMP-V1'")||!migration.includes("'active'"))fail('reviewed active backend migration missing');
if(!progression.includes('row.primary_attribute')||!progression.includes('CAP_REACHED'))fail('attribute cap semantics missing from progression package');
if(service.smoke?.xp_awarded!==100||service.smoke?.xp_after!==1100||service.smoke?.current_day!==13)fail('rollback smoke XP/day proof drift');
if(service.progression?.smoke?.per_before!==5||service.progression?.smoke?.per_after!==6||service.progression?.smoke?.dis_after!==5||service.progression?.smoke?.attribute_event_count!==1)fail('attribute smoke proof missing');
if(service.smoke?.sitael?.completed_days!==2||service.smoke?.sitael?.lit!==false||service.smoke?.fragments_lit!==2)fail('Sitael 2/5 proof missing');
if(service.smoke?.progression_events?.join(',')!=='NEXT_DAY_UNLOCKED')fail('unexpected Day012 progression events');
if(service.validator_tests?.valid!=='PASS'||!String(service.validator_tests?.plaintext_in_jachin).startsWith('REJECTED_')||!String(service.validator_tests?.flame_not_extinguished).startsWith('REJECTED_')||!String(service.validator_tests?.supervision_missing).startsWith('REJECTED_'))fail('validator attack proof missing');
for(const source of [web,mobile]){
 for(const token of ['flushPending','resolveEntryId','assertSitaelProgress','flameExtinguished','activeStartedAt','ENCERRAR COM SEGURANÇA'])if(!source.includes(token))fail(`runtime missing ${token}`);
 if(!source.includes('Math.min(600')||!source.includes("day:12")||!source.includes("kind:'journal'"))fail('runtime duration/Vault constraints missing');
 if(source.includes('timerEndsAt')||source.includes('activeStartedAt:'))fail('active flame timer must not be persisted in Draft');
}
if(!web.includes("document.visibilityState!=='visible'")||!web.includes('visibilitychange'))fail('Web background interruption guard missing');
if(!mobile.includes("AppState.addEventListener('change'")||!mobile.includes("state!=='active'"))fail('Expo background interruption guard missing');
for(const forbidden of ['jachinNote:string','boazNote:string','middleNote:string','soulNote:string']){if(web.includes(forbidden)||mobile.includes(forbidden))fail(`plaintext field leaked into persisted Draft contract: ${forbidden}`)}
if(!webRoute.includes('Day012GoldenV1Web'))fail('Web /day-012 route missing');
if(!mobileRoute.includes('AtriumGate')||!mobileRoute.includes('Day012GoldenV1Mobile'))fail('Expo /day-012 route missing or unguarded');
for(const vault of [webVault,mobileVault])if(!vault.includes('flushPending')||!vault.includes('resolveEntryId')||!vault.includes('local-vault:'))fail('ciphertext offline queue capability missing');
if(quest.completion_semantics?.exact_ten_minutes_required!==false||quest.completion_semantics?.absence_of_thought_required!==false||quest.completion_semantics?.unblinking_gaze_required!==false||quest.completion_semantics?.safe_early_stop_valid!==true||quest.completion_semantics?.flame_extinguished_required!==true||quest.completion_semantics?.attribute_gain_client_computed!==false)fail('responsible completion semantics drift');

if(!process.exitCode)console.log('DAY012 RUNTIME INTEGRATION PASS (ACTIVE · Web + Expo · foreground-only flame timing · E2EE queue · +100 XP · server PER +1 cap-aware · Sitael 2/5)');
