export type HnkAudioPresetStatus = 'draft' | 'proposal' | 'approved' | 'published' | 'retired';

export type HnkAudioReferenceRole =
  | 'carrier-base'
  | 'binaural-difference'
  | 'ritual-tone'
  | 'ambient-layer'
  | 'target-state-label'
  | 'unresolved';

export type HnkAudioSourceReference = {
  id: string;
  rawLabel: string;
  sourceRef: string;
  role: HnkAudioReferenceRole;
  hz?: number;
  note?: string;
};

export type HnkCarrierLayer = { kind: 'carrier'; hz: number; gain: number };
export type HnkBinauralLayer = { kind: 'binaural'; leftHz: number; rightHz: number; differenceHz: number; gain: number };
export type HnkStereoControlLayer = { kind: 'stereo-control'; leftHz: number; rightHz: number; gain: number };
export type HnkBinauralTransitionLayer = { kind: 'binaural-transition'; startLeftHz: number; endLeftHz: number; differenceHz: number; curve: 'linear'; durationSeconds: number; gain: number };
export type HnkStereoControlTransitionLayer = { kind: 'stereo-control-transition'; startHz: number; endHz: number; curve: 'linear'; durationSeconds: number; gain: number };
export type HnkRitualToneLayer = { kind: 'ritual-tone'; hz: number; gain: number };
export type HnkAmbientLayer = { kind: 'ambient'; assetId: string; gain: number };

export type HnkAudioLayer = HnkCarrierLayer | HnkBinauralLayer | HnkStereoControlLayer | HnkBinauralTransitionLayer | HnkStereoControlTransitionLayer | HnkRitualToneLayer | HnkAmbientLayer;

export type HnkAudioSafety = { maxOutputGain: number; fadeInSeconds: number; fadeOutSeconds: number; autoplay: false; userVolumeControl: true; immediateStop: true };

export type HnkAudioPreset = {
  id: string; version: string; status: HnkAudioPresetStatus; label: string; layers: HnkAudioLayer[];
  sourceReferences: HnkAudioSourceReference[]; unresolvedReferences: string[]; targetStateLabel?: string;
  durationSeconds?: number; approvalRef?: string; provenanceRef?: string; renderChecksumSha256?: string; safety: HnkAudioSafety;
};

function finitePositive(value: number) { return Number.isFinite(value) && value > 0; }
function gainValid(value: number) { return Number.isFinite(value) && value >= 0 && value <= 1; }
function sha256Valid(value: string | undefined) { return value === undefined || /^[a-f0-9]{64}$/i.test(value); }

export function validateHnkAudioPreset(preset: HnkAudioPreset): string[] {
  const errors: string[] = [];
  if (!preset.id.trim()) errors.push('preset.id is required');
  if (!preset.version.trim()) errors.push('preset.version is required');
  if (!preset.label.trim()) errors.push('preset.label is required');
  if (preset.durationSeconds !== undefined && !finitePositive(preset.durationSeconds)) errors.push('durationSeconds must be > 0');
  if (!gainValid(preset.safety.maxOutputGain)) errors.push('safety.maxOutputGain must be between 0 and 1');
  if (!Number.isFinite(preset.safety.fadeInSeconds) || preset.safety.fadeInSeconds < 0) errors.push('safety.fadeInSeconds must be >= 0');
  if (!Number.isFinite(preset.safety.fadeOutSeconds) || preset.safety.fadeOutSeconds < 0) errors.push('safety.fadeOutSeconds must be >= 0');
  if (preset.safety.autoplay !== false) errors.push('ritual audio autoplay is forbidden');
  if (preset.safety.userVolumeControl !== true) errors.push('user volume control is required');
  if (preset.safety.immediateStop !== true) errors.push('immediate stop is required');
  if (!sha256Valid(preset.renderChecksumSha256)) errors.push('renderChecksumSha256 must be a 64-character SHA-256 hex digest');
  for (const layer of preset.layers) {
    if (!gainValid(layer.gain)) errors.push(`${layer.kind}.gain must be between 0 and 1`);
    if (layer.kind === 'carrier' || layer.kind === 'ritual-tone') if (!finitePositive(layer.hz)) errors.push(`${layer.kind}.hz must be > 0`);
    if (layer.kind === 'binaural') {
      if (!finitePositive(layer.leftHz) || !finitePositive(layer.rightHz) || !finitePositive(layer.differenceHz)) errors.push('binaural frequencies must be > 0');
      if (Math.abs(Math.abs(layer.rightHz - layer.leftHz) - layer.differenceHz) > 0.0001) errors.push('binaural.differenceHz must equal |rightHz - leftHz|');
    }
    if (layer.kind === 'stereo-control') {
      if (!finitePositive(layer.leftHz) || !finitePositive(layer.rightHz)) errors.push('stereo-control frequencies must be > 0');
      if (Math.abs(layer.rightHz - layer.leftHz) > 0.0001) errors.push('stereo-control requires equal leftHz and rightHz');
    }
    if (layer.kind === 'binaural-transition') {
      if (!finitePositive(layer.startLeftHz) || !finitePositive(layer.endLeftHz) || !finitePositive(layer.differenceHz)) errors.push('binaural-transition frequencies must be > 0');
      if (!finitePositive(layer.durationSeconds)) errors.push('binaural-transition.durationSeconds must be > 0');
      if (layer.curve !== 'linear') errors.push('binaural-transition.curve must be linear');
      if (preset.durationSeconds !== undefined && Math.abs(preset.durationSeconds - layer.durationSeconds) > 0.0001) errors.push('binaural-transition duration must match preset.durationSeconds');
    }
    if (layer.kind === 'stereo-control-transition') {
      if (!finitePositive(layer.startHz) || !finitePositive(layer.endHz)) errors.push('stereo-control-transition frequencies must be > 0');
      if (!finitePositive(layer.durationSeconds)) errors.push('stereo-control-transition.durationSeconds must be > 0');
      if (layer.curve !== 'linear') errors.push('stereo-control-transition.curve must be linear');
      if (preset.durationSeconds !== undefined && Math.abs(preset.durationSeconds - layer.durationSeconds) > 0.0001) errors.push('stereo-control-transition duration must match preset.durationSeconds');
    }
    if (layer.kind === 'ambient' && !layer.assetId.trim()) errors.push('ambient.assetId is required');
  }
  for (const ref of preset.sourceReferences) {
    if (!ref.id.trim() || !ref.rawLabel.trim() || !ref.sourceRef.trim()) errors.push('source references require id, rawLabel and sourceRef');
    if (ref.hz !== undefined && !finitePositive(ref.hz)) errors.push(`source reference ${ref.id} has invalid hz`);
  }
  if (preset.status === 'approved' || preset.status === 'published') {
    if (preset.unresolvedReferences.length > 0) errors.push(`${preset.status} preset cannot contain unresolved references`);
    if (!preset.approvalRef?.trim()) errors.push(`${preset.status} preset requires approvalRef`);
    if (!preset.provenanceRef?.trim()) errors.push(`${preset.status} preset requires provenanceRef`);
  }
  if (preset.status === 'published' && !preset.renderChecksumSha256) errors.push('published preset requires renderChecksumSha256');
  return errors;
}

export function assertPublishableHnkAudioPreset(preset: HnkAudioPreset): HnkAudioPreset {
  const errors = validateHnkAudioPreset(preset);
  if (preset.status !== 'published') errors.push('preset status must be published');
  if (errors.length) throw new Error(`HNK audio preset is not publishable: ${errors.join('; ')}`);
  return preset;
}

export const HNK_AUDIO_CONTRACT_VERSION = '1.2.0';

export { HNK_HAZIEL_D045_ACTIVE_PRESET_V1, HNK_HAZIEL_D045_CONTROL_PRESET_V1, HNK_HAZIEL_D045_ACTIVE_RENDER_SHA256, HNK_HAZIEL_D045_CONTROL_RENDER_SHA256, createHazielD045ActiveLoopWavBytes, createHazielD045ControlLoopWavBytes } from './haziel45.js';
export { HNK_NELCHAEL_D107_SATURN_ACTIVE_PRESET_V1, HNK_NELCHAEL_D107_SATURN_CONTROL_PRESET_V1, HNK_NELCHAEL_D107_SATURN_ACTIVE_RENDER_SHA256, HNK_NELCHAEL_D107_SATURN_CONTROL_RENDER_SHA256, createNelchaelD107SaturnActiveLoopWavBytes, createNelchaelD107SaturnControlLoopWavBytes } from './nelchael107.js';
export { HNK_PORTAL109_SATURN_JUPITER_ACTIVE_PRESET_V1, HNK_PORTAL109_SATURN_JUPITER_CONTROL_PRESET_V1, HNK_PORTAL109_SATURN_JUPITER_ACTIVE_RENDER_SHA256, HNK_PORTAL109_SATURN_JUPITER_CONTROL_RENDER_SHA256 } from './portal109.js';
export { HNK_PORTAL073_ACTIVE_PRESET_V1, HNK_PORTAL073_CONTROL_PRESET_V1, HNK_PORTAL073_ACTIVE_RENDER_SHA256, HNK_PORTAL073_CONTROL_RENDER_SHA256, createPortal073ActiveLoopWavBytes, createPortal073ControlLoopWavBytes } from './portal073.js';
