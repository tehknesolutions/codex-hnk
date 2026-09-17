import test from "node:test";
import assert from "node:assert/strict";
import {
  addEvidenceClaim,
  createEvidenceLedger,
  evidenceLedgerIndex,
  evaluateEvidenceClaim,
  parseEvidenceLedger,
  serializeEvidenceLedger,
  validateEvidenceLedger,
  verifyEvidenceLedger,
} from "../src/index.mjs";
import {
  addExperimentArtifact,
  createExperimentProtocol,
  finalizeExperimentProtocol,
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
    intention: "Evidence ledger test.",
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
  apply("SPECIFY", { path_id: "PATH-EVIDENCE", from_state: "BASELINE", to_state: "TARGET", constraints: ["record"] }, 1);
  apply("CONSTRUCT", { construction_id: `${sessionId}-construction`, steps: [{ step_id: "step", action: "execute" }] }, 2);
  apply("BIND", { vessel: { vessel_id: `${sessionId}-vessel`, context_type: "TEST", context_ref: "LOCAL" } }, 3);
  apply("ACTIVATE", undefined, 4);
  apply("OBSERVE", { observation_id: `${sessionId}-observation`, raw: `raw ${sessionId}` }, 5);
  apply("FEEDBACK", { feedback_id: `${sessionId}-feedback`, assessment: "recorded", next_action: "CLOSE" }, 6);
  apply("COMPLETE", { result_state: resultState, evidence_scope: "SELF_REPORTED", evidence: [] }, 7);
  return createRuntimeSessionArtifact({
    session,
    exported_at: "2026-09-17T19:10:00Z",
    initial: {
      session_id: sessionId,
      created_at: createdAt,
      intention: "Evidence ledger test.",
      current_state: "BASELINE",
      target_state: "TARGET",
    },
  });
}

function preregistration() {
  return createExperimentProtocol({
    experiment_id: "EVIDENCE-EXP-001",
    created_at: "2026-09-17T18:00:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    title: "Evidence ledger experiment",
    question: "Do the recorded values differ descriptively?",
    hypothesis: "They may differ descriptively.",
    plan: {
      observed_variables: ["score"],
      controlled_variables: ["same runtime"],
      intervention: "experimental condition only",
      control_sessions_required: 1,
      experimental_sessions_required: 1,
      completion_criteria: ["one valid session per role"],
      exclusion_criteria: ["invalid replay"],
    },
  });
}

function measurementPlan(protocol) {
  return createMeasurementContract(protocol, {
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
      evaluation_criterion: "Compare descriptive values only.",
      scale: { min: 0, max: 10, step: 1, anchors: [] },
    }],
  });
}

function completedSources() {
  const prereg = preregistration();
  let measurement = measurementPlan(prereg);
  let protocol = addExperimentArtifact(prereg, {
    assignment_id: "CONTROL-1",
    role: "CONTROL",
    added_at: "2026-09-17T20:00:00Z",
    artifact: artifact("evidence-control", "CONTROL_RESULT"),
  });
  protocol = addExperimentArtifact(protocol, {
    assignment_id: "EXPERIMENT-1",
    role: "EXPERIMENT",
    added_at: "2026-09-17T20:30:00Z",
    artifact: artifact("evidence-experiment", "EXPERIMENT_RESULT"),
  });
  measurement = addMeasurementRecord(measurement, protocol, {
    measurement_id: "C-SCORE",
    assignment_id: "CONTROL-1",
    metric_id: "M-SCORE",
    measured_at: "2026-09-17T20:10:00Z",
    value: 4,
  });
  measurement = addMeasurementRecord(measurement, protocol, {
    measurement_id: "E-SCORE",
    assignment_id: "EXPERIMENT-1",
    metric_id: "M-SCORE",
    measured_at: "2026-09-17T20:40:00Z",
    value: 7,
  });
  protocol = finalizeExperimentProtocol(protocol, {
    completed_at: "2026-09-17T21:00:00Z",
    descriptive_summary: "The recorded scores differ.",
    interpretation: "The difference is descriptive only.",
    limitations: ["minimal sample"],
  });
  const attestation = createExperimentAttestation(protocol, {
    generated_at: "2026-09-17T21:01:00Z",
  });
  return { protocol, attestation, measurement };
}

test("ledger binds protocol, attestation and measurement sources", () => {
  const { protocol, attestation, measurement } = completedSources();
  const ledger = createEvidenceLedger(protocol, attestation, measurement, {
    created_at: "2026-09-17T21:02:00Z",
  });
  assert.equal(validateEvidenceLedger(ledger).ok, true);
  assert.match(ledger.ledger_digest, /^[0-9a-f]{64}$/);
  assert.equal(ledger.attestation_integrity_verified, true);
  assert.equal(ledger.evidence_entries.filter((entry) => entry.kind === "SESSION_ARTIFACT").length, 2);
  assert.equal(ledger.evidence_entries.filter((entry) => entry.kind === "MEASUREMENT_RECORD").length, 2);
  assert.equal(ledger.evidence_entries.filter((entry) => entry.kind === "FINAL_REPORT").length, 1);

  const verification = verifyEvidenceLedger(ledger, protocol, attestation, measurement);
  assert.equal(verification.ok, true);
  assert.equal(verification.sources_match, true);
  assert.equal(verification.attestation_matches, true);
  assert.equal(verification.measurement_matches, true);

  const roundTrip = parseEvidenceLedger(serializeEvidenceLedger(ledger));
  assert.deepEqual(roundTrip, ledger);
});

test("claim evaluation reports coverage without assessing truth", () => {
  const { protocol, attestation, measurement } = completedSources();
  let ledger = createEvidenceLedger(protocol, attestation, measurement, {
    created_at: "2026-09-17T21:02:00Z",
  });
  ledger = addEvidenceClaim(ledger, {
    claim_id: "CLAIM-001",
    statement: "Both roles have a recorded post-session score and the source chain is intact.",
    scope: "DESCRIPTIVE",
    created_at: "2026-09-17T21:03:00Z",
    requirements: [
      { requirement_id: "REQ-ATTEST", kind: "ATTESTATION_INTEGRITY" },
      { requirement_id: "REQ-CONTROL", kind: "METRIC_ROLE_RECORDS", role: "CONTROL", metric_id: "M-SCORE", min_count: 1 },
      { requirement_id: "REQ-EXPERIMENT", kind: "METRIC_ROLE_RECORDS", role: "EXPERIMENT", metric_id: "M-SCORE", min_count: 1 },
    ],
  });

  const evaluation = evaluateEvidenceClaim(ledger, "CLAIM-001");
  assert.equal(evaluation.coverage_status, "COMPLETE_FOR_DECLARED_REQUIREMENTS");
  assert.equal(evaluation.truth_assessed, false);
  assert.equal(evaluation.causal_claim_permitted, false);
  assert.equal(evaluation.metaphysical_proof_permitted, false);
});

test("missing evidence is explicit and never imputed into support", () => {
  const { protocol, attestation, measurement } = completedSources();
  let ledger = createEvidenceLedger(protocol, attestation, measurement, {
    created_at: "2026-09-17T21:02:00Z",
  });
  ledger = addEvidenceClaim(ledger, {
    claim_id: "CLAIM-INSUFFICIENT",
    statement: "The declared requirement asks for more experimental measurements than exist.",
    scope: "DESCRIPTIVE",
    created_at: "2026-09-17T21:04:00Z",
    requirements: [{
      requirement_id: "REQ-THREE-EXPERIMENT-SCORES",
      kind: "METRIC_ROLE_RECORDS",
      role: "EXPERIMENT",
      metric_id: "M-SCORE",
      min_count: 3,
    }],
  });
  const evaluation = evaluateEvidenceClaim(ledger, "CLAIM-INSUFFICIENT");
  assert.equal(evaluation.coverage_status, "INSUFFICIENT");
  assert.deepEqual(evaluation.missing_requirements, ["REQ-THREE-EXPERIMENT-SCORES"]);
  assert.equal(evaluation.requirements[0].observed_count, 1);
  assert.equal(evaluation.requirements[0].required_count, 3);
});

test("ledger digest detects content tampering", () => {
  const { protocol, attestation, measurement } = completedSources();
  const ledger = createEvidenceLedger(protocol, attestation, measurement, {
    created_at: "2026-09-17T21:02:00Z",
  });
  const tampered = JSON.parse(JSON.stringify(ledger));
  const measurementEntry = tampered.evidence_entries.find((entry) => entry.kind === "MEASUREMENT_RECORD");
  measurementEntry.metadata.value = 999;
  const validation = validateEvidenceLedger(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) => issue.includes("ledger_digest mismatch")));
});

test("index exposes evidence counts and no automatic truth inference", () => {
  const { protocol, attestation, measurement } = completedSources();
  const ledger = createEvidenceLedger(protocol, attestation, measurement);
  const index = evidenceLedgerIndex(ledger);
  assert.equal(index.evidence.sessions, 2);
  assert.equal(index.evidence.measurements, 2);
  assert.equal(index.evidence.reports, 1);
  assert.equal(index.automatic_truth_inference, false);
});
