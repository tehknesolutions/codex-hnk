import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const readText = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const canon = readJson("canon/core/research-001-symbolic-architecture-v1.json");
const gate = readJson("canon/governance/human-gates/research-001.json");
const approval = readJson("canon/governance/human-gates/research-001-batch-001-approval.json");

const lib = readText("apps/web/lib/research/canon-registry.ts");
const route = readText("apps/web/app/api/research/canon/route.ts");
const page = readText("apps/web/app/research/canon/page.tsx");
const client = readText("apps/web/app/research/canon/CanonRegistryLab.tsx");
const hub = readText("apps/web/app/research/page.tsx");

const issues = [];
const promoted = gate.decisions.filter((decision) => decision.outcome === "PROMOTE_TO_HNK_CANON");
const canonSourceIds = new Set(canon.records.map((record) => record.source_item_id));
const promotedIds = new Set(promoted.map((decision) => decision.source_item_id));

if (canon.status !== "HNK_CANON") issues.push(`unexpected canon status ${canon.status}`);
if (canon.authority !== "HNK_AUTHORED") issues.push(`unexpected canon authority ${canon.authority}`);
if (canon.source_records_preserved !== true) issues.push("source_records_preserved must be true");
if (canon.historical_authority_inherited !== false) issues.push("historical_authority_inherited must be false");
if (approval.status !== "APPROVED_BY_HUMAN") issues.push("Human Gate approval must be APPROVED_BY_HUMAN");
if (approval.machine_can_decide !== false) issues.push("machine_can_decide must remain false");
if (canon.records.length !== 22) issues.push(`expected 22 canonical records, found ${canon.records.length}`);
if (promoted.length !== 22) issues.push(`expected 22 Human Gate promotions, found ${promoted.length}`);
if (canonSourceIds.size !== canon.records.length) issues.push("duplicate source_item_id in canonical records");

for (const id of promotedIds) if (!canonSourceIds.has(id)) issues.push(`promotion missing from registry: ${id}`);
for (const id of canonSourceIds) if (!promotedIds.has(id)) issues.push(`registry record lacks promotion: ${id}`);

const requiredLibTokens = [
  "HNK_AUTHORED",
  "queryCanonRegistry",
  "canonRegistrySummary",
  "validateCanonRegistry",
  "historical_authority_inherited",
];
for (const token of requiredLibTokens) if (!lib.includes(token)) issues.push(`canon registry lib missing ${token}`);

const requiredRouteTokens = [
  "researchLabEnabled",
  "researchLabAuthorized",
  "HNK_CANON_READ_ONLY",
  "validateCanonRegistry",
  "queryCanonRegistry",
];
for (const token of requiredRouteTokens) if (!route.includes(token)) issues.push(`canon API route missing ${token}`);

if (!page.includes("Canon Registry")) issues.push("Canon Registry page title missing");
if (!page.includes("HNK_AUTHORED")) issues.push("Canon Registry page must state HNK_AUTHORED");
if (!client.includes("READ_ONLY") && !client.includes("READ ONLY")) issues.push("Canon Registry client must state read-only access");
if (!client.includes("RESEARCH → HUMAN GATE → CANON")) issues.push("Canon Registry client trace pipeline missing");
if (!hub.includes('href="/research/canon"')) issues.push("Research Lab hub must link Canon Registry");
if (!hub.includes('href="/research/human-gate"')) issues.push("Research Lab hub must link Human Gate");

if (issues.length) {
  console.error("RESEARCH_CANON_REGISTRY_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("RESEARCH_CANON_REGISTRY_V1_PASS");
console.log(JSON.stringify({ canonical_records: canon.records.length, promotions: promoted.length, authority: canon.authority, access: "READ_ONLY" }, null, 2));
