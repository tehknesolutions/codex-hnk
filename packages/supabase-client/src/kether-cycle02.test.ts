// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertJelielFragmentLit,
  parseJelielFragment,
  resolveJelielRoute,
} from './kether-cycle02.ts';

test('Jeliel starts at Day 006', () => {
  assert.deepEqual(resolveJelielRoute(6), {
    activeDay: 6,
    cycleComplete: false,
    nextCycleDay: null,
  });
});

test('current_day routes inside Jeliel without skipping', () => {
  assert.equal(resolveJelielRoute(7).activeDay, 7);
  assert.equal(resolveJelielRoute(8).activeDay, 8);
  assert.equal(resolveJelielRoute(9).activeDay, 9);
  assert.equal(resolveJelielRoute(10).activeDay, 10);
});

test('Day 011 means Jeliel is complete and routes to Sitael', () => {
  assert.deepEqual(resolveJelielRoute(11), {
    activeDay: null,
    cycleComplete: true,
    nextCycleDay: 11,
  });
});

test('Fragment II cannot be treated as lit at 4/5', () => {
  const crown = { cycles: [{ fragment: 2, angel: 'Jeliel', completed_days: 4, lit: false }] };
  assert.deepEqual(parseJelielFragment(crown), {
    fragment: 2,
    angel: 'Jeliel',
    completedDays: 4,
    lit: false,
  });
  assert.throws(() => assertJelielFragmentLit(crown), /jeliel_fragment_not_lit/);
});

test('Fragment II lights only on authoritative 5/5 server state', () => {
  const crown = { cycles: [{ fragment: 2, angel: 'Jeliel', completed_days: 5, lit: true }] };
  assert.deepEqual(assertJelielFragmentLit(crown), {
    fragment: 2,
    angel: 'Jeliel',
    completedDays: 5,
    lit: true,
  });
});
