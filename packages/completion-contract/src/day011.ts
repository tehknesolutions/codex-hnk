import type { CompleteDayRequestV1 } from './types.js';

export const DAY011_COMPLETION={
 day:11,
 completionContractId:'HNK-KETHER-D011-COMP-V1',
 questDefinitionId:'HNK-KETHER-D011-V1',
 canonicalSourceSha:'9b7140dee8d346a4ea81dd753d342e4c1f172b0d',
 canonicalXp:100,
 deploymentState:'draft',
} as const;

export function buildDay011CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{return{
 day:11,sessionId:input.sessionId,completionContractId:DAY011_COMPLETION.completionContractId,questDefinitionId:DAY011_COMPLETION.questDefinitionId,canonicalSourceSha:DAY011_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,clientCompletedAt:input.clientCompletedAt,localRecordHash:input.localRecordHash,mode:'first_completion'
}}
