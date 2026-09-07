import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dayDir = path.join(root, "docs", "experience", "kether", "day-001");
const fail = (message) => {
  console.error(`DAY001 ASSETS FAIL: ${message}`);
  process.exitCode = 1;
};
const json = (name) => JSON.parse(fs.readFileSync(path.join(dayDir, name), "utf8"));
const sha256 = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const quest = json("day-001.quest.json");
const manifest = json("day-001.assets.manifest.json");
const reconciliation = json("day-001.asset-reconciliation.json");

const required = quest.assets?.required ?? [];
const entries = manifest.entries ?? [];
const byKey = new Map(entries.map((entry) => [entry.key, entry]));

if (required.length !== 10) fail(`expected 10 required asset slots, got ${required.length}`);
if (entries.length !== required.length) fail(`asset manifest slot count drift: ${entries.length}`);
for (const key of required) {
  if (!byKey.has(key)) fail(`missing required asset slot: ${key}`);
}
for (const entry of entries) {
  if (!required.includes(entry.key)) fail(`manifest contains undeclared slot: ${entry.key}`);
}

const dai = byKey.get("dai-koo-myo-approved");
if (dai?.status !== "APPROVED_MIGRATED") fail("Dai Koo Myo must remain APPROVED_MIGRATED");
if (dai?.must_not_be_ai_improvised !== true) fail("Dai Koo Myo AI-improvisation guard missing");
const daiPath = path.join(root, dai?.path ?? "");
if (!fs.existsSync(daiPath)) fail("migrated Dai Koo Myo SVG missing");
else if (sha256(daiPath) !== "25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0") {
  fail("Dai Koo Myo SHA-256 drift");
}

const ketherSigil = path.join(root, "assets", "canonical", "kether", "kether-sigil-v1.svg");
if (!fs.existsSync(ketherSigil)) fail("migrated Kether sigil reference missing");
else if (sha256(ketherSigil) !== "7792ad999497f502d29c4377d3497c02241421701e5762ed247c5351fb24320a") {
  fail("Kether sigil SHA-256 drift");
}

const crown = byKey.get("kether-crown-symbol");
if (crown?.status !== "NEEDS_CANONICAL_DERIVATIVE_REVIEW") {
  fail("Kether crown slot must not silently promote Portal 036 sigil to Day 001 crown");
}

for (const key of [
  "kether-origin-background",
  "kether-tree-node",
  "day001-jachin-field",
  "day001-boaz-field",
  "day001-middle-field",
  "first-spark-animation",
]) {
  const entry = byKey.get(key);
  if (!entry?.status?.startsWith("SOURCE_FOUND")) fail(`${key} must retain recovered procedural source state`);
}

if (byKey.get("day001-key-art")?.status === "APPROVED") {
  fail("outdated mockup key art cannot be silently promoted to APPROVED");
}
if (manifest.release_ready !== false) fail("asset manifest must remain non-release-ready while visual blockers exist");

const blockerSet = new Set(manifest.release_blockers ?? []);
for (const blocker of [
  "ASSET-001-CROWN-DERIVATIVE",
  "ASSET-001-KEY-ART",
  "ASSET-001-PROCEDURAL-EXTRACTION",
  "ASSET-001-SOUL-MIRROR-FINAL",
]) {
  if (!blockerSet.has(blocker)) fail(`missing asset blocker: ${blocker}`);
}

if (reconciliation.summary?.required_slots !== 10) fail("reconciliation slot total drift");
if (reconciliation.summary?.approved_migrated !== 1) fail("approved migrated count drift");
if (reconciliation.summary?.procedural_source_found !== 6) fail("procedural source count drift");
if (reconciliation.summary?.needs_derivative_or_visual_review !== 3) fail("visual review count drift");

if (!process.exitCode) {
  console.log("DAY001 ASSETS PASS (1 approved migrated, 6 procedural sources recovered, 3 final visual decisions pending)");
}
