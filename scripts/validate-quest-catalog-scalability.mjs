import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const loadJson=(relative)=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const read=(relative)=>fs.readFileSync(path.join(root,relative),'utf8');
const fail=(message)=>{console.error(`QUEST CATALOG FAIL: ${message}`);process.exitCode=1};

const expectedDays=[1,2,3,4,5,6,7,8,9,10,11,12];
const definitions=expectedDays.map(day=>loadJson(`docs/experience/kether/day-${String(day).padStart(3,'0')}/day-${String(day).padStart(3,'0')}.quest.json`));
const registry=read('packages/quest-engine/src/registry.ts');
const catalog=read('packages/quest-engine/src/catalog.ts');
const library=read('packages/quest-library/src/library.ts');
const types=read('packages/quest-engine/src/types.ts');

const days=new Set();const ids=new Set();
for(const definition of definitions){
 if(definition.kind!=='hnk.quest_definition')fail(`${definition.id}: invalid quest kind`);
 if(!Number.isInteger(definition.day)||definition.day<1||definition.day>365)fail(`${definition.id}: invalid day`);
 if(days.has(definition.day))fail(`duplicate day ${definition.day}`);if(ids.has(definition.id))fail(`duplicate quest id ${definition.id}`);
 days.add(definition.day);ids.add(definition.id);
}
if([...days].sort((a,b)=>a-b).join(',')!==expectedDays.join(','))fail('Day 001-012 catalog coverage drift');
for(const day of expectedDays){
 const importToken=`day${String(day).padStart(3,'0')}QuestJson`;
 if(!library.includes(importToken))fail(`quest-library missing import Day ${day}`);
 const entry=new RegExp(`\\[${day}\\s*,\\s*\\{\\s*day\\s*:\\s*${day}`);
 if(!entry.test(library))fail(`quest-library missing map entry Day ${day}`);
}
if(!registry.includes('resolveDay(day: number)'))fail('QuestRegistry.resolveDay missing');
if(!registry.includes('register(definition: QuestDefinition)'))fail('QuestRegistry.register missing');
if(!catalog.includes('loader.loadDay(day)'))fail('QuestCatalog does not use generic loader path');
if(!catalog.includes('this.registry.register(loaded)'))fail('QuestCatalog does not cache loaded definitions in registry');
if(!catalog.includes('async getDay(day: number)'))fail('QuestCatalog.getDay missing');
if(/HNK-KETHER-D0(?:0[1-9]|1[0-2])/.test(registry+catalog))fail('engine registry/catalog hardcodes Day 001-012 ids');
if(/day\s*===\s*(?:[1-9]|1[0-2])/.test(registry+catalog))fail('engine registry/catalog contains day-specific branching');

const supported=[...types.matchAll(/\| \"([A-Z_]+)\"/g)].map(match=>match[1]);
const supportedSet=new Set(supported);
for(const definition of definitions){for(const phase of definition.phases??[]){if(!supportedSet.has(phase.type))fail(`engine type union does not cover ${phase.type} for Day ${definition.day}`)}}

if(!process.exitCode)console.log('QUEST CATALOG PASS: Days 001-012 resolve through one generic registry/catalog; engine phase types cover every configured phase; no day-specific engine branch');
