import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const script=fs.readFileSync(new URL('../scripts/zarenu-mandala-path-candidates.mjs',import.meta.url),'utf8');

test('ZARENU generator preserves E2 topology gate',()=>{
  assert.match(script,/expectedUndirectedSeedEdges:792/);
  assert.match(script,/MF_ANGULAR/);
  assert.match(script,/MF_RADIAL/);
  assert.match(script,/MF_CR/);
  assert.match(script,/HC_ANY/);
});

test('ZARENU generator refuses premature semantic/canonical promotion',()=>{
  assert.match(script,/semanticRanking:false/);
  assert.match(script,/canonicalPromotion:false/);
  assert.match(script,/STRUCTURAL_CANDIDATES_ONLY/);
  assert.match(script,/source-governed semantic path-selection specification/);
});
