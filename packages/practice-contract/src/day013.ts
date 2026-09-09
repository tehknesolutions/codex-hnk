import type { SafeMetricRecord } from './types.js';

export const DAY013_QUEST_ID='HNK-KETHER-D013-V1' as const;
export const DAY013_SOURCE_SHA='b8203e7443af20298679c8f4ca84339e7815438a' as const;
export type Day013LoadResponse='NONE'|'ADJUSTED'|'STOPPED';

export interface Day013EvidenceV1{
 protocol_version:typeof DAY013_QUEST_ID;source_sha:typeof DAY013_SOURCE_SHA;session_id:string;mode?:'first_completion'|'revisit';
 jachin:{duration_seconds:number;last_valid_number:number;distraction_count:number;returned_without_irritation_confirmed:true;return_strategy_vault_entry_ref:string};
 boaz:{duration_seconds:number;last_valid_number:number;error_count:number;distraction_count:number;competition_avoidance_confirmed:true;relaxed_body_confirmed:true;load_response:Day013LoadResponse;first_error_correction_vault_entry_ref:string};
 middle:{duration_seconds:number;last_valid_number:number;breath_cue_followed_when_applicable:true;psalm_91_2_prayer_confirmed:true;attention_stability_score:number;discipline_error_return_vault_entry_ref:string};
 soul_mirror:{completed:true;dispersion_error_return_vault_entry_ref:string};
 voluntary_completion_confirmed:true;safety_stop_occurred?:boolean;
}

export interface Day013EvidenceInput{
 sessionId:string;mode?:'first_completion'|'revisit';
 jachinDurationSeconds:number;jachinLastValidNumber:number;jachinDistractionCount:number;jachinReturnedWithoutIrritationConfirmed:boolean;jachinReturnStrategyVaultEntryRef:string;
 boazDurationSeconds:number;boazLastValidNumber:number;boazErrorCount:number;boazDistractionCount:number;boazCompetitionAvoidanceConfirmed:boolean;boazRelaxedBodyConfirmed:boolean;boazLoadResponse:Day013LoadResponse;boazFirstErrorCorrectionVaultEntryRef:string;
 middleDurationSeconds:number;middleLastValidNumber:number;middleBreathCueFollowedWhenApplicable:boolean;psalm912PrayerConfirmed:boolean;attentionStabilityScore:number;middleDisciplineErrorReturnVaultEntryRef:string;
 soulMirrorCompleted:boolean;dispersionErrorReturnVaultEntryRef:string;safetyStopOccurred?:boolean;
}

function ref(v:string,label:string){const x=v.trim();if(!x||x.length>256||/\s/.test(x))throw new Error(`invalid_${label}`);return x}
function duration(v:number,label:string){if(!Number.isInteger(v)||v<1||v>86400)throw new Error(`invalid_${label}`);return v}
function count(v:number,label:string){if(!Number.isInteger(v)||v<0||v>1000000)throw new Error(`invalid_${label}`);return v}
function score(v:number){if(!Number.isInteger(v)||v<0||v>10)throw new Error('invalid_attention_stability_score');return v}
function sequenceNumber(v:number,label:string){if(!Number.isInteger(v)||v>993||v< -1000000||(1000-v)%7!==0)throw new Error(`invalid_${label}`);return v}

export function buildDay013EvidenceV1(i:Day013EvidenceInput):Day013EvidenceV1{
 if(!i.sessionId.trim())throw new Error('practice_session_id_required');
 if(!i.jachinReturnedWithoutIrritationConfirmed)throw new Error('day013_jachin_return_required');
 if(!i.boazCompetitionAvoidanceConfirmed||!i.boazRelaxedBodyConfirmed)throw new Error('day013_boaz_method_required');
 if(!['NONE','ADJUSTED','STOPPED'].includes(i.boazLoadResponse))throw new Error('day013_load_response_invalid');
 if(!i.middleBreathCueFollowedWhenApplicable||!i.psalm912PrayerConfirmed)throw new Error('day013_middle_required');
 if(!i.soulMirrorCompleted)throw new Error('day013_soul_mirror_required');
 return{
  protocol_version:DAY013_QUEST_ID,source_sha:DAY013_SOURCE_SHA,session_id:i.sessionId,mode:i.mode,
  jachin:{duration_seconds:duration(i.jachinDurationSeconds,'jachin_duration_seconds'),last_valid_number:sequenceNumber(i.jachinLastValidNumber,'jachin_last_valid_number'),distraction_count:count(i.jachinDistractionCount,'jachin_distraction_count'),returned_without_irritation_confirmed:true,return_strategy_vault_entry_ref:ref(i.jachinReturnStrategyVaultEntryRef,'jachin_return_strategy_vault_ref')},
  boaz:{duration_seconds:duration(i.boazDurationSeconds,'boaz_duration_seconds'),last_valid_number:sequenceNumber(i.boazLastValidNumber,'boaz_last_valid_number'),error_count:count(i.boazErrorCount,'boaz_error_count'),distraction_count:count(i.boazDistractionCount,'boaz_distraction_count'),competition_avoidance_confirmed:true,relaxed_body_confirmed:true,load_response:i.boazLoadResponse,first_error_correction_vault_entry_ref:ref(i.boazFirstErrorCorrectionVaultEntryRef,'boaz_first_error_correction_vault_ref')},
  middle:{duration_seconds:duration(i.middleDurationSeconds,'middle_duration_seconds'),last_valid_number:sequenceNumber(i.middleLastValidNumber,'middle_last_valid_number'),breath_cue_followed_when_applicable:true,psalm_91_2_prayer_confirmed:true,attention_stability_score:score(i.attentionStabilityScore),discipline_error_return_vault_entry_ref:ref(i.middleDisciplineErrorReturnVaultEntryRef,'middle_discipline_error_return_vault_ref')},
  soul_mirror:{completed:true,dispersion_error_return_vault_entry_ref:ref(i.dispersionErrorReturnVaultEntryRef,'dispersion_error_return_vault_ref')},
  voluntary_completion_confirmed:true,safety_stop_occurred:i.safetyStopOccurred
 };
}

export function buildDay013SafeMetrics(i:{totalDurationSeconds:number}):SafeMetricRecord{
 if(!Number.isInteger(i.totalDurationSeconds)||i.totalDurationSeconds<0)throw new Error('invalid_total_duration_seconds');
 return{total_duration_seconds:i.totalDurationSeconds};
}
