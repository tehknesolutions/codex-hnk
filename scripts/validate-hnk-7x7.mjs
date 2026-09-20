import fs from "node:fs";

const path = new URL("../data/library/hnk-7x7.registry.json", import.meta.url);
const r = JSON.parse(fs.readFileSync(path, "utf8"));
const fail = (m) => { throw new Error("[HNK-7X7] " + m); };
if (r.pillars?.length !== 7) fail("expected 7 pillars");
if (r.levels?.length !== 7) fail("expected 7 levels");
if (r.domains?.length !== 49) fail("expected 49 domains");
const ids = new Set(r.domains.map(d=>d.domain_id));
if (ids.size !== 49) fail("domain IDs must be unique");
for (const p of r.pillars) for (const l of r.levels) {
  const id = p.pillar_id + "-" + l.level_id;
  if (!ids.has(id)) fail("missing " + id);
}
console.log("HNK_7X7_REGISTRY_PASS: 7 pillars / 7 levels / 49 unique domains");
