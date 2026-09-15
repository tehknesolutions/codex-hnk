import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  classifyRgb,
  rgbDistanceSquared,
  rgbToHex,
  sampleNinePatches,
} from './app/oraculum/camera-color-utils.mjs';

test('RGB classifier chooses nearest center prototype deterministically', () => {
  const prototypes = [
    { r: 245, g: 245, b: 242 },
    { r: 217, g: 72, b: 72 },
    { r: 52, g: 168, b: 83 },
    { r: 242, g: 207, b: 58 },
    { r: 232, g: 137, b: 47 },
    { r: 63, g: 101, b: 217 },
  ];
  const result = classifyRgb({ r: 211, g: 70, b: 75 }, prototypes);
  assert.equal(result.bestDigit, 1);
  assert.ok(result.bestDistance < result.secondDistance);
  assert.ok(result.confidence > 0 && result.confidence <= 1);
});

test('RGB primitives remain byte-exact and bounded', () => {
  assert.equal(rgbDistanceSquared({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 195075);
  assert.equal(rgbToHex({ r: 68, g: 125, b: 199 }), '#447DC7');
  assert.equal(rgbToHex({ r: -5, g: 999, b: 15.6 }), '#00FF10');
});

test('nine-patch sampling returns row-major 3x3 candidates', () => {
  const width = 30;
  const height = 30;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let offset = 0; offset < data.length; offset += 4) {
    data[offset] = 10;
    data[offset + 1] = 20;
    data[offset + 2] = 30;
    data[offset + 3] = 255;
  }
  const samples = sampleNinePatches(data, width, height);
  assert.equal(samples.length, 9);
  for (const sample of samples) assert.deepEqual(sample, { r: 10, g: 20, b: 30 });
});

test('camera route preserves mandatory human review before API hash', () => {
  const source = readFileSync(new URL('./app/oraculum/camera/CameraConsultationClient.tsx', import.meta.url), 'utf8');
  assert.match(source, /reviewConfirmed/);
  assert.match(source, /Revisei visualmente todas as 54 casas/);
  assert.match(source, /if \(!reviewConfirmed\)/);
  assert.match(source, /fetch\('\/api\/oraculum'/);
  assert.match(source, /<CameraCapture/);
});
