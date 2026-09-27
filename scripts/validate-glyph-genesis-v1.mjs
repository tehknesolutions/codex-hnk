#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const file=path.join(root,'docs/research/mandala/final/glyph-genesis-candidates.v1.json');
const doc=JSON.parse(fs.readFileSync(file,'utf8'));
const errors=[];
const seenPaths=new Map();

const hex=(value)=>value.toString(16).toUpperCase().padStart(4,'0');
function frame(namespace,ordinal0){return (1<<10)|(namespace<<7)|ordinal0}
function parseMF(node){const m=/^MF:L(0[1-6]):S(0[1-9]|[1-6][0-9]|7[0-2])$/.exec(node);return m?{l:+m[1],s:+m[2]}:null}
function expectedEdge(a,b){
  if(a.l===b.l){if((a.s%72)+1===b.s)return 'ANGULAR_NEXT';if(((a.s+70)%72)+1===b.s)return 'ANGULAR_PREV'}
  if(a.s===b.s){if(a.l+1===b.l)return 'RADIAL_OUT';if(a.l-1===b.l)return 'RADIAL_IN'}
  return null;
}
function fail(id,msg){errors.push(`${id}: ${msg}`)}

for(const c of doc.candidates??[]){
  const id=c.candidateId??'<missing-id>';
  if(c.bindingAuthority!=='HNK_CANDIDATE')fail(id,'bindingAuthority must remain HNK_CANDIDATE');
  if(!Array.isArray(c.path)||c.path.length<2){fail(id,'path must contain at least two nodes');continue}
  const signature=c.path.map(n=>n.node).join('>');
  if(seenPaths.has(signature))fail(id,`duplicate ordered PATH of ${seenPaths.get(signature)}`);else seenPaths.set(signature,id);
  for(let i=0;i<c.path.length;i++){
    const item=c.path[i], mf=parseMF(item.node);
    if(!mf){fail(id,`invalid MF node at ${i}: ${item.node}`);continue}
    const x=mf.s-1,y=mf.l-1;
    const layHex=hex(frame(1,y)),secHex=hex(frame(0,x));
    if(JSON.stringify(item.mfTupleHex)!==JSON.stringify([layHex,secHex]))fail(id,`codec mismatch at ${item.node}`);
    if(item.pixel?.planeId!=='MF'||item.pixel?.x!==x||item.pixel?.y!==y)fail(id,`PixelMap mismatch at ${item.node}`);
    const u=x-y,v=x+y;
    if(item.iso?.u!==u||item.iso?.v!==v)fail(id,`IsoPixel mismatch at ${item.node}`);
    if((u+v)%2||(v-u)%2||(u+v)/2!==x||(v-u)/2!==y)fail(id,`IsoPixel inverse failed at ${item.node}`);
    if(item.voxel?.planeId!=='MF'||item.voxel?.x!==x||item.voxel?.y!==0||item.voxel?.z!==y)fail(id,`Voxel mismatch at ${item.node}`);
    if(i<c.path.length-1){
      const next=parseMF(c.path[i+1].node), edge=next&&expectedEdge(mf,next);
      if(!edge)fail(id,`non-adjacent PATH step ${item.node} -> ${c.path[i+1].node}`);
      else if(item.edgeToNext!==edge)fail(id,`edge mismatch ${item.node}: stored=${item.edgeToNext}, expected=${edge}`);
    }else if(item.edgeToNext!==null)fail(id,'last node edgeToNext must be null');
  }
}

if(errors.length){console.error(`Glyph Genesis V1 FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log(`Glyph Genesis V1 PASS: ${doc.candidates.length} candidates; topology, typed codec, Pixel/IsoPixel/Voxel round-trips, authority gate and ordered-PATH uniqueness verified.`);
