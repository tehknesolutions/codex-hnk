import type { CompleteDayRequestV1 } from './types.js';

export const DAY003_COMPLETION = {
  day: 3,
  completionContractId: 'HNK-KETHER-D003-COMP-V1',
  questDefinitionId: 'HNK-KETHER-D003-V1',
  canonicalSourceSha: '3cb60ed208c24ee885cbe95d974c7468419120aa',
  canonicalXp: 100,
  deploymentState: 'reviewed',
} as const;

export function buildDay003CompletionRequest(input: {
  sessionId: string;
  clientCompletionId: string;
  localRecordHash?: string;
  clientCompletedAt?: string;
}): CompleteDayRequestV1 {
  return {
    day: 3,
    sessionId: input.sessionId,
    completionContractId: DAY003_COMPLETION.completionContractId,
    questDefinitionId: DAY003_COMPLETION.questDefinitionId,
    canonicalSourceSha: DAY003_COMPLETION.canonicalSourceSha,
    clientCompletionId: input.clientCompletionId,
    clientCompletedAt: input.clientCompletedAt,
    localRecordHash: input.localRecordHash,
    mode: 'first_completion',
  };
}
