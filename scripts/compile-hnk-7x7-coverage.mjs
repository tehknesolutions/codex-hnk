#!/usr/bin/env node
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const registry=read("data/library/hnk-7x7.registry.json");
const pilot=read("data/library/concepts.pilot.registry.json").concepts.map(c=>({id:c.concept_id,source_id:c.source_id,term:c.term,claim:c.source_claim,locator:c.locator,domains:c.domains}));
const batches=["data/library/expansion.batch-001.json","data/library/expansion.batch-002.json"].flatMap(p=>read(p).sources.flatMap(s=>s.concepts.map(c=>({...c,source_id:s.source_id}))));
const concepts=[...pilot,...batches];
const domains=Object.fromEntries(registry.domains.map(d=>[d.domain_id,{domain_id:d.domain_id,name:d.name,pillar_id:d.pillar_id,level_id:d.level_id,concept_count:0,source_ids:new Set(),concept_ids:[]}]));
for(const c of concepts) for(const id of c.domains||[]){if(!domains[id]) throw new Error("Unknown domain "+id+" in "+c.id); const d=domains[id];d.concept_count++;d.source_ids.add(c.source_id);d.concept_ids.push(c.id)}
const cells=Object.values(domains).map(d=>({...d,source_ids:[...d.source_ids].sort()}));
const covered=cells.filter(x=>x.concept_count>0);
const pillars=registry.pillars.map(p=>{const cs=cells.filter(x=>x.pillar_id===p.pillar_id);return {pillar_id:p.pillar_id,name:p.name,covered_domains:cs.filter(x=>x.concept_count).length,total_domains:7,concept_links:cs.reduce((n,x)=>n+x.concept_count,0),unique_sources:[...new Set(cs.flatMap(x=>x.source_ids))].sort()}});
const out={schema_version:"HNK-7X7-CORPUS-COVERAGE-V1",generated_from:["concepts.pilot.registry.json","expansion.batch-001.json","expansion.batch-002.json"],concept_count:concepts.length,source_count:new Set(concepts.map(x=>x.source_id)).size,domain_count:49,covered_domain_count:covered.length,empty_domain_count:49-covered.length,coverage_percent:+(covered.length/49*100).toFixed(2),pillars,cells};
process.stdout.write(JSON.stringify(out,null,2)+"\n");
