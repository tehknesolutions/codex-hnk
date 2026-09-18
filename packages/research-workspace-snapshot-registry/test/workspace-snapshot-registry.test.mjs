import test from "node:test";
import assert from "node:assert/strict";
import {
  compareRegisteredWorkspaceSnapshots,
  createWorkspaceSnapshotRegistry,
  moveWorkspaceSnapshotHead,
  parseWorkspaceSnapshotRegistry,
  registerWorkspaceSnapshot,
  serializeWorkspaceSnapshotRegistry,
  validateWorkspaceSnapshotRegistry,
  workspaceSnapshotAncestry,
  workspaceSnapshotRegistryIndex,
} from "../src/index.mjs";
import { createClaimReevaluationQueue } from "@hnk/claim-reevaluation-queue";
import { createResearchArtifactLibrary } from "@hnk/research-artifact-library";
import {
  createResearchWorkspaceSnapshot,
} from "@hnk/research-workspace-snapshot";
import { createReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";

function components(suffix = "") {
  return {
    artifact_library: createResearchArtifactLibrary({
      library_key: `LIB${suffix}`,
      title: `Artifacts ${suffix || "root"}`,
      created_at: "2026-09-18T10:00:00Z",
    }),
    reviewed_claim_registry: createReviewedClaimRegistry({
      registry_key: `REVIEWED${suffix}`,
      title: `Reviewed ${suffix || "root"}`,
      created_at: "2026-09-18T10:00:00Z",
    }),
    claim_reevaluation_queue: createClaimReevaluationQueue({
      queue_key: `QUEUE${suffix}`,
      title: `Queue ${suffix || "root"}`,
      created_at: "2026-09-18T10:00:00Z",
    }),
  };
}

function snapshot({
  key,
  label,
  at,
  parent = null,
  componentSuffix = "",
}) {
  return createResearchWorkspaceSnapshot({
    snapshot_key: key,
    label,
    created_at: at,
    parent_snapshot_digest: parent,
    ...components(componentSuffix),
  });
}

test("registry keeps immutable snapshot timeline and requires registered parents", () => {
  const root = snapshot({
    key: "S1",
    label: "Root",
    at: "2026-09-18T10:10:00Z",
  });
  const child = snapshot({
    key: "S2",
    label: "Child",
    at: "2026-09-18T10:20:00Z",
    parent: root.snapshot_digest,
    componentSuffix: "-child",
  });

  let registry = createWorkspaceSnapshotRegistry({
    registry_key: "TIMELINE",
    title: "Workspace timeline",
    created_at: "2026-09-18T10:00:00Z",
  });

  assert.throws(() => registerWorkspaceSnapshot(registry, {
    snapshot: child,
    registered_at: "2026-09-18T10:21:00Z",
  }), /must be registered before child/);

  registry = registerWorkspaceSnapshot(registry, {
    snapshot: root,
    registered_at: "2026-09-18T10:11:00Z",
  });
  registry = registerWorkspaceSnapshot(registry, {
    snapshot: child,
    registered_at: "2026-09-18T10:21:00Z",
  });

  const index = workspaceSnapshotRegistryIndex(registry);
  assert.equal(index.snapshot_count, 2);
  assert.equal(index.root_count, 1);
  assert.equal(index.tip_count, 1);
  assert.equal(index.fork_count, 0);
  assert.equal(index.orphan_count, 0);
  assert.equal(index.head_snapshot_digest, null);
  assert.deepEqual(index.timeline.map((item) => item.snapshot_key), ["S1", "S2"]);

  const ancestry = workspaceSnapshotAncestry(registry, child.snapshot_digest);
  assert.equal(ancestry.root_snapshot_digest, root.snapshot_digest);
  assert.equal(ancestry.depth, 1);
  assert.deepEqual(ancestry.path_root_to_snapshot, [
    root.snapshot_digest,
    child.snapshot_digest,
  ]);
});

test("forks are permitted, detected, and never silently resolved into HEAD", () => {
  const root = snapshot({
    key: "ROOT",
    label: "Root",
    at: "2026-09-18T10:10:00Z",
  });
  const left = snapshot({
    key: "LEFT",
    label: "Left branch",
    at: "2026-09-18T10:20:00Z",
    parent: root.snapshot_digest,
    componentSuffix: "-left",
  });
  const right = snapshot({
    key: "RIGHT",
    label: "Right branch",
    at: "2026-09-18T10:21:00Z",
    parent: root.snapshot_digest,
    componentSuffix: "-right",
  });

  let registry = createWorkspaceSnapshotRegistry({
    registry_key: "FORKS",
    title: "Fork registry",
    created_at: "2026-09-18T10:00:00Z",
  });

  for (const [value, at] of [
    [root, "2026-09-18T10:11:00Z"],
    [left, "2026-09-18T10:22:00Z"],
    [right, "2026-09-18T10:23:00Z"],
  ]) {
    registry = registerWorkspaceSnapshot(registry, {
      snapshot: value,
      registered_at: at,
    });
  }

  const index = workspaceSnapshotRegistryIndex(registry);
  assert.equal(index.fork_count, 1);
  assert.equal(index.tip_count, 2);
  assert.equal(index.head_snapshot_digest, null);
  assert.deepEqual(
    new Set(index.forks[0].child_snapshot_digests),
    new Set([left.snapshot_digest, right.snapshot_digest]),
  );
});

test("HEAD moves require explicit human signal and preserve event history", () => {
  const root = snapshot({
    key: "ROOT",
    label: "Root",
    at: "2026-09-18T10:10:00Z",
  });
  const child = snapshot({
    key: "CHILD",
    label: "Child",
    at: "2026-09-18T10:20:00Z",
    parent: root.snapshot_digest,
    componentSuffix: "-child",
  });

  let registry = createWorkspaceSnapshotRegistry({
    registry_key: "HEADS",
    title: "HEAD registry",
    created_at: "2026-09-18T10:00:00Z",
  });
  registry = registerWorkspaceSnapshot(registry, {
    snapshot: root,
    registered_at: "2026-09-18T10:11:00Z",
  });
  registry = registerWorkspaceSnapshot(registry, {
    snapshot: child,
    registered_at: "2026-09-18T10:21:00Z",
  });

  assert.throws(() => moveWorkspaceSnapshotHead(registry, {
    to_snapshot_digest: root.snapshot_digest,
    moved_at: "2026-09-18T10:30:00Z",
    reason: "Initialize HEAD",
    explicit_human_signal: "",
  }), /explicit_human_signal/);

  registry = moveWorkspaceSnapshotHead(registry, {
    to_snapshot_digest: root.snapshot_digest,
    moved_at: "2026-09-18T10:30:00Z",
    reason: "Initialize HEAD",
    explicit_human_signal: "SET HEAD ROOT",
  });
  registry = moveWorkspaceSnapshotHead(registry, {
    to_snapshot_digest: child.snapshot_digest,
    moved_at: "2026-09-18T10:31:00Z",
    reason: "Advance to reviewed checkpoint",
    explicit_human_signal: "SET HEAD CHILD",
  });

  const index = workspaceSnapshotRegistryIndex(registry);
  assert.equal(index.head_snapshot_digest, child.snapshot_digest);
  assert.equal(index.head_history.length, 2);
  assert.equal(index.head_history[0].from_snapshot_digest, null);
  assert.equal(index.head_history[1].from_snapshot_digest, root.snapshot_digest);
  assert.equal(index.head_history[1].to_snapshot_digest, child.snapshot_digest);
  assert.throws(() => moveWorkspaceSnapshotHead(registry, {
    to_snapshot_digest: child.snapshot_digest,
    moved_at: "2026-09-18T10:32:00Z",
    reason: "No-op",
    explicit_human_signal: "SET HEAD CHILD AGAIN",
  }), /already points/);
});

test("registered snapshots can be compared through the registry", () => {
  const root = snapshot({
    key: "ROOT",
    label: "Root",
    at: "2026-09-18T10:10:00Z",
  });
  const child = snapshot({
    key: "CHILD",
    label: "Child",
    at: "2026-09-18T10:20:00Z",
    parent: root.snapshot_digest,
    componentSuffix: "-changed",
  });

  let registry = createWorkspaceSnapshotRegistry({
    registry_key: "COMPARE",
    title: "Compare registry",
    created_at: "2026-09-18T10:00:00Z",
  });
  registry = registerWorkspaceSnapshot(registry, {
    snapshot: root,
    registered_at: "2026-09-18T10:11:00Z",
  });
  registry = registerWorkspaceSnapshot(registry, {
    snapshot: child,
    registered_at: "2026-09-18T10:21:00Z",
  });

  const comparison = compareRegisteredWorkspaceSnapshots(
    registry,
    root.snapshot_digest,
    child.snapshot_digest,
  );
  assert.equal(comparison.lineage_relation, "LEFT_PARENT_OF_RIGHT");
  assert.equal(comparison.same_snapshot, false);
  assert.equal(comparison.truth_assessed, false);
  assert.equal(comparison.canon_promotion_permitted, false);
});

test("registry serialization roundtrips and tampering is detected", () => {
  const root = snapshot({
    key: "ROOT",
    label: "Root",
    at: "2026-09-18T10:10:00Z",
  });
  let registry = createWorkspaceSnapshotRegistry({
    registry_key: "INTEGRITY",
    title: "Integrity registry",
    created_at: "2026-09-18T10:00:00Z",
  });
  registry = registerWorkspaceSnapshot(registry, {
    snapshot: root,
    registered_at: "2026-09-18T10:11:00Z",
  });
  registry = moveWorkspaceSnapshotHead(registry, {
    to_snapshot_digest: root.snapshot_digest,
    moved_at: "2026-09-18T10:12:00Z",
    reason: "Select active checkpoint",
    explicit_human_signal: "SET HEAD",
  });

  assert.equal(validateWorkspaceSnapshotRegistry(registry).ok, true);
  assert.deepEqual(
    parseWorkspaceSnapshotRegistry(serializeWorkspaceSnapshotRegistry(registry)),
    registry,
  );

  const tampered = JSON.parse(JSON.stringify(registry));
  tampered.snapshots[0].label = "Tampered";
  const validation = validateWorkspaceSnapshotRegistry(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) =>
    issue.includes("label drift") ||
    issue.includes("record_digest mismatch") ||
    issue.includes("registry_digest mismatch"),
  ));

  assert.throws(() => registerWorkspaceSnapshot(registry, {
    snapshot: root,
    registered_at: "2026-09-18T10:13:00Z",
  }), /already registered/);
});
