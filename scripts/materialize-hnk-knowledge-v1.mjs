#!/usr/bin/env node
import fs from "node:fs";import {execFileSync} from "node:child_process";
const root=new URL("../",import.meta.url),run=s=>execFileSync(process.execPath,[new URL(s,root)],{encoding:"utf8"}),write=(p,t)=>fs.writeFileSync(new URL(p,root),t.endsWith("\n")?t:t+"\n");
write("data/library/knowledge-graph.integrated.v1.json",run("scripts/build-knowledge-graph-integrated-v1.mjs"));
write("data/library/knowledge-graph.integrated.v2.json",run("scripts/build-knowledge-graph-integrated-v2.mjs"));
write("data/library/hnk-7x7.convergence-map.v1.json",run("scripts/build-hnk-7x7-convergence-map-v1.mjs"));
console.log("HNK_KNOWLEDGE_MATERIALIZATION_PASS");
