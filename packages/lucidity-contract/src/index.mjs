export const LUCIDITY_SCHEMA_VERSION = 'HNK-LUCIDITY-V1';

export const EPISTEMIC_STATES = Object.freeze([
  'LEGACY_UNCLASSIFIED',
  'TESTIMONY',
  'HYPOTHESIS',
  'SOURCE_BACKED',
  'PRACTICE_RECORDED',
  'EVIDENCE_ATTACHED',
  'CONTESTED',
  'REVIEWED',
  'CANON_APPROVED',
  'CANON_REJECTED',
  'SUPERSEDED'
]);

export const LUCIDITY_AXES = Object.freeze(['BELIEVE', 'DOUBT', 'PROVE']);

export function createLucidityRecord(input) {
  if (!input?.subjectId) throw new Error('subjectId is required');
  if (!EPISTEMIC_STATES.includes(input.state)) throw new Error(`invalid epistemic state: ${input.state}`);

  return Object.freeze({
    schemaVersion: LUCIDITY_SCHEMA_VERSION,
    subjectId: input.subjectId,
    subjectType: input.subjectType ?? 'claim',
    state: input.state,
    axes: Object.freeze([...(input.axes ?? [])]),
    sourceRefs: Object.freeze([...(input.sourceRefs ?? [])]),
    practiceRefs: Object.freeze([...(input.practiceRefs ?? [])]),
    evidenceRefs: Object.freeze([...(input.evidenceRefs ?? [])]),
    interpretationRefs: Object.freeze([...(input.interpretationRefs ?? [])]),
    contestationRefs: Object.freeze([...(input.contestationRefs ?? [])]),
    reviewRefs: Object.freeze([...(input.reviewRefs ?? [])]),
    canonRefs: Object.freeze([...(input.canonRefs ?? [])]),
    provenance: input.provenance ?? null
  });
}

export function assertLucidityRecord(record) {
  if (record.schemaVersion !== LUCIDITY_SCHEMA_VERSION) throw new Error('unsupported lucidity schema');
  if (!record.subjectId) throw new Error('subjectId is required');
  if (!EPISTEMIC_STATES.includes(record.state)) throw new Error('invalid epistemic state');
  for (const axis of record.axes ?? []) {
    if (!LUCIDITY_AXES.includes(axis)) throw new Error(`invalid lucidity axis: ${axis}`);
  }
  if (record.state === 'EVIDENCE_ATTACHED' && !(record.evidenceRefs?.length > 0)) {
    throw new Error('EVIDENCE_ATTACHED requires evidenceRefs');
  }
  if (record.state === 'CANON_APPROVED' && !(record.reviewRefs?.length > 0 && record.canonRefs?.length > 0)) {
    throw new Error('CANON_APPROVED requires reviewRefs and canonRefs');
  }
  return true;
}

export function legacyUnclassified(subjectId, subjectType = 'legacy-content') {
  return createLucidityRecord({
    subjectId,
    subjectType,
    state: 'LEGACY_UNCLASSIFIED',
    axes: [],
    provenance: { classification: 'explicitly-not-inferred' }
  });
}
