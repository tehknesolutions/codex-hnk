import fs from 'node:fs';

const NODES = 463;
const adj = Array.from({length:NODES},()=>new Set());
const add=(a,b)=>{adj[a].add(b);adj[b].add(a)};
const mf=(l,s)=>l*72+s;

for(let l=0;l<6;l++) for(let s=0;s<72;s++) {
  add(mf(l,s),mf(l,(s+1)%72));
  if(l<5) add(mf(l,s),mf(l+1,s));
}
for(let s=0;s<72;s++) add(mf(5,s),432+Math.floor(s/8));
for(let g=0;g<9;g++) add(432+g,432+(g+1)%9);
let off=441;
for(const n of [3,7,12]) { for(let i=0;i<n;i++) add(off+i,off+(i+1)%n); off+=n; }

function countWalks(starts, nodes=12){
  let v=Array(NODES).fill(0n); for(const i of starts)v[i]=1n;
  for(let step=1;step<nodes;step++){
    const w=Array(NODES).fill(0n);
    for(let i=0;i<NODES;i++) for(const j of adj[i]) w[j]+=v[i];
    v=w;
  }
  return v.reduce((a,b)=>a+b,0n);
}
const range=(a,b)=>Array.from({length:b-a},(_,i)=>a+i);
const result={
 version:'1.0',status:'PARTIAL_EXACT',pathNodes:12,pathEdges:11,
 metric:'rawWalkCount',directed:true,addressed:true,symmetryReduction:'NONE',
 counts:{
  MF:countWalks(range(0,432)).toString(),
  MF_PLUS_CG:countWalks(range(0,441)).toString(),
  CR_T:countWalks(range(441,444)).toString(),
  CR_H:countWalks(range(444,451)).toString(),
  CR_D:countWalks(range(451,463)).toString(),
  MAJOR_463:countWalks(range(0,463)).toString()
 },
 warning:'This is the exact addressed raw-walk count, not yet the simple-path, render-distinct, symmetry-reduced, semantic, or language-assignable glyph count.'
};
fs.writeFileSync('docs/research/mandala/final/hnk-e5-walk-census.n12.v1.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
