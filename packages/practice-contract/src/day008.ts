import type { SafeMetricRecord } from './types.js';

export const DAY008_QUEST_ID = 'HNK-KETHER-D008-V1' as const;
export const DAY008_SOURCE_SHA = 'df7c39ced019ead6eb0be817a1ac638789d40c3c' as const;

export interface Day008EvidenceV1 {
  protocol_version: typeof DAY008_QUEST_ID;
  source_sha: typeof DAY008_SOURCE_SHA;
  session_id: string;
  mode?: 'first_completion' | 'revisit';
  jachin: { body_relaxation_completed:true; countdown_completed:true; final_number:number; attention_returns:number; easiest_body_region_vault_ref?:string|null; return_confirmed:true };
  boaz: { countdown_completed:true; final_number:number; distractions_noted_count:number; adjustment_recorded:true; adjustment_vault_entry_ref?:string|null; return_confirmed:true };
  middle: { sequence_completed:true; final_number:number; silent_observation_seconds:number; return_confirmed:true };
  soul_mirror: { completed:true; relaxation_rating:number; attention_stability_rating:number; forcing_rating:number; vault_entry_ref?:string|null };
  voluntary_completion_confirmed: true;
  safety_stop_occurred?: boolean;
}

export interface Day008EvidenceInput {
  sessionId: string;
  mode?: 'first_completion' | 'revisit';
  jachin: { finalNumber:number; attentionReturns:number; easiestBodyRegionVaultRef?:string|null };
  boaz: { finalNumber:number; distractionsNotedCount:number; adjustmentVaultEntryRef?:string|null };
  middle: { finalNumber:number; silentObservationSeconds:number };
  soulMirror: { relaxationRating:number; attentionStabilityRating:number; forcingRating:number; vaultEntryRef?:string|null };
  safetyStopOccurred?: boolean;
}

function nonNegative(v:number,label:string){ if(!Number.isInteger(v)||v<0) throw new Error(`invalid_${label}`); }
function finalNumber(v:number,label:string){ if(!Number.isInteger(v)||v<1||v>100) throw new Error(`invalid_${label}`); }
function rating(v:number,label:string){ if(!Number.isInteger(v)||v<0||v>10) throw new Error(`invalid_${label}`); }
function ref(v:string|null|undefined,label:string){ if(v==null)return; const x=v.trim(); if(!x||x.length>256||/\s/.test(x)) throw new Error(`invalid_${label}`); }

export function buildDay008EvidenceV1(i:Day008EvidenceInput):Day008EvidenceV1 {
  if(!i.sessionId.trim()) throw new Error('practice_session_id_required');
  finalNumber(i.jachin.finalNumber,'jachin_final_number'); nonNegative(i.jachin.attentionReturns,'attention_returns'); ref(i.jachin.easiestBodyRegionVaultRef,'easiest_body_region_ref');
  finalNumber(i.boaz.finalNumber,'boaz_final_number'); nonNegative(i.boaz.distractionsNotedCount,'distractions_noted_count'); ref(i.boaz.adjustmentVaultEntryRef,'adjustment_ref');
  finalNumber(i.middle.finalNumber,'middle_final_number'); if(!Number.isInteger(i.middle.silentObservationSeconds)||i.middle.silentObservationSeconds<60) throw new Error('silent_observation_min_60');
  rating(i.soulMirror.relaxationRating,'relaxation_rating'); rating(i.soulMirror.attentionStabilityRating,'attention_stability_rating'); rating(i.soulMirror.forcingRating,'forcing_rating'); ref(i.soulMirror.vaultEntryRef,'mirror_ref');
  return {
    protocol_version:DAY008_QUEST_ID, source_sha:DAY008_SOURCE_SHA, session_id:i.sessionId, mode:i.mode,
    jachin:{body_relaxation_completed:true,countdown_completed:true,final_number:i.jachin.finalNumber,attention_returns:i.jachin.attentionReturns,easiest_body_region_vault_ref:i.jachin.easiestBodyRegionVaultRef,return_confirmed:true},
    boaz:{countdown_completed:true,final_number:i.boaz.finalNumber,distractions_noted_count:i.boaz.distractionsNotedCount,adjustment_recorded:true,adjustment_vault_entry_ref:i.boaz.adjustmentVaultEntryRef,return_confirmed:true},
    middle:{sequence_completed:true,final_number:i.middle.finalNumber,silent_observation_seconds:i.middle.silentObservationSeconds,return_confirmed:true},
    soul_mirror:{completed:true,relaxation_rating:i.soulMirror.relaxationRating,attention_stability_rating:i.soulMirror.attentionStabilityRating,forcing_rating:i.soulMirror.forcingRating,vault_entry_ref:i.soulMirror.vaultEntryRef},
    voluntary_completion_confirmed:true,safety_stop_occurred:i.safetyStopOccurred,
  };
}

export function buildDay008SafeMetrics(i:{totalDurationSeconds:number;attentionReturns?:number;distractionsNotedCount?:number}):SafeMetricRecord {
  nonNegative(i.totalDurationSeconds,'total_duration_seconds'); nonNegative(i.attentionReturns??0,'attention_returns'); nonNegative(i.distractionsNotedCount??0,'distractions_noted_count');
  return {total_duration_seconds:i.totalDurationSeconds,attention_returns:i.attentionReturns??0,distractions_noted_count:i.distractionsNotedCount??0};
}
