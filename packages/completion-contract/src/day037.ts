import type { CompleteDayRequestV1 } from "./types.js";

export const DAY037_COMPLETION = Object.freeze({
  day: 37,
  completionContractId: "HNK-CHOKHMAH-D037-COMP-RC3",
  questDefinitionId: "HNK-CHOKHMAH-D037-RC3",
  canonicalSourceSha: "2d1d7ef1766d4a181389a3af94b9516f7b34a6eb",
  canonicalXp: 100,
});

export interface Day037CompletionInput {
  sessionId: string;
  clientCompletionId: string;
  localRecordHash?: string;
  clientCompletedAt?: string;
}

export function buildDay037CompletionRequest(input: Day037CompletionInput): CompleteDayRequestV1 {
  return {
    day: DAY037_COMPLETION.day,
    sessionId: input.sessionId,
    completionContractId: DAY037_COMPLETION.completionContractId,
    questDefinitionId: DAY037_COMPLETION.questDefinitionId,
    canonicalSourceSha: DAY037_COMPLETION.canonicalSourceSha,
    clientCompletionId: input.clientCompletionId,
    clientCompletedAt: input.clientCompletedAt,
    localRecordHash: input.localRecordHash,
    mode: "first_completion",
  };
}
