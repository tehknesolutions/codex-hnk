import type { SafeMetricRecord } from './types.js';

export const DAY003_QUEST_ID = 'HNK-KETHER-D003-V1' as const;
export const DAY003_SOURCE_SHA = '3cb60ed208c24ee885cbe95d974c7468419120aa' as const;
export const DAY003_THETA432_PROFILE_ID = 'HNK-THETA432-BINAURAL-V1' as const;

export type Day003Phenomenology =
  | 'MANY_THOUGHTS'
  | 'CALM'
  | 'AGITATION'
  | 'BODY_SENSATIONS'
  | 'SILENCE'
  | 'STRONG_EMOTION'
  | 'NOTHING_SPECIAL'
  | 'OTHER';

export interface Day003EvidenceV1 {
  protocol_version: typeof DAY003_QUEST_ID;
  source_sha: typeof DAY003_SOURCE_SHA;
  session_id: string;
  mode?: 'first_completion' | 'revisit';
  jachin: {
    observation_completed: true;
    duration_seconds: number;
    thought_returns?: number;
    beliefs_recorded_count: number;
    belief_reframe_completed?: boolean;
    vault_entry_ref?: string | null;
    return_confirmed: true;
  };
  audio_theta432?: {
    started: true;
    profile_id: typeof DAY003_THETA432_PROFILE_ID;
    duration_seconds?: number | null;
    stopped_for_discomfort?: boolean;
  };
  boaz: {
    relaxation_completed: true;
    protective_intention_inquiry_completed: true;
    inquiry_vault_entry_ref?: string | null;
    real_world_action_id: string;
    challenge_completed: true;
    restart_count?: number;
    return_confirmed: true;
  };
  middle: { completed: true; comfort_rating?: number | null; return_confirmed: true };
  phenomenology?: Day003Phenomenology[];
  soul_mirror: { completed: true; difficulty_rating?: number | null; vault_entry_ref?: string | null };
  voluntary_completion_confirmed: true;
  safety_stop_occurred?: boolean;
}

export interface Day003EvidenceInput {
  sessionId: string;
  mode?: 'first_completion' | 'revisit';
  jachin: {
    durationSeconds: number;
    thoughtReturns?: number;
    beliefsRecordedCount: number;
    beliefReframeCompleted?: boolean;
    vaultEntryRef?: string | null;
  };
  audio?: { started: boolean; durationSeconds?: number | null; stoppedForDiscomfort?: boolean };
  boaz: {
    inquiryVaultEntryRef?: string | null;
    realWorldActionId: string;
    restartCount?: number;
  };
  middle: { comfortRating?: number | null };
  phenomenology?: Day003Phenomenology[];
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
function assertUuidLike(value: string, label: string): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new Error(`invalid_${label}`);
}

export function buildDay003EvidenceV1(input: Day003EvidenceInput): Day003EvidenceV1 {
  if (!input.sessionId.trim()) throw new Error('practice_session_id_required');
  assertNonNegativeInteger(input.jachin.durationSeconds, 'jachin_duration');
  assertNonNegativeInteger(input.jachin.thoughtReturns ?? 0, 'thought_returns');
  assertNonNegativeInteger(input.jachin.beliefsRecordedCount, 'beliefs_recorded_count');
  if (input.jachin.beliefsRecordedCount < 3) throw new Error('beliefs_recorded_count_min_3');
  assertOpaqueRef(input.jachin.vaultEntryRef, 'jachin_vault_entry_ref');
  assertUuidLike(input.boaz.realWorldActionId, 'real_world_action_id');
  assertNonNegativeInteger(input.boaz.restartCount ?? 0, 'restart_count');
  assertOpaqueRef(input.boaz.inquiryVaultEntryRef, 'boaz_inquiry_vault_entry_ref');
  assertOptionalRating(input.middle.comfortRating, 'middle_comfort_rating');
  assertOptionalRating(input.soulMirror.difficultyRating, 'difficulty_rating');
  assertOpaqueRef(input.soulMirror.vaultEntryRef, 'soul_mirror_vault_entry_ref');

  return {
    protocol_version: DAY003_QUEST_ID,
    source_sha: DAY003_SOURCE_SHA,
    session_id: input.sessionId,
    mode: input.mode,
    jachin: {
      observation_completed: true,
      duration_seconds: input.jachin.durationSeconds,
      thought_returns: input.jachin.thoughtReturns,
      beliefs_recorded_count: input.jachin.beliefsRecordedCount,
      belief_reframe_completed: input.jachin.beliefReframeCompleted,
      vault_entry_ref: input.jachin.vaultEntryRef,
      return_confirmed: true,
    },
    audio_theta432: input.audio?.started ? {
      started: true,
      profile_id: DAY003_THETA432_PROFILE_ID,
      duration_seconds: input.audio.durationSeconds,
      stopped_for_discomfort: input.audio.stoppedForDiscomfort,
    } : undefined,
    boaz: {
      relaxation_completed: true,
      protective_intention_inquiry_completed: true,
      inquiry_vault_entry_ref: input.boaz.inquiryVaultEntryRef,
      real_world_action_id: input.boaz.realWorldActionId,
      challenge_completed: true,
      restart_count: input.boaz.restartCount,
      return_confirmed: true,
    },
    middle: {
      completed: true,
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

export function buildDay003SafeMetrics(input: { totalDurationSeconds: number; thoughtReturns?: number; restartCount?: number }): SafeMetricRecord {
  assertNonNegativeInteger(input.totalDurationSeconds, 'total_duration_seconds');
  assertNonNegativeInteger(input.thoughtReturns ?? 0, 'thought_returns');
  assertNonNegativeInteger(input.restartCount ?? 0, 'restart_count');
  return {
    total_duration_seconds: input.totalDurationSeconds,
    thought_returns: input.thoughtReturns ?? 0,
    restart_count: input.restartCount ?? 0,
  };
}
