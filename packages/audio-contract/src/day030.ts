import type { HnkAudioPreset } from './index.js';
import { validateHnkAudioPreset } from './index.js';

export const DAY030_ASMR_AUDIO_PRESET_ID = 'HNK-KETHER-D030-ASMR-ACTIVE-V1' as const;
export const DAY030_CONTROL_AUDIO_PRESET_ID = 'HNK-KETHER-D030-CONTROL-V1' as const;
export const DAY030_AUDIO_SAMPLE_RATE = 22_050 as const;
export const DAY030_AUDIO_LOOP_SECONDS = 8 as const;
export const DAY030_AUDIO_TARGET_RMS = 0.025 as const;
export const DAY030_AUDIO_PEAK_CEILING = 0.12 as const;

const FREEZE_REF = 'docs/audio/HNK_DAY030_ASMR_FREEZE_V1.md';
const CANON_REF = 'Tehkne-Solutions/hnk-codex-365:canon/capitulo-01-kether/dia-030.md';

export const DAY030_ASMR_AUDIO_PRESET_V1: HnkAudioPreset = Object.freeze({
  id: DAY030_ASMR_AUDIO_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'Day 030 · Kether procedural ASMR active',
  layers: [
    { kind: 'binaural', leftHz: 192, rightHz: 198, differenceHz: 6, gain: 0.008 },
  ],
  sourceReferences: [
    {
      id: 'D030-CANON-ASMR',
      rawLabel: 'sons ASMR binaurais de Kether',
      sourceRef: CANON_REF,
      role: 'target-state-label',
      note: 'Canonical wording preserved. Product V1 implements a deterministic stereo microson texture; no neurological-state guarantee.',
    },
    {
      id: 'D030-PRODUCT-BINAURAL-DIFF',
      rawLabel: '6 Hz channel difference',
      sourceRef: FREEZE_REF,
      role: 'binaural-difference',
      hz: 6,
      note: 'Product parameter only; not a claim that playback causes a 6 Hz brain state.',
    },
  ],
  unresolvedReferences: [],
  targetStateLabel: 'ASMR / absorption — subjective training label only',
  approvalRef: FREEZE_REF,
  provenanceRef: FREEZE_REF,
  safety: {
    maxOutputGain: DAY030_AUDIO_PEAK_CEILING,
    fadeInSeconds: 2,
    fadeOutSeconds: 2,
    autoplay: false,
    userVolumeControl: true,
    immediateStop: true,
  },
});

export const DAY030_CONTROL_AUDIO_PRESET_V1: HnkAudioPreset = Object.freeze({
  id: DAY030_CONTROL_AUDIO_PRESET_ID,
  version: '1.0.0',
  status: 'approved',
  label: 'Day 030 · neutral procedural control',
  layers: [],
  sourceReferences: [
    {
      id: 'D030-CANON-CONTROL',
      rawLabel: 'áudio controle neutro, de duração e volume semelhantes, sem microsons ASMR nem fórmula teúrgica',
      sourceRef: CANON_REF,
      role: 'target-state-label',
      note: 'Control retains the common neutral bed and matched RMS while omitting ASMR micro-events, binaural difference and ritual formula.',
    },
  ],
  unresolvedReferences: [],
  approvalRef: FREEZE_REF,
  provenanceRef: FREEZE_REF,
  safety: {
    maxOutputGain: DAY030_AUDIO_PEAK_CEILING,
    fadeInSeconds: 2,
    fadeOutSeconds: 2,
    autoplay: false,
    userVolumeControl: true,
    immediateStop: true,
  },
});

export type Day030ProceduralCondition = 'ACTIVE_ASMR' | 'NEUTRAL_CONTROL';

export interface Day030ProceduralAudioStats {
  sampleRateHz: number;
  loopSeconds: number;
  sampleCountPerChannel: number;
  rms: number;
  peak: number;
}

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

function smoothBurst(t: number, start: number, duration: number, hz: number): number {
  const local = t - start;
  if (local < 0 || local >= duration) return 0;
  const phase = local / duration;
  const envelope = 0.5 - 0.5 * Math.cos(2 * Math.PI * phase);
  const carrier = Math.sin(2 * Math.PI * hz * local);
  const shimmer = 0.55 + 0.45 * Math.sin(2 * Math.PI * 17 * local);
  return carrier * envelope * shimmer;
}

function createFloatStereo(condition: Day030ProceduralCondition): { left: Float64Array; right: Float64Array } {
  const sampleCount = DAY030_AUDIO_SAMPLE_RATE * DAY030_AUDIO_LOOP_SECONDS;
  const left = new Float64Array(sampleCount);
  const right = new Float64Array(sampleCount);
  const events = [
    [0.45, 0.16, 1100, -0.82],
    [1.15, 0.20, 1480, 0.76],
    [1.92, 0.12, 2100, -0.58],
    [2.73, 0.24, 1320, 0.66],
    [3.48, 0.14, 2380, -0.72],
    [4.18, 0.22, 1580, 0.55],
    [4.95, 0.13, 1920, -0.48],
    [5.66, 0.21, 1240, 0.72],
    [6.38, 0.15, 2260, -0.67],
    [7.06, 0.18, 1420, 0.61],
  ] as const;

  for (let index = 0; index < sampleCount; index += 1) {
    const t = index / DAY030_AUDIO_SAMPLE_RATE;
    const slow = 0.88 + 0.12 * Math.sin(2 * Math.PI * 0.25 * t);
    const neutralBed = (
      Math.sin(2 * Math.PI * 96 * t) * 0.015
      + Math.sin(2 * Math.PI * 144 * t) * 0.010
    ) * slow;
    let l = neutralBed;
    let r = neutralBed;

    if (condition === 'ACTIVE_ASMR') {
      l += Math.sin(2 * Math.PI * 192 * t) * 0.008;
      r += Math.sin(2 * Math.PI * 198 * t) * 0.008;
      for (const [start, duration, hz, pan] of events) {
        const burst = smoothBurst(t, start, duration, hz) * 0.012;
        const leftGain = Math.sqrt((1 - pan) / 2);
        const rightGain = Math.sqrt((1 + pan) / 2);
        l += burst * leftGain;
        r += burst * rightGain;
      }
    }

    left[index] = l;
    right[index] = r;
  }
  return { left, right };
}

function normalizeMatchedRms(left: Float64Array, right: Float64Array): Day030ProceduralAudioStats {
  let sumSquares = 0;
  let peak = 0;
  for (let index = 0; index < left.length; index += 1) {
    const l = left[index] ?? 0;
    const r = right[index] ?? 0;
    sumSquares += l * l + r * r;
    peak = Math.max(peak, Math.abs(l), Math.abs(r));
  }
  const rms = Math.sqrt(sumSquares / Math.max(1, left.length * 2));
  const rmsScale = rms > 0 ? DAY030_AUDIO_TARGET_RMS / rms : 1;
  const peakScale = peak > 0 ? DAY030_AUDIO_PEAK_CEILING / peak : 1;
  const scale = Math.min(rmsScale, peakScale);
  let scaledSquares = 0;
  let scaledPeak = 0;
  for (let index = 0; index < left.length; index += 1) {
    left[index] = (left[index] ?? 0) * scale;
    right[index] = (right[index] ?? 0) * scale;
    scaledSquares += (left[index] ?? 0) ** 2 + (right[index] ?? 0) ** 2;
    scaledPeak = Math.max(scaledPeak, Math.abs(left[index] ?? 0), Math.abs(right[index] ?? 0));
  }
  return {
    sampleRateHz: DAY030_AUDIO_SAMPLE_RATE,
    loopSeconds: DAY030_AUDIO_LOOP_SECONDS,
    sampleCountPerChannel: left.length,
    rms: Math.sqrt(scaledSquares / Math.max(1, left.length * 2)),
    peak: scaledPeak,
  };
}

export function createDay030AudioLoopWavBytes(condition: Day030ProceduralCondition): Uint8Array {
  const preset = condition === 'ACTIVE_ASMR' ? DAY030_ASMR_AUDIO_PRESET_V1 : DAY030_CONTROL_AUDIO_PRESET_V1;
  const errors = validateHnkAudioPreset(preset);
  if (errors.length) throw new Error(`day030_audio_preset_invalid:${errors.join(';')}`);

  const { left, right } = createFloatStereo(condition);
  normalizeMatchedRms(left, right);
  const channels = 2;
  const bytesPerSample = 2;
  const dataSize = left.length * channels * bytesPerSample;
  const bytes = new Uint8Array(44 + dataSize);
  const view = new DataView(bytes.buffer);
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, DAY030_AUDIO_SAMPLE_RATE, true);
  view.setUint32(28, DAY030_AUDIO_SAMPLE_RATE * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < left.length; index += 1) {
    const leftPcm = Math.max(-32768, Math.min(32767, Math.round((left[index] ?? 0) * 32767)));
    const rightPcm = Math.max(-32768, Math.min(32767, Math.round((right[index] ?? 0) * 32767)));
    view.setInt16(44 + index * 4, leftPcm, true);
    view.setInt16(46 + index * 4, rightPcm, true);
  }
  return bytes;
}

export function createDay030AudioLoopWavBase64(condition: Day030ProceduralCondition): string {
  return bytesToBase64(createDay030AudioLoopWavBytes(condition));
}

export function inspectDay030ProceduralAudio(condition: Day030ProceduralCondition): Day030ProceduralAudioStats {
  const { left, right } = createFloatStereo(condition);
  return normalizeMatchedRms(left, right);
}
