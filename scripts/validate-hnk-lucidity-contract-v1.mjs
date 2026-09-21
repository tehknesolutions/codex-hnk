import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schema = JSON.parse(fs.readFileSync(path.join(root, "packages/lucidity-contract/lucidity-record-v1.schema.json"), "utf8"));
const fixture = JSON.parse(fs.readFileSync(path.join(root, "packages/lucidity-contract/examples/unresolved-hypothesis.json"), "utf8"));

const fail = (m) => { console.error("HNK_LUCIDITY_CONTRACT_FAIL:", m); process.exit(1); };
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const unique = (xs) => new Set(xs).size === xs.length;
const dateTime = (v) => typeof v === "string" && !Number.isNaN(Date.parse(v));

function validateRecord(r) {
  if (!isObject(r)) fail("record must be object");
  const allowedRoot = new Set(Object.keys(schema.properties));
  for (const k of Object.keys(r)) if (!allowedRoot.has(k)) fail("unknown root property " + k);
  for (const k of schema.required) if (!(k in r)) fail("missing required field " + k);
  if (typeof r.id !== "string" || !r.id.length) fail("invalid id");
  if (typeof r.statement !== "string" || !r.statement.length) fail("invalid statement");
  if (!schema.properties.kind.enum.includes(r.kind)) fail("invalid kind");
  if (!schema.properties.status.enum.includes(r.status)) fail("invalid status");

  const p = r.provenance;
  if (!isObject(p)) fail("provenance must be object");
  const pAllowed = new Set(["origin","author","enteredBy","recordedAt","sourceRefs"]);
  for (const k of Object.keys(p)) if (!pAllowed.has(k)) fail("unknown provenance property " + k);
  for (const k of ["origin","author","enteredBy","recordedAt"]) if (!(k in p)) fail("missing provenance." + k);
  for (const k of ["origin","author","enteredBy"]) if (typeof p[k] !== "string" || !p[k].length) fail("invalid provenance." + k);
  if (!dateTime(p.recordedAt)) fail("invalid provenance.recordedAt");
  if (p.sourceRefs !== undefined && (!Array.isArray(p.sourceRefs) || !p.sourceRefs.every(x => typeof x === "string") || !unique(p.sourceRefs))) fail("invalid provenance.sourceRefs");

  const e = r.epistemic;
  if (!isObject(e)) fail("epistemic must be object");
  const eAllowed = new Set(["belief","doubt","proofScope","evidenceRefs","alternativeHypotheses","wouldChangeConclusion"]);
  for (const k of Object.keys(e)) if (!eAllowed.has(k)) fail("unknown epistemic property " + k);
  for (const k of ["belief","doubt","proofScope"]) if (!(k in e)) fail("missing epistemic." + k);
  if (typeof e.belief !== "string" || !e.belief.length) fail("invalid epistemic.belief");
  if (typeof e.doubt !== "string" || !e.doubt.length) fail("invalid epistemic.doubt");
  if (!schema.properties.epistemic.properties.proofScope.enum.includes(e.proofScope)) fail("invalid proofScope");
  for (const k of ["evidenceRefs","alternativeHypotheses"]) if (e[k] !== undefined && (!Array.isArray(e[k]) || !e[k].every(x => typeof x === "string") || !unique(e[k]))) fail("invalid epistemic." + k);

  const a = r.audit;
  if (!isObject(a)) fail("audit must be object");
  const aAllowed = new Set(["createdAt","updatedAt","version","supersedes"]);
  for (const k of Object.keys(a)) if (!aAllowed.has(k)) fail("unknown audit property " + k);
  for (const k of ["createdAt","version"]) if (!(k in a)) fail("missing audit." + k);
  if (!dateTime(a.createdAt)) fail("invalid audit.createdAt");
  if (a.updatedAt !== undefined && a.updatedAt !== null && !dateTime(a.updatedAt)) fail("invalid audit.updatedAt");
  if (!Number.isInteger(a.version) || a.version < 1) fail("invalid audit.version");

  if (r.status === "HNK_APPROVED" && r.authority?.approvedBy !== "TW") fail("HNK_APPROVED requires authority.approvedBy=TW");
  if (r.status === "SUPERSEDED" && (typeof a.supersedes !== "string" || !a.supersedes.length)) fail("SUPERSEDED requires non-empty audit.supersedes");
  if (r.kind === "CANON" && !["HNK_APPROVED","SUPERSEDED"].includes(r.status)) fail("CANON requires HNK_APPROVED or SUPERSEDED");
}

validateRecord(fixture);

const negatives = [
  { name: "missing recordedAt", mutate: r => { delete r.provenance.recordedAt; } },
  { name: "empty belief", mutate: r => { r.epistemic.belief = ""; } },
  { name: "unknown property", mutate: r => { r.unexpected = true; } },
  { name: "non-integer audit.version", mutate: r => { r.audit.version = "1"; } },
  { name: "approval without TW", mutate: r => { r.status="HNK_APPROVED"; r.authority={approvedBy:null}; } },
  { name: "superseded without predecessor", mutate: r => { r.status="SUPERSEDED"; r.audit.supersedes=null; } }
];

for (const t of negatives) {
  const copy = structuredClone(fixture);
  t.mutate(copy);
  let rejected = false;
  const oldExit = process.exit;
  const oldError = console.error;
  process.exit = () => { throw new Error("__EXPECTED_REJECTION__"); };
  console.error = () => {};
  try { validateRecord(copy); } catch (err) { if (err.message === "__EXPECTED_REJECTION__") rejected = true; else throw err; }
  finally { process.exit = oldExit; console.error = oldError; }
  if (!rejected) fail("negative vector accepted: " + t.name);
}

console.log("HNK_LUCIDITY_CONTRACT_PASS");
console.log(JSON.stringify({schema:"HNK-LUCIDITY-RECORD-V1",fixture:fixture.id,negativeVectors:negatives.length,status:"PASS"}, null, 2));
