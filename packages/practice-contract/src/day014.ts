import type { SafeMetricRecord } from './types.js';
export const DAY014_QUEST_ID='HNK-KETHER-D014-V1' as const;
export const DAY014_SOURCE_SHA='31f7e171a5727926eac9a3e1c569ab9eff8ad245' as const;
export interface Day014EvidenceV1{
 protocol_version:typeof DAY014_QUEST_ID;source_sha:typeof DAY014_SOURCE_SHA;session_id:string;mode?:'first_completion'|'revisit';
 jachin:{duration_seconds:300;distraction_count:number;max_stability_seconds:number;returned_without_irritation_confirmed:true;return_strategy_vault_entry_ref:string};
 boaz:{duration_seconds:300;return_count:number;spontaneous_change_count:number;relaxed_body_confirmed:true;no_punishment_confirmed:true;spontaneous_change_not_automatic_revelation_confirmed:true;persistent_distraction_vault_entry_ref:string};
 middle:{duration_seconds:300;psalm_91_2_prayer_confirmed:true;attention_stability_score:number;image_dismissed_voluntarily:true;three_real_objects_observed:true;imagine_perceive_interpret_distinguished:true;final_vault_entry_ref:string};
 soul_mirror:{completed:true;stability_change_return_vault_entry_ref:string};
 voluntary_completion_confirmed:true;safety_stop_occurred?:boolean;
}
export interface Day014EvidenceInput{
 sessionId:string;mode?:'first_completion'|'revisit';
 jachinDurationSeconds:number;jachinDistractionCount:number;jachinMaxStabilitySeconds:number;jachinReturnedWithoutIrritationConfirmed:boolean;jachinReturnStrategyVaultEntryRef:string;
 boazDurationSeconds:number;boazReturnCount:number;boazSpontaneousChangeCount:number;boazRelaxedBodyConfirmed:boolean;boazNoPunishmentConfirmed:boolean;boazSpontaneousChangeNotAutomaticRevelationConfirmed:boolean;boazPersistentDistractionVaultEntryRef:string;
 middleDurationSeconds:number;psalm912PrayerConfirmed:boolean;attentionStabilityScore:number;imageDismissedVoluntarily:boolean;threeRealObjectsObserved:boolean;imaginePerceiveInterpretDistinguished:boolean;middleFinalVaultEntryRef:string;
 soulMirrorCompleted:boolean;stabilityChangeReturnVaultEntryRef:string;safetyStopOccurred?:boolean;
}
function ref(v:string,label:string){const x=v.trim();if(!x||x.length>256||/\s/.test(x))throw new Error(`invalid_${label}`);return x}
function count(v:number,label:string,max=1000000){if(!Number.isInteger(v)||v<0||v>max)throw new Error(`invalid_${label}`);return v}
function duration(v:number,label:string):300{if(v!==300)throw new Error(`invalid_${label}`);return 300}
function score(v:number){if(!Number.isInteger(v)||v<0||v>10)throw new Error('invalid_attention_stability_score');return v}
export function buildDay014EvidenceV1(i:Day014EvidenceInput):Day014EvidenceV1{
 if(!i.sessionId.trim())throw new Error('practice_session_id_required');if(!i.jachinReturnedWithoutIrritationConfirmed)throw new Error('day014_jachin_return_required');
 if(!i.boazRelaxedBodyConfirmed||!i.boazNoPunishmentConfirmed||!i.boazSpontaneousChangeNotAutomaticRevelationConfirmed)throw new Error('day014_boaz_method_required');
 if(!i.psalm912PrayerConfirmed||!i.imageDismissedVoluntarily||!i.threeRealObjectsObserved||!i.imaginePerceiveInterpretDistinguished)throw new Error('day014_middle_grounding_required');if(!i.soulMirrorCompleted)throw new Error('day014_soul_mirror_required');
 return{protocol_version:DAY014_QUEST_ID,source_sha:DAY014_SOURCE_SHA,session_id:i.sessionId,mode:i.mode,
  jachin:{duration_seconds:duration(i.jachinDurationSeconds,'jachin_duration_seconds'),distraction_count:count(i.jachinDistractionCount,'jachin_distraction_count'),max_stability_seconds:count(i.jachinMaxStabilitySeconds,'jachin_max_stability_seconds',300),returned_without_irritation_confirmed:true,return_strategy_vault_entry_ref:ref(i.jachinReturnStrategyVaultEntryRef,'jachin_return_strategy_vault_ref')},
  boaz:{duration_seconds:duration(i.boazDurationSeconds,'boaz_duration_seconds'),return_count:count(i.boazReturnCount,'boaz_return_count'),spontaneous_change_count:count(i.boazSpontaneousChangeCount,'boaz_spontaneous_change_count'),relaxed_body_confirmed:true,no_punishment_confirmed:true,spontaneous_change_not_automatic_revelation_confirmed:true,persistent_distraction_vault_entry_ref:ref(i.boazPersistentDistractionVaultEntryRef,'boaz_persistent_distraction_vault_ref')},
  middle:{duration_seconds:duration(i.middleDurationSeconds,'middle_duration_seconds'),psalm_91_2_prayer_confirmed:true,attention_stability_score:score(i.attentionStabilityScore),image_dismissed_voluntarily:true,three_real_objects_observed:true,imagine_perceive_interpret_distinguished:true,final_vault_entry_ref:ref(i.middleFinalVaultEntryRef,'middle_final_vault_ref')},
  soul_mirror:{completed:true,stability_change_return_vault_entry_ref:ref(i.stabilityChangeReturnVaultEntryRef,'soul_mirror_vault_ref')},voluntary_completion_confirmed:true,safety_stop_occurred:i.safetyStopOccurred};
}
export function buildDay014SafeMetrics(i:{totalDurationSeconds:number}):SafeMetricRecord{if(!Number.isInteger(i.totalDurationSeconds)||i.totalDurationSeconds<0)throw new Error('invalid_total_duration_seconds');return{total_duration_seconds:i.totalDurationSeconds}}
