import fs from "node:fs";
const b=JSON.parse(fs.readFileSync(new URL("../data/library/expansion.batch-001.json",import.meta.url),"utf8"));
const fail=m=>{throw new Error("[HNK-LIB-BATCH001] "+m)};
const ids=new Set();
let n=0;
for(const s of b.sources){
 if(!s.source_id||!s.pages_reviewed) fail("missing source scope");
 for(const c of s.concepts){n++; if(ids.has(c.id))fail("duplicate "+c.id);ids.add(c.id);if(!c.term||!c.claim||!c.locator)fail("missing provenance "+c.id);if(!c.domains?.length)fail("missing domains "+c.id)}
}
if(n!==15) fail("expected 15 concepts, got "+n);
console.log("HNK_LIBRARY_EXPANSION_001_PASS: 5 sources / 15 concepts");
