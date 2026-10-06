import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const tree = read('../packages/visual-contract/src/tree.ts');
const map = read('../apps/web/app/_components/LivingBookMap.tsx');
const total = read('../apps/web/app/_components/LivingBookTotalMap.tsx');
const book = read('../apps/web/app/_components/LivingBook.tsx');
const css = read('../apps/web/app/_components/living-book-map.css');
const portal = read('../apps/web/app/_components/PortalHome.tsx');
const knowledge = read('../apps/web/app/_components/KnowledgeTree.tsx');

// Canonical authority / fail-closed boundary.
assert.match(tree, /export function getExecutableDays\(levelId: HnkTreeLevelId\)/, 'tree.ts must remain executable-Day authority');
assert.match(tree, /keter:\s*\[1,\s*36\]/, 'KETHER must remain 001–036');
assert.match(tree, /chokhmah:\s*\[37,\s*72\]/, 'CHOKHMAH must remain 037–072');
assert.doesNotMatch(tree, /binah:\s*\[73\s*,/, 'BINAH must not acquire an executable range');
assert.doesNotMatch(tree, /href:\s*["']\/day-073["']/, 'tree authority must not manufacture Day 073');

// Progressive map is controlled and derives real chamber links from tree.ts.
assert.match(map, /export interface LivingBookMapProps/, 'LivingBookMapProps must exist');
assert.match(map, /selectedLevelId:\s*HnkTreeLevelId\s*\|\s*null/, 'selectedLevelId must be controlled');
assert.match(map, /onSelectLevel:\s*\(levelId:\s*HnkTreeLevelId\)\s*=>\s*void/, 'onSelectLevel callback must be controlled');
assert.doesNotMatch(map, /useState\s*<\s*HnkTreeLevelId/, 'LivingBookMap must not own sphere selection state');
assert.match(map, /getExecutableDays\(selectedLevelId\)/, 'progressive Days must remain derived from shared contract');
assert.match(map, /Abrir Day/, 'M3 chamber links must remain accessible');
assert.doesNotMatch(map, /\/day-073/, 'progressive map must not manufacture Day 073');
assert.doesNotMatch(map, /const\s+(?:ranges|dayRanges|routes)\s*=/, 'progressive map must not duplicate structural/routing tables');

// Total map is semantic orientation only, never route authority.
assert.match(total, /export interface LivingBookTotalMapProps/, 'LivingBookTotalMapProps must exist');
assert.match(total, /selectedLevelId:\s*HnkTreeLevelId\s*\|\s*null/, 'total map must consume controlled selection');
assert.match(total, /onSelectLevel:\s*\(levelId:\s*HnkTreeLevelId\)\s*=>\s*void/, 'total map must emit shared selection');
assert.match(total, /hnkTreeLevels/, 'total map must consume shared level metadata');
assert.match(total, /hnkTreeNodes/, 'total map must consume shared node metadata');
assert.match(total, /aria-pressed=/, 'total-map sphere selection must be programmatic');
assert.match(total, /aria-hidden=["']true["']/, 'structural connectors must be decorative');
assert.doesNotMatch(total, /href=/, 'total map must not own chamber navigation');
assert.doesNotMatch(total, /\/day-\d+/, 'total map must not generate Day URLs');
assert.doesNotMatch(total, /const\s+(?:ranges|dayRanges|routes)\s*=/, 'total map must not duplicate structural/routing tables');

// MAPA owns exactly one HnkTree selection and passes it to both scales.
assert.match(book, /function LivingBookMapa\(\)/, 'MAPA must have a focused state host');
const selectionStates = book.match(/useState\s*<\s*HnkTreeLevelId\s*\|\s*null\s*>/g) ?? [];
assert.equal(selectionStates.length, 1, 'MAPA must own exactly one HnkTreeLevelId selection state');
assert.match(book, /<LivingBookTotalMap\s+selectedLevelId=\{selectedLevelId\}\s+onSelectLevel=\{setSelectedLevelId\}/, 'total map must receive the shared selection');
assert.match(book, /<LivingBookMap\s+selectedLevelId=\{selectedLevelId\}\s+onSelectLevel=\{setSelectedLevelId\}/, 'progressive map must receive the same selection');

// Existing cross-surfaces must stay on shared structural truth.
assert.match(portal, /hnkTreeLevels/, 'PortalHome must consume shared level metadata');
assert.match(portal, /hnkTreeNodes/, 'PortalHome must consume shared node metadata');
assert.doesNotMatch(portal, /\/day-07[3-9]/, 'PortalHome must not reintroduce future executable routes');
assert.match(knowledge, /hnkTreeLevels/, 'KnowledgeTree must consume shared level metadata');
assert.match(knowledge, /\.dayRange/, 'KnowledgeTree must derive displayed ranges from shared metadata');
assert.doesNotMatch(knowledge, /const\s+ranges\s*:/, 'KnowledgeTree must not duplicate range authority');

// M4 visual/accessibility contract extends the existing M3 layer.
assert.match(css, /\.living-book-total-map\b/, 'total map visual root must exist');
assert.match(css, /\.living-book-total-map__node\b/, 'total-map node visual contract must exist');
assert.match(css, /\.living-book-total-map__connector\b/, 'connector visual contract must exist');
assert.match(css, /\.living-book-total-map__node\[aria-pressed=true\]/, 'selected total-map node must have explicit visual state');
assert.match(css, /\.living-book-total-map__node\[data-state=dormant\]/, 'dormant total-map state must be explicit');
assert.match(css, /\.living-book-total-map__node:focus-visible/, 'total-map controls need keyboard focus treatment');
assert.match(css, /@media\(max-width:760px\)/, 'total map must have compact mobile behavior');
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/, 'total map must respect reduced motion');

console.log('PASS: M4 Total Map shares one selection model, preserves M3 descent, consumes canonical tree metadata, fails closed at Day 072, and exposes responsive accessible visual states.');
