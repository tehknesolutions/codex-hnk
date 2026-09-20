import fs from "node:fs";
const g=JSON.parse(fs.readFileSync(new URL("../data/library/knowledge-graph.generated.json",import.meta.url),"utf8"));
const fail=m=>{throw new Error("[HNK-KG-GENERATED] "+m)};
const nodes=new Set(g.nodes.map(n=>n.id)), edges=new Set();
if(nodes.size!==g.nodes.length) fail("duplicate node IDs");
for(const e of g.edges){
 if(edges.has(e.edge_id)) fail("duplicate edge "+e.edge_id); edges.add(e.edge_id);
 if(!nodes.has(e.from)||!nodes.has(e.to)) fail("orphan "+e.edge_id);
 if(!e.provenance?.source_id||!e.provenance?.locator) fail("missing provenance "+e.edge_id);
 if(e.status==="HNK_APPROVED") fail("automatic HNK approval detected "+e.edge_id);
}
const expected=["library.sources.registry.json","concepts.pilot.registry.json","correspondences.registry.json","hnk-7x7.registry.json"];
for(const x of expected) if(!g.generated_from.includes(x)) fail("missing input "+x);
console.log("HNK_KG_GENERATED_PASS: "+g.nodes.length+" nodes / "+g.edges.length+" edges / 0 auto-approved");
