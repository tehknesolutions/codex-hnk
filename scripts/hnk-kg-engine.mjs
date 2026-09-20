import fs from "node:fs";

const graph = JSON.parse(fs.readFileSync(new URL("../data/library/knowledge-graph.seed.json", import.meta.url), "utf8"));
const byId = new Map(graph.nodes.map(n => [n.id, n]));
const outgoing = new Map(), incoming = new Map();

for (const e of graph.edges) {
  if (!outgoing.has(e.from)) outgoing.set(e.from, []);
  if (!incoming.has(e.to)) incoming.set(e.to, []);
  outgoing.get(e.from).push(e);
  incoming.get(e.to).push(e);
}

export function getNode(id) { return byId.get(id) ?? null; }
export function findNodes(q) {
  const s=String(q).toLowerCase();
  return graph.nodes.filter(n => n.id.toLowerCase().includes(s) || n.label.toLowerCase().includes(s));
}
export function edgesFor(id,{direction="both",status,relation}={}) {
  let edges=[];
  if(direction==="out"||direction==="both") edges.push(...(outgoing.get(id)||[]));
  if(direction==="in"||direction==="both") edges.push(...(incoming.get(id)||[]));
  if(status) edges=edges.filter(e=>e.status===status);
  if(relation) edges=edges.filter(e=>e.relation===relation);
  return edges;
}
export function neighbors(id,opts={}) {
  return edgesFor(id,opts).map(e => {
    const other=e.from===id?e.to:e.from;
    return {node:byId.get(other),edge:e};
  });
}
export function traverse(start,{depth=2,status}={}) {
  if(!byId.has(start)) return [];
  const seen=new Set([start]), queue=[{id:start,d:0}], result=[];
  while(queue.length){
    const cur=queue.shift();
    if(cur.d>=depth) continue;
    for(const {node,edge} of neighbors(cur.id,{status})){
      if(!node||seen.has(node.id)) continue;
      seen.add(node.id);
      result.push({depth:cur.d+1,node,via:edge});
      queue.push({id:node.id,d:cur.d+1});
    }
  }
  return result;
}
export function provenanceFor(id) {
  return edgesFor(id).map(e=>({edge_id:e.edge_id,source_id:e.provenance.source_id,locator:e.provenance.locator,status:e.status}));
}
export function stats(){
  return {nodes:graph.nodes.length,edges:graph.edges.length,node_types:[...new Set(graph.nodes.map(n=>n.type))],statuses:[...new Set(graph.edges.map(e=>e.status))]};
}
