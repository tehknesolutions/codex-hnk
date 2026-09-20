import registry from '../../../../data/library/hnk-7x7.registry.json';
import semantic from '../../../../data/library/knowledge-graph.semantic-links.v2.json';

export type LabPillar={id:string;name:string;definition:string;verb:string};
export type LabDomain={id:string;name:string;definition:string;pillarId:string;levelId:string;status:string};
const verbs:Record<string,string>={P01:'orientar',P02:'transformar',P03:'investigar',P04:'compreender',P05:'expressar',P06:'instrumentalizar',P07:'manifestar'};
export const labPillars:LabPillar[]=registry.pillars.map(p=>({id:p.pillar_id,name:p.name==='TECNOLOGIA'?'TEHKNE':p.name,definition:p.definition,verb:verbs[p.pillar_id]}));
export const labDomains:LabDomain[]=registry.domains.map(d=>({id:d.domain_id,name:d.name,definition:d.definition,pillarId:d.pillar_id,levelId:d.level_id,status:d.status}));
export const labLevels=registry.levels;
export const semanticEdgeCount=semantic.edges.length;
export function domainsForPillar(id:string){return labDomains.filter(d=>d.pillarId===id)}
