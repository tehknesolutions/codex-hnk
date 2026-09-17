import test from "node:test";
import assert from "node:assert/strict";
import {
  HNK_SYMBOLIC_RUNTIME_CANON_SOURCES,
  HNK_SYMBOLIC_RUNTIME_CONTRACT_ID,
  applySymbolicRuntimeEvent,
  createSymbolicRuntimeSession,
  symbolicRuntimeSummary,
  validateSymbolicRuntimeSession,
} from "../src/index.mjs";

function runHappyPath() {
  let session = createSymbolicRuntimeSession({
    session_id: "SRT-TEST-001",
    created_at: "2026-09-17T17:00:00Z",
    intention: "Testar um ciclo observável do runtime.",
    current_state: "STATE_A",
    target_state: "STATE_B",
  });

  session = applySymbolicRuntimeEvent(session, {
    event_id: "E01",
    type: "GENERATE",
    at: "2026-09-17T17:00:01Z",
    payload: { candidate_id: "C01", label: "PATH_A", rationale: "Fixture determinístico" },
  });
  session = applySymbolicRuntimeEvent(session, {
    event_id: "E02",
    type: "SPECIFY",
    at: "2026-09-17T17:00:02Z",
    payload: {
      path_id: "PATH_A",
      from_state: "STATE_A",
      to_state: "STATE_B",
      constraints: ["OBSERVABLE_ONLY"],
    },
  });
  session = applySymbolicRuntimeEvent(session, {
    event_id: "E03",
    type: "CONSTRUCT",
    at: "2026-09-17T17:00:03Z",
    payload: {
      construction_id: "BUILD-01",
      steps: [{ step_id: "STEP-01", action: "Executar ação de teste" }],
    },
  });
  session = applySymbolicRuntimeEvent(session, {
    event_id: "E04",
    type: "BIND",
    at: "2026-09-17T17:00:04Z",
    payload: {
      symbolic_key: { key_id: "KEY-01", reference: "G01" },
      vessel: { vessel_id: "VESSEL-01", context_type: "TEST", context_ref: "runtime-fixture" },
    },
  });
  session = applySymbolicRuntimeEvent(session, {
    event_id: "E05",
    type: "ACTIVATE",
    at: "2026-09-17T17:00:05Z",
  });
  session = applySymbolicRuntimeEvent(session, {
    event_id: "E06",
    type: "OBSERVE",
    at: "2026-09-17T17:00:06Z",
    payload: {
      observation_id: "OBS-01",
      raw: "A tarefa foi concluída em uma execução.",
      interpretation: "O caminho de teste funcionou para esta fixture.",
    },
  });
  session = applySymbolicRuntimeEvent(session, {
    event_id: "E07",
    type: "FEEDBACK",
    at: "2026-09-17T17:00:07Z",
    payload: {
      feedback_id: "FB-01",
      assessment: "Resultado compatível com o alvo da fixture.",
      next_action: "CLOSE",
    },
  });
  session = applySymbolicRuntimeEvent(session, {
    event_id: "E08",
    type: "COMPLETE",
    at: "2026-09-17T17:00:08Z",
    payload: {
      result_state: "STATE_B",
      evidence_scope: "SYSTEM_MEASURED",
      evidence: [{ id: "EV-01", value: "fixture-pass" }],
    },
  });

  return session;
}

test("runtime contract is canon-backed and evidence scoped", () => {
  const summary = symbolicRuntimeSummary();
  assert.equal(summary.contract_id, HNK_SYMBOLIC_RUNTIME_CONTRACT_ID);
  assert.equal(summary.canon_contract_ok, true);
  assert.equal(summary.canon_dependencies, 16);
  assert.equal(HNK_SYMBOLIC_RUNTIME_CANON_SOURCES.length, 16);
  assert.equal(summary.metaphysical_efficacy_claimed, false);
});

test("happy path reaches CLOSED deterministically", () => {
  const session = runHappyPath();
  assert.equal(session.phase, "CLOSED");
  assert.equal(session.current_state, "STATE_B");
  assert.equal(session.events.length, 8);
  assert.equal(session.observations.length, 1);
  assert.equal(session.feedback.length, 1);
  assert.equal(session.result?.claim_boundary, "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF");
  assert.equal(validateSymbolicRuntimeSession(session).ok, true);
});

test("activation requires a bound vessel", () => {
  let session = createSymbolicRuntimeSession({
    session_id: "SRT-TEST-002",
    created_at: "2026-09-17T17:10:00Z",
    intention: "Teste de gate.",
    current_state: "A",
    target_state: "B",
  });
  session = applySymbolicRuntimeEvent(session, {
    event_id: "E01",
    type: "SPECIFY",
    at: "2026-09-17T17:10:01Z",
    payload: { path_id: "P", from_state: "A", to_state: "B", constraints: [] },
  });
  session = applySymbolicRuntimeEvent(session, {
    event_id: "E02",
    type: "CONSTRUCT",
    at: "2026-09-17T17:10:02Z",
    payload: { construction_id: "C", steps: [{ step_id: "S", action: "Ação" }] },
  });
  assert.throws(() => applySymbolicRuntimeEvent(session, {
    event_id: "E03",
    type: "ACTIVATE",
    at: "2026-09-17T17:10:03Z",
  }), /bound vessel/);
});

test("completion cannot bypass observation and feedback", () => {
  const session = createSymbolicRuntimeSession({
    session_id: "SRT-TEST-003",
    created_at: "2026-09-17T17:20:00Z",
    intention: "Teste de bypass.",
    current_state: "A",
    target_state: "B",
  });
  assert.throws(() => applySymbolicRuntimeEvent(session, {
    event_id: "E01",
    type: "COMPLETE",
    at: "2026-09-17T17:20:01Z",
    payload: { result_state: "B", evidence_scope: "OBSERVED" },
  }), /not allowed/);
});
