import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const tree = read('../packages/visual-contract/src/tree.ts');

assert.match(tree, /export interface HnkDayRoute/, 'HnkDayRoute contract must exist');
assert.match(tree, /export function getExecutableDays\(levelId: HnkTreeLevelId\)/, 'getExecutableDays(levelId) must exist');
assert.match(tree, /keter:\s*\[1,\s*36\]/, 'KETHER must expose 001–036');
assert.match(tree, /chokhmah:\s*\[37,\s*72\]/, 'CHOKHMAH must expose 037–072');
assert.doesNotMatch(tree, /href:\s*["']\/day-073["']/, 'Day 073 must never be executable');

const mapPath = new URL('../apps/web/app/_components/LivingBookMap.tsx', import.meta.url);
assert.ok(fs.existsSync(mapPath), 'LivingBookMap.tsx must exist');
const map = fs.readFileSync(mapPath, 'utf8');
assert.match(map, /^['"]use client['"];?/m, 'LivingBookMap must be a client component');
assert.match(map, /hnkTreeNodes/, 'LivingBookMap must consume shared tree nodes');
assert.match(map, /getExecutableDays/, 'LivingBookMap must derive Days from the shared contract');
assert.match(map, /aria-pressed/, 'sphere selection must expose accessible selected state');
assert.match(map, /Abrir Day/, 'Day links must have explicit accessible labels');
assert.doesNotMatch(map, /\/day-073/, 'LivingBookMap must not manufacture Day 073');

const book = read('../apps/web/app/_components/LivingBook.tsx');
assert.match(book, /import \{ LivingBookMap \} from ['"]\.\/LivingBookMap['"];/,
  'RED: LivingBook must import LivingBookMap');
assert.match(book, /id:'mapa'[\s\S]*?<LivingBookMap\s*\/>/,
  'RED: MAPA spread must host LivingBookMap');

console.log('PASS: Living Book map contract, progressive component, and MAPA integration are present.');
