import type { SafeMetricRecord } from './types.js';

export const DAY009_QUEST_ID='HNK-KETHER-D009-V1' as const;
export const DAY009_SOURCE_SHA='bb0c3fa790a5945e53114ced4c354195111bea96' as const;
export type Day009RecallStatus='REMEMBERED'|'NO_RECALL';

export interface Day009EvidenceV1{
 protocol_version:typeof DAY009_QUEST_ID;source_sha:typeof DAY009_SOURCE_SHA;session_id:string;mode?:'first_completion'|'revisit';
 pre_sleep:{intention_set:true;sleep_episode_confirmed:true};
 wake:{recall_status:Day009RecallStatus;capture_method:'TEXT_VAULT'|'NO_RECALL';dream_vault_entry_ref?:string|null;emotion_recorded:boolean;scenario_recorded:boolean;first_detail_recorded:boolean};
 boaz:{separation_completed:true;interpretation_is_hypothesis_confirmed:true;sleep_protection_confirmed:true};
 middle:{associations_count:number;reflection_vault_entry_ref?:string|null;analysis_stopped_confirmed:true};
 soul_mirror:{completed:true;wake_time_recorded:true;sleep_quality_recorded:true;keyword_recorded:boolean};
 voluntary_completion_confirmed:true;safety_stop_occurred?:boolean;
}

export interface Day009EvidenceInput{
 sessionId:string;mode?:'first_completion'|'revisit';sleepEpisodeConfirmed:boolean;recallStatus:Day009RecallStatus;dreamVaultEntryRef?:string|null;
 emotionRecorded:boolean;scenarioRecorded:boolean;firstDetailRecorded:boolean;separationCompleted:boolean;interpretationIsHypothesisConfirmed:boolean;sleepProtectionConfirmed:boolean;
 associationsCount:number;reflectionVaultEntryRef?:string|null;analysisStoppedConfirmed:boolean;wakeTimeRecorded:boolean;sleepQualityRecorded:boolean;keywordRecorded:boolean;safetyStopOccurred?:boolean;
}

function ref(value:string|null|undefined,label:string){if(value==null)return;const x=value.trim();if(!x||x.length>256||/\s/.test(x))throw new Error(`invalid_${label}`)}

export function buildDay009EvidenceV1(i:Day009EvidenceInput):Day009EvidenceV1{
 if(!i.sessionId.trim())throw new Error('practice_session_id_required');
 if(!i.sleepEpisodeConfirmed)throw new Error('sleep_episode_confirmation_required');
 if(!i.separationCompleted||!i.interpretationIsHypothesisConfirmed||!i.sleepProtectionConfirmed)throw new Error('day009_boaz_required');
 if(!i.analysisStoppedConfirmed)throw new Error('day009_analysis_stop_required');
 if(!i.wakeTimeRecorded||!i.sleepQualityRecorded)throw new Error('day009_soul_mirror_required');
 if(!Number.isInteger(i.associationsCount)||i.associationsCount<0||i.associationsCount>3)throw new Error('day009_associations_invalid');
 ref(i.dreamVaultEntryRef,'dream_vault_ref');ref(i.reflectionVaultEntryRef,'reflection_vault_ref');
 if(i.recallStatus==='REMEMBERED'){
  if(!i.dreamVaultEntryRef||!i.reflectionVaultEntryRef)throw new Error('day009_vault_refs_required_for_recall');
  if(!i.emotionRecorded||!i.scenarioRecorded||!i.firstDetailRecorded)throw new Error('day009_recall_fields_required');
  if(i.associationsCount!==3)throw new Error('day009_three_associations_required');
 }else{
  if(i.dreamVaultEntryRef||i.reflectionVaultEntryRef)throw new Error('day009_no_recall_must_not_fake_vault_refs');
  if(i.associationsCount!==0)throw new Error('day009_no_recall_associations_zero');
 }
 return{
  protocol_version:DAY009_QUEST_ID,source_sha:DAY009_SOURCE_SHA,session_id:i.sessionId,mode:i.mode,
  pre_sleep:{intention_set:true,sleep_episode_confirmed:true},
  wake:{recall_status:i.recallStatus,capture_method:i.recallStatus==='REMEMBERED'?'TEXT_VAULT':'NO_RECALL',dream_vault_entry_ref:i.dreamVaultEntryRef,emotion_recorded:i.recallStatus==='REMEMBERED'?true:false,scenario_recorded:i.recallStatus==='REMEMBERED'?true:false,first_detail_recorded:i.recallStatus==='REMEMBERED'?true:false},
  boaz:{separation_completed:true,interpretation_is_hypothesis_confirmed:true,sleep_protection_confirmed:true},
  middle:{associations_count:i.associationsCount,reflection_vault_entry_ref:i.reflectionVaultEntryRef,analysis_stopped_confirmed:true},
  soul_mirror:{completed:true,wake_time_recorded:true,sleep_quality_recorded:true,keyword_recorded:i.keywordRecorded},
  voluntary_completion_confirmed:true,safety_stop_occurred:i.safetyStopOccurred,
 };
}

export function buildDay009SafeMetrics(i:{totalDurationSeconds:number}):SafeMetricRecord{if(!Number.isInteger(i.totalDurationSeconds)||i.totalDurationSeconds<0)throw new Error('invalid_total_duration_seconds');return{total_duration_seconds:i.totalDurationSeconds}}
