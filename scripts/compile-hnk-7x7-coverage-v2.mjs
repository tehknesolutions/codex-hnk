#!/usr/bin/env node
import fs from "node:fs";
const base=new URL("../",import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,base),"utf8"));
const registry=read("data/library/hnk-7x7.registry.json");
const pilot=read("data/library/concepts.pilot.registry.json").concepts.map(c=>({id:c.concept_id,source_id:c.source_id,domains:c.domains}));
const external=["data/library/expansion.batch-001.json","data/library/expansion.batch-002.json"].flatMap(p=>read(p).sources.flatMap(s=>s.concepts.map(c=>({id:c.id,source_id:s.source_id,domains:c.domains}))));
const internal=read("data/library/internal.batch-001.json").sources.flatMap(s=>s.concepts.map(c=>({id:c.id,source_id:s.id,domains:c.domains})));
const ext=[...pilot,...external];
const summarize=(concepts,label)=>{
 const cells=registry.domains.map(d=>({domain_id:d.domain_id,name:d.name,pillar_id:d.pillar_id,level_id:d.level_id,concept_ids:[],source_ids:new Set()}));
 const map=Object.fromEntries(cells.map(c=>[c.domain_id,c]));
 for(const c of concepts)for(const id of c.domains||[]){if(!map[id])throw Error("Unknown domain "+id);map[id].concept_ids.push(c.id);map[id].source_ids.add(c.source_id)}
 const out=cells.map(c=>({...c,concept_count:c.concept_ids.length,source_ids:[...c.source_ids].sort()}));
 const occupied=out.filter(c=>c.concept_count);
 return {label,concept_count:concepts.length,source_count:new Set(concepts.map(c=>c.source_id)).size,covered_domain_count:occupied.length,empty_domain_count:49-occupied.length,coverage_percent:+(occupied.length/49*100).toFixed(2),pillars:registry.pillars.map(p=>{const x=out.filter(c=>c.pillar_id===p.pillar_id);return {pillar_id:p.pillar_id,name:p.name,covered_domains:x.filter(c=>c.concept_count).length,concept_links:x.reduce((n,c)=>n+c.concept_count,0)}}),cells:out};
};
const result={schema_version:"HNK-7X7-CORPUS-COVERAGE-V2",semantics:"COVERAGE_IS_INDEXING_NOT_TRUTH_OR_CANON",external:summarize(ext,"EXTERNAL"),internal:summarize(internal,"INTERNAL"),combined:summarize([...ext,...internal],"COMBINED")};
process.stdout.write(JSON.stringify(result,null,2)+"\n");
