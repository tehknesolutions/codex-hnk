import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertLucidityRecord,
  createLucidityRecord,
  legacyUnclassified
} from './index.mjs';

test('legacy content is explicitly unclassified without inferred authority', () => {
  const record = legacyUnclassified('day-001');
  assert.equal(record.state, 'LEGACY_UNCLASSIFIED');
  assert.equal(record.provenance.classification, 'explicitly-not-inferred');
  assert.equal(assertLucidityRecord(record), true);
});

test('evidence state requires an evidence reference', () => {
  const record = createLucidityRecord({ subjectId: 'claim-1', state: 'EVIDENCE_ATTACHED' });
  assert.throws(() => assertLucidityRecord(record), /requires evidenceRefs/);
});

test('canon approval requires review and canon references', () => {
  const invalid = createLucidityRecord({ subjectId: 'claim-2', state: 'CANON_APPROVED', reviewRefs: ['review-1'] });
  assert.throws(() => assertLucidityRecord(invalid), /requires reviewRefs and canonRefs/);

  const valid = createLucidityRecord({
    subjectId: 'claim-2',
    state: 'CANON_APPROVED',
    reviewRefs: ['review-1'],
    canonRefs: ['canon-1'],
    axes: ['BELIEVE', 'DOUBT', 'PROVE']
  });
  assert.equal(assertLucidityRecord(valid), true);
});
