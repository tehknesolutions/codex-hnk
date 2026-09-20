#!/usr/bin/env node
import fs from "node:fs";const root=new URL("../",import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const c=read("data/library/hnk-7x7.convergence-map.v1.json"),r=read("data/library/hnk-7x7.registry.json");
const domains=r.domains.map(x=>x.domain_id), pillars=[...new Set(domains.map(x=>x.slice(0,3)))].sort();
const dm=Object.fromEntries(domains.map(a=>[a,Object.fromEntries(domains.map(b=>[b,{count:0,relations:[],edge_ids:[]}]))]));
for(const l of c.domain_links){for(const [a,b] of [[l.domain_a,l.domain_b],[l.domain_b,l.domain_a]])dm[a][b]={count:l.semantic_edge_count,relations:l.relations,edge_ids:l.edge_ids}}
const pm=Object.fromEntries(pillars.map(a=>[a,Object.fromEntries(pillars.map(b=>[b,{domain_pair_count:0,relations:[],edge_ids:[]}]))]));
for(const l of c.pillar_links){for(const [a,b] of [[l.pillar_a,l.pillar_b],[l.pillar_b,l.pillar_a]])pm[a][b]={domain_pair_count:l.domain_pair_count,relations:l.relations,edge_ids:l.edge_ids}}
const out={schema_version:"HNK-CONVERGENCE-MATRICES-V1",semantics:["SYMMETRIC_VIEW_OF_REVIEWED_SEMANTIC_LINKS","ZERO_MEANS_NO_MATERIALIZED_LINK_NOT_NO_RELATION"],pillar_order:pillars,domain_order:domains,pillar_matrix:pm,domain_matrix:dm};
process.stdout.write(JSON.stringify(out,null,2)+"\n");
