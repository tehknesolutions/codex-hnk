import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./Day001VisualContractLayer.tsx', import.meta.url), 'utf8');
const golden = readFileSync(new URL('./Day001GoldenV2Web.tsx', import.meta.url), 'utf8');

assert.match(golden, /firstSpark=\{Boolean\(sealed\?\.first_completion\)\}/);
assert.match(source, /firstSpark = false/);
assert.match(source, /data-first-spark=\{firstSpark\}/);
assert.match(source, /data-lit=\{firstSpark && index === day001TreeField\.geometry\.ketherNodeIndex\}/);
assert.doesNotMatch(source, /useState.*firstSpark/);

console.log('PASS: Day 001 First Spark visual state has one authoritative runtime source.');
