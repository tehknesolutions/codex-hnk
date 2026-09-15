import test from 'node:test';
import assert from 'node:assert/strict';
import { HNK_AUTHORED_CANDIDATES, getAuthoredCandidate } from '../src/authored.mjs';
import { getLexeme } from '../src/index.mjs';
import {
  HNK_GRAMMAR_CORE_V1_COMPONENTS,
  HNK_GRAMMAR_CORE_V1_GOVERNANCE,
  HNK_GRAMMAR_CORE_V1_POLICIES,
  getGrammarCoreV1Component,
  validateHnkGrammarCoreV1,
} from '../src/grammar-core-v1.mjs';

const expected = [
  ['KUVAN','AUTH-001'],
  ['AN','AUTH-016'],
  ['EN','AUTH-017'],
  ['KU','AUTH-018'],
  ['KE','AUTH-019'],
];

test('Grammar Core V1 references existing authored candidates without duplication',()=>{
  assert.equal(HNK_GRAMMAR_CORE_V1_COMPONENTS.length,5);
  for(const [form,id] of expected){
    const core=getGrammarCoreV1Component(form);
    const authored=getAuthoredCandidate(form);
    assert.ok(core,`${form} missing from Grammar Core V1`);
    assert.ok(authored,`${form} missing from authored registry`);
    assert.equal(core.sourceId,id);
    assert.equal(authored.id,id);
    assert.equal(core.sourceEntry,authored);
    assert.equal(core.authority,'CANDIDATE');
    assert.equal(authored.authority,'CANDIDATE');
    assert.deepEqual(core.expectedLessons,['L01','L02']);
    assert.deepEqual(authored.lessons,['L01','L02']);
    assert.equal(HNK_AUTHORED_CANDIDATES.filter((entry)=>entry.transliteration===form).length,1);
  }
});

test('Grammar Core V1 preserves approved non-universal boundaries',()=>{
  assert.equal(getGrammarCoreV1Component('KE').role,'YES_NO_INTERROGATIVE_MARKER');
  assert.match(getGrammarCoreV1Component('KE').boundary,/NO_UNIVERSAL_INTERROGATIVE_GRAMMAR/);
  assert.match(getGrammarCoreV1Component('AN').boundary,/NO_COMPLETE_PRONOUN/);
  assert.match(getGrammarCoreV1Component('EN').boundary,/SUBJECT_VS_POSSESSIVE_REMAINS_UNRESOLVED/);
  assert.match(getGrammarCoreV1Component('KU').boundary,/NO_SINGLE_UNIVERSAL_WH_GLOSS/);
  assert.match(getGrammarCoreV1Component('KUVAN').boundary,/NO_GLOBAL_VAN_PRODUCTIVITY/);
});

test('predication, negation and temporality policies remain conservative',()=>{
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.predication.policy,'CONSTRUCTION_SPECIFIC');
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.predication.universalOvertCopula,false);
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.predication.universalZeroCopula,false);
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.predication.universalZeroSubject,false);
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.predication.universalBarePredicate,false);

  const ne=getAuthoredCandidate('NE');
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.negation.sourceEntry,ne);
  assert.equal(ne.id,'AUTH-004');
  assert.equal(ne.authority,'CANDIDATE');
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.negation.globalRulePromoted,false);

  const pa=getLexeme('PA');
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.temporality.sourceEntry,pa);
  assert.equal(pa.id,'LEX-020');
  assert.equal(pa.authority,'WATCH');
  assert.equal(pa.meaning.en,'yesterday');
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.temporality.genericPastTenseCreated,false);
  assert.equal(HNK_GRAMMAR_CORE_V1_POLICIES.temporality.tenseMorphologyCreated,false);
});

test('Grammar Core V1 does not auto-bind or auto-promote',()=>{
  assert.equal(HNK_GRAMMAR_CORE_V1_GOVERNANCE.componentCandidacyIsCanonicalPromotion,false);
  assert.equal(HNK_GRAMMAR_CORE_V1_GOVERNANCE.automaticCycle1Binding,false);
  assert.equal(HNK_GRAMMAR_CORE_V1_GOVERNANCE.automaticLessonBinding,false);
  assert.equal(HNK_GRAMMAR_CORE_V1_GOVERNANCE.automaticProductivity,false);
  assert.equal(HNK_GRAMMAR_CORE_V1_GOVERNANCE.hnk3000AutomaticBinding,false);
  assert.equal(HNK_GRAMMAR_CORE_V1_GOVERNANCE.parentLexemeGateConsumed,false);
});

test('Grammar Core V1 self-validation passes',()=>{
  assert.deepEqual(validateHnkGrammarCoreV1(),{ok:true,errors:[]});
});
