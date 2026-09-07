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

export type HnkCarrierLayer = {
  kind: 'carrier';
  hz: number;
  gain: number;
};

export type HnkBinauralLayer = {
  kind: 'binaural';
  leftHz: number;
  rightHz: number;
  differenceHz: number;
  gain: number;
};

export type HnkRitualToneLayer = {
  kind: 'ritual-tone';
  hz: number;
  gain: number;
};

export type HnkAmbientLayer = {
  kind: 'ambient';
  assetId: string;
  gain: number;
};

export type HnkAudioLayer = HnkCarrierLayer | HnkBinauralLayer | HnkRitualToneLayer | HnkAmbientLayer;

export type HnkAudioSafety = {
  maxOutputGain: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  autoplay: false;
  userVolumeControl: true;
  immediateStop: true;
};

export type HnkAudioPreset = {
  id: string;
  version: string;
  status: HnkAudioPresetStatus;
  label: string;
  layers: HnkAudioLayer[];
  sourceReferences: HnkAudioSourceReference[];
  unresolvedReferences: string[];
  targetStateLabel?: string;
  approvalRef?: string;
  provenanceRef?: string;
  renderChecksumSha256?: string;
  safety: HnkAudioSafety;
};

function finitePositive(value: number) {
  return Number.isFinite(value) && value > 0;
}

function gainValid(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function sha256Valid(value: string | undefined) {
  return value === undefined || /^[a-f0-9]{64}$/i.test(value);
}

export function validateHnkAudioPreset(preset: HnkAudioPreset): string[] {
  const errors: string[] = [];

  if (!preset.id.trim()) errors.push('preset.id is required');
  if (!preset.version.trim()) errors.push('preset.version is required');
  if (!preset.label.trim()) errors.push('preset.label is required');
  if (!gainValid(preset.safety.maxOutputGain)) errors.push('safety.maxOutputGain must be between 0 and 1');
  if (!Number.isFinite(preset.safety.fadeInSeconds) || preset.safety.fadeInSeconds < 0) errors.push('safety.fadeInSeconds must be >= 0');
  if (!Number.isFinite(preset.safety.fadeOutSeconds) || preset.safety.fadeOutSeconds < 0) errors.push('safety.fadeOutSeconds must be >= 0');
  if (preset.safety.autoplay !== false) errors.push('ritual audio autoplay is forbidden');
  if (preset.safety.userVolumeControl !== true) errors.push('user volume control is required');
  if (preset.safety.immediateStop !== true) errors.push('immediate stop is required');
  if (!sha256Valid(preset.renderChecksumSha256)) errors.push('renderChecksumSha256 must be a 64-character SHA-256 hex digest');

  for (const layer of preset.layers) {
    if (!gainValid(layer.gain)) errors.push(`${layer.kind}.gain must be between 0 and 1`);

    if (layer.kind === 'carrier' || layer.kind === 'ritual-tone') {
      if (!finitePositive(layer.hz)) errors.push(`${layer.kind}.hz must be > 0`);
    }

    if (layer.kind === 'binaural') {
      if (!finitePositive(layer.leftHz) || !finitePositive(layer.rightHz) || !finitePositive(layer.differenceHz)) {
        errors.push('binaural frequencies must be > 0');
      }
      const calculatedDifference = Math.abs(layer.rightHz - layer.leftHz);
      if (Math.abs(calculatedDifference - layer.differenceHz) > 0.0001) {
        errors.push('binaural.differenceHz must equal |rightHz - leftHz|');
      }
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

  if (preset.status === 'published' && !preset.renderChecksumSha256) {
    errors.push('published preset requires renderChecksumSha256');
  }

  return errors;
}

export function assertPublishableHnkAudioPreset(preset: HnkAudioPreset): HnkAudioPreset {
  const errors = validateHnkAudioPreset(preset);
  if (preset.status !== 'published') errors.push('preset status must be published');
  if (errors.length) throw new Error(`HNK audio preset is not publishable: ${errors.join('; ')}`);
  return preset;
}

export const HNK_AUDIO_CONTRACT_VERSION = '1.0.0';
