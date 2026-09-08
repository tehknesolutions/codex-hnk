export const DAY001_RITUAL_TONE_HZ = 528 as const;
export const DAY001_RITUAL_TONE_SAMPLE_RATE = 44_100 as const;
export const DAY001_RITUAL_TONE_LOOP_SAMPLES = 3_675 as const;
export const DAY001_RITUAL_TONE_AMPLITUDE = 0.12 as const;

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
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

/**
 * Builds one exact 1/12-second loop: 3,675 samples at 44.1 kHz contain
 * exactly 44 cycles of 528 Hz. The loop therefore closes on phase without a
 * hidden frequency approximation or network dependency.
 */
export function createDay001RitualTone528WavBytes(): Uint8Array {
  const channels = 1;
  const bytesPerSample = 2;
  const sampleCount = DAY001_RITUAL_TONE_LOOP_SAMPLES;
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
  view.setUint32(24, DAY001_RITUAL_TONE_SAMPLE_RATE, true);
  view.setUint32(28, DAY001_RITUAL_TONE_SAMPLE_RATE * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const value = Math.sin(
      (2 * Math.PI * DAY001_RITUAL_TONE_HZ * index) /
        DAY001_RITUAL_TONE_SAMPLE_RATE,
    );
    const pcm = Math.round(value * DAY001_RITUAL_TONE_AMPLITUDE * 32_767);
    view.setInt16(44 + index * bytesPerSample, pcm, true);
  }

  return bytes;
}

export function createDay001RitualTone528WavBase64(): string {
  return bytesToBase64(createDay001RitualTone528WavBytes());
}
