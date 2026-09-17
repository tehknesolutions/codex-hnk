import test from "node:test";
import assert from "node:assert/strict";
import {
  addExperimentArtifact,
  createExperimentProtocol,
  experimentDescriptiveSummary,
  finalizeExperimentProtocol,
  parseExperimentProtocol,
  serializeExperimentProtocol,
  validateExperimentProtocol,
} from "../src/index.mjs";
import { createRuntimeSessionArtifact } from "@hnk/runtime-session-artifact";
import { applySymbolicRuntimeEvent, createSymbolicRuntimeSession } from "@hnk/symbolic-runtime-contract";

function runtimeArtifact(sessionId, resultState) {
  const createdAt = "2026-09-17T19:00:00Z";
  let session = createSymbolicRuntimeSession({
    session_id: sessionId,
    created_at: createdAt,
    intention: "Registrar uma execução observável.",
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
  apply("SPECIFY", { path_id: "PATH-TEST", from_state: "BASELINE", to_state: "TARGET", constraints: ["registrar observação"] }, 1);
  apply("CONSTRUCT", { construction_id: `${sessionId}-construction`, steps: [{ step_id: "step-1", action: "executar prática" }] }, 2);
  apply("BIND", { vessel: { vessel_id: `${sessionId}-vessel`, context_type: "TEST", context_ref: "LOCAL" } }, 3);
  apply("ACTIVATE", undefined, 4);
  apply("OBSERVE", { observation_id: `${sessionId}-observation`, raw: `observação ${sessionId}` }, 5);
  apply("FEEDBACK", { feedback_id: `${sessionId}-feedback`, assessment: "registro concluído", next_action: "CLOSE" }, 6);
  apply("COMPLETE", { result_state: resultState, evidence_scope: "SELF_REPORTED", evidence: [{ note: "teste" }] }, 7);
  return createRuntimeSessionArtifact({
    session,
    exported_at: "2026-09-17T19:10:00Z",
    initial: {
      session_id: sessionId,
      created_at: createdAt,
      intention: "Registrar uma execução observável.",
      current_state: "BASELINE",
      target_state: "TARGET",
    },
  });
}

function preregistration() {
  return createExperimentProtocol({
    experiment_id: "EXP-001",
    created_at: "2026-09-17T18:00:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    title: "Controle versus condição experimental",
    question: "Os registros diferem entre as duas condições?",
    hypothesis: "Pode haver diferença descritiva entre os registros.",
    plan: {
      observed_variables: ["result_state", "observation_count"],
      controlled_variables: ["mesmo runtime contract"],
      intervention: "Aplicar condição simbólica somente ao grupo experimental.",
      control_sessions_required: 1,
      experimental_sessions_required: 1,
      completion_criteria: ["um artifact válido em cada papel"],
      exclusion_criteria: ["artifact com replay inválido"],
    },
  });
}

test("preregistration is locked before any runtime artifact", () => {
  const protocol = preregistration();
  assert.equal(protocol.status, "PREREGISTERED");
  assert.equal(protocol.preregistration_locked, true);
  assert.equal(protocol.sessions.length, 0);
  assert.equal(validateExperimentProtocol(protocol).ok, true);
});

test("control + experiment artifacts advance to ready and finalize separately from interpretation", () => {
  let protocol = preregistration();
  protocol = addExperimentArtifact(protocol, {
    assignment_id: "A-CONTROL",
    role: "CONTROL",
    added_at: "2026-09-17T20:00:00Z",
    artifact: runtimeArtifact("session-control", "CONTROL_RESULT"),
  });
  assert.equal(protocol.status, "IN_PROGRESS");

  protocol = addExperimentArtifact(protocol, {
    assignment_id: "B-EXPERIMENT",
    role: "EXPERIMENT",
    added_at: "2026-09-17T20:30:00Z",
    artifact: runtimeArtifact("session-experiment", "EXPERIMENT_RESULT"),
  });
  assert.equal(protocol.status, "READY_TO_FINALIZE");

  const summary = experimentDescriptiveSummary(protocol);
  assert.equal(summary.counts.control, 1);
  assert.equal(summary.counts.experiment, 1);

  protocol = finalizeExperimentProtocol(protocol, {
    completed_at: "2026-09-17T21:00:00Z",
    descriptive_summary: "As sessões produziram estados resultantes diferentes nos registros.",
    interpretation: "A diferença pode ser investigada, sem atribuir causalidade.",
    limitations: ["amostra mínima", "evidência auto-relatada"],
  });
  assert.equal(protocol.status, "COMPLETED");
  assert.equal(protocol.report.causal_claim_permitted, false);
  assert.equal(protocol.report.metaphysical_proof_permitted, false);
  assert.equal(validateExperimentProtocol(protocol).ok, true);

  const roundTrip = parseExperimentProtocol(serializeExperimentProtocol(protocol));
  assert.deepEqual(roundTrip, protocol);
});

test("same runtime session cannot be assigned twice", () => {
  const artifact = runtimeArtifact("same-session", "RESULT");
  let protocol = addExperimentArtifact(preregistration(), {
    assignment_id: "A",
    role: "CONTROL",
    added_at: "2026-09-17T20:00:00Z",
    artifact,
  });
  assert.throws(() => addExperimentArtifact(protocol, {
    assignment_id: "B",
    role: "EXPERIMENT",
    added_at: "2026-09-17T20:01:00Z",
    artifact,
  }), /already assigned/);
});
