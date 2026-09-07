// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyServerCompletion,
  createDayRuntimeState,
  deriveKetherCrown,
  ketherGateForDay,
  markLocalCompletionPendingSync,
  mergeEvidence,
  resolveDayStatus,
  startDayRuntime,
  validateEvidence,
} from './index.ts';

const progress = (completedDays = []) => ({
  completedDays,
  currentDay: 1,
  xpTotal: 0,
  initiatoryGrade: 1,
  initiatoryTitle: 'Neófito',
});

const definition = (day, overrides = {}) => ({
  day,
  chapter: 1,
  sephira: 'Kether',
  world: 'Atziluth',
  cycle: day <= 5 ? 'Vehuiah' : 'Jeliel',
  cycleIndex: day <= 5 ? 1 : 2,
  cycleDay: ((day - 1) % 5) + 1,
  cycleLength: 5,
  gate: ketherGateForDay(day),
  phases: [
    { id: 'threshold', label: 'Limiar', kind: 'threshold' },
    { id: 'practice', label: 'Prática', kind: 'practice' },
    { id: 'return', label: 'Retorno', kind: 'grounding', requiresReturnConfirmation: true },
    { id: 'complete', label: 'Completo', kind: 'complete' },
  ],
  evidence: { requiredTrue: ['protocol_completed', 'return_confirmed'] },
  ...overrides,
});

test('DAY-RUNTIME-001 sequential Kether Day remains locked until previous Day is canonical', () => {
  assert.equal(resolveDayStatus(definition(2), progress([])), 'locked');
  assert.equal(resolveDayStatus(definition(2), progress([1])), 'available');
});

test('DAY-RUNTIME-002 completed Day resolves to revisit mode instead of a second first completion', () => {
  const state = createDayRuntimeState(definition(7), progress([1, 2, 3, 4, 5, 6, 7]));
  assert.equal(state.status, 'complete');
  assert.equal(state.mode, 'revisit');
});

test('CRW-RUNTIME-001 fragments are derived from Day completions only', () => {
  const crown = deriveKetherCrown(Array.from({ length: 15 }, (_, index) => index + 1));
  assert.equal(crown.fragmentsLit, 3);
  assert.equal(crown.fragments[0].completedDays, 5);
  assert.equal(crown.fragments[2].lit, true);
  assert.equal(crown.fragments[3].lit, false);
  assert.equal(crown.portalUnlocked, false);
});

test('CRW-RUNTIME-002 Portal stays locked at 34/35 and unlocks at 35/35 without implying Kether complete', () => {
  const first34 = Array.from({ length: 34 }, (_, index) => index + 1);
  const first35 = Array.from({ length: 35 }, (_, index) => index + 1);
  assert.equal(deriveKetherCrown(first34).portalUnlocked, false);
  assert.equal(deriveKetherCrown(first35).portalUnlocked, true);
  assert.equal(deriveKetherCrown(first35).ketherComplete, false);
  assert.equal(resolveDayStatus(definition(36), progress(first34)), 'locked');
  assert.equal(resolveDayStatus(definition(36), progress(first35)), 'available');
});

test('EVIDENCE-RUNTIME-001 required flags/minimums/categories fail closed', () => {
  const contract = {
    requiredTrue: ['protocol_completed', 'return_confirmed'],
    minimums: { minutes: 5 },
    categories: { response: ['none', 'weak', 'moderate', 'strong'] },
  };

  assert.equal(validateEvidence({ protocol_completed: true }, contract).valid, false);
  assert.equal(validateEvidence({
    protocol_completed: true,
    return_confirmed: true,
    minutes: 4,
    response: 'moderate',
  }, contract).valid, false);
  assert.equal(validateEvidence({
    protocol_completed: true,
    return_confirmed: true,
    minutes: 5,
    response: 'moderate',
  }, contract).valid, true);
});

test('OFF-RUNTIME-001 local practice completion never becomes canonical complete without server result', () => {
  const def = definition(1);
  let state = createDayRuntimeState(def, progress([]));
  state = startDayRuntime(state, 'device-a-session-001');
  state = mergeEvidence(state, { protocol_completed: true, return_confirmed: true });
  state = { ...state, returnConfirmed: true };
  state = markLocalCompletionPendingSync(state, def);

  assert.equal(state.status, 'local_complete_pending_sync');
  assert.equal(state.serverCompletion, null);

  state = applyServerCompletion(state, {
    day: 1,
    firstCompletion: true,
    xpAwarded: 150,
    xpTotal: 150,
    initiatoryGrade: 1,
    initiatoryTitle: 'Neófito',
  });

  assert.equal(state.status, 'complete');
  assert.equal(state.serverCompletion?.xpAwarded, 150);
});

test('PORTAL-RUNTIME-001 server completion is the only source of grade transition', () => {
  const first35 = Array.from({ length: 35 }, (_, index) => index + 1);
  const def = definition(36, { portal: true });
  let state = createDayRuntimeState(def, progress(first35));
  state = startDayRuntime(state, 'portal-device-a');
  state = mergeEvidence(state, { protocol_completed: true, return_confirmed: true });
  state = { ...state, returnConfirmed: true };
  state = markLocalCompletionPendingSync(state, def);

  assert.equal(state.status, 'local_complete_pending_sync');
  assert.equal(state.serverCompletion, null);

  state = applyServerCompletion(state, {
    day: 36,
    firstCompletion: true,
    xpAwarded: 500,
    xpTotal: 5150,
    initiatoryGrade: 2,
    initiatoryTitle: 'Iniciado',
  });

  assert.equal(state.serverCompletion?.initiatoryGrade, 2);
  assert.equal(state.serverCompletion?.initiatoryTitle, 'Iniciado');
});
