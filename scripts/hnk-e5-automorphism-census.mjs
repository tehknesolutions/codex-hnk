import fs from 'node:fs';

const V = 441;
const adj = Array.from({length: V}, () => new Set());
const add=(a,b)=>{adj[a].add(b);adj[b].add(a)};
const mf=(l,s)=>l*72+s;
for(let l=0;l<6;l++) for(let s=0;s<72;s++){
  const v=mf(l,s);
  add(v,mf(l,(s+1)%72));
  if(l<5) add(v,mf(l+1,s));
  if(l===5) add(v,432+Math.floor(s/8));
}
for(let g=0;g<9;g++) add(432+g,432+(g+1)%9);

function transform(v,k,reflect=false){
  if(v<432){
    const l=Math.floor(v/72), s=v%72;
    const sp=reflect ? ((8*k+7-s)%72+72)%72 : (s+8*k)%72;
    return mf(l,sp);
  }
  const g=v-432;
  const gp=reflect ? ((k-g)%9+9)%9 : (g+k)%9;
  return 432+gp;
}
function isAuto(k,r){
  for(let v=0;v<V;v++) for(const w of adj[v]) if(!adj[transform(v,k,r)].has(transform(w,k,r))) return false;
  return true;
}
const group=[];
for(let k=0;k<9;k++) for(const r of [false,true]) group.push({k,reflection:r,edgePreserving:isAuto(k,r)});
if(group.some(x=>!x.edgePreserving)) throw new Error('candidate D9 action failed edge preservation');

// Count ordered N=12 simple paths P satisfying g(P)=reverse(P).
// For non-identity rotations this is impossible: g^2(P)=P would force pointwise
// fixed vertices, and C9 has no nontrivial order-2 rotation. For reflections,
// enumerate the first six vertices only; the other six are forced.
function reflectionAntiFixed(k){
  let count=0n;
  const seen=new Uint8Array(V);
  const half=[];
  function dfs(v,depth){
    half.push(v); seen[v]=1;
    if(depth===6){
      const gv=transform(v,k,true);
      if(gv!==v && adj[v].has(gv)){
        let ok=true;
        for(const x of half){ const y=transform(x,k,true); if(seen[y]){ok=false;break;} }
        if(ok) count++;
      }
    } else {
      for(const w of adj[v]) if(!seen[w]) dfs(w,depth+1);
    }
    seen[v]=0; half.pop();
  }
  for(let s=0;s<V;s++) dfs(s,1);
  return count;
}

const reflectionOrderedAntiFixed=[];
for(let k=0;k<9;k++) reflectionOrderedAntiFixed.push(reflectionAntiFixed(k));
if(reflectionOrderedAntiFixed.some(x=>x%2n!==0n)) throw new Error('reflection fixed oriented count must be even');
const reflectionFixedReversalClasses=reflectionOrderedAntiFixed.map(x=>x/2n);
const baseline=47642247n; // MF+CG reversal classes: 95,284,494 / 2
const burnsideNumerator=baseline + reflectionFixedReversalClasses.reduce((a,b)=>a+b,0n);
if(burnsideNumerator%18n!==0n) throw new Error('Burnside numerator not divisible by |D9|');
const mfCgD9Classes=burnsideNumerator/18n;

// CR:D contributes 24 ordered Hamiltonian paths = 12 reversal classes. Under D12
// all are one orbit (choice of start/direction only), hence one geometric class.
const crDGeometricClasses=1n;
const majorGeometricClasses=mfCgD9Classes+crDGeometricClasses;

const out={
  version:'1.0', status:'PASS',
  group:{mfCg:'D9',order:18,rotations:9,reflections:9,sectorRotationStep:8,layerAction:'IDENTITY_ONLY'},
  proof:{allCandidateTransformsPreserveEdges:true,nonIdentityRotationFixedReversalClasses:0,reflectionOrderedAntiFixed:reflectionOrderedAntiFixed.map(String),reflectionFixedReversalClasses:reflectionFixedReversalClasses.map(String)},
  counts:{mfCgReversalBaseline:baseline.toString(),mfCgD9Classes:mfCgD9Classes.toString(),crDReversalBaseline:'12',crD_D12Classes:'1',major463GeometricClasses:majorGeometricClasses.toString()}
};
fs.writeFileSync('docs/research/mandala/final/hnk-e5-automorphism-census.v1.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
