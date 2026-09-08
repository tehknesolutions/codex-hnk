import type { CompleteDayRequestV1 } from './types.js';

export const DAY006_COMPLETION = {
  day: 6,
  completionContractId: 'HNK-KETHER-D006-COMP-V1',
  questDefinitionId: 'HNK-KETHER-D006-V1',
  canonicalSourceSha: '923c43ae0a68d63a4c88f67d83076b72e0b06c39',
  canonicalXp: 100,
  deploymentState: 'not_deployed',
} as const;

export function buildDay006CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{
  return {day:6,sessionId:input.sessionId,completionContractId:DAY006_COMPLETION.completionContractId,questDefinitionId:DAY006_COMPLETION.questDefinitionId,canonicalSourceSha:DAY006_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,clientCompletedAt:input.clientCompletedAt,localRecordHash:input.localRecordHash,mode:'first_completion'};
}
