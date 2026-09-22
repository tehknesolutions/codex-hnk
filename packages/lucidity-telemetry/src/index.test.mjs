import test from 'node:test';
import assert from 'node:assert/strict';
import { createLucidityRecord } from '@hnk/lucidity-contract';
import { createLucidityTransition, replayLucidityHistory } from './index.mjs';

const base = createLucidityRecord({ subjectId: 'claim-telemetry-1', state: 'HYPOTHESIS', axes: ['DOUBT'] });
const evidence = createLucidityRecord({ subjectId: 'claim-telemetry-1', state: 'EVIDENCE_ATTACHED', axes: ['DOUBT', 'PROVE'], evidenceRefs: ['evidence:1'] });
const reviewed = createLucidityRecord({ subjectId: 'claim-telemetry-1', state: 'REVIEWED', axes: ['PROVE'], evidenceRefs: ['evidence:1'], reviewRefs: ['review:1'] });
const canonical = createLucidityRecord({ subjectId: 'claim-telemetry-1', state: 'CANON_APPROVED', axes: ['PROVE'], evidenceRefs: ['evidence:1'], reviewRefs: ['review:1'], canonRefs: ['canon:1'] });

test('records who changed what when why and with which evidence', () => {
  const event = createLucidityTransition({ eventId: 'evt-1', subjectId: base.subjectId, actorId: 'TW', occurredAt: '2026-09-22T16:00:00Z', from: base, to: evidence, reason: 'Evidence dossier attached.' });
  assert.equal(event.fromState, 'HYPOTHESIS');
  assert.equal(event.toState, 'EVIDENCE_ATTACHED');
  assert.deepEqual(event.evidenceRefs, ['evidence:1']);
  assert.equal(event.actorId, 'TW');
});

test('review and canon transitions require provenance', () => {
  const invalidReviewed = createLucidityRecord({ subjectId: base.subjectId, state: 'REVIEWED' });
  assert.throws(() => createLucidityTransition({ eventId: 'evt-x', subjectId: base.subjectId, actorId: 'TW', occurredAt: '2026-09-22T16:01:00Z', from: evidence, to: invalidReviewed, reason: 'reviewed' }), /review provenance/);
});

test('history replays deterministically and detects discontinuity', () => {
  const e1 = createLucidityTransition({ eventId: 'evt-1', subjectId: base.subjectId, actorId: 'TW', occurredAt: '2026-09-22T16:00:00Z', from: base, to: evidence, reason: 'Evidence dossier attached.' });
  const e2 = createLucidityTransition({ eventId: 'evt-2', subjectId: base.subjectId, actorId: 'TW', occurredAt: '2026-09-22T16:05:00Z', from: evidence, to: reviewed, reason: 'Human evidence review completed.' });
  const e3 = createLucidityTransition({ eventId: 'evt-3', subjectId: base.subjectId, actorId: 'TW', occurredAt: '2026-09-22T16:10:00Z', from: reviewed, to: canonical, reason: 'Separate explicit human canon decision.' });
  assert.equal(replayLucidityHistory(base, [e1, e2, e3]).state, 'CANON_APPROVED');
  assert.throws(() => replayLucidityHistory(base, [e2]), /history discontinuity/);
});
