import type { CompleteDayRequestV1 } from "./types.js";

export const DAY002_COMPLETION = Object.freeze({
  day: 2,
  completionContractId: "HNK-KETHER-D002-COMP-V1",
  questDefinitionId: "HNK-KETHER-D002-V1",
  canonicalSourceSha: "71019573414493ee9e5521f4d27ed744748c0d2b",
  canonicalXp: 100,
});

export interface Day002CompletionInput {
  sessionId: string;
  clientCompletionId: string;
  localRecordHash?: string;
  clientCompletedAt?: string;
}

export function buildDay002CompletionRequest(input: Day002CompletionInput): CompleteDayRequestV1 {
  return {
    day: DAY002_COMPLETION.day,
    sessionId: input.sessionId,
    completionContractId: DAY002_COMPLETION.completionContractId,
    questDefinitionId: DAY002_COMPLETION.questDefinitionId,
    canonicalSourceSha: DAY002_COMPLETION.canonicalSourceSha,
    clientCompletionId: input.clientCompletionId,
    clientCompletedAt: input.clientCompletedAt,
    localRecordHash: input.localRecordHash,
    mode: "first_completion",
  };
}
