import test from 'node:test';
import assert from 'node:assert/strict';
import { createLucidityRecord } from '@hnk/lucidity-contract';
import { replayLucidityHistory } from '@hnk/lucidity-telemetry';
import { transitionExplicitCanonDecision } from '../src/index.mjs';

test('explicit canon decision emits replayable auditable transition', () => {
  const reviewed = createLucidityRecord({ subjectId: 'claim-l31', state: 'REVIEWED', evidenceRefs: ['evidence:1'], reviewRefs: ['review:1'] });
  const { record, event } = transitionExplicitCanonDecision(reviewed, { outcome: 'APPROVE', explicitHumanDecision: true, canonRef: 'canon:claim-l31', decidedBy: 'TW', decidedAt: '2026-09-22T12:45:00-03:00' }, { eventId: 'lucidity-event-l31-001', occurredAt: '2026-09-22T12:45:00-03:00', actorId: 'TW', reason: 'Explicit canon approval after human review.' });
  assert.equal(record.state, 'CANON_APPROVED');
  assert.equal(event.fromState, 'REVIEWED');
  assert.equal(event.toState, 'CANON_APPROVED');
  assert.equal(event.actorId, 'TW');
  assert.deepEqual(event.canonRefs, ['canon:claim-l31']);
  assert.equal(replayLucidityHistory(reviewed, [event]).state, 'CANON_APPROVED');
});

test('bridge telemetry cannot be emitted without event identity and time', () => {
  const reviewed = createLucidityRecord({ subjectId: 'claim-l31-b', state: 'REVIEWED', reviewRefs: ['review:1'] });
  assert.throws(() => transitionExplicitCanonDecision(reviewed, { outcome: 'APPROVE', explicitHumanDecision: true, canonRef: 'canon:b', decidedBy: 'TW' }, {}), /eventId and occurredAt/);
});
