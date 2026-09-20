#!/usr/bin/env node
import fs from "node:fs";const x=JSON.parse(fs.readFileSync(new URL("../data/library/knowledge-graph.semantic-links.v2.json",import.meta.url),"utf8"));
const allowed=new Set(["USES","INTEGRATES_WITH","CORRESPONDS_TO","REPRESENTS","RELATED_TO"]);
if(x.edges.length!==15)throw Error("expected 15 reviewed semantic edges");
for(const e of x.edges){if(!allowed.has(e.relation))throw Error("relation not allowed "+e.relation);if(e.status==="HNK_APPROVED")throw Error("automatic approval");if(!e.basis)throw Error("basis required");}
console.log("HNK_KG_SEMANTIC_LINKS_V2_PASS: 15 reviewed candidate/source edges");
