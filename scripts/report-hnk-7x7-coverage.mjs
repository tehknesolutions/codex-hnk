#!/usr/bin/env node
import fs from "node:fs";
const p=new URL("../data/library/hnk-7x7.coverage.json",import.meta.url);
if(!fs.existsSync(p)){console.error("Generate coverage first with compile-hnk-7x7-coverage.mjs");process.exit(1)}
const x=JSON.parse(fs.readFileSync(p,"utf8"));
console.log(`HNK-7×7 CORPUS COVERAGE V1\nConcepts: ${x.concept_count} | Sources: ${x.source_count} | Covered: ${x.covered_domain_count}/49 (${x.coverage_percent}%) | Empty: ${x.empty_domain_count}\n`);
for(const p of x.pillars) console.log(`${p.pillar_id} ${p.name}: ${p.covered_domains}/7 cells | ${p.concept_links} links | ${p.unique_sources.length} sources`);
console.log("\nEMPTY CELLS");
for(const c of x.cells.filter(c=>!c.concept_count)) console.log(`- ${c.domain_id} ${c.name}`);
