import fs from "node:fs";
import {
  HNK_CLAIM_DOSSIER_BOUNDARY,
  HNK_EVIDENCE_REVIEW_GATE_BOUNDARY,
  addSynthesisRegistry,
  applyHumanEvidenceReview,
  assessClaimDossier,
  claimDossierSummary,
  createClaimDossier,
  createEvidenceReviewGate,
  createEvidenceSynthesis,
  evidenceReviewGateSummary,
  evidenceSynthesisReport,
  validateClaimDossier,
  validateEvidenceReviewGate,
  verifyClaimDossierAgainstSynthesis,
  verifyEvidenceReviewGate,
} from "@hnk/quest-engine";
import { sha256Canonical } from "@hnk/experiment-attestation";
import { replicationRegistryProjection, validateReplicationRegistry } from "@hnk/replication-registry";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function signature() {
  const base = {
    metric_id: "M-SCORE",
    metric_type: "SCALE",
    label: "Score",
    unit: "points",
    evidence_source: "SELF_REPORT",
    timepoint: "POST",
    evaluation_criterion: "Descriptive direction only.",
  };
  return { ...base, signature_digest: sha256Canonical(base) };
}

function registry(key, direction) {
  const metric = signature();
  const pair = direction === "HIGHER" ? [3, 7] : [7, 3];
  const value = {
    registry_id: "HNK_REPLICATION_REGISTRY_V1",
    registry_version: "1.0.0",
    authority: "HNK_AUTHORED_REPLICATION_REGISTRY",
    replication_key: key,
    title: `Registry ${key}`,
    question: `Does ${key} repeat descriptively?`,
    metric_signature: metric,
    created_at: "2026-09-17T19:00:00Z",
    runs: [1, 2].map((n) => ({
      run_id: `${key}-R${n}`,
      experiment_id: `${key}-E${n}`,
      ledger_digest: sha256Canonical({ key, n }),
      added_at: "2026-09-17T19:10:00Z",
      metric_signature_digest: metric.signature_digest,
      control: { n: 1, aggregate: pair[0] },
      experiment: { n: 1, aggregate: pair[1] },
      direction,
      eligible: true,
      insufficiency_reasons: [],
    })),
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

let synthesis = createEvidenceSynthesis({
  synthesis_key: "CLAIM-VALIDATOR-SYNTHESIS",
  title: "Claim validator synthesis",
  created_at: "2026-09-17T20:00:00Z",
  seed_source_id: "SRC-A",
  seed_added_at: "2026-09-17T20:01:00Z",
  seed_registry: registry("CLAIM-A", "HIGHER"),
});
synthesis = addSynthesisRegistry(synthesis, {
  source_id: "SRC-B",
  added_at: "2026-09-17T20:02:00Z",
  registry: registry("CLAIM-B", "HIGHER"),
});

const group = evidenceSynthesisReport(synthesis).groups[0];
if (group.status !== "CONVERGENT") issues.push("validator synthesis must be CONVERGENT");

const dossier = createClaimDossier({
  claim_id: "CLAIM-VALIDATOR",
  statement: "The linked score is descriptively higher across the convergent synthesis group.",
  scope: "DESCRIPTIVE",
  authored_by: "HUMAN-RESEARCHER",
  created_at: "2026-09-17T21:00:00Z",
  synthesis,
  evidence_links: [{
    link_id: "LINK-VALIDATOR",
    metric_signature_digest: group.metric_signature_digest,
    relation: "CONSISTENT_WITH",
    rationale: "The linked synthesis group is CONVERGENT in the HIGHER direction.",
  }],
  gaps: ["Only two replication registries are represented."],
  conflicts: [],
  notes: ["No causal interpretation."],
});

const dossierValidation = validateClaimDossier(dossier);
if (!dossierValidation.ok) issues.push(...dossierValidation.issues.map((issue) => `dossier: ${issue}`));
if (!verifyClaimDossierAgainstSynthesis(dossier, synthesis).ok) issues.push("dossier must verify against exact synthesis snapshot");

const assessment = assessClaimDossier(dossier);
if (assessment.ready_for_human_review !== true) issues.push("valid dossier should be ready for human review");
if (assessment.truth_assessed !== false) issues.push("dossier must never auto-assess truth");
if (assessment.canon_promotion_permitted !== false) issues.push("dossier must not permit canon promotion");

let gate = createEvidenceReviewGate(dossier, {
  opened_at: "2026-09-17T21:10:00Z",
});
if (gate.status !== "PENDING_HUMAN_REVIEW") issues.push("new review gate must be pending");
if (gate.machine_can_decide !== false) issues.push("machine_can_decide must remain false");
if (gate.review !== null) issues.push("pending review gate must not contain a review");
if (!verifyEvidenceReviewGate(gate, dossier).ok) issues.push("review gate must bind exact dossier digest");

gate = applyHumanEvidenceReview(gate, dossier, {
  outcome: "ACCEPT_AS_DESCRIPTIVE_SUMMARY",
  reviewer: "TW-DVF",
  reviewed_at: "2026-09-17T21:15:00Z",
  explicit_human_signal: "APPROVED FOR DESCRIPTIVE USE",
  rationale: "The claim wording remains within the descriptive scope of the linked synthesis.",
  unresolved_questions: ["More independent replication registries remain desirable."],
});

const gateValidation = validateEvidenceReviewGate(gate);
if (!gateValidation.ok) issues.push(...gateValidation.issues.map((issue) => `gate: ${issue}`));
if (gate.status !== "REVIEWED" || gate.review?.human_decision !== true) issues.push("explicit human review must produce REVIEWED/human_decision=true");
if (gate.canon_promotion_permitted !== false || gate.automatic_canon_promotion !== false) issues.push("review gate must never auto-promote to canon");
if (gate.causal_claim_permitted !== false || gate.metaphysical_proof_permitted !== false) issues.push("review gate must not grant causal/metaphysical proof");

const dossierSummary = claimDossierSummary();
const gateSummary = evidenceReviewGateSummary();
if (dossierSummary.claim_boundary !== HNK_CLAIM_DOSSIER_BOUNDARY) issues.push("Claim Dossier boundary drift");
if (dossierSummary.human_relevance_classification_required !== true) issues.push("human relevance classification must remain required");
if (dossierSummary.automatic_canon_promotion !== false) issues.push("Claim Dossier automatic canon promotion must remain disabled");
if (gateSummary.claim_boundary !== HNK_EVIDENCE_REVIEW_GATE_BOUNDARY) issues.push("Evidence Review Gate boundary drift");
if (gateSummary.explicit_human_signal_required !== true || gateSummary.human_decision_required !== true) issues.push("explicit human review requirements must remain enabled");
if (gateSummary.machine_can_decide !== false) issues.push("Evidence Review Gate machine authority drift");

const page = read("apps/web/app/research/claims/page.tsx");
const client = read("apps/web/app/research/claims/ClaimDossierLab.tsx");
const route = read("apps/web/app/api/research/claims/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const claimAdapter = read("packages/quest-engine/src/claim-dossier.ts");
const reviewAdapter = read("packages/quest-engine/src/evidence-review-gate.ts");
const docs = read("docs/architecture/HNK_CLAIM_DOSSIER_EVIDENCE_REVIEW_GATE_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Claim Review page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Claim Review Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Claim Review API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Claim Review API must declare no automatic persistence");
if (!client.includes("createClaimDossier")) issues.push("Claim Review Lab must create dossier through shared contract");
if (!client.includes("createEvidenceReviewGate")) issues.push("Claim Review Lab must open shared human review gate");
if (!client.includes("applyHumanEvidenceReview")) issues.push("Claim Review Lab must record human decision through shared contract");
if (!client.includes("Sinal humano explícito")) issues.push("Claim Review UI must require explicit human signal");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Claim Review Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/claims"')) issues.push("Research hub must link Claim Dossier & Review Gate");
if (!hub.includes("CLAIM DOSSIER")) issues.push("Research pipeline must include Claim Dossier stage");
if (!hub.includes("EVIDENCE REVIEW GATE")) issues.push("Research pipeline must include Evidence Review Gate stage");
if (!claimAdapter.includes('from "@hnk/claim-dossier"')) issues.push("Quest Engine must delegate Claim Dossier to shared package");
if (!reviewAdapter.includes('from "@hnk/evidence-review-gate"')) issues.push("Quest Engine must delegate Evidence Review Gate to shared package");
if (!docs.includes("machine_can_decide = false") || !docs.includes("No path from this layer automatically reaches HNK_CANON")) issues.push("Claim Review documentation incomplete");

if (issues.length) {
  console.error("HNK_CLAIM_DOSSIER_EVIDENCE_REVIEW_GATE_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_CLAIM_DOSSIER_EVIDENCE_REVIEW_GATE_V1_PASS");
console.log(JSON.stringify({
  dossier_id: dossierSummary.dossier_id,
  claim_id: dossier.claim_id,
  linked_groups: assessment.linked_groups,
  review_status: gate.status,
  review_outcome: gate.review.outcome,
  human_decision: gate.review.human_decision,
  machine_can_decide: gate.machine_can_decide,
  canon_promotion_permitted: gate.canon_promotion_permitted,
  causal_claim_permitted: gate.causal_claim_permitted,
  metaphysical_proof_permitted: gate.metaphysical_proof_permitted,
}, null, 2));
