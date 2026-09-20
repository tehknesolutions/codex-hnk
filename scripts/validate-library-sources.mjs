import fs from "node:fs";
const p=new URL("../data/library/library.sources.registry.json",import.meta.url);
const r=JSON.parse(fs.readFileSync(p,"utf8"));
const fail=m=>{throw new Error("[HNK-LIBRARY] "+m)};
if(!Array.isArray(r.sources)||r.sources.length!==26) fail("expected 26 inventoried sources");
const ids=r.sources.map(x=>x.source_id);
if(new Set(ids).size!==ids.length) fail("duplicate source_id");
for(const s of r.sources){
 if(!s.title||!s.format||!s.source_file_id) fail("incomplete source "+s.source_id);
 if(s.hnk_7x7.length!==0) fail("premature 7x7 mapping in "+s.source_id);
}
console.log("HNK_LIBRARY_SOURCES_PASS: 26 inventoried / 0 premature mappings");
