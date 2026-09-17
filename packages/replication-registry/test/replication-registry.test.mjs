import test from "node:test";
import assert from "node:assert/strict";
import {
  addReplicationLedger,
  createReplicationRegistry,
  parseReplicationRegistry,
  replicationReport,
  serializeReplicationRegistry,
  validateReplicationRegistry,
} from "../src/index.mjs";
import { createEvidenceLedger } from "@hnk/evidence-ledger";
import {
  addExperimentArtifact,
  createExperimentProtocol,
} from "@hnk/experiment-protocol";
import { createExperimentAttestation } from "@hnk/experiment-attestation";
import {
  addMeasurementRecord,
  createMeasurementContract,
} from "@hnk/measurement-contract";
import { createRuntimeSessionArtifact } from "@hnk/runtime-session-artifact";
import {
  applySymbolicRuntimeEvent,
  createSymbolicRuntimeSession,
} from "@hnk/symbolic-runtime-contract";

function artifact(sessionId, resultState) {
  const createdAt = "2026-09-17T19:00:00Z";
  let session = createSymbolicRuntimeSession({
    session_id: sessionId,
    created_at: createdAt,
    intention: "Replication registry test.",
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
  apply("SPECIFY", { path_id: "PATH-REPLICATION", from_state: "BASELINE", to_state: "TARGET", constraints: ["record"] }, 1);
  apply("CONSTRUCT", { construction_id: `${sessionId}-construction`, steps: [{ step_id: "step", action: "execute" }] }, 2);
  apply("BIND", { vessel: { vessel_id: `${sessionId}-vessel`, context_type: "TEST", context_ref: "LOCAL" } }, 3);
  apply("ACTIVATE", undefined, 4);
  apply("OBSERVE", { observation_id: `${sessionId}-observation`, raw: "raw" }, 5);
  apply("FEEDBACK", { feedback_id: `${sessionId}-feedback`, assessment: "recorded", next_action: "CLOSE" }, 6);
  apply("COMPLETE", { result_state: resultState, evidence_scope: "SELF_REPORTED", evidence: [] }, 7);
  return createRuntimeSessionArtifact({
    session,
    exported_at: "2026-09-17T19:10:00Z",
    initial: {
      session_id: sessionId,
      created_at: createdAt,
      intention: "Replication registry test.",
      current_state: "BASELINE",
      target_state: "TARGET",
    },
  });
}

function buildLedger(experimentId, controlValues, experimentValues) {
  let protocol = createExperimentProtocol({
    experiment_id: experimentId,
    created_at: "2026-09-17T18:00:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    title: "Replication run",
    question: "Does the experimental aggregate differ descriptively from control?",
    hypothesis: "A direction may repeat descriptively.",
    plan: {
      observed_variables: ["score"],
      controlled_variables: ["same runtime contract", "same metric signature"],
      intervention: "experimental condition",
      control_sessions_required: 1,
      experimental_sessions_required: 1,
      completion_criteria: ["valid artifact per available assignment"],
      exclusion_criteria: ["invalid replay"],
    },
  });

  let measurement = createMeasurementContract(protocol, {
    created_at: "2026-09-17T18:04:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    metrics: [{
      metric_id: "M-SCORE",
      source_variable: "score",
      label: "Score",
      type: "SCALE",
      unit: "points",
      collection_method: "Self-report after session",
      evidence_source: "SELF_REPORT",
      timepoint: "POST",
      timepoint_label: null,
      evaluation_criterion: "Compare descriptive CONTROL and EXPERIMENT means only.",
      scale: { min: 0, max: 10, step: 1, anchors: [] },
    }],
  });

  let sequence = 0;
  for (const value of controlValues) {
    sequence += 1;
    const assignmentId = `CONTROL-${sequence}`;
    protocol = addExperimentArtifact(protocol, {
      assignment_id: assignmentId,
      role: "CONTROL",
      added_at: `2026-09-17T20:${String(sequence).padStart(2, "0")}:00Z`,
      artifact: artifact(`${experimentId}-control-${sequence}`, "CONTROL_RESULT"),
    });
    measurement = addMeasurementRecord(measurement, protocol, {
      measurement_id: `${experimentId}-C-${sequence}`,
      assignment_id: assignmentId,
      metric_id: "M-SCORE",
      measured_at: `2026-09-17T20:${String(sequence + 10).padStart(2, "0")}:00Z`,
      value,
    });
  }

  sequence = 0;
  for (const value of experimentValues) {
    sequence += 1;
    const assignmentId = `EXPERIMENT-${sequence}`;
    protocol = addExperimentArtifact(protocol, {
      assignment_id: assignmentId,
      role: "EXPERIMENT",
      added_at: `2026-09-17T21:${String(sequence).padStart(2, "0")}:00Z`,
      artifact: artifact(`${experimentId}-experiment-${sequence}`, "EXPERIMENT_RESULT"),
    });
    measurement = addMeasurementRecord(measurement, protocol, {
      measurement_id: `${experimentId}-E-${sequence}`,
      assignment_id: assignmentId,
      metric_id: "M-SCORE",
      measured_at: `2026-09-17T21:${String(sequence + 10).padStart(2, "0")}:00Z`,
      value,
    });
  }

  const attestation = createExperimentAttestation(protocol, {
    generated_at: "2026-09-17T22:00:00Z",
  });
  return createEvidenceLedger(protocol, attestation, measurement, {
    created_at: "2026-09-17T22:01:00Z",
  });
}

test("one eligible run is SINGLE_RUN and two same-direction runs are REPLICATED", () => {
  const first = buildLedger("REP-001", [3, 4], [7, 8]);
  const second = buildLedger("REP-002", [2, 4], [6, 9]);

  let registry = createReplicationRegistry({
    replication_key: "SCORE-DIRECTION-V1",
    title: "Score direction replication",
    question: "Does the descriptive direction repeat across independent experiment IDs?",
    metric_id: "M-SCORE",
    created_at: "2026-09-17T22:10:00Z",
    seed_run_id: "RUN-001",
    seed_added_at: "2026-09-17T22:11:00Z",
    seed_ledger: first,
  });

  assert.equal(replicationReport(registry).status, "SINGLE_RUN");
  assert.equal(replicationReport(registry).repeated_direction, "HIGHER");

  registry = addReplicationLedger(registry, {
    run_id: "RUN-002",
    added_at: "2026-09-17T22:12:00Z",
    ledger: second,
  });
  const report = replicationReport(registry);
  assert.equal(report.status, "REPLICATED");
  assert.equal(report.repeated_direction, "HIGHER");
  assert.equal(report.direction_counts.HIGHER, 2);
  assert.equal(report.truth_assessed, false);
  assert.equal(report.causal_claim_permitted, false);
  assert.equal(report.metaphysical_proof_permitted, false);
});

test("different eligible directions produce MIXED rather than a winner", () => {
  const higher = buildLedger("REP-HIGH", [2], [8]);
  const lower = buildLedger("REP-LOW", [8], [2]);

  let registry = createReplicationRegistry({
    replication_key: "MIXED-V1",
    title: "Mixed direction test",
    question: "Do independent runs point in the same descriptive direction?",
    metric_id: "M-SCORE",
    created_at: "2026-09-17T22:10:00Z",
    seed_run_id: "RUN-HIGH",
    seed_added_at: "2026-09-17T22:11:00Z",
    seed_ledger: higher,
  });
  registry = addReplicationLedger(registry, {
    run_id: "RUN-LOW",
    added_at: "2026-09-17T22:12:00Z",
    ledger: lower,
  });

  const report = replicationReport(registry);
  assert.equal(report.status, "MIXED");
  assert.equal(report.repeated_direction, null);
  assert.equal(report.direction_counts.HIGHER, 1);
  assert.equal(report.direction_counts.LOWER, 1);
});

test("missing one role remains explicit and does not fabricate replication", () => {
  const controlOnly = buildLedger("REP-INSUFFICIENT", [5], []);
  const registry = createReplicationRegistry({
    replication_key: "INSUFFICIENT-V1",
    title: "Insufficient run test",
    question: "Can one-sided data establish repeatability?",
    metric_id: "M-SCORE",
    created_at: "2026-09-17T22:10:00Z",
    seed_run_id: "RUN-ONLY",
    seed_added_at: "2026-09-17T22:11:00Z",
    seed_ledger: controlOnly,
  });

  const report = replicationReport(registry);
  assert.equal(report.status, "INSUFFICIENT");
  assert.equal(report.eligible_runs, 0);
  assert.equal(report.insufficient_runs, 1);
  assert.deepEqual(report.run_results[0].insufficiency_reasons, ["NO_EXPERIMENT_MEASUREMENTS"]);
});

test("registry requires independent experiment IDs and exact metric signatures", () => {
  const ledger = buildLedger("REP-DUP", [3], [6]);
  let registry = createReplicationRegistry({
    replication_key: "DUP-V1",
    title: "Duplicate guard",
    question: "Are duplicate runs rejected?",
    metric_id: "M-SCORE",
    created_at: "2026-09-17T22:10:00Z",
    seed_run_id: "RUN-1",
    seed_added_at: "2026-09-17T22:11:00Z",
    seed_ledger: ledger,
  });

  assert.throws(() => addReplicationLedger(registry, {
    run_id: "RUN-2",
    added_at: "2026-09-17T22:12:00Z",
    ledger,
  }), /already registered|distinct experiment IDs/);

  assert.equal(validateReplicationRegistry(registry).ok, true);
  assert.deepEqual(parseReplicationRegistry(serializeReplicationRegistry(registry)), registry);

  const tampered = JSON.parse(JSON.stringify(registry));
  tampered.runs[0].experiment.aggregate = 999;
  assert.equal(validateReplicationRegistry(tampered).ok, false);
  assert.ok(validateReplicationRegistry(tampered).issues.some((issue) => issue.includes("registry_digest mismatch")));
});
