import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schemaPath = path.join(root, "packages/lucidity-contract/lucidity-record-v1.schema.json");
const fixturePath = path.join(root, "packages/lucidity-contract/examples/unresolved-hypothesis.json");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const record = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

const fail = (message) => {
  console.error("HNK_LUCIDITY_CONTRACT_FAIL:", message);
  process.exit(1);
};

for (const key of schema.required) {
  if (!(key in record)) fail("missing required field " + key);
}

const kinds = new Set(schema.properties.kind.enum);
const statuses = new Set(schema.properties.status.enum);
const scopes = new Set(schema.properties.epistemic.properties.proofScope.enum);

if (!kinds.has(record.kind)) fail("invalid kind");
if (!statuses.has(record.status)) fail("invalid status");
if (!scopes.has(record.epistemic.proofScope)) fail("invalid proofScope");
if (!record.provenance.origin || !record.provenance.author || !record.provenance.enteredBy) fail("provenance identity incomplete");
if (!record.audit.version || record.audit.version < 1) fail("audit version invalid");

if (record.status === "HNK_APPROVED" && record.authority?.approvedBy !== "TW") {
  fail("HNK_APPROVED requires explicit TW approval in V1");
}

if (record.status === "SUPERSEDED" && !record.audit?.supersedes) {
  fail("SUPERSEDED requires audit.supersedes");
}

if (record.kind === "CANON" && record.status !== "HNK_APPROVED" && record.status !== "SUPERSEDED") {
  fail("CANON kind requires HNK_APPROVED or SUPERSEDED status");
}

console.log("HNK_LUCIDITY_CONTRACT_PASS");
console.log(JSON.stringify({
  schema: "HNK-LUCIDITY-RECORD-V1",
  fixture: record.id,
  kind: record.kind,
  status: record.status,
  proofScope: record.epistemic.proofScope
}, null, 2));
