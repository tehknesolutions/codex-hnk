import fs from "node:fs";

const read = p => JSON.parse(fs.readFileSync(new URL(p, import.meta.url), "utf8"));
const sources = read("../data/library/library.sources.registry.json");
const concepts = read("../data/library/concepts.pilot.registry.json");
const corr = read("../data/library/correspondences.registry.json");
const domains = read("../data/library/hnk-7x7.registry.json");

const nodes = new Map();
const edges = [];
const addNode = n => {
  const old=nodes.get(n.id);
  if(old && JSON.stringify(old)!==JSON.stringify(n)) throw new Error("[HNK-KG-BUILD] conflicting node "+n.id);
  nodes.set(n.id,n);
};
const slug=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80);

for(const s of sources.sources) addNode({id:s.source_id,type:"SOURCE",label:s.title,authority:s.authority});
for(const d of domains.domains) addNode({id:d.domain_id,type:"HNK_DOMAIN",label:d.name,authority:d.status});
for(const c of concepts.concepts){
  addNode({id:c.concept_id,type:"CONCEPT",label:c.term,authority:"SOURCE_DERIVED"});
  edges.push({edge_id:"GEN-"+c.concept_id+"-SOURCE",from:c.concept_id,relation:"DERIVED_FROM",to:c.source_id,provenance:{source_id:c.source_id,locator:c.locator},status:"SOURCE_ASSERTED"});
  for(const domain of c.domains){
    edges.push({edge_id:"GEN-"+c.concept_id+"-"+domain,from:c.concept_id,relation:"INDEXED_IN",to:domain,provenance:{source_id:c.source_id,locator:c.locator},status:"HNK_CANDIDATE"});
  }
}
for(const e of corr.edges){
  const from="EXT-"+slug(e.from); addNode({id:from,type:"CONCEPT",label:e.from,authority:"SOURCE_DERIVED"});
  for(const targetLabel of e.to){
    const to="EXT-"+slug(targetLabel); addNode({id:to,type:"CONCEPT",label:targetLabel,authority:"SOURCE_DERIVED"});
    edges.push({edge_id:e.edge_id+"-"+slug(targetLabel),from,relation:e.relation,to,provenance:{source_id:e.source_id,locator:e.locator},status:"SOURCE_ASSERTED"});
  }
}
const ids=new Set(nodes.keys()), edgeIds=new Set();
for(const e of edges){
 if(edgeIds.has(e.edge_id)) throw new Error("[HNK-KG-BUILD] duplicate edge "+e.edge_id); edgeIds.add(e.edge_id);
 if(!ids.has(e.from)||!ids.has(e.to)) throw new Error("[HNK-KG-BUILD] orphan edge "+e.edge_id);
 if(!e.provenance?.source_id||!e.provenance?.locator) throw new Error("[HNK-KG-BUILD] missing provenance "+e.edge_id);
 if(e.status==="HNK_APPROVED") throw new Error("[HNK-KG-BUILD] generator cannot auto-promote HNK_APPROVED");
}
const graph={schema_version:"HNK-KG-GENERATED-V1",generated_from:["library.sources.registry.json","concepts.pilot.registry.json","correspondences.registry.json","hnk-7x7.registry.json"],nodes:[...nodes.values()].sort((a,b)=>a.id.localeCompare(b.id)),edges:edges.sort((a,b)=>a.edge_id.localeCompare(b.edge_id))};
const out=new URL("../data/library/knowledge-graph.generated.json",import.meta.url);
fs.writeFileSync(out,JSON.stringify(graph,null,2)+"\n");
console.log("HNK_KG_BUILD_PASS:",graph.nodes.length+" nodes / "+graph.edges.length+" edges");
