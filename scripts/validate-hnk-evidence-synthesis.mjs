import fs from "node:fs";
import {
  HNK_EVIDENCE_SYNTHESIS_BOUNDARY,
  addSynthesisRegistry,
  createEvidenceSynthesis,
  evidenceSynthesisReport,
  evidenceSynthesisSummary,
  validateEvidenceSynthesis,
} from "@hnk/quest-engine";
import { sha256Canonical } from "@hnk/experiment-attestation";
import { replicationRegistryProjection, validateReplicationRegistry } from "@hnk/replication-registry";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function metricSignature(overrides = {}) {
  const base = {
    metric_id: "M-SCORE",
    metric_type: "SCALE",
    label: "Score",
    unit: "points",
    evidence_source: "SELF_REPORT",
    timepoint: "POST",
    evaluation_criterion: "Compare descriptive CONTROL and EXPERIMENT means only.",
    ...overrides,
  };
  return { ...base, signature_digest: sha256Canonical(base) };
}

function run(runId, experimentId, direction, signatureDigest) {
  const pair =
    direction === "HIGHER" ? [3, 7] :
    direction === "LOWER" ? [7, 3] :
    [5, 5];
  return {
    run_id: runId,
    experiment_id: experimentId,
    ledger_digest: sha256Canonical({ runId, experimentId, direction }),
    added_at: "2026-09-17T21:00:00Z",
    metric_signature_digest: signatureDigest,
    control: { n: 1, aggregate: pair[0] },
    experiment: { n: 1, aggregate: pair[1] },
    direction,
    eligible: true,
    insufficiency_reasons: [],
  };
}

function registry(key, question, directions, signatureOverrides = {}) {
  const signature = metricSignature(signatureOverrides);
  const runs = directions.map((direction, index) =>
    run(`${key}-R${index + 1}`, `${key}-E${index + 1}`, direction, signature.signature_digest)
  );
  const value = {
    registry_id: "HNK_REPLICATION_REGISTRY_V1",
    registry_version: "1.0.0",
    authority: "HNK_AUTHORED_REPLICATION_REGISTRY",
    replication_key: key,
    title: `Registry ${key}`,
    question,
    metric_signature: signature,
    created_at: "2026-09-17T20:00:00Z",
    runs,
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    automatic_truth_inference: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: "REPLICATION_REGISTRY_DESCRIBES_REPEATABILITY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF",
  };
  value.registry_digest = sha256Canonical(replicationRegistryProjection(value));
  const validation = validateReplicationRegistry(value);
  if (!validation.ok) throw new Error(validation.issues.join("; "));
  return value;
}

const higherA = registry("SYN-A", "Question A?", ["HIGHER", "HIGHER"]);
const higherB = registry("SYN-B", "Question B?", ["HIGHER", "HIGHER"]);
const lowerC = registry("SYN-C", "Question C?", ["LOWER", "LOWER"]);

let synthesis = createEvidenceSynthesis({
  synthesis_key: "SYNTHESIS-VALIDATOR",
  title: "Evidence Synthesis validator",
  created_at: "2026-09-17T22:00:00Z",
  seed_source_id: "SRC-A",
  seed_added_at: "2026-09-17T22:01:00Z",
  seed_registry: higherA,
});

let report = evidenceSynthesisReport(synthesis);
if (report.groups[0].status !== "SINGLE_REGISTRY_SIGNAL") issues.push("one replicated registry must be SINGLE_REGISTRY_SIGNAL");

synthesis = addSynthesisRegistry(synthesis, {
  source_id: "SRC-B",
  added_at: "2026-09-17T22:02:00Z",
  registry: higherB,
});
report = evidenceSynthesisReport(synthesis);
if (report.groups[0].status !== "CONVERGENT") issues.push("two same-direction replicated registries must be CONVERGENT");
if (report.groups[0].convergent_direction !== "HIGHER") issues.push("convergent direction must be HIGHER");

synthesis = addSynthesisRegistry(synthesis, {
  source_id: "SRC-C",
  added_at: "2026-09-17T22:03:00Z",
  registry: lowerC,
});
report = evidenceSynthesisReport(synthesis);
if (report.groups[0].status !== "DIVERGENT") issues.push("opposed replicated registries must be DIVERGENT");
if (report.groups[0].convergent_direction !== null) issues.push("DIVERGENT must not expose a convergent direction");

const otherMetric = registry("SYN-D", "Count question?", ["HIGHER", "HIGHER"], {
  metric_id: "M-COUNT",
  metric_type: "COUNT",
  label: "Count",
  unit: "events",
});
synthesis = addSynthesisRegistry(synthesis, {
  source_id: "SRC-D",
  added_at: "2026-09-17T22:04:00Z",
  registry: otherMetric,
});
report = evidenceSynthesisReport(synthesis);
if (report.metric_groups !== 2) issues.push("different metric signatures must remain separate groups");
if (report.truth_assessed !== false) issues.push("Evidence Synthesis must never auto-assess truth");
if (report.inferential_statistics_performed !== false) issues.push("Evidence Synthesis V1 must not perform inferential statistics");
if (report.causal_claim_permitted !== false || report.metaphysical_proof_permitted !== false) {
  issues.push("Evidence Synthesis must not grant causal/metaphysical proof");
}

const validation = validateEvidenceSynthesis(synthesis);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `synthesis validation: ${issue}`));
if (!/^[0-9a-f]{64}$/.test(synthesis.synthesis_digest)) issues.push("synthesis must be SHA-256 bound");
if (new Set(synthesis.registries.map((entry) => entry.replication_key)).size !== synthesis.registries.length) {
  issues.push("replication keys must be unique inside synthesis");
}

const summary = evidenceSynthesisSummary();
if (summary.synthesis_id !== "HNK_EVIDENCE_SYNTHESIS_V1") issues.push("unexpected Evidence Synthesis id");
if (summary.grouping_key !== "EXACT_METRIC_SIGNATURE_DIGEST") issues.push("synthesis grouping rule drift");
if (summary.heterogeneous_metric_signatures_allowed !== true) issues.push("heterogeneous signatures should remain separate and allowed");
if (summary.mixed_and_insufficient_preserved !== true) issues.push("MIXED and INSUFFICIENT preservation required");
if (summary.automatic_truth_inference !== false) issues.push("automatic truth inference must remain disabled");
if (summary.inferential_statistics_performed !== false) issues.push("inferential statistics must remain disabled");
if (summary.claim_boundary !== HNK_EVIDENCE_SYNTHESIS_BOUNDARY) issues.push("Evidence Synthesis boundary drift");

const page = read("apps/web/app/research/synthesis/page.tsx");
const client = read("apps/web/app/research/synthesis/EvidenceSynthesisLab.tsx");
const route = read("apps/web/app/api/research/synthesis/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const questAdapter = read("packages/quest-engine/src/evidence-synthesis.ts");
const docs = read("docs/architecture/HNK_EVIDENCE_SYNTHESIS_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Synthesis page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Synthesis Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Synthesis API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Synthesis API must declare no automatic persistence");
if (!client.includes("createEvidenceSynthesis")) issues.push("Synthesis Lab must create through shared contract");
if (!client.includes("addSynthesisRegistry")) issues.push("Synthesis Lab must add registries through shared contract");
if (!client.includes("evidenceSynthesisReport")) issues.push("Synthesis Lab must expose shared synthesis report");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Synthesis Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/synthesis"')) issues.push("Research hub must link Evidence Synthesis Lab");
if (!hub.includes("EVIDENCE SYNTHESIS")) issues.push("Research pipeline must include Evidence Synthesis stage");
if (!questAdapter.includes('from "@hnk/evidence-synthesis"')) issues.push("Quest Engine must delegate Evidence Synthesis to shared package");
if (!docs.includes("CONVERGENT") || !docs.includes("DIVERGENT") || !docs.includes("truth engine")) issues.push("Evidence Synthesis documentation incomplete");

if (issues.length) {
  console.error("HNK_EVIDENCE_SYNTHESIS_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_EVIDENCE_SYNTHESIS_V1_PASS");
console.log(JSON.stringify({
  synthesis_id: summary.synthesis_id,
  registries: report.total_registries,
  metric_groups: report.metric_groups,
  group_statuses: report.group_status_counts,
  truth_assessed: report.truth_assessed,
  inferential_statistics_performed: report.inferential_statistics_performed,
  causal_claim_permitted: report.causal_claim_permitted,
  metaphysical_proof_permitted: report.metaphysical_proof_permitted,
}, null, 2));
