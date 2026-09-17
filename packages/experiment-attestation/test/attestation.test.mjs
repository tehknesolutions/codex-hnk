import test from "node:test";
import assert from "node:assert/strict";
import {
  compareExperimentAttestations,
  createExperimentAttestation,
  parseExperimentAttestation,
  serializeExperimentAttestation,
  sha256Hex,
  validateExperimentAttestation,
  verifyExperimentAttestation,
} from "../src/index.mjs";
import {
  addExperimentArtifact,
  createExperimentProtocol,
  finalizeExperimentProtocol,
} from "@hnk/experiment-protocol";
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
    experiment_id: "EXP-ATTEST-001",
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

function completedProtocol() {
  let protocol = preregistration();
  protocol = addExperimentArtifact(protocol, {
    assignment_id: "CONTROL-1",
    role: "CONTROL",
    added_at: "2026-09-17T20:00:00Z",
    artifact: runtimeArtifact("session-control", "CONTROL_RESULT"),
  });
  protocol = addExperimentArtifact(protocol, {
    assignment_id: "EXPERIMENT-1",
    role: "EXPERIMENT",
    added_at: "2026-09-17T20:30:00Z",
    artifact: runtimeArtifact("session-experiment", "EXPERIMENT_RESULT"),
  });
  return finalizeExperimentProtocol(protocol, {
    completed_at: "2026-09-17T21:00:00Z",
    descriptive_summary: "Os registros encerraram em estados diferentes.",
    interpretation: "A diferença permanece descritiva e requer investigação adicional.",
    limitations: ["amostra mínima"],
  });
}

test("SHA-256 implementation matches the standard abc vector", () => {
  assert.equal(sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("preregistration fingerprint remains stable as sessions and report are added", () => {
  const before = createExperimentAttestation(preregistration(), { generated_at: "2026-09-17T18:06:00Z" });
  const after = createExperimentAttestation(completedProtocol(), { generated_at: "2026-09-17T21:01:00Z" });
  assert.equal(before.preregistration_digest, after.preregistration_digest);
  assert.notEqual(before.protocol_snapshot_digest, after.protocol_snapshot_digest);
  assert.equal(before.sessions.length, 0);
  assert.equal(after.sessions.length, 2);
  assert.ok(after.report);
  assert.notEqual(after.chain_head, after.preregistration_digest);

  const comparison = compareExperimentAttestations(before, after);
  assert.equal(comparison.same_experiment, true);
  assert.equal(comparison.same_preregistration, true);
  assert.equal(comparison.same_snapshot, false);
});

test("attestation verifies exact protocol content and round-trips", () => {
  const protocol = completedProtocol();
  const attestation = createExperimentAttestation(protocol, { generated_at: "2026-09-17T21:01:00Z" });
  assert.equal(validateExperimentAttestation(attestation).ok, true);
  const verification = verifyExperimentAttestation(attestation, protocol);
  assert.equal(verification.ok, true);
  assert.equal(verification.preregistration_matches, true);
  assert.equal(verification.snapshot_matches, true);
  assert.equal(verification.chain_matches, true);
  const roundTrip = parseExperimentAttestation(serializeExperimentAttestation(attestation));
  assert.deepEqual(roundTrip, attestation);
});

test("tampering with an artifact fingerprint breaks the hash chain", () => {
  const attestation = createExperimentAttestation(completedProtocol(), { generated_at: "2026-09-17T21:01:00Z" });
  const tampered = JSON.parse(JSON.stringify(attestation));
  tampered.sessions[0].artifact_digest = "0".repeat(64);
  const validation = validateExperimentAttestation(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) => issue.includes("chain_digest mismatch")));
});

test("content hashes do not pretend to prove authorship or trusted time", () => {
  const attestation = createExperimentAttestation(preregistration(), { generated_at: "2026-09-17T18:06:00Z" });
  assert.equal(attestation.scope, "CONTENT_INTEGRITY_ONLY");
  assert.equal(attestation.timestamp_authority, "NONE");
  assert.equal(attestation.identity_signature, "NONE");
  assert.equal(attestation.authorship_proof, false);
  assert.equal(attestation.trusted_timestamp_proof, false);
  assert.equal(attestation.causal_proof, false);
  assert.equal(attestation.metaphysical_proof, false);
});
