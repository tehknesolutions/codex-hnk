// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertVehuiahFragmentLit,
  parseVehuiahFragment,
  resolveVehuiahRoute,
} from './kether-cycle01.ts';

test('new user starts at Day 001', () => {
  assert.deepEqual(resolveVehuiahRoute(null), {
    activeDay: 1,
    cycleComplete: false,
    nextCycleDay: null,
  });
});

test('current_day routes inside Vehuiah without skipping', () => {
  assert.equal(resolveVehuiahRoute(2).activeDay, 2);
  assert.equal(resolveVehuiahRoute(3).activeDay, 3);
  assert.equal(resolveVehuiahRoute(4).activeDay, 4);
  assert.equal(resolveVehuiahRoute(5).activeDay, 5);
});

test('Day 006 means Vehuiah is complete and routes to Jeliel', () => {
  assert.deepEqual(resolveVehuiahRoute(6), {
    activeDay: null,
    cycleComplete: true,
    nextCycleDay: 6,
  });
});

test('Fragment I cannot be treated as lit at 4/5', () => {
  const crown = {
    cycles: [
      { fragment: 1, angel: 'Vehuiah', completed_days: 4, lit: false },
    ],
  };
  assert.deepEqual(parseVehuiahFragment(crown), {
    fragment: 1,
    angel: 'Vehuiah',
    completedDays: 4,
    lit: false,
  });
  assert.throws(() => assertVehuiahFragmentLit(crown), /vehuiah_fragment_not_lit/);
});

test('Fragment I lights only on authoritative 5/5 server state', () => {
  const crown = {
    cycles: [
      { fragment: 1, angel: 'Vehuiah', completed_days: 5, lit: true },
    ],
  };
  assert.deepEqual(assertVehuiahFragmentLit(crown), {
    fragment: 1,
    angel: 'Vehuiah',
    completedDays: 5,
    lit: true,
  });
});
