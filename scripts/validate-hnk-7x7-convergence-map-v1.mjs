#!/usr/bin/env node
import fs from "node:fs";const x=JSON.parse(fs.readFileSync(new URL("../data/library/hnk-7x7.convergence-map.v1.json",import.meta.url),"utf8"));
for(const l of x.domain_links){if(l.domain_a===l.domain_b)throw Error("self domain link");if(!l.edge_ids.length)throw Error("unsupported domain link")}
for(const p of x.pillar_links)if(!p.edge_ids.length)throw Error("unsupported pillar link");
if(!x.semantics.includes("NO_INFERRED_MISSING_LINKS"))throw Error("missing conservative rule");
console.log("HNK_7X7_CONVERGENCE_MAP_V1_PASS: evidence-backed semantic convergence only");
