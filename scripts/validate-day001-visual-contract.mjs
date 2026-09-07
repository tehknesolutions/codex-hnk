import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "docs", "experience", "kether", "day-001");
const fail = (message) => {
  console.error(`DAY001 VISUAL CONTRACT FAIL: ${message}`);
  process.exitCode = 1;
};
const json = (name) => JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));

const manifest = json("day-001.visual.manifest.json");
const assets = json("day-001.assets.manifest.json");
const tsSource = fs.readFileSync(path.join(root, "packages", "visual-contract", "src", "day001.ts"), "utf8");

if (manifest.id !== "HNK-KETHER-D001-VISUAL-V1") fail("visual manifest id drift");
if (manifest.quest_definition_id !== "HNK-KETHER-D001-V2") fail("visual manifest quest id drift");
if (manifest.source?.git_blob_sha1 !== "c5f37b1ea2ca985575f497fe4843c0c8f1db006d") fail("legacy visual source SHA drift");
if (manifest.policy?.canonical_claim !== false) fail("procedural interface geometry must not claim canonical status");
if (manifest.policy?.reduced_motion_required !== true) fail("reduced motion must remain mandatory");
if (manifest.policy?.server_authoritative_first_spark !== true) fail("First Spark must remain server-authoritative");

const byKind = new Map(manifest.primitives.map((item) => [item.kind, item]));
const origin = byKind.get("ORIGIN_COSMOS");
if (JSON.stringify(origin?.geometry?.ring_diameters) !== JSON.stringify([270, 178, 86])) fail("OriginCosmos ring geometry drift");
if (origin?.geometry?.axis_height !== 270 || origin?.geometry?.point_diameter !== 10) fail("OriginCosmos axis/point drift");

const boaz = byKind.get("BOAZ_AXIS");
if (JSON.stringify(boaz?.geometry?.node?.tops) !== JSON.stringify([24, 104, 184])) fail("Boaz node positions drift");
if (boaz?.geometry?.node?.rotation_degrees !== 45) fail("Boaz node rotation drift");

const convergence = byKind.get("CONVERGENCE");
if (convergence?.geometry?.left_rotation_degrees !== 9 || convergence?.geometry?.right_rotation_degrees !== -9) fail("Convergence angle drift");

const tree = byKind.get("TREE_FIELD");
if (tree?.geometry?.nodes?.length !== 10) fail("Tree must preserve ten node positions");
if (JSON.stringify(tree?.geometry?.nodes?.[0]) !== JSON.stringify([150, 34])) fail("Kether node position drift");
if (tree?.geometry?.kether_node_index !== 0) fail("Kether must remain node index 0");
if (tree?.state?.first_spark_event !== "KETHER_FIRST_SPARK" || tree?.state?.lit_node_is_server_derived !== true) {
  fail("First Spark state authority drift");
}

const mirror = byKind.get("REFLECTION_FIELD");
if (mirror?.privacy?.prose_destination !== "VAULT_ONLY") fail("Soul Mirror prose must remain Vault-only");
if (mirror?.approval_state !== "DRAFT_FINAL_VISUAL_PENDING") fail("Soul Mirror final visual must not be silently approved");

if (manifest.bindings.length !== 7) fail(`expected 7 procedural visual bindings, got ${manifest.bindings.length}`);
const primitiveIds = new Set(manifest.primitives.map((item) => item.id));
for (const binding of manifest.bindings) {
  if (!primitiveIds.has(binding.primitive_id)) fail(`binding references unknown primitive: ${binding.asset_key}`);
  if (binding.adapter_required !== true) fail(`adapter requirement missing: ${binding.asset_key}`);
}

const assetMap = new Map(assets.entries.map((item) => [item.key, item]));
for (const binding of manifest.bindings) {
  if (assetMap.get(binding.asset_key)?.visual_primitive_id !== binding.primitive_id) {
    fail(`asset/visual binding drift: ${binding.asset_key}`);
  }
}

for (const token of [
  "HNK-D001-VIS-ORIGIN-COSMOS-V1",
  "HNK-D001-VIS-BOAZ-AXIS-V1",
  "HNK-D001-VIS-CONVERGENCE-V1",
  "HNK-D001-VIS-TREE-FIELD-V1",
  "HNK-D001-VIS-REFLECTION-FIELD-V1",
  "KETHER_FIRST_SPARK",
  "VAULT_ONLY",
]) {
  if (!tsSource.includes(token)) fail(`TypeScript visual contract missing token: ${token}`);
}

if (!process.exitCode) {
  console.log("DAY001 VISUAL CONTRACT PASS (5 primitives, 7 bindings, shell adapters pending)");
}
