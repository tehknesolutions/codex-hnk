#!/usr/bin/env node
import fs from "node:fs";
import {execFileSync} from "node:child_process";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const matrix=read("packages/hnk-glyphs/reference/HNK40_REFERENCE_MATRIX_V1.json");
const semantics=read("data/library/hnk40.approved-semantic-relations.v1.json");
const visual=read("data/library/hnk40.visual-authority.v1.json");
const graph=JSON.parse(execFileSync(process.execPath,[new URL("./build-knowledge-graph-integrated-v1.mjs",import.meta.url).pathname],{encoding:"utf8"}));
const fail=m=>{throw Error("HNK40_KG_INTEGRITY_FAIL: "+m)};
if(matrix.entries.length!==40)fail("matrix must contain 40 glyphs");
if(semantics.status!=="HNK_APPROVED"||semantics.entries.length!==40)fail("approved semantics must contain 40 glyphs");
if(visual.status!=="VISUAL-CANON-V2"||visual.glyph_count!==40||visual.legacy_recovery_claim!==false)fail("visual authority contract invalid");
for(const g of matrix.entries){
 const node=graph.nodes.find(n=>n.id===g.glyph_id&&n.type==="HNK_GLYPH");if(!node)fail("missing glyph node "+g.glyph_id);
 if(node.structural_visual_state!==matrix.authority.visual_state)fail("structural visual state drift "+g.glyph_id);
 const ve=graph.edges.filter(e=>e.from===g.glyph_id&&e.to===visual.source_id);
 if(ve.length!==1||ve[0].relation!=="DERIVED_FROM"||ve[0].status!=="SOURCE_ASSERTED")fail("visual provenance edge invalid "+g.glyph_id);
 const se=graph.edges.filter(e=>e.from===g.glyph_id&&e.status==="HNK_APPROVED"&&e.relation==="REPRESENTS");
 if(se.length!==6)fail("approved semantic edge count invalid "+g.glyph_id);
}
if(graph.summary.glyph_semantic_edges!==240)fail("summary semantic edge count must be 240");
if(graph.summary.glyph_visual_authority_edges!==40)fail("summary visual edge count must be 40");
process.stdout.write("HNK40_KG_INTEGRITY_PASS\n");
