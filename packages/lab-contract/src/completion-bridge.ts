import type { CompleteDayResponseV1 } from "@hnk/completion-contract";
import { applyAuthoritativeCompletion } from "@hnk/journey-contract";
import { applyAuthoritativeLabCompletion, type LabExecutionSession } from "./session.js";

export interface LabCompletionProjection {
  session: LabExecutionSession;
  journey: ReturnType<typeof applyAuthoritativeCompletion>;
}

export function projectAuthoritativeCompletion(
  session: LabExecutionSession,
  response: CompleteDayResponseV1,
): LabCompletionProjection {
  if (session.state !== "READY_FOR_COMPLETION") throw new Error("lab_completion_invalid_state");
  const expectedDay = Number(session.dayId);
  if (response.day !== expectedDay) throw new Error("lab_completion_day_mismatch");
  if (!response.server_completed_at?.trim()) throw new Error("lab_server_completed_at_required");

  // The server response is the authority. The bridge only projects that accepted
  // result into Lab execution state and personal Journey progress.
  const completionId = [
    response.completion_contract_id,
    response.quest_definition_id,
    response.server_completed_at,
  ].join(":");

  const journey = applyAuthoritativeCompletion({
    dayId: session.dayId,
    accepted: true,
    completionId,
    events: response.progression_events,
    serverCompletedAt: response.server_completed_at,
  });

  const completedSession = applyAuthoritativeLabCompletion(
    session,
    { accepted: true, completionId },
    response.server_completed_at,
  );

  return Object.freeze({ session: completedSession, journey });
}
