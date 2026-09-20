#!/usr/bin/env node
import fs from "node:fs";const root=new URL("../",import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const g=read("data/library/knowledge-graph.integrated.v1.json");if(g.summary.domains!==49)throw Error("expected 49 domains");
const ids=new Set(g.nodes.map(n=>n.id));for(const e of g.edges){if(!ids.has(e.from)||!ids.has(e.to))throw Error("orphan "+e.edge_id);if(e.status==="HNK_APPROVED")throw Error("automatic canonical edge forbidden "+e.edge_id)}
console.log("HNK_KG_INTEGRATED_V1_PASS: no orphans / no automatic HNK_APPROVED");
