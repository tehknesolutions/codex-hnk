import type { SafeMetricRecord } from './types.js';

export const DAY011_QUEST_ID='HNK-KETHER-D011-V1' as const;
export const DAY011_SOURCE_SHA='9b7140dee8d346a4ea81dd753d342e4c1f172b0d' as const;

export interface Day011EvidenceV1{
 protocol_version:typeof DAY011_QUEST_ID;source_sha:typeof DAY011_SOURCE_SHA;session_id:string;mode?:'first_completion'|'revisit';
 jachin:{five_minute_observation_completed:true;blink_and_natural_breathing_confirmed:true;three_non_evaluative_characteristics_recorded:true;relationship_change_vault_entry_ref:string};
 boaz:{five_minute_observation_completed:true;judgment_labeling_completed:true;predominant_judgment_vault_entry_ref:string;returned_to_observation_confirmed:true;visual_strangeness_not_automatic_revelation_confirmed:true;safe_limit_confirmed:true};
 middle:{five_minute_observation_completed:true;see_before_judge_completed:true;psalm_91_2_prayer_confirmed:true;attention_stability_score:number;final_observation_vault_entry_ref:string};
 soul_mirror:{completed:true;observation_vs_interpretation_vault_entry_ref:string};
 voluntary_completion_confirmed:true;safety_stop_occurred?:boolean;
}

export interface Day011EvidenceInput{
 sessionId:string;mode?:'first_completion'|'revisit';
 jachinFiveMinutesCompleted:boolean;blinkAndNaturalBreathingConfirmed:boolean;threeNonEvaluativeCharacteristicsRecorded:boolean;relationshipChangeVaultEntryRef:string;
 boazFiveMinutesCompleted:boolean;judgmentLabelingCompleted:boolean;predominantJudgmentVaultEntryRef:string;returnedToObservationConfirmed:boolean;visualStrangenessNotAutomaticRevelationConfirmed:boolean;safeLimitConfirmed:boolean;
 middleFiveMinutesCompleted:boolean;seeBeforeJudgeCompleted:boolean;psalm912PrayerConfirmed:boolean;attentionStabilityScore:number;finalObservationVaultEntryRef:string;
 soulMirrorCompleted:boolean;observationVsInterpretationVaultEntryRef:string;safetyStopOccurred?:boolean;
}

function ref(v:string,label:string){const x=v.trim();if(!x||x.length>256||/\s/.test(x))throw new Error(`invalid_${label}`);return x}
function score(v:number){if(!Number.isInteger(v)||v<0||v>10)throw new Error('invalid_attention_stability_score');return v}

export function buildDay011EvidenceV1(i:Day011EvidenceInput):Day011EvidenceV1{
 if(!i.sessionId.trim())throw new Error('practice_session_id_required');
 if(!i.jachinFiveMinutesCompleted||!i.blinkAndNaturalBreathingConfirmed||!i.threeNonEvaluativeCharacteristicsRecorded)throw new Error('day011_jachin_required');
 if(!i.boazFiveMinutesCompleted||!i.judgmentLabelingCompleted||!i.returnedToObservationConfirmed||!i.visualStrangenessNotAutomaticRevelationConfirmed||!i.safeLimitConfirmed)throw new Error('day011_boaz_required');
 if(!i.middleFiveMinutesCompleted||!i.seeBeforeJudgeCompleted||!i.psalm912PrayerConfirmed)throw new Error('day011_middle_required');
 if(!i.soulMirrorCompleted)throw new Error('day011_soul_mirror_required');
 return{
  protocol_version:DAY011_QUEST_ID,source_sha:DAY011_SOURCE_SHA,session_id:i.sessionId,mode:i.mode,
  jachin:{five_minute_observation_completed:true,blink_and_natural_breathing_confirmed:true,three_non_evaluative_characteristics_recorded:true,relationship_change_vault_entry_ref:ref(i.relationshipChangeVaultEntryRef,'relationship_change_vault_ref')},
  boaz:{five_minute_observation_completed:true,judgment_labeling_completed:true,predominant_judgment_vault_entry_ref:ref(i.predominantJudgmentVaultEntryRef,'predominant_judgment_vault_ref'),returned_to_observation_confirmed:true,visual_strangeness_not_automatic_revelation_confirmed:true,safe_limit_confirmed:true},
  middle:{five_minute_observation_completed:true,see_before_judge_completed:true,psalm_91_2_prayer_confirmed:true,attention_stability_score:score(i.attentionStabilityScore),final_observation_vault_entry_ref:ref(i.finalObservationVaultEntryRef,'final_observation_vault_ref')},
  soul_mirror:{completed:true,observation_vs_interpretation_vault_entry_ref:ref(i.observationVsInterpretationVaultEntryRef,'observation_vs_interpretation_vault_ref')},
  voluntary_completion_confirmed:true,safety_stop_occurred:i.safetyStopOccurred
 };
}

export function buildDay011SafeMetrics(i:{totalDurationSeconds:number}):SafeMetricRecord{
 if(!Number.isInteger(i.totalDurationSeconds)||i.totalDurationSeconds<0)throw new Error('invalid_total_duration_seconds');
 return{total_duration_seconds:i.totalDurationSeconds};
}
