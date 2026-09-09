import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HNK_CYCLE1_AUTHORED_CANDIDATES,
  HNK_CYCLE1_BOUND_LEXEMES,
  HNK_CYCLE1_CURRICULUM_REBINDS,
  HNK_CYCLE1_EMPTY_LESSONS,
  HNK_CYCLE1_LANGUAGE_COVERAGE,
  HNK_CYCLE1_LANGUAGE_GATE,
  HNK_CYCLE1_LESSONS,
  HNK_CYCLE1_UNBOUND_LEXEMES,
  HNK_CYCLE1_VOCABULARY_TARGET,
  validateCycle1LanguageCoverage,
} from '../src/cycle1.mjs';

test('Cycle 1 tree uses the reconciled seven-lesson mapping', () => {
  assert.deepEqual(
    HNK_CYCLE1_LESSONS.map(({lessonId,sphere}) => `${lessonId}:${sphere}`),
    ['L01:Kether','L02:Chokhmah','L03:Binah','L04:Chesed','L05:Gevurah','L06:Yesod','L07:Malkuth'],
  );
});

test('recovered registry and authored candidates remain separate metrics', () => {
  assert.equal(HNK_CYCLE1_VOCABULARY_TARGET, 144);
  assert.equal(HNK_CYCLE1_BOUND_LEXEMES.length, 31);
  assert.equal(HNK_CYCLE1_UNBOUND_LEXEMES.length, 2);
  assert.deepEqual(HNK_CYCLE1_AUTHORED_CANDIDATES.map(x => x.transliteration), ['KUVAN','VALA','KUON']);
  assert.equal(HNK_CYCLE1_LANGUAGE_GATE.registryBoundRecoveredForms, 31);
  assert.equal(HNK_CYCLE1_LANGUAGE_GATE.authoredCandidateForms, 3);
  assert.equal(HNK_CYCLE1_LANGUAGE_GATE.governedUniqueLanguageAssets, 34);
  assert.equal(HNK_CYCLE1_LANGUAGE_GATE.recoveredProxyGap, 113);
  assert.equal(HNK_CYCLE1_LANGUAGE_GATE.recoveredProxyRatio, 0.2153);
  assert.equal(HNK_CYCLE1_LANGUAGE_GATE.governedAssetProxyGap, 110);
  assert.equal(HNK_CYCLE1_LANGUAGE_GATE.governedAssetProxyRatio, 0.2361);
  assert.deepEqual(HNK_CYCLE1_LANGUAGE_GATE.unboundRecoveredForms, ['VAMATAYA','KALIFORNIA']);
  assert.deepEqual(HNK_CYCLE1_LANGUAGE_GATE.authoredCandidateFormsList, ['KUVAN','VALA','KUON']);
});

test('lesson binding counts preserve recovered provenance and governed additions', () => {
  assert.deepEqual(
    Object.fromEntries(HNK_CYCLE1_LANGUAGE_COVERAGE.map((lesson) => [lesson.lessonId,lesson.lexemeCount])),
    {L01:10,L02:11,L03:8,L04:9,L05:0,L06:0,L07:0},
  );
  assert.deepEqual(
    Object.fromEntries(HNK_CYCLE1_LANGUAGE_COVERAGE.map((lesson) => [lesson.lessonId,lesson.authoredCandidateCount])),
    {L01:3,L02:0,L03:0,L04:0,L05:0,L06:0,L07:0},
  );
  const l01 = HNK_CYCLE1_LANGUAGE_COVERAGE.find((lesson) => lesson.lessonId === 'L01');
  assert.deepEqual(HNK_CYCLE1_CURRICULUM_REBINDS.L01, ['LEX-013']);
  assert.deepEqual(l01.governedRebindLexemeIds, ['LEX-013']);
  assert.deepEqual(l01.authoredCandidateIds, ['AUTH-001','AUTH-002','AUTH-003']);
  assert.equal(l01.languageAssetCount, 13);
  assert.deepEqual(HNK_CYCLE1_EMPTY_LESSONS, ['L05','L06','L07']);
});

test('L03 and L04 authority mix remains non-canonical where required', () => {
  const l03=HNK_CYCLE1_LANGUAGE_COVERAGE.find((lesson)=>lesson.lessonId==='L03');
  const l04=HNK_CYCLE1_LANGUAGE_COVERAGE.find((lesson)=>lesson.lessonId==='L04');
  assert.equal(l03.authorityCounts.FROZEN,3);
  assert.equal(l03.authorityCounts.WATCH,3);
  assert.equal(l03.authorityCounts.CANDIDATE,2);
  assert.equal(l04.authorityCounts.WATCH,1);
  assert.equal(l04.authorityCounts.GATE,8);
});

test('all seven recovered phrases are currently bound only to L01', () => {
  assert.equal(HNK_CYCLE1_LANGUAGE_COVERAGE.find((lesson)=>lesson.lessonId==='L01').phraseCount,7);
  assert.ok(HNK_CYCLE1_LANGUAGE_COVERAGE.slice(1).every((lesson)=>lesson.phraseCount===0));
});

test('Cycle 1 remains HOLD and does not invent L05-L07 language', () => {
  assert.equal(HNK_CYCLE1_LANGUAGE_GATE.decision,'HOLD_INCOMPLETE_BINDING');
  assert.match(HNK_CYCLE1_LANGUAGE_GATE.nonInventionRule,/L05-L07/);
});

test('self-validation passes', () => {
  assert.deepEqual(validateCycle1LanguageCoverage(),{ok:true,errors:[]});
});
