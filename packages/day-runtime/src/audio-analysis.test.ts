import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeFloat32Pcm, decodeFloat32Pcm } from './audio-analysis.ts';

function sine(frequencyHz: number, sampleRateHz: number, count: number, amplitude = 0.5): Float32Array {
  return Float32Array.from({ length: count }, (_, index) => amplitude * Math.sin((2 * Math.PI * frequencyHz * index) / sampleRateHz));
}

test('analysis finds the dominant bin of a 440 Hz sine within FFT resolution', () => {
  const sampleRate = 48_000;
  const result = analyzeFloat32Pcm(sine(440, sampleRate, 4096), sampleRate, 4096);
  const binWidth = sampleRate / 4096;
  assert.ok(Math.abs(result.dominantFrequencyHz - 440) <= binWidth);
  assert.ok(result.rmsDbfs < 0 && result.rmsDbfs > -20);
  assert.ok(result.peakDbfs < 0 && result.peakDbfs > -10);
  assert.equal(result.waveform.length, 48);
  assert.equal(result.spectrum.length, 36);
});

test('silence produces floor metrics and no spectral oracle value', () => {
  const result = analyzeFloat32Pcm(new Float32Array(2048), 48_000);
  assert.equal(result.rms, 0);
  assert.equal(result.rmsDbfs, -120);
  assert.equal(result.peakDbfs, -120);
  assert.equal(result.dominantFrequencyHz, 0);
  assert.equal(result.spectralCentroidHz, 0);
});

test('stereo PCM is averaged to mono deterministically', () => {
  const interleaved = new Float32Array([1, -1, 0.5, 0.5, -0.25, -0.75]);
  const mono = decodeFloat32Pcm(interleaved.buffer, 2);
  assert.deepEqual(Array.from(mono), [0, 0.5, -0.5]);
});

test('relative level follows amplitude without claiming calibrated SPL', () => {
  const sampleRate = 48_000;
  const quiet = analyzeFloat32Pcm(sine(600, sampleRate, 2048, 0.1), sampleRate);
  const loud = analyzeFloat32Pcm(sine(600, sampleRate, 2048, 0.8), sampleRate);
  assert.ok(loud.rmsDbfs > quiet.rmsDbfs);
  assert.ok(loud.peakDbfs > quiet.peakDbfs);
});
