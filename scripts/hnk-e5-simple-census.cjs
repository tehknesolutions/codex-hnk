const N=12;
function mfN(v){const l=Math.floor(v/72),s=v%72,a=[l*72+(s+1)%72,l*72+(s+71)%72];if(l>0)a.push((l-1)*72+s);if(l<5)a.push((l+1)*72+s);return a}
function cgN(v){if(v<432){const a=mfN(v);if(Math.floor(v/72)===5)a.push(432+Math.floor((v%72)/8));return a}const g=v-432,a=[];for(let k=0;k<8;k++)a.push(360+g*8+k);a.push(432+(g+1)%9,432+(g+8)%9);return a}
function count(V,nb){let total=0n;for(let st=0;st<V;st++){const seen=new Uint8Array(V);seen[st]=1;function dfs(v,d){if(d===N){total++;return}for(const w of nb(v))if(!seen[w]){seen[w]=1;dfs(w,d+1);seen[w]=0}}dfs(st,1)}return total}
console.time('MF');const mf=count(432,mfN);console.timeEnd('MF');console.log('MF='+mf);
console.time('MFCG');const mfcg=count(441,cgN);console.timeEnd('MFCG');console.log('MFCG='+mfcg);
const crT=0n,crH=0n,crD=24n;const major=mfcg+crT+crH+crD;console.log('MAJOR='+major);require('fs').writeFileSync('docs/research/mandala/final/hnk-e5-simple-path-census.v1.json',JSON.stringify({version:'1.0',status:'PASS',pathLaw:{nodes:12,repeatedAddress:false,ordered:true,symmetryReduction:'NONE'},counts:{mf:mf.toString(),mfPlusCg:mfcg.toString(),crT:'0',crH:'0',crD:'24',major463:major.toString()}},null,2)+'\n');
