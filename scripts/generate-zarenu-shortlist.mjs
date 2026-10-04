import fs from 'node:fs';
import crypto from 'node:crypto';
import {rank} from './zarenu-semantic-path-score.mjs';

const L=6,S=72;
const addr=(l,s)=>`MF:L${String(l).padStart(2,'0')}:S${String(s).padStart(2,'0')}`;
const key=(l,s)=>`${l}:${s}`;
const parse=k=>k.split(':').map(Number);
const neighbors=(l,s)=>[
  [l,s===S?1:s+1,'MF_ANGULAR'],[l,s===1?S:s-1,'MF_ANGULAR'],
  ...(l<L?[[l+1,s,'MF_RADIAL']]:[]),...(l>1?[[l-1,s,'MF_RADIAL']]:[])
];
const seed=crypto.createHash('sha256').update(JSON.stringify({semanticId:'CG-ENERGY-001',lexeme:'ZARENU',intent:['perceive','model','relate','orchestrate'],spec:'v0.1',topology:'E2-v1'})).digest('hex');
const choose=(arr,material)=>arr[parseInt(crypto.createHash('sha256').update(seed+material).digest('hex').slice(0,12),16)%arr.length];

const paths=[];
for(let l=1;l<=L;l++) for(let s=1;s<=S;s++){
  let current=[l,s], previous=null;
  const addresses=[addr(l,s)],edges=[];
  const targetLen=6+(parseInt(seed.slice(((l+s)%20),((l+s)%20)+2),16)%7);
  for(let step=0;step<targetLen;step++){
    let options=neighbors(...current).filter(([nl,ns])=>!previous||key(nl,ns)!==key(...previous));
    if(!options.length) break;
    // Prefer the underrepresented edge class to express orchestration, with digest tie-break.
    const a=edges.filter(e=>e.edgeClass==='MF_ANGULAR').length;
    const r=edges.length-a;
    const preferred=a>r?'MF_RADIAL':r>a?'MF_ANGULAR':null;
    const preferredOptions=preferred?options.filter(o=>o[2]===preferred):options;
    const pool=preferredOptions.length?preferredOptions:options;
    const next=choose(pool,`${l}:${s}:${step}:${addresses.join('>')}`);
    previous=current; current=[next[0],next[1]];
    addresses.push(addr(...current)); edges.push({edgeClass:next[2]});
  }
  paths.push({addresses,edges});
}

// Benchmark registry is deliberately empty until the HNK40 ordered-path source is resolved by provenance.
// The artifact makes this limitation explicit rather than fabricating collisions.
const ranked=rank(paths,[]);
const top12=ranked.slice(0,12);
const top6=[];
for(const c of top12){
  const sig=new Set(c.path.addresses);
  const sufficientlyDifferent=top6.every(x=>{
    const other=new Set(x.path.addresses); let overlap=0; for(const v of sig) if(other.has(v)) overlap++;
    return overlap/Math.max(sig.size,other.size)<0.6;
  });
  if(sufficientlyDifferent) top6.push(c);
  if(top6.length===6) break;
}
const top3=top6.slice(0,3);
const out={
  version:'0.1',subject:'CG-ENERGY-001.ZARENU',authorityState:'HNK:CANDIDATE',seedDigest:seed,
  generatedPathCount:paths.length,eligiblePathCount:ranked.length,
  collisionGate:{hnk40BenchmarkStatus:'PENDING_PROVENANCE_RESOLUTION',exactCollisionCheckExecuted:false,reason:'No HNK40 ordered-path benchmark file was resolved in this implementation turn; no benchmark data was invented.'},
  top12,top6,top3,
  humanGateRequired:true,canonicalPromotion:false
};
const url=new URL('../docs/research/chromatic-genesis/evidence/zarenu-semantic-shortlist.v0.1.json',import.meta.url);
fs.mkdirSync(new URL('../docs/research/chromatic-genesis/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(url,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',generated:paths.length,eligible:ranked.length,top12:top12.length,top6:top6.length,top3:top3.length,collisionGate:out.collisionGate.hnk40BenchmarkStatus},null,2));
