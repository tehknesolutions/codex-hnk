#!/usr/bin/env node
import fs from "node:fs";
const root=new URL("../",import.meta.url), read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const registry=read("data/library/hnk-7x7.registry.json");
const model=read("data/library/hnk-7x7.maturity-model.v1.json");
const sources=[];
const add=(kind,source,concepts)=>{for(const c of concepts||[])sources.push({kind,source,id:c.concept_id||c.id,domains:c.domains||[],status:c.status||"INDEXED",raw:c})};
const pilot=read("data/library/concepts.pilot.registry.json"); add("EXTERNAL","pilot",pilot.concepts);
for(const p of ["data/library/expansion.batch-001.json","data/library/expansion.batch-002.json"]){const b=read(p);for(const s of b.sources)add("EXTERNAL",s.source_id,s.concepts)}
for(const p of ["data/library/internal.batch-001.json","data/library/internal.batch-002.json"]){const b=read(p);for(const s of b.sources)add("INTERNAL",s.id,s.concepts)}
const review=read("data/library/internal.batch-003.project-chat-review.json");
for(const f of review.findings.filter(x=>x.status==="SUPPORTED_CANDIDATE"))sources.push({kind:"PROJECT_CHAT",source:"batch-003",id:"B003-"+f.domain_id,domains:[f.domain_id],status:f.status,raw:f});
const b4=read("data/library/project-source-gap.batch-004.json");for(const s of b4.sources)add("PROJECT_FILE",s.source,s.concepts);
const cells=registry.domains.map(d=>{
 const cs=sources.filter(c=>c.domains.includes(d.domain_id));
 const families=new Set(cs.map(c=>c.kind)), srcs=new Set(cs.map(c=>c.source));
 return {domain_id:d.domain_id,name:d.name,coverage_status:cs.length?"COVERED":"EMPTY",concept_count:cs.length,source_count:srcs.size,provenance_families:[...families].sort(),concept_ids:cs.map(c=>c.id).sort(),
 maturity:{evidence_depth:cs.length===0?"UNKNOWN":cs.length===1?1:cs.length<=3?2:3,source_diversity:families.size===0?"UNKNOWN":families.size===1?1:families.size===2?2:3,formalization:"UNKNOWN",praxis:"UNKNOWN",governance:"UNKNOWN",cross_link_density:"UNKNOWN"},
 open_questions:["Formalization, praxis, governance and typed cross-links require dedicated evidence audit; they are not inferred from concept counts."]};
});
const out={schema_version:"HNK-7X7-MATURITY-PROFILE-V1",model:model.schema_version,semantics:["NO_SINGLE_COMPOSITE_SCORE","UNKNOWN_IS_NOT_ZERO","COUNT_DERIVED_AXES_ONLY_WHERE_SUPPORTED"],summary:{domains:cells.length,covered:cells.filter(c=>c.coverage_status==="COVERED").length,empty:cells.filter(c=>c.coverage_status==="EMPTY").length,concept_records:sources.length},cells};
process.stdout.write(JSON.stringify(out,null,2)+"\n");
