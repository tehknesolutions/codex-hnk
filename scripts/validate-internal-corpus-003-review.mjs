#!/usr/bin/env node
import fs from "node:fs";
const x=JSON.parse(fs.readFileSync(new URL("../data/library/internal.batch-003.project-chat-review.json",import.meta.url),"utf8"));
const s=x.findings.filter(f=>f.status==="SUPPORTED_CANDIDATE"),o=x.findings.filter(f=>f.status==="REMAINS_OPEN");
if(x.findings.length!==7||s.length!==4||o.length!==3)throw Error("expected 7 findings = 4 supported + 3 open");
console.log("HNK_INTERNAL_CORPUS_003_REVIEW_PASS: 4 supported candidates / 3 open gaps");
