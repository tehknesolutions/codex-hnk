#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const genesis=JSON.parse(fs.readFileSync(path.join(root,'docs/research/mandala/final/glyph-genesis-candidates.v1.json'),'utf8'));
const transport=JSON.parse(fs.readFileSync(path.join(root,'docs/research/mandala/final/glyph-path-transport-profile.v1.json'),'utf8'));
const errors=[];
const seenPaths=new Map();
const edgeEnum=transport.edgeEnum;

const hex16=(value)=>value.toString(16).toUpperCase().padStart(4,'0');
const frame=(namespace,ordinal0)=>(1<<10)|(namespace<<7)|ordinal0;
function decodeFrame(value){
  if((value&0xC000)!==0)throw new Error('transport padding bits must be 00');
  const version=(value>>10)&15, namespace=(value>>7)&7, ordinal0=value&127;
  if(version!==1)throw new Error(`frame version ${version} != 1`);
  return {version,namespace,ordinal0};
}
function parseMF(node){
  const m=/^MF:L(0[1-6]):S(0[1-9]|[1-6][0-9]|7[0-2])$/.exec(node);
  return m?{l:+m[1],s:+m[2]}:null;
}
function expectedEdge(a,b){
  if(a.l===b.l){
    if((a.s%72)+1===b.s)return 'ANGULAR_NEXT';
    if(((a.s+70)%72)+1===b.s)return 'ANGULAR_PREV';
  }
  if(a.s===b.s){
    if(a.l+1===b.l)return 'RADIAL_OUT';
    if(a.l-1===b.l)return 'RADIAL_IN';
  }
  return null;
}
function crc32(buffer){
  let crc=0xFFFFFFFF;
  for(const byte of buffer){
    crc^=byte;
    for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xEDB88320:0);
  }
  return (crc^0xFFFFFFFF)>>>0;
}
function base64url(buffer){return buffer.toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}
function serializeCandidate(c){
  const parts=[Buffer.from('HNKP','ascii'),Buffer.from([1,1,c.path.length])];
  for(const item of c.path){
    const [layHex,secHex]=item.mfTupleHex;
    const b=Buffer.alloc(4);
    b.writeUInt16BE(parseInt(layHex,16),0);
    b.writeUInt16BE(parseInt(secHex,16),2);
    parts.push(b);
  }
  parts.push(Buffer.from(c.path.slice(0,-1).map(item=>edgeEnum[item.edgeToNext])));
  const body=Buffer.concat(parts);
  const checksum=Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body),0);
  return Buffer.concat([body,checksum]);
}
function decodePacket(packet){
  if(packet.length<11)throw new Error('packet too short');
  if(packet.subarray(0,4).toString('ascii')!=='HNKP')throw new Error('bad magic');
  if(packet[4]!==1||packet[5]!==1)throw new Error('unsupported version/flags');
  const count=packet[6], expected=4+1+1+1+count*4+(count-1)+4;
  if(packet.length!==expected)throw new Error(`packet length ${packet.length} != ${expected}`);
  const storedCrc=packet.readUInt32BE(packet.length-4), actualCrc=crc32(packet.subarray(0,-4));
  if(storedCrc!==actualCrc)throw new Error('CRC32 mismatch');
  const nodes=[]; let off=7;
  for(let i=0;i<count;i++){
    const lay=decodeFrame(packet.readUInt16BE(off));
    const sec=decodeFrame(packet.readUInt16BE(off+2)); off+=4;
    if(lay.namespace!==1||lay.ordinal0>5)throw new Error('invalid LAY frame');
    if(sec.namespace!==0||sec.ordinal0>71)throw new Error('invalid SEC frame');
    nodes.push(`MF:L${String(lay.ordinal0+1).padStart(2,'0')}:S${String(sec.ordinal0+1).padStart(2,'0')}`);
  }
  const edges=[...packet.subarray(off,off+count-1)];
  return {nodes,edges,crc32Hex:actualCrc.toString(16).toUpperCase().padStart(8,'0')};
}
function fail(id,msg){errors.push(`${id}: ${msg}`)}

const vectors=new Map((transport.vectors??[]).map(v=>[v.candidateId,v]));
for(const c of genesis.candidates??[]){
  const id=c.candidateId??'<missing-id>';
  if(c.bindingAuthority!=='HNK_CANDIDATE')fail(id,'bindingAuthority must remain HNK_CANDIDATE');
  if(!Array.isArray(c.path)||c.path.length<2){fail(id,'path must contain at least two nodes');continue}
  const signature=c.path.map(n=>n.node).join('>');
  if(seenPaths.has(signature))fail(id,`duplicate ordered PATH of ${seenPaths.get(signature)}`);else seenPaths.set(signature,id);
  for(let i=0;i<c.path.length;i++){
    const item=c.path[i], mf=parseMF(item.node);
    if(!mf){fail(id,`invalid MF node at ${i}: ${item.node}`);continue}
    const x=mf.s-1,y=mf.l-1;
    const layHex=hex16(frame(1,y)),secHex=hex16(frame(0,x));
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

  try{
    const packet=serializeCandidate(c);
    const decoded=decodePacket(packet);
    const sourceNodes=c.path.map(n=>n.node);
    const sourceEdges=c.path.slice(0,-1).map(n=>edgeEnum[n.edgeToNext]);
    if(JSON.stringify(decoded.nodes)!==JSON.stringify(sourceNodes))fail(id,'HNKP node round-trip mismatch');
    if(JSON.stringify(decoded.edges)!==JSON.stringify(sourceEdges))fail(id,'HNKP edge round-trip mismatch');
    const vector=vectors.get(id);
    if(!vector)fail(id,'missing HNKP transport vector');
    else{
      const packetHex=packet.toString('hex').toUpperCase();
      if(vector.packetBytes!==packet.length)fail(id,'packet byte-count drift');
      if(vector.packetHex!==packetHex)fail(id,'packet HEX vector drift');
      if(vector.crc32Hex!==decoded.crc32Hex)fail(id,'CRC32 vector drift');
      if(vector.base64url!==base64url(packet))fail(id,'base64url vector drift');
    }
  }catch(error){fail(id,`HNKP serialization error: ${error.message}`)}
}

if(vectors.size!==(genesis.candidates??[]).length)errors.push('transport vector count must equal candidate count');


const hnk40Spec=JSON.parse(fs.readFileSync(path.join(root,'docs/research/mandala/final/glyph-genesis-hnk40-seed-family.v1.json'),'utf8'));
const hnk40=JSON.parse(fs.readFileSync(path.join(root,'docs/research/mandala/final/glyph-genesis-hnk40-candidates.v1.json'),'utf8'));
const hnk40Seen=new Map();
const hnk40ShapeSeen=new Map();

const wrapSector=(s)=>((s-1)%72+72)%72+1;
const angularEdge=(bit)=>bit===0?'ANGULAR_NEXT':'ANGULAR_PREV';
const bits4=(n)=>[3,2,1,0].map((shift)=>(n>>shift)&1);
function expectedFamilyEdges(world,bits){
  if(world==='W1')return [angularEdge(bits[0]),'RADIAL_OUT',angularEdge(bits[1]),'RADIAL_OUT',angularEdge(bits[2]),'RADIAL_IN',angularEdge(bits[3]),'RADIAL_IN'];
  if(world==='W2')return ['RADIAL_OUT',angularEdge(bits[0]),'RADIAL_OUT',angularEdge(bits[1]),'RADIAL_IN',angularEdge(bits[2]),'RADIAL_IN',angularEdge(bits[3])];
  if(world==='W3')return [angularEdge(bits[0]),'RADIAL_IN',angularEdge(bits[1]),'RADIAL_IN',angularEdge(bits[2]),'RADIAL_OUT',angularEdge(bits[3]),'RADIAL_OUT'];
  return ['RADIAL_IN',angularEdge(bits[0]),'RADIAL_IN',angularEdge(bits[1]),'RADIAL_OUT',angularEdge(bits[2]),'RADIAL_OUT',angularEdge(bits[3])];
}
function advance(node,edge){
  let {l,s}=node;
  if(edge==='ANGULAR_NEXT')s=wrapSector(s+1);
  else if(edge==='ANGULAR_PREV')s=wrapSector(s-1);
  else if(edge==='RADIAL_OUT')l++;
  else if(edge==='RADIAL_IN')l--;
  return {l,s};
}
function expectedFamilyNodes(g,world,edges){
  let node={l:(world==='W1'||world==='W2')?2:5,s:g};
  const nodes=[node];
  for(const edge of edges){node=advance(node,edge);nodes.push(node)}
  return nodes.map(({l,s})=>`MF:L${String(l).padStart(2,'0')}:S${String(s).padStart(2,'0')}`);
}
function materializedPacket(candidate){
  const fullPath=candidate.path.map((node,index)=>{
    const mf=parseMF(node);
    if(!mf)throw new Error(`invalid MF node: ${node}`);
    return {
      node,
      edgeToNext:index<candidate.edges.length?candidate.edges[index]:null,
      mfTupleHex:[hex16(frame(1,mf.l-1)),hex16(frame(0,mf.s-1))],
    };
  });
  return serializeCandidate({path:fullPath});
}

if(hnk40Spec.cardinality!==40)errors.push('HNK40 seed spec cardinality must be 40');
if(hnk40.semanticAssignment!=='NONE')errors.push('HNK40 materialized registry must not assign semantics');
if(hnk40.bindingAuthority!=='HNK_CANDIDATE')errors.push('HNK40 registry authority must remain HNK_CANDIDATE');
if(hnk40.invariants?.nodesPerCandidate!==9)errors.push('HNK40 registry nodesPerCandidate must be 9');
if(hnk40.invariants?.edgesPerCandidate!==8)errors.push('HNK40 registry edgesPerCandidate must be 8');
if(hnk40.invariants?.packetBytesPerCandidate!==55)errors.push('HNK40 registry packetBytesPerCandidate must be 55');
if((hnk40.candidates??[]).length!==40)errors.push(`HNK40 registry expected 40 candidates, got ${(hnk40.candidates??[]).length}`);

for(let g=1;g<=40;g++){
  const expectedId=`G${String(g).padStart(2,'0')}`;
  const c=hnk40.candidates?.[g-1];
  if(!c){fail(expectedId,'candidate missing');continue}
  if(c.glyphId!==expectedId)fail(expectedId,`registry order/id drift: got ${c.glyphId}`);
  if(c.bindingAuthority!=='HNK_CANDIDATE')fail(expectedId,'bindingAuthority must remain HNK_CANDIDATE');
  const row=Math.floor((g-1)/10)+1, column=((g-1)%10)+1, world=`W${row}`, bits=bits4(column-1);
  if(c.sourceMatrix?.world!==world||c.sourceMatrix?.row!==row||c.sourceMatrix?.column!==column)fail(expectedId,'source 4x10 matrix coordinate drift');
  if(c.columnBits!==bits.join(''))fail(expectedId,'columnBits drift');
  const expectedEdges=expectedFamilyEdges(world,bits);
  const expectedNodes=expectedFamilyNodes(g,world,expectedEdges);
  if(JSON.stringify(c.path)!==JSON.stringify(expectedNodes))fail(expectedId,'deterministic family PATH drift');
  if(JSON.stringify(c.edges)!==JSON.stringify(expectedEdges))fail(expectedId,'deterministic family edge-pattern drift');

  const signature=(c.path??[]).join('>');
  if(hnk40Seen.has(signature))fail(expectedId,`duplicate HNK40 PATH of ${hnk40Seen.get(signature)}`);else hnk40Seen.set(signature,expectedId);
  const shapeSignature=(c.edges??[]).join('>');
  if(hnk40ShapeSeen.has(shapeSignature))fail(expectedId,`translation-normalized shape collision with ${hnk40ShapeSeen.get(shapeSignature)}`);else hnk40ShapeSeen.set(shapeSignature,expectedId);

  for(let i=0;i<(c.path??[]).length;i++){
    const mf=parseMF(c.path[i]);
    if(!mf){fail(expectedId,`invalid MF node ${c.path[i]}`);continue}
    const x=mf.s-1,y=mf.l-1,u=x-y,v=x+y;
    if((u+v)%2||(v-u)%2||(u+v)/2!==x||(v-u)/2!==y)fail(expectedId,`derived IsoPixel inverse failed at ${c.path[i]}`);
    if(i<c.path.length-1){
      const next=parseMF(c.path[i+1]), edge=next&&expectedEdge(mf,next);
      if(!edge)fail(expectedId,`non-adjacent generated step ${c.path[i]} -> ${c.path[i+1]}`);
      else if(c.edges[i]!==edge)fail(expectedId,`generated edge mismatch at step ${i}`);
    }
  }

  try{
    const packet=materializedPacket(c);
    const decoded=decodePacket(packet);
    if(JSON.stringify(decoded.nodes)!==JSON.stringify(c.path))fail(expectedId,'materialized HNKP node round-trip mismatch');
    if(JSON.stringify(decoded.edges)!==JSON.stringify(c.edges.map(e=>edgeEnum[e])))fail(expectedId,'materialized HNKP edge round-trip mismatch');
    if(c.hnkPacket?.bytes!==packet.length)fail(expectedId,'materialized packet byte-count drift');
    if(c.hnkPacket?.packetHex!==packet.toString('hex').toUpperCase())fail(expectedId,'materialized packet HEX drift');
    if(c.hnkPacket?.crc32Hex!==decoded.crc32Hex)fail(expectedId,'materialized CRC32 drift');
    if(c.hnkPacket?.base64url!==base64url(packet))fail(expectedId,'materialized base64url drift');
  }catch(error){fail(expectedId,`materialized HNKP error: ${error.message}`)}
}
if(hnk40Seen.size!==40)errors.push(`Expected 40 unique HNK40 ordered PATHs, got ${hnk40Seen.size}`);
if(hnk40ShapeSeen.size!==40)errors.push(`Expected 40 translation-normalized HNK40 shapes, got ${hnk40ShapeSeen.size}`);
if(hnk40.invariants?.uniqueOrderedPaths!==40)errors.push('Materialized registry uniqueOrderedPaths must be 40');
if(hnk40.invariants?.translationNormalizedUniqueShapes!==40)errors.push('Materialized registry translationNormalizedUniqueShapes must be 40');

if(errors.length){
  console.error(`Glyph Genesis V1 FAIL (${errors.length})`);
  for(const e of errors)console.error(`- ${e}`);
  process.exit(1);
}
console.log(`Glyph Genesis V1 PASS: ${genesis.candidates.length} semantic-target probes + ${hnk40.candidates.length} HNK40 structural seeds; topology, codec, derived Pixel/IsoPixel/Voxel round-trips, PATH uniqueness, HNKP serialization/CRC32/base64url vectors and authority boundaries verified.`);
