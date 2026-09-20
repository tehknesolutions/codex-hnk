import semantic from '../../../../data/library/knowledge-graph.semantic-links.v2.json';
import pilot from '../../../../data/library/concepts.pilot.registry.json';
import external1 from '../../../../data/library/expansion.batch-001.json';
import external2 from '../../../../data/library/expansion.batch-002.json';
import internal1 from '../../../../data/library/internal.batch-001.json';
import internal2 from '../../../../data/library/internal.batch-002.json';
import review3 from '../../../../data/library/internal.batch-003.project-chat-review.json';
import gap4 from '../../../../data/library/project-source-gap.batch-004.json';

type ConceptDomains=Map<string,string[]>;
const index:ConceptDomains=new Map();
const add=(id:string,domains:string[])=>index.set(id,[...new Set(domains)]);
for(const c of pilot.concepts)add(c.concept_id,c.domains);
for(const batch of [external1,external2])for(const s of batch.sources)for(const c of s.concepts)add(c.id,c.domains);
for(const batch of [internal1,internal2])for(const s of batch.sources)for(const c of s.concepts)add(c.id,c.domains);
for(const f of review3.findings.filter(x=>x.status==='SUPPORTED_CANDIDATE'))add('B003-'+f.domain_id,[f.domain_id]);
for(const s of gap4.sources)for(const c of s.concepts)add(c.id,c.domains);

export const convergenceEdges=semantic.edges.map(e=>({
 ...e,
 from_domains:index.get(e.from)??[],
 to_domains:index.get(e.to)??[]
}));
export const unresolvedConvergenceEndpoints=convergenceEdges.filter(e=>e.from_domains.length===0||e.to_domains.length===0).map(e=>e.id);
