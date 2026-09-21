#!/usr/bin/env node
import fs from "node:fs";
const root=new URL("../",import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const registry=read("data/library/hnk-7x7.registry.json");
const nodes=[],edges=[];const nodeIds=new Set(),edgeIds=new Set();
const addNode=n=>{if(!nodeIds.has(n.id)){nodeIds.add(n.id);nodes.push(n)}};
const addEdge=e=>{if(edgeIds.has(e.edge_id))throw Error("duplicate edge "+e.edge_id);edgeIds.add(e.edge_id);edges.push(e)};
for(const d of registry.domains)addNode({id:d.domain_id,type:"HNK_DOMAIN",label:d.name});
const glyphMatrix=read("packages/hnk-glyphs/reference/HNK40_REFERENCE_MATRIX_V1.json");
const glyphEdgeGate=read("data/library/hnk40.glyph-evidence-edges.v1.json");
const glyphApproved=read("data/library/hnk40.approved-semantic-relations.v1.json");
const glyphVisualAuthority=read("data/library/hnk40.visual-authority.v1.json");
if(glyphApproved.status!=="HNK_APPROVED"||glyphApproved.entries.length!==40)throw Error("HNK40 approved relation registry invalid");
if(glyphVisualAuthority.status!=="VISUAL-CANON-V2"||glyphVisualAuthority.glyph_count!==40)throw Error("HNK40 visual authority registry invalid");
for(const g of glyphMatrix.entries)addNode({id:g.glyph_id,type:"HNK_GLYPH",label:g.safe_transliteration||g.glyph_id,phoneme_ipa:g.phoneme_ipa,world_id:g.world_id,protoglyph_column:g.protoglyph_column,candidate_pua:g.candidate_pua,structural_visual_state:glyphMatrix.authority.visual_state,status:"SOURCE_ASSERTED"});
addNode({id:glyphVisualAuthority.source_id,type:"SOURCE",label:"HNK40 Visual Canon V2",source_kind:"INTERNAL_CANONICAL_ARTIFACT",status:"SOURCE_ASSERTED"});
for(const g of glyphMatrix.entries)addEdge({edge_id:`HNK40-${g.glyph_id}-VISUAL-CANON-V2`,from:g.glyph_id,relation:"DERIVED_FROM",to:glyphVisualAuthority.source_id,provenance:{source_id:glyphVisualAuthority.source_id,artifact:glyphVisualAuthority.artifact,sprite_sha256:glyphVisualAuthority.sprite_sha256,ordered_set_sha256:glyphVisualAuthority.ordered_set_sha256},status:"SOURCE_ASSERTED"});
for(const r of glyphApproved.entries){
 const fields=["world_candidate","role","geometry","sigil","light","shadow"];
 for(const field of fields){
  const value=r[field],cid=`HNK40-${r.glyph_id}-${field.toUpperCase()}`;
  addNode({id:cid,type:"CONCEPT",label:String(value),status:"HNK_APPROVED"});
  addEdge({edge_id:`HNK40-${r.glyph_id}-${field.toUpperCase()}`,from:r.glyph_id,relation:"REPRESENTS",to:cid,provenance:{source_id:"HNK-ORACULUM-CUBE-MANUAL-V1-RC1",locator:"Appendix B pp.25-32",promotion_gate:"HNK40-AUTHORED-CANDIDATE-PROMOTION-GATE-V1"},status:"HNK_APPROVED"});
 }
}
let seq=1;
const ingest=(kind,sourceId,label,concepts,status="HNK_CANDIDATE")=>{
 addNode({id:sourceId,type:"SOURCE",label,source_kind:kind});
 for(const c of concepts||[]){
  const cid=c.concept_id||c.id;addNode({id:cid,type:"CONCEPT",label:c.term||c.claim||c.source_claim||cid,status});
  addEdge({edge_id:"IKG-E"+String(seq++).padStart(4,"0"),from:cid,relation:"DERIVED_FROM",to:sourceId,provenance:{source_id:sourceId,locator:c.locator||c.basis||"registry"},status});
  for(const d of c.domains||[])addEdge({edge_id:"IKG-E"+String(seq++).padStart(4,"0"),from:cid,relation:"INDEXED_IN",to:d,provenance:{source_id:sourceId,locator:c.locator||c.basis||"registry"},status});
 }
};
const p=read("data/library/concepts.pilot.registry.json");for(const c of p.concepts)ingest("EXTERNAL",c.source_id,c.source_id,[c],"HNK_CANDIDATE");
for(const path of ["data/library/expansion.batch-001.json","data/library/expansion.batch-002.json"]){const b=read(path);for(const s of b.sources)ingest("EXTERNAL",s.source_id,s.source_id,s.concepts,"HNK_CANDIDATE")}
for(const path of ["data/library/internal.batch-001.json","data/library/internal.batch-002.json"]){const b=read(path);for(const s of b.sources)ingest("GITHUB_REPOSITORY",s.id,s.repository,s.concepts,"HNK_CANDIDATE")}
const b3=read("data/library/internal.batch-003.project-chat-review.json");
for(const f of b3.findings.filter(x=>x.status==="SUPPORTED_CANDIDATE"))ingest("PROJECT_CHAT","PROJECT-CHAT-B003","Project/chat evidence batch 003",[{id:"B003-"+f.domain_id,term:f.rationale,domains:[f.domain_id],locator:"internal.batch-003.project-chat-review.json"}],"HNK_CANDIDATE");
const b4=read("data/library/project-source-gap.batch-004.json");for(const s of b4.sources)ingest("PROJECT_FILE","PROJECT-"+s.source,s.source,s.concepts,"HNK_CANDIDATE");
nodes.sort((a,b)=>a.id.localeCompare(b.id));edges.sort((a,b)=>a.edge_id.localeCompare(b.edge_id));
const out={schema_version:"HNK-KNOWLEDGE-GRAPH-INTEGRATED-V1",principle:"PROVENANCE_FIRST__NO_AUTOMATIC_CANON_PROMOTION",summary:{nodes:nodes.length,edges:edges.length,domains:registry.domains.length,glyphs:glyphMatrix.entries.length,glyph_semantic_edges:glyphApproved.entries.length*6,glyph_visual_authority_edges:glyphMatrix.entries.length},nodes,edges};
process.stdout.write(JSON.stringify(out,null,2)+"\n");
