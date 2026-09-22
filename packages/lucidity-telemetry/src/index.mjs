import { assertLucidityRecord } from '@hnk/lucidity-contract';

export const LUCIDITY_EVENT_SCHEMA = 'HNK-LUCIDITY-EVENT-V1';

export function createLucidityTransition({ eventId, subjectId, actorId, occurredAt, from, to, reason, evidenceRefs = [], reviewRefs = [], canonRefs = [], causationId = null, correlationId = null }) {
  if (!eventId || !subjectId || !actorId || !occurredAt) throw new Error('eventId, subjectId, actorId and occurredAt are required');
  assertLucidityRecord(from);
  assertLucidityRecord(to);
  if (from.subjectId !== subjectId || to.subjectId !== subjectId) throw new Error('transition subject mismatch');
  if (from.state === to.state) throw new Error('transition must change epistemic state');
  if (!reason?.trim()) throw new Error('transition reason is required');
  if (to.state === 'EVIDENCE_ATTACHED' && evidenceRefs.length === 0 && to.evidenceRefs.length === 0) throw new Error('evidence transition requires evidence provenance');
  if (to.state === 'REVIEWED' && reviewRefs.length === 0 && to.reviewRefs.length === 0) throw new Error('review transition requires review provenance');
  if (to.state === 'CANON_APPROVED' && canonRefs.length === 0 && to.canonRefs.length === 0) throw new Error('canon transition requires canon provenance');

  return Object.freeze({
    schemaVersion: LUCIDITY_EVENT_SCHEMA,
    eventId,
    eventType: 'lucidity.state_transition',
    subjectId,
    actorId,
    occurredAt,
    causationId,
    correlationId,
    fromState: from.state,
    toState: to.state,
    reason,
    evidenceRefs: Object.freeze([...new Set([...evidenceRefs, ...(to.evidenceRefs ?? [])])]),
    reviewRefs: Object.freeze([...new Set([...reviewRefs, ...(to.reviewRefs ?? [])])]),
    canonRefs: Object.freeze([...new Set([...canonRefs, ...(to.canonRefs ?? [])])]),
    previousRecord: from,
    resultingRecord: to
  });
}

export function replayLucidityHistory(initialRecord, events) {
  assertLucidityRecord(initialRecord);
  let current = initialRecord;
  for (const event of events) {
    if (event.schemaVersion !== LUCIDITY_EVENT_SCHEMA) throw new Error('unsupported lucidity event schema');
    if (event.subjectId !== current.subjectId) throw new Error('history subject mismatch');
    if (event.fromState !== current.state) throw new Error(`history discontinuity: expected ${current.state}, got ${event.fromState}`);
    assertLucidityRecord(event.resultingRecord);
    current = event.resultingRecord;
  }
  return current;
}
