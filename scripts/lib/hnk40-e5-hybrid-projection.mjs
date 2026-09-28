import { createHash } from 'node:crypto';

const RULE = 'HNK40-E5-V4-DIRECTION-DISTANCE@1';
const SOURCE_REF = 'docs/research/mandala/final/hnk40-e4-genesis-projection.v1.json';
const STATUSES = ['DIRECT','DERIVED_UNIQUE','DERIVED_AMBIGUOUS','NO_E5_PROJECTION','PENDING_RULE'];

function parseAddress(value) {
  const match = /^MF:L(0[1-6]):S(0[1-9]|[1-6][0-9]|7[0-2])$/.exec(value);
  if (!match) throw new Error(`Invalid Mandala address: ${value}`);
  return { layer: Number(match[1]), sector: Number(match[2]) };
}

function formatAddress(layer, sector) {
  return `MF:L${String(layer).padStart(2,'0')}:S${String(sector).padStart(2,'0')}`;
}

function edgeClass(edge) { return edge.startsWith('ANGULAR_') ? 'ANGULAR' : edge.startsWith('RADIAL_') ? 'RADIAL' : null; }
function edgeDirection(edge) { return edge.endsWith('_NEXT') || edge.endsWith('_OUT') ? 1 : -1; }
function cyclicDelta(a,b) { const d=Math.abs(a-b); return Math.min(d,72-d); }
function distance(a,b) { const x=parseAddress(a), y=parseAddress(b); return Math.abs(x.layer-y.layer)+cyclicDelta(x.sector,y.sector); }
function neighbors(address, klass) {
  const {layer,sector}=parseAddress(address);
  if (klass==='ANGULAR') return [
    [formatAddress(layer, sector===72?1:sector+1),1],
    [formatAddress(layer, sector===1?72:sector-1),-1]
  ];
  if (klass==='RADIAL') {
    const out=[];
    if (layer<6) out.push([formatAddress(layer+1,sector),1]);
    if (layer>1) out.push([formatAddress(layer-1,sector),-1]);
    return out;
  }
  throw new Error(`Invalid edge class: ${klass}`);
}

function enumerate(record) {
  const classes=record.sourceEdges.map(edgeClass);
  const sourceDirections=record.sourceEdges.map(edgeDirection);
  if (classes.some(x=>!x)) throw new Error(`${record.glyphId}: invalid edge`);
  const candidates=[];
  function visit(path,index,mismatches) {
    if (index===classes.length) {
      const geometricDistance=path.reduce((sum,node,i)=>sum+distance(node,record.sourcePath[i]),0);
      candidates.push({path,directionMismatchCount:mismatches,cyclicMandalaDistance:geometricDistance});
      return;
    }
    for (const [next,direction] of neighbors(path.at(-1),classes[index])) {
      if (!path.includes(next)) visit([...path,next],index+1,mismatches+(direction===sourceDirections[index]?0:1));
    }
  }
  visit([record.sourcePath[0]],0,0);
  candidates.sort((a,b)=>a.directionMismatchCount-b.directionMismatchCount || a.cyclicMandalaDistance-b.cyclicMandalaDistance || a.path.join('|').localeCompare(b.path.join('|')));
  if (!candidates.length) return [];
  const best=candidates[0];
  return candidates.filter(x=>x.directionMismatchCount===best.directionMismatchCount && x.cyclicMandalaDistance===best.cyclicMandalaDistance);
}

function projectionId(glyphId,path) {
  const hash=createHash('sha256').update(`${glyphId}|${RULE}|${path.join('|')}`).digest('hex').slice(0,16);
  return `${glyphId}-E5-${hash}`;
}

function sourceFingerprint(record) {
  return createHash('sha256').update(JSON.stringify({glyphId:record.glyphId,sourcePath:record.sourcePath,sourceEdges:record.sourceEdges})).digest('hex');
}

function makeProjection(record,candidate) {
  return { projectionId:projectionId(record.glyphId,candidate.path), path:candidate.path, derivationRule:RULE,
    metrics:{directionMismatchCount:candidate.directionMismatchCount,cyclicMandalaDistance:candidate.cyclicMandalaDistance},
    authority:'DERIVED_STRUCTURAL', canonical:false };
}
function expectedNeighbor(from,to,edge) {
  const a=parseAddress(from), b=parseAddress(to);
  if (edge==='ANGULAR_NEXT') return a.layer===b.layer && b.sector===(a.sector===72?1:a.sector+1);
  if (edge==='ANGULAR_PREV') return a.layer===b.layer && b.sector===(a.sector===1?72:a.sector-1);
  if (edge==='RADIAL_OUT') return b.layer===a.layer+1 && b.sector===a.sector;
  if (edge==='RADIAL_IN') return b.layer===a.layer-1 && b.sector===a.sector;
  return false;
}

function validateSource(source) {
  if (!source || !Array.isArray(source.records) || source.records.length!==40) throw new Error('Expected exactly 40 HNK40 records');
  const expected=Array.from({length:40},(_,i)=>`G${String(i+1).padStart(2,'0')}`);
  const ids=source.records.map(r=>r.glyphId);
  if (new Set(ids).size!==40 || expected.some(id=>!ids.includes(id))) throw new Error('Expected glyph IDs G01..G40 exactly once');
  for (const r of source.records) {
    if (!Array.isArray(r.sourcePath)||r.sourcePath.length!==12) throw new Error(`${r.glyphId}: expected 12-node sourcePath`);
    if (!Array.isArray(r.sourceEdges)||r.sourceEdges.length!==11) throw new Error(`${r.glyphId}: expected 11 sourceEdges`);
    r.sourcePath.forEach(parseAddress);
    for (let i=0;i<r.sourceEdges.length;i++) if (!expectedNeighbor(r.sourcePath[i],r.sourcePath[i+1],r.sourceEdges[i])) throw new Error(`${r.glyphId}: invalid legacy edge geometry at ${i}`);
  }
}

export function generateHybridProjection(source) {
  validateSource(source);
  const records=[...source.records].sort((a,b)=>a.glyphId.localeCompare(b.glyphId)).map(record=>{
    const minima=enumerate(record);
    const projectionSet=minima.map(c=>makeProjection(record,c));
    const sourceSimple=new Set(record.sourcePath).size===12;
    const direct=sourceSimple && minima.length===1 && minima[0].directionMismatchCount===0 && minima[0].cyclicMandalaDistance===0;
    const resolutionStatus=direct?'DIRECT':projectionSet.length===0?'NO_E5_PROJECTION':projectionSet.length===1?'DERIVED_UNIQUE':'DERIVED_AMBIGUOUS';
    const preferredProjectionId=(resolutionStatus==='DIRECT'||resolutionStatus==='DERIVED_UNIQUE')?projectionSet[0].projectionId:null;
    return { legacyIdentity:{glyphId:record.glyphId,sourceRef:SOURCE_REF,sourceFingerprint:sourceFingerprint(record),legacyPath:[...record.sourcePath],authority:'HNK40_LEGACY'},
      projectionSet,resolutionStatus,preferredProjectionId,resolutionEvidence:{derivationRule:RULE},
      acquisitionEligibility:resolutionStatus==='DERIVED_AMBIGUOUS'?'CANDIDATE_SET_ONLY':projectionSet.length?'STRUCTURAL_TARGET_AVAILABLE':'NO_TARGET' };
  });
  const summary=Object.fromEntries(STATUSES.map(status=>[status,records.filter(r=>r.resolutionStatus===status).length]));
  return {schemaVersion:'1.0.0',source:{ref:SOURCE_REF,status:source.status??null},derivationRule:RULE,summary,records};
}

