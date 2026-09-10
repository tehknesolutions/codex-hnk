import type { HnkAudioPreset } from './index.js';

export const HNK_PORTAL073_ACTIVE_PRESET_ID = 'HNK-PORTAL073-CHOKMAH-BINAH-ACTIVE-V1' as const;
export const HNK_PORTAL073_CONTROL_PRESET_ID = 'HNK-PORTAL073-CHOKMAH-BINAH-CONTROL-V1' as const;
export const HNK_PORTAL073_ACTIVE_RENDER_SHA256 = 'c8cc0b02bd8c41479eeb5b2788cf26bb951a7ad4e7c6562f6eb88bfab5e8e43b' as const;
export const HNK_PORTAL073_CONTROL_RENDER_SHA256 = '7c8c4fb511883ac4b17fc475d4303ee1a922b4b186fc204760bafe50b9b1fc7c' as const;
export const HNK_PORTAL073_SAMPLE_RATE = 44_100 as const;
export const HNK_PORTAL073_LOOP_SECONDS = 1 as const;
export const HNK_PORTAL073_DURATION_SECONDS = 600 as const;

const SAFETY = Object.freeze({
  maxOutputGain: 0.08,
  fadeInSeconds: 5,
  fadeOutSeconds: 10,
  autoplay: false as const,
  userVolumeControl: true as const,
  immediateStop: true as const,
});

export const HNK_PORTAL073_ACTIVE_PRESET_V1 = Object.freeze({
  id: HNK_PORTAL073_ACTIVE_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'HNK · Portal 073 ACTIVE · Chokmah→Binah · 528/532 Hz',
  layers: [{ kind: 'binaural', leftHz: 528, rightHz: 532, differenceHz: 4, gain: 0.06 }],
  sourceReferences: [
    {
      id: 'HNK-P073-SOLFEGGIO-528',
      rawLabel: 'Frequência Solfeggio de 528Hz gerada via Web Audio',
      sourceRef: 'docs/audio/source-locks/HNK_PORTAL073_SOLFEGGIO_SOURCE_RECONCILIATION_V1.md',
      role: 'carrier-base',
      hz: 528,
      note: 'Portal 073 adopts the already-defined HNK 528 Hz Solfeggio tone as an explicit new product mapping.',
    },
    {
      id: 'HNK-P073-THETA-4',
      rawLabel: 'ondas Theta (4Hz)',
      sourceRef: 'docs/audio/source-locks/HNK_PORTAL073_SOLFEGGIO_SOURCE_RECONCILIATION_V1.md',
      role: 'binaural-difference',
      hz: 4,
      note: '4 Hz comes from the HNK player architecture; it is not claimed to be a Chokmah or Binah property.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Portal 073 Chokmah→Binah Solfeggio/Theta mapping — playback is not a neurological measurement',
  durationSeconds: HNK_PORTAL073_DURATION_SECONDS,
  approvalRef: 'docs/audio/HNK_PORTAL073_CHOKMAH_BINAH_AUDIO_FREEZE_V1.md',
  provenanceRef: 'docs/audio/source-locks/HNK_PORTAL073_SOLFEGGIO_SOURCE_RECONCILIATION_V1.md',
  renderChecksumSha256: HNK_PORTAL073_ACTIVE_RENDER_SHA256,
  safety: SAFETY,
} satisfies HnkAudioPreset);

export const HNK_PORTAL073_CONTROL_PRESET_V1 = Object.freeze({
  id: HNK_PORTAL073_CONTROL_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'HNK · Portal 073 CONTROL · Chokmah→Binah · 528/528 Hz',
  layers: [{ kind: 'stereo-control', leftHz: 528, rightHz: 528, gain: 0.06 }],
  sourceReferences: [
    {
      id: 'HNK-P073-CONTROL-528',
      rawLabel: 'controle equivalente sem diferença binaural ativa',
      sourceRef: 'docs/audio/HNK_PORTAL073_CHOKMAH_BINAH_AUDIO_FREEZE_V1.md',
      role: 'carrier-base',
      hz: 528,
      note: 'CONTROL preserves carrier, gain, duration and stereo context while removing the active 4 Hz difference.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Portal 073 control condition — no active binaural difference',
  durationSeconds: HNK_PORTAL073_DURATION_SECONDS,
  approvalRef: 'docs/audio/HNK_PORTAL073_CHOKMAH_BINAH_AUDIO_FREEZE_V1.md',
  provenanceRef: 'docs/audio/source-locks/HNK_PORTAL073_SOLFEGGIO_SOURCE_RECONCILIATION_V1.md',
  renderChecksumSha256: HNK_PORTAL073_CONTROL_RENDER_SHA256,
  safety: SAFETY,
} satisfies HnkAudioPreset);

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
}

function createStereoSineLoopWavBytes(leftHz: number, rightHz: number): Uint8Array {
  const sampleRate = HNK_PORTAL073_SAMPLE_RATE;
  const sampleCount = sampleRate * HNK_PORTAL073_LOOP_SECONDS;
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

export function createPortal073ActiveLoopWavBytes(): Uint8Array {
  return createStereoSineLoopWavBytes(528, 532);
}

export function createPortal073ControlLoopWavBytes(): Uint8Array {
  return createStereoSineLoopWavBytes(528, 528);
}
