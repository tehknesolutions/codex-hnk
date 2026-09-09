import type { CompleteDayRequestV1 } from './types.js';

export const DAY009_COMPLETION={
 day:9,
 completionContractId:'HNK-KETHER-D009-COMP-V1',
 questDefinitionId:'HNK-KETHER-D009-V1',
 canonicalSourceSha:'bb0c3fa790a5945e53114ced4c354195111bea96',
 canonicalXp:150,
 deploymentState:'not_deployed',
} as const;

export function buildDay009CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{return{
 day:9,sessionId:input.sessionId,completionContractId:DAY009_COMPLETION.completionContractId,questDefinitionId:DAY009_COMPLETION.questDefinitionId,canonicalSourceSha:DAY009_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,clientCompletedAt:input.clientCompletedAt,localRecordHash:input.localRecordHash,mode:'first_completion'
}}
