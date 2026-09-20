import fs from "node:fs";
const b=JSON.parse(fs.readFileSync(new URL("../data/library/expansion.batch-002.json",import.meta.url),"utf8"));
const fail=m=>{throw new Error("[HNK-LIB-BATCH002] "+m)};
const ids=new Set(); let n=0;
for(const s of b.sources){if(!s.source_id||!s.pages_reviewed)fail("missing scope");for(const c of s.concepts){n++;if(ids.has(c.id))fail("duplicate "+c.id);ids.add(c.id);if(!c.claim||!c.locator||!c.domains?.length)fail("incomplete "+c.id)}}
if(n!==11)fail("expected 11 concepts, got "+n);
if(b.deferred.length!==3)fail("expected 3 deferred sources");
console.log("HNK_LIBRARY_EXPANSION_002_PASS: 2 sources / 11 concepts / 3 deferred with reasons");
