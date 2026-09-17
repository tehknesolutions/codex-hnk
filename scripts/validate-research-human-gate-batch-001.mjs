import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));

const research = readJson("canon/references/research-001-kabbalah-hermetica/catalog.json");
const comparative = readJson("canon/references/research-001-kabbalah-hermetica/comparative-pass-004/catalog.json");
const gate = readJson("canon/governance/human-gates/research-001.json");
const batch = readJson("canon/governance/human-gates/research-001-batch-001.json");

const issues = [];
const candidateItems = [...research.items, ...comparative.items].filter((item) => item.primary_decision === "CANDIDATE");
const candidateIds = new Set(candidateItems.map((item) => item.id));
const batchIds = new Set(batch.items.map((item) => item.source_item_id));

if (batch.protocol !== "HNK_HUMAN_GATE_PROTOCOL_V1") issues.push(`unexpected batch protocol: ${batch.protocol}`);
if (batch.status !== "PROPOSED_AWAITING_HUMAN_APPROVAL") issues.push(`unexpected batch status: ${batch.status}`);
if (batch.recommendation_authority !== "NON_BINDING_MACHINE_RECOMMENDATION") issues.push("batch authority must remain NON_BINDING_MACHINE_RECOMMENDATION");
if (batch.canon_import !== "NONE") issues.push("batch canon_import must remain NONE");
if (batch.machine_can_decide !== false) issues.push("batch machine_can_decide must remain false");
if (batch.explicit_human_approval_required !== true) issues.push("batch explicit_human_approval_required must remain true");
if (gate.decisions.length !== 0) issues.push("Research 001 Human Gate registry must still have zero explicit decisions before batch approval");
if (candidateItems.length !== 38) issues.push(`expected 38 candidates, found ${candidateItems.length}`);
if (batch.items.length !== candidateItems.length) issues.push(`batch must cover every candidate: expected ${candidateItems.length}, found ${batch.items.length}`);

for (const id of candidateIds) if (!batchIds.has(id)) issues.push(`candidate missing from batch: ${id}`);
for (const id of batchIds) if (!candidateIds.has(id)) issues.push(`non-candidate present in batch: ${id}`);
if (batchIds.size !== batch.items.length) issues.push("duplicate source_item_id in batch");

const allowed = new Set([
  "PROMOTE_TO_HNK_CANON",
  "KEEP_AS_CANDIDATE",
  "RECLASSIFY_AS_REFERENCE",
  "MOVE_TO_RESEARCH_ONLY",
  "EXCLUDE_OPERATIONALLY",
]);

for (const item of batch.items) {
  if (!allowed.has(item.recommendation)) issues.push(`${item.source_item_id}: invalid recommendation ${item.recommendation}`);
  if (item.authority !== "NON_BINDING_MACHINE_RECOMMENDATION") issues.push(`${item.source_item_id}: recommendation authority drift`);
  if (item.human_gate_status !== "AWAITING_EXPLICIT_HUMAN_APPROVAL") issues.push(`${item.source_item_id}: Human Gate status drift`);
  if (!item.rationale?.trim()) issues.push(`${item.source_item_id}: rationale required`);
  if (!Array.isArray(item.constraints) || item.constraints.length === 0) issues.push(`${item.source_item_id}: at least one constraint required`);
}

const calculated = Object.fromEntries([...allowed].map((recommendation) => [
  recommendation,
  batch.items.filter((item) => item.recommendation === recommendation).length,
]));
for (const [key, value] of Object.entries(batch.summary ?? {})) {
  if (calculated[key] !== value) issues.push(`summary mismatch for ${key}: declared ${value}, calculated ${calculated[key]}`);
}
if (calculated.PROMOTE_TO_HNK_CANON !== 22) issues.push(`expected 22 promote recommendations, found ${calculated.PROMOTE_TO_HNK_CANON}`);
if (calculated.KEEP_AS_CANDIDATE !== 11) issues.push(`expected 11 keep recommendations, found ${calculated.KEEP_AS_CANDIDATE}`);
if (calculated.RECLASSIFY_AS_REFERENCE !== 5) issues.push(`expected 5 reference recommendations, found ${calculated.RECLASSIFY_AS_REFERENCE}`);
if (calculated.MOVE_TO_RESEARCH_ONLY !== 0) issues.push("batch 001 unexpectedly recommends MOVE_TO_RESEARCH_ONLY");
if (calculated.EXCLUDE_OPERATIONALLY !== 0) issues.push("batch 001 unexpectedly recommends EXCLUDE_OPERATIONALLY");

if (issues.length) {
  console.error("RESEARCH_001_HUMAN_GATE_BATCH_001_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("RESEARCH_001_HUMAN_GATE_BATCH_001_PASS");
console.log(JSON.stringify({ candidates: candidateItems.length, recommendations: calculated }, null, 2));
