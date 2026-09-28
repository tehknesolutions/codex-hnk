import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const contract=read('packages/practice-contract/src/day074.ts');
const web=read('apps/web/app/day-074/Day074Web.tsx');
const mobile=read('apps/mobile/src/features/binah/Day074Mobile.tsx');
const route=read('apps/mobile/src/app/day-074.tsx');
const checks=[
 ['contract id',contract.includes("HNK-BINAH-D074-V1")],
 ['xp contract 100',contract.includes('DAY074_XP=100')],
 ['exactly three',contract.includes('DAY074_REQUIRED_SELF_ACCUSATIONS=3')],
 ['no auto start evidence',contract.includes('nextDayNotAutoStartedConfirmed')],
 ['web source title',web.includes('O Bisturi da Sacerdotisa')],
 ['web fail closed',web.includes('não concede XP localmente')],
 ['mobile source title',mobile.includes('O Bisturi da Sacerdotisa')],
 ['mobile fail closed',mobile.includes('não concede XP')],
 ['mobile route auth gate',route.includes('AtriumGate')],
 ['mobile route feature',route.includes('Day074Mobile')]
];
const failed=checks.filter(([,ok])=>!ok);for(const[name,ok]of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`);if(failed.length){process.exitCode=1}else console.log('DAY074_RUNTIME_GATE=PASS_FAIL_CLOSED');
