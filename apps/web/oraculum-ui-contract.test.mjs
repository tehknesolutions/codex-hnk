import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runOracle } from '@hnk/oraculum-engine';
import { interpretOracle } from '@hnk/oraculum-engine/interpretation';

const SOLVED = '000000000111111111222222222333333333444444444555555555';
const INTENT = 'Qual padrão precisa se manifestar?';
const EXPECTED_SEED = 'df6bcd1bfd58288fb8f7d7e0f22b69d7e305a24429ba4445c242efc000e3b6fc';

test('physical surface preserves the locked V0.4 golden vector', () => {
  const raw = runOracle({ intent: INTENT, cubeState: SOLVED, mode: 'STATE' });
  const interpreted = interpretOracle(raw, { profileId: 'HNK_ORACULUM_DEFAULT_V1', includeResultingIChing: true });
  assert.equal(raw.raw.seed256, EXPECTED_SEED);
  assert.equal(raw.hnk.glyphId, 'G39');
  assert.equal(interpreted.dominantConvergence?.id, 'ELEMENT:FIRE');
  assert.deepEqual(interpreted.tensions.map(item => item.axis), ['FIRE<->WATER', 'AIR<->EARTH']);
});

test('web API keeps the crypto/decoder on the Node server boundary', () => {
  const route = readFileSync(new URL('./app/api/oraculum/route.ts', import.meta.url), 'utf8');
  assert.match(route, /runtime = 'nodejs'/);
  assert.match(route, /@hnk\/oraculum-engine/);
  assert.match(route, /interpretOracle/);
});

test('physical scan profile locks centers and face order', () => {
  const scan = readFileSync(new URL('../../docs/oraculum/HOC_FACELET_SCAN_V1.md', import.meta.url), 'utf8');
  assert.match(scan, /U -> R -> F -> D -> L -> B/);
  assert.match(scan, /U5=0, R5=1, F5=2, D5=3, L5=4, B5=5/);
  assert.match(scan, /exactly nine occurrences of each digit/);
});
