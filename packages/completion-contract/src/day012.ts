import type { CompleteDayRequestV1 } from './types.js';

export const DAY012_COMPLETION={
 day:12,
 completionContractId:'HNK-KETHER-D012-COMP-V1',
 questDefinitionId:'HNK-KETHER-D012-V1',
 canonicalSourceSha:'a3be33e6d390b6c507e284d6dad6aaf94ebd4294',
 canonicalXp:100,
 attributeProgression:{matrixVersion:'1.0.0',primaryAttribute:'PER',secondaryAttribute:'DIS',requestedGain:1,application:'SERVER_XP_EVENT_TRIGGER',cap:20},
 deploymentState:'draft',
} as const;

export function buildDay012CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{return{
 day:12,sessionId:input.sessionId,completionContractId:DAY012_COMPLETION.completionContractId,questDefinitionId:DAY012_COMPLETION.questDefinitionId,canonicalSourceSha:DAY012_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,clientCompletedAt:input.clientCompletedAt,localRecordHash:input.localRecordHash,mode:'first_completion'
}}
