import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DAY001_RITUAL_TONE_HZ,
  DAY001_RITUAL_TONE_LOOP_SAMPLES,
  DAY001_RITUAL_TONE_SAMPLE_RATE,
  createDay001RitualTone528WavBytes,
} from './index.ts';

test('Day 001 ritual tone is an exact phase-closing 528 Hz WAV loop', () => {
  assert.equal(DAY001_RITUAL_TONE_HZ, 528);
  assert.equal(DAY001_RITUAL_TONE_SAMPLE_RATE, 44_100);
  assert.equal(DAY001_RITUAL_TONE_LOOP_SAMPLES, 3_675);
  assert.equal((DAY001_RITUAL_TONE_HZ * DAY001_RITUAL_TONE_LOOP_SAMPLES) / DAY001_RITUAL_TONE_SAMPLE_RATE, 44);

  const bytes = createDay001RitualTone528WavBytes();
  assert.equal(bytes.length, 44 + DAY001_RITUAL_TONE_LOOP_SAMPLES * 2);
  assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), 'RIFF');
  assert.equal(new TextDecoder().decode(bytes.slice(8, 12)), 'WAVE');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(view.getUint32(24, true), DAY001_RITUAL_TONE_SAMPLE_RATE);
});
