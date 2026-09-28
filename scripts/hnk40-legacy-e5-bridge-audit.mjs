import fs from 'node:fs';
const source='docs/research/mandala/final/hnk40-e4-genesis-projection.v1.json';
const out='docs/research/mandala/final/hnk40-legacy-e5-bridge-audit.v1.json';
const data=JSON.parse(fs.readFileSync(source,'utf8'));
const glyphs=data.glyphs ?? data.entries ?? data.records ?? data.projection ?? [];
if(!Array.isArray(glyphs) || glyphs.length!==40) throw new Error('Expected exactly 40 HNK40 records');
const rows=glyphs.map(g=>{
  const path=g.sourcePath ?? g.decodedPath;
  if(!Array.isArray(path) || path.length!==12) throw new Error(g.glyphId+': expected 12-node sourcePath');
  const unique=new Set(path).size===12;
  const repeats=path.filter((x,i)=>path.indexOf(x)!==i);
  return {glyphId:g.glyphId, legacyPathLength:path.length, uniqueAddresses:unique, repeatedAddresses:[...new Set(repeats)], directE5:unique, status:unique?'DIRECT':'REQUIRES_BRIDGE'};
});
const directE5=rows.filter(r=>r.directE5).length;
const requiresBridge=rows.length-directE5;
const report={
 schema:'HNK40-LEGACY-E5-BRIDGE-AUDIT-V1',
 status:'DIAGNOSTIC_ONLY',
 sourceFile:source,
 sourceRecordCount:rows.length,
 glyphCount:40,
 directE5,
 requiresBridge,
 canonicalPromotions:0,
 semanticAssignmentsAdded:0,
 sourceMutationCount:0,
 invariants:{
  cardinality40:rows.length===40,
  directPlusBridgeIs40:directE5+requiresBridge===40,
  noCanonicalPromotions:true,
  noSemanticAssignmentsAdded:true,
  noSourceMutation:true
 },
 records:rows
};
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({glyphCount:40,directE5,requiresBridge,canonicalPromotions:0,semanticAssignmentsAdded:0,sourceMutationCount:0},null,2));
