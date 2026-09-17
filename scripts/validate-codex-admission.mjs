import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve('canon/references');
const DECISIONS = new Set(['CORE', 'REFERENCE', 'CANDIDATE', 'RESEARCH_ONLY', 'EXCLUDE_OPERATIONALLY']);
const VALUES = new Set(['LOW', 'MEDIUM', 'HIGH']);
const CLASSIFICATIONS = new Set([
  'SOURCE_FACT',
  'SOURCE_DOCTRINE',
  'SOURCE_CORRESPONDENCE',
  'SOURCE_INTERPRETATION',
  'UNVERIFIED_SOURCE_CLAIM',
  'SOURCE_REFERENCE',
  'OUR_STRUCTURAL_INFERENCE',
  'HNK_GOVERNANCE',
  'HNK_REFERENCE',
  'HNK_CANDIDATE',
  'HNK_CANON',
]);

const REQUIRED = [
  'id',
  'name',
  'description',
  'source_basis',
  'historical_layer',
  'classification',
  'primary_decision',
  'hnk_value',
  'admission_reason',
  'risk_or_limit',
  'provenance_status',
  'version',
];

async function findCatalogs(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await findCatalogs(full));
    if (entry.isFile() && entry.name === 'catalog.json') out.push(full);
  }
  return out;
}

function fail(errors, file, message) {
  errors.push(`${path.relative(process.cwd(), file)}: ${message}`);
}

function validateItem(errors, file, item, ids) {
  for (const field of REQUIRED) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      fail(errors, file, `${item.id ?? '<unknown>'} missing required field: ${field}`);
    }
  }

  if (typeof item.id === 'string' && !/^HNK-R\d{3}-\d{3}$/.test(item.id)) {
    fail(errors, file, `${item.id} has invalid id format`);
  }

  if (ids.has(item.id)) fail(errors, file, `duplicate id: ${item.id}`);
  ids.add(item.id);

  if (!DECISIONS.has(item.primary_decision)) {
    fail(errors, file, `${item.id} invalid primary_decision: ${item.primary_decision}`);
  }
  if (!VALUES.has(item.hnk_value)) {
    fail(errors, file, `${item.id} invalid hnk_value: ${item.hnk_value}`);
  }
  if (!CLASSIFICATIONS.has(item.classification)) {
    fail(errors, file, `${item.id} invalid classification: ${item.classification}`);
  }
  if (typeof item.version === 'string' && !/^\d+\.\d+\.\d+$/.test(item.version)) {
    fail(errors, file, `${item.id} version must be semantic x.y.z`);
  }

  if (item.classification === 'HNK_CANON' && item.primary_decision !== 'CORE') {
    fail(errors, file, `${item.id} HNK_CANON classification requires CORE decision`);
  }

  if (['CANDIDATE', 'RESEARCH_ONLY', 'EXCLUDE_OPERATIONALLY'].includes(item.primary_decision) && item.classification === 'HNK_CANON') {
    fail(errors, file, `${item.id} cannot be HNK_CANON while decision is ${item.primary_decision}`);
  }
}

async function main() {
  const catalogs = await findCatalogs(ROOT);
  if (catalogs.length === 0) throw new Error('No admission catalog.json files found under canon/references');

  const errors = [];
  const ids = new Set();
  let itemCount = 0;

  for (const file of catalogs) {
    let catalog;
    try {
      catalog = JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      fail(errors, file, `invalid JSON: ${error.message}`);
      continue;
    }

    if (catalog.canon_import !== 'NONE_AUTOMATIC') {
      fail(errors, file, 'catalog must declare canon_import = NONE_AUTOMATIC');
    }
    if (!Array.isArray(catalog.items) || catalog.items.length === 0) {
      fail(errors, file, 'catalog.items must be a non-empty array');
      continue;
    }

    for (const item of catalog.items) {
      itemCount += 1;
      validateItem(errors, file, item, ids);
    }
  }

  if (errors.length) {
    console.error(`CODEX_ADMISSION_VALIDATION_FAIL (${errors.length})`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`CODEX_ADMISSION_VALIDATION_PASS catalogs=${catalogs.length} items=${itemCount}`);
}

main().catch((error) => {
  console.error(`CODEX_ADMISSION_VALIDATION_ERROR: ${error.stack ?? error.message}`);
  process.exit(1);
});
