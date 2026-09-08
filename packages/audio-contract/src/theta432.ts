import type { HnkAudioPreset } from './index.js';

export const HNK_THETA432_AUDIO_PRESET_ID = 'HNK-THETA432-BINAURAL-V1' as const;
export const HNK_THETA432_AUDIO_RENDER_SHA256 = '381e06f1ae0ef4a97c063635d8d80d387b4c009ff604b7b188ffcdabcc902785' as const;
export const HNK_THETA432_AUDIO_SAMPLE_RATE = 44_100 as const;
export const HNK_THETA432_AUDIO_LOOP_SECONDS = 1 as const;

export const HNK_THETA432_AUDIO_PRESET_V1: HnkAudioPreset = Object.freeze({
  id: HNK_THETA432_AUDIO_PRESET_ID,
  version: '1.0.0',
  status: 'published',
  label: 'HNK · Theta/432 binaural product profile',
  layers: [
    { kind: 'binaural', leftHz: 432, rightHz: 438, differenceHz: 6, gain: 0.06 },
  ],
  sourceReferences: [
    {
      id: 'HNK-THETA432-BASE',
      rawLabel: 'Theta / 432Hz base',
      sourceRef: 'HNK Codex QR audio references',
      role: 'carrier-base',
      hz: 432,
      note: 'The Canon supplies the Theta label and 432 Hz base. It does not supply a binaural difference.',
    },
    {
      id: 'HNK-THETA432-DIFF',
      rawLabel: 'Theta label → 6 Hz product mapping',
      sourceRef: 'docs/audio/HNK_THETA432_BINAURAL_FREEZE_V1.md',
      role: 'binaural-difference',
      hz: 6,
      note: 'HNK product decision V1. No claim that playback guarantees or proves a neurological Theta state.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'Theta — source/product label only; no neurological-state guarantee',
  approvalRef: 'docs/audio/HNK_THETA432_BINAURAL_FREEZE_V1.md',
  provenanceRef: 'docs/audio/HNK_AUDIO_PRESET_CONTRACT_V1.md',
  renderChecksumSha256: HNK_THETA432_AUDIO_RENDER_SHA256,
  safety: {
    maxOutputGain: 0.08,
    fadeInSeconds: 5,
    fadeOutSeconds: 10,
    autoplay: false,
    userVolumeControl: true,
    immediateStop: true,
  },
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

export function createTheta432AudioLoopWavBytes(): Uint8Array {
  const sampleRate = HNK_THETA432_AUDIO_SAMPLE_RATE;
  const sampleCount = sampleRate * HNK_THETA432_AUDIO_LOOP_SECONDS;
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
    const left = Math.sin(2 * Math.PI * 432 * t) * 0.06;
    const right = Math.sin(2 * Math.PI * 438 * t) * 0.06;
    const leftPcm = Math.max(-32768, Math.min(32767, Math.round(left * 32767)));
    const rightPcm = Math.max(-32768, Math.min(32767, Math.round(right * 32767)));
    view.setInt16(44 + index * 4, leftPcm, true);
    view.setInt16(46 + index * 4, rightPcm, true);
  }
  return bytes;
}

export function createTheta432AudioLoopWavBase64(): string {
  return bytesToBase64(createTheta432AudioLoopWavBytes());
}
