import type { SafeMetricRecord } from './types.js';

export const DAY030_QUEST_ID = 'HNK-KETHER-D030-V1' as const;
export const DAY030_SOURCE_SHA = 'a9bea648b20595579ef70c11ba3f319e477845dd' as const;
export const DAY030_ACTIVE_AUDIO_PROFILE = 'HNK-KETHER-D030-ASMR-ACTIVE-V1' as const;
export const DAY030_CONTROL_AUDIO_PROFILE = 'HNK-KETHER-D030-CONTROL-V1' as const;

export type Day030Lateralization = 'LEFT' | 'RIGHT' | 'BILATERAL' | 'VARIABLE' | 'NONE';
export type Day030Signature = 'RELAXATION' | 'SLEEPINESS' | 'ABSORPTION' | 'TINGLES' | 'IMAGERY' | 'LATERALITY' | 'SILENCE' | 'MIXED' | 'NONE';

export interface Day030EvidenceV1 {
  protocol_version: typeof DAY030_QUEST_ID;
  source_sha: typeof DAY030_SOURCE_SHA;
  session_id: string;
  mode: 'first_completion' | 'revisit';
  jachin: {
    duration_seconds: 600;
    audio_profile_id: typeof DAY030_ACTIVE_AUDIO_PROFILE;
    volume_permille: number;
    headphones_confirmed: true;
    supported_posture_confirmed: true;
    eyes_closed_or_safe_equivalent_confirmed: true;
    comfortable_volume_confirmed: true;
    latency_seconds: number | null;
    distraction_count: number;
    relaxation_score: number;
    absorption_score: number;
    tingles_score: number;
    imagery_score: number;
    global_intensity_score: number;
    lateralization: Day030Lateralization;
    no_specific_sensation_required_confirmed: true;
    active_vault_entry_ref: string;
  };
  boaz: {
    duration_seconds: 600;
    audio_profile_id: typeof DAY030_CONTROL_AUDIO_PROFILE;
    volume_permille: number;
    same_headphones_confirmed: true;
    same_posture_confirmed: true;
    approximately_same_volume_confirmed: true;
    control_not_sabotaged_confirmed: true;
    comfortable_volume_confirmed: true;
    latency_seconds: number | null;
    distraction_count: number;
    relaxation_score: number;
    absorption_score: number;
    sleepiness_score: number;
    tingles_score: number;
    imagery_score: number;
    clarity_after_score: number;
    lateralization: Day030Lateralization;
    data_may_correct_expectation_confirmed: true;
    control_vault_entry_ref: string;
  };
  middle: {
    duration_seconds: 600;
    audio_profile_id: typeof DAY030_ACTIVE_AUDIO_PROFILE;
    volume_permille: number;
    lamed_lamed_he_once_confirmed: true;
    psalm_9_11_orientation_confirmed: true;
    comfortable_volume_confirmed: true;
    latency_seconds: number | null;
    depth_score: number;
    stability_score: number;
    exit_clarity_score: number;
    deepest_state_noticed: boolean;
    three_natural_breaths_if_deepest_state_noticed_confirmed: boolean;
    signature: Day030Signature;
    e1_e5_recorded_confirmed: true;
    future_mastery_criterion_defined_confirmed: true;
    single_session_not_definitive_confirmed: true;
    eyes_open_confirmed: true;
    headphones_removed_confirmed: true;
    environmental_orientation_confirmed: true;
    integration_vault_entry_ref: string;
  };
  soul_mirror: {
    completed: true;
    acoustic_discernment_vault_entry_ref: string;
  };
  voluntary_completion_confirmed: true;
  safety_stop_occurred: boolean;
}

export interface Day030EvidenceInput {
  sessionId: string;
  mode?: 'first_completion' | 'revisit';
  volumePermille: number;
  jachinDurationSeconds: number;
  jachinHeadphonesConfirmed: boolean;
  jachinSupportedPostureConfirmed: boolean;
  jachinEyesClosedOrSafeEquivalentConfirmed: boolean;
  jachinComfortableVolumeConfirmed: boolean;
  jachinLatencySeconds: number | null;
  jachinDistractionCount: number;
  jachinRelaxationScore: number;
  jachinAbsorptionScore: number;
  jachinTinglesScore: number;
  jachinImageryScore: number;
  jachinGlobalIntensityScore: number;
  jachinLateralization: Day030Lateralization;
  jachinNoSpecificSensationRequiredConfirmed: boolean;
  activeVaultEntryRef: string;
  boazDurationSeconds: number;
  boazSameHeadphonesConfirmed: boolean;
  boazSamePostureConfirmed: boolean;
  boazApproximatelySameVolumeConfirmed: boolean;
  boazControlNotSabotagedConfirmed: boolean;
  boazComfortableVolumeConfirmed: boolean;
  boazLatencySeconds: number | null;
  boazDistractionCount: number;
  boazRelaxationScore: number;
  boazAbsorptionScore: number;
  boazSleepinessScore: number;
  boazTinglesScore: number;
  boazImageryScore: number;
  boazClarityAfterScore: number;
  boazLateralization: Day030Lateralization;
  boazDataMayCorrectExpectationConfirmed: boolean;
  controlVaultEntryRef: string;
  middleDurationSeconds: number;
  middleLamedLamedHeOnceConfirmed: boolean;
  middlePsalm911OrientationConfirmed: boolean;
  middleComfortableVolumeConfirmed: boolean;
  middleLatencySeconds: number | null;
  middleDepthScore: number;
  middleStabilityScore: number;
  middleExitClarityScore: number;
  middleDeepestStateNoticed: boolean;
  middleThreeNaturalBreathsIfDeepestStateNoticedConfirmed: boolean;
  middleSignature: Day030Signature;
  middleE1E5RecordedConfirmed: boolean;
  middleFutureMasteryCriterionDefinedConfirmed: boolean;
  middleSingleSessionNotDefinitiveConfirmed: boolean;
  middleEyesOpenConfirmed: boolean;
  middleHeadphonesRemovedConfirmed: boolean;
  middleEnvironmentalOrientationConfirmed: boolean;
  integrationVaultEntryRef: string;
  soulMirrorCompleted: boolean;
  acousticDiscernmentVaultEntryRef: string;
  safetyStopOccurred?: boolean;
}

function yes(value: boolean, name: string): void {
  if (value !== true) throw new Error(name);
}
function integer(value: number, min: number, max: number, name: string): number {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(name);
  return value;
}
function score(value: number, name: string): number { return integer(value, 0, 10, name); }
function latency(value: number | null, name: string): number | null {
  if (value === null) return null;
  return integer(value, 0, 600, name);
}
function uuid(value: string, name: string): string {
  const normalized = value.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) throw new Error(name);
  return normalized;
}
function lateralization(value: Day030Lateralization, name: string): Day030Lateralization {
  if (!['LEFT','RIGHT','BILATERAL','VARIABLE','NONE'].includes(value)) throw new Error(name);
  return value;
}
function signature(value: Day030Signature): Day030Signature {
  if (!['RELAXATION','SLEEPINESS','ABSORPTION','TINGLES','IMAGERY','LATERALITY','SILENCE','MIXED','NONE'].includes(value)) throw new Error('day030_signature_invalid');
  return value;
}

export function buildDay030EvidenceV1(input: Day030EvidenceInput): Day030EvidenceV1 {
  if (!input.sessionId.trim()) throw new Error('day030_session_required');
  const volume = integer(input.volumePermille, 1, 1000, 'day030_volume_invalid');
  if (input.jachinDurationSeconds !== 600) throw new Error('day030_jachin_requires_600_seconds');
  if (input.boazDurationSeconds !== 600) throw new Error('day030_boaz_requires_600_seconds');
  if (input.middleDurationSeconds !== 600) throw new Error('day030_middle_requires_600_seconds');
  for (const [value, name] of [
    [input.jachinHeadphonesConfirmed,'day030_headphones_required'],
    [input.jachinSupportedPostureConfirmed,'day030_supported_posture_required'],
    [input.jachinEyesClosedOrSafeEquivalentConfirmed,'day030_safe_focus_required'],
    [input.jachinComfortableVolumeConfirmed,'day030_jachin_comfortable_volume_required'],
    [input.jachinNoSpecificSensationRequiredConfirmed,'day030_no_specific_sensation_boundary_required'],
    [input.boazSameHeadphonesConfirmed,'day030_same_headphones_required'],
    [input.boazSamePostureConfirmed,'day030_same_posture_required'],
    [input.boazApproximatelySameVolumeConfirmed,'day030_same_volume_required'],
    [input.boazControlNotSabotagedConfirmed,'day030_control_not_sabotaged_required'],
    [input.boazComfortableVolumeConfirmed,'day030_boaz_comfortable_volume_required'],
    [input.boazDataMayCorrectExpectationConfirmed,'day030_data_may_correct_expectation_required'],
    [input.middleLamedLamedHeOnceConfirmed,'day030_lamed_required'],
    [input.middlePsalm911OrientationConfirmed,'day030_psalm_required'],
    [input.middleComfortableVolumeConfirmed,'day030_middle_comfortable_volume_required'],
    [input.middleE1E5RecordedConfirmed,'day030_e1_e5_required'],
    [input.middleFutureMasteryCriterionDefinedConfirmed,'day030_mastery_criterion_required'],
    [input.middleSingleSessionNotDefinitiveConfirmed,'day030_single_session_boundary_required'],
    [input.middleEyesOpenConfirmed,'day030_eyes_open_return_required'],
    [input.middleHeadphonesRemovedConfirmed,'day030_headphones_removed_required'],
    [input.middleEnvironmentalOrientationConfirmed,'day030_environmental_return_required'],
    [input.soulMirrorCompleted,'day030_soul_mirror_required'],
  ] as const) yes(value, name);
  if (input.middleDeepestStateNoticed && !input.middleThreeNaturalBreathsIfDeepestStateNoticedConfirmed) {
    throw new Error('day030_three_breaths_required_when_deepest_state_noticed');
  }

  return {
    protocol_version: DAY030_QUEST_ID,
    source_sha: DAY030_SOURCE_SHA,
    session_id: input.sessionId,
    mode: input.mode ?? 'first_completion',
    jachin: {
      duration_seconds: 600,
      audio_profile_id: DAY030_ACTIVE_AUDIO_PROFILE,
      volume_permille: volume,
      headphones_confirmed: true,
      supported_posture_confirmed: true,
      eyes_closed_or_safe_equivalent_confirmed: true,
      comfortable_volume_confirmed: true,
      latency_seconds: latency(input.jachinLatencySeconds, 'day030_jachin_latency_invalid'),
      distraction_count: integer(input.jachinDistractionCount, 0, 9999, 'day030_jachin_distractions_invalid'),
      relaxation_score: score(input.jachinRelaxationScore, 'day030_jachin_relaxation_invalid'),
      absorption_score: score(input.jachinAbsorptionScore, 'day030_jachin_absorption_invalid'),
      tingles_score: score(input.jachinTinglesScore, 'day030_jachin_tingles_invalid'),
      imagery_score: score(input.jachinImageryScore, 'day030_jachin_imagery_invalid'),
      global_intensity_score: score(input.jachinGlobalIntensityScore, 'day030_jachin_intensity_invalid'),
      lateralization: lateralization(input.jachinLateralization, 'day030_jachin_lateralization_invalid'),
      no_specific_sensation_required_confirmed: true,
      active_vault_entry_ref: uuid(input.activeVaultEntryRef, 'day030_active_vault_ref_invalid'),
    },
    boaz: {
      duration_seconds: 600,
      audio_profile_id: DAY030_CONTROL_AUDIO_PROFILE,
      volume_permille: volume,
      same_headphones_confirmed: true,
      same_posture_confirmed: true,
      approximately_same_volume_confirmed: true,
      control_not_sabotaged_confirmed: true,
      comfortable_volume_confirmed: true,
      latency_seconds: latency(input.boazLatencySeconds, 'day030_boaz_latency_invalid'),
      distraction_count: integer(input.boazDistractionCount, 0, 9999, 'day030_boaz_distractions_invalid'),
      relaxation_score: score(input.boazRelaxationScore, 'day030_boaz_relaxation_invalid'),
      absorption_score: score(input.boazAbsorptionScore, 'day030_boaz_absorption_invalid'),
      sleepiness_score: score(input.boazSleepinessScore, 'day030_boaz_sleepiness_invalid'),
      tingles_score: score(input.boazTinglesScore, 'day030_boaz_tingles_invalid'),
      imagery_score: score(input.boazImageryScore, 'day030_boaz_imagery_invalid'),
      clarity_after_score: score(input.boazClarityAfterScore, 'day030_boaz_clarity_invalid'),
      lateralization: lateralization(input.boazLateralization, 'day030_boaz_lateralization_invalid'),
      data_may_correct_expectation_confirmed: true,
      control_vault_entry_ref: uuid(input.controlVaultEntryRef, 'day030_control_vault_ref_invalid'),
    },
    middle: {
      duration_seconds: 600,
      audio_profile_id: DAY030_ACTIVE_AUDIO_PROFILE,
      volume_permille: volume,
      lamed_lamed_he_once_confirmed: true,
      psalm_9_11_orientation_confirmed: true,
      comfortable_volume_confirmed: true,
      latency_seconds: latency(input.middleLatencySeconds, 'day030_middle_latency_invalid'),
      depth_score: score(input.middleDepthScore, 'day030_middle_depth_invalid'),
      stability_score: score(input.middleStabilityScore, 'day030_middle_stability_invalid'),
      exit_clarity_score: score(input.middleExitClarityScore, 'day030_middle_exit_clarity_invalid'),
      deepest_state_noticed: input.middleDeepestStateNoticed === true,
      three_natural_breaths_if_deepest_state_noticed_confirmed: input.middleDeepestStateNoticed ? true : input.middleThreeNaturalBreathsIfDeepestStateNoticedConfirmed === true,
      signature: signature(input.middleSignature),
      e1_e5_recorded_confirmed: true,
      future_mastery_criterion_defined_confirmed: true,
      single_session_not_definitive_confirmed: true,
      eyes_open_confirmed: true,
      headphones_removed_confirmed: true,
      environmental_orientation_confirmed: true,
      integration_vault_entry_ref: uuid(input.integrationVaultEntryRef, 'day030_integration_vault_ref_invalid'),
    },
    soul_mirror: {
      completed: true,
      acoustic_discernment_vault_entry_ref: uuid(input.acousticDiscernmentVaultEntryRef, 'day030_soul_vault_ref_invalid'),
    },
    voluntary_completion_confirmed: true,
    safety_stop_occurred: input.safetyStopOccurred === true,
  };
}

export function day030TotalDurationSeconds(evidence: Day030EvidenceV1): number {
  return evidence.jachin.duration_seconds + evidence.boaz.duration_seconds + evidence.middle.duration_seconds;
}

export function buildDay030SafeMetrics(input: { totalDurationSeconds: number; distractionCount: number; volumePermille: number }): SafeMetricRecord {
  if (!Number.isInteger(input.totalDurationSeconds) || input.totalDurationSeconds !== 1800) throw new Error('day030_total_duration_invalid');
  return {
    total_duration_seconds: 1800,
    distraction_count: integer(input.distractionCount, 0, 29997, 'day030_total_distractions_invalid'),
    volume_permille: integer(input.volumePermille, 1, 1000, 'day030_volume_invalid'),
  };
}
