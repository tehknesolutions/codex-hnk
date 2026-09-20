#!/usr/bin/env node
import fs from "node:fs";const root=new URL("../",import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),"utf8"));
const graph=read("data/library/knowledge-graph.integrated.v2.json"),matrix=read("data/library/hnk-7x7.convergence-matrices.v1.json"),model=read("data/library/hnk-7x7.maturity-model.v1.json"),audit=read("data/library/hnk-7x7.maturity-audit-001.json"),registry=read("data/library/hnk-7x7.registry.json");
const auditBy=new Map(audit.findings.map(x=>[x.domain_id,x]));
const domains=registry.domains.map(d=>({id:d.domain_id,name:d.name,pillar:d.domain_id.slice(0,3),level:Number(d.domain_id.slice(5)),maturity:auditBy.get(d.domain_id)||{domain_id:d.domain_id,formalization:"UNKNOWN",praxis:"UNKNOWN",governance:"UNKNOWN",cross_link_density:"UNKNOWN"}}));
const payload={schema_version:"HNK-LAB-KNOWLEDGE-PAYLOAD-V1",generated_from:["knowledge-graph.integrated.v2.json","hnk-7x7.convergence-matrices.v1.json","hnk-7x7.maturity-audit-001.json"],summary:{nodes:graph.nodes.length,edges:graph.edges.length,semantic_edges:graph.summary.semantic_edges,domains:domains.length},domains,graph:{nodes:graph.nodes,edges:graph.edges},matrices:{pillars:matrix.pillar_matrix,domains:matrix.domain_matrix,pillar_order:matrix.pillar_order,domain_order:matrix.domain_order},maturity_model:model};
process.stdout.write(JSON.stringify(payload,null,2)+"\n");
