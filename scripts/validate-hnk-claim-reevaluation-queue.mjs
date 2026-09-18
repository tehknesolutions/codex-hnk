import fs from "node:fs";
import {
  HNK_CLAIM_REEVALUATION_QUEUE_BOUNDARY,
  addClaimReevaluation,
  assessClaimReevaluation,
  claimDossierProjection,
  claimReevaluationQueueIndex,
  claimReevaluationQueueSummary,
  createClaimReevaluationQueue,
  evidenceSynthesisProjection,
  evidenceSynthesisReport,
  reviewedClaimRegistryProjection,
  validateClaimDossier,
  validateClaimReevaluationQueue,
  validateEvidenceSynthesis,
  validateReviewedClaimRegistry,
} from "@hnk/quest-engine";
import { sha256Canonical } from "@hnk/experiment-attestation";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function synthesis(sources) {
  const metric = sha256Canonical({ metric: "M-SCORE", type: "SCALE", unit: "points" });
  const value = {
    synthesis_id: "HNK_EVIDENCE_SYNTHESIS_V1",
    synthesis_version: "1.0.0",
    authority: "HNK_AUTHORED_EVIDENCE_SYNTHESIS",
    synthesis_key: "REEVAL-SYNTHESIS",
    title: "Re-evaluation validator synthesis",
    created_at: "2026-09-17T20:00:00Z",
    registries: Array.from({ length: sources }, (_, index) => ({
      source_id: `SRC-${index + 1}`,
      replication_key: `REP-${index + 1}`,
      title: `Registry ${index + 1}`,
      question: `Question ${index + 1}?`,
      registry_digest: sha256Canonical({ registry: index + 1 }),
      metric_signature_digest: metric,
      metric_id: "M-SCORE",
      metric_label: "Score",
      metric_type: "SCALE",
      unit: "points",
      replication_status: "REPLICATED",
      repeated_direction: "HIGHER",
      total_runs: 2,
      eligible_runs: 2,
      insufficient_runs: 0,
      added_at: `2026-09-17T20:0${index}:00Z`,
    })),
    synthesis_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    automatic_truth_inference: false,
    inferential_statistics_performed: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: "EVIDENCE_SYNTHESIS_MAPS_CONVERGENCE_DIVERGENCE_AND_INSUFFICIENCY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF",
  };
  value.synthesis_digest = sha256Canonical(evidenceSynthesisProjection(value));
  if (!validateEvidenceSynthesis(value).ok) throw new Error("validator synthesis invalid");
  return value;
}

function dossier(source) {
  const group = evidenceSynthesisReport(source).groups[0];
  const value = {
    dossier_id: "HNK_CLAIM_DOSSIER_V1",
    dossier_version: "1.0.0",
    authority: "HNK_AUTHORED_CLAIM_DOSSIER",
    claim_id: "CLAIM-REEVAL-VALIDATOR",
    statement: "The linked score is a descriptive research claim.",
    scope: "DESCRIPTIVE",
    authored_by: "RESEARCHER",
    created_at: "2026-09-17T21:00:00Z",
    synthesis_binding: {
      synthesis_key: source.synthesis_key,
      synthesis_digest: source.synthesis_digest,
    },
    evidence_links: [{
      link_id: "LINK-PRIMARY",
      metric_signature_digest: group.metric_signature_digest,
      metric_id: group.metric_id,
      metric_label: group.metric_label,
      group_status: group.status,
      convergent_direction: group.convergent_direction,
      relation: "CONSISTENT_WITH",
      rationale: "Human-selected relevance.",
      source_questions: group.questions.map((entry) => entry.question),
    }],
    gaps: ["More evidence desirable."],
    conflicts: [],
    notes: [],
    dossier_digest: "",
    human_relevance_classification_required: true,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: "CLAIM_DOSSIER_ORGANIZES_EVIDENCE_RELEVANCE_GAPS_AND_CONFLICTS_NOT_TRUTH_OR_CANON",
  };
  value.dossier_digest = sha256Canonical(claimDossierProjection(value));
  if (!validateClaimDossier(value).ok) throw new Error("validator dossier invalid");
  return value;
}

function reviewedRegistry(sourceDossier) {
  const record = {
    record_id: "REVIEWED-RECORD-1",
    claim_id: sourceDossier.claim_id,
    claim_version: 1,
    statement: sourceDossier.statement,
    scope: sourceDossier.scope,
    classification: "HYPOTHESIS",
    review_outcome: "KEEP_AS_HYPOTHESIS",
    dossier_digest: sourceDossier.dossier_digest,
    review_gate_digest: sha256Canonical({ gate: 1 }),
    synthesis_key: sourceDossier.synthesis_binding.synthesis_key,
    synthesis_digest: sourceDossier.synthesis_binding.synthesis_digest,
    reviewer: "TW-DVF",
    reviewed_at: "2026-09-17T21:30:00Z",
    explicit_human_signal: "KEEP AS HYPOTHESIS",
    review_rationale: "Evidence remains hypothesis-scoped.",
    unresolved_questions: ["Future evidence may change."],
    gaps: [...sourceDossier.gaps],
    conflicts: [],
    registered_at: "2026-09-17T21:40:00Z",
    supersedes_record_id: null,
    record_digest: "",
    human_review_derived: true,
    truth_assessed: false,
    canon_status: "NOT_CANON",
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
  };
  const recordProjection = { ...record };
  delete recordProjection.record_digest;
  record.record_digest = sha256Canonical(recordProjection);

  const registry = {
    registry_id: "HNK_REVIEWED_CLAIM_REGISTRY_V1",
    registry_version: "1.0.0",
    authority: "HNK_AUTHORED_REVIEWED_CLAIM_REGISTRY",
    registry_key: "REVIEWED-CLAIMS",
    title: "Reviewed claims",
    created_at: "2026-09-17T21:40:00Z",
    records: [record],
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    machine_can_decide_review: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: "REVIEWED_CLAIM_REGISTRY_INDEXES_HUMAN_REVIEW_CLASSIFICATIONS_NOT_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON",
  };
  registry.registry_digest = sha256Canonical(reviewedClaimRegistryProjection(registry));
  if (!validateReviewedClaimRegistry(registry).ok) throw new Error("validator reviewed registry invalid");
  return registry;
}

const original = synthesis(1);
const candidate = synthesis(2);
const originalDossier = dossier(original);
const reviewed = reviewedRegistry(originalDossier);

const current = assessClaimReevaluation({
  reviewed_registry: reviewed,
  claim_id: originalDossier.claim_id,
  original_dossier: originalDossier,
  candidate_synthesis: original,
});
if (current.review_due !== false || current.next_workflow !== "NONE") {
  issues.push("unchanged synthesis must not create REVIEW_DUE");
}

const assessment = assessClaimReevaluation({
  reviewed_registry: reviewed,
  claim_id: originalDossier.claim_id,
  original_dossier: originalDossier,
  candidate_synthesis: candidate,
});
if (assessment.review_due !== true) issues.push("changed synthesis digest must create review_due");
if (assessment.previous_classification !== "HYPOTHESIS") issues.push("previous classification must remain visible");
if (assessment.machine_changed_classification !== false) issues.push("machine must not change classification");
if (assessment.machine_can_resolve !== false) issues.push("machine must not resolve re-evaluation");
if (!assessment.reasons.includes("SYNTHESIS_SNAPSHOT_CHANGED")) issues.push("snapshot change reason required");
if (!assessment.reasons.includes("LINKED_GROUP_STATUS_CHANGED")) issues.push("linked group status change should be detected");
if (assessment.next_workflow !== "CREATE_NEW_CLAIM_DOSSIER_AND_HUMAN_REVIEW") issues.push("unexpected next workflow");

let queue = createClaimReevaluationQueue({
  queue_key: "REEVAL-VALIDATOR",
  title: "Re-evaluation validator",
  created_at: "2026-09-17T22:00:00Z",
});
queue = addClaimReevaluation(queue, {
  item_id: "ITEM-1",
  detected_at: "2026-09-17T22:01:00Z",
  reviewed_registry: reviewed,
  claim_id: originalDossier.claim_id,
  original_dossier: originalDossier,
  candidate_synthesis: candidate,
});

const validation = validateClaimReevaluationQueue(queue);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `queue: ${issue}`));
const index = claimReevaluationQueueIndex(queue);
if (index.review_due !== 1 || index.claim_ids !== 1) issues.push("queue index counts incorrect");
if (index.classifications_changed_by_machine !== false) issues.push("queue index machine classification lock drift");
if (index.truth_assessed !== false || index.canon_promotion_permitted !== false) {
  issues.push("queue must not assess truth or permit canon promotion");
}

const summary = claimReevaluationQueueSummary();
if (summary.queue_id !== "HNK_CLAIM_REEVALUATION_QUEUE_V1") issues.push("unexpected queue id");
if (summary.trigger !== "SAME_SYNTHESIS_KEY_WITH_CHANGED_SYNTHESIS_DIGEST") issues.push("queue trigger drift");
if (summary.machine_can_change_classification !== false || summary.machine_can_decide_review !== false) {
  issues.push("machine authority lock drift");
}
if (summary.claim_boundary !== HNK_CLAIM_REEVALUATION_QUEUE_BOUNDARY) issues.push("queue boundary drift");

const page = read("apps/web/app/research/re-evaluations/page.tsx");
const client = read("apps/web/app/research/re-evaluations/ClaimReevaluationQueueLab.tsx");
const route = read("apps/web/app/api/research/re-evaluations/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/claim-reevaluation-queue.ts");
const docs = read("docs/architecture/HNK_CLAIM_REEVALUATION_QUEUE_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Re-evaluation page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Re-evaluation Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Re-evaluation API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Re-evaluation API must declare no automatic persistence");
if (!client.includes("assessClaimReevaluation")) issues.push("Re-evaluation Lab must assess through shared contract");
if (!client.includes("addClaimReevaluation")) issues.push("Re-evaluation Lab must add through shared contract");
if (!client.includes("MACHINE_CHANGED=false")) issues.push("UI must display machine classification lock");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Re-evaluation Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/re-evaluations"')) issues.push("Research hub must link Re-evaluation Queue");
if (!hub.includes("CLAIM RE-EVALUATION QUEUE")) issues.push("Research pipeline must include Claim Re-evaluation Queue");
if (!adapter.includes('from "@hnk/claim-reevaluation-queue"')) issues.push("Quest Engine must delegate queue to shared package");
if (!docs.includes("There is no automatic claim reclassification")) issues.push("Re-evaluation documentation incomplete");

if (issues.length) {
  console.error("HNK_CLAIM_REEVALUATION_QUEUE_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_CLAIM_REEVALUATION_QUEUE_V1_PASS");
console.log(JSON.stringify({
  queue_id: summary.queue_id,
  review_due: index.review_due,
  reasons: index.reason_counts,
  previous_classification: assessment.previous_classification,
  machine_changed_classification: assessment.machine_changed_classification,
  machine_can_resolve: assessment.machine_can_resolve,
  truth_assessed: index.truth_assessed,
  canon_promotion_permitted: index.canon_promotion_permitted,
}, null, 2));
