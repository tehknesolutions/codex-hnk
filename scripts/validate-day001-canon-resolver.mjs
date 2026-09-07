import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dayDir = path.join(root, "docs", "experience", "kether", "day-001");
const quest = JSON.parse(fs.readFileSync(path.join(dayDir, "day-001.quest.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(dayDir, "day-001.canon-blocks.json"), "utf8"));

const fail = (message) => {
  console.error(`DAY001 CANON RESOLVER FAIL: ${message}`);
  process.exitCode = 1;
};

const normalize = (value) => value.replace(/\r\n?/g, "\n").trim();
const wordCount = (value) => {
  const text = normalize(value);
  return text ? text.split(/\s+/u).length : 0;
};
const digest = (value) =>
  crypto.createHash("sha256").update(normalize(value), "utf8").digest("hex");

if (manifest.kind !== "hnk.canon_block_manifest") fail("unexpected manifest kind");
if (manifest.source.blob_sha !== quest.canonical?.source_sha) fail("Quest/manifest source SHA drift");
if (manifest.source.day !== quest.day) fail("Quest/manifest day drift");
if (manifest.source.target_words !== 705) fail("Day 001 canonical target must remain 705");

const blocks = new Map();
for (const block of manifest.blocks ?? []) {
  if (blocks.has(block.id)) fail(`duplicate block id: ${block.id}`);
  blocks.set(block.id, block);
  if (digest(block.text) !== block.sha256) fail(`sha256 drift: ${block.id}`);
  if (wordCount(block.text) !== block.word_count) fail(`word count drift: ${block.id}`);
  if (block.kind === "COUNTED" && wordCount(block.text) !== block.target_words) {
    fail(`editorial target drift: ${block.id}`);
  }
}

const referenced = new Set();
for (const phase of quest.phases ?? []) {
  if (phase.source?.kind !== "CANON") continue;
  for (const id of phase.source.block_ids ?? []) {
    referenced.add(id);
    if (!blocks.has(id)) fail(`Quest references missing canonical block: ${id}`);
  }
}

const coreIds = manifest.counted_core?.block_ids ?? [];
const coreCount = coreIds.reduce((sum, id) => {
  const block = blocks.get(id);
  if (!block) {
    fail(`missing counted core block: ${id}`);
    return sum;
  }
  if (block.kind !== "COUNTED") fail(`core block must be COUNTED: ${id}`);
  return sum + wordCount(block.text);
}, 0);

if (coreCount !== 705) fail(`counted core must equal 705, got ${coreCount}`);
if (manifest.counted_core?.word_count !== 705) fail("manifest counted_core.word_count must equal 705");

for (const auxiliary of ["qr-code-interativo", "espelho-da-alma"]) {
  const block = blocks.get(auxiliary);
  if (!block) fail(`missing auxiliary section: ${auxiliary}`);
  else if (block.kind !== "SECTION") fail(`${auxiliary} must remain SECTION`);
  if (coreIds.includes(auxiliary)) fail(`${auxiliary} must not enter the 705-word counted core`);
}

if (!referenced.has("jachin-doctrine") || !referenced.has("middle-ordalia")) {
  fail("canonical coverage unexpectedly incomplete");
}

if (!process.exitCode) {
  console.log(`DAY001 CANON RESOLVER PASS (${coreCount} counted words, ${referenced.size} referenced blocks)`);
}
