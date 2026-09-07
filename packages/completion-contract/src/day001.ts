import type { CompleteDayRequestV1 } from "./types.js";

export const DAY001_COMPLETION = Object.freeze({
  day: 1,
  completionContractId: "HNK-KETHER-D001-COMP-V2",
  questDefinitionId: "HNK-KETHER-D001-V2",
  canonicalSourceSha: "a01d13b43cbddb92236fc1e3b6c2a7e140d87d29",
  canonicalXp: 150,
});

export interface Day001CompletionInput {
  sessionId: string;
  clientCompletionId: string;
  localRecordHash?: string;
  clientCompletedAt?: string;
}

export function buildDay001CompletionRequest(input: Day001CompletionInput): CompleteDayRequestV1 {
  return {
    day: DAY001_COMPLETION.day,
    sessionId: input.sessionId,
    completionContractId: DAY001_COMPLETION.completionContractId,
    questDefinitionId: DAY001_COMPLETION.questDefinitionId,
    canonicalSourceSha: DAY001_COMPLETION.canonicalSourceSha,
    clientCompletionId: input.clientCompletionId,
    clientCompletedAt: input.clientCompletedAt,
    localRecordHash: input.localRecordHash,
    mode: "first_completion",
  };
}
