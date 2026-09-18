import fs from "node:fs";
import {
  HNK_CLAIM_REEVALUATION_BATCH_SCANNER_BOUNDARY,
  claimDossierProjection,
  claimReevaluationBatchScannerSummary,
  createClaimReevaluationQueue,
  evidenceSynthesisProjection,
  evidenceSynthesisReport,
  materializeClaimReevaluationBatch,
  reviewedClaimRegistryProjection,
  scanClaimReevaluationBatch,
  validateClaimDossier,
  validateClaimReevaluationBatchScan,
  validateEvidenceSynthesis,
  validateReviewedClaimRegistry,
} from "@hnk/quest-engine";
import { sha256Canonical } from "@hnk/experiment-attestation";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function synthesis(key, sources, label) {
  const signature = sha256Canonical({ key, metric: "M-SCORE" });
  const value = {
    synthesis_id: "HNK_EVIDENCE_SYNTHESIS_V1",
    synthesis_version: "1.0.0",
    authority: "HNK_AUTHORED_EVIDENCE_SYNTHESIS",
    synthesis_key: key,
    title: `Synthesis ${key}`,
    created_at: "2026-09-17T20:00:00Z",
    registries: Array.from({ length: sources }, (_, index) => ({
      source_id: `${key}-SRC-${index + 1}`,
      replication_key: `${key}-REP-${index + 1}`,
      title: `Registry ${index + 1}`,
      question: `${label} question ${index + 1}?`,
      registry_digest: sha256Canonical({ key, index, label }),
      metric_signature_digest: signature,
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

function dossier(claimId, statement, source) {
  const group = evidenceSynthesisReport(source).groups[0];
  const value = {
    dossier_id: "HNK_CLAIM_DOSSIER_V1",
    dossier_version: "1.0.0",
    authority: "HNK_AUTHORED_CLAIM_DOSSIER",
    claim_id: claimId,
    statement,
    scope: "DESCRIPTIVE",
    authored_by: "RESEARCHER",
    created_at: "2026-09-17T21:00:00Z",
    synthesis_binding: {
      synthesis_key: source.synthesis_key,
      synthesis_digest: source.synthesis_digest,
    },
    evidence_links: [{
      link_id: `LINK-${claimId}`,
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

function reviewedRegistry(dossiers) {
  const records = dossiers.map((item, index) => {
    const record = {
      record_id: `REVIEWED-${index + 1}`,
      claim_id: item.claim_id,
      claim_version: 1,
      statement: item.statement,
      scope: item.scope,
      classification: index === 0 ? "HYPOTHESIS" : "DESCRIPTIVE_SUMMARY",
      review_outcome: index === 0 ? "KEEP_AS_HYPOTHESIS" : "ACCEPT_AS_DESCRIPTIVE_SUMMARY",
      dossier_digest: item.dossier_digest,
      review_gate_digest: sha256Canonical({ gate: item.claim_id }),
      synthesis_key: item.synthesis_binding.synthesis_key,
      synthesis_digest: item.synthesis_binding.synthesis_digest,
      reviewer: "TW-DVF",
      reviewed_at: "2026-09-17T21:30:00Z",
      explicit_human_signal: "HUMAN REVIEW",
      review_rationale: "Evidence-scoped review.",
      unresolved_questions: ["Continue monitoring evidence."],
      gaps: [...item.gaps],
      conflicts: [...item.conflicts],
      registered_at: "2026-09-17T21:40:00Z",
      supersedes_record_id: null,
      record_digest: "",
      human_review_derived: true,
      truth_assessed: false,
      canon_status: "NOT_CANON",
      causal_claim_permitted: false,
      metaphysical_proof_permitted: false,
    };
    const projection = { ...record };
    delete projection.record_digest;
    record.record_digest = sha256Canonical(projection);
    return record;
  });

  const registry = {
    registry_id: "HNK_REVIEWED_CLAIM_REGISTRY_V1",
    registry_version: "1.0.0",
    authority: "HNK_AUTHORED_REVIEWED_CLAIM_REGISTRY",
    registry_key: "BATCH-SCANNER-REVIEWED",
    title: "Batch scanner reviewed claims",
    created_at: "2026-09-17T21:40:00Z",
    records,
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

const originalA = synthesis("BATCH-SYNTH-A", 1, "A-original");
const originalB = synthesis("BATCH-SYNTH-B", 1, "B-original");
const dossierA = dossier("BATCH-CLAIM-A", "Claim A.", originalA);
const dossierB = dossier("BATCH-CLAIM-B", "Claim B.", originalB);
const reviewed = reviewedRegistry([dossierA, dossierB]);
const candidateA = synthesis("BATCH-SYNTH-A", 2, "A-expanded");

const scan = scanClaimReevaluationBatch({
  reviewed_registry: reviewed,
  original_dossiers: [dossierA, dossierB],
  candidate_syntheses: [candidateA, originalB],
  scanned_at: "2026-09-17T22:00:00Z",
});

const scanValidation = validateClaimReevaluationBatchScan(scan);
if (!scanValidation.ok) issues.push(...scanValidation.issues.map((issue) => `scan: ${issue}`));
if (scan.active_claims !== 2) issues.push("batch scanner must enumerate all active reviewed claims");
if (scan.status_counts.REVIEW_DUE !== 1) issues.push("changed synthesis must create one REVIEW_DUE");
if (scan.status_counts.CURRENT !== 1) issues.push("unchanged synthesis must remain CURRENT");
if (scan.coverage_complete !== true) issues.push("complete inputs must yield coverage_complete=true");
if (scan.results.some((result) => result.assessment?.machine_changed_classification !== false)) {
  issues.push("batch scanner must never change classifications");
}

const partial = scanClaimReevaluationBatch({
  reviewed_registry: reviewed,
  original_dossiers: [dossierA, dossierB],
  candidate_syntheses: [candidateA],
  scanned_at: "2026-09-17T22:01:00Z",
});
if (partial.coverage_complete !== false) issues.push("missing candidate synthesis must preserve incomplete coverage");
if (partial.status_counts.MISSING_CANDIDATE_SYNTHESIS !== 1) {
  issues.push("missing candidate synthesis must be explicit");
}

let queue = createClaimReevaluationQueue({
  queue_key: "BATCH-SCANNER-QUEUE",
  title: "Batch scanner queue",
  created_at: "2026-09-17T22:00:00Z",
});
const firstMaterialization = materializeClaimReevaluationBatch(queue, {
  reviewed_registry: reviewed,
  original_dossiers: [dossierA, dossierB],
  candidate_syntheses: [candidateA, originalB],
  scanned_at: "2026-09-17T22:00:00Z",
});
queue = firstMaterialization.queue;
if (firstMaterialization.added !== 1 || queue.items.length !== 1) {
  issues.push("batch materialization must add only REVIEW_DUE items");
}
const secondMaterialization = materializeClaimReevaluationBatch(queue, {
  reviewed_registry: reviewed,
  original_dossiers: [dossierA, dossierB],
  candidate_syntheses: [candidateA, originalB],
  scanned_at: "2026-09-17T22:00:00Z",
});
if (secondMaterialization.added !== 0 || secondMaterialization.skipped_existing !== 1) {
  issues.push("batch materialization must be idempotent for existing reviewed-record/candidate pair");
}

const summary = claimReevaluationBatchScannerSummary();
if (summary.scanner_id !== "HNK_CLAIM_REEVALUATION_BATCH_SCANNER_V1") issues.push("unexpected batch scanner id");
if (summary.scope !== "ALL_ACTIVE_REVIEWED_CLAIMS") issues.push("batch scanner scope drift");
if (summary.dossier_match !== "EXACT_DOSSIER_DIGEST") issues.push("dossier matching rule drift");
if (summary.candidate_match !== "EXACT_SYNTHESIS_KEY") issues.push("candidate matching rule drift");
if (summary.machine_can_change_classification !== false || summary.machine_can_decide_review !== false) {
  issues.push("batch scanner machine authority lock drift");
}
if (summary.claim_boundary !== HNK_CLAIM_REEVALUATION_BATCH_SCANNER_BOUNDARY) {
  issues.push("batch scanner boundary drift");
}

const page = read("apps/web/app/research/re-evaluation-batch/page.tsx");
const client = read("apps/web/app/research/re-evaluation-batch/ClaimReevaluationBatchScannerLab.tsx");
const route = read("apps/web/app/api/research/re-evaluation-batch/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/claim-reevaluation-batch-scanner.ts");
const docs = read("docs/architecture/HNK_CLAIM_REEVALUATION_BATCH_SCANNER_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Batch Scanner page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Batch Scanner Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Batch Scanner API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Batch Scanner API must declare no automatic persistence");
if (!client.includes("scanClaimReevaluationBatch")) issues.push("Batch Scanner Lab must scan through shared contract");
if (!client.includes("materializeClaimReevaluationBatch")) issues.push("Batch Scanner Lab must materialize through shared contract");
if (!client.includes("multiple")) issues.push("Batch Scanner Lab must support multi-file dossier/synthesis import");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) {
  issues.push("Batch Scanner Lab must not auto-persist in browser storage");
}
if (!hub.includes('href="/research/re-evaluation-batch"')) issues.push("Research hub must link Batch Scanner");
if (!hub.includes("RE-EVALUATION BATCH SCANNER")) issues.push("Research pipeline must include Batch Scanner");
if (!adapter.includes('from "@hnk/claim-reevaluation-batch-scanner"')) issues.push("Quest Engine must delegate Batch Scanner to shared package");
if (!docs.includes("There is no automatic reclassification")) issues.push("Batch Scanner documentation incomplete");

if (issues.length) {
  console.error("HNK_CLAIM_REEVALUATION_BATCH_SCANNER_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_CLAIM_REEVALUATION_BATCH_SCANNER_V1_PASS");
console.log(JSON.stringify({
  scanner_id: summary.scanner_id,
  active_claims: scan.active_claims,
  status_counts: scan.status_counts,
  coverage_complete: scan.coverage_complete,
  materialized_added: firstMaterialization.added,
  idempotent_skipped_existing: secondMaterialization.skipped_existing,
  machine_changed_classifications: firstMaterialization.machine_changed_classifications,
}, null, 2));
