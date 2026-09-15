import test from 'node:test';
import assert from 'node:assert/strict';
import { runOracle } from '../src/index.mjs';
import { getPathDescriptor, getTarotDescriptor } from '../src/profiles.mjs';
import { interpretOracle, buildInterpretationSignals } from '../src/interpretation.mjs';

const SOLVED = '000000000111111111222222222333333333444444444555555555';
const INTENT = 'Qual padrão precisa se manifestar?';
const SEED = 'df6bcd1bfd58288fb8f7d7e0f22b69d7e305a24429ba4445c242efc000e3b6fc';

test('V0.5 interpretation never mutates the locked V0.4 raw seed', () => {
  const raw = runOracle({ intent:INTENT, cubeState:SOLVED });
  const interpreted = interpretOracle(raw);
  assert.equal(raw.raw.seed256, SEED);
  assert.equal(interpreted.rawSeed256, SEED);
  assert.equal(interpreted.rawSeedInvariant, true);
  assert.equal(interpreted.rawProtocol, 'HNK-ORACULUM-CUBE/V0.4');
});

test('golden vector resolves governed Path-32 and Tarot descriptors', () => {
  const path = getPathDescriptor(24);
  assert.equal(path.letter, 'NUN');
  assert.equal(path.tarot, 'DEATH');
  assert.equal(path.attribution.kind, 'ZODIAC');
  assert.equal(path.attribution.value, 'SCORPIO');
  assert.equal(path.derivedElement, 'WATER');
  const tarot = getTarotDescriptor(71);
  assert.equal(tarot.kind, 'MINOR');
  assert.equal(tarot.suit, 'PENTACLES');
  assert.equal(tarot.rank, 'SEVEN');
  assert.equal(tarot.element, 'EARTH');
});

test('golden vector produces one independent FIRE convergence', () => {
  const interpreted = interpretOracle(runOracle({ intent:INTENT, cubeState:SOLVED }));
  assert.equal(interpreted.convergences.length, 1);
  assert.equal(interpreted.convergences[0].id, 'ELEMENT:FIRE');
  assert.equal(interpreted.convergences[0].score, 4);
  assert.deepEqual(interpreted.convergences[0].families, ['ASTROLOGY','ICHING']);
  assert.equal(interpreted.dominantConvergence.key, 'FIRE');
});

test('same-source Li/Li repetition does not create pseudo-convergence by itself', () => {
  const raw = runOracle({ intent:INTENT, cubeState:SOLVED });
  const signals = buildInterpretationSignals(raw);
  const fireIChing = signals.filter(item=>item.category==='ELEMENT' && item.key==='FIRE' && item.family==='ICHING');
  assert.equal(fireIChing.length, 2);
  assert.equal(new Set(fireIChing.map(item=>item.sourceChainId)).size, 1);
  const interpreted = interpretOracle(raw);
  assert.deepEqual(interpreted.convergences[0].families, ['ASTROLOGY','ICHING']);
});

test('golden vector exposes authored element tensions without declaring either side false', () => {
  const interpreted = interpretOracle(runOracle({ intent:INTENT, cubeState:SOLVED }));
  assert.deepEqual(interpreted.tensions.map(item=>item.axis), ['FIRE<->WATER','AIR<->EARTH']);
  const fireWater = interpreted.tensions[0];
  assert.equal(fireWater.left.score, 4);
  assert.equal(fireWater.right.score, 1);
  const airEarth = interpreted.tensions[1];
  assert.equal(airEarth.left.score, 3);
  assert.equal(airEarth.right.score, 2);
});

test('resulting I Ching signals are phase-separated from primary convergence', () => {
  const raw = runOracle({ intent:INTENT, cubeState:SOLVED });
  const interpreted = interpretOracle(raw,{ includeResultingIChing:true });
  const resulting = interpreted.signals.filter(item=>item.phase==='RESULTING');
  assert.ok(resulting.length > 0);
  assert.equal(interpreted.convergences[0].id, 'ELEMENT:FIRE');
});

test('candidate HNK oracle semantics stay opt-out until human promotion', () => {
  const interpreted = interpretOracle(runOracle({ intent:INTENT, cubeState:SOLVED }));
  assert.equal(interpreted.hnkOracleSemantics.status, 'NOT_CONSUMED');
  assert.equal(interpreted.hnkOracleSemantics.registry, 'HNK40-ORACLE-REGISTRY-V1');
  assert.equal(interpreted.malkuth.verificationRequired, true);
});

test('unknown interpretation profiles fail closed', () => {
  const raw = runOracle({ intent:INTENT, cubeState:SOLVED });
  assert.throws(()=>interpretOracle(raw,{ profileId:'NO_SUCH_PROFILE' }),/Unknown interpretation profile/);
});
