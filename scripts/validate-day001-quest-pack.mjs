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
const visual = json("day-001.visual.manifest.json");
const artDirection = json("day-001.art-direction.json");
const editorial = json("day-001.editorial-reconciliation.json");
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
const backendMigration = "20260908011647_day001_completion_contract_v2";

if (pack.id !== "HNK-KETHER-D001-PACK-V1") fail("unexpected pack id");
if (pack.version !== "1.6.0") fail("Quest Pack version drift");
if (pack.quest_definition_id !== qid) fail("pack quest id drift");
if (pack.completion_contract_id !== cid) fail("pack completion id drift");
if (pack.canonical_source_sha !== sourceSha) fail("pack canonical SHA drift");
if (pack.integrity_state !== "PASS_CONTRACTS_RUNTIME_INTEGRATED") fail("pack runtime integrity state drift");
if (pack.release_state !== "BLOCKED") fail("pack must remain BLOCKED while release blockers exist");
if (!pack.offline?.practice_capable || !pack.offline?.canonical_completion_requires_server) fail("offline policy drift");
if (pack.offline?.binary_assets_ready !== true || pack.offline?.visual_contract_ready !== true) fail("offline asset readiness drift");

for (const [label, value] of [
  ["quest", quest.id],
  ["renderer", renderer.quest_definition_id],
  ["visual", visual.quest_definition_id],
  ["art direction", artDirection.quest_definition_id],
  ["editorial", editorial.quest_definition_id],
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

if (completionService.transport?.deployment_state !== "LIVE") fail("Completion Service V2 must be live");
if (completionService.deployment?.migration !== backendMigration) fail("Completion backend migration id drift");
if (completionService.deployment?.public_rpc_security !== "INVOKER") fail("public Completion V2 security mode drift");
if (completionService.deployment?.privileged_impl_schema !== "hnk_private") fail("private Completion implementation boundary drift");
if (pack.server_completion?.state !== "ACTIVE") fail("Quest Pack server completion state drift");
if (pack.server_completion?.migration !== backendMigration) fail("Quest Pack backend migration drift");
if (pack.server_completion?.public_rpc_security !== "INVOKER") fail("Quest Pack public RPC security drift");
if (pack.server_completion?.legacy_rpc_still_enabled !== true) fail("legacy RPC rollout state drift");

if (assets.asset_layer_ready !== true || assets.release_ready !== true) fail("asset layer readiness drift");
if ((assets.release_blockers ?? []).length !== 0) fail("asset layer must not carry runtime shell blockers");
if (assets.visual_contract !== "day-001.visual.manifest.json") fail("visual contract pointer drift");
if (assets.art_direction !== "day-001.art-direction.json") fail("art direction pointer drift");
if (visual.policy?.server_authoritative_first_spark !== true) fail("visual First Spark authority drift");
if (visual.static_assets?.length !== 3) fail("static visual asset count drift");
if (artDirection.approval_state !== "PRODUCT_V1_FROZEN") fail("art direction freeze drift");
if (artDirection.epistemic_boundary?.canonical_kether_sigil_is_distinct !== true) fail("canonical/product visual boundary drift");
if (artDirection.soul_mirror_field?.status !== "APPROVED_PRODUCT_VISUAL_V1") fail("Soul Mirror product freeze drift");

if (editorial.universal_entry?.state !== "RESOLVED_PRODUCT_LAYER") fail("Universal Entry reconciliation drift");
if (editorial.middle_voice_ordalia?.state !== "CANONICAL_AMENDMENT_PREPARED_SOURCE_WRITE_PENDING") fail("voice amendment state drift");
if (pack.editorial_reconciliation?.universal_entry !== "RESOLVED_PRODUCT_LAYER") fail("Quest Pack editorial state drift");

if (pack.asset_reconciliation?.state !== "ASSET_LAYER_READY") fail("asset reconciliation state drift");
if (pack.asset_reconciliation?.approved_canonical_migrated !== 1) fail("canonical migrated asset count drift");
if (pack.asset_reconciliation?.approved_product_assets !== 3) fail("product asset count drift");
if (pack.asset_reconciliation?.procedural_contract_ready !== 6) fail("procedural visual contract count drift");
if (pack.asset_reconciliation?.needs_derivative_or_visual_review !== 0) fail("visual review backlog must be zero");

if (pack.runtime_integration?.state !== "ACTIVE_GOLDEN_V2") fail("runtime shell integration state drift");
if (pack.runtime_integration?.visual_adapter_bindings !== 7) fail("visual adapter binding count drift");
if (pack.runtime_integration?.completion_rpc_client_cutover !== "COMPLETE_WEB_EXPO_V2") fail("Completion V2 client-cutover state drift");
if (pack.runtime_integration?.apps_present_in_consolidation_repo !== true) fail("consolidation app-shell presence drift");
if (pack.runtime_integration?.runtime_gate !== "scripts/validate-day001-runtime-integration.mjs") fail("runtime validation pointer drift");
if (pack.runtime_integration?.ritual_tone_528 !== "RUNTIME_SYNTHESIS_ACTIVE_WEB_EXPO") fail("runtime 528 state drift");
if (!pack.runtime_integration?.web_entry?.includes("Day001GoldenV2Web")) fail("Web Golden V2 entrypoint drift");
if (!pack.runtime_integration?.mobile_entry?.includes("Day001GoldenV2Mobile")) fail("Mobile Golden V2 entrypoint drift");

for (const capability of ["VISUAL_CONTRACT", "EDITORIAL_RECONCILIATION", "SERVER_COMPLETION", "RITUAL_TONE_528"]) {
  if (!pack.runtime_capabilities?.required?.includes(capability)) fail(`Quest Pack missing capability: ${capability}`);
}
if (audio.profiles?.theta_432?.status !== "CANONICAL_MAPPING_PENDING") fail("Theta/432 mapping was invented or changed");
if (safety.global_rules?.subjective_phenomenon_required !== false) fail("subjective phenomenon cannot become a completion requirement");
if (episteme.protocol_id !== "HNK-EP-1.1") fail("epistemic protocol drift");

const blockerIds = new Set(pack.blockers.map((entry) => entry.id));
for (const blocker of ["EDITORIAL-001-VOICE", "AUDIO-001-THETA-432"]) {
  if (!blockerIds.has(blocker)) fail(`missing release blocker: ${blocker}`);
}
if (blockerIds.size !== 2) fail(`expected exactly 2 remaining blockers, got ${blockerIds.size}`);
for (const resolved of [
  "RUNTIME-001-SHELL-INTEGRATION",
  "EDITORIAL-001-UNIVERSAL-ENTRY",
  "BACKEND-001-COMPLETION-V2",
  "ASSET-001-PROCEDURAL-ADAPTER",
  "ASSET-001-CROWN-DERIVATIVE",
  "ASSET-001-KEY-ART",
  "ASSET-001-SOUL-MIRROR-FINAL",
  "ASSET-001-REGISTRY-RESOLUTION",
  "ASSET-001-PROCEDURAL-EXTRACTION",
]) {
  if (blockerIds.has(resolved)) fail(`resolved/obsolete blocker remains: ${resolved}`);
}
const resolvedIds = new Set((pack.resolved_blockers ?? []).map((entry) => entry.id));
if (!resolvedIds.has("RUNTIME-001-SHELL-INTEGRATION")) fail("resolved runtime blocker ledger missing");

if (pack.ci?.current_state !== "INFRASTRUCTURE_BLOCKED_NO_RUNNER") fail("CI infrastructure state drift");

for (const entry of checksums.entries) {
  const content = read(entry.path);
  const actual = gitBlobSha(content);
  if (actual !== entry.sha) fail(`git blob checksum drift: ${entry.path}`);
}

const packPaths = new Set(pack.files.map((file) => file.path));
for (const entry of checksums.entries) if (!packPaths.has(entry.path)) fail(`checksum artifact not declared by pack: ${entry.path}`);
for (const requiredPath of [
  "day-001.visual.manifest.json",
  "day-001.art-direction.json",
  "day-001.editorial-reconciliation.json",
  "day-001.checksums.json",
]) {
  if (!packPaths.has(requiredPath)) fail(`Quest Pack missing required artifact: ${requiredPath}`);
}

if (!process.exitCode) {
  console.log(`DAY001 QUEST PACK PASS (${checksums.entries.length} source artifacts, runtime integrated, backend LIVE, assets READY, ${pack.blockers.length} release blockers remain)`);
}
