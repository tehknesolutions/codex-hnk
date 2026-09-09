import type { HnkAudioPreset } from './index.js';

export const HNK_NELCHAEL_D107_SATURN_ACTIVE_PRESET_ID = 'HNK-NELCHAEL-D107-SATURN-ACTIVE-V1' as const;
export const HNK_NELCHAEL_D107_SATURN_CONTROL_PRESET_ID = 'HNK-NELCHAEL-D107-SATURN-CONTROL-V1' as const;
export const HNK_NELCHAEL_D107_SATURN_ACTIVE_RENDER_SHA256 = '9f21167fa7f733402894f81020474437a5857be6805f5847202d4827ced44c10' as const;
export const HNK_NELCHAEL_D107_SATURN_CONTROL_RENDER_SHA256 = '15a1ece7c10371d4e4054333295c2e8ef11791463a532b3e0cd15bed198ee010' as const;
export const HNK_NELCHAEL_D107_SAMPLE_RATE = 44_100 as const;
export const HNK_NELCHAEL_D107_LOOP_SECONDS = 1 as const;
export const HNK_NELCHAEL_D107_DURATION_SECONDS = 600 as const;

const NELCHAEL_D107_SAFETY = Object.freeze({
  maxOutputGain: 0.08,
  fadeInSeconds: 5,
  fadeOutSeconds: 10,
  autoplay: false as const,
  userVolumeControl: true as const,
  immediateStop: true as const,
});

export const HNK_NELCHAEL_D107_SATURN_ACTIVE_PRESET_V1 = Object.freeze({
  id: HNK_NELCHAEL_D107_SATURN_ACTIVE_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'HNK · Nelchael Day 107 Saturn ACTIVE · 147.85/151.85 Hz',
  layers: [
    { kind: 'binaural', leftHz: 147.85, rightHz: 151.85, differenceHz: 4, gain: 0.06 },
  ],
  sourceReferences: [
    {
      id: 'HNK-D107-SATURN-CARRIER',
      rawLabel: 'frequência planetária de Saturno',
      sourceRef: 'docs/audio/source-locks/HNK_SATURN_COUPSTO_SOURCE_V1.md',
      role: 'carrier-base',
      hz: 147.85,
      note: 'HNK explicitly adopts the Cousto Cosmic Octave Saturn tone as the numeric carrier identity for this otherwise unspecified source-plan label.',
    },
    {
      id: 'HNK-D107-THETA-DIFFERENCE',
      rawLabel: 'Theta difference = 4 Hz',
      sourceRef: 'docs/audio/source-locks/HNK_APP_ONBOARDING_AUDIO_SOURCE_V1.md',
      role: 'binaural-difference',
      hz: 4,
      note: 'The 4 Hz binaural difference comes from the HNK player architecture, not from Saturn symbolism; right carrier = base + difference.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Nelchael Day 107 Saturn ritual audio — playback is not a neurological or planetary measurement',
  durationSeconds: HNK_NELCHAEL_D107_DURATION_SECONDS,
  approvalRef: 'docs/audio/HNK_NELCHAEL_D107_SATURN_AUDIO_FREEZE_V1.md',
  provenanceRef: 'docs/audio/source-locks/HNK_SATURN_COUPSTO_SOURCE_V1.md',
  renderChecksumSha256: HNK_NELCHAEL_D107_SATURN_ACTIVE_RENDER_SHA256,
  safety: NELCHAEL_D107_SAFETY,
} satisfies HnkAudioPreset);

export const HNK_NELCHAEL_D107_SATURN_CONTROL_PRESET_V1 = Object.freeze({
  id: HNK_NELCHAEL_D107_SATURN_CONTROL_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'HNK · Nelchael Day 107 Saturn CONTROL · 147.85/147.85 Hz',
  layers: [
    { kind: 'stereo-control', leftHz: 147.85, rightHz: 147.85, gain: 0.06 },
  ],
  sourceReferences: [
    {
      id: 'HNK-D107-SATURN-CONTROL-CARRIER',
      rawLabel: 'Saturn carrier control without active binaural difference',
      sourceRef: 'docs/audio/HNK_NELCHAEL_D107_SATURN_AUDIO_FREEZE_V1.md',
      role: 'carrier-base',
      hz: 147.85,
      note: 'Product control preserves carrier, gain, duration and stereo context while removing the active 4 Hz difference.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Nelchael Day 107 Saturn control condition — no binaural difference',
  durationSeconds: HNK_NELCHAEL_D107_DURATION_SECONDS,
  approvalRef: 'docs/audio/HNK_NELCHAEL_D107_SATURN_AUDIO_FREEZE_V1.md',
  provenanceRef: 'docs/audio/source-locks/HNK_SATURN_COUPSTO_SOURCE_V1.md',
  renderChecksumSha256: HNK_NELCHAEL_D107_SATURN_CONTROL_RENDER_SHA256,
  safety: NELCHAEL_D107_SAFETY,
} satisfies HnkAudioPreset);

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
}

function createStereoSineLoopWavBytes(leftHz: number, rightHz: number): Uint8Array {
  const sampleRate = HNK_NELCHAEL_D107_SAMPLE_RATE;
  const sampleCount = sampleRate * HNK_NELCHAEL_D107_LOOP_SECONDS;
  const channels = 2;
  const bytesPerSample = 2;
  const dataSize = sampleCount * channels * bytesPerSample;
  const bytes = new Uint8Array(44 + dataSize);
  const view = new DataView(bytes.buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const t = index / sampleRate;
    const left = Math.sin(2 * Math.PI * leftHz * t) * 0.06;
    const right = Math.sin(2 * Math.PI * rightHz * t) * 0.06;
    const leftPcm = Math.max(-32768, Math.min(32767, Math.round(left * 32767)));
    const rightPcm = Math.max(-32768, Math.min(32767, Math.round(right * 32767)));
    view.setInt16(44 + index * 4, leftPcm, true);
    view.setInt16(46 + index * 4, rightPcm, true);
  }

  return bytes;
}

export function createNelchaelD107SaturnActiveLoopWavBytes(): Uint8Array {
  return createStereoSineLoopWavBytes(147.85, 151.85);
}

export function createNelchaelD107SaturnControlLoopWavBytes(): Uint8Array {
  return createStereoSineLoopWavBytes(147.85, 147.85);
}
