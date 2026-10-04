import crypto from 'node:crypto';

const clamp=x=>Math.max(0,Math.min(1,x));
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');

export function metrics(path, benchmarkPaths=[]){
  const edges=path.edges;
  const n=edges.length;
  if(n<1) throw new Error('empty path');
  const classes=edges.map(e=>e.edgeClass);
  const turns=classes.slice(1).reduce((s,c,i)=>s+(c!==classes[i]?1:0),0);
  const P=n===1?0:turns/(n-1);
  const counts=new Map();
  for(const c of classes) counts.set(c,(counts.get(c)||0)+1);
  const probs=[...counts.values()].map(v=>v/n);
  const entropy=-probs.reduce((s,p)=>s+p*Math.log2(p),0);
  const maxEntropy=Math.log2(Math.max(2,counts.size));
  const normalizedEntropy=maxEntropy?entropy/maxEntropy:0;
  const M=1-Math.abs(normalizedEntropy-0.65)/0.65;
  const R=new Set(classes).size/2;
  const a=counts.get('MF_ANGULAR')||0, r=counts.get('MF_RADIAL')||0;
  const O=1-Math.abs(a-r)/(a+r);
  const repeated=path.addresses.length-new Set(path.addresses).size;
  const C=clamp(1-repeated/Math.max(1,path.addresses.length-1));
  const signature=path.addresses.join('>');
  const exactCollision=benchmarkPaths.some(p=>p.join('>')===signature);
  const U=exactCollision?0:1;
  return {P:clamp(P),M:clamp(M),R:clamp(R),O:clamp(O),U,C,exactCollision};
}

export function score(path, benchmarkPaths=[]){
  const m=metrics(path,benchmarkPaths);
  if(m.exactCollision) return {...m,rejected:true,rejectionReason:'EXACT_BENCHMARK_COLLISION',score:0};
  if(m.R<1) return {...m,rejected:true,rejectionReason:'EDGE_CLASS_PLURALITY_REQUIRED',score:0};
  const pm=(m.P+m.M)/2, mc=(m.M+m.C)/2;
  const generatorBonus=0.05*pm;
  const specifierBonus=0.05*mc;
  const operatorModulation=Math.min(0.08,generatorBonus+specifierBonus);
  const base=0.20*m.P+0.20*m.M+0.20*m.R+0.20*m.O+0.15*m.U+0.05*m.C;
  return {...m,rejected:false,base,operatorModulation,score:clamp(base+operatorModulation),candidateDigest:digest({addresses:path.addresses,edges:path.edges})};
}

export function rank(paths,benchmarkPaths=[]){
  return paths.map(path=>({path,...score(path,benchmarkPaths)}))
    .filter(x=>!x.rejected)
    .sort((a,b)=>b.score-a.score||a.candidateDigest.localeCompare(b.candidateDigest));
}
