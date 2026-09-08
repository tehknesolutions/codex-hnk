import type { CompleteDayRequestV1 } from './types.js';

export const DAY004_COMPLETION = {
  day: 4,
  completionContractId: 'HNK-KETHER-D004-COMP-V1',
  questDefinitionId: 'HNK-KETHER-D004-V1',
  canonicalSourceSha: '376964a263f3d4f07542fcf55ca3bf2c18c5fd94',
  canonicalXp: 100,
  deploymentState: 'reviewed',
} as const;

export function buildDay004CompletionRequest(input: {
  sessionId: string;
  clientCompletionId: string;
  localRecordHash?: string;
  clientCompletedAt?: string;
}): CompleteDayRequestV1 {
  return {
    day: DAY004_COMPLETION.day,
    sessionId: input.sessionId,
    completionContractId: DAY004_COMPLETION.completionContractId,
    questDefinitionId: DAY004_COMPLETION.questDefinitionId,
    canonicalSourceSha: DAY004_COMPLETION.canonicalSourceSha,
    clientCompletionId: input.clientCompletionId,
    clientCompletedAt: input.clientCompletedAt,
    localRecordHash: input.localRecordHash,
    mode: 'first_completion',
  };
}
