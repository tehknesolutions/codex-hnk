#!/usr/bin/env node
import fs from "node:fs";const x=JSON.parse(fs.readFileSync(new URL("../data/library/project-source-gap.batch-004.json",import.meta.url),"utf8"));
const ds=new Set(x.sources.flatMap(s=>s.concepts.flatMap(c=>c.domains)));
for(const d of ["P02-L02","P02-L07","P04-L02"])if(!ds.has(d))throw Error("missing "+d);
console.log("HNK_PROJECT_GAP_BATCH_004_PASS: final 3 gaps have candidate source evidence");
