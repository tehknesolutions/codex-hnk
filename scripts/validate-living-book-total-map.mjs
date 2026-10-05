import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const map = read('../apps/web/app/_components/LivingBookMap.tsx');

assert.match(map, /export interface LivingBookMapProps/, 'RED: LivingBookMapProps must exist');
assert.match(map, /selectedLevelId:\s*HnkTreeLevelId\s*\|\s*null/, 'RED: selectedLevelId must be controlled');
assert.match(map, /onSelectLevel:\s*\(levelId:\s*HnkTreeLevelId\)\s*=>\s*void/, 'RED: onSelectLevel callback must be controlled');
assert.doesNotMatch(map, /useState\s*<\s*HnkTreeLevelId/, 'RED: LivingBookMap must not own sphere selection state');
assert.match(map, /getExecutableDays\(selectedLevelId\)/, 'progressive Days must remain derived from shared contract');
assert.doesNotMatch(map, /\/day-073/, 'M4 must not manufacture Day 073');

console.log('PASS: M4 controlled progressive-map contract is present.');
