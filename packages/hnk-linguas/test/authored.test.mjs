import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HNK_AUTHORED_CANDIDATES,
  HNK_AUTHORED_REGISTRY_STATS,
  getAuthoredCandidate,
  validateHnkAuthoredRegistry,
} from '../src/authored.mjs';
import { HNK_MASTER_LEXICON_BY_FORM } from '../src/index.mjs';

test('authored registry contains two governed Cycle 1 candidates', () => {
  assert.equal(HNK_AUTHORED_CANDIDATES.length, 2);
  assert.equal(HNK_AUTHORED_REGISTRY_STATS.candidates, 2);
  assert.equal(HNK_AUTHORED_REGISTRY_STATS.cycle1Candidates, 2);
});

test('KUVAN is authored CANDIDATE, never recovered canon', () => {
  const kuvan = getAuthoredCandidate('kuvan');
  assert.ok(kuvan);
  assert.equal(kuvan.id, 'AUTH-001');
  assert.equal(kuvan.authority, 'CANDIDATE');
  assert.equal(kuvan.historicalRecoveryClaim, false);
  assert.deepEqual(kuvan.glyphIds, ['G23','G05','G31','G01','G12']);
  assert.equal(kuvan.morphology.productivity, 'CLOSED_LIST_ONLY');
});

test('VALA is authored activity CANDIDATE from back-analysis only', () => {
  const vala = getAuthoredCandidate('vala');
  assert.ok(vala);
  assert.equal(vala.id, 'AUTH-002');
  assert.equal(vala.authority, 'CANDIDATE');
  assert.equal(vala.certainty, 'AUTHORED_BACK_ANALYSIS');
  assert.equal(vala.historicalRecoveryClaim, false);
  assert.deepEqual(vala.glyphIds, ['G31','G01','G14','G01']);
  assert.equal(vala.morphology.productivity, 'NON_PRODUCTIVE_SINGLE_CANDIDATE');
});

test('authored candidates do not contaminate recovered Master Lexicon', () => {
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.KUVAN, undefined);
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.VALA, undefined);
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.VALI.authority, 'FROZEN');
});

test('authored registry self-validation passes', () => {
  assert.deepEqual(validateHnkAuthoredRegistry(), { ok: true, errors: [] });
});
