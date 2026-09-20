#!/usr/bin/env node
import fs from "node:fs";
const p=new URL("../data/library/hnk-7x7.coverage.v2.json",import.meta.url);
if(!fs.existsSync(p))throw Error("coverage v2 artifact missing");
const x=JSON.parse(fs.readFileSync(p,"utf8"));
const fail=m=>{throw Error("[HNK-COVERAGE-V2] "+m)};
if(x.external.concept_count!==36)fail("external concepts != 36");
if(x.external.source_count!==9)fail("external sources != 9");
if(x.internal.concept_count!==14)fail("internal concepts != 14");
if(x.internal.source_count!==7)fail("internal sources != 7");
if(x.combined.concept_count!==50)fail("combined concepts != 50");
for(const v of ["external","internal","combined"])if(x[v].covered_domain_count+x[v].empty_domain_count!==49)fail(v+" domain arithmetic");
console.log("HNK_7X7_COVERAGE_V2_PASS");
