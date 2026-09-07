import type { SafeMetricRecord } from "./types.js";

export const DAY001_QUEST_ID = "HNK-KETHER-D001-V2" as const;
export const DAY001_SOURCE_SHA = "a01d13b43cbddb92236fc1e3b6c2a7e140d87d29" as const;

export type Day001Phenomenology =
  | "MANY_THOUGHTS"
  | "SLEEPINESS"
  | "CALM"
  | "AGITATION"
  | "IMAGES"
  | "BODY_SENSATIONS"
  | "SILENCE"
  | "STRONG_EMOTION"
  | "NOTHING_SPECIAL"
  | "OTHER";

export interface Day001EvidenceV2 {
  protocol_version: typeof DAY001_QUEST_ID;
  source_sha: typeof DAY001_SOURCE_SHA;
  session_id: string;
  mode?: "first_completion" | "revisit";
  jachin: {
    started: true;
    completed: true;
    duration_seconds: number;
    attention_returns?: number;
    focus_rating?: number | null;
    silence_rating?: number | null;
    comfort_rating?: number | null;
    return_confirmed: true;
  };
  ritual_tone_528: {
    started: true;
    duration_seconds?: number | null;
    stopped_for_discomfort?: boolean;
  };
  boaz: {
    started: true;
    completed: true;
    duration_seconds: number;
    relaxation_rating?: number | null;
    subjective_depth_rating?: number | null;
    comfort_rating?: number | null;
    environment_distractions_count: number;
    vault_entry_ref?: string | null;
    return_confirmed: true;
  };
  middle: {
    voice_practice_completed: true;
    duration_seconds: number;
    voice_recorded: boolean;
    encrypted_voice_ref?: string | null;
    return_confirmed: true;
  };
  phenomenology?: Day001Phenomenology[];
  soul_mirror: {
    completed: true;
    state_before?: number | null;
    state_after?: number | null;
    difficulty_rating?: number | null;
    vault_entry_ref?: string | null;
  };
  voluntary_completion_confirmed: true;
  safety_stop_occurred?: boolean;
}

export interface Day001EvidenceInput {
  sessionId: string;
  mode?: "first_completion" | "revisit";
  jachin: {
    durationSeconds: number;
    attentionReturns?: number;
    focusRating?: number | null;
    silenceRating?: number | null;
    comfortRating?: number | null;
  };
  ritualTone528: {
    durationSeconds?: number | null;
    stoppedForDiscomfort?: boolean;
  };
  boaz: {
    durationSeconds: number;
    environmentDistractionsCount: number;
    relaxationRating?: number | null;
    subjectiveDepthRating?: number | null;
    comfortRating?: number | null;
    vaultEntryRef?: string | null;
  };
  middle: {
    durationSeconds: number;
    voiceRecorded: boolean;
    encryptedVoiceRef?: string | null;
  };
  phenomenology?: Day001Phenomenology[];
  soulMirror: {
    stateBefore?: number | null;
    stateAfter?: number | null;
    difficultyRating?: number | null;
    vaultEntryRef?: string | null;
  };
  safetyStopOccurred?: boolean;
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) throw new Error(`invalid_${label}`);
}

function assertOptionalRating(value: number | null | undefined, label: string): void {
  if (value == null) return;
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    throw new Error(`invalid_${label}`);
  }
}

function assertOpaqueRef(value: string | null | undefined, label: string): void {
  if (value == null) return;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 256 || /\s/.test(trimmed)) {
    throw new Error(`invalid_${label}`);
  }
}

export function buildDay001EvidenceV2(input: Day001EvidenceInput): Day001EvidenceV2 {
  if (!input.sessionId.trim()) throw new Error("practice_session_id_required");

  assertNonNegativeInteger(input.jachin.durationSeconds, "jachin_duration");
  assertNonNegativeInteger(input.jachin.attentionReturns ?? 0, "attention_returns");
  assertOptionalRating(input.jachin.focusRating, "focus_rating");
  assertOptionalRating(input.jachin.silenceRating, "silence_rating");
  assertOptionalRating(input.jachin.comfortRating, "jachin_comfort_rating");

  assertNonNegativeInteger(input.ritualTone528.durationSeconds ?? 0, "ritual_tone_duration");

  assertNonNegativeInteger(input.boaz.durationSeconds, "boaz_duration");
  assertNonNegativeInteger(input.boaz.environmentDistractionsCount, "environment_distractions_count");
  if (input.boaz.environmentDistractionsCount < 3) {
    throw new Error("day001_boaz_distractions_incomplete");
  }
  assertOptionalRating(input.boaz.relaxationRating, "relaxation_rating");
  assertOptionalRating(input.boaz.subjectiveDepthRating, "subjective_depth_rating");
  assertOptionalRating(input.boaz.comfortRating, "boaz_comfort_rating");
  assertOpaqueRef(input.boaz.vaultEntryRef, "boaz_vault_entry_ref");

  assertNonNegativeInteger(input.middle.durationSeconds, "middle_duration");
  assertOpaqueRef(input.middle.encryptedVoiceRef, "encrypted_voice_ref");
  if (input.middle.voiceRecorded && !input.middle.encryptedVoiceRef) {
    throw new Error("encrypted_voice_ref_required");
  }

  assertOptionalRating(input.soulMirror.stateBefore, "state_before");
  assertOptionalRating(input.soulMirror.stateAfter, "state_after");
  assertOptionalRating(input.soulMirror.difficultyRating, "difficulty_rating");
  assertOpaqueRef(input.soulMirror.vaultEntryRef, "soul_mirror_vault_entry_ref");

  return {
    protocol_version: DAY001_QUEST_ID,
    source_sha: DAY001_SOURCE_SHA,
    session_id: input.sessionId,
    mode: input.mode,
    jachin: {
      started: true,
      completed: true,
      duration_seconds: input.jachin.durationSeconds,
      attention_returns: input.jachin.attentionReturns,
      focus_rating: input.jachin.focusRating,
      silence_rating: input.jachin.silenceRating,
      comfort_rating: input.jachin.comfortRating,
      return_confirmed: true,
    },
    ritual_tone_528: {
      started: true,
      duration_seconds: input.ritualTone528.durationSeconds,
      stopped_for_discomfort: input.ritualTone528.stoppedForDiscomfort,
    },
    boaz: {
      started: true,
      completed: true,
      duration_seconds: input.boaz.durationSeconds,
      relaxation_rating: input.boaz.relaxationRating,
      subjective_depth_rating: input.boaz.subjectiveDepthRating,
      comfort_rating: input.boaz.comfortRating,
      environment_distractions_count: input.boaz.environmentDistractionsCount,
      vault_entry_ref: input.boaz.vaultEntryRef,
      return_confirmed: true,
    },
    middle: {
      voice_practice_completed: true,
      duration_seconds: input.middle.durationSeconds,
      voice_recorded: input.middle.voiceRecorded,
      encrypted_voice_ref: input.middle.encryptedVoiceRef,
      return_confirmed: true,
    },
    phenomenology: input.phenomenology,
    soul_mirror: {
      completed: true,
      state_before: input.soulMirror.stateBefore,
      state_after: input.soulMirror.stateAfter,
      difficulty_rating: input.soulMirror.difficultyRating,
      vault_entry_ref: input.soulMirror.vaultEntryRef,
    },
    voluntary_completion_confirmed: true,
    safety_stop_occurred: input.safetyStopOccurred,
  };
}

export function buildDay001SafeMetrics(input: {
  attentionReturns: number;
  totalDurationSeconds: number;
  pauseCount?: number;
}): SafeMetricRecord {
  assertNonNegativeInteger(input.attentionReturns, "attention_returns");
  assertNonNegativeInteger(input.totalDurationSeconds, "total_duration_seconds");
  assertNonNegativeInteger(input.pauseCount ?? 0, "pause_count");
  return {
    attention_returns: input.attentionReturns,
    total_duration_seconds: input.totalDurationSeconds,
    pause_count: input.pauseCount ?? 0,
  };
}
