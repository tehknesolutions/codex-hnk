import fs from "node:fs";
import {
  HNK_WORKSPACE_SNAPSHOT_REGISTRY_BOUNDARY,
  compareRegisteredWorkspaceSnapshots,
  createClaimReevaluationQueue,
  createResearchArtifactLibrary,
  createResearchWorkspaceSnapshot,
  createReviewedClaimRegistry,
  createWorkspaceSnapshotRegistry,
  moveWorkspaceSnapshotHead,
  registerWorkspaceSnapshot,
  validateWorkspaceSnapshotRegistry,
  workspaceSnapshotAncestry,
  workspaceSnapshotRegistryIndex,
  workspaceSnapshotRegistrySummary,
} from "@hnk/quest-engine";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function components(suffix) {
  return {
    artifact_library: createResearchArtifactLibrary({
      library_key: `REGISTRY-LIB-${suffix}`,
      title: `Library ${suffix}`,
      created_at: "2026-09-18T10:00:00Z",
    }),
    reviewed_claim_registry: createReviewedClaimRegistry({
      registry_key: `REGISTRY-REVIEWED-${suffix}`,
      title: `Reviewed ${suffix}`,
      created_at: "2026-09-18T10:00:00Z",
    }),
    claim_reevaluation_queue: createClaimReevaluationQueue({
      queue_key: `REGISTRY-QUEUE-${suffix}`,
      title: `Queue ${suffix}`,
      created_at: "2026-09-18T10:00:00Z",
    }),
  };
}

const root = createResearchWorkspaceSnapshot({
  snapshot_key: "REGISTRY-ROOT",
  label: "Registry root",
  created_at: "2026-09-18T10:10:00Z",
  ...components("ROOT"),
});
const left = createResearchWorkspaceSnapshot({
  snapshot_key: "REGISTRY-LEFT",
  label: "Registry left",
  created_at: "2026-09-18T10:20:00Z",
  parent_snapshot_digest: root.snapshot_digest,
  ...components("LEFT"),
});
const right = createResearchWorkspaceSnapshot({
  snapshot_key: "REGISTRY-RIGHT",
  label: "Registry right",
  created_at: "2026-09-18T10:21:00Z",
  parent_snapshot_digest: root.snapshot_digest,
  ...components("RIGHT"),
});

let registry = createWorkspaceSnapshotRegistry({
  registry_key: "HNK-WORKSPACE-TIMELINE-VALIDATOR",
  title: "Workspace timeline validator",
  created_at: "2026-09-18T10:00:00Z",
});

let orphanRejected = false;
try {
  registerWorkspaceSnapshot(registry, {
    snapshot: left,
    registered_at: "2026-09-18T10:22:00Z",
  });
} catch {
  orphanRejected = true;
}
if (!orphanRejected) issues.push("child snapshot must not register before its parent");

for (const [snapshot, registeredAt] of [
  [root, "2026-09-18T10:11:00Z"],
  [left, "2026-09-18T10:22:00Z"],
  [right, "2026-09-18T10:23:00Z"],
]) {
  registry = registerWorkspaceSnapshot(registry, {
    snapshot,
    registered_at: registeredAt,
  });
}

let validation = validateWorkspaceSnapshotRegistry(registry);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `registry: ${issue}`));

let index = workspaceSnapshotRegistryIndex(registry);
if (index.snapshot_count !== 3) issues.push("snapshot registry must contain all three checkpoints");
if (index.root_count !== 1) issues.push("snapshot registry must detect one root");
if (index.tip_count !== 2) issues.push("snapshot registry must detect two fork tips");
if (index.fork_count !== 1) issues.push("snapshot registry must detect one fork");
if (index.orphan_count !== 0) issues.push("snapshot registry must preserve zero-orphan invariant");
if (index.head_snapshot_digest !== null) issues.push("snapshot registration must not auto-select HEAD");

registry = moveWorkspaceSnapshotHead(registry, {
  to_snapshot_digest: left.snapshot_digest,
  moved_at: "2026-09-18T10:30:00Z",
  reason: "Human selects left research branch",
  explicit_human_signal: "SET HEAD LEFT",
});
registry = moveWorkspaceSnapshotHead(registry, {
  to_snapshot_digest: right.snapshot_digest,
  moved_at: "2026-09-18T10:31:00Z",
  reason: "Human explicitly switches to right fork",
  explicit_human_signal: "SET HEAD RIGHT",
});

validation = validateWorkspaceSnapshotRegistry(registry);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `headed registry: ${issue}`));
index = workspaceSnapshotRegistryIndex(registry);
if (index.head_snapshot_digest !== right.snapshot_digest) issues.push("HEAD must equal last explicit target");
if (index.head_history.length !== 2) issues.push("HEAD event history must be append-only");
if (registry.machine_can_choose_head !== false) issues.push("machine_can_choose_head lock drift");

const ancestry = workspaceSnapshotAncestry(registry, left.snapshot_digest);
if (ancestry.depth !== 1 || ancestry.root_snapshot_digest !== root.snapshot_digest) {
  issues.push("snapshot ancestry root/depth incorrect");
}

const comparison = compareRegisteredWorkspaceSnapshots(
  registry,
  root.snapshot_digest,
  left.snapshot_digest,
);
if (comparison.lineage_relation !== "LEFT_PARENT_OF_RIGHT") {
  issues.push("registered pair comparison must preserve snapshot direct lineage");
}
if (comparison.truth_assessed !== false || comparison.canon_promotion_permitted !== false) {
  issues.push("registered comparison must not assess truth or permit canon promotion");
}

const summary = workspaceSnapshotRegistrySummary();
if (summary.registry_id !== "HNK_WORKSPACE_SNAPSHOT_REGISTRY_V1") issues.push("unexpected snapshot registry id");
if (summary.parent_must_be_registered_first !== true) issues.push("parent-first rule drift");
if (summary.forks_permitted_and_detected !== true) issues.push("fork detection lock drift");
if (summary.explicit_head_move_required !== true) issues.push("explicit HEAD rule drift");
if (summary.machine_can_choose_head !== false) issues.push("machine HEAD authority drift");
if (summary.claim_boundary !== HNK_WORKSPACE_SNAPSHOT_REGISTRY_BOUNDARY) issues.push("snapshot registry boundary drift");

const page = read("apps/web/app/research/workspace-snapshot-registry/page.tsx");
const client = read("apps/web/app/research/workspace-snapshot-registry/WorkspaceSnapshotRegistryLab.tsx");
const route = read("apps/web/app/api/research/workspace-snapshot-registry/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/research-workspace-snapshot-registry.ts");
const docs = read("docs/architecture/HNK_WORKSPACE_SNAPSHOT_REGISTRY_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Snapshot Registry page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Snapshot Registry Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Snapshot Registry API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Snapshot Registry API must declare no automatic persistence");
if (!client.includes("registerWorkspaceSnapshot")) issues.push("Snapshot Registry Lab must register through shared contract");
if (!client.includes("moveWorkspaceSnapshotHead")) issues.push("Snapshot Registry Lab must move HEAD through shared contract");
if (!client.includes("compareRegisteredWorkspaceSnapshots")) issues.push("Snapshot Registry Lab must compare through shared contract");
if (!client.includes("workspaceSnapshotAncestry")) issues.push("Snapshot Registry Lab must trace ancestry through shared contract");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) {
  issues.push("Snapshot Registry Lab must not auto-persist in browser storage");
}
if (!hub.includes('href="/research/workspace-snapshot-registry"')) issues.push("Research hub must link Snapshot Registry");
if (!hub.includes("SNAPSHOT REGISTRY")) issues.push("Research pipeline must include Snapshot Registry");
if (!adapter.includes('from "@hnk/research-workspace-snapshot-registry"')) issues.push("Quest Engine must delegate Snapshot Registry to shared package");
if (!docs.includes("There is no automatic path from Snapshot Registry HEAD to HNK_CANON")) {
  issues.push("Snapshot Registry documentation must preserve no-auto-canon boundary");
}

if (issues.length) {
  console.error("HNK_WORKSPACE_SNAPSHOT_REGISTRY_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_WORKSPACE_SNAPSHOT_REGISTRY_V1_PASS");
console.log(JSON.stringify({
  registry_id: summary.registry_id,
  snapshots: index.snapshot_count,
  roots: index.root_count,
  tips: index.tip_count,
  forks: index.fork_count,
  head_snapshot_digest: index.head_snapshot_digest,
  head_events: index.head_history.length,
  machine_can_choose_head: registry.machine_can_choose_head,
  canon_promotion_permitted: registry.canon_promotion_permitted,
}, null, 2));
