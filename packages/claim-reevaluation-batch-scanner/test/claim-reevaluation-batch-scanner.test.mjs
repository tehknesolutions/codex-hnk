import test from "node:test";
import assert from "node:assert/strict";
import {
  materializeClaimReevaluationBatch,
  parseClaimReevaluationBatchScan,
  scanClaimReevaluationBatch,
  serializeClaimReevaluationBatchScan,
  validateClaimReevaluationBatchScan,
} from "../src/index.mjs";
import {
  claimDossierProjection,
  validateClaimDossier,
} from "@hnk/claim-dossier";
import {
  createClaimReevaluationQueue,
} from "@hnk/claim-reevaluation-queue";
import {
  evidenceSynthesisProjection,
  evidenceSynthesisReport,
  validateEvidenceSynthesis,
} from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  reviewedClaimRegistryProjection,
  validateReviewedClaimRegistry,
} from "@hnk/reviewed-claim-registry";

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
  assert.equal(validateEvidenceSynthesis(value).ok, true);
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
    gaps: ["More evidence remains desirable."],
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
  assert.equal(validateClaimDossier(value).ok, true);
  return value;
}

function reviewedRegistry(dossiers) {
  const records = dossiers.map((item, index) => {
    const record = {
      record_id: `REC-${index + 1}`,
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
      review_rationale: "Evidence-scoped human review.",
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
    const projected = { ...record };
    delete projected.record_digest;
    record.record_digest = sha256Canonical(projected);
    return record;
  });

  const registry = {
    registry_id: "HNK_REVIEWED_CLAIM_REGISTRY_V1",
    registry_version: "1.0.0",
    authority: "HNK_AUTHORED_REVIEWED_CLAIM_REGISTRY",
    registry_key: "BATCH-REVIEWED-CLAIMS",
    title: "Batch reviewed claims",
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
  assert.equal(validateReviewedClaimRegistry(registry).ok, true);
  return registry;
}

function fixture() {
  const originalA = synthesis("SYNTH-A", 1, "A-original");
  const originalB = synthesis("SYNTH-B", 1, "B-original");
  const dossierA = dossier("CLAIM-A", "Claim A descriptive statement.", originalA);
  const dossierB = dossier("CLAIM-B", "Claim B descriptive statement.", originalB);
  const registry = reviewedRegistry([dossierA, dossierB]);
  const changedA = synthesis("SYNTH-A", 2, "A-expanded");
  return { originalA, originalB, dossierA, dossierB, registry, changedA };
}

test("batch scanner covers all active claims and separates CURRENT from REVIEW_DUE", () => {
  const { originalB, dossierA, dossierB, registry, changedA } = fixture();

  const scan = scanClaimReevaluationBatch({
    reviewed_registry: registry,
    original_dossiers: [dossierA, dossierB],
    candidate_syntheses: [changedA, originalB],
    scanned_at: "2026-09-17T22:00:00Z",
  });

  assert.equal(scan.active_claims, 2);
  assert.equal(scan.coverage_complete, true);
  assert.equal(scan.status_counts.REVIEW_DUE, 1);
  assert.equal(scan.status_counts.CURRENT, 1);
  assert.equal(scan.status_counts.MISSING_ORIGINAL_DOSSIER, 0);
  assert.equal(scan.status_counts.MISSING_CANDIDATE_SYNTHESIS, 0);

  const due = scan.results.find((item) => item.claim_id === "CLAIM-A");
  const current = scan.results.find((item) => item.claim_id === "CLAIM-B");
  assert.equal(due.status, "REVIEW_DUE");
  assert.equal(due.previous_classification, "HYPOTHESIS");
  assert.equal(due.assessment.machine_changed_classification, false);
  assert.equal(current.status, "CURRENT");
  assert.equal(current.assessment.review_due, false);
});

test("missing dossier and missing candidate remain explicit coverage gaps", () => {
  const { dossierA, dossierB, registry, changedA } = fixture();

  const scan = scanClaimReevaluationBatch({
    reviewed_registry: registry,
    original_dossiers: [dossierA, dossierB],
    candidate_syntheses: [changedA],
    scanned_at: "2026-09-17T22:00:00Z",
  });

  assert.equal(scan.coverage_complete, false);
  assert.equal(scan.status_counts.REVIEW_DUE, 1);
  assert.equal(scan.status_counts.MISSING_CANDIDATE_SYNTHESIS, 1);

  const scanMissingDossier = scanClaimReevaluationBatch({
    reviewed_registry: registry,
    original_dossiers: [dossierA],
    candidate_syntheses: [changedA],
    scanned_at: "2026-09-17T22:01:00Z",
  });
  assert.equal(scanMissingDossier.status_counts.MISSING_ORIGINAL_DOSSIER, 1);
  assert.equal(scanMissingDossier.coverage_complete, false);
});

test("duplicate candidate synthesis keys are rejected as ambiguous batch input", () => {
  const { dossierA, dossierB, registry, changedA } = fixture();
  const anotherA = synthesis("SYNTH-A", 3, "A-other");

  assert.throws(() => scanClaimReevaluationBatch({
    reviewed_registry: registry,
    original_dossiers: [dossierA, dossierB],
    candidate_syntheses: [changedA, anotherA],
    scanned_at: "2026-09-17T22:00:00Z",
  }), /duplicate candidate synthesis key/);
});

test("batch materialization adds only REVIEW_DUE and is idempotent against existing pairs", () => {
  const { originalB, dossierA, dossierB, registry, changedA } = fixture();
  const input = {
    reviewed_registry: registry,
    original_dossiers: [dossierA, dossierB],
    candidate_syntheses: [changedA, originalB],
    scanned_at: "2026-09-17T22:00:00Z",
  };

  let queue = createClaimReevaluationQueue({
    queue_key: "BATCH-QUEUE",
    title: "Batch queue",
    created_at: "2026-09-17T22:00:00Z",
  });

  const first = materializeClaimReevaluationBatch(queue, input);
  queue = first.queue;
  assert.equal(first.review_due_found, 1);
  assert.equal(first.added, 1);
  assert.equal(first.skipped_existing, 0);
  assert.equal(first.unresolved_coverage, 0);
  assert.equal(queue.items.length, 1);
  assert.equal(queue.items[0].claim_id, "CLAIM-A");
  assert.equal(queue.items[0].machine_changed_classification, false);

  const second = materializeClaimReevaluationBatch(queue, input);
  assert.equal(second.added, 0);
  assert.equal(second.skipped_existing, 1);
  assert.equal(second.queue.items.length, 1);
});

test("scan serialization roundtrips and SHA-256 detects tampering", () => {
  const { originalB, dossierA, dossierB, registry, changedA } = fixture();
  const scan = scanClaimReevaluationBatch({
    reviewed_registry: registry,
    original_dossiers: [dossierA, dossierB],
    candidate_syntheses: [changedA, originalB],
    scanned_at: "2026-09-17T22:00:00Z",
  });

  assert.equal(validateClaimReevaluationBatchScan(scan).ok, true);
  assert.deepEqual(parseClaimReevaluationBatchScan(serializeClaimReevaluationBatchScan(scan)), scan);

  const tampered = JSON.parse(JSON.stringify(scan));
  tampered.results[0].previous_classification = "UNSUPPORTED_AT_SCOPE";
  const validation = validateClaimReevaluationBatchScan(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) =>
    issue.includes("previous classification drift") ||
    issue.includes("scan_digest mismatch")
  ));
});
