import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('./Day001GoldenV2Web.tsx',import.meta.url),'utf8');
assert.match(source,/step==='kether'\?'revelacao':step==='middle'\?'meio':step==='seal'\?'selo':step/);
console.log('PASS: runtime step names normalize to canonical Art Pass act selectors.');
