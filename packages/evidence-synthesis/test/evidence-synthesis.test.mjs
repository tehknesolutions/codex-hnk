import test from "node:test";
import assert from "node:assert/strict";
import {
  addSynthesisRegistry,
  createEvidenceSynthesis,
  evidenceSynthesisReport,
  parseEvidenceSynthesis,
  serializeEvidenceSynthesis,
  validateEvidenceSynthesis,
} from "../src/index.mjs";
import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  replicationRegistryProjection,
  validateReplicationRegistry,
} from "@hnk/replication-registry";

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
  return {
    ...base,
    signature_digest: sha256Canonical(base),
  };
}

function run(runId, experimentId, direction) {
  if (direction === "INSUFFICIENT") {
    return {
      run_id: runId,
      experiment_id: experimentId,
      ledger_digest: sha256Canonical({ runId, experimentId, direction }),
      added_at: "2026-09-17T21:00:00Z",
      metric_signature_digest: metricSignature().signature_digest,
      control: { n: 1, aggregate: 5 },
      experiment: { n: 0, aggregate: null },
      direction,
      eligible: false,
      insufficiency_reasons: ["NO_EXPERIMENT_MEASUREMENTS"],
    };
  }
  const pair =
    direction === "HIGHER" ? [3, 7] :
    direction === "LOWER" ? [7, 3] :
    [5, 5];
  return {
    run_id: runId,
    experiment_id: experimentId,
    ledger_digest: sha256Canonical({ runId, experimentId, direction }),
    added_at: "2026-09-17T21:00:00Z",
    metric_signature_digest: metricSignature().signature_digest,
    control: { n: 1, aggregate: pair[0] },
    experiment: { n: 1, aggregate: pair[1] },
    direction,
    eligible: true,
    insufficiency_reasons: [],
  };
}

function registry({ key, question, status, direction = null, signatureOverrides = {} }) {
  const signature = metricSignature(signatureOverrides);
  let runs;
  if (status === "INSUFFICIENT") {
    runs = [run(`${key}-R1`, `${key}-E1`, "INSUFFICIENT")];
  } else if (status === "SINGLE_RUN") {
    runs = [run(`${key}-R1`, `${key}-E1`, direction)];
  } else if (status === "REPLICATED") {
    runs = [
      run(`${key}-R1`, `${key}-E1`, direction),
      run(`${key}-R2`, `${key}-E2`, direction),
    ];
  } else {
    runs = [
      run(`${key}-R1`, `${key}-E1`, "HIGHER"),
      run(`${key}-R2`, `${key}-E2`, "LOWER"),
    ];
  }

  runs = runs.map((item) => ({ ...item, metric_signature_digest: signature.signature_digest }));
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
  assert.equal(validateReplicationRegistry(value).ok, true);
  return value;
}

test("two replicated registries with one direction produce CONVERGENT", () => {
  const a = registry({ key: "A", question: "Question A?", status: "REPLICATED", direction: "HIGHER" });
  const b = registry({ key: "B", question: "Question B?", status: "REPLICATED", direction: "HIGHER" });

  let synthesis = createEvidenceSynthesis({
    synthesis_key: "SYNTH-1",
    title: "Score synthesis",
    created_at: "2026-09-17T22:00:00Z",
    seed_source_id: "SRC-A",
    seed_added_at: "2026-09-17T22:01:00Z",
    seed_registry: a,
  });
  synthesis = addSynthesisRegistry(synthesis, {
    source_id: "SRC-B",
    added_at: "2026-09-17T22:02:00Z",
    registry: b,
  });

  const report = evidenceSynthesisReport(synthesis);
  assert.equal(report.metric_groups, 1);
  assert.equal(report.groups[0].status, "CONVERGENT");
  assert.equal(report.groups[0].convergent_direction, "HIGHER");
  assert.equal(report.groups[0].replicated_registries, 2);
  assert.equal(report.truth_assessed, false);
  assert.equal(report.causal_claim_permitted, false);
});

test("replicated registries with opposed directions produce DIVERGENT", () => {
  const a = registry({ key: "A2", question: "A?", status: "REPLICATED", direction: "HIGHER" });
  const b = registry({ key: "B2", question: "B?", status: "REPLICATED", direction: "LOWER" });

  let synthesis = createEvidenceSynthesis({
    synthesis_key: "SYNTH-2",
    title: "Divergent synthesis",
    created_at: "2026-09-17T22:00:00Z",
    seed_source_id: "SRC-A2",
    seed_added_at: "2026-09-17T22:01:00Z",
    seed_registry: a,
  });
  synthesis = addSynthesisRegistry(synthesis, {
    source_id: "SRC-B2",
    added_at: "2026-09-17T22:02:00Z",
    registry: b,
  });

  const group = evidenceSynthesisReport(synthesis).groups[0];
  assert.equal(group.status, "DIVERGENT");
  assert.equal(group.convergent_direction, null);
  assert.equal(group.replicated_direction_counts.HIGHER, 1);
  assert.equal(group.replicated_direction_counts.LOWER, 1);
});

test("MIXED and INSUFFICIENT source states remain visible", () => {
  const mixed = registry({ key: "MIX", question: "Mixed?", status: "MIXED" });
  const insufficient = registry({ key: "INS", question: "Enough?", status: "INSUFFICIENT" });

  let synthesis = createEvidenceSynthesis({
    synthesis_key: "SYNTH-3",
    title: "Mixed synthesis",
    created_at: "2026-09-17T22:00:00Z",
    seed_source_id: "SRC-MIX",
    seed_added_at: "2026-09-17T22:01:00Z",
    seed_registry: mixed,
  });
  synthesis = addSynthesisRegistry(synthesis, {
    source_id: "SRC-INS",
    added_at: "2026-09-17T22:02:00Z",
    registry: insufficient,
  });

  const group = evidenceSynthesisReport(synthesis).groups[0];
  assert.equal(group.status, "MIXED");
  assert.equal(group.mixed_registries, 1);
  assert.equal(group.insufficient_registries, 1);
  assert.equal(group.questions.length, 2);
});

test("different metric signatures remain separate groups instead of being flattened", () => {
  const score = registry({ key: "SCORE", question: "Score?", status: "REPLICATED", direction: "HIGHER" });
  const count = registry({
    key: "COUNT",
    question: "Count?",
    status: "REPLICATED",
    direction: "HIGHER",
    signatureOverrides: { metric_id: "M-COUNT", metric_type: "COUNT", label: "Count", unit: "events" },
  });

  let synthesis = createEvidenceSynthesis({
    synthesis_key: "SYNTH-4",
    title: "Heterogeneous synthesis",
    created_at: "2026-09-17T22:00:00Z",
    seed_source_id: "SRC-SCORE",
    seed_added_at: "2026-09-17T22:01:00Z",
    seed_registry: score,
  });
  synthesis = addSynthesisRegistry(synthesis, {
    source_id: "SRC-COUNT",
    added_at: "2026-09-17T22:02:00Z",
    registry: count,
  });

  const report = evidenceSynthesisReport(synthesis);
  assert.equal(report.metric_groups, 2);
  assert.ok(report.groups.every((group) => group.status === "SINGLE_REGISTRY_SIGNAL"));
});

test("duplicate registry keys and content are rejected and synthesis digest detects tampering", () => {
  const a = registry({ key: "DUP", question: "Question?", status: "REPLICATED", direction: "EQUAL" });
  let synthesis = createEvidenceSynthesis({
    synthesis_key: "SYNTH-5",
    title: "Duplicate guard",
    created_at: "2026-09-17T22:00:00Z",
    seed_source_id: "SRC-DUP",
    seed_added_at: "2026-09-17T22:01:00Z",
    seed_registry: a,
  });

  assert.throws(() => addSynthesisRegistry(synthesis, {
    source_id: "SRC-DUP-2",
    added_at: "2026-09-17T22:02:00Z",
    registry: a,
  }), /already included|replication_key/);

  assert.equal(validateEvidenceSynthesis(synthesis).ok, true);
  assert.deepEqual(parseEvidenceSynthesis(serializeEvidenceSynthesis(synthesis)), synthesis);

  const tampered = JSON.parse(JSON.stringify(synthesis));
  tampered.registries[0].question = "Tampered?";
  const validation = validateEvidenceSynthesis(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) => issue.includes("synthesis_digest mismatch")));
});
