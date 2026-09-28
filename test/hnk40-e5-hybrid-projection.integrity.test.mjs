import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateHybridProjection } from '../scripts/lib/hnk40-e5-hybrid-projection.mjs';

const sourceUrl=new URL('../docs/research/mandala/final/hnk40-e4-genesis-projection.v1.json',import.meta.url);
const load=async()=>JSON.parse(await readFile(sourceUrl,'utf8'));
const clone=x=>structuredClone(x);

test('generation never mutates verified legacy input', async()=>{
  const source=await load();
  const before=clone(source);
  generateHybridProjection(source);
  assert.deepEqual(source,before);
});

test('generation is byte-deterministic', async()=>{
  const source=await load();
  const a=JSON.stringify(generateHybridProjection(source),null,2)+'\n';
  const b=JSON.stringify(generateHybridProjection(source),null,2)+'\n';
  assert.equal(a,b);
});
test('strict source gate rejects cardinality and glyph identity drift', async()=>{
  const source=await load();
  const short=clone(source); short.records.pop();
  assert.throws(()=>generateHybridProjection(short),/exactly 40/);
  const duplicate=clone(source); duplicate.records[39].glyphId='G01';
  assert.throws(()=>generateHybridProjection(duplicate),/G01\.\.G40/);
  const missing=clone(source); missing.records[39].glyphId='G41';
  assert.throws(()=>generateHybridProjection(missing),/G01\.\.G40/);
});

test('strict source gate rejects malformed addresses before projection', async()=>{
  const source=await load();
  const malformed=clone(source);
  malformed.records[0].sourcePath[3]='MF:L99:S99';
  assert.throws(()=>generateHybridProjection(malformed),/Invalid Mandala address/);
});

test('strict source gate rejects repeated-address candidate serialization', async()=>{
  const source=await load();
  const poisoned=clone(source);
  poisoned.records[0].sourcePath[1]=poisoned.records[0].sourcePath[0];
  assert.throws(()=>generateHybridProjection(poisoned),/invalid legacy edge geometry/);
});
test('all serialized projections are simple N=12 paths', async()=>{
  const artifact=generateHybridProjection(await load());
  for(const record of artifact.records) for(const projection of record.projectionSet){
    assert.equal(projection.path.length,12,record.legacyIdentity.glyphId);
    assert.equal(new Set(projection.path).size,12,record.legacyIdentity.glyphId);
  }
});
