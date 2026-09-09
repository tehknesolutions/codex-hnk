import type { SafeMetricRecord } from './types.js';

export const DAY016_QUEST_ID='HNK-KETHER-D016-V1' as const;
export const DAY016_SOURCE_SHA='cc19245af2b1b23c56bc337b6ec1bce5ead7b2e3' as const;

export interface Day016EvidenceV1{
 protocol_version:typeof DAY016_QUEST_ID;source_sha:typeof DAY016_SOURCE_SHA;session_id:string;mode?:'first_completion'|'revisit';
 jachin:{duration_seconds:300;prelabel_perception_count:3;automatic_label_noticed:true;returned_to_direct_experience:true;prelabel_and_label_vault_entry_ref:string};
 boaz:{duration_seconds:300;perception_interpretation_belief_separated:true;spoken_description_compared:true;association_not_external_fact_confirmed:true;layers_vault_entry_ref:string};
 middle:{duration_seconds:300;silence_listening_seconds:120;chosen_word_observation_seconds:120;final_prayer_seconds:60;psalm_6_4_prayer_confirmed:true;word_not_total_reality_confirmed:true;integration_vault_entry_ref:string};
 soul_mirror:{completed:true;helpful_word_vs_replacing_label_vault_entry_ref:string};
 voluntary_completion_confirmed:true;safety_stop_occurred?:boolean;
}

export interface Day016EvidenceInput{
 sessionId:string;mode?:'first_completion'|'revisit';
 jachinDurationSeconds:number;prelabelPerceptionCount:number;automaticLabelNoticed:boolean;returnedToDirectExperience:boolean;prelabelAndLabelVaultEntryRef:string;
 boazDurationSeconds:number;perceptionInterpretationBeliefSeparated:boolean;spokenDescriptionCompared:boolean;associationNotExternalFactConfirmed:boolean;layersVaultEntryRef:string;
 middleDurationSeconds:number;silenceListeningSeconds:number;chosenWordObservationSeconds:number;finalPrayerSeconds:number;psalm64PrayerConfirmed:boolean;wordNotTotalRealityConfirmed:boolean;integrationVaultEntryRef:string;
 soulMirrorCompleted:boolean;helpfulWordVsReplacingLabelVaultEntryRef:string;safetyStopOccurred?:boolean;
}

function ref(v:string,label:string){const x=v.trim();if(!x||x.length>256||/\s/.test(x))throw new Error(`invalid_${label}`);return x}
function exact(v:number,expected:number,label:string){if(!Number.isInteger(v)||v!==expected)throw new Error(`invalid_${label}`);return expected}
export function buildDay016EvidenceV1(i:Day016EvidenceInput):Day016EvidenceV1{
 if(!i.sessionId.trim())throw new Error('practice_session_id_required');
 if(i.prelabelPerceptionCount!==3||!i.automaticLabelNoticed||!i.returnedToDirectExperience)throw new Error('day016_jachin_observation_required');
 if(!i.perceptionInterpretationBeliefSeparated||!i.spokenDescriptionCompared||!i.associationNotExternalFactConfirmed)throw new Error('day016_boaz_layers_required');
 if(!i.psalm64PrayerConfirmed||!i.wordNotTotalRealityConfirmed)throw new Error('day016_middle_integration_required');
 if(!i.soulMirrorCompleted)throw new Error('day016_soul_mirror_required');
 return{
  protocol_version:DAY016_QUEST_ID,source_sha:DAY016_SOURCE_SHA,session_id:i.sessionId,mode:i.mode,
  jachin:{duration_seconds:exact(i.jachinDurationSeconds,300,'jachin_duration_seconds') as 300,prelabel_perception_count:3,automatic_label_noticed:true,returned_to_direct_experience:true,prelabel_and_label_vault_entry_ref:ref(i.prelabelAndLabelVaultEntryRef,'jachin_vault_ref')},
  boaz:{duration_seconds:exact(i.boazDurationSeconds,300,'boaz_duration_seconds') as 300,perception_interpretation_belief_separated:true,spoken_description_compared:true,association_not_external_fact_confirmed:true,layers_vault_entry_ref:ref(i.layersVaultEntryRef,'boaz_vault_ref')},
  middle:{duration_seconds:exact(i.middleDurationSeconds,300,'middle_duration_seconds') as 300,silence_listening_seconds:exact(i.silenceListeningSeconds,120,'silence_listening_seconds') as 120,chosen_word_observation_seconds:exact(i.chosenWordObservationSeconds,120,'chosen_word_observation_seconds') as 120,final_prayer_seconds:exact(i.finalPrayerSeconds,60,'final_prayer_seconds') as 60,psalm_6_4_prayer_confirmed:true,word_not_total_reality_confirmed:true,integration_vault_entry_ref:ref(i.integrationVaultEntryRef,'middle_vault_ref')},
  soul_mirror:{completed:true,helpful_word_vs_replacing_label_vault_entry_ref:ref(i.helpfulWordVsReplacingLabelVaultEntryRef,'soul_mirror_vault_ref')},
  voluntary_completion_confirmed:true,
  ...(typeof i.safetyStopOccurred==='boolean'?{safety_stop_occurred:i.safetyStopOccurred}:{})
 };
}

export function buildDay016SafeMetrics(i:{totalDurationSeconds:number}):SafeMetricRecord{
 if(!Number.isInteger(i.totalDurationSeconds)||i.totalDurationSeconds<0)throw new Error('invalid_total_duration_seconds');
 return{total_duration_seconds:i.totalDurationSeconds};
}
