import fs from 'node:fs';

const OUT='docs/research/chromatic-genesis/evidence/zarenu-mandala-path-candidates.v0.1.json';
const layers=Array.from({length:6},(_,i)=>i+1);
const sectors=Array.from({length:72},(_,i)=>i+1);
const id=(l,s)=>`MF:L${String(l).padStart(2,'0')}:S${String(s).padStart(2,'0')}`;
const angular=(a,b)=>a.l===b.l && (Math.abs(a.s-b.s)===1 || Math.abs(a.s-b.s)===71);
const radial=(a,b)=>a.s===b.s && Math.abs(a.l-b.l)===1;
const legal=(a,b)=>angular(a,b)||radial(a,b);

// ZARENU currently supplies semantic/operator constraints but no licensed address binding.
// Therefore v0.1 enumerates topology-valid seed paths only; it MUST NOT rank or canonize them semantically.
const candidates=[];
for(const l of layers){
  for(const s of sectors){
    const start={l,s};
    const next=[
      {l,s:s===72?1:s+1},
      {l,s:s===1?72:s-1},
      ...(l<6?[{l:l+1,s}]:[]),
      ...(l>1?[{l:l-1,s}]:[])
    ];
    for(const b of next){
      if(!legal(start,b)) throw new Error('illegal E2 edge');
      candidates.push({addresses:[id(start.l,start.s),id(b.l,b.s)],edgeClass:angular(start,b)?'MF_ANGULAR':'MF_RADIAL'});
    }
  }
}
const unique=new Map(candidates.map(c=>[[...c.addresses].sort().join('|'),c]));
const artifact={
  version:'0.1',
  status:'STRUCTURAL_CANDIDATES_ONLY',
  subject:'CG-ENERGY-001.ZARENU',
  authorityState:'HNK:HYPOTHESIS',
  sources:[
    'docs/research/mandala/final/hnk-kode-mandala-address-registry.v1.json',
    'docs/research/mandala/final/hnk-kode-mandala-graph-topology.v1.json',
    'docs/research/chromatic-genesis/data/energy-objects/CG-ENERGY-001.ZARENU.v0.1.json'
  ],
  policy:{allowedEdgeClasses:['MF_ANGULAR','MF_RADIAL'],blocked:['MF_CR','CR_CROSS_FAMILY','HC_ANY'],semanticRanking:false,canonicalPromotion:false},
  counts:{vertices:432,undirectedSeedEdges:unique.size,expectedUndirectedSeedEdges:792},
  candidates:[...unique.values()],
  nextGate:'Define a source-governed semantic path-selection specification before ranking ZARENU candidates.'
};
if(unique.size!==792) throw new Error(`E2 invariant failed: ${unique.size} != 792`);
fs.mkdirSync(new URL('../docs/research/chromatic-genesis/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../'+OUT,import.meta.url),JSON.stringify(artifact,null,2)+'\n');
console.log(`wrote ${OUT}: ${unique.size} legal undirected E2 MF seed edges`);
