#!/usr/bin/env node
import fs from "node:fs";
const x=JSON.parse(fs.readFileSync(new URL("../data/library/internal.batch-002.json",import.meta.url),"utf8"));
const ids=x.sources.flatMap(s=>s.concepts.map(c=>c.id));if(ids.length!==5)throw Error("expected 5 concepts");
if(new Set(ids).size!==5)throw Error("duplicate concept IDs");
const target=new Set(["P03-L04","P03-L07","P04-L06","P07-L03","P07-L07"]);
const hit=new Set(x.sources.flatMap(s=>s.concepts.flatMap(c=>c.domains)));
for(const d of target)if(!hit.has(d))throw Error("missing target "+d);
console.log("HNK_INTERNAL_CORPUS_002_PASS: 5 concepts / 5 internal-first gaps evidenced");
