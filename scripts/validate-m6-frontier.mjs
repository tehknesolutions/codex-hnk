import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const registry=read('packages/journey-contract/src/registry.ts');
const d73=read('apps/mobile/src/features/chokmah/runtime-definitions/portal073.ts');
const d74=read('apps/mobile/src/features/binah/Day074Mobile.tsx');
const checks=[
 ['registry frontier remains 72',registry.includes('APPROVED_EXECUTABLE_FRONTIER = 72')],
 ['day 073 explicitly production-disabled',d73.includes('PORTAL073_PRODUCTION_ENABLED=false')],
 ['day 073 documents publication gate',/Fail-closed until G7\/G8 publication QA/.test(d73)],
 ['day 074 explicitly blocks authoritative completion',d74.includes('backend autoritativo do Day 074')],
 ['day 074 grants no XP',d74.includes('não concede XP')],
];
let failed=0;for(const[n,ok]of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)failed++}if(failed)process.exit(1);
console.log('PASS M6 frontier: AVAILABLE 001-072; 073-109 remain DORMANT until authoritative publication.');
