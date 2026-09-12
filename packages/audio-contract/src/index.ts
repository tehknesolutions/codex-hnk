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
export type HnkRitualToneLayer = { kind: 'ritual-tone'; hz: number; gain: number };
export type HnkAmbientLayer = { kind: 'ambient'; assetId: string; gain: number };
export type HnkAudioLayer = HnkCarrierLayer | HnkBinauralLayer | HnkStereoControlLayer | HnkRitualToneLayer | HnkAmbientLayer;

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
  durationSeconds?: number;
  approvalRef?: string;
  provenanceRef?: string;
  renderChecksumSha256?: string;
  safety: HnkAudioSafety;
};

function finitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function gainValid(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function sha256Valid(value: string | undefined): boolean {
  return value === undefined || /^[a-f0-9]{64}$/i.test(value);
}

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
    if ((layer.kind === 'carrier' || layer.kind === 'ritual-tone') && !finitePositive(layer.hz)) errors.push(`${layer.kind}.hz must be > 0`);
    if (layer.kind === 'binaural') {
      if (!finitePositive(layer.leftHz) || !finitePositive(layer.rightHz) || !finitePositive(layer.differenceHz)) errors.push('binaural frequencies must be > 0');
      if (Math.abs(Math.abs(layer.rightHz - layer.leftHz) - layer.differenceHz) > 0.0001) errors.push('binaural.differenceHz must equal |rightHz - leftHz|');
    }
    if (layer.kind === 'stereo-control') {
      if (!finitePositive(layer.leftHz) || !finitePositive(layer.rightHz)) errors.push('stereo-control frequencies must be > 0');
      if (Math.abs(layer.rightHz - layer.leftHz) > 0.0001) errors.push('stereo-control requires equal leftHz and rightHz');
    }
    if (layer.kind === 'ambient' && !layer.assetId.trim()) errors.push('ambient.assetId is required');
  }

  for (const ref of preset.sourceReferences) {
    if (!ref.id.trim() || !ref.rawLabel.trim() || !ref.sourceRef.trim()) errors.push('source references require id, rawLabel and sourceRef');
    if (ref.hz !== undefined && !finitePositive(ref.hz)) errors.push(`source reference ${ref.id} has invalid hz`);
  }

  if (preset.status === 'approved' || preset.status === 'published') {
    if (preset.unresolvedReferences.length) errors.push(`${preset.status} preset cannot contain unresolved references`);
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

export const DAY002_AUDIO_PRESET_ID = 'HNK-KETHER-D002-AUDIO-V1' as const;
export const DAY002_AUDIO_RENDER_SHA256 = 'f2d62825612af7e79b62965dbc28d9066dfb032e71c59d2973706d329f84cf46' as const;
export const DAY002_AUDIO_SAMPLE_RATE = 44_100 as const;
export const DAY002_AUDIO_LOOP_SECONDS = 1 as const;

export const DAY002_AUDIO_PRESET_V1: HnkAudioPreset = Object.freeze({
  id: DAY002_AUDIO_PRESET_ID,
  version: '1.0.0',
  status: 'published',
  label: 'Day 002 · 432/438 binaural + 528 ritual layer',
  layers: [
    { kind: 'binaural', leftHz: 432, rightHz: 438, differenceHz: 6, gain: 0.06 },
    { kind: 'ritual-tone', hz: 528, gain: 0.04 },
  ],
  sourceReferences: [
    { id: 'D002-CANON-528', rawLabel: 'áudio binaural em frequência Solfeggio de 528Hz', sourceRef: 'Tehkne-Solutions/hnk-codex-365:canon/capitulo-01-kether/dia-002.md', role: 'ritual-tone', hz: 528, note: 'Canon wording is preserved; the product does not reinterpret 528 as the binaural difference.' },
    { id: 'D002-HNK-BASE-432', rawLabel: '432 Hz base', sourceRef: 'docs/audio/HNK_DAY002_AUDIO_FREEZE_V1.md', role: 'carrier-base', hz: 432, note: 'HNK product decision V1.' },
    { id: 'D002-HNK-THETA-6', rawLabel: 'Theta label → 6 Hz product mapping', sourceRef: 'docs/audio/HNK_DAY002_AUDIO_FREEZE_V1.md', role: 'binaural-difference', hz: 6, note: 'Product mapping only; no claim that playback causes a neurological Theta state.' },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Theta — source/product label only; no neurological-state guarantee',
  approvalRef: 'docs/audio/HNK_DAY002_AUDIO_FREEZE_V1.md',
  provenanceRef: 'docs/audio/HNK_AUDIO_PRESET_CONTRACT_V1.md',
  renderChecksumSha256: DAY002_AUDIO_RENDER_SHA256,
  safety: { maxOutputGain: 0.12, fadeInSeconds: 5, fadeOutSeconds: 10, autoplay: false, userVolumeControl: true, immediateStop: true },
});

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
}

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index] ?? 0;
    const b = bytes[index + 1] ?? 0;
    const c = bytes[index + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;
    output += alphabet[(triple >> 18) & 63];
    output += alphabet[(triple >> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(triple >> 6) & 63] : '=';
    output += index + 2 < bytes.length ? alphabet[triple & 63] : '=';
  }
  return output;
}

export function createDay002AudioLoopWavBytes(): Uint8Array {
  const errors = validateHnkAudioPreset(DAY002_AUDIO_PRESET_V1);
  if (errors.length) throw new Error(`day002_audio_preset_invalid:${errors.join(';')}`);
  const sampleRate = DAY002_AUDIO_SAMPLE_RATE;
  const sampleCount = sampleRate * DAY002_AUDIO_LOOP_SECONDS;
  const channels = 2;
  const bytesPerSample = 2;
  const dataSize = sampleCount * channels * bytesPerSample;
  const bytes = new Uint8Array(44 + dataSize);
  const view = new DataView(bytes.buffer);
  writeAscii(view, 0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeAscii(view, 8, 'WAVE'); writeAscii(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * channels * bytesPerSample, true); view.setUint16(32, channels * bytesPerSample, true); view.setUint16(34, 16, true); writeAscii(view, 36, 'data'); view.setUint32(40, dataSize, true);
  for (let index = 0; index < sampleCount; index += 1) {
    const t = index / sampleRate;
    const ritual = Math.sin(2 * Math.PI * 528 * t) * 0.04;
    const left = Math.sin(2 * Math.PI * 432 * t) * 0.06 + ritual;
    const right = Math.sin(2 * Math.PI * 438 * t) * 0.06 + ritual;
    const leftPcm = Math.max(-32768, Math.min(32767, Math.round(left * 32767)));
    const rightPcm = Math.max(-32768, Math.min(32767, Math.round(right * 32767)));
    view.setInt16(44 + index * 4, leftPcm, true); view.setInt16(46 + index * 4, rightPcm, true);
  }
  return bytes;
}

export function createDay002AudioLoopWavBase64(): string { return bytesToBase64(createDay002AudioLoopWavBytes()); }

export const HNK_AUDIO_CONTRACT_VERSION = '1.1.0' as const;

export {
  HNK_HAZIEL_D045_ACTIVE_PRESET_V1,
  HNK_HAZIEL_D045_CONTROL_PRESET_V1,
  HNK_HAZIEL_D045_ACTIVE_RENDER_SHA256,
  HNK_HAZIEL_D045_CONTROL_RENDER_SHA256,
  HNK_HAZIEL_D045_ACTIVE_PRESET_ID,
  HNK_HAZIEL_D045_CONTROL_PRESET_ID,
  HNK_HAZIEL_D045_DURATION_SECONDS,
  createHazielD045ActiveLoopWavBytes,
  createHazielD045ControlLoopWavBytes,
} from './haziel45.js';
