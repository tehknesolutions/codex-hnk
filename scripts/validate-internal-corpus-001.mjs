import fs from "node:fs";
const b=JSON.parse(fs.readFileSync(new URL("../data/library/internal.batch-001.json",import.meta.url),"utf8"));
const fail=m=>{throw new Error("[HNK-INTERNAL-001] "+m)};let n=0;const ids=new Set();
for(const s of b.sources){if(!s.repository||!s.evidence?.length)fail("source provenance missing");for(const c of s.concepts){n++;if(ids.has(c.id))fail("duplicate "+c.id);ids.add(c.id);if(!c.claim||!c.locator||!c.domains?.length)fail("incomplete "+c.id)}}
if(b.sources.length!==7)fail("expected 7 repos");if(n!==14)fail("expected 14 concepts, got "+n);
console.log("HNK_INTERNAL_CORPUS_001_PASS: 7 repositories / 14 concepts");
