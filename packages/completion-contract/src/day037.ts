import type { CompleteDayRequestV1 } from "./types.js";

export const DAY037_COMPLETION = Object.freeze({
  day: 37,
  completionContractId: "HNK-CHOKHMAH-D037-COMP-RC2",
  questDefinitionId: "HNK-CHOKHMAH-D037-RC2",
  canonicalSourceSha: "70c0218e6ee41020a4146a73a87b0db02876f7fd650677da675fdebdb905fbf6",
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
