// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCompletionResult } from './practice-record.ts';

test('completion parser preserves server-owned XP and grade fields', () => {
  const result = parseCompletionResult({
    day: 1,
    first_completion: true,
    xp_awarded: 150,
    xp_total: 150,
    initiatory_grade: 1,
    initiatory_title: 'Neófito',
    crown: { fragments: 0, day: 1 },
  });

  assert.equal(result.day, 1);
  assert.equal(result.firstCompletion, true);
  assert.equal(result.xpAwarded, 150);
  assert.equal(result.xpTotal, 150);
  assert.equal(result.initiatoryGrade, 1);
  assert.equal(result.initiatoryTitle, 'Neófito');
  assert.deepEqual(result.crown, { fragments: 0, day: 1 });
});

test('completion parser accepts Day 036 server-confirmed promotion', () => {
  const result = parseCompletionResult({
    day: 36,
    first_completion: true,
    xp_awarded: 500,
    xp_total: 5000,
    initiatory_grade: 2,
    initiatory_title: 'Iniciado',
    crown: { fragments: 7, complete: true },
  });

  assert.equal(result.day, 36);
  assert.equal(result.initiatoryGrade, 2);
  assert.equal(result.initiatoryTitle, 'Iniciado');
});

test('completion parser rejects malformed responses instead of inventing defaults', () => {
  assert.throws(
    () =>
      parseCompletionResult({
        day: 1,
        first_completion: true,
        xp_awarded: '150',
        xp_total: 150,
        initiatory_grade: 1,
        initiatory_title: 'Neófito',
      }),
    /invalid_completion_response/,
  );
});

test('completion parser rejects null or scalar response', () => {
  assert.throws(() => parseCompletionResult(null), /invalid_completion_response/);
  assert.throws(() => parseCompletionResult(1), /invalid_completion_response/);
});
