import type { CompleteDayRequestV1 } from './types.js';

export const DAY008_COMPLETION = {
  day: 8,
  completionContractId: 'HNK-KETHER-D008-COMP-V1',
  questDefinitionId: 'HNK-KETHER-D008-V1',
  canonicalSourceSha: 'df7c39ced019ead6eb0be817a1ac638789d40c3c',
  canonicalXp: 150,
  deploymentState: 'not_deployed',
} as const;

export function buildDay008CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1 {
  return {
    day:8,
    sessionId:input.sessionId,
    completionContractId:DAY008_COMPLETION.completionContractId,
    questDefinitionId:DAY008_COMPLETION.questDefinitionId,
    canonicalSourceSha:DAY008_COMPLETION.canonicalSourceSha,
    clientCompletionId:input.clientCompletionId,
    clientCompletedAt:input.clientCompletedAt,
    localRecordHash:input.localRecordHash,
    mode:'first_completion',
  };
}
