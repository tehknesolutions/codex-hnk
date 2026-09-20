#!/usr/bin/env node
import fs from "node:fs";const x=JSON.parse(fs.readFileSync(new URL("../data/library/hnk-7x7.convergence-matrices.v1.json",import.meta.url),"utf8"));
if(x.pillar_order.length!==7)throw Error("expected 7 pillars");if(x.domain_order.length!==49)throw Error("expected 49 domains");
for(const a of x.domain_order)for(const b of x.domain_order)if(x.domain_matrix[a][b].count!==x.domain_matrix[b][a].count)throw Error("asymmetry "+a+" "+b);
for(const a of x.pillar_order)for(const b of x.pillar_order)if(x.pillar_matrix[a][b].domain_pair_count!==x.pillar_matrix[b][a].domain_pair_count)throw Error("pillar asymmetry");
console.log("HNK_CONVERGENCE_MATRICES_V1_PASS: 7x7 + 49x49 symmetric");
