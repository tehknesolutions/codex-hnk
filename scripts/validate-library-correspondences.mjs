import fs from "node:fs";
const p=new URL("../data/library/correspondences.registry.json",import.meta.url);
const r=JSON.parse(fs.readFileSync(p,"utf8"));
const fail=m=>{throw new Error("[HNK-CORR] "+m)};
if(!Array.isArray(r.edges)||r.edges.length<10) fail("expected >=10 pilot edges");
const ids=new Set();
for(const e of r.edges){
 if(ids.has(e.edge_id)) fail("duplicate "+e.edge_id); ids.add(e.edge_id);
 if(!e.source_id||!e.from||!e.relation||!e.to||!e.locator) fail("incomplete "+e.edge_id);
}
console.log("HNK_CORRESPONDENCES_PASS: "+r.edges.length+" provenance-backed edges");
