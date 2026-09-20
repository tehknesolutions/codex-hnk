#!/usr/bin/env node
import fs from "node:fs";
const x=JSON.parse(fs.readFileSync(new URL("../data/library/hnk-7x7.knowledge-gap-map.v1.json",import.meta.url),"utf8"));
const fail=m=>{throw Error("[HNK-GAP-MAP] "+m)};
if(x.gaps.length!==12)fail("expected 12 gaps");
if(new Set(x.gaps.map(g=>g.domain_id)).size!==12)fail("duplicate gap");
if(x.basis.covered_domains+x.basis.gaps!==x.basis.total_domains)fail("coverage arithmetic");
if(!x.policy.includes("NO_FORCED_49_OF_49"))fail("anti-padding policy missing");
console.log("HNK_KNOWLEDGE_GAP_MAP_V1_PASS: 12 gaps");
