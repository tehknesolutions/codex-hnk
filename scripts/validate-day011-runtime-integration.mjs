import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
const fail=(m)=>{console.error(`DAY011 RUNTIME INTEGRATION FAIL: ${m}`);process.exitCode=1};

const quest=json('docs/experience/kether/day-011/day-011.quest.json');
const canon=json('docs/experience/kether/day-011/day-011.canon-blocks.json');
const pack=json('docs/experience/kether/day-011/day-011.quest-pack.json');
const service=json('docs/experience/kether/day-011/day-011.completion.service.json');
const completion=read('packages/completion-contract/src/day011.ts');
const practice=read('packages/practice-contract/src/day011.ts');
const client=read('packages/supabase-client/src/day011-v1.ts');
const cycle=read('packages/supabase-client/src/kether-cycle03.ts');
const library=read('packages/quest-library/src/library.ts');
const migration=read('supabase/migrations/20260909161000_day011_completion_contract_v1_reviewed_and_active.sql');
const web=read('apps/web/app/day-011/Day011GoldenV1Web.tsx');
const webRoute=read('apps/web/app/day-011/page.tsx');
const mobile=read('apps/mobile/src/features/kether/Day011GoldenV1Mobile.tsx');
const mobileRoute=read('apps/mobile/src/app/day-011.tsx');
const webVault=read('apps/web/app/_runtime/WebVaultTextPort.ts');
const mobileVault=read('apps/mobile/src/runtime/MobileVaultTextPort.ts');

if(quest.day!==11||canon.source.day!==11)fail('day mismatch');
if(quest.canonical.source_sha!=='9b7140dee8d346a4ea81dd753d342e4c1f172b0d'||canon.source.blob_sha!==quest.canonical.source_sha)fail('canonical source SHA drift');
if(canon.counted_words!==705)fail('canon must remain 705 counted words');
if(quest.canonical.xp!==100||quest.progression.attribute_gain!==0)fail('progression must be +100 XP / +0 attribute');
if(quest.status!=='TECHNICALLY_ACTIVE__DEVICE_BROWSER_QA_PENDING')fail('quest not technically active');
if((quest.release_blockers??[]).length!==1||quest.release_blockers[0]?.id!=='DEVICE_BROWSER_QA')fail('quest release blockers drift');
if(pack.release_state!=='TECHNICALLY_ACTIVE__DEVICE_BROWSER_QA_PENDING'||pack.release_blockers?.join(',')!=='DEVICE_BROWSER_QA')fail('quest pack not technically active');
if(pack.runtime?.web!=='ACTIVE'||pack.runtime?.expo!=='ACTIVE'||pack.runtime?.snapshot_resume!==true||pack.runtime?.structural_draft_only!==true)fail('Web Expo resumable runtime proof missing');
if(pack.runtime?.three_persistent_timers!==true||pack.runtime?.safety_stop_resets_current_timer!==true)fail('timer safety proof missing');
if(pack.privacy?.server_plaintext!==false||pack.privacy?.offline_plaintext_persistence!==false||pack.privacy?.offline_capture_queue!=='CIPHERTEXT_ONLY')fail('privacy pack drift');
if(pack.cycle_progress?.expected_after_day!==1||pack.cycle_progress?.fragment!==3||pack.cycle_progress?.expected_lit!==false||pack.cycle_progress?.client_may_light_fragment!==false)fail('Sitael 1/5 progression proof drift');
if(!completion.includes("deploymentState:'active'"))fail('completion contract not active');
for(const ref of ['relationship_change_vault_entry_ref','predominant_judgment_vault_entry_ref','final_observation_vault_entry_ref','observation_vs_interpretation_vault_entry_ref'])if(!practice.includes(ref))fail(`missing Vault evidence ref ${ref}`);
if(!practice.includes('visual_strangeness_not_automatic_revelation_confirmed'))fail('responsible visual-strangeness confirmation missing');
if(!client.includes('startDay011PracticeSessionV1')||!client.includes('loadDay011PracticeSessionV1')||!client.includes('sealDay011V1'))fail('Day011 Supabase client missing');
if(!cycle.includes("fragment:3")||!cycle.includes("angel:'Sitael'")||!cycle.includes('expectedLit=expectedCompletedDays===5'))fail('authoritative Sitael progression guard missing');
if(!library.includes('day011QuestJson')||!library.includes('[11,{day:11'))fail('Quest Library Day011 bundle missing');
if(!migration.includes("'day011_v1'")||!migration.includes("'HNK-KETHER-D011-COMP-V1'")||!migration.includes("'active'"))fail('reviewed active backend migration missing');
if(service.smoke?.xp_awarded!==100||service.smoke?.xp_after!==1100||service.smoke?.current_day!==12)fail('rollback smoke XP/day proof drift');
if(service.smoke?.attribute_gain_rule_count!==0||service.smoke?.attribute_event_count!==0)fail('Day011 attribute zero proof drift');
if(service.smoke?.sitael?.completed_days!==1||service.smoke?.sitael?.lit!==false||service.smoke?.fragments_lit!==2)fail('Sitael 1/5 proof missing');
if(service.smoke?.progression_events?.join(',')!=='NEXT_DAY_UNLOCKED')fail('unexpected Day011 progression events');
if(service.validator_tests?.valid!=='PASS'||!String(service.validator_tests?.plaintext_in_jachin).startsWith('REJECTED_'))fail('validator privacy attack proof missing');
for(const source of [web,mobile]){
 for(const token of ['flushPending','resolveEntryId','assertSitaelProgress','Date.now()+300000','safetyStop','visualStrangenessNotAutomaticRevelationConfirmed'])if(!source.includes(token))fail(`runtime missing ${token}`);
 if(!source.includes("day:11")||!source.includes("kind:'journal'"))fail('runtime Vault Day011 capture missing');
}
if(!web.includes('createWebQuestSnapshotStore')||!web.includes('localStorage.setItem')||!web.includes('JSON.stringify(draft)'))fail('Web structural resume persistence missing');
if(!mobile.includes('SecureStore')||!mobile.includes('saveJson')||!mobile.includes('timerEndsAt'))fail('Expo structural resume persistence missing');
for(const forbidden of ['feature1:string','relationship:string','judgment:string','finalNote:string','soulNote:string']){if(web.includes(forbidden)||mobile.includes(forbidden))fail(`plaintext field leaked into persisted Draft contract: ${forbidden}`)}
if(!webRoute.includes('Day011GoldenV1Web'))fail('Web /day-011 route missing');
if(!mobileRoute.includes('AtriumGate')||!mobileRoute.includes('Day011GoldenV1Mobile'))fail('Expo /day-011 route missing or unguarded');
for(const vault of [webVault,mobileVault]){if(!vault.includes('flushPending')||!vault.includes('resolveEntryId')||!vault.includes('local-vault:'))fail('ciphertext offline queue capability missing')}
if(quest.completion_semantics?.strange_visual_effect_required!==false||quest.completion_semantics?.sitael_fragment_client_computed!==false||quest.completion_semantics?.safety_stop_supported!==true)fail('responsible completion semantics drift');

if(!process.exitCode)console.log('DAY011 RUNTIME INTEGRATION PASS (ACTIVE · Web + Expo · 3x5m safe mirror blocks · E2EE offline ciphertext queue · +100 XP · 0 attribute · Sitael 1/5)');
