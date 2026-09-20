import fs from "node:fs";
const p=new URL("../data/library/concepts.pilot.registry.json",import.meta.url);
const r=JSON.parse(fs.readFileSync(p,"utf8"));
const fail=m=>{throw new Error("[HNK-LIBRARY-CONCEPTS] "+m)};
if(!Array.isArray(r.concepts)||r.concepts.length<10) fail("pilot requires >=10 concepts");
const ids=new Set();
for(const c of r.concepts){
 if(ids.has(c.concept_id)) fail("duplicate "+c.concept_id); ids.add(c.concept_id);
 if(!c.source_id||!c.term||!c.source_claim||!c.locator) fail("missing provenance "+c.concept_id);
 if(!Array.isArray(c.domains)||c.domains.length===0) fail("missing 7x7 mapping "+c.concept_id);
 for(const d of c.domains) if(!/^P0[1-7]-L0[1-7]$/.test(d)) fail("bad domain "+d);
}
console.log("HNK_LIBRARY_CONCEPTS_PILOT_PASS: "+r.concepts.length+" atomic concepts");
