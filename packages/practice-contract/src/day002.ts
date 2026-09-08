import type { SafeMetricRecord } from './types.js';

export const DAY002_QUEST_ID = 'HNK-KETHER-D002-V1' as const;
export const DAY002_SOURCE_SHA = '71019573414493ee9e5521f4d27ed744748c0d2b' as const;
export const DAY002_AUDIO_PROFILE_ID = 'HNK-KETHER-D002-AUDIO-V1' as const;

export type Day002Phenomenology =
  | 'MOVEMENT_IMPULSES'
  | 'ITCHING'
  | 'CALM'
  | 'AGITATION'
  | 'BODY_SENSATIONS'
  | 'SILENCE'
  | 'NOTHING_SPECIAL'
  | 'OTHER';

export interface Day002EvidenceV1 {
  protocol_version: typeof DAY002_QUEST_ID;
  source_sha: typeof DAY002_SOURCE_SHA;
  session_id: string;
  mode?: 'first_completion' | 'revisit';
  jachin: { completed: true; duration_seconds: number; comfort_rating?: number | null; return_confirmed: true };
  audio_528_binaural: {
    started: true;
    profile_id: typeof DAY002_AUDIO_PROFILE_ID;
    duration_seconds?: number | null;
    stopped_for_discomfort?: boolean;
  };
  boaz: {
    completed: true;
    duration_seconds: number;
    impulse_count: number;
    first_five_minutes_reflection_completed: true;
    comfort_rating?: number | null;
    vault_entry_ref?: string | null;
    return_confirmed: true;
  };
  middle: { completed: true; duration_seconds: number; comfort_rating?: number | null; return_confirmed: true };
  phenomenology?: Day002Phenomenology[];
  soul_mirror: { completed: true; difficulty_rating?: number | null; vault_entry_ref?: string | null };
  voluntary_completion_confirmed: true;
  safety_stop_occurred?: boolean;
}

export interface Day002EvidenceInput {
  sessionId: string;
  mode?: 'first_completion' | 'revisit';
  jachin: { durationSeconds: number; comfortRating?: number | null };
  audio: { durationSeconds?: number | null; stoppedForDiscomfort?: boolean };
  boaz: {
    durationSeconds: number;
    impulseCount: number;
    firstFiveMinutesReflectionCompleted: true;
    comfortRating?: number | null;
    vaultEntryRef?: string | null;
  };
  middle: { durationSeconds: number; comfortRating?: number | null };
  phenomenology?: Day002Phenomenology[];
  soulMirror: { difficultyRating?: number | null; vaultEntryRef?: string | null };
  safetyStopOccurred?: boolean;
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) throw new Error(`invalid_${label}`);
}

function assertOptionalRating(value: number | null | undefined, label: string): void {
  if (value == null) return;
  if (!Number.isInteger(value) || value < 0 || value > 10) throw new Error(`invalid_${label}`);
}

function assertOpaqueRef(value: string | null | undefined, label: string): void {
  if (value == null) return;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 256 || /\s/.test(trimmed)) throw new Error(`invalid_${label}`);
}

export function buildDay002EvidenceV1(input: Day002EvidenceInput): Day002EvidenceV1 {
  if (!input.sessionId.trim()) throw new Error('practice_session_id_required');
  assertNonNegativeInteger(input.jachin.durationSeconds, 'jachin_duration');
  assertOptionalRating(input.jachin.comfortRating, 'jachin_comfort_rating');
  assertNonNegativeInteger(input.audio.durationSeconds ?? 0, 'audio_duration');
  assertNonNegativeInteger(input.boaz.durationSeconds, 'boaz_duration');
  assertNonNegativeInteger(input.boaz.impulseCount, 'impulse_count');
  assertOptionalRating(input.boaz.comfortRating, 'boaz_comfort_rating');
  assertOpaqueRef(input.boaz.vaultEntryRef, 'boaz_vault_entry_ref');
  assertNonNegativeInteger(input.middle.durationSeconds, 'middle_duration');
  assertOptionalRating(input.middle.comfortRating, 'middle_comfort_rating');
  assertOptionalRating(input.soulMirror.difficultyRating, 'difficulty_rating');
  assertOpaqueRef(input.soulMirror.vaultEntryRef, 'soul_mirror_vault_entry_ref');

  return {
    protocol_version: DAY002_QUEST_ID,
    source_sha: DAY002_SOURCE_SHA,
    session_id: input.sessionId,
    mode: input.mode,
    jachin: {
      completed: true,
      duration_seconds: input.jachin.durationSeconds,
      comfort_rating: input.jachin.comfortRating,
      return_confirmed: true,
    },
    audio_528_binaural: {
      started: true,
      profile_id: DAY002_AUDIO_PROFILE_ID,
      duration_seconds: input.audio.durationSeconds,
      stopped_for_discomfort: input.audio.stoppedForDiscomfort,
    },
    boaz: {
      completed: true,
      duration_seconds: input.boaz.durationSeconds,
      impulse_count: input.boaz.impulseCount,
      first_five_minutes_reflection_completed: true,
      comfort_rating: input.boaz.comfortRating,
      vault_entry_ref: input.boaz.vaultEntryRef,
      return_confirmed: true,
    },
    middle: {
      completed: true,
      duration_seconds: input.middle.durationSeconds,
      comfort_rating: input.middle.comfortRating,
      return_confirmed: true,
    },
    phenomenology: input.phenomenology,
    soul_mirror: {
      completed: true,
      difficulty_rating: input.soulMirror.difficultyRating,
      vault_entry_ref: input.soulMirror.vaultEntryRef,
    },
    voluntary_completion_confirmed: true,
    safety_stop_occurred: input.safetyStopOccurred,
  };
}

export function buildDay002SafeMetrics(input: {
  impulseCount: number;
  totalDurationSeconds: number;
  pauseCount?: number;
}): SafeMetricRecord {
  assertNonNegativeInteger(input.impulseCount, 'impulse_count');
  assertNonNegativeInteger(input.totalDurationSeconds, 'total_duration_seconds');
  assertNonNegativeInteger(input.pauseCount ?? 0, 'pause_count');
  return {
    impulse_count: input.impulseCount,
    total_duration_seconds: input.totalDurationSeconds,
    pause_count: input.pauseCount ?? 0,
  };
}
