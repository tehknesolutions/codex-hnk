import fs from 'node:fs';
const read=(p)=>fs.existsSync(p)?fs.readFileSync(p,'utf8'):'';
const adapter=read('apps/mobile/src/features/journey/mobileJourneyAdapter.ts');
const screen=read('apps/mobile/src/features/journey/JourneyMobileScreen.tsx');
const gate=read('apps/mobile/src/features/journey/JourneyDayGate.tsx');
const checks=[
 ['mobile adapter exists',Boolean(adapter)],
 ['mobile adapter consumes registry',adapter.includes('getJourneySlots')],
 ['mobile adapter consumes chamber',adapter.includes('projectDayChamber')],
 ['mobile adapter consumes navigation',adapter.includes('getJourneyNavigation')],
 ['mobile journey screen exists',Boolean(screen)],
 ['mobile screen exposes dormant slots without route push',/DORMANT|DORMENTE/.test(screen)],
 ['mobile day gate exists',Boolean(gate)],
 ['mobile day gate rejects non-AVAILABLE',gate.includes("status !== 'AVAILABLE'")],
 ['mobile integration does not derive day + 1',!/day\s*\+\s*1|\+\s*1.*day/.test(adapter+screen+gate)],
];
const failed=checks.filter(([,ok])=>!ok);for(const[n,ok]of checks)console.log(`${ok?'PASS':'FAIL'} ${n}`);if(failed.length)process.exit(1);
