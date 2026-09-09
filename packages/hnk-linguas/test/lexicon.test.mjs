import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HNK_MASTER_LEXICON,
  HNK_MASTER_PHRASES,
  HNK_MASTER_LEXICON_STATS,
  HNK_MASTER_LEXICON_GOVERNANCE,
  filterLexemes,
  getLexeme,
  validateHnkMasterLexicon,
} from '../src/index.mjs';

test('master registry cardinality is frozen for v1 recovery', () => {
  assert.equal(HNK_MASTER_LEXICON.length, 33);
  assert.equal(HNK_MASTER_PHRASES.length, 7);
  assert.equal(HNK_MASTER_LEXICON_STATS.withRecoveredMeaning, 28);
  assert.equal(HNK_MASTER_LEXICON_STATS.withoutRecoveredMeaning, 5);
});

test('authority classes stay distinct', () => {
  assert.deepEqual(
    HNK_MASTER_LEXICON_STATS.byAuthority,
    { FROZEN:10, WATCH:10, CANDIDATE:3, GATE:8, BRIDGE:1, REFERENCE:1 },
  );
  assert.equal(filterLexemes({ authority: 'FROZEN' }).length, 10);
  assert.equal(filterLexemes({ authority: 'GATE' }).length, 8);
});

test('PITSA uses atomic TS G30', () => {
  assert.equal(getLexeme('PITSA').glyphIds.join('·'), 'G21·G03·G30·G01');
});

test('KALIFORNIA preserves explicit bridge F as G25 without widening safe parser', () => {
  const entry = getLexeme('KALIFORNIA');
  assert.equal(entry.authority, 'BRIDGE');
  assert.equal(entry.encodingMode, 'EXPLICIT_BRIDGE');
  assert.equal(entry.glyphIds.join('·'), 'G23·G01·G14·G03·G25·G04·G15·G12·G03·G01');
});

test('unrecovered meanings remain null', () => {
  for (const form of ['BANKA','VANUVALAKALU','SAROSAL','VANUVALI','VANI']) {
    assert.equal(getLexeme(form).meaning, null);
  }
  for (const phrase of HNK_MASTER_PHRASES.filter((item) => item.certainty === 'UNRECOVERED')) {
    assert.equal(phrase.meaning, null);
  }
});

test('visual candidate is not promoted by lexicon registry', () => {
  assert.equal(HNK_MASTER_LEXICON_GOVERNANCE.visualState, 'PREPRODUCTION_NOT_OFFICIAL');
  assert.equal(HNK_MASTER_LEXICON_GOVERNANCE.visualPromotion, 'HUMAN_GATE_REQUIRED');
});

test('registry self-validation passes', () => {
  assert.deepEqual(validateHnkMasterLexicon(), { ok:true, errors:[] });
});
