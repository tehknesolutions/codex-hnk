import test from 'node:test';
import assert from 'node:assert/strict';
import { HNK_PHONOLOGICAL_CENSUS, HNK_PHONOLOGICAL_CENSUS_RECORDS, validateHnkPhonologicalCensus } from '../src/phonological-census-v0.1.mjs';

test('phonological census preserves 20-safe/40-runtime distinction',()=>{
  assert.equal(HNK_PHONOLOGICAL_CENSUS.counts.safeSurfaceUnits,20);
  assert.equal(HNK_PHONOLOGICAL_CENSUS.counts.runtimeSlots,40);
});

test('bridge evidence remains isolated from governed core coverage',()=>{
  assert.deepEqual(HNK_PHONOLOGICAL_CENSUS.review.bridgeForms,['KALIFORNIA']);
  assert.ok(HNK_PHONOLOGICAL_CENSUS.coverage.bridge.includes('/f/'));
  assert.ok(!HNK_PHONOLOGICAL_CENSUS.coverage.governed.includes('/f/'));
});

test('Y-bearing forms are explicitly flagged for pronunciation review',()=>{
  assert.ok(HNK_PHONOLOGICAL_CENSUS.review.yForms.length>0);
  assert.ok(HNK_PHONOLOGICAL_CENSUS_RECORDS.filter(x=>x.form.includes('Y')).every(x=>x.flags.includes('Y_PRONUNCIATION_REVIEW')));
});

test('census validates structural invariants',()=>{
  assert.deepEqual(validateHnkPhonologicalCensus(),{ok:true,errors:[]});
});
