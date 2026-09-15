import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HNK40_GLYPH_IDS, getGlyph } from '@hnk/glyphs';
import {
  DEFAULT_PROFILE_ID,
  ORACULUM_MODES,
  assertRuntimeGlyphCoverage,
  buildOracleCommit,
  dedupeSourceChains,
  runOracle
} from '../src/index.mjs';

const SOLVED = '000000000111111111222222222333333333444444444555555555';
const INTENT = 'Qual padrão precisa se manifestar?';

const EXPECTED_COMMIT = 'HNK-ORACULUM-CUBE/V0.4|STATE|Qual padrão precisa se manifestar?|000000000111111111222222222333333333444444444555555555|NULL';
const EXPECTED_SEED = 'df6bcd1bfd58288fb8f7d7e0f22b69d7e305a24429ba4445c242efc000e3b6fc';

test('same canonical input is byte-for-byte deterministic', () => {
  const a = runOracle({ intent: INTENT, cubeState: SOLVED });
  const b = runOracle({ intent: INTENT, cubeState: SOLVED });
  assert.deepEqual(a, b);
  assert.equal(a.commit, EXPECTED_COMMIT);
  assert.equal(a.raw.seed256, EXPECTED_SEED);
  assert.equal(a.raw.binary.length, 256);
});

test('locked V0.4 vector decodes exact fields', () => {
  const result = runOracle({ intent: INTENT, cubeState: SOLVED });
  assert.equal(result.path32.index, 24);
  assert.equal(result.hnk.glyphId, 'G39');
  assert.equal(result.tarot.cardIndex, 71);
  assert.equal(result.astrology.zodiac, 'SAGITTARIUS');
  assert.equal(result.astrology.zodiacSelection.retryCount, 1);
  assert.equal(result.astrology.planet, 'MARS');
  assert.equal(result.astrology.planetSelection.retryCount, 1);
  assert.equal(result.astrology.element, 'AIR');
  assert.equal(result.alchemy.principle, 'SALT');
  assert.equal(result.alchemy.phase, 'CITRINITAS');
  assert.equal(result.numerology.raw, 194);
  assert.equal(result.colors.essence, '#447DC7');
  assert.equal(result.colors.shadow, '#BB8238');
  assert.equal(result.colors.manifestation, '#7DC744');
  assert.deepEqual(result.iching.movingLines, [1, 3, 4]);
  assert.equal(result.iching.primary.lowerTrigram.id, 'LI');
  assert.equal(result.iching.primary.upperTrigram.id, 'LI');
  assert.equal(result.iching.primary.kingWen, 30);
  assert.equal(result.iching.resulting.lowerTrigram.id, 'KUN');
  assert.equal(result.iching.resulting.upperTrigram.id, 'GEN');
  assert.equal(result.iching.resulting.kingWen, 23);
  assert.equal(result.sigil.points.length, 16);
});

test('intent normalization is stable but the protocol separator is forbidden', () => {
  const canonical = buildOracleCommit({
    intent: '  Qual   padrão\nprecisa se manifestar?  ',
    cubeState: SOLVED
  });
  assert.equal(canonical.intent, INTENT);
  assert.throws(() => buildOracleCommit({ intent: 'A|B', cubeState: SOLVED }), /reserved separator/);
});

test('cube state requires 54 base-6 facelets and nine of each symbol', () => {
  assert.doesNotThrow(() => buildOracleCommit({ intent: 'Teste', cubeState: SOLVED }));
  assert.throws(() => buildOracleCommit({ intent: 'Teste', cubeState: SOLVED.slice(1) }), /54 base-6/);
  assert.throws(() => buildOracleCommit({ intent: 'Teste', cubeState: `1${SOLVED.slice(1)}` }), /exactly nine/);
});

test('RITUAL_32 locks exactly 32 normalized Singmaster moves', () => {
  const moves = Array.from({ length: 32 }, (_, index) => ['U', 'R', 'F2', "L'"][index % 4]);
  const canonical = buildOracleCommit({ intent: 'Teste ritual', cubeState: SOLVED, mode: ORACULUM_MODES.RITUAL_32, moves });
  assert.equal(canonical.moves.split(' ').length, 32);
  assert.throws(() => buildOracleCommit({ intent: 'Teste ritual', cubeState: SOLVED, mode: ORACULUM_MODES.RITUAL_32, moves: moves.slice(0, 31) }), /exactly 32/);
  assert.throws(() => buildOracleCommit({ intent: 'Teste ritual', cubeState: SOLVED, mode: ORACULUM_MODES.RITUAL_32, moves: [...moves.slice(0, 31), 'X'] }), /Invalid Singmaster/);
});

test('profiles are interpretation overlays and cannot mutate the raw oracle', () => {
  const base = runOracle({ intent: INTENT, cubeState: SOLVED, profileId: DEFAULT_PROFILE_ID });
  const alternate = runOracle({ intent: INTENT, cubeState: SOLVED, profileId: 'TEST_PROFILE_V1' });
  assert.equal(base.raw.seed256, alternate.raw.seed256);
  assert.deepEqual(base.raw, alternate.raw);
  assert.deepEqual(base.iching, alternate.iching);
  assert.deepEqual(base.path32, alternate.path32);
  assert.deepEqual(base.hnk, alternate.hnk);
  assert.deepEqual(base.tarot, alternate.tarot);
  assert.deepEqual(base.astrology, alternate.astrology);
  assert.deepEqual(base.alchemy, alternate.alchemy);
  assert.deepEqual(base.colors, alternate.colors);
  assert.notEqual(base.profileId, alternate.profileId);
});

test('source-chain dedupe keeps one strongest contribution per dependency chain', () => {
  const deduped = dedupeSourceChains([
    { sourceChainId: 'GD:MEM', signal: 'WATER', score: 1 },
    { sourceChainId: 'GD:MEM', signal: 'HANGED_MAN', score: 2 },
    { sourceChainId: 'ICHING:KAN', signal: 'WATER', score: 2 },
    { sourceChainId: 'RAW:ELEMENT', signal: 'WATER', score: 3 }
  ]);
  assert.equal(deduped.length, 3);
  assert.equal(deduped.find(item => item.sourceChainId === 'GD:MEM').signal, 'HANGED_MAN');
});

test('HNK40 oracle candidate registry cannot redefine runtime glyph identity', () => {
  assert.equal(assertRuntimeGlyphCoverage(), true);
  const registryUrl = new URL('../../../docs/oraculum/registry/HNK40_ORACLE_REGISTRY_V1.json', import.meta.url);
  const registry = JSON.parse(readFileSync(registryUrl, 'utf8'));
  assert.equal(registry.status, 'HNK_AUTHORED_CANDIDATE_AWAITING_HUMAN_PROMOTION');
  assert.equal(registry.entries.length, 40);
  assert.deepEqual(registry.entries.map(entry => entry.glyph_id), HNK40_GLYPH_IDS);
  for (const entry of registry.entries) {
    const runtime = getGlyph(entry.glyph_id);
    assert.equal(entry.runtime_world_id, runtime.worldId);
    assert.equal(entry.oracle_authority, 'HNK_AUTHORED_CANDIDATE');
    assert.equal('phonemeIpa' in entry, false);
    assert.equal('safeTransliteration' in entry, false);
  }
});
