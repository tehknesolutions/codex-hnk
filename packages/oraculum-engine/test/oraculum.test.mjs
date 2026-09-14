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

const EXPECTED_COMMIT = 'HNK-ORACULUM-CUBE/V0.1|HNK_ORACULUM_DEFAULT_V1|STATE|Qual padrão precisa se manifestar?|000000000111111111222222222333333333444444444555555555|NULL';
const EXPECTED_SEED = '147a32d82ac5d72d65b9e0e912db069e42c03ca98c47f17d76cd7162fbd02b4a';

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
  assert.equal(result.path32.index, 21);
  assert.equal(result.hnk.glyphId, 'G26');
  assert.equal(result.tarot.cardIndex, 55);
  assert.equal(result.astrology.zodiac, 'ARIES');
  assert.equal(result.astrology.planet, 'MERCURY');
  assert.equal(result.astrology.element, 'WATER');
  assert.equal(result.alchemy.principle, 'SULFUR');
  assert.equal(result.alchemy.phase, 'CITRINITAS');
  assert.equal(result.numerology.raw, 47);
  assert.equal(result.colors.essence, '#B96B2D');
  assert.equal(result.colors.shadow, '#4694D2');
  assert.equal(result.colors.manifestation, '#6B2DB9');
  assert.deepEqual(result.iching.movingLines, [1, 4, 6]);
  assert.equal(result.iching.primary.lowerTrigram.id, 'KUN');
  assert.equal(result.iching.primary.upperTrigram.id, 'GEN');
  assert.equal(result.iching.primary.kingWen, 23);
  assert.equal(result.iching.resulting.lowerTrigram.id, 'ZHEN');
  assert.equal(result.iching.resulting.upperTrigram.id, 'ZHEN');
  assert.equal(result.iching.resulting.kingWen, 51);
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

test('profile is seed-domain separated', () => {
  const base = runOracle({ intent: INTENT, cubeState: SOLVED, profileId: DEFAULT_PROFILE_ID });
  const alternate = runOracle({ intent: INTENT, cubeState: SOLVED, profileId: 'TEST_PROFILE_V1' });
  assert.notEqual(base.raw.seed256, alternate.raw.seed256);
  assert.equal(base.hnk.authority, '@hnk/glyphs');
  assert.equal(alternate.hnk.authority, '@hnk/glyphs');
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
