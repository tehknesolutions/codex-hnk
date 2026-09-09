import type { CompleteDayRequestV1 } from './types.js';

export const DAY016_COMPLETION={
 day:16,
 completionContractId:'HNK-KETHER-D016-COMP-V1',
 questDefinitionId:'HNK-KETHER-D016-V1',
 canonicalSourceSha:'cc19245af2b1b23c56bc337b6ec1bce5ead7b2e3',
 canonicalXp:100,
 attributeProgression:{matrixVersion:'1.0.0',requestedGain:0,application:'NO_EXECUTABLE_GAIN_RULE'},
 deploymentState:'draft',
} as const;

export function buildDay016CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{return{
 day:16,sessionId:input.sessionId,completionContractId:DAY016_COMPLETION.completionContractId,questDefinitionId:DAY016_COMPLETION.questDefinitionId,canonicalSourceSha:DAY016_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,clientCompletedAt:input.clientCompletedAt,localRecordHash:input.localRecordHash,mode:'first_completion'
}}
