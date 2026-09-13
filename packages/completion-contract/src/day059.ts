import type {CompleteDayRequestV1} from './types.js';

export const DAY059_COMPLETION={
  day:59,
  completionContractId:'HNK-CHOKMAH-D059-COMP-V2',
  questDefinitionId:'HNK-CHOKMAH-D059-V2',
  canonicalSourceSha:'e0b9b51cac81012e4511e6394c6f3dff7f50aaf8',
  canonicalXp:150,
  attributeProgression:{requestedGain:0,application:'NONE',reason:'NO_FROZEN_DAY059_RULE_IN_ATTRIBUTE_PROGRESSION_MATRIX'},
  entryGate:{previousDay:58,requiresGrade:2,requiresTitle:'Iniciado',requiresChapter:2,requiresSephira:'Chokmah',application:'SERVER_ONLY',upstreamDay45AudioPublicationLockRespected:true},
  legacyCompatibility:{validator:'validate_day059_scalar_evidence_v1',reuseRequired:true},
  evidence:{blueDurationMinimumSeconds:900,grayDurationMinimumSeconds:900,blueImageRequired:false,grayImageRequired:false,absenceValid:true,privateAssociationsVault:'OPTIONAL'},
  privacy:{privateAssociations:'VAULT_E2EE_OPTIONAL',practiceRecord:'STRUCTURED_METRICS_FLAGS_AND_OPAQUE_UUIDS_ONLY',serverPlaintextForbidden:true},
  safety:{ocularPainStopsPractice:true,headacheStopsPractice:true,vertigoStopsPractice:true,anxietyIncreaseStopsPractice:true,disorientationStopsPractice:true,clairvoyanceClaimForbidden:true,externalMechanismProofClaimForbidden:true,highImpactUseForbidden:true},
  expectedProgression:{nextDay:60,chapter:2,sephira:'Chokmah',grade:2,title:'Iniciado',expectedProgressionEvents:['NEXT_DAY_UNLOCKED']},
  deploymentState:'active',
} as const;

export function buildDay059CompletionRequest(input:{sessionId:string;clientCompletionId:string;localRecordHash?:string;clientCompletedAt?:string}):CompleteDayRequestV1{
  return{day:59,sessionId:input.sessionId,completionContractId:DAY059_COMPLETION.completionContractId,questDefinitionId:DAY059_COMPLETION.questDefinitionId,canonicalSourceSha:DAY059_COMPLETION.canonicalSourceSha,clientCompletionId:input.clientCompletionId,...(input.clientCompletedAt?{clientCompletedAt:input.clientCompletedAt}:{}),...(input.localRecordHash?{localRecordHash:input.localRecordHash}:{}),mode:'first_completion'};
}
