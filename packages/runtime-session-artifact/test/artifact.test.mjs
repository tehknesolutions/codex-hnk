import test from "node:test";
import assert from "node:assert/strict";
import {
  applySymbolicRuntimeEvent,
  createSymbolicRuntimeSession,
} from "@hnk/symbolic-runtime-contract";
import {
  compareRuntimeSessionArtifacts,
  createRuntimeSessionArtifact,
  parseRuntimeSessionArtifact,
  replayRuntimeSessionArtifact,
  serializeRuntimeSessionArtifact,
  validateRuntimeSessionArtifact,
} from "../src/index.mjs";

function buildSession(resultState = "STATE-RESULT") {
  const initial = {
    session_id: "session-artifact-test",
    created_at: "2026-09-17T18:00:00.000Z",
    intention: "Test deterministic artifact replay.",
    current_state: "STATE-0",
    target_state: "STATE-1",
  };

  let session = createSymbolicRuntimeSession(initial);
  const events = [
    { event_id: "e1", type: "SPECIFY", at: "2026-09-17T18:01:00.000Z", payload: { path_id: "PATH-1", from_state: "STATE-0", to_state: "STATE-1", constraints: ["OBSERVE"] } },
    { event_id: "e2", type: "CONSTRUCT", at: "2026-09-17T18:02:00.000Z", payload: { construction_id: "C-1", steps: [{ step_id: "S-1", action: "Do test action" }] } },
    { event_id: "e3", type: "BIND", at: "2026-09-17T18:03:00.000Z", payload: { symbolic_key: { key_id: "K-1", reference: "GLYPH-1" }, vessel: { vessel_id: "V-1", context_type: "TEST", context_ref: "LOCAL" } } },
    { event_id: "e4", type: "ACTIVATE", at: "2026-09-17T18:04:00.000Z" },
    { event_id: "e5", type: "OBSERVE", at: "2026-09-17T18:05:00.000Z", payload: { observation_id: "O-1", raw: "Observed value", interpretation: "Interpretation kept separate" } },
    { event_id: "e6", type: "FEEDBACK", at: "2026-09-17T18:06:00.000Z", payload: { feedback_id: "F-1", assessment: "Review complete", next_action: "CLOSE" } },
    { event_id: "e7", type: "COMPLETE", at: "2026-09-17T18:07:00.000Z", payload: { result_state: resultState, evidence_scope: "SELF_REPORTED", evidence: [{ note: "test" }] } },
  ];

  for (const runtimeEvent of events) session = applySymbolicRuntimeEvent(session, runtimeEvent);
  return { initial, session };
}

test("exports, parses and deterministically replays a runtime artifact", () => {
  const { initial, session } = buildSession();
  const artifact = createRuntimeSessionArtifact({ session, initial, exported_at: "2026-09-17T18:08:00.000Z" });

  assert.equal(validateRuntimeSessionArtifact(artifact).ok, true);
  const serialized = serializeRuntimeSessionArtifact(artifact);
  const parsed = parseRuntimeSessionArtifact(serialized);
  const replay = replayRuntimeSessionArtifact(parsed);

  assert.equal(replay.ok, true);
  assert.equal(replay.matches_snapshot, true);
  assert.deepEqual(replay.replayed, session);
});

test("detects snapshot tampering through deterministic replay", () => {
  const { initial, session } = buildSession();
  const artifact = createRuntimeSessionArtifact({ session, initial, exported_at: "2026-09-17T18:08:00.000Z" });
  const tampered = JSON.parse(JSON.stringify(artifact));
  tampered.session.result.result_state = "TAMPERED";
  tampered.session.current_state = "TAMPERED";

  const validation = validateRuntimeSessionArtifact(tampered);
  assert.equal(validation.ok, false);
  assert.match(validation.issues.join(" | "), /replay/i);
});

test("compares two valid artifacts without assigning causal meaning", () => {
  const leftBuilt = buildSession("RESULT-A");
  const rightBuilt = buildSession("RESULT-B");
  const left = createRuntimeSessionArtifact({ ...leftBuilt, exported_at: "2026-09-17T18:08:00.000Z" });
  const right = createRuntimeSessionArtifact({ ...rightBuilt, exported_at: "2026-09-17T18:09:00.000Z" });

  const comparison = compareRuntimeSessionArtifacts(left, right);
  assert.equal(comparison.compatible, true);
  assert.equal(comparison.same_event_sequence, true);
  assert.ok(comparison.differences.includes("result_state"));
});
