#!/usr/bin/env node
import fs from "node:fs";const x=JSON.parse(fs.readFileSync(new URL("../data/lab/hnk-knowledge.payload.v1.json",import.meta.url),"utf8"));
if(x.domains.length!==49)throw Error("expected 49 domains");if(x.matrices.pillar_order.length!==7)throw Error("expected 7 pillars");if(x.matrices.domain_order.length!==49)throw Error("expected 49 domain matrix");
for(const e of x.graph.edges)if(e.status==="HNK_APPROVED"&&e.provenance?.source_id==="SEMANTIC-AUDIT-V2")throw Error("semantic audit cannot auto-approve");
console.log("HNK_LAB_KNOWLEDGE_PAYLOAD_V1_PASS");
