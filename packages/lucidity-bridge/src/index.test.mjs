import test from 'node:test';
import assert from 'node:assert/strict';
import { createLucidityRecord } from '@hnk/lucidity-contract';
import { attachExplicitCanonDecision } from './index.mjs';

test('reviewed lucidity does not become canon without a separate explicit decision', () => {
  const reviewed = createLucidityRecord({
    subjectId: 'CLAIM-001',
    state: 'REVIEWED',
    reviewRefs: [{ kind: 'HUMAN_EVIDENCE_REVIEW', id: 'CLAIM-001' }],
    evidenceRefs: [{ kind: 'CLAIM_EVIDENCE_LINK', id: 'LINK-001' }],
  });

  assert.equal(reviewed.state, 'REVIEWED');
  assert.equal(reviewed.canonRefs.length, 0);
  assert.throws(
    () => attachExplicitCanonDecision(reviewed, { outcome: 'APPROVE', canonRef: 'canon://claim-001' }),
    /explicitHumanDecision=true/,
  );
});

test('explicit human canon approval is auditable and separate from evidence review', () => {
  const reviewed = createLucidityRecord({
    subjectId: 'CLAIM-001',
    state: 'REVIEWED',
    reviewRefs: [{ kind: 'HUMAN_EVIDENCE_REVIEW', id: 'CLAIM-001' }],
    evidenceRefs: [{ kind: 'CLAIM_EVIDENCE_LINK', id: 'LINK-001' }],
  });

  const approved = attachExplicitCanonDecision(reviewed, {
    outcome: 'APPROVE',
    explicitHumanDecision: true,
    canonRef: 'canon://claim-001/v1',
    decidedBy: 'TW',
    decidedAt: '2026-09-22T00:00:00Z',
  });

  assert.equal(approved.state, 'CANON_APPROVED');
  assert.deepEqual(approved.canonRefs, ['canon://claim-001/v1']);
  assert.equal(approved.provenance.canonDecisionExplicit, true);
});

test('canon decision cannot skip REVIEWED state', () => {
  const evidenceOnly = createLucidityRecord({
    subjectId: 'CLAIM-002',
    state: 'EVIDENCE_ATTACHED',
    evidenceRefs: ['evidence://1'],
  });

  assert.throws(
    () => attachExplicitCanonDecision(evidenceOnly, {
      outcome: 'APPROVE',
      explicitHumanDecision: true,
      canonRef: 'canon://claim-002/v1',
    }),
    /requires REVIEWED/,
  );
});
