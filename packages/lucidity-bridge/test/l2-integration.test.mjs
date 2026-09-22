import test from "node:test";
import assert from "node:assert/strict";
import { createClaimDossier } from "@hnk/claim-dossier";
import { createEvidenceReviewGate, applyHumanEvidenceReview } from "@hnk/evidence-review-gate";
import { addSynthesisRegistry, createEvidenceSynthesis, evidenceSynthesisReport } from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";
import { replicationRegistryProjection, validateReplicationRegistry } from "@hnk/replication-registry";
import { lucidityFromClaimDossier, lucidityFromHumanReview, approveLucidityCanon } from "../src/index.mjs";

function metricSignature() {
  const base = { metric_id: "M-LUCIDITY", metric_type: "SCALE", label: "Lucidity score", unit: "points", evidence_source: "SELF_REPORT", timepoint: "POST", evaluation_criterion: "Descriptive direction only." };
  return { ...base, signature_digest: sha256Canonical(base) };
}

function registry(key) {
  const signature = metricSignature();
  const runs = [1, 2].map((n) => ({ run_id: `${key}-R${n}`, experiment_id: `${key}-E${n}`, ledger_digest: sha256Canonical({ key, n }), added_at: "2026-09-22T12:00:00Z", metric_signature_digest: signature.signature_digest, control: { n: 1, aggregate: 3 }, experiment: { n: 1, aggregate: 7 }, direction: "HIGHER", eligible: true, insufficiency_reasons: [] }));
  const value = { registry_id: "HNK_REPLICATION_REGISTRY_V1", registry_version: "1.0.0", authority: "HNK_AUTHORED_REPLICATION_REGISTRY", replication_key: key, title: `Registry ${key}`, question: `Does ${key} show the same descriptive direction?`, metric_signature: signature, created_at: "2026-09-22T11:00:00Z", runs, registry_digest: "", persistence: "USER_CONTROLLED_FILE_ONLY", server_persistence: false, browser_persistence: false, automatic_truth_inference: false, causal_claim_permitted: false, metaphysical_proof_permitted: false, claim_boundary: "REPLICATION_REGISTRY_DESCRIBES_REPEATABILITY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF" };
  value.registry_digest = sha256Canonical(replicationRegistryProjection(value));
  assert.equal(validateReplicationRegistry(value).ok, true);
  return value;
}

function synthesis() {
  let value = createEvidenceSynthesis({ synthesis_key: "LUCIDITY-L2", title: "Lucidity L2 fixture", created_at: "2026-09-22T13:00:00Z", seed_source_id: "SRC-A", seed_added_at: "2026-09-22T13:01:00Z", seed_registry: registry("A") });
  value = addSynthesisRegistry(value, { source_id: "SRC-B", added_at: "2026-09-22T13:02:00Z", registry: registry("B") });
  return value;
}

test("real Claim Dossier -> Human Review -> Lucidity stays non-canonical until separate canon decision", () => {
  const source = synthesis();
  const group = evidenceSynthesisReport(source).groups[0];
  const dossier = createClaimDossier({ claim_id: "CLAIM-L2-001", statement: "The linked records show a descriptively higher score under the experimental condition.", scope: "DESCRIPTIVE", authored_by: "HUMAN-REVIEWER", created_at: "2026-09-22T14:00:00Z", synthesis: source, evidence_links: [{ link_id: "LINK-L2-001", metric_signature_digest: group.metric_signature_digest, relation: "CONSISTENT_WITH", rationale: "Two eligible registries converge descriptively in the HIGHER direction." }], gaps: ["Small number of registries."], conflicts: [], notes: ["No causal or metaphysical claim is made."] });

  const evidenceState = lucidityFromClaimDossier(dossier);
  assert.equal(evidenceState.state, "EVIDENCE_ATTACHED");
  assert.ok(evidenceState.evidenceRefs.length > 0);
  assert.equal(evidenceState.canonRefs.length, 0);

  const pending = createEvidenceReviewGate(dossier, { opened_at: "2026-09-22T14:05:00Z" });
  assert.equal(pending.machine_can_decide, false);
  assert.equal(pending.automatic_canon_promotion, false);

  const reviewedGate = applyHumanEvidenceReview(pending, dossier, { outcome: "ACCEPT_AS_DESCRIPTIVE_SUMMARY", reviewer: "TW", reviewed_at: "2026-09-22T14:10:00Z", explicit_human_signal: "APPROVED_FOR_DESCRIPTIVE_REVIEW", rationale: "The wording remains inside the descriptive evidence scope.", unresolved_questions: ["Replication breadth remains limited."] });
  const reviewed = lucidityFromHumanReview(evidenceState, reviewedGate);
  assert.equal(reviewed.state, "REVIEWED");
  assert.equal(reviewed.canonRefs.length, 0);

  assert.throws(() => approveLucidityCanon(reviewed, { decisionId: "CANON-L2-001", canonRef: "canon:claim-l2-001", humanDecision: false }), /explicit human canon decision/);

  const canonical = approveLucidityCanon(reviewed, { decisionId: "CANON-L2-001", canonRef: "canon:claim-l2-001", humanDecision: true });
  assert.equal(canonical.state, "CANON_APPROVED");
  assert.deepEqual(canonical.canonRefs, ["canon:claim-l2-001"]);
  assert.ok(canonical.reviewRefs.length > 0);
});
