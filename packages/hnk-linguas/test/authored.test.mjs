import test from 'node:test';
import assert from 'node:assert/strict';
import { HNK_AUTHORED_CANDIDATES, HNK_AUTHORED_REGISTRY_STATS, getAuthoredCandidate, validateHnkAuthoredRegistry } from '../src/authored.mjs';
import { HNK_MASTER_LEXICON_BY_FORM } from '../src/index.mjs';

const numerals=[
  ['AUTH-005','BIZO',0,['G18','G03','G32','G04']],['AUTH-006','DUVE',1,['G19','G05','G31','G02']],['AUTH-007','HOYU',2,['G07','G04','G40','G05']],['AUTH-008','KETI',3,['G23','G02','G22','G03']],['AUTH-009','LUSO',4,['G14','G05','G26','G04']],['AUTH-010','MUPI',5,['G11','G05','G21','G03']],['AUTH-011','NURA',6,['G12','G05','G15','G01']],['AUTH-012','PEVU',7,['G21','G02','G31','G05']],['AUTH-013','TOMI',8,['G22','G04','G11','G03']],['AUTH-014','ZOKA',9,['G32','G04','G23','G01']],
];
const v37=[
  ['AUTH-015','KALA',['G23','G01','G14','G01']],['AUTH-016','AN',['G01','G12']],['AUTH-017','EN',['G02','G12']],['AUTH-018','KU',['G23','G05']],['AUTH-019','KE',['G23','G02']],['AUTH-020','ZAMI',['G32','G01','G11','G03']],
];

test('authored registry contains twenty governed Cycle 1 candidates',()=>{assert.equal(HNK_AUTHORED_CANDIDATES.length,20);assert.equal(HNK_AUTHORED_REGISTRY_STATS.candidates,20);assert.equal(HNK_AUTHORED_REGISTRY_STATS.cycle1Candidates,20);});

test('core authored candidates preserve their authorities',()=>{
  const kuvan=getAuthoredCandidate('kuvan'); assert.equal(kuvan.id,'AUTH-001'); assert.equal(kuvan.authority,'CANDIDATE'); assert.equal(kuvan.historicalRecoveryClaim,false); assert.deepEqual(kuvan.glyphIds,['G23','G05','G31','G01','G12']);
  const vala=getAuthoredCandidate('vala'); assert.equal(vala.id,'AUTH-002'); assert.equal(vala.certainty,'AUTHORED_BACK_ANALYSIS'); assert.deepEqual(vala.glyphIds,['G31','G01','G14','G01']);
  const kuon=getAuthoredCandidate('kuon'); assert.equal(kuon.id,'AUTH-003'); assert.equal(kuon.certainty,'AUTHORED_DERIVATION_WITH_GATED_COMPONENT'); assert.match(kuon.morphology.rightState,/LEX-026_ON_GATE/);
  const ne=getAuthoredCandidate('ne'); assert.equal(ne.id,'AUTH-004'); assert.equal(ne.certainty,'AUTHORED_PRIMITIVE'); assert.deepEqual(ne.glyphIds,['G12','G02']);
});

test('0-9 spoken numerals remain authored primitive candidates only',()=>{for(const [id,form,value,glyphIds] of numerals){const entry=getAuthoredCandidate(form);assert.ok(entry);assert.equal(entry.id,id);assert.equal(entry.authority,'CANDIDATE');assert.equal(entry.certainty,'AUTHORED_PRIMITIVE');assert.equal(entry.historicalRecoveryClaim,false);assert.equal(entry.morphology.schema,'PRIMITIVE_AUTHORED_NUMERAL_0_9');assert.deepEqual(entry.glyphIds,glyphIds);assert.match(entry.meaning.en,new RegExp(`spoken cardinal numeral ${value}$`));}});

test('V37 mappings are governed evidence mappings, not historical recovery claims',()=>{for(const [id,form,glyphIds] of v37){const entry=getAuthoredCandidate(form);assert.ok(entry,`${form} missing`);assert.equal(entry.id,id);assert.equal(entry.authority,'CANDIDATE');assert.equal(entry.certainty,'AUTHORED_EVIDENCE_MAPPING');assert.equal(entry.historicalRecoveryClaim,false);assert.deepEqual(entry.glyphIds,glyphIds);}assert.match(getAuthoredCandidate('KU').meaning.en,/not equivalent to one fixed WH word/);});

test('authored candidates do not contaminate recovered Master Lexicon',()=>{for(const form of ['KUVAN','VALA','KUON','NE',...numerals.map(x=>x[1]),...v37.map(x=>x[1])])assert.equal(HNK_MASTER_LEXICON_BY_FORM[form],undefined,`${form} must remain outside recovered registry`);assert.equal(HNK_MASTER_LEXICON_BY_FORM.VANI.meaning,null);assert.equal(HNK_MASTER_LEXICON_BY_FORM.VANI.authority,'WATCH');assert.equal(HNK_MASTER_LEXICON_BY_FORM.VAME.authority,'GATE');});

test('authored registry self-validation passes',()=>{assert.deepEqual(validateHnkAuthoredRegistry(),{ok:true,errors:[]});});
