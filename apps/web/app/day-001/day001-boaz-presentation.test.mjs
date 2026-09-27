import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./Day001GoldenV2Web.tsx', import.meta.url), 'utf8');

const orderedTokens = [
  'boazRite',
  'boazDoctrineAct',
  'DAY001_CANON.boazDoctrine',
  'boazKavanahAct',
  'DAY001_CANON.boazKavanah',
  'boazOrdealAct',
  'DAY001_CANON.boazOrdalia',
  'boazDistractionLedger',
];

test('Boaz manifests Doctrine → Kavanah → Ordeal → distraction ledger in order', () => {
  let cursor = -1;
  for (const token of orderedTokens) {
    const next = source.indexOf(token, cursor + 1);
    assert.ok(next > cursor, `missing or out-of-order Boaz token: ${token}`);
    cursor = next;
  }
});

test('Boaz keeps all three acts bound directly to canonical runtime content', () => {
  assert.match(source, /DAY001_CANON\.boazDoctrine/);
  assert.match(source, /DAY001_CANON\.boazKavanah/);
  assert.match(source, /DAY001_CANON\.boazOrdalia/);
});

test('Boaz preserves five-minute practice, three local distractions and return gate', () => {
  assert.match(source, /target=\{300\}/);
  assert.match(source, /setDistractions\(\['','',''\]\)/);
  assert.match(source, /environmentDistractionsCount:distractionCount/);
  assert.match(source, /returns\.boaz/);
  assert.match(source, /distractionCount<3/);
});
