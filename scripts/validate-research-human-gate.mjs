import { readFile } from 'node:fs/promises';

const CATALOGS = [
  'canon/references/research-001-kabbalah-hermetica/catalog.json',
  'canon/references/research-001-kabbalah-hermetica/comparative-pass-004/catalog.json',
];
const REGISTRY_FILE = 'canon/governance/human-gates/research-001.json';
const OUTCOMES = new Set([
  'PROMOTE_TO_HNK_CANON',
  'KEEP_AS_CANDIDATE',
  'RECLASSIFY_AS_REFERENCE',
  'MOVE_TO_RESEARCH_ONLY',
  'EXCLUDE_OPERATIONALLY',
]);

function fail(errors, message) {
  errors.push(message);
}

const catalogs = await Promise.all(CATALOGS.map(async (file) => JSON.parse(await readFile(file, 'utf8'))));
const registry = JSON.parse(await readFile(REGISTRY_FILE, 'utf8'));
const items = catalogs.flatMap((catalog) => catalog.items ?? []);
const itemById = new Map(items.map((item) => [item.id, item]));
const candidates = items.filter((item) => item.primary_decision === 'CANDIDATE');
const errors = [];

if (registry.protocol !== 'HNK_HUMAN_GATE_PROTOCOL_V1') fail(errors, 'unexpected Human Gate protocol');
if (registry.canon_import !== 'EXPLICIT_HUMAN_APPROVAL_ONLY') fail(errors, 'canon_import must be EXPLICIT_HUMAN_APPROVAL_ONLY');
if (registry.machine_autopromotion !== false) fail(errors, 'machine_autopromotion must remain false');
if (registry.non_destructive_history !== true) fail(errors, 'non_destructive_history must remain true');
if (!Array.isArray(registry.decisions)) fail(errors, 'decisions must be an array');
if (candidates.length === 0) fail(errors, 'Research 001 must expose at least one CANDIDATE for Human Gate review');

const gateIds = new Set();
const sourceIds = new Set();
for (const decision of registry.decisions ?? []) {
  const required = ['gate_id', 'source_item_id', 'outcome', 'approved_by', 'approved_at', 'rationale', 'source_item_version', 'resulting_status'];
  for (const field of required) {
    if (typeof decision[field] !== 'string' || decision[field].trim().length === 0) {
      fail(errors, `${decision.gate_id ?? '<unknown>'}: missing ${field}`);
    }
  }

  if (gateIds.has(decision.gate_id)) fail(errors, `duplicate gate_id: ${decision.gate_id}`);
  gateIds.add(decision.gate_id);

  if (sourceIds.has(decision.source_item_id)) fail(errors, `duplicate active Human Gate decision for ${decision.source_item_id}`);
  sourceIds.add(decision.source_item_id);

  if (!OUTCOMES.has(decision.outcome)) fail(errors, `${decision.gate_id}: invalid outcome ${decision.outcome}`);

  const item = itemById.get(decision.source_item_id);
  if (!item) {
    fail(errors, `${decision.gate_id}: unknown source_item_id ${decision.source_item_id}`);
    continue;
  }
  if (item.primary_decision !== 'CANDIDATE') fail(errors, `${decision.gate_id}: source item is not a CANDIDATE`);
  if (decision.source_item_version !== item.version) fail(errors, `${decision.gate_id}: source_item_version mismatch for ${item.id}`);

  if (decision.outcome === 'PROMOTE_TO_HNK_CANON' && decision.resulting_status !== 'HNK_CANON') {
    fail(errors, `${decision.gate_id}: canon promotion must result in HNK_CANON`);
  }
}

if (errors.length) {
  console.error(`RESEARCH_HUMAN_GATE_VALIDATION_FAIL (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const decided = new Set((registry.decisions ?? []).map((decision) => decision.source_item_id));
const pending = candidates.filter((item) => !decided.has(item.id));
console.log(`RESEARCH_HUMAN_GATE_VALIDATION_PASS candidates=${candidates.length} decisions=${registry.decisions.length} pending=${pending.length} machine_autopromotion=false`);
