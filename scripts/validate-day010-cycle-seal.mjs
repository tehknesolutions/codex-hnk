import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
const fail=(m)=>{console.error(`DAY010 CYCLE SEAL FAIL: ${m}`);process.exitCode=1};

const quest=json('docs/experience/kether/day-010/day-010.quest.json');
const canon=json('docs/experience/kether/day-010/day-010.canon-blocks.json');
const pack=json('docs/experience/kether/day-010/day-010.quest-pack.json');
const service=json('docs/experience/kether/day-010/day-010.completion.service.json');
const completion=read('packages/completion-contract/src/day010.ts');
const practice=read('packages/practice-contract/src/day010.ts');
const client=read('packages/supabase-client/src/day010-v1.ts');
const cycle=read('packages/supabase-client/src/kether-cycle02.ts');
const library=read('packages/quest-library/src/library.ts');
const web=read('apps/web/app/day-010/Day010GoldenV1Web.tsx');
const webRoute=read('apps/web/app/day-010/page.tsx');
const expo=read('apps/mobile/src/features/kether/Day010GoldenV1Mobile.tsx');
const expoRoute=read('apps/mobile/src/app/day-010.tsx');
const webVault=read('apps/web/app/_runtime/WebVaultTextPort.ts');
const expoVault=read('apps/mobile/src/runtime/MobileVaultTextPort.ts');
const migration=read('supabase/migrations/20260909154500_day010_completion_contract_v1_reviewed_and_active.sql');

if(quest.day!==10||canon.source.day!==10)fail('day mismatch');
if(quest.canonical.source_sha!=='167b3380e029456be1571f1d6dc3d491775acec5'||canon.source.blob_sha!==quest.canonical.source_sha)fail('canonical source SHA drift');
if(canon.counted_words!==705)fail('canon must remain 705 counted words');
if(quest.canonical.xp!==100||quest.progression.attribute_gain!==0)fail('progression must be +100 XP / +0 attribute');
if(quest.status!=='TECHNICALLY_ACTIVE__DEVICE_BROWSER_QA_PENDING')fail('quest must be technically active with only device/browser QA pending');
const blockers=(quest.release_blockers??[]).map(x=>typeof x==='string'?x:x?.id).filter(Boolean);
if(blockers.length!==1||blockers[0]!=='DEVICE_BROWSER_QA')fail('quest release blockers must contain only DEVICE_BROWSER_QA');
if(quest.runtime?.web!=='ACTIVE'||quest.runtime?.expo!=='ACTIVE'||quest.runtime?.vault_sync_before_completion!==true||quest.runtime?.server_crown_assert!==true)fail('quest runtime activation proof drift');
if(!completion.includes("deploymentState:'active'"))fail('completion contract not active');
if(!practice.includes("'STRONG'|'WEAK'|'ABSENT'"))fail('neutral response triad missing');
if(!practice.includes('somatic_vault_entry_ref')||!practice.includes('responsible_use_vault_entry_ref'))fail('private evidence must use Vault refs');
if(!client.includes('startDay010PracticeSessionV1')||!client.includes('loadDay010PracticeSessionV1')||!client.includes('sealDay010V1'))fail('Day010 Supabase client incomplete');
if(!cycle.includes("fragment: 2")||!cycle.includes("angel: 'Jeliel'")||!cycle.includes('completedDays !== 5'))fail('Jeliel authoritative fragment guard missing');
if(!library.includes('day010QuestJson')||!library.includes('[10,{day:10'))fail('Quest Library Day010 bundle missing');
if(!migration.includes("'day010_v1'")||!migration.includes("'HNK-KETHER-D010-COMP-V1'")||!migration.includes("'active'"))fail('reviewed backend migration missing');

for(const [name,source,vaultFactory] of [['Web',web,'createWebVaultTextPort'],['Expo',expo,'createMobileVaultTextPort']]){
 if(!source.includes('catalog.requireDay(10)')||!source.includes('library.loadBundle(10)'))fail(`${name} does not resolve Day010 through generic catalog/library`);
 if(!source.includes(vaultFactory))fail(`${name} Day010 Vault port missing`);
 if(!source.includes('flushPending')||!source.includes('resolveEntryId'))fail(`${name} does not flush ciphertext queue and resolve Vault refs before seal`);
 if(!source.includes('sealDay010V1'))fail(`${name} Day010 completion seal missing`);
 if(!source.includes('assertJelielFragmentLit'))fail(`${name} does not assert authoritative Jeliel fragment state`);
 if(!source.includes("'STRONG'")&&!source.includes('STRONG'))fail(`${name} neutral response choices missing`);
}
if(!webRoute.includes('Day010GoldenV1Web'))fail('Web /day-010 route missing');
if(!expoRoute.includes('Day010GoldenV1Mobile')||!expoRoute.includes('AtriumGate'))fail('Expo /day-010 Atrium route missing');
if(!webVault.includes('CIPHERTEXT')&&!webVault.includes('EncryptedVaultPayload'))fail('Web Vault ciphertext queue contract missing');
if(!expoVault.includes('EncryptedVaultPayload'))fail('Expo Vault ciphertext queue contract missing');

if(service.registry?.status!=='active'||service.registry?.validator_key!=='day010_v1')fail('completion service registry state drift');
if(service.privacy?.server_plaintext!==false||service.privacy?.evidence_private_content!=='VAULT_REFS_ONLY')fail('completion service privacy boundary drift');
if(service.smoke?.xp_awarded!==100||service.smoke?.xp_after!==1100||service.smoke?.current_day!==11)fail('rollback smoke XP/day proof drift');
if(service.smoke?.jeliel?.completed_days!==5||service.smoke?.jeliel?.lit!==true||service.smoke?.fragments_lit!==2)fail('Jeliel 5/5 fragment-2 proof missing');
if(!service.smoke?.progression_events?.includes('KETHER_FRAGMENT_LIT'))fail('fragment progression event missing');
if(pack.release_state!=='TECHNICALLY_ACTIVE__DEVICE_BROWSER_QA_PENDING')fail('quest-pack release state drift');
if(pack.runtime?.web!=='ACTIVE'||pack.runtime?.expo!=='ACTIVE'||pack.runtime?.vault_sync_before_seal!==true||pack.runtime?.server_crown_assert!==true)fail('quest-pack runtime proof drift');
if((pack.release_blockers??[]).join(',')!=='DEVICE_BROWSER_QA')fail('quest-pack blockers must contain only DEVICE_BROWSER_QA');
if(pack.cycle_seal?.client_may_light_fragment!==false)fail('client must never self-award crown fragment');
if(quest.completion_semantics?.absent_response_valid!==true||quest.completion_semantics?.extraordinary_sensation_required!==false)fail('responsible completion semantics drift');

if(!process.exitCode)console.log('DAY010 CYCLE SEAL PASS (TECHNICALLY ACTIVE · Web + Expo · Vault E2EE ciphertext queue · +100 XP · 0 attribute · Jeliel 5/5 · Crown fragment 2 lit · device/browser QA pending)');
