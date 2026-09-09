import type { SafeMetricRecord } from './types.js';

export const DAY012_QUEST_ID='HNK-KETHER-D012-V1' as const;
export const DAY012_SOURCE_SHA='a3be33e6d390b6c507e284d6dad6aaf94ebd4294' as const;
export type Day012DiscomfortResponse='NONE'|'ADJUSTED'|'STOPPED';

export interface Day012EvidenceV1{
 protocol_version:typeof DAY012_QUEST_ID;source_sha:typeof DAY012_SOURCE_SHA;session_id:string;mode?:'first_completion'|'revisit';
 safety:{stable_surface_confirmed:true;flammables_clear_confirmed:true;children_animals_clear_confirmed:true;continuous_supervision_confirmed:true;alert_not_sleepy_confirmed:true;natural_blinking_confirmed:true};
 jachin:{duration_seconds:number;distraction_count:number;returned_without_judgment_confirmed:true;return_vault_entry_ref:string};
 boaz:{duration_seconds:number;distraction_count:number;competition_avoidance_confirmed:true;discomfort_response:Day012DiscomfortResponse;no_forced_eye_strain_confirmed:true;distraction_discomfort_vault_entry_ref:string};
 middle:{duration_seconds:number;thought_return_without_restart_confirmed:true;simultaneous_awareness_confirmed:true;psalm_91_2_prayer_confirmed:true;attention_stability_score:number;final_vault_entry_ref:string;flame_extinguished_confirmed:true};
 soul_mirror:{completed:true;attention_distraction_return_vault_entry_ref:string};
 voluntary_completion_confirmed:true;safety_stop_occurred?:boolean;
}

export interface Day012EvidenceInput{
 sessionId:string;mode?:'first_completion'|'revisit';
 stableSurfaceConfirmed:boolean;flammablesClearConfirmed:boolean;childrenAnimalsClearConfirmed:boolean;continuousSupervisionConfirmed:boolean;alertNotSleepyConfirmed:boolean;naturalBlinkingConfirmed:boolean;
 jachinDurationSeconds:number;jachinDistractionCount:number;jachinReturnedWithoutJudgmentConfirmed:boolean;jachinReturnVaultEntryRef:string;
 boazDurationSeconds:number;boazDistractionCount:number;boazCompetitionAvoidanceConfirmed:boolean;boazDiscomfortResponse:Day012DiscomfortResponse;boazNoForcedEyeStrainConfirmed:boolean;boazDistractionDiscomfortVaultEntryRef:string;
 middleDurationSeconds:number;middleThoughtReturnWithoutRestartConfirmed:boolean;middleSimultaneousAwarenessConfirmed:boolean;psalm912PrayerConfirmed:boolean;attentionStabilityScore:number;middleFinalVaultEntryRef:string;flameExtinguishedConfirmed:boolean;
 soulMirrorCompleted:boolean;attentionDistractionReturnVaultEntryRef:string;safetyStopOccurred?:boolean;
}

function ref(v:string,label:string){const x=v.trim();if(!x||x.length>256||/\s/.test(x))throw new Error(`invalid_${label}`);return x}
function duration(v:number,label:string){if(!Number.isInteger(v)||v<1||v>600)throw new Error(`invalid_${label}`);return v}
function count(v:number,label:string){if(!Number.isInteger(v)||v<0||v>100000)throw new Error(`invalid_${label}`);return v}
function score(v:number){if(!Number.isInteger(v)||v<0||v>10)throw new Error('invalid_attention_stability_score');return v}

export function buildDay012EvidenceV1(i:Day012EvidenceInput):Day012EvidenceV1{
 if(!i.sessionId.trim())throw new Error('practice_session_id_required');
 if(!i.stableSurfaceConfirmed||!i.flammablesClearConfirmed||!i.childrenAnimalsClearConfirmed||!i.continuousSupervisionConfirmed||!i.alertNotSleepyConfirmed||!i.naturalBlinkingConfirmed)throw new Error('day012_fire_safety_gate_required');
 if(!i.jachinReturnedWithoutJudgmentConfirmed)throw new Error('day012_jachin_return_required');
 if(!i.boazCompetitionAvoidanceConfirmed||!i.boazNoForcedEyeStrainConfirmed)throw new Error('day012_boaz_safety_required');
 if(!['NONE','ADJUSTED','STOPPED'].includes(i.boazDiscomfortResponse))throw new Error('day012_discomfort_response_invalid');
 if(!i.middleThoughtReturnWithoutRestartConfirmed||!i.middleSimultaneousAwarenessConfirmed||!i.psalm912PrayerConfirmed||!i.flameExtinguishedConfirmed)throw new Error('day012_middle_required');
 if(!i.soulMirrorCompleted)throw new Error('day012_soul_mirror_required');
 return{
  protocol_version:DAY012_QUEST_ID,source_sha:DAY012_SOURCE_SHA,session_id:i.sessionId,mode:i.mode,
  safety:{stable_surface_confirmed:true,flammables_clear_confirmed:true,children_animals_clear_confirmed:true,continuous_supervision_confirmed:true,alert_not_sleepy_confirmed:true,natural_blinking_confirmed:true},
  jachin:{duration_seconds:duration(i.jachinDurationSeconds,'jachin_duration_seconds'),distraction_count:count(i.jachinDistractionCount,'jachin_distraction_count'),returned_without_judgment_confirmed:true,return_vault_entry_ref:ref(i.jachinReturnVaultEntryRef,'jachin_return_vault_ref')},
  boaz:{duration_seconds:duration(i.boazDurationSeconds,'boaz_duration_seconds'),distraction_count:count(i.boazDistractionCount,'boaz_distraction_count'),competition_avoidance_confirmed:true,discomfort_response:i.boazDiscomfortResponse,no_forced_eye_strain_confirmed:true,distraction_discomfort_vault_entry_ref:ref(i.boazDistractionDiscomfortVaultEntryRef,'boaz_distraction_discomfort_vault_ref')},
  middle:{duration_seconds:duration(i.middleDurationSeconds,'middle_duration_seconds'),thought_return_without_restart_confirmed:true,simultaneous_awareness_confirmed:true,psalm_91_2_prayer_confirmed:true,attention_stability_score:score(i.attentionStabilityScore),final_vault_entry_ref:ref(i.middleFinalVaultEntryRef,'middle_final_vault_ref'),flame_extinguished_confirmed:true},
  soul_mirror:{completed:true,attention_distraction_return_vault_entry_ref:ref(i.attentionDistractionReturnVaultEntryRef,'attention_distraction_return_vault_ref')},
  voluntary_completion_confirmed:true,safety_stop_occurred:i.safetyStopOccurred
 };
}

export function buildDay012SafeMetrics(i:{totalDurationSeconds:number}):SafeMetricRecord{
 if(!Number.isInteger(i.totalDurationSeconds)||i.totalDurationSeconds<0)throw new Error('invalid_total_duration_seconds');
 return{total_duration_seconds:i.totalDurationSeconds};
}
