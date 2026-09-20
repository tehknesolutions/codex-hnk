import semantic from '../../../../data/library/knowledge-graph.semantic-links.v2.json';
import pilot from '../../../../data/library/concepts.pilot.registry.json';
import external1 from '../../../../data/library/expansion.batch-001.json';
import external2 from '../../../../data/library/expansion.batch-002.json';
import internal1 from '../../../../data/library/internal.batch-001.json';
import internal2 from '../../../../data/library/internal.batch-002.json';
import review3 from '../../../../data/library/internal.batch-003.project-chat-review.json';
import gap4 from '../../../../data/library/project-source-gap.batch-004.json';

export type ConceptProjection={id:string;domains:string[];sourceId:string|null;term:string|null;origin:string};
type ConceptDomains=Map<string,string[]>;
const index:ConceptDomains=new Map();
const meta=new Map<string,{sourceId:string|null;term:string|null;origin:string}>();
const add=(id:string,domains:string[],sourceId:string|null=null,term:string|null=null,origin:string='UNSPECIFIED')=>{index.set(id,[...new Set(domains)]);meta.set(id,{sourceId,term,origin})};
for(const c of pilot.concepts)add(c.concept_id,c.domains,c.source_id,c.term,'EXTERNAL_PILOT');
for(const batch of [external1,external2])for(const s of batch.sources)for(const c of s.concepts)add(c.id,c.domains,s.source_id,c.term??null,'EXTERNAL_EXPANSION');
for(const batch of [internal1,internal2])for(const s of batch.sources)for(const c of s.concepts)add(c.id,c.domains,s.source_id,c.term??null,'INTERNAL_CORPUS');
for(const f of review3.findings.filter(x=>x.status==='SUPPORTED_CANDIDATE'))add('B003-'+f.domain_id,[f.domain_id],null,f.domain_name??null,'PROJECT_CHAT_REVIEW');
for(const s of gap4.sources)for(const c of s.concepts)add(c.id,c.domains,s.source_id??null,c.term??null,'PROJECT_SOURCE_GAP');

export const convergenceEdges=semantic.edges.map(e=>({
 ...e,
 from_domains:index.get(e.from)??[],
 to_domains:index.get(e.to)??[]
}));
export const unresolvedConvergenceEndpoints=convergenceEdges.filter(e=>e.from_domains.length===0||e.to_domains.length===0).map(e=>e.id);

export type PillarLink={a:string;b:string;materialized_relations:number;semantic_edge_ids:string[]};
const pillarOf=(domainId:string)=>domainId.slice(0,3);
const pillarPairs=new Map<string,{a:string;b:string;ids:Set<string>}>();
for(const edge of convergenceEdges){
 const left=[...new Set(edge.from_domains.map(pillarOf))];
 const right=[...new Set(edge.to_domains.map(pillarOf))];
 for(const a of left)for(const b of right){
  if(a===b)continue;
  const [x,y]=[a,b].sort();
  const key=x+'::'+y;
  const current=pillarPairs.get(key)??{a:x,b:y,ids:new Set<string>()};
  current.ids.add(edge.id);pillarPairs.set(key,current);
 }
}
export const pillarConvergenceLinks:PillarLink[]=[...pillarPairs.values()].map(x=>({a:x.a,b:x.b,materialized_relations:x.ids.size,semantic_edge_ids:[...x.ids]})).sort((x,y)=>y.materialized_relations-x.materialized_relations||x.a.localeCompare(y.a)||x.b.localeCompare(y.b));
export const maxPillarMaterializedRelations=Math.max(0,...pillarConvergenceLinks.map(x=>x.materialized_relations));

export const conceptProjection=(id:string):ConceptProjection=>({id,domains:index.get(id)??[],sourceId:meta.get(id)?.sourceId??null,term:meta.get(id)?.term??null,origin:meta.get(id)?.origin??'UNRESOLVED'});
export const conceptRegistry=[...index.keys()].map(conceptProjection).sort((a,b)=>a.id.localeCompare(b.id));
