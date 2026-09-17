import { readFile } from 'node:fs/promises';

const FILES = [
  'canon/references/research-001-kabbalah-hermetica/catalog.json',
  'canon/references/research-001-kabbalah-hermetica/comparative-pass-004/catalog.json',
];

const DECISIONS = new Set(['CORE', 'REFERENCE', 'CANDIDATE', 'RESEARCH_ONLY', 'EXCLUDE_OPERATIONALLY']);
const VALUES = new Set(['LOW', 'MEDIUM', 'HIGH']);

function fail(message) {
  console.error(`RESEARCH_DECISION_LAYER_FAIL: ${message}`);
  process.exit(1);
}

const catalogs = await Promise.all(FILES.map(async (file) => JSON.parse(await readFile(file, 'utf8'))));
const ids = new Set();
const items = catalogs.flatMap((catalog) => {
  if (catalog.protocol !== 'CODEX_ADMISSION_PROTOCOL_V1') fail(`${catalog.catalog_id}: protocol mismatch`);
  if (catalog.canon_import !== 'NONE_AUTOMATIC') fail(`${catalog.catalog_id}: canon_import must be NONE_AUTOMATIC`);
  return catalog.items ?? [];
});

if (items.length !== 84) fail(`expected 84 Research 001 admission items, got ${items.length}`);

for (const item of items) {
  if (ids.has(item.id)) fail(`duplicate item id ${item.id}`);
  ids.add(item.id);
  if (!DECISIONS.has(item.primary_decision)) fail(`${item.id}: invalid decision ${item.primary_decision}`);
  if (!VALUES.has(item.hnk_value)) fail(`${item.id}: invalid hnk_value ${item.hnk_value}`);
  if (!item.admission_reason?.trim()) fail(`${item.id}: admission_reason required`);
  if (!item.risk_or_limit?.trim()) fail(`${item.id}: risk_or_limit required`);
  if (item.classification === 'HNK_CANON' && item.primary_decision !== 'CORE') {
    fail(`${item.id}: HNK_CANON requires CORE`);
  }
}

const candidates = items.filter((item) => item.primary_decision === 'CANDIDATE').length;
const excluded = items.filter((item) => item.primary_decision === 'EXCLUDE_OPERATIONALLY').length;
const core = items.filter((item) => item.primary_decision === 'CORE').length;

console.log(`RESEARCH_DECISION_LAYER_PASS items=${items.length} core=${core} candidates=${candidates} excluded=${excluded} canon_import=NONE_AUTOMATIC`);
