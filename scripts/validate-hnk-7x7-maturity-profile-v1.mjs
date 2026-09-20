#!/usr/bin/env node
import fs from "node:fs";const p=new URL("../data/library/hnk-7x7.maturity-profile.v1.json",import.meta.url);
if(!fs.existsSync(p))throw Error("profile artifact missing");
const x=JSON.parse(fs.readFileSync(p,"utf8"));if(x.cells.length!==49)throw Error("expected 49 cells");
if(x.summary.covered!==49||x.summary.empty!==0)throw Error("expected documentary coverage 49/49");
for(const c of x.cells)if(["formalization","praxis","governance","cross_link_density"].some(k=>c.maturity[k]!=="UNKNOWN"))throw Error("unsupported inferred maturity axis in "+c.domain_id);
console.log("HNK_7X7_MATURITY_PROFILE_V1_PASS: 49 cells; unsupported axes preserved UNKNOWN");
