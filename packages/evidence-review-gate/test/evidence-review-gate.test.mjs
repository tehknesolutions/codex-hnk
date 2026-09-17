import test from "node:test";
import assert from "node:assert/strict";
import {
  applyHumanEvidenceReview,
  createEvidenceReviewGate,
  evidenceReviewGateSummary,
  parseEvidenceReviewGate,
  serializeEvidenceReviewGate,
  validateEvidenceReviewGate,
  verifyEvidenceReviewGate,
} from "../src/index.mjs";
import { createClaimDossier } from "@hnk/claim-dossier";
import { createEvidenceSynthesis, evidenceSynthesisReport } from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";
import { replicationRegistryProjection } from "@hnk/replication-registry";

function sourceSynthesis() {
  const signatureBase = {
    metric_id: "M-SCORE",
    metric_type: "SCALE",
    label: "Score",
    unit: "points",
    evidence_source: "SELF_REPORT",
    timepoint: "POST",
    evaluation_criterion: "Descriptive direction only.",
  };
  const signature = { ...signatureBase, signature_digest: sha256Canonical(signatureBase) };
  const registry = {
    registry_id: "HNK_REPLICATION_REGISTRY_V1",
    registry_version: "1.0.0",
    authority: "HNK_AUTHORED_REPLICATION_REGISTRY",
    replication_key: "REVIEW-R",
    title: "Review registry",
    question: "Review question?",
    metric_signature: signature,
    created_at: "2026-09-17T19:00:00Z",
    runs: [1, 2].map((n) => ({
      run_id: `R-${n}`,
      experiment_id: `E-${n}`,
      ledger_digest: sha256Canonical({ n }),
      added_at: "2026-09-17T19:10:00Z",
      metric_signature_digest: signature.signature_digest,
      control: { n: 1, aggregate: 2 },
      experiment: { n: 1, aggregate: 6 },
      direction: "HIGHER",
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
  registry.registry_digest = sha256Canonical(replicationRegistryProjection(registry));
  return createEvidenceSynthesis({
    synthesis_key: "REVIEW-S",
    title: "Review synthesis",
    created_at: "2026-09-17T20:00:00Z",
    seed_source_id: "SRC-R",
    seed_added_at: "2026-09-17T20:01:00Z",
    seed_registry: registry,
  });
}

function dossier() {
  const synthesis = sourceSynthesis();
  const group = evidenceSynthesisReport(synthesis).groups[0];
  return createClaimDossier({
    claim_id: "CLAIM-REVIEW",
    statement: "The recorded score is descriptively higher in the linked replicated evidence.",
    scope: "DESCRIPTIVE",
    authored_by: "RESEARCHER",
    created_at: "2026-09-17T21:00:00Z",
    synthesis,
    evidence_links: [{
      link_id: "LINK-REVIEW",
      metric_signature_digest: group.metric_signature_digest,
      relation: "CONSISTENT_WITH",
      rationale: "The linked group contains one replicated registry in the HIGHER direction.",
    }],
    gaps: ["Only one replication registry is currently in the synthesis."],
  });
}

test("new review gate is pending and machine cannot decide it", () => {
  const claim = dossier();
  const gate = createEvidenceReviewGate(claim, { opened_at: "2026-09-17T21:10:00Z" });
  assert.equal(gate.status, "PENDING_HUMAN_REVIEW");
  assert.equal(gate.review, null);
  assert.equal(gate.machine_can_decide, false);
  assert.equal(gate.automatic_canon_promotion, false);
  assert.equal(gate.canon_promotion_permitted, false);
  assert.equal(verifyEvidenceReviewGate(gate, claim).ok, true);
});

test("explicit human signal records a review without granting truth or canon status", () => {
  const claim = dossier();
  let gate = createEvidenceReviewGate(claim, { opened_at: "2026-09-17T21:10:00Z" });
  gate = applyHumanEvidenceReview(gate, claim, {
    outcome: "ACCEPT_AS_DESCRIPTIVE_SUMMARY",
    reviewer: "TW-DVF",
    reviewed_at: "2026-09-17T21:15:00Z",
    explicit_human_signal: "APPROVED FOR DESCRIPTIVE USE",
    rationale: "The wording is limited to the descriptive evidence represented in the dossier.",
    unresolved_questions: ["More independent registries remain desirable."],
  });

  assert.equal(gate.status, "REVIEWED");
  assert.equal(gate.review.human_decision, true);
  assert.equal(gate.review.outcome, "ACCEPT_AS_DESCRIPTIVE_SUMMARY");
  assert.equal(gate.machine_can_decide, false);
  assert.equal(gate.canon_promotion_permitted, false);
  assert.equal(gate.causal_claim_permitted, false);
  assert.equal(gate.metaphysical_proof_permitted, false);
  assert.deepEqual(parseEvidenceReviewGate(serializeEvidenceReviewGate(gate)), gate);
});

test("a decided gate cannot be decided twice and tampering breaks digest", () => {
  const claim = dossier();
  let gate = createEvidenceReviewGate(claim, { opened_at: "2026-09-17T21:10:00Z" });
  gate = applyHumanEvidenceReview(gate, claim, {
    outcome: "REQUEST_MORE_EVIDENCE",
    reviewer: "TW-DVF",
    reviewed_at: "2026-09-17T21:15:00Z",
    explicit_human_signal: "REQUEST MORE EVIDENCE",
    rationale: "The dossier contains an explicit evidence gap.",
  });
  assert.throws(() => applyHumanEvidenceReview(gate, claim, {
    outcome: "KEEP_AS_HYPOTHESIS",
    reviewer: "TW-DVF",
    reviewed_at: "2026-09-17T21:16:00Z",
    explicit_human_signal: "CHANGE",
    rationale: "Second decision.",
  }), /already been decided/);

  const tampered = JSON.parse(JSON.stringify(gate));
  tampered.review.outcome = "ACCEPT_AS_DESCRIPTIVE_SUMMARY";
  assert.equal(validateEvidenceReviewGate(tampered).ok, false);
  assert.ok(validateEvidenceReviewGate(tampered).issues.some((issue) => issue.includes("gate_digest mismatch")));
});

test("summary locks human authority and no auto-promotion", () => {
  const summary = evidenceReviewGateSummary();
  assert.equal(summary.explicit_human_signal_required, true);
  assert.equal(summary.human_decision_required, true);
  assert.equal(summary.machine_can_decide, false);
  assert.equal(summary.automatic_canon_promotion, false);
  assert.equal(summary.canon_promotion_permitted, false);
});
