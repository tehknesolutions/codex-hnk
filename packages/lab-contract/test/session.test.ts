import { beforeEach, describe, expect, it } from "vitest";
import { registerLabDefinition } from "../src/definition.js";
import { advanceLabStep, applyAuthoritativeLabCompletion, markEvidenceReady, pauseLabSession, resumeLabSession, safetyStopLabSession, startLabSession } from "../src/session.js";

beforeEach(() => registerLabDefinition({
  dayId: "001", objective: "Execute protocol.", preparation: [],
  steps: [
    { stepId: "one", order: 1, title: "One", instruction: "First." },
    { stepId: "two", order: 2, title: "Two", instruction: "Second." },
  ],
  evidence: [{ evidenceId: "e", label: "Evidence", kind: "STRUCTURED", required: true }],
  completion: { authority: "SERVER", practiceResultCanPromoteCanon: false },
}));

describe("M8 execution session", () => {
  it("runs active → paused → active → evidence pending", () => {
    let s = startLabSession({ sessionId: "s1", dayId: "001", at: "2026-10-06T20:00:00Z" });
    s = pauseLabSession(s, "2026-10-06T20:01:00Z");
    s = resumeLabSession(s, "2026-10-06T20:02:00Z");
    s = advanceLabStep(s, "2026-10-06T20:03:00Z");
    s = advanceLabStep(s, "2026-10-06T20:04:00Z");
    expect(s.state).toBe("EVIDENCE_PENDING");
  });

  it("safety stop is terminal for the execution flow", () => {
    const s = safetyStopLabSession(startLabSession({ sessionId: "s2", dayId: "001", at: "2026-10-06T20:00:00Z" }), "discomfort", "2026-10-06T20:01:00Z");
    expect(s.state).toBe("SAFETY_STOPPED");
    expect(() => resumeLabSession(s, "2026-10-06T20:02:00Z")).toThrow("lab_resume_invalid_state");
  });

  it("requires accepted server receipt before COMPLETED", () => {
    let s = startLabSession({ sessionId: "s3", dayId: "001", at: "2026-10-06T20:00:00Z" });
    s = advanceLabStep(s, "2026-10-06T20:01:00Z");
    s = advanceLabStep(s, "2026-10-06T20:02:00Z");
    s = markEvidenceReady(s, "2026-10-06T20:03:00Z");
    expect(() => applyAuthoritativeLabCompletion(s, { accepted: false }, "2026-10-06T20:04:00Z")).toThrow("lab_authoritative_completion_required");
    expect(applyAuthoritativeLabCompletion(s, { accepted: true, completionId: "cmp-1" }, "2026-10-06T20:04:00Z").state).toBe("COMPLETED");
  });

  it("refuses dormant sessions", () => {
    expect(() => startLabSession({ sessionId: "s4", dayId: "073", at: "2026-10-06T20:00:00Z" })).toThrow("lab_not_executable:073");
  });
});
