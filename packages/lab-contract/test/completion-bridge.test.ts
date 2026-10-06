import { describe, expect, it } from "vitest";
import { projectAuthoritativeCompletion } from "../src/completion-bridge.js";

const session = {
  sessionId: "s1", dayId: "001", state: "READY_FOR_COMPLETION" as const,
  currentStep: 1, startedAt: "2026-10-06T20:00:00Z", updatedAt: "2026-10-06T20:10:00Z",
};

const response:any = {
  day: 1,
  completion_contract_id: "cc-1",
  quest_definition_id: "HNK-KETHER-D001-V2",
  canonical_source_sha: "sha",
  first_completion: true,
  xp_awarded: 1, xp_total: 1, initiatory_grade: 1, initiatory_title: "x",
  crown: {},
  progress: {},
  progression_events: ["NEXT_DAY_UNLOCKED"],
  server_completed_at: "2026-10-06T20:11:00Z",
};

describe("M8 completion/progress bridge", () => {
  it("projects one authoritative response into Lab and Journey completion", () => {
    const result = projectAuthoritativeCompletion(session, response);
    expect(result.session.state).toBe("COMPLETED");
    expect(result.journey.progress.state).toBe("COMPLETED");
    expect(result.journey.progress.dayId).toBe("001");
  });

  it("does not manufacture publication authority from progression events", () => {
    const day72 = { ...session, dayId: "072" };
    const result = projectAuthoritativeCompletion(day72, { ...response, day: 72 });
    expect(result.journey.nextTarget.status).toBe("DORMANT");
  });

  it("fails closed on server/session day mismatch", () => {
    expect(() => projectAuthoritativeCompletion(session, { ...response, day: 2 })).toThrow("lab_completion_day_mismatch");
  });

  it("requires the Lab to already be ready for authoritative completion", () => {
    expect(() => projectAuthoritativeCompletion({ ...session, state: "EVIDENCE_PENDING" }, response)).toThrow("lab_completion_invalid_state");
  });
});
