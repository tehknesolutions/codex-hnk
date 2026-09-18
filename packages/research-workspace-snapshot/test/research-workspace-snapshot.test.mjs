import test from "node:test";
import assert from "node:assert/strict";
import {
  compareResearchWorkspaceSnapshots,
  createResearchWorkspaceSnapshot,
  parseResearchWorkspaceSnapshot,
  restoreResearchWorkspaceSnapshot,
  serializeResearchWorkspaceSnapshot,
  validateResearchWorkspaceSnapshot,
} from "../src/index.mjs";
import { createClaimReevaluationQueue } from "@hnk/claim-reevaluation-queue";
import {
  evidenceSynthesisProjection,
  validateEvidenceSynthesis,
} from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  addResearchArtifact,
  createResearchArtifactLibrary,
} from "@hnk/research-artifact-library";
import { createReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";

function components() {
  return {
    artifact_library: createResearchArtifactLibrary({
      library_key: "WORKSPACE-LIBRARY",
      title: "Workspace artifacts",
      created_at: "2026-09-18T01:00:00Z",
    }),
    reviewed_claim_registry: createReviewedClaimRegistry({
      registry_key: "WORKSPACE-REVIEWED",
      title: "Workspace reviewed claims",
      created_at: "2026-09-18T01:00:00Z",
    }),
    claim_reevaluation_queue: createClaimReevaluationQueue({
      queue_key: "WORKSPACE-QUEUE",
      title: "Workspace queue",
      created_at: "2026-09-18T01:00:00Z",
    }),
  };
}

function synthesis() {
  const metric = sha256Canonical({ metric: "M-SCORE", type: "SCALE" });
  const value = {
    synthesis_id: "HNK_EVIDENCE_SYNTHESIS_V1",
    synthesis_version: "1.0.0",
    authority: "HNK_AUTHORED_EVIDENCE_SYNTHESIS",
    synthesis_key: "WORKSPACE-SYNTHESIS",
    title: "Workspace synthesis",
    created_at: "2026-09-18T01:10:00Z",
    registries: [{
      source_id: "SRC-1",
      replication_key: "REP-1",
      title: "Registry 1",
      question: "Does the descriptive direction repeat?",
      registry_digest: sha256Canonical({ registry: 1 }),
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
      added_at: "2026-09-18T01:10:00Z",
    }],
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

test("workspace snapshot binds all three component digests under one root digest", () => {
  const c = components();
  const snapshot = createResearchWorkspaceSnapshot({
    snapshot_key: "CHECKPOINT-001",
    label: "Research checkpoint 001",
    created_at: "2026-09-18T01:20:00Z",
    ...c,
  });

  assert.equal(validateResearchWorkspaceSnapshot(snapshot).ok, true);
  assert.match(snapshot.snapshot_digest, /^[0-9a-f]{64}$/);
  assert.equal(snapshot.component_digests.artifact_library, c.artifact_library.library_digest);
  assert.equal(snapshot.component_digests.reviewed_claim_registry, c.reviewed_claim_registry.registry_digest);
  assert.equal(snapshot.component_digests.claim_reevaluation_queue, c.claim_reevaluation_queue.queue_digest);
  assert.deepEqual(snapshot.state_summary, {
    artifacts: 0,
    latest_artifacts: 0,
    reviewed_records: 0,
    active_claims: 0,
    review_due_items: 0,
  });
  assert.equal(snapshot.automatic_truth_inference, false);
  assert.equal(snapshot.machine_can_decide_review, false);
  assert.equal(snapshot.canon_promotion_permitted, false);
});

test("direct parent lineage and component-level comparison remain explicit", () => {
  const c = components();
  const first = createResearchWorkspaceSnapshot({
    snapshot_key: "CHECKPOINT-001",
    label: "Research checkpoint 001",
    created_at: "2026-09-18T01:20:00Z",
    ...c,
  });

  const nextLibrary = addResearchArtifact(c.artifact_library, {
    kind: "EVIDENCE_SYNTHESIS",
    payload: synthesis(),
    added_at: "2026-09-18T01:21:00Z",
  });

  const second = createResearchWorkspaceSnapshot({
    snapshot_key: "CHECKPOINT-002",
    label: "Research checkpoint 002",
    created_at: "2026-09-18T01:22:00Z",
    parent_snapshot_digest: first.snapshot_digest,
    artifact_library: nextLibrary,
    reviewed_claim_registry: c.reviewed_claim_registry,
    claim_reevaluation_queue: c.claim_reevaluation_queue,
  });

  const comparison = compareResearchWorkspaceSnapshots(first, second);
  assert.equal(comparison.same_snapshot, false);
  assert.equal(comparison.lineage_relation, "LEFT_PARENT_OF_RIGHT");
  assert.deepEqual(comparison.changed_components, ["ARTIFACT_LIBRARY"]);
  assert.equal(comparison.component_changes.ARTIFACT_LIBRARY, true);
  assert.equal(comparison.component_changes.REVIEWED_CLAIM_REGISTRY, false);
  assert.equal(comparison.component_changes.CLAIM_REEVALUATION_QUEUE, false);
  assert.equal(comparison.deltas.artifacts, 1);
  assert.equal(comparison.deltas.latest_artifacts, 1);
  assert.equal(comparison.deltas.reviewed_records, 0);
  assert.equal(comparison.truth_assessed, false);
});

test("restore returns exact component state without performing persistence", () => {
  const c = components();
  const snapshot = createResearchWorkspaceSnapshot({
    snapshot_key: "CHECKPOINT-RESTORE",
    label: "Restore checkpoint",
    created_at: "2026-09-18T01:20:00Z",
    ...c,
  });

  const restored = restoreResearchWorkspaceSnapshot(snapshot);
  assert.equal(restored.restored_from_snapshot_digest, snapshot.snapshot_digest);
  assert.deepEqual(restored.artifact_library, c.artifact_library);
  assert.deepEqual(restored.reviewed_claim_registry, c.reviewed_claim_registry);
  assert.deepEqual(restored.claim_reevaluation_queue, c.claim_reevaluation_queue);
  assert.equal(restored.exact_component_restore, true);
  assert.equal(restored.server_write_performed, false);
  assert.equal(restored.browser_persistence_performed, false);
});

test("serialization roundtrips and nested tampering breaks validation", () => {
  const c = components();
  const snapshot = createResearchWorkspaceSnapshot({
    snapshot_key: "CHECKPOINT-SERIALIZE",
    label: "Serialize checkpoint",
    created_at: "2026-09-18T01:20:00Z",
    ...c,
  });

  assert.deepEqual(
    parseResearchWorkspaceSnapshot(serializeResearchWorkspaceSnapshot(snapshot)),
    snapshot,
  );

  const tampered = JSON.parse(JSON.stringify(snapshot));
  tampered.components.artifact_library.title = "Tampered";
  const validation = validateResearchWorkspaceSnapshot(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) =>
    issue.includes("artifact_library") ||
    issue.includes("snapshot_digest mismatch"),
  ));
});

test("invalid parent digest is rejected before checkpoint creation", () => {
  const c = components();
  assert.throws(() => createResearchWorkspaceSnapshot({
    snapshot_key: "CHECKPOINT-BAD-PARENT",
    label: "Bad parent",
    created_at: "2026-09-18T01:20:00Z",
    parent_snapshot_digest: "not-a-digest",
    ...c,
  }), /parent_snapshot_digest/);
});
