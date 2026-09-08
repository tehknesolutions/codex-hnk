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
const visual = json("day-001.visual.manifest.json");
const artDirection = json("day-001.art-direction.json");

const required = quest.assets?.required ?? [];
const entries = manifest.entries ?? [];
const byKey = new Map(entries.map((entry) => [entry.key, entry]));

if (required.length !== 10) fail(`expected 10 required asset slots, got ${required.length}`);
if (entries.length !== required.length) fail(`asset manifest slot count drift: ${entries.length}`);
for (const key of required) if (!byKey.has(key)) fail(`missing required asset slot: ${key}`);
for (const entry of entries) if (!required.includes(entry.key)) fail(`manifest contains undeclared slot: ${entry.key}`);

const dai = byKey.get("dai-koo-myo-approved");
if (dai?.status !== "APPROVED_MIGRATED") fail("Dai Koo Myo must remain APPROVED_MIGRATED");
if (dai?.must_not_be_ai_improvised !== true) fail("Dai Koo Myo AI-improvisation guard missing");
const daiPath = path.join(root, dai?.path ?? "");
if (!fs.existsSync(daiPath)) fail("migrated Dai Koo Myo SVG missing");
else if (sha256(daiPath) !== "25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0") fail("Dai Koo Myo SHA-256 drift");

const ketherSigil = path.join(root, "assets", "canonical", "kether", "kether-sigil-v1.svg");
if (!fs.existsSync(ketherSigil)) fail("migrated Kether sigil reference missing");
else if (sha256(ketherSigil) !== "7792ad999497f502d29c4377d3497c02241421701e5762ed247c5351fb24320a") fail("Kether sigil SHA-256 drift");

const crown = byKey.get("kether-crown-symbol");
if (crown?.status !== "APPROVED_PRODUCT_DERIVATIVE_V1") fail("Day 001 crown derivative approval drift");
if (crown?.canonical_asset !== false) fail("Day 001 crown must never be flagged canonical");
const crownPath = path.join(root, crown?.path ?? "");
if (!fs.existsSync(crownPath)) fail("Day 001 crown derivative missing");
else if (sha256(crownPath) !== "62643446db75e6f22c492a07bc7cb434c0aa365429417795fa414c29b9a08801") fail("Day 001 crown SHA-256 drift");

const keyArt = byKey.get("day001-key-art");
if (keyArt?.status !== "APPROVED_PRODUCT_KEY_ART_V1") fail("Day 001 key art approval drift");
if (keyArt?.text_free !== true || keyArt?.mutable_copy_embedded !== false || keyArt?.xp_embedded !== false) fail("Day 001 key art mutable-copy guard drift");
const keyArtPath = path.join(root, keyArt?.path ?? "");
if (!fs.existsSync(keyArtPath)) fail("Day 001 key art missing");
else {
  if (sha256(keyArtPath) !== "e194a43156aaed6034eed144e83eb49651629c3aa1858f98503d957730662579") fail("Day 001 key art SHA-256 drift");
  const text = fs.readFileSync(keyArtPath, "utf8");
  if (/<text\b/i.test(text)) fail("Day 001 key art must not contain SVG text nodes");
  if (/\+?\d+\s*XP/i.test(text)) fail("Day 001 key art must not bake XP copy");
}

const mirror = byKey.get("soul-mirror-background");
if (mirror?.status !== "APPROVED_PRODUCT_VISUAL_V1") fail("Soul Mirror visual approval drift");
if (mirror?.text_free !== true || mirror?.private_content_embedded !== false) fail("Soul Mirror privacy/art guard drift");
const mirrorPath = path.join(root, mirror?.path ?? "");
if (!fs.existsSync(mirrorPath)) fail("Soul Mirror field missing");
else {
  if (sha256(mirrorPath) !== "c0370b159d4ce54b3a81ef2c15256667b27b5c9b9f6a6e4c559edeb023c985cc") fail("Soul Mirror SHA-256 drift");
  const text = fs.readFileSync(mirrorPath, "utf8");
  if (/<text\b/i.test(text)) fail("Soul Mirror background must not contain SVG text nodes");
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
  if (entry?.status !== "VISUAL_CONTRACT_READY") fail(`${key} must be frozen as a ready visual contract`);
  if (!entry?.visual_primitive_id) fail(`${key} visual primitive id missing`);
}

if (manifest.visual_contract !== "day-001.visual.manifest.json") fail("asset manifest visual contract pointer drift");
if (manifest.art_direction !== "day-001.art-direction.json") fail("asset manifest art direction pointer drift");
if (manifest.asset_layer_ready !== true || manifest.release_ready !== true) fail("asset layer must remain ready after visual freeze");
if ((manifest.release_blockers ?? []).length !== 0) fail("runtime adapter work must not remain classified as an asset blocker");
if (manifest.runtime_integration?.state !== "SHELL_ADAPTERS_PENDING") fail("runtime integration handoff drift");
if (manifest.runtime_integration?.required_bindings !== 7) fail("runtime adapter binding count drift");
if (visual.bindings?.length !== 7) fail("visual manifest procedural binding count drift");
if (visual.static_assets?.length !== 3) fail("visual manifest static asset count drift");
if (visual.primitives?.find((entry) => entry.id === "HNK-D001-VIS-REFLECTION-FIELD-V1")?.approval_state !== "APPROVED_PRODUCT_VISUAL_V1") fail("Soul Mirror primitive approval drift");
if (artDirection.approval_state !== "PRODUCT_V1_FROZEN") fail("Day 001 art direction freeze drift");
if (artDirection.epistemic_boundary?.canonical_kether_sigil_is_distinct !== true) fail("Kether sigil distinction guard missing");
if (artDirection.soul_mirror_field?.status !== "APPROVED_PRODUCT_VISUAL_V1") fail("Soul Mirror art-direction freeze drift");

if (reconciliation.asset_layer_ready !== true) fail("asset reconciliation must be closed at asset layer");
if (reconciliation.summary?.required_slots !== 10) fail("reconciliation slot total drift");
if (reconciliation.summary?.approved_canonical_migrated !== 1) fail("approved canonical migrated count drift");
if (reconciliation.summary?.approved_product_assets !== 3) fail("approved product asset count drift");
if (reconciliation.summary?.procedural_contract_ready !== 6) fail("procedural contract count drift");
if (reconciliation.summary?.needs_derivative_or_visual_review !== 0) fail("visual review backlog must be zero after V1 freeze");
if (reconciliation.summary?.runtime_adapter_bindings_pending !== 7) fail("runtime adapter binding count drift");

if (!process.exitCode) {
  console.log("DAY001 ASSETS PASS (asset layer ready; 7 shell adapter bindings tracked as runtime integration)");
}
