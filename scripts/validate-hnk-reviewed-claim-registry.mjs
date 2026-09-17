import fs from "node:fs";
import {
  HNK_REVIEWED_CLAIM_REGISTRY_BOUNDARY,
  addReviewedClaim,
  applyHumanEvidenceReview,
  claimDossierProjection,
  createEvidenceReviewGate,
  createReviewedClaimRegistry,
  queryReviewedClaimRegistry,
  reviewedClaimRegistryIndex,
  reviewedClaimRegistrySummary,
  validateClaimDossier,
  validateReviewedClaimRegistry,
  verifyReviewedClaimRecord,
} from "@hnk/quest-engine";
import { sha256Canonical } from "@hnk/experiment-attestation";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function dossier(claimId, statement, createdAt) {
  const value = {
    dossier_id: "HNK_CLAIM_DOSSIER_V1",
    dossier_version: "1.0.0",
    authority: "HNK_AUTHORED_CLAIM_DOSSIER",
    claim_id: claimId,
    statement,
    scope: "DESCRIPTIVE",
    authored_by: "HUMAN-RESEARCHER",
    created_at: createdAt,
    synthesis_binding: {
      synthesis_key: "REVIEWED-CLAIM-SYNTHESIS",
      synthesis_digest: sha256Canonical({ claimId, statement, synthesis: true }),
    },
    evidence_links: [{
      link_id: `LINK-${claimId}-${createdAt}`,
      metric_signature_digest: sha256Canonical({ metric: "M-SCORE" }),
      metric_id: "M-SCORE",
      metric_label: "Score",
      group_status: "CONVERGENT",
      convergent_direction: "HIGHER",
      relation: "CONSISTENT_WITH",
      rationale: "The synthesis group is descriptively convergent.",
      source_questions: ["Does the descriptive direction repeat?"],
    }],
    gaps: ["Additional independent evidence remains desirable."],
    conflicts: [],
    notes: ["No causal interpretation."],
    dossier_digest: "",
    human_relevance_classification_required: true,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: "CLAIM_DOSSIER_ORGANIZES_EVIDENCE_RELEVANCE_GAPS_AND_CONFLICTS_NOT_TRUTH_OR_CANON",
  };
  value.dossier_digest = sha256Canonical(claimDossierProjection(value));
  const validation = validateClaimDossier(value);
  if (!validation.ok) throw new Error(validation.issues.join("; "));
  return value;
}

function reviewedGate(claim, outcome, suffix) {
  let gate = createEvidenceReviewGate(claim, {
    opened_at: `2026-09-${suffix === "A" ? "17" : "18"}T21:00:00Z`,
  });
  gate = applyHumanEvidenceReview(gate, claim, {
    outcome,
    reviewer: "TW-DVF",
    reviewed_at: `2026-09-${suffix === "A" ? "17" : "18"}T21:10:00Z`,
    explicit_human_signal: `HUMAN REVIEW ${suffix}`,
    rationale: `Reviewed classification ${suffix} remains evidence-scoped.`,
    unresolved_questions: ["Continue independent replication."],
  });
  return gate;
}

const firstDossier = dossier(
  "CLAIM-REVIEWED-001",
  "Version one remains a hypothesis.",
  "2026-09-17T20:00:00Z",
);
const firstGate = reviewedGate(firstDossier, "KEEP_AS_HYPOTHESIS", "A");

let registry = createReviewedClaimRegistry({
  registry_key: "HNK-REVIEWED-CLAIMS-VALIDATOR",
  title: "Reviewed Claims validator",
  created_at: "2026-09-17T22:00:00Z",
});

registry = addReviewedClaim(registry, {
  record_id: "RECORD-V1",
  registered_at: "2026-09-17T22:01:00Z",
  dossier: firstDossier,
  review_gate: firstGate,
});

if (registry.records[0].classification !== "HYPOTHESIS") {
  issues.push("KEEP_AS_HYPOTHESIS must map to HYPOTHESIS");
}
if (!verifyReviewedClaimRecord(registry.records[0], firstDossier, firstGate).ok) {
  issues.push("reviewed claim record must verify against exact dossier/gate");
}

const secondDossier = dossier(
  "CLAIM-REVIEWED-001",
  "Version two is accepted only as a descriptive summary.",
  "2026-09-18T20:00:00Z",
);
const secondGate = reviewedGate(secondDossier, "ACCEPT_AS_DESCRIPTIVE_SUMMARY", "B");

let missingSupersessionRejected = false;
try {
  addReviewedClaim(registry, {
    record_id: "RECORD-V2-BAD",
    registered_at: "2026-09-18T22:01:00Z",
    dossier: secondDossier,
    review_gate: secondGate,
  });
} catch {
  missingSupersessionRejected = true;
}
if (!missingSupersessionRejected) {
  issues.push("same claim_id must require explicit supersedes_record_id");
}

registry = addReviewedClaim(registry, {
  record_id: "RECORD-V2",
  registered_at: "2026-09-18T22:01:00Z",
  dossier: secondDossier,
  review_gate: secondGate,
  supersedes_record_id: "RECORD-V1",
});

const validation = validateReviewedClaimRegistry(registry);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `registry: ${issue}`));

const index = reviewedClaimRegistryIndex(registry);
if (index.total_records !== 2) issues.push("reviewed claim history must retain both versions");
if (index.active_claims !== 1 || index.claim_ids !== 1) issues.push("versioned lineage must expose one active claim");
if (index.active_classification_counts.DESCRIPTIVE_SUMMARY !== 1) {
  issues.push("active reviewed classification must reflect newest human review");
}
if (index.classification_counts.HYPOTHESIS !== 1) {
  issues.push("superseded HYPOTHESIS must remain in history");
}

const active = queryReviewedClaimRegistry(registry, { claim_id: "CLAIM-REVIEWED-001" });
if (active.length !== 1 || active[0].record_id !== "RECORD-V2") {
  issues.push("default reviewed claim query must return active version only");
}
const history = queryReviewedClaimRegistry(registry, {
  claim_id: "CLAIM-REVIEWED-001",
  active_only: false,
});
if (history.length !== 2) issues.push("history query must expose superseded versions");

if (index.truth_assessed !== false || index.canon_promotion_permitted !== false) {
  issues.push("Reviewed Claim Registry must not infer truth or permit canon promotion");
}
if (registry.records.some((record) => record.canon_status !== "NOT_CANON")) {
  issues.push("all reviewed claim records must remain NOT_CANON");
}

const summary = reviewedClaimRegistrySummary();
if (summary.registry_id !== "HNK_REVIEWED_CLAIM_REGISTRY_V1") issues.push("unexpected Reviewed Claim Registry id");
if (summary.reviewed_gate_required !== true || summary.human_decision_required !== true) {
  issues.push("reviewed human gate requirements must remain enabled");
}
if (summary.non_destructive_history !== true) issues.push("non-destructive history must remain enabled");
if (summary.automatic_canon_promotion !== false || summary.canon_promotion_permitted !== false) {
  issues.push("automatic canon promotion must remain disabled");
}
if (summary.claim_boundary !== HNK_REVIEWED_CLAIM_REGISTRY_BOUNDARY) {
  issues.push("Reviewed Claim Registry boundary drift");
}

const page = read("apps/web/app/research/reviewed-claims/page.tsx");
const client = read("apps/web/app/research/reviewed-claims/ReviewedClaimRegistryLab.tsx");
const route = read("apps/web/app/api/research/reviewed-claims/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const questAdapter = read("packages/quest-engine/src/reviewed-claim-registry.ts");
const docs = read("docs/architecture/HNK_REVIEWED_CLAIM_REGISTRY_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Reviewed Claim Registry page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Reviewed Claim Registry Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Reviewed Claim Registry API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Reviewed Claim Registry API must declare no automatic persistence");
if (!client.includes("addReviewedClaim")) issues.push("Reviewed Claim Registry Lab must register through shared contract");
if (!client.includes("queryReviewedClaimRegistry")) issues.push("Reviewed Claim Registry Lab must use shared query contract");
if (!client.includes("Supersede explicitamente")) issues.push("UI must require explicit supersession for evolved claims");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Reviewed Claim Registry Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/reviewed-claims"')) issues.push("Research hub must link Reviewed Claim Registry");
if (!hub.includes("REVIEWED CLAIM REGISTRY")) issues.push("Research pipeline must include Reviewed Claim Registry stage");
if (!questAdapter.includes('from "@hnk/reviewed-claim-registry"')) issues.push("Quest Engine must delegate Reviewed Claim Registry to shared package");
if (!docs.includes("There is intentionally **no automatic arrow from Reviewed Claim Registry to HNK_CANON**")) {
  issues.push("Reviewed Claim Registry documentation must preserve no-auto-canon boundary");
}

if (issues.length) {
  console.error("HNK_REVIEWED_CLAIM_REGISTRY_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_REVIEWED_CLAIM_REGISTRY_V1_PASS");
console.log(JSON.stringify({
  registry_id: summary.registry_id,
  records: index.total_records,
  active_claims: index.active_claims,
  historical_claim_versions: index.total_records - index.active_claims,
  active_classification_counts: index.active_classification_counts,
  truth_assessed: index.truth_assessed,
  canon_promotion_permitted: index.canon_promotion_permitted,
}, null, 2));
