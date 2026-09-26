import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./Day001GoldenV2Web.tsx', import.meta.url), 'utf8');

const orderedTokens = [
  'jachinRite',
  'riteDoctrine',
  'DAY001_CANON.jachinDoctrine',
  'riteKavanah',
  'DAY001_CANON.jachinKavanah',
  'riteOrdeal',
  'DAY001_CANON.jachinOrdalia',
  'instrumentDeck',
];

test('Jachin manifests Doctrine → Kavanah → Ordeal → 528 instrument in order', () => {
  let cursor = -1;
  for (const token of orderedTokens) {
    const next = source.indexOf(token, cursor + 1);
    assert.ok(next > cursor, `missing or out-of-order Jachin token: ${token}`);
    cursor = next;
  }
});

test('Jachin keeps all three acts bound to canonical runtime content', () => {
  assert.match(source, /DAY001_CANON\.jachinDoctrine/);
  assert.match(source, /DAY001_CANON\.jachinKavanah/);
  assert.match(source, /DAY001_CANON\.jachinOrdalia/);
});

test('Jachin preserves the existing 528 Hz operator and ten-minute practice', () => {
  assert.match(source, /frequency\.value=528/);
  assert.match(source, /target=\{600\}/);
  assert.match(source, /toneStarted/);
});
