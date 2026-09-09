import type { CompleteDayRequestV1 } from './types.js';

export const DAY014_COMPLETION={
 day:14,
 completionContractId:'HNK-KETHER-D014-COMP-V1',
 questDefinitionId:'HNK-KETHER-D014-V1',
 canonicalSourceSha:'31f7e171a5727926eac9a3e1c569ab9eff8ad245',
 canonicalXp:100,
 attributeProgression:{matrixVersion:'1.0.0',requestedGain:0,application:'NO_EXECUTABLE_GAIN_RULE'},
 deploymentState:'active',
} as const;

export function buildDay014CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{return{
 day:14,sessionId:input.sessionId,completionContractId:DAY014_COMPLETION.completionContractId,questDefinitionId:DAY014_COMPLETION.questDefinitionId,canonicalSourceSha:DAY014_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,clientCompletedAt:input.clientCompletedAt,localRecordHash:input.localRecordHash,mode:'first_completion'
}}
