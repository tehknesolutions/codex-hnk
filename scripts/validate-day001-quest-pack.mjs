import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "docs", "experience", "kether", "day-001");
const fail = (message) => {
  console.error(`DAY001 QUEST PACK FAIL: ${message}`);
  process.exitCode = 1;
};

const read = (name) => fs.readFileSync(path.join(base, name), "utf8");
const json = (name) => JSON.parse(read(name));
const gitBlobSha = (content) => {
  const bytes = Buffer.from(content, "utf8");
  return createHash("sha1")
    .update(Buffer.from(`blob ${bytes.length}\0`, "utf8"))
    .update(bytes)
    .digest("hex");
};

const pack = json("day-001.quest-pack.json");
const checksums = json("day-001.checksums.json");
const quest = json("day-001.quest.json");
const canon = json("day-001.canon-blocks.json");
const renderer = json("day-001.renderer-profile.json");
const evidence = json("day-001.evidence.schema.json");
const completion = json("day-001.completion.schema.json");
const completionService = json("day-001.completion.service.json");
const assets = json("day-001.assets.manifest.json");
const audio = json("day-001.audio.manifest.json");
const safety = json("day-001.safety.policy.json");
const episteme = json("day-001.episteme.manifest.json");

const qid = "HNK-KETHER-D001-V2";
const cid = "HNK-KETHER-D001-COMP-V2";
const sourceSha = "a01d13b43cbddb92236fc1e3b6c2a7e140d87d29";

if (pack.id !== "HNK-KETHER-D001-PACK-V1") fail("unexpected pack id");
if (pack.quest_definition_id !== qid) fail("pack quest id drift");
if (pack.completion_contract_id !== cid) fail("pack completion id drift");
if (pack.canonical_source_sha !== sourceSha) fail("pack canonical SHA drift");
if (pack.release_state !== "BLOCKED") fail("pack must remain BLOCKED while release blockers exist");
if (!pack.offline?.practice_capable || !pack.offline?.canonical_completion_requires_server) {
  fail("offline policy drift");
}

for (const [label, value] of [
  ["quest", quest.id],
  ["renderer", renderer.quest_definition_id],
  ["completion service", completionService.quest_definition_id],
  ["assets", assets.quest_definition_id],
  ["audio", audio.quest_definition_id],
  ["safety", safety.quest_definition_id],
  ["episteme", episteme.quest_definition_id],
]) {
  if (value !== qid) fail(`${label} quest id drift`);
}

if (quest.canonical?.source_sha !== sourceSha) fail("quest canonical SHA drift");
if (canon.source?.blob_sha !== sourceSha) fail("canon manifest SHA drift");
if (evidence.properties?.source_sha?.const !== sourceSha) fail("evidence canonical SHA drift");
if (completionService.canonical_source_sha !== sourceSha) fail("completion service SHA drift");
if (completion.properties?.completion_contract_id?.const !== cid) fail("completion contract id drift");
if (completionService.completion_contract_id !== cid) fail("completion service contract id drift");
if (canon.counted_core?.word_count !== 705) fail("canonical counted core must be 705 words");
if (assets.release_ready !== false) fail("assets cannot be release ready before final production approval");
if (pack.asset_reconciliation?.state !== "RECONCILED_NOT_RELEASE_READY") fail("asset reconciliation state drift");
if (audio.profiles?.theta_432?.status !== "CANONICAL_MAPPING_PENDING") fail("Theta/432 mapping was invented or changed");
if (safety.global_rules?.subjective_phenomenon_required !== false) fail("subjective phenomenon cannot become a completion requirement");
if (episteme.protocol_id !== "HNK-EP-1.1") fail("epistemic protocol drift");

const blockerIds = new Set(pack.blockers.map((entry) => entry.id));
for (const blocker of [
  "EDITORIAL-001-UNIVERSAL-ENTRY",
  "EDITORIAL-001-VOICE",
  "AUDIO-001-THETA-432",
  "BACKEND-001-COMPLETION-V2",
  "ASSET-001-CROWN-DERIVATIVE",
  "ASSET-001-KEY-ART",
  "ASSET-001-PROCEDURAL-EXTRACTION",
  "ASSET-001-SOUL-MIRROR-FINAL",
]) {
  if (!blockerIds.has(blocker)) fail(`missing release blocker: ${blocker}`);
}
if (blockerIds.has("ASSET-001-REGISTRY-RESOLUTION")) {
  fail("obsolete generic asset reconciliation blocker must not remain after inventory freeze");
}

for (const entry of checksums.entries) {
  const content = read(entry.path);
  const actual = gitBlobSha(content);
  if (actual !== entry.sha) fail(`git blob checksum drift: ${entry.path}`);
}

const packPaths = new Set(pack.files.map((file) => file.path));
for (const entry of checksums.entries) {
  if (!packPaths.has(entry.path)) fail(`checksum artifact not declared by pack: ${entry.path}`);
}
if (!packPaths.has("day-001.checksums.json")) fail("pack must declare repository integrity index");

if (!process.exitCode) {
  console.log(`DAY001 QUEST PACK PASS (${checksums.entries.length} source artifacts, release BLOCKED by ${pack.blockers.length} explicit blockers)`);
}
