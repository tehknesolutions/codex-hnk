#!/usr/bin/env node
import fs from "node:fs";const x=JSON.parse(fs.readFileSync(new URL("../data/library/hnk-7x7.maturity-model.v1.json",import.meta.url),"utf8"));
if(x.dimensions.length!==6)throw Error("expected six dimensions");
if(!x.rules.includes("NO_SINGLE_COMPOSITE_SCORE"))throw Error("composite-score prohibition missing");
if(!x.rules.includes("UNKNOWN_IS_NOT_ZERO"))throw Error("unknown semantics missing");
console.log("HNK_7X7_MATURITY_MODEL_V1_PASS: 6 orthogonal dimensions");
