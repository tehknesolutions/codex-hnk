import fs from "node:fs";
const g=JSON.parse(fs.readFileSync(new URL("../data/library/knowledge-graph.generated.json",import.meta.url),"utf8"));
const domains=g.nodes.filter(n=>n.type==="HNK_DOMAIN");
const refs=g.edges.filter(e=>e.relation==="INDEXED_IN");
const cells=domains.map(d=>{
 const x=refs.filter(e=>e.to===d.id);
 return {domain_id:d.id,name:d.label,count:x.length,concept_ids:[...new Set(x.map(e=>e.from))].sort()};
}).sort((a,b)=>a.domain_id.localeCompare(b.domain_id));
const report={schema_version:"HNK-7X7-HEATMAP-V1",metric:"candidate concept links",total_domains:49,occupied_domains:cells.filter(x=>x.count).length,empty_domains:cells.filter(x=>!x.count).length,max_density:Math.max(0,...cells.map(x=>x.count)),cells};
fs.writeFileSync(new URL("../data/library/hnk-7x7.heatmap.json",import.meta.url),JSON.stringify(report,null,2)+"\n");
console.log("HNK_7X7_HEATMAP_PASS:",report.occupied_domains+" occupied / "+report.empty_domains+" empty");
