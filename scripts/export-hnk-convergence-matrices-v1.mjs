#!/usr/bin/env node
import fs from "node:fs";const root=new URL("../",import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const x=read("data/library/hnk-7x7.convergence-matrices.v1.json");
const csv=(order,matrix,key)=>[["id",...order].join(","),...order.map(a=>[a,...order.map(b=>matrix[a][b][key])].join(","))].join("\n")+"\n";
fs.mkdirSync(new URL("../data/library/exports/",import.meta.url),{recursive:true});
fs.writeFileSync(new URL("../data/library/exports/hnk-pillar-convergence-7x7.v1.csv",import.meta.url),csv(x.pillar_order,x.pillar_matrix,"domain_pair_count"));
fs.writeFileSync(new URL("../data/library/exports/hnk-domain-convergence-49x49.v1.csv",import.meta.url),csv(x.domain_order,x.domain_matrix,"count"));
console.log("HNK_CONVERGENCE_MATRIX_EXPORT_V1_PASS");
