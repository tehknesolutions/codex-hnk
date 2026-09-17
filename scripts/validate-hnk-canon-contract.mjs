import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  HNK_CANON_CONTRACT_ID,
  HNK_CANON_RECORDS,
  createHnkCanonConsumerSnapshot,
  validateHnkCanonContract,
} from "../packages/canon-contract/src/index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const issues = [];

const validation = validateHnkCanonContract();
if (!validation.ok) issues.push(...validation.issues.map((issue) => `contract: ${issue}`));
if (HNK_CANON_CONTRACT_ID !== "HNK_CANON_CONTRACT_V1") issues.push(`unexpected contract id ${HNK_CANON_CONTRACT_ID}`);
if (HNK_CANON_RECORDS.length !== 22) issues.push(`expected 22 shared records, found ${HNK_CANON_RECORDS.length}`);

const consumers = [
  {
    id: "@hnk/web",
    packagePath: "apps/web/package.json",
    adapterPath: "apps/web/lib/research/canon-registry.ts",
    markers: ["@hnk/canon-contract", "queryHnkCanon", "validateHnkCanonContract"],
  },
  {
    id: "@hnk/mobile",
    packagePath: "apps/mobile/package.json",
    adapterPath: "apps/mobile/src/runtime/hnk-canon.ts",
    markers: ["@hnk/canon-contract", "MOBILE_HNK_CANON", "createHnkCanonConsumerSnapshot"],
  },
  {
    id: "@hnk/quest-engine",
    packagePath: "packages/quest-engine/package.json",
    adapterPath: "packages/quest-engine/src/canon.ts",
    markers: ["@hnk/canon-contract", "QUEST_ENGINE_HNK_CANON", "createHnkCanonConsumerSnapshot"],
  },
  {
    id: "@hnk/glyphs",
    packagePath: "packages/hnk-glyphs/package.json",
    adapterPath: "packages/hnk-glyphs/src/canon.mjs",
    markers: ["@hnk/canon-contract", "GLYPH_ENGINE_HNK_CANON", "createHnkCanonConsumerSnapshot"],
  },
];

for (const consumer of consumers) {
  const packageJson = json(consumer.packagePath);
  if (packageJson.dependencies?.["@hnk/canon-contract"] !== "workspace:*") {
    issues.push(`${consumer.id}: @hnk/canon-contract workspace dependency missing`);
  }

  const adapter = read(consumer.adapterPath);
  for (const marker of consumer.markers) {
    if (!adapter.includes(marker)) issues.push(`${consumer.id}: adapter missing ${marker}`);
  }

  if (adapter.includes("canon/core/research-001-symbolic-architecture-v1.json")) {
    issues.push(`${consumer.id}: adapter bypasses shared contract and reads canon JSON directly`);
  }

  const snapshot = createHnkCanonConsumerSnapshot(consumer.id);
  if (snapshot.records !== HNK_CANON_RECORDS) issues.push(`${consumer.id}: consumer snapshot duplicated canon records`);
  if (snapshot.records.length !== 22) issues.push(`${consumer.id}: snapshot cardinality drift`);
  if (snapshot.authority !== "HNK_AUTHORED") issues.push(`${consumer.id}: authority drift`);
  if (snapshot.access !== "READ_ONLY") issues.push(`${consumer.id}: access must remain READ_ONLY`);
  if (snapshot.source_records_preserved !== true) issues.push(`${consumer.id}: source preservation drift`);
  if (snapshot.historical_authority_inherited !== false) issues.push(`${consumer.id}: historical authority must not be inherited`);
}

const questIndex = read("packages/quest-engine/src/index.ts");
if (!questIndex.includes('export * from "./canon.js";')) issues.push("@hnk/quest-engine: canon adapter not exported from package root");

const glyphPackage = json("packages/hnk-glyphs/package.json");
if (glyphPackage.exports?.["./canon"]?.import !== "./src/canon.mjs") issues.push("@hnk/glyphs: ./canon runtime export missing");
if (glyphPackage.exports?.["./canon"]?.types !== "./src/canon.d.ts") issues.push("@hnk/glyphs: ./canon type export missing");

const webAdapter = read("apps/web/lib/research/canon-registry.ts");
if (webAdapter.includes("human-gates/research-001") || webAdapter.includes("research-001-symbolic-architecture-v1.json")) {
  issues.push("@hnk/web: Canon Registry still duplicates source loading outside @hnk/canon-contract");
}

if (issues.length) {
  console.error("HNK_CANON_CONTRACT_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_CANON_CONTRACT_V1_PASS");
console.log(JSON.stringify({
  contract_id: HNK_CANON_CONTRACT_ID,
  records: HNK_CANON_RECORDS.length,
  consumers: consumers.map((consumer) => consumer.id),
  source_of_truth: "canon/core/research-001-symbolic-architecture-v1.json",
  duplicated_record_sets: 0,
}, null, 2));
