import fs from 'node:fs';
import assert from 'node:assert/strict';

const treePath = new URL('../packages/visual-contract/src/tree.ts', import.meta.url);
const source = fs.readFileSync(treePath, 'utf8');

assert.match(source, /export interface HnkDayRoute/,
  'RED: HnkDayRoute contract must exist');
assert.match(source, /export function getExecutableDays\(levelId: HnkTreeLevelId\)/,
  'RED: getExecutableDays(levelId) must exist');
assert.match(source, /001/);
assert.match(source, /036/);
assert.match(source, /037/);
assert.match(source, /072/);
assert.doesNotMatch(source, /href:\s*["']\/day-073["']/,
  'Day 073 must never be executable');

console.log('PASS: Living Book executable journey contract is present.');
