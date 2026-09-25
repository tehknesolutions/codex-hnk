import assert from 'node:assert/strict';
import test from 'node:test';
import { DAY001_PREMIUM_STAGES, resolveDay001PremiumJourney } from './day001-premium-contract.mjs';

const EXPECTED = ['threshold', 'revelation', 'doctrine', 'kavanah', 'ordeal', 'mirror', 'seal'];

test('exposes seven approved stages in order', () => assert.deepEqual(DAY001_PREMIUM_STAGES, EXPECTED));
test('locked stages are not executable', () => {
  const journey = resolveDay001PremiumJourney({ unlockedThrough: 'doctrine', authoritativeComplete: false });
  assert.equal(journey.find((s) => s.id === 'doctrine')?.available, true);
  assert.equal(journey.find((s) => s.id === 'kavanah')?.available, false);
});
test('Seal completion only comes from authoritative completion', () => {
  assert.equal(resolveDay001PremiumJourney({ unlockedThrough: 'seal', authoritativeComplete: false }).find((s) => s.id === 'seal')?.complete, false);
  assert.equal(resolveDay001PremiumJourney({ unlockedThrough: 'seal', authoritativeComplete: true }).find((s) => s.id === 'seal')?.complete, true);
});
test('every stage has reduced-motion semantics', () => {
  for (const stage of resolveDay001PremiumJourney({ unlockedThrough: 'seal', authoritativeComplete: false })) assert.ok(stage.reducedMotionLabel);
});
test('unknown stage fails closed', () => assert.throws(() => resolveDay001PremiumJourney({ unlockedThrough: 'unknown', authoritativeComplete: false }), /Unknown Day 001 premium stage/));
