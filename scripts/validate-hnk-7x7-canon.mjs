#!/usr/bin/env node
import fs from "node:fs";
const r=JSON.parse(fs.readFileSync(new URL("../data/library/hnk-7x7.registry.json",import.meta.url),"utf8"));
const fail=m=>{throw new Error("[HNK-7X7-CANON] "+m)};
if(r.domains.length!==49) fail("expected 49 domains");
const ids=new Set(r.domains.map(x=>x.domain_id)); if(ids.size!==49) fail("duplicate IDs");
for(let p=1;p<=7;p++)for(let l=1;l<=7;l++){const id=`P0${p}-L0${l}`;if(!ids.has(id))fail("missing "+id)}
if(r.canonical_source?.issue!==173)fail("missing Issue #173 canonical lock");
const generic=r.domains.filter(d=>/^(Fundamento|Percepção|Linguagem|Operação|Integração|Criação|Manifestação) — /.test(d.name));
if(generic.length)fail("generic generated domain names remain: "+generic.map(x=>x.domain_id).join(","));
console.log("HNK_7X7_CANON_PASS: 49/49 exact-domain registry locked to Issue #173");
