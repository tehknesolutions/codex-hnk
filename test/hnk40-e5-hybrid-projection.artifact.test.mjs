import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateHybridProjection } from '../scripts/lib/hnk40-e5-hybrid-projection.mjs';

const sourceUrl=new URL('../docs/research/mandala/final/hnk40-e4-genesis-projection.v1.json',import.meta.url);
const artifactUrl=new URL('../docs/research/mandala/final/hnk40-e5-hybrid-projection.v1.json',import.meta.url);

test('checked-in hybrid artifact is exact deterministic regeneration', async()=>{
  const source=JSON.parse(await readFile(sourceUrl,'utf8'));
  const expected=JSON.stringify(generateHybridProjection(source),null,2)+'\n';
  const actual=await readFile(artifactUrl,'utf8');
  assert.equal(actual,expected);
  const artifact=JSON.parse(actual);
  assert.equal(artifact.records.length,40);
  assert.equal(artifact.summary.DIRECT,4);
  assert.equal(artifact.summary.DERIVED_UNIQUE,34);
  assert.equal(artifact.summary.DERIVED_AMBIGUOUS,2);
  const ambiguous=artifact.records.filter(r=>r.resolutionStatus==='DERIVED_AMBIGUOUS');
  assert.deepEqual(ambiguous.map(r=>r.legacyIdentity.glyphId),['G17','G20']);
  for(const record of ambiguous){
    assert.equal(record.projectionSet.length,2);
    assert.equal(record.preferredProjectionId,null);
  }
  for(const record of artifact.records) for(const projection of record.projectionSet){
    assert.equal(projection.canonical,false);
    assert.equal(projection.authority,'DERIVED_STRUCTURAL');
  }
});
