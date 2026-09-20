#!/usr/bin/env node
import fs from "node:fs";const root=new URL("../",import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const g=read("data/library/knowledge-graph.integrated.v2.json"),r=read("data/library/hnk-7x7.registry.json");
const conceptDomains=new Map();
for(const e of g.edges.filter(e=>e.relation==="INDEXED_IN")){if(!conceptDomains.has(e.from))conceptDomains.set(e.from,new Set());conceptDomains.get(e.from).add(e.to)}
const semantic=new Set(["USES","INTEGRATES_WITH","CORRESPONDS_TO","REPRESENTS","RELATED_TO"]);
const links=new Map(), pairs=new Map();
const add=(a,b,e)=>{const k=[a,b].sort().join("::");if(!links.has(k))links.set(k,[]);links.get(k).push(e)};
for(const e of g.edges.filter(e=>semantic.has(e.relation))){
 const A=conceptDomains.get(e.from)||new Set(),B=conceptDomains.get(e.to)||new Set();
 for(const a of A)for(const b of B)if(a!==b)add(a,b,e);
}
for(const [k,es] of links){const [a,b]=k.split("::");const pa=a.slice(0,3),pb=b.slice(0,3);const pk=[pa,pb].sort().join("::");if(!pairs.has(pk))pairs.set(pk,{pillar_a:[pa,pb].sort()[0],pillar_b:[pa,pb].sort()[1],domain_pairs:new Set(),relations:new Set(),edge_ids:[]});const x=pairs.get(pk);x.domain_pairs.add(k);for(const e of es){x.relations.add(e.relation);x.edge_ids.push(e.edge_id)}}
const domain_links=[...links].map(([pair,es])=>{const [a,b]=pair.split("::");return{domain_a:a,domain_b:b,semantic_edge_count:es.length,relations:[...new Set(es.map(e=>e.relation))].sort(),edge_ids:es.map(e=>e.edge_id).sort()}}).sort((x,y)=>y.semantic_edge_count-x.semantic_edge_count||x.domain_a.localeCompare(y.domain_a));
const pillar_links=[...pairs.values()].map(x=>({...x,domain_pair_count:x.domain_pairs.size,domain_pairs:[...x.domain_pairs].sort(),relations:[...x.relations].sort(),edge_ids:[...new Set(x.edge_ids)].sort()})).sort((a,b)=>b.domain_pair_count-a.domain_pair_count||a.pillar_a.localeCompare(b.pillar_a));
const out={schema_version:"HNK-7X7-CONVERGENCE-MAP-V1",semantics:["SEMANTIC_CONNECTIVITY_NOT_TRUTH","SEMANTIC_CONNECTIVITY_NOT_IMPORTANCE","NO_INFERRED_MISSING_LINKS"],summary:{semantic_edges:g.summary.semantic_edges,connected_domain_pairs:domain_links.length,connected_pillar_pairs:pillar_links.length},domain_links,pillar_links};
process.stdout.write(JSON.stringify(out,null,2)+"\n");
