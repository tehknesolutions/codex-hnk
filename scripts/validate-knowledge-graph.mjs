import fs from "node:fs";
const schema=JSON.parse(fs.readFileSync(new URL("../data/library/knowledge-graph.schema.json",import.meta.url),"utf8"));
const graph=JSON.parse(fs.readFileSync(new URL("../data/library/knowledge-graph.seed.json",import.meta.url),"utf8"));
const fail=m=>{throw new Error("[HNK-KG] "+m)};
const nodeTypes=new Set(schema.node_types.map(x=>x.id));
const edgeTypes=new Set(schema.edge_types);
const nodeIds=new Set();
for(const n of graph.nodes){if(nodeIds.has(n.id))fail("duplicate node "+n.id);nodeIds.add(n.id);if(!nodeTypes.has(n.type))fail("unknown type "+n.type)}
for(const e of graph.edges){
 if(!nodeIds.has(e.from)||!nodeIds.has(e.to))fail("dangling edge "+e.edge_id);
 if(!edgeTypes.has(e.relation))fail("unknown relation "+e.relation);
 if(!e.provenance?.source_id||!e.provenance?.locator)fail("missing provenance "+e.edge_id);
 if(!schema.edge_contract.statuses.includes(e.status))fail("bad status "+e.edge_id);
}
console.log("HNK_KNOWLEDGE_GRAPH_PASS: "+graph.nodes.length+" nodes / "+graph.edges.length+" edges");
