import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "docs", "experience", "kether", "day-001");
const outputDir = path.resolve(process.argv[2] ?? path.join(root, "dist", "quest-packs", "day-001"));
const allowBlocked = process.argv.includes("--allow-blocked");

const read = (name) => fs.readFileSync(path.join(sourceDir, name));
const pack = JSON.parse(read("day-001.quest-pack.json").toString("utf8"));

if (pack.release_state !== "READY" && !allowBlocked) {
  console.error(`QUEST PACK BUILD BLOCKED: ${pack.blockers.map((b) => b.id).join(", ")}`);
  console.error("Use --allow-blocked only for development/audit builds; never publish a blocked pack.");
  process.exit(2);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const payloadFiles = [
  "day-001.quest-pack.json",
  ...pack.files.map((entry) => entry.path),
];

const uniqueFiles = [...new Set(payloadFiles)].sort();
const checksums = [];

for (const name of uniqueFiles) {
  const bytes = read(name);
  const digest = createHash("sha256").update(bytes).digest("hex");
  fs.writeFileSync(path.join(outputDir, name), bytes);
  checksums.push({
    path: name,
    algorithm: "sha256",
    digest,
    byte_length: bytes.length,
  });
}

const runtimeIndex = {
  id: "HNK-KETHER-D001-RUNTIME-PACK-V1",
  kind: "hnk.runtime_quest_pack_index",
  source_pack_id: pack.id,
  quest_definition_id: pack.quest_definition_id,
  completion_contract_id: pack.completion_contract_id,
  canonical_source_sha: pack.canonical_source_sha,
  integrity_state: "PASS",
  release_state: pack.release_state,
  development_only: pack.release_state !== "READY",
  generated_at: new Date().toISOString(),
  files: checksums,
};

fs.writeFileSync(
  path.join(outputDir, "runtime-pack.index.json"),
  JSON.stringify(runtimeIndex, null, 2) + "\n",
  "utf8",
);

console.log(
  `QUEST PACK BUILD PASS (${checksums.length} files, release=${pack.release_state}, output=${outputDir})`,
);
