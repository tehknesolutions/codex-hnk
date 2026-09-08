import type { SafeMetricRecord } from './types.js';

export const DAY005_QUEST_ID = 'HNK-KETHER-D005-V1' as const;
export const DAY005_SOURCE_SHA = 'eb9f078bdc7654135f83fbcdf0aa7d5d38412cff' as const;
export const DAY005_THETA432_PROFILE_ID = 'HNK-THETA432-BINAURAL-V1' as const;
export const DAY005_DAI_KOO_MYO_ASSET_ID = 'HNK-KETHER-DAI-KOO-MYO-USUI-MASTER-V1' as const;

export interface Day005EvidenceV1 {
  protocol_version: typeof DAY005_QUEST_ID;
  source_sha: typeof DAY005_SOURCE_SHA;
  session_id: string;
  mode?: 'first_completion' | 'revisit';
  baseline: { tension_before: number; tension_after: number };
  jachin: { breath_completed: true; duration_seconds: number; natural_breathing_confirmed: true; camera_qr_used?: boolean; return_confirmed: true };
  audio_theta432: { started: true; profile_id: typeof DAY005_THETA432_PROFILE_ID; duration_seconds?: number | null; stopped_for_discomfort?: boolean };
  boaz: { gesture_completed: true; empty_hand_confirmed: true; forced_exhalation_avoided: true; journal_entry_recorded: true; journal_vault_entry_ref?: string | null; return_confirmed: true };
  middle: { dai_koo_myo_focus_completed: true; duration_seconds: number; asset_id: typeof DAY005_DAI_KOO_MYO_ASSET_ID; return_confirmed: true };
  soul_mirror: { completed: true; difficulty_rating?: number | null; vault_entry_ref?: string | null };
  voluntary_completion_confirmed: true;
  safety_stop_occurred?: boolean;
}

export interface Day005EvidenceInput {
  sessionId: string;
  mode?: 'first_completion' | 'revisit';
  baseline: { tensionBefore: number; tensionAfter: number };
  jachin: { durationSeconds: number; cameraQrUsed?: boolean };
  audio: { started: boolean; durationSeconds?: number | null; stoppedForDiscomfort?: boolean };
  boaz: { journalVaultEntryRef?: string | null };
  middle: { durationSeconds: number };
  soulMirror: { difficultyRating?: number | null; vaultEntryRef?: string | null };
  safetyStopOccurred?: boolean;
}

function rating(value: number, label: string): void { if (!Number.isInteger(value) || value < 0 || value > 10) throw new Error(`invalid_${label}`); }
function nonNegative(value: number, label: string): void { if (!Number.isInteger(value) || value < 0) throw new Error(`invalid_${label}`); }
function ref(value: string | null | undefined, label: string): void { if (value == null) return; const v=value.trim(); if (!v || v.length>256 || /\s/.test(v)) throw new Error(`invalid_${label}`); }

export function buildDay005EvidenceV1(input: Day005EvidenceInput): Day005EvidenceV1 {
  if (!input.sessionId.trim()) throw new Error('practice_session_id_required');
  rating(input.baseline.tensionBefore,'tension_before'); rating(input.baseline.tensionAfter,'tension_after');
  nonNegative(input.jachin.durationSeconds,'jachin_duration');
  if (!input.audio.started) throw new Error('day005_theta432_audio_required');
  nonNegative(input.audio.durationSeconds ?? 0,'audio_duration');
  ref(input.boaz.journalVaultEntryRef,'boaz_journal_vault_entry_ref');
  nonNegative(input.middle.durationSeconds,'middle_duration');
  if (input.soulMirror.difficultyRating != null) rating(input.soulMirror.difficultyRating,'soul_mirror_difficulty_rating');
  ref(input.soulMirror.vaultEntryRef,'soul_mirror_vault_entry_ref');
  return {
    protocol_version: DAY005_QUEST_ID,
    source_sha: DAY005_SOURCE_SHA,
    session_id: input.sessionId,
    mode: input.mode,
    baseline: { tension_before: input.baseline.tensionBefore, tension_after: input.baseline.tensionAfter },
    jachin: { breath_completed: true, duration_seconds: input.jachin.durationSeconds, natural_breathing_confirmed: true, camera_qr_used: input.jachin.cameraQrUsed, return_confirmed: true },
    audio_theta432: { started: true, profile_id: DAY005_THETA432_PROFILE_ID, duration_seconds: input.audio.durationSeconds, stopped_for_discomfort: input.audio.stoppedForDiscomfort },
    boaz: { gesture_completed: true, empty_hand_confirmed: true, forced_exhalation_avoided: true, journal_entry_recorded: true, journal_vault_entry_ref: input.boaz.journalVaultEntryRef, return_confirmed: true },
    middle: { dai_koo_myo_focus_completed: true, duration_seconds: input.middle.durationSeconds, asset_id: DAY005_DAI_KOO_MYO_ASSET_ID, return_confirmed: true },
    soul_mirror: { completed: true, difficulty_rating: input.soulMirror.difficultyRating, vault_entry_ref: input.soulMirror.vaultEntryRef },
    voluntary_completion_confirmed: true,
    safety_stop_occurred: input.safetyStopOccurred,
  };
}

export function buildDay005SafeMetrics(input: { totalDurationSeconds: number }): SafeMetricRecord {
  nonNegative(input.totalDurationSeconds,'total_duration_seconds');
  return { total_duration_seconds: input.totalDurationSeconds };
}
