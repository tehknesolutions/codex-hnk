#!/usr/bin/env node
import fs from "node:fs";const x=JSON.parse(fs.readFileSync(new URL("../data/library/hnk-7x7.maturity-audit-001.json",import.meta.url),"utf8"));
if(!x.findings.length)throw Error("empty audit");
if(x.cross_link_audit.status!=="BLOCKED_PENDING_GRAPH_INTEGRATION")throw Error("cross-link gate missing");
for(const f of x.findings){for(const k of ["formalization","praxis","governance"])if(![1,2,3,"UNKNOWN"].includes(f[k]))throw Error("bad "+k+" "+f.domain_id);if(f.cross_link_density!=="UNKNOWN")throw Error("cross-links must remain unknown");}
console.log("HNK_7X7_MATURITY_AUDIT_001_PASS: evidence-scoped axes only");
