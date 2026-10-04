import test from 'node:test';
import assert from 'node:assert/strict';
import {metrics,score,rank} from '../scripts/zarenu-semantic-path-score.mjs';

const path=(classes)=>({
  addresses:classes.map((_,i)=>`MF:L0${1+(i%2)}:S${String(1+i).padStart(2,'0')}`).concat([`MF:L01:S${String(classes.length+1).padStart(2,'0')}`]),
  edges:classes.map(edgeClass=>({edgeClass}))
});

test('balanced plural path scores relation and orchestration strongly',()=>{
  const p=path(['MF_ANGULAR','MF_RADIAL','MF_ANGULAR','MF_RADIAL','MF_ANGULAR','MF_RADIAL']);
  const m=metrics(p);
  assert.equal(m.R,1);
  assert.equal(m.O,1);
  assert.equal(m.P,1);
  assert.equal(score(p).rejected,false);
});

test('single-class path is rejected for ZARENU relation constraint',()=>{
  const p=path(Array(6).fill('MF_ANGULAR'));
  assert.equal(score(p).rejectionReason,'EDGE_CLASS_PLURALITY_REQUIRED');
});

test('exact benchmark collision is rejected before ranking',()=>{
  const p=path(['MF_ANGULAR','MF_RADIAL','MF_ANGULAR','MF_RADIAL','MF_ANGULAR','MF_RADIAL']);
  assert.equal(score(p,[p.addresses]).rejectionReason,'EXACT_BENCHMARK_COLLISION');
});

test('ranking is deterministic under equal inputs',()=>{
  const a=path(['MF_ANGULAR','MF_RADIAL','MF_ANGULAR','MF_RADIAL','MF_ANGULAR','MF_RADIAL']);
  const b=path(['MF_RADIAL','MF_ANGULAR','MF_RADIAL','MF_ANGULAR','MF_RADIAL','MF_ANGULAR']);
  assert.deepEqual(rank([a,b]),rank([a,b]));
});

test('operator modulation never exceeds governance cap',()=>{
  const p=path(['MF_ANGULAR','MF_RADIAL','MF_ANGULAR','MF_RADIAL','MF_ANGULAR','MF_RADIAL']);
  assert.ok(score(p).operatorModulation<=0.08);
});
