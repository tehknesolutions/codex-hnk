import test from "node:test";
import assert from "node:assert/strict";
import {
  addClaimReevaluation,
  assessClaimReevaluation,
  claimReevaluationQueueIndex,
  createClaimReevaluationQueue,
  parseClaimReevaluationQueue,
  serializeClaimReevaluationQueue,
  validateClaimReevaluationQueue,
} from "../src/index.mjs";
import {
  claimDossierProjection,
  validateClaimDossier,
} from "@hnk/claim-dossier";
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

function metricDigest(id = "M-SCORE") {
  return sha256Canonical({
    metric_id: id,
    metric_type: "SCALE",
    label: id === "M-SCORE" ? "Score" : "Secondary",
    unit: "points",
    evidence_source: "SELF_REPORT",
    timepoint: "POST",
    evaluation_criterion: "Descriptive direction only.",
  });
}

function synthesis({ sources = 1, direction = "HIGHER", includeSecondary = false, key = "SYNTH-REEVAL" } = {}) {
  const primaryDigest = metricDigest("M-SCORE");
  const registries = Array.from({ length: sources }, (_, index) => ({
    source_id: `SRC-${index + 1}`,
    replication_key: `REP-${index + 1}`,
    title: `Registry ${index + 1}`,
    question: `Primary question ${index + 1}?`,
    registry_digest: sha256Canonical({ registry: index + 1, direction }),
    metric_signature_digest: primaryDigest,
    metric_id: "M-SCORE",
    metric_label: "Score",
    metric_type: "SCALE",
    unit: "points",
    replication_status: "REPLICATED",
    repeated_direction: direction,
    total_runs: 2,
    eligible_runs: 2,
    insufficient_runs: 0,
    added_at: `2026-09-17T20:0${index}:00Z`,
  }));

  if (includeSecondary) {
    registries.push({
      source_id: "SRC-SECONDARY",
      replication_key: "REP-SECONDARY",
      title: "Secondary registry",
      question: "Secondary question?",
      registry_digest: sha256Canonical({ registry: "secondary" }),
      metric_signature_digest: metricDigest("M-SECONDARY"),
      metric_id: "M-SECONDARY",
      metric_label: "Secondary",
      metric_type: "SCALE",
      unit: "points",
      replication_status: "REPLICATED",
      repeated_direction: "EQUAL",
      total_runs: 2,
      eligible_runs: 2,
      insufficient_runs: 0,
      added_at: "2026-09-17T20:30:00Z",
    });
  }

  const value = {
    synthesis_id: "HNK_EVIDENCE_SYNTHESIS_V1",
    synthesis_version: "1.0.0",
    authority: "HNK_AUTHORED_EVIDENCE_SYNTHESIS",
    synthesis_key: key,
    title: "Re-evaluation synthesis",
    created_at: "2026-09-17T20:00:00Z",
    registries,
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

function dossierFor(source) {
  const group = evidenceSynthesisReport(source).groups.find((item) => item.metric_id === "M-SCORE");
  const value = {
    dossier_id: "HNK_CLAIM_DOSSIER_V1",
    dossier_version: "1.0.0",
    authority: "HNK_AUTHORED_CLAIM_DOSSIER",
    claim_id: "CLAIM-REEVAL-001",
    statement: "The linked score remains a descriptive research claim.",
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
      rationale: "Human-selected relevance for the primary metric group.",
      source_questions: group.questions.map((entry) => entry.question),
    }],
    gaps: ["More independent evidence remains desirable."],
    conflicts: [],
    notes: ["No automatic truth inference."],
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

function reviewedRegistry(dossier) {
  const record = {
    record_id: "REVIEWED-REC-001",
    claim_id: dossier.claim_id,
    claim_version: 1,
    statement: dossier.statement,
    scope: dossier.scope,
    classification: "HYPOTHESIS",
    review_outcome: "KEEP_AS_HYPOTHESIS",
    dossier_digest: dossier.dossier_digest,
    review_gate_digest: sha256Canonical({ gate: "reviewed" }),
    synthesis_key: dossier.synthesis_binding.synthesis_key,
    synthesis_digest: dossier.synthesis_binding.synthesis_digest,
    reviewer: "TW-DVF",
    reviewed_at: "2026-09-17T21:30:00Z",
    explicit_human_signal: "KEEP AS HYPOTHESIS",
    review_rationale: "Current evidence supports continued hypothesis status.",
    unresolved_questions: ["Does future evidence change the synthesis?"],
    gaps: [...dossier.gaps],
    conflicts: [...dossier.conflicts],
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
    registry_key: "REVIEWED-REGISTRY",
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
  assert.equal(validateReviewedClaimRegistry(registry).ok, true);
  return registry;
}

test("unchanged synthesis snapshot does not create review due", () => {
  const original = synthesis({ sources: 1 });
  const dossier = dossierFor(original);
  const registry = reviewedRegistry(dossier);

  const assessment = assessClaimReevaluation({
    reviewed_registry: registry,
    claim_id: dossier.claim_id,
    original_dossier: dossier,
    candidate_synthesis: original,
  });

  assert.equal(assessment.review_due, false);
  assert.deepEqual(assessment.reasons, []);
  assert.equal(assessment.next_workflow, "NONE");
  assert.equal(assessment.previous_classification, "HYPOTHESIS");
  assert.equal(assessment.machine_changed_classification, false);
});

test("changed synthesis snapshot creates REVIEW_DUE without changing prior classification", () => {
  const original = synthesis({ sources: 1 });
  const candidate = synthesis({ sources: 2 });
  const dossier = dossierFor(original);
  const registry = reviewedRegistry(dossier);

  const assessment = assessClaimReevaluation({
    reviewed_registry: registry,
    claim_id: dossier.claim_id,
    original_dossier: dossier,
    candidate_synthesis: candidate,
  });

  assert.equal(assessment.review_due, true);
  assert.equal(assessment.previous_classification, "HYPOTHESIS");
  assert.equal(assessment.machine_changed_classification, false);
  assert.equal(assessment.machine_can_resolve, false);
  assert.equal(assessment.human_review_required, true);
  assert.ok(assessment.reasons.includes("SYNTHESIS_SNAPSHOT_CHANGED"));
  assert.ok(assessment.reasons.includes("LINKED_GROUP_STATUS_CHANGED"));
  assert.ok(assessment.reasons.includes("SOURCE_QUESTIONS_CHANGED"));
  assert.equal(assessment.linked_group_changes[0].old_group_status, "SINGLE_REGISTRY_SIGNAL");
  assert.equal(assessment.linked_group_changes[0].new_group_status, "CONVERGENT");
  assert.equal(assessment.next_workflow, "CREATE_NEW_CLAIM_DOSSIER_AND_HUMAN_REVIEW");
});

test("new synthesis groups are flagged as unclassified rather than assumed relevant", () => {
  const original = synthesis({ sources: 1 });
  const candidate = synthesis({ sources: 2, includeSecondary: true });
  const dossier = dossierFor(original);
  const registry = reviewedRegistry(dossier);

  const assessment = assessClaimReevaluation({
    reviewed_registry: registry,
    claim_id: dossier.claim_id,
    original_dossier: dossier,
    candidate_synthesis: candidate,
  });

  assert.ok(assessment.reasons.includes("UNCLASSIFIED_NEW_GROUPS_PRESENT"));
  assert.equal(assessment.unclassified_new_group_signatures.length, 1);
  assert.equal(assessment.machine_changed_classification, false);
});

test("queue stores changed snapshots, rejects unchanged/duplicates, and detects tampering", () => {
  const original = synthesis({ sources: 1 });
  const candidate = synthesis({ sources: 2 });
  const dossier = dossierFor(original);
  const registry = reviewedRegistry(dossier);

  let queue = createClaimReevaluationQueue({
    queue_key: "REEVAL-QUEUE",
    title: "Claim re-evaluation queue",
    created_at: "2026-09-17T22:00:00Z",
  });

  assert.throws(() => addClaimReevaluation(queue, {
    item_id: "ITEM-NO-CHANGE",
    detected_at: "2026-09-17T22:01:00Z",
    reviewed_registry: registry,
    claim_id: dossier.claim_id,
    original_dossier: dossier,
    candidate_synthesis: original,
  }), /NO_REEVALUATION_REQUIRED/);

  queue = addClaimReevaluation(queue, {
    item_id: "ITEM-001",
    detected_at: "2026-09-17T22:02:00Z",
    reviewed_registry: registry,
    claim_id: dossier.claim_id,
    original_dossier: dossier,
    candidate_synthesis: candidate,
  });

  assert.equal(queue.items[0].status, "REVIEW_DUE");
  assert.equal(queue.items[0].previous_classification, "HYPOTHESIS");
  assert.equal(queue.items[0].machine_changed_classification, false);

  assert.throws(() => addClaimReevaluation(queue, {
    item_id: "ITEM-002",
    detected_at: "2026-09-17T22:03:00Z",
    reviewed_registry: registry,
    claim_id: dossier.claim_id,
    original_dossier: dossier,
    candidate_synthesis: candidate,
  }), /duplicate re-evaluation candidate/);

  const index = claimReevaluationQueueIndex(queue);
  assert.equal(index.review_due, 1);
  assert.equal(index.classifications_changed_by_machine, false);
  assert.equal(index.truth_assessed, false);
  assert.equal(index.canon_promotion_permitted, false);

  assert.deepEqual(parseClaimReevaluationQueue(serializeClaimReevaluationQueue(queue)), queue);

  const tampered = JSON.parse(JSON.stringify(queue));
  tampered.items[0].previous_classification = "DESCRIPTIVE_SUMMARY";
  const validation = validateClaimReevaluationQueue(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) =>
    issue.includes("item_digest mismatch") || issue.includes("queue_digest mismatch")
  ));
});

test("candidate synthesis must evolve the same synthesis key", () => {
  const original = synthesis({ sources: 1 });
  const unrelated = synthesis({ sources: 2, key: "OTHER-SYNTHESIS" });
  const dossier = dossierFor(original);
  const registry = reviewedRegistry(dossier);

  assert.throws(() => assessClaimReevaluation({
    reviewed_registry: registry,
    claim_id: dossier.claim_id,
    original_dossier: dossier,
    candidate_synthesis: unrelated,
  }), /does not match reviewed synthesis key/);
});
