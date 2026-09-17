import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));

const gate = readJson("canon/governance/human-gates/research-001.json");
const approval = readJson("canon/governance/human-gates/research-001-batch-001-approval.json");
const canon = readJson("canon/core/research-001-symbolic-architecture-v1.json");

const issues = [];
const promoted = gate.decisions.filter((decision) => decision.outcome === "PROMOTE_TO_HNK_CANON");
const promotedIds = new Set(promoted.map((decision) => decision.source_item_id));
const canonIds = new Set(canon.records.map((record) => record.source_item_id));

if (approval.status !== "APPROVED_BY_HUMAN") issues.push("Human Gate batch approval missing");
if (canon.status !== "HNK_CANON") issues.push(`unexpected canon status ${canon.status}`);
if (canon.authority !== "HNK_AUTHORED") issues.push(`canon authority must be HNK_AUTHORED, found ${canon.authority}`);
if (canon.historical_authority_inherited !== false) issues.push("canonical records must not inherit historical authority");
if (canon.source_records_preserved !== true) issues.push("source_records_preserved must be true");
if (canon.approved_by !== approval.approved_by) issues.push("canon approved_by does not match Human Gate approval");
if (canon.approved_at !== approval.approved_at) issues.push("canon approved_at does not match Human Gate approval");
if (promoted.length !== 22) issues.push(`expected 22 Human Gate promotions, found ${promoted.length}`);
if (canon.records.length !== 22) issues.push(`expected 22 canonical records, found ${canon.records.length}`);
if (canonIds.size !== canon.records.length) issues.push("duplicate source_item_id in canonical manifest");

for (const id of promotedIds) if (!canonIds.has(id)) issues.push(`promoted item missing canonical record: ${id}`);
for (const id of canonIds) if (!promotedIds.has(id)) issues.push(`canonical record without Human Gate promotion: ${id}`);

for (const record of canon.records) {
  if (!record.canon_item_id?.trim()) issues.push(`${record.source_item_id}: canon_item_id required`);
  if (!record.name?.trim()) issues.push(`${record.source_item_id}: name required`);
  if (!record.kind?.trim()) issues.push(`${record.source_item_id}: kind required`);
  if (!record.definition?.trim()) issues.push(`${record.source_item_id}: definition required`);
  if (!Array.isArray(record.constraints) || record.constraints.length === 0) issues.push(`${record.source_item_id}: at least one canon constraint required`);
  if (record.version !== "1.0.0") issues.push(`${record.source_item_id}: unexpected canonical version ${record.version}`);
}

if (issues.length) {
  console.error("RESEARCH_001_CANON_PROMOTIONS_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("RESEARCH_001_CANON_PROMOTIONS_PASS");
console.log(JSON.stringify({ promoted: promoted.length, canonical_records: canon.records.length, authority: canon.authority }, null, 2));
