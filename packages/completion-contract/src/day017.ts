import type { CompleteDayRequestV1 } from './types.js';

export const DAY017_COMPLETION={
 day:17,
 completionContractId:'HNK-KETHER-D017-COMP-V1',
 questDefinitionId:'HNK-KETHER-D017-V1',
 canonicalSourceSha:'b712f912d9eefe1e021f6b8cee915a64751a2de3',
 canonicalXp:150,
 attributeProgression:{matrixVersion:'1.0.0',primaryAttribute:'HIP',secondaryAttribute:'SIN',requestedGain:1,application:'SERVER_XP_EVENT_TRIGGER'},
 deploymentState:'active',
} as const;

export function buildDay017CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{return{
 day:17,sessionId:input.sessionId,completionContractId:DAY017_COMPLETION.completionContractId,questDefinitionId:DAY017_COMPLETION.questDefinitionId,canonicalSourceSha:DAY017_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,clientCompletedAt:input.clientCompletedAt,localRecordHash:input.localRecordHash,mode:'first_completion'
}}
