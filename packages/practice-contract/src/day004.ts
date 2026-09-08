import type { SafeMetricRecord } from './types.js';

export const DAY004_QUEST_ID = 'HNK-KETHER-D004-V1' as const;
export const DAY004_SOURCE_SHA = '376964a263f3d4f07542fcf55ca3bf2c18c5fd94' as const;
export const DAY004_THETA432_PROFILE_ID = 'HNK-THETA432-BINAURAL-V1' as const;

export type Day004Phenomenology =
  | 'WARMTH'
  | 'CALM'
  | 'IMAGERY'
  | 'AGITATION'
  | 'BODY_SENSATIONS'
  | 'NO_NOTICEABLE_CHANGE'
  | 'STRONG_EMOTION'
  | 'OTHER';

export interface Day004EvidenceV1 {
  protocol_version: typeof DAY004_QUEST_ID;
  source_sha: typeof DAY004_SOURCE_SHA;
  session_id: string;
  mode?: 'first_completion' | 'revisit';
  experiment: {
    expectation_before: number;
    body_state_before: number;
    observation_recorded: true;
    perceived_change_after: number;
    observation_vault_entry_ref?: string | null;
  };
  jachin: {
    visualization_completed: true;
    duration_seconds: number;
    comfort_rating?: number | null;
    return_confirmed: true;
  };
  audio_theta432: {
    started: true;
    profile_id: typeof DAY004_THETA432_PROFILE_ID;
    duration_seconds?: number | null;
    stopped_for_discomfort?: boolean;
  };
  boaz: {
    monitor_completed: true;
    duration_seconds: number;
    pattern_notices: number;
    trigger_recorded: true;
    trigger_vault_entry_ref?: string | null;
    return_confirmed: true;
  };
  middle: {
    swish_completed: true;
    target_state_before: number;
    perceived_change_after: number;
    observation_recorded: true;
    observation_vault_entry_ref?: string | null;
    return_confirmed: true;
  };
  phenomenology?: Day004Phenomenology[];
  soul_mirror: {
    completed: true;
    difficulty_rating?: number | null;
    vault_entry_ref?: string | null;
  };
  voluntary_completion_confirmed: true;
  safety_stop_occurred?: boolean;
}

export interface Day004EvidenceInput {
  sessionId: string;
  mode?: 'first_completion' | 'revisit';
  experiment: {
    expectationBefore: number;
    bodyStateBefore: number;
    perceivedChangeAfter: number;
    observationVaultEntryRef?: string | null;
  };
  jachin: { durationSeconds: number; comfortRating?: number | null };
  audio: { started: boolean; durationSeconds?: number | null; stoppedForDiscomfort?: boolean };
  boaz: {
    durationSeconds: number;
    patternNotices: number;
    triggerVaultEntryRef?: string | null;
  };
  middle: {
    targetStateBefore: number;
    perceivedChangeAfter: number;
    observationVaultEntryRef?: string | null;
  };
  phenomenology?: Day004Phenomenology[];
  soulMirror: { difficultyRating?: number | null; vaultEntryRef?: string | null };
  safetyStopOccurred?: boolean;
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) throw new Error(`invalid_${label}`);
}
function assertRating(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 10) throw new Error(`invalid_${label}`);
}
function assertOptionalRating(value: number | null | undefined, label: string): void {
  if (value == null) return;
  assertRating(value, label);
}
function assertOpaqueRef(value: string | null | undefined, label: string): void {
  if (value == null) return;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 256 || /\s/.test(trimmed)) throw new Error(`invalid_${label}`);
}

export function buildDay004EvidenceV1(input: Day004EvidenceInput): Day004EvidenceV1 {
  if (!input.sessionId.trim()) throw new Error('practice_session_id_required');
  assertRating(input.experiment.expectationBefore, 'experiment_expectation_before');
  assertRating(input.experiment.bodyStateBefore, 'experiment_body_state_before');
  assertRating(input.experiment.perceivedChangeAfter, 'experiment_perceived_change_after');
  assertOpaqueRef(input.experiment.observationVaultEntryRef, 'experiment_observation_vault_entry_ref');
  assertNonNegativeInteger(input.jachin.durationSeconds, 'jachin_duration');
  assertOptionalRating(input.jachin.comfortRating, 'jachin_comfort_rating');
  if (!input.audio.started) throw new Error('day004_theta432_audio_required');
  assertNonNegativeInteger(input.audio.durationSeconds ?? 0, 'audio_duration');
  assertNonNegativeInteger(input.boaz.durationSeconds, 'boaz_duration');
  assertNonNegativeInteger(input.boaz.patternNotices, 'pattern_notices');
  assertOpaqueRef(input.boaz.triggerVaultEntryRef, 'boaz_trigger_vault_entry_ref');
  assertRating(input.middle.targetStateBefore, 'middle_target_state_before');
  assertRating(input.middle.perceivedChangeAfter, 'middle_perceived_change_after');
  assertOpaqueRef(input.middle.observationVaultEntryRef, 'middle_observation_vault_entry_ref');
  assertOptionalRating(input.soulMirror.difficultyRating, 'soul_mirror_difficulty_rating');
  assertOpaqueRef(input.soulMirror.vaultEntryRef, 'soul_mirror_vault_entry_ref');

  return {
    protocol_version: DAY004_QUEST_ID,
    source_sha: DAY004_SOURCE_SHA,
    session_id: input.sessionId,
    mode: input.mode,
    experiment: {
      expectation_before: input.experiment.expectationBefore,
      body_state_before: input.experiment.bodyStateBefore,
      observation_recorded: true,
      perceived_change_after: input.experiment.perceivedChangeAfter,
      observation_vault_entry_ref: input.experiment.observationVaultEntryRef,
    },
    jachin: {
      visualization_completed: true,
      duration_seconds: input.jachin.durationSeconds,
      comfort_rating: input.jachin.comfortRating,
      return_confirmed: true,
    },
    audio_theta432: {
      started: true,
      profile_id: DAY004_THETA432_PROFILE_ID,
      duration_seconds: input.audio.durationSeconds,
      stopped_for_discomfort: input.audio.stoppedForDiscomfort,
    },
    boaz: {
      monitor_completed: true,
      duration_seconds: input.boaz.durationSeconds,
      pattern_notices: input.boaz.patternNotices,
      trigger_recorded: true,
      trigger_vault_entry_ref: input.boaz.triggerVaultEntryRef,
      return_confirmed: true,
    },
    middle: {
      swish_completed: true,
      target_state_before: input.middle.targetStateBefore,
      perceived_change_after: input.middle.perceivedChangeAfter,
      observation_recorded: true,
      observation_vault_entry_ref: input.middle.observationVaultEntryRef,
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

export function buildDay004SafeMetrics(input: {
  totalDurationSeconds: number;
  patternNotices?: number;
}): SafeMetricRecord {
  assertNonNegativeInteger(input.totalDurationSeconds, 'total_duration_seconds');
  assertNonNegativeInteger(input.patternNotices ?? 0, 'pattern_notices');
  return {
    total_duration_seconds: input.totalDurationSeconds,
    pattern_notices: input.patternNotices ?? 0,
  };
}
