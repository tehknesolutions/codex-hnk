import type { HnkAudioPreset } from './index.js';

export const HNK_HAZIEL_D045_ACTIVE_PRESET_ID = 'HNK-HAZIEL-D045-ACTIVE-V1' as const;
export const HNK_HAZIEL_D045_CONTROL_PRESET_ID = 'HNK-HAZIEL-D045-CONTROL-V1' as const;
export const HNK_HAZIEL_D045_ACTIVE_RENDER_SHA256 = '33b8e3567cba0ad1f05d080c437eecfe51e1993dba0d20ecfe6f600bb52f42a3' as const;
export const HNK_HAZIEL_D045_CONTROL_RENDER_SHA256 = '012100633f1548d00e62a79b0e7a0cd67a8121d198f38c1e758cf30bdaec3002' as const;
export const HNK_HAZIEL_D045_SAMPLE_RATE = 44_100 as const;
export const HNK_HAZIEL_D045_LOOP_SECONDS = 1 as const;
export const HNK_HAZIEL_D045_DURATION_SECONDS = 600 as const;

const HAZIEL_D045_SAFETY = Object.freeze({
  maxOutputGain: 0.08,
  fadeInSeconds: 5,
  fadeOutSeconds: 10,
  autoplay: false as const,
  userVolumeControl: true as const,
  immediateStop: true as const,
});

export const HNK_HAZIEL_D045_ACTIVE_PRESET_V1 = Object.freeze({
  id: HNK_HAZIEL_D045_ACTIVE_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'HNK · Haziel Day 045 ACTIVE · 432/444 Hz',
  layers: [
    { kind: 'binaural', leftHz: 432, rightHz: 444, differenceHz: 12, gain: 0.06 },
  ],
  sourceReferences: [
    {
      id: 'HNK-D045-CARRIER-BASE',
      rawLabel: 'Frequência Base: 432Hz',
      sourceRef: 'docs/audio/source-locks/HNK_APP_ONBOARDING_AUDIO_SOURCE_V1.md',
      role: 'carrier-base',
      hz: 432,
      note: 'HNK app architecture freezes the left carrier/base at 432 Hz and defines right = base + binaural difference.',
    },
    {
      id: 'HNK-D045-BINAURAL-DIFFERENCE',
      rawLabel: 'diferença alvo de doze hertz',
      sourceRef: 'content/editorial/chokmah-drafts/dia-045.md',
      role: 'binaural-difference',
      hz: 12,
      note: 'Day 045 canon candidate supplies the 12 Hz target difference and ten-minute practice duration.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Haziel Day 045 focus protocol — playback is not a neurological measurement',
  durationSeconds: HNK_HAZIEL_D045_DURATION_SECONDS,
  approvalRef: 'docs/audio/HNK_HAZIEL_D045_AUDIO_FREEZE_V1.md',
  provenanceRef: 'docs/audio/HNK_HAZIEL_D045_AUDIO_PROVENANCE_V1.md',
  renderChecksumSha256: HNK_HAZIEL_D045_ACTIVE_RENDER_SHA256,
  safety: HAZIEL_D045_SAFETY,
} satisfies HnkAudioPreset);

export const HNK_HAZIEL_D045_CONTROL_PRESET_V1 = Object.freeze({
  id: HNK_HAZIEL_D045_CONTROL_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'HNK · Haziel Day 045 CONTROL · 432/432 Hz',
  layers: [
    { kind: 'stereo-control', leftHz: 432, rightHz: 432, gain: 0.06 },
  ],
  sourceReferences: [
    {
      id: 'HNK-D045-CONTROL-CARRIER',
      rawLabel: 'controle equivalente sem diferença binaural ativa',
      sourceRef: 'content/editorial/chokmah-drafts/dia-045.md',
      role: 'carrier-base',
      hz: 432,
      note: 'Product control keeps the same carrier, gain, duration and stereo context while removing the 12 Hz difference.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Haziel Day 045 control condition — no binaural difference',
  durationSeconds: HNK_HAZIEL_D045_DURATION_SECONDS,
  approvalRef: 'docs/audio/HNK_HAZIEL_D045_AUDIO_FREEZE_V1.md',
  provenanceRef: 'docs/audio/HNK_HAZIEL_D045_AUDIO_PROVENANCE_V1.md',
  renderChecksumSha256: HNK_HAZIEL_D045_CONTROL_RENDER_SHA256,
  safety: HAZIEL_D045_SAFETY,
} satisfies HnkAudioPreset);

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
}

function createStereoSineLoopWavBytes(leftHz: number, rightHz: number): Uint8Array {
  const sampleRate = HNK_HAZIEL_D045_SAMPLE_RATE;
  const sampleCount = sampleRate * HNK_HAZIEL_D045_LOOP_SECONDS;
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

export function createHazielD045ActiveLoopWavBytes(): Uint8Array {
  return createStereoSineLoopWavBytes(432, 444);
}

export function createHazielD045ControlLoopWavBytes(): Uint8Array {
  return createStereoSineLoopWavBytes(432, 432);
}
