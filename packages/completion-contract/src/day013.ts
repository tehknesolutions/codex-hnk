import type { CompleteDayRequestV1 } from './types.js';

export const DAY013_COMPLETION={
 day:13,
 completionContractId:'HNK-KETHER-D013-COMP-V1',
 questDefinitionId:'HNK-KETHER-D013-V1',
 canonicalSourceSha:'b8203e7443af20298679c8f4ca84339e7815438a',
 canonicalXp:100,
 attributeProgression:{matrixVersion:'1.0.0',primaryAttribute:'INT',secondaryAttribute:'DIS',requestedGain:1,application:'SERVER_XP_EVENT_TRIGGER',cap:20},
 deploymentState:'active',
} as const;

export function buildDay013CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{return{
 day:13,sessionId:input.sessionId,completionContractId:DAY013_COMPLETION.completionContractId,questDefinitionId:DAY013_COMPLETION.questDefinitionId,canonicalSourceSha:DAY013_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,clientCompletedAt:input.clientCompletedAt,localRecordHash:input.localRecordHash,mode:'first_completion'
}}
