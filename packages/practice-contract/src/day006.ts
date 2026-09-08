import type { SafeMetricRecord } from './types.js';

export const DAY006_QUEST_ID = 'HNK-KETHER-D006-V1' as const;
export const DAY006_SOURCE_SHA = '923c43ae0a68d63a4c88f67d83076b72e0b06c39' as const;

export interface Day006EvidenceV1 {
  protocol_version: typeof DAY006_QUEST_ID;
  source_sha: typeof DAY006_SOURCE_SHA;
  session_id: string;
  mode?: 'first_completion' | 'revisit';
  jachin: { listening_completed: true; duration_seconds: number; sounds_noted_count: number; distractions_noted?: number; return_confirmed: true };
  boaz: { silence_practice_completed: true; duration_seconds: number; thought_returns: number; difficulties_recorded_count: number; difficulties_vault_entry_ref?: string | null; return_confirmed: true };
  middle: { voice_practice_completed: true; voice_recorded: boolean; encrypted_voice_ref?: string | null; return_confirmed: true };
  soul_mirror: { completed: true; difficulty_rating?: number | null; vault_entry_ref?: string | null };
  voluntary_completion_confirmed: true;
  safety_stop_occurred?: boolean;
}

export interface Day006EvidenceInput {
  sessionId: string;
  mode?: 'first_completion' | 'revisit';
  jachin: { durationSeconds: number; soundsNotedCount: number; distractionsNoted?: number };
  boaz: { durationSeconds: number; thoughtReturns: number; difficultiesRecordedCount: number; difficultiesVaultEntryRef?: string | null };
  middle: { voiceRecorded: boolean; encryptedVoiceRef?: string | null };
  soulMirror: { difficultyRating?: number | null; vaultEntryRef?: string | null };
  safetyStopOccurred?: boolean;
}

function nonNegative(value:number,label:string){if(!Number.isInteger(value)||value<0)throw new Error(`invalid_${label}`)}
function rating(value:number|null|undefined,label:string){if(value==null)return;if(!Number.isInteger(value)||value<0||value>10)throw new Error(`invalid_${label}`)}
function ref(value:string|null|undefined,label:string){if(value==null)return;const v=value.trim();if(!v||v.length>256||/\s/.test(v))throw new Error(`invalid_${label}`)}

export function buildDay006EvidenceV1(input: Day006EvidenceInput): Day006EvidenceV1 {
  if(!input.sessionId.trim()) throw new Error('practice_session_id_required');
  nonNegative(input.jachin.durationSeconds,'jachin_duration'); nonNegative(input.jachin.soundsNotedCount,'sounds_noted_count'); nonNegative(input.jachin.distractionsNoted??0,'distractions_noted');
  nonNegative(input.boaz.durationSeconds,'boaz_duration'); nonNegative(input.boaz.thoughtReturns,'thought_returns'); nonNegative(input.boaz.difficultiesRecordedCount,'difficulties_recorded_count');
  if(input.boaz.difficultiesRecordedCount<3) throw new Error('difficulties_recorded_count_min_3');
  ref(input.boaz.difficultiesVaultEntryRef,'difficulties_vault_entry_ref');
  ref(input.middle.encryptedVoiceRef,'encrypted_voice_ref'); if(input.middle.voiceRecorded&&!input.middle.encryptedVoiceRef) throw new Error('encrypted_voice_ref_required_when_recorded');
  rating(input.soulMirror.difficultyRating,'soul_mirror_difficulty_rating'); ref(input.soulMirror.vaultEntryRef,'soul_mirror_vault_entry_ref');
  return {
    protocol_version: DAY006_QUEST_ID, source_sha: DAY006_SOURCE_SHA, session_id: input.sessionId, mode: input.mode,
    jachin:{listening_completed:true,duration_seconds:input.jachin.durationSeconds,sounds_noted_count:input.jachin.soundsNotedCount,distractions_noted:input.jachin.distractionsNoted,return_confirmed:true},
    boaz:{silence_practice_completed:true,duration_seconds:input.boaz.durationSeconds,thought_returns:input.boaz.thoughtReturns,difficulties_recorded_count:input.boaz.difficultiesRecordedCount,difficulties_vault_entry_ref:input.boaz.difficultiesVaultEntryRef,return_confirmed:true},
    middle:{voice_practice_completed:true,voice_recorded:input.middle.voiceRecorded,encrypted_voice_ref:input.middle.encryptedVoiceRef,return_confirmed:true},
    soul_mirror:{completed:true,difficulty_rating:input.soulMirror.difficultyRating,vault_entry_ref:input.soulMirror.vaultEntryRef},
    voluntary_completion_confirmed:true,safety_stop_occurred:input.safetyStopOccurred,
  };
}

export function buildDay006SafeMetrics(input:{totalDurationSeconds:number;soundsNotedCount?:number;thoughtReturns?:number}):SafeMetricRecord{
  nonNegative(input.totalDurationSeconds,'total_duration_seconds');nonNegative(input.soundsNotedCount??0,'sounds_noted_count');nonNegative(input.thoughtReturns??0,'thought_returns');
  return {total_duration_seconds:input.totalDurationSeconds,sounds_noted_count:input.soundsNotedCount??0,thought_returns:input.thoughtReturns??0};
}
