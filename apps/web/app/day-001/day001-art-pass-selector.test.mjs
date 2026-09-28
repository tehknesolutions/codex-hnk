import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('./Day001GoldenV2Web.tsx',import.meta.url),'utf8');
const art=readFileSync(new URL('./day001-art-pass-v2.module.css',import.meta.url),'utf8');
assert.match(source,/data-act=\{step\}/);
for(const act of ['revelacao','jachin','boaz','meio','selo']) assert.match(art,new RegExp(`data-act=['"]${act}['"]`));
console.log('PASS: Golden runtime exposes the step consumed by Art Pass V2.');
