import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { exportAcquisitionDataset } from '../scripts/lib/hnk40-e5-acquisition-export.mjs';

const artifactUrl=new URL('../docs/research/mandala/final/hnk40-e5-hybrid-projection.v1.json',import.meta.url);
const load=async()=>JSON.parse(await readFile(artifactUrl,'utf8'));

test('unique structural states expose exactly one acquisition target',async()=>{
  const out=exportAcquisitionDataset(await load());
  assert.equal(out.records.length,40);
  for(const r of out.records.filter(x=>['DIRECT','DERIVED_UNIQUE'].includes(x.resolutionStatus))){
    assert.equal(typeof r.targetProjectionId,'string');
    assert.equal(r.candidateProjectionIds.length,1);
  }
});

test('G17 and G20 preserve ambiguity instead of scalar collapse',async()=>{
  const out=exportAcquisitionDataset(await load());
  const ambiguous=out.records.filter(r=>r.resolutionStatus==='DERIVED_AMBIGUOUS');
  assert.deepEqual(ambiguous.map(r=>r.glyphId),['G17','G20']);
  for(const r of ambiguous){
    assert.equal(r.targetProjectionId,null);
    assert.equal(r.candidateProjectionIds.length,2);
    assert.equal(r.acquisitionMode,'CANDIDATE_SET');
  }
});

test('no-target fixture states never fabricate acquisition targets',async()=>{
  const artifact=await load();
  const fixture=structuredClone(artifact);
  fixture.records[0].resolutionStatus='NO_E5_PROJECTION';
  fixture.records[0].projectionSet=[];
  fixture.records[0].preferredProjectionId=null;
  fixture.records[1].resolutionStatus='PENDING_RULE';
  fixture.records[1].projectionSet=[];
  fixture.records[1].preferredProjectionId=null;
  const out=exportAcquisitionDataset(fixture);
  for(const r of out.records.slice(0,2)){
    assert.equal(r.targetProjectionId,null);
    assert.deepEqual(r.candidateProjectionIds,[]);
    assert.equal(r.acquisitionMode,'NO_TARGET');
  }
});
