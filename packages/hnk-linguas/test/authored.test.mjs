import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HNK_AUTHORED_CANDIDATES,
  HNK_AUTHORED_REGISTRY_STATS,
  getAuthoredCandidate,
  validateHnkAuthoredRegistry,
} from '../src/authored.mjs';
import { HNK_MASTER_LEXICON_BY_FORM } from '../src/index.mjs';

test('authored registry contains four governed Cycle 1 candidates', () => {
  assert.equal(HNK_AUTHORED_CANDIDATES.length, 4);
  assert.equal(HNK_AUTHORED_REGISTRY_STATS.candidates, 4);
  assert.equal(HNK_AUTHORED_REGISTRY_STATS.cycle1Candidates, 4);
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

test('KUON is authored person-interrogative candidate with explicit GATE dependency', () => {
  const kuon = getAuthoredCandidate('kuon');
  assert.ok(kuon);
  assert.equal(kuon.id, 'AUTH-003');
  assert.equal(kuon.authority, 'CANDIDATE');
  assert.equal(kuon.certainty, 'AUTHORED_DERIVATION_WITH_GATED_COMPONENT');
  assert.equal(kuon.historicalRecoveryClaim, false);
  assert.deepEqual(kuon.glyphIds, ['G23','G05','G04','G12']);
  assert.equal(kuon.morphology.schema, 'KU + ON');
  assert.match(kuon.morphology.rightState, /LEX-026_ON_GATE/);
  assert.equal(kuon.morphology.productivity, 'CLOSED_LIST_ONLY');
});

test('NE is an authored primitive CANDIDATE for negation/absence', () => {
  const ne = getAuthoredCandidate('ne');
  assert.ok(ne);
  assert.equal(ne.id, 'AUTH-004');
  assert.equal(ne.authority, 'CANDIDATE');
  assert.equal(ne.certainty, 'AUTHORED_PRIMITIVE');
  assert.equal(ne.historicalRecoveryClaim, false);
  assert.deepEqual(ne.glyphIds, ['G12','G02']);
  assert.equal(ne.morphology.schema, 'PRIMITIVE_AUTHORED');
  assert.equal(ne.morphology.productivity, 'CLOSED_LIST_ONLY');
  assert.match(ne.notes.join(' '), /Does not create a HAVE verb/);
});

test('authored candidates do not contaminate recovered Master Lexicon', () => {
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.KUVAN, undefined);
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.VALA, undefined);
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.KUON, undefined);
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.NE, undefined);
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.VANI.meaning, null);
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.VANI.authority, 'WATCH');
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.ON.authority, 'GATE');
  assert.equal(HNK_MASTER_LEXICON_BY_FORM.VALI.authority, 'FROZEN');
});

test('authored registry self-validation passes', () => {
  assert.deepEqual(validateHnkAuthoredRegistry(), { ok: true, errors: [] });
});
