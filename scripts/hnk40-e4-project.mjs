import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FINAL = path.join(ROOT, 'docs/research/mandala/final');
const SRC = path.join(FINAL, 'glyph-genesis-hnk40-candidates.v1.4.2.json');
const OUT = path.join(FINAL, 'hnk40-e4-genesis-projection.v1.json');
const REPORT = path.join(FINAL, 'HNK40-E4-GENESIS-PROJECTION-REPORT.md');

const edgeEnum = {
  ANGULAR_NEXT: 0, ANGULAR_PREV: 1, RADIAL_IN: 2, RADIAL_OUT: 3,
  CONTAINS: 4, MEMBER_OF: 5, ROSE_NEXT: 6, ROSE_PREV: 7,
  BRIDGE: 8, TO_CHOIR: 9, FROM_CHOIR: 10, CHOIR_NEXT: 11, CHOIR_PREV: 12
};
const edgeName = Object.fromEntries(Object.entries(edgeEnum).map(([k,v]) => [v,k]));

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let k=0;k<8;k++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function addrToOrdinal(id) {
  const m = /^MF:L(\d{2}):S(\d{2})$/.exec(id);
  if (!m) throw new Error(`E4 accepts MF source paths only: ${id}`);
  const layer = Number(m[1]), sector = Number(m[2]);
  if (layer < 1 || layer > 6 || sector < 1 || sector > 72) throw new Error(`Out-of-range MF address: ${id}`);
  return (layer - 1) * 72 + sector;
}
function ordinalToAddr(o) {
  if (o < 1 || o > 432) throw new Error(`Out-of-range MF ordinal: ${o}`);
  const layer = Math.floor((o-1)/72)+1, sector = ((o-1)%72)+1;
  return `MF:L${String(layer).padStart(2,'0')}:S${String(sector).padStart(2,'0')}`;
}
function encodeV2(pathIds, edges) {
  const n = pathIds.length;
  if (n > 127 || edges.length !== n-1) throw new Error('Invalid HNKP2 path cardinality');
  const body = Buffer.alloc(7 + 3*n + edges.length);
  body.write('HNKP',0,'ascii'); body[4]=2; body[5]=2; body[6]=n;
  let p=7;
  for (const id of pathIds) { const o=addrToOrdinal(id); body[p++]=1; body.writeUInt16BE(o,p); p+=2; }
  for (const e of edges) { if (!(e in edgeEnum)) throw new Error(`Unknown edge ${e}`); body[p++]=edgeEnum[e]; }
  const packet = Buffer.alloc(body.length+4); body.copy(packet); packet.writeUInt32BE(crc32(body), body.length);
  return packet;
}
function decodeV2(packet) {
  if (packet.subarray(0,4).toString('ascii') !== 'HNKP' || packet[4] !== 2 || packet[5] !== 2) throw new Error('Bad HNKP2 header');
  const n=packet[6], expected=10+4*n;
  if (packet.length !== expected) throw new Error(`Bad packet size ${packet.length}, expected ${expected}`);
  const body=packet.subarray(0,-4), got=packet.readUInt32BE(packet.length-4), want=crc32(body);
  if (got !== want) throw new Error('CRC mismatch');
  let p=7; const pathIds=[];
  for (let i=0;i<n;i++) { const ns=packet[p++], o=packet.readUInt16BE(p); p+=2; if(ns!==1) throw new Error(`E4 expected MF namespace, got ${ns}`); pathIds.push(ordinalToAddr(o)); }
  const edges=[]; for(let i=0;i<n-1;i++){ const e=edgeName[packet[p++]]; if(!e) throw new Error('Unknown edge byte'); edges.push(e); }
  return {path:pathIds, edges, crc32Hex:got.toString(16).toUpperCase().padStart(8,'0')};
}
function verifyLegacyPacket(c) {
  const h=c.hnkPacket; const packet=Buffer.from(h.packetHex,'hex');
  const crc=packet.readUInt32BE(packet.length-4);
  return {
    bytesPass: packet.length===70 && h.bytes===70,
    crcPass: crc32(packet.subarray(0,-4))===crc && crc.toString(16).toUpperCase().padStart(8,'0')===h.crc32Hex,
    base64Pass: packet.toString('base64url')===h.base64url
  };
}

const source=JSON.parse(fs.readFileSync(SRC,'utf8'));
if(source.candidateCount!==40 || source.candidates.length!==40) throw new Error('Source must contain exactly 40 candidates');
const records=[];
for(const c of source.candidates){
  const packet=encodeV2(c.path,c.edges), dec=decodeV2(packet), legacy=verifyLegacyPacket(c);
  const pathPass=JSON.stringify(dec.path)===JSON.stringify(c.path);
  const edgePass=JSON.stringify(dec.edges)===JSON.stringify(c.edges);
  records.push({
    glyphId:c.glyphId,
    sourcePath:c.path,
    sourceEdges:c.edges,
    e1Ordinals:c.path.map(addrToOrdinal),
    hnkp2:{bytes:packet.length,crc32Hex:dec.crc32Hex,packetHex:packet.toString('hex').toUpperCase(),base64url:packet.toString('base64url')},
    decodedPath:dec.path, decodedEdges:dec.edges,
    legacyHnkp1:{bytes:c.hnkPacket.bytes,crc32Hex:c.hnkPacket.crc32Hex,packetHex:c.hnkPacket.packetHex,base64url:c.hnkPacket.base64url,...legacy},
    pass:{pathRoundTrip:pathPass,edgeRoundTrip:edgePass,hnkp2Crc:true,hnkp2Bytes58:packet.length===58,hnkp1Immutable:legacy.bytesPass&&legacy.crcPass&&legacy.base64Pass}
  });
}
const count = key => records.filter(r=>r.pass[key]).length;
const summary={candidateCount:records.length,pathRoundTripPass:count('pathRoundTrip'),edgeRoundTripPass:count('edgeRoundTrip'),hnkp2CrcPass:count('hnkp2Crc'),hnkp2Bytes58Pass:count('hnkp2Bytes58'),hnkp1ImmutablePass:count('hnkp1Immutable'),semanticAssignmentsAdded:0,canonicalPromotions:0};
const allPass=Object.values(summary).every((v,i)=> i===0 ? v===40 : (typeof v==='number' ? (['semanticAssignmentsAdded','canonicalPromotions'].includes(Object.keys(summary)[i]) ? v===0 : v===40) : true));
const result={version:'1.0',status:allPass?'PASS':'FAIL',source:'glyph-genesis-hnk40-candidates.v1.4.2.json',transportProfile:'HNKP2-MANDALA-ADDR-BE',summary,records};
fs.writeFileSync(OUT,JSON.stringify(result,null,2)+'\n');
const md=`# HNK40 E4 Genesis Projection Report\n\nStatus: **${result.status}**\n\n- Candidates: ${summary.candidateCount}/40\n- PATH round-trip: ${summary.pathRoundTripPass}/40\n- EDGE round-trip: ${summary.edgeRoundTripPass}/40\n- HNKP2 CRC: ${summary.hnkp2CrcPass}/40\n- HNKP2 58-byte packets: ${summary.hnkp2Bytes58Pass}/40\n- HNKP1 immutable evidence: ${summary.hnkp1ImmutablePass}/40\n- Semantic assignments added: ${summary.semanticAssignmentsAdded}\n- Canonical promotions: ${summary.canonicalPromotions}\n\nE5 is ${allPass?'OPEN':'BLOCKED'}.\n`;
fs.writeFileSync(REPORT,md);
console.log(JSON.stringify(summary));
if(!allPass) process.exit(1);
