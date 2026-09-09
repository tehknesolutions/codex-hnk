import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HNK_AUTHORED_CANDIDATES,
  HNK_AUTHORED_REGISTRY_STATS,
  getAuthoredCandidate,
  validateHnkAuthoredRegistry,
} from '../src/authored.mjs';
import { HNK_MASTER_LEXICON_BY_FORM } from '../src/index.mjs';

test('authored registry starts with one governed candidate', () => {
  assert.equal(HNK_AUTHORED_CANDIDATES.length, 1);
  assert.equal(HNK_AUTHORED_REGISTRY_STATS.candidates, 1);
  assert.equal(HNK_AUTHORED_REGISTRY_STATS.cycle1Candidates, 1);
});

test('KUVAN is authored CANDIDATE, never recovered canon', () => {
  const kuvan = getAuthoredCandidate('kuvan');
  assert.ok(kuvan);
  assert.equal(kuvan.id, 'AUTH-001');
  assert.equal(kuvan.authority, 'CANDIDATE');
  assert.equal(kuvan.sourceClass, 'AUTHORING_PROPOSAL');
  assert.equal(kuvan.historicalRecoveryClaim, false);
  assert.equal(kuvan.certainty, 'AUTHORED_DERIVATION');
  assert.deepEqual(kuvan.lessons, ['L01']);
  assert.deepEqual(kuvan.glyphIds, ['G23','G05','G31','G01','G12']);
  assert.equal(kuvan.morphology.schema, 'KU + VAN');
  assert.equal(kuvan.morphology.productivity, 'CLOSED_LIST_ONLY');
});

test('authored candidate does not contaminate recovered Master Lexicon', () => {
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.KUVAN, undefined);
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.VALI.authority, 'FROZEN');
});

test('authored registry self-validation passes', () => {
  assert.deepEqual(validateHnkAuthoredRegistry(), { ok: true, errors: [] });
});
