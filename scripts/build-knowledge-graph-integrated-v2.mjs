#!/usr/bin/env node
import fs from "node:fs";const root=new URL("../",import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const g=read("data/library/knowledge-graph.integrated.v1.json"),s=read("data/library/knowledge-graph.semantic-links.v2.json");
const ids=new Set(g.nodes.map(n=>n.id));for(const e of s.edges){if(!ids.has(e.from)||!ids.has(e.to))throw Error("semantic orphan "+e.id);if(e.status==="HNK_APPROVED")throw Error("automatic approval forbidden");}
const edges=[...g.edges,...s.edges.map(e=>({edge_id:e.id,from:e.from,relation:e.relation,to:e.to,provenance:{source_id:"SEMANTIC-AUDIT-V2",locator:e.basis},status:e.status}))];
process.stdout.write(JSON.stringify({...g,schema_version:"HNK-KNOWLEDGE-GRAPH-INTEGRATED-V2",summary:{...g.summary,edges:edges.length,semantic_edges:s.edges.length},edges},null,2)+"\n");
