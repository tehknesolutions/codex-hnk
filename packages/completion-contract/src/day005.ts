import type { CompleteDayRequestV1 } from './types.js';

export const DAY005_COMPLETION = {
  day: 5,
  completionContractId: 'HNK-KETHER-D005-COMP-V1',
  questDefinitionId: 'HNK-KETHER-D005-V1',
  canonicalSourceSha: 'eb9f078bdc7654135f83fbcdf0aa7d5d38412cff',
  canonicalXp: 100,
  deploymentState: 'active',
} as const;

export function buildDay005CompletionRequest(input: {
  sessionId: string;
  clientCompletionId: string;
  localRecordHash?: string;
  clientCompletedAt?: string;
}): CompleteDayRequestV1 {
  return {
    day: DAY005_COMPLETION.day,
    sessionId: input.sessionId,
    completionContractId: DAY005_COMPLETION.completionContractId,
    questDefinitionId: DAY005_COMPLETION.questDefinitionId,
    canonicalSourceSha: DAY005_COMPLETION.canonicalSourceSha,
    clientCompletionId: input.clientCompletionId,
    clientCompletedAt: input.clientCompletedAt,
    localRecordHash: input.localRecordHash,
    mode: 'first_completion',
  };
}
