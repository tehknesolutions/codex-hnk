import test from "node:test";
import assert from "node:assert/strict";
import {
  addMeasurementRecord,
  createMeasurementContract,
  measurementDescriptiveSummary,
  measurementMatrix,
  parseMeasurementContract,
  serializeMeasurementContract,
  validateMeasurementContract,
} from "../src/index.mjs";
import { addExperimentArtifact, createExperimentProtocol } from "@hnk/experiment-protocol";
import { createRuntimeSessionArtifact } from "@hnk/runtime-session-artifact";
import { applySymbolicRuntimeEvent, createSymbolicRuntimeSession } from "@hnk/symbolic-runtime-contract";

function artifact(sessionId, resultState) {
  const createdAt = "2026-09-17T19:00:00Z";
  let session = createSymbolicRuntimeSession({
    session_id: sessionId,
    created_at: createdAt,
    intention: "Registrar medidas tipadas.",
    current_state: "BASELINE",
    target_state: "TARGET",
  });
  const apply = (type, payload, minute) => {
    session = applySymbolicRuntimeEvent(session, {
      event_id: `${sessionId}-${type.toLowerCase()}`,
      type,
      at: `2026-09-17T19:${String(minute).padStart(2, "0")}:00Z`,
      ...(payload ? { payload } : {}),
    });
  };
  apply("SPECIFY", { path_id: "PATH-MEASURE", from_state: "BASELINE", to_state: "TARGET", constraints: ["record only"] }, 1);
  apply("CONSTRUCT", { construction_id: `${sessionId}-construction`, steps: [{ step_id: "step-1", action: "execute" }] }, 2);
  apply("BIND", { vessel: { vessel_id: `${sessionId}-vessel`, context_type: "TEST", context_ref: "LOCAL" } }, 3);
  apply("ACTIVATE", undefined, 4);
  apply("OBSERVE", { observation_id: `${sessionId}-observation`, raw: `raw ${sessionId}` }, 5);
  apply("FEEDBACK", { feedback_id: `${sessionId}-feedback`, assessment: "recorded", next_action: "CLOSE" }, 6);
  apply("COMPLETE", { result_state: resultState, evidence_scope: "SELF_REPORTED", evidence: [] }, 7);
  return createRuntimeSessionArtifact({
    session,
    exported_at: "2026-09-17T19:10:00Z",
    initial: { session_id: sessionId, created_at: createdAt, intention: "Registrar medidas tipadas.", current_state: "BASELINE", target_state: "TARGET" },
  });
}

function preregistration(hypothesis = "Pode haver diferença descritiva.") {
  return createExperimentProtocol({
    experiment_id: "MEASURE-EXP-001",
    created_at: "2026-09-17T18:00:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    title: "Measurement contract test",
    question: "Os registros tipados diferem?",
    hypothesis,
    plan: {
      observed_variables: ["mood_score", "completed", "result_class"],
      controlled_variables: ["same runtime"],
      intervention: "experimental condition only",
      control_sessions_required: 1,
      experimental_sessions_required: 1,
      completion_criteria: ["one valid session per role"],
      exclusion_criteria: ["invalid replay"],
    },
  });
}

function metricDefinitions() {
  return [
    {
      metric_id: "M-MOOD",
      source_variable: "mood_score",
      label: "Mood score",
      type: "SCALE",
      unit: "points",
      collection_method: "Self-report immediately after session",
      evidence_source: "SELF_REPORT",
      timepoint: "POST",
      timepoint_label: null,
      evaluation_criterion: "Compare descriptive distributions without inferring cause.",
      scale: { min: 0, max: 10, step: 1, anchors: [{ value: 0, label: "minimum" }, { value: 10, label: "maximum" }] },
    },
    {
      metric_id: "M-COMPLETE",
      source_variable: "completed",
      label: "Completed",
      type: "BOOLEAN",
      unit: null,
      collection_method: "Read completed session result",
      evidence_source: "RUNTIME_DERIVED",
      timepoint: "EVENT_BOUNDARY",
      timepoint_label: "runtime COMPLETE event",
      evaluation_criterion: "Report true/false counts by role.",
    },
    {
      metric_id: "M-CLASS",
      source_variable: "result_class",
      label: "Result class",
      type: "CATEGORY",
      unit: null,
      collection_method: "Researcher classification from preregistered categories",
      evidence_source: "OBSERVER_RECORDED",
      timepoint: "POST",
      timepoint_label: null,
      evaluation_criterion: "Report category frequencies by role.",
      category_options: ["A", "B", "C"],
    },
  ];
}

test("typed measurement plan covers every observed variable and survives JSON round-trip", () => {
  const protocol = preregistration();
  const contract = createMeasurementContract(protocol, {
    created_at: "2026-09-17T18:04:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    metrics: metricDefinitions(),
  });
  assert.equal(contract.plan_locked, true);
  assert.equal(contract.metrics.length, 3);
  assert.match(contract.measurement_plan_digest, /^[0-9a-f]{64}$/);
  assert.equal(validateMeasurementContract(contract, protocol).ok, true);
  assert.deepEqual(parseMeasurementContract(serializeMeasurementContract(contract)), contract);

  assert.throws(() => createMeasurementContract(protocol, {
    created_at: "2026-09-17T18:04:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    metrics: metricDefinitions().slice(0, 2),
  }), /cover the preregistered observed_variables exactly once/);
});

test("records are typed, bound to assignments and summarized descriptively only", () => {
  const prereg = preregistration();
  let contract = createMeasurementContract(prereg, {
    created_at: "2026-09-17T18:04:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    metrics: metricDefinitions(),
  });

  let protocol = addExperimentArtifact(prereg, {
    assignment_id: "CONTROL-1",
    role: "CONTROL",
    added_at: "2026-09-17T20:00:00Z",
    artifact: artifact("measure-control", "CONTROL_RESULT"),
  });
  protocol = addExperimentArtifact(protocol, {
    assignment_id: "EXPERIMENT-1",
    role: "EXPERIMENT",
    added_at: "2026-09-17T20:30:00Z",
    artifact: artifact("measure-experiment", "EXPERIMENT_RESULT"),
  });

  const add = (measurement_id, assignment_id, metric_id, value) => {
    contract = addMeasurementRecord(contract, protocol, {
      measurement_id,
      assignment_id,
      metric_id,
      measured_at: "2026-09-17T21:00:00Z",
      value,
    });
  };

  add("C-MOOD", "CONTROL-1", "M-MOOD", 4);
  add("C-DONE", "CONTROL-1", "M-COMPLETE", true);
  add("C-CLASS", "CONTROL-1", "M-CLASS", "A");
  add("E-MOOD", "EXPERIMENT-1", "M-MOOD", 7);
  add("E-DONE", "EXPERIMENT-1", "M-COMPLETE", true);
  add("E-CLASS", "EXPERIMENT-1", "M-CLASS", "B");

  assert.equal(validateMeasurementContract(contract, protocol).ok, true);
  const matrix = measurementMatrix(contract, protocol);
  assert.equal(matrix.rows.length, 2);
  assert.equal(matrix.rows[0].missing_metrics.length, 0);

  const summary = measurementDescriptiveSummary(contract, protocol);
  const mood = summary.metrics.find((entry) => entry.metric_id === "M-MOOD");
  assert.equal(mood.control.mean, 4);
  assert.equal(mood.experiment.mean, 7);
  assert.equal(summary.inferential_statistics_performed, false);
  assert.equal(summary.causal_claim_permitted, false);
  assert.equal(summary.metaphysical_proof_permitted, false);

  assert.throws(() => addMeasurementRecord(contract, protocol, {
    measurement_id: "BAD-TYPE",
    assignment_id: "CONTROL-1",
    metric_id: "M-MOOD",
    measured_at: "2026-09-17T21:01:00Z",
    value: "high",
  }), /requires a finite scale value|measurement already exists/);
});

test("measurement plan remains bound to the original experiment preregistration", () => {
  const protocol = preregistration();
  const contract = createMeasurementContract(protocol, {
    created_at: "2026-09-17T18:04:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    metrics: metricDefinitions(),
  });
  const drifted = preregistration("A materially different hypothesis.");
  const validation = validateMeasurementContract(contract, drifted);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) => issue.includes("preregistration digest mismatch")));
});
