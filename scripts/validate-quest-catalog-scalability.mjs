import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const loadJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const fail = (message) => { console.error(`QUEST CATALOG FAIL: ${message}`); process.exitCode = 1; };

const definitions = [1,2,3,4,5,6,7].map((day) => loadJson(`docs/experience/kether/day-${String(day).padStart(3,'0')}/day-${String(day).padStart(3,'0')}.quest.json`));
const d1Renderer = loadJson('docs/experience/kether/day-001/day-001.renderer-profile.json');
const d2Renderer = loadJson('docs/experience/kether/day-002/day-002.renderer-profile.json');
const registry = read('packages/quest-engine/src/registry.ts');
const catalog = read('packages/quest-engine/src/catalog.ts');
const library = read('packages/quest-library/src/library.ts');

const days = new Set();
const ids = new Set();
for (const definition of definitions) {
  if (definition.kind !== 'hnk.quest_definition') fail(`${definition.id}: invalid quest kind`);
  if (!Number.isInteger(definition.day) || definition.day < 1 || definition.day > 365) fail(`${definition.id}: invalid day`);
  if (days.has(definition.day)) fail(`duplicate day ${definition.day}`);
  if (ids.has(definition.id)) fail(`duplicate quest id ${definition.id}`);
  days.add(definition.day); ids.add(definition.id);
}
if ([...days].sort((a,b)=>a-b).join(',') !== '1,2,3,4,5,6,7') fail('Day 001-007 catalog coverage drift');
for (const day of days) {
  const token = `[${day}, { day: ${day}`;
  if (!library.includes(token)) fail(`quest-library missing Day ${day}`);
}
if (!registry.includes('resolveDay(day: number)')) fail('QuestRegistry.resolveDay missing');
if (!registry.includes('register(definition: QuestDefinition)')) fail('QuestRegistry.register missing');
if (!catalog.includes('loader.loadDay(day)')) fail('QuestCatalog does not use generic loader path');
if (!catalog.includes('this.registry.register(loaded)')) fail('QuestCatalog does not cache loaded definitions in registry');
if (!catalog.includes('async getDay(day: number)')) fail('QuestCatalog.getDay missing');
if (/HNK-KETHER-D00[1-7]/.test(registry + catalog)) fail('engine registry/catalog hardcodes Day 001-007 ids');
if (/day\s*===\s*[1-7]/.test(registry + catalog)) fail('engine registry/catalog contains day-specific branching');

const d1=definitions[0], d2=definitions[1];
const rendererTypes = new Set(Object.keys(d1Renderer.phase_renderers ?? {}));
for (const definition of definitions) {
  for (const phase of definition.phases ?? []) if (!rendererTypes.has(phase.type)) fail(`renderer V1 does not cover ${phase.type} for Day ${definition.day}`);
}
if (d2Renderer.renderer_contract !== d1Renderer.renderer_contract) fail('Day 002 renderer contract differs from Day 001');
if (d2.scalability_proof?.new_renderer_required !== false) fail('Day 002 claims a new renderer');
if ((d2.scalability_proof?.new_phase_types ?? []).length !== 0) fail('Day 002 introduces new phase types');

if (!process.exitCode) console.log('QUEST CATALOG PASS: Days 001-007 resolve through one generic registry/catalog; no day-specific engine branch');
