import test from 'node:test';
import assert from 'node:assert/strict';
import { projectKnowledgeLens } from '../src/index.mjs';

test('projects KETHER structural context but leaves unbound knowledge unavailable', () => {
  const projection = projectKnowledgeLens({ level_id: 'keter' });
  assert.equal(projection.subject.level_id, 'keter');
  assert.equal(projection.subject.label, 'KETHER');
  assert.equal(projection.subject.executable_days, 36);
  assert.equal(projection.canon.status, 'UNAVAILABLE');
  assert.equal(projection.claims.status, 'UNAVAILABLE');
  assert.equal(projection.evidence.status, 'UNAVAILABLE');
  assert.equal(projection.correspondences.status, 'UNAVAILABLE');
  assert.equal(projection.evidence.truth_assessed, false);
  assert.equal(projection.evidence.causal_claim_permitted, false);
  assert.equal(projection.evidence.metaphysical_proof_permitted, false);
  assert.ok(projection.limitations.includes('NO_CONFIRMED_CANON_BINDING'));
  assert.ok(projection.limitations.includes('NO_CONFIRMED_CORRESPONDENCE_BINDING'));
});

test('fails closed for an unknown level id', () => {
  const projection = projectKnowledgeLens({ level_id: 'unknown-level' });
  assert.equal(projection.subject.level_id, null);
  assert.equal(projection.subject.executable_days, 0);
  assert.equal(projection.canon.status, 'UNAVAILABLE');
  assert.equal(projection.correspondences.status, 'UNAVAILABLE');
  assert.ok(projection.limitations.includes('UNKNOWN_TREE_LEVEL'));
});
