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

const knowledgeTree = read('../apps/web/app/_components/KnowledgeTree.tsx');
assert.match(knowledgeTree, /hnkTreeLevels/, 'KnowledgeTree must consume shared level metadata');
assert.match(knowledgeTree, /\.dayRange/, 'KnowledgeTree must derive displayed ranges from shared level metadata');
assert.doesNotMatch(knowledgeTree, /const\s+ranges\s*:/, 'KnowledgeTree must not maintain a duplicate ranges table');

const portalHome = read('../apps/web/app/_components/PortalHome.tsx');
assert.match(portalHome, /hnkTreeLevels/, 'PortalHome must consume shared level metadata');
assert.match(portalHome, /hnkTreeNodes/, 'PortalHome must consume shared executable nodes');
assert.doesNotMatch(portalHome, /\/day-07[34]/, 'PortalHome must not manufacture Day 073/074 routes');
assert.doesNotMatch(portalHome, /037[—-]073|074[—-]109/, 'PortalHome must not duplicate stale ranges');

const book = read('../apps/web/app/_components/LivingBook.tsx');
assert.match(book, /import \{ LivingBookMap \} from ['"]\.\/LivingBookMap['"];/, 'LivingBook must import LivingBookMap');
assert.match(book, /id:'mapa'[\s\S]*?<LivingBookMap\s*\/>/, 'MAPA spread must host LivingBookMap');

const layout = read('../apps/web/app/layout.tsx');
assert.match(layout, /\.\/_components\/living-book-map\.css/, 'root layout must load the map visual extension');
const css = read('../apps/web/app/_components/living-book-map.css');
assert.match(css, /\.living-book-map\b/, 'LivingBookMap visual layer must exist');
assert.match(css, /\.living-book-map__levels\b/, 'sphere controls need a visual layout');
assert.match(css, /\.living-book-map__days\b/, 'progressive Day choices need a visual layout');
assert.match(css, /\[data-state=dormant\]/, 'dormant state must be visually explicit');
assert.match(css, /\[aria-pressed=true\]/, 'selected sphere must have a visible state');
assert.match(css, /:focus-visible/, 'map controls need keyboard focus treatment');
assert.match(css, /prefers-reduced-motion:reduce/, 'map must respect reduced motion');

console.log('PASS: Living Book map contract, shared portal/tree truth, progressive MAPA integration, and visual states are present.');
