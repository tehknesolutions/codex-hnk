import type { CompleteDayRequestV1 } from './types.js';

export const DAY010_COMPLETION={
 day:10,
 completionContractId:'HNK-KETHER-D010-COMP-V1',
 questDefinitionId:'HNK-KETHER-D010-V1',
 canonicalSourceSha:'167b3380e029456be1571f1d6dc3d491775acec5',
 canonicalXp:100,
 deploymentState:'active',
} as const;

export function buildDay010CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{return{
 day:10,sessionId:input.sessionId,completionContractId:DAY010_COMPLETION.completionContractId,questDefinitionId:DAY010_COMPLETION.questDefinitionId,canonicalSourceSha:DAY010_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,clientCompletedAt:input.clientCompletedAt,localRecordHash:input.localRecordHash,mode:'first_completion'
}}
