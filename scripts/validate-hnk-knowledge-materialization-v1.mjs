#!/usr/bin/env node
import fs from "node:fs";const root=new URL("../",import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const g=read("data/library/knowledge-graph.integrated.v2.json"),c=read("data/library/hnk-7x7.convergence-map.v1.json"),s=read("data/library/knowledge-graph.semantic-links.v2.json");
if(g.schema_version!=="HNK-KNOWLEDGE-GRAPH-INTEGRATED-V2")throw Error("wrong graph schema");if(c.schema_version!=="HNK-7X7-CONVERGENCE-MAP-V1")throw Error("wrong convergence schema");if(g.summary.semantic_edges!==s.edges.length)throw Error("semantic edge count mismatch");
const ids=new Set(g.nodes.map(n=>n.id));for(const e of s.edges)if(!ids.has(e.from)||!ids.has(e.to))throw Error("semantic orphan "+e.id);
for(const x of c.domain_links)if(!/^P0[1-7]-L0[1-7]$/.test(x.domain_a)||!/^P0[1-7]-L0[1-7]$/.test(x.domain_b))throw Error("invalid domain link");
console.log("HNK_KNOWLEDGE_MATERIALIZATION_VALID");
