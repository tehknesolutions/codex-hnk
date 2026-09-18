import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  compareResearchWorkspaceSnapshots,
  validateResearchWorkspaceSnapshot,
} from "@hnk/research-workspace-snapshot";

export const HNK_WORKSPACE_SNAPSHOT_REGISTRY_ID =
  "HNK_WORKSPACE_SNAPSHOT_REGISTRY_V1";
export const HNK_WORKSPACE_SNAPSHOT_REGISTRY_VERSION = "1.0.0";
export const HNK_WORKSPACE_SNAPSHOT_REGISTRY_BOUNDARY =
  "SNAPSHOT_REGISTRY_CATALOGS_CHECKPOINT_LINEAGE_AND_HEAD_POINTER_NOT_TRUTH_REVIEW_DECISION_OR_CANON";

const HEX_64 = /^[0-9a-f]{64}$/;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function nonEmpty(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function cleanString(value, field) {
  if (!nonEmpty(value)) throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}

function recordProjection(record) {
  const projected = clone(record);
  delete projected.record_digest;
  return projected;
}

function recordDigest(record) {
  return sha256Canonical(recordProjection(record));
}

function eventProjection(event) {
  const projected = clone(event);
  delete projected.event_digest;
  return projected;
}

function eventDigest(event) {
  return sha256Canonical(eventProjection(event));
}

export function workspaceSnapshotRegistryProjection(registry) {
  const projected = clone(registry);
  delete projected.registry_digest;
  return deepFreeze(projected);
}

function registryDigest(registry) {
  return sha256Canonical(workspaceSnapshotRegistryProjection(registry));
}

function bySnapshotDigest(registry) {
  return new Map(
    registry.snapshots.map((record) => [record.snapshot_digest, record]),
  );
}

function currentHeadFromEvents(events) {
  return events.length ? events.at(-1).to_snapshot_digest : null;
}

function recordForDigest(registry, digest) {
  const record = registry.snapshots.find(
    (item) => item.snapshot_digest === digest,
  );
  if (!record) throw new Error(`snapshot ${digest} not registered`);
  return record;
}

export function createWorkspaceSnapshotRegistry(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("workspace snapshot registry input required");
  }

  const registry = {
    registry_id: HNK_WORKSPACE_SNAPSHOT_REGISTRY_ID,
    registry_version: HNK_WORKSPACE_SNAPSHOT_REGISTRY_VERSION,
    authority: "HNK_AUTHORED_WORKSPACE_SNAPSHOT_REGISTRY",
    registry_key: cleanString(input.registry_key, "registry_key"),
    title: cleanString(input.title, "title"),
    created_at: cleanString(input.created_at, "created_at"),
    snapshots: [],
    head_events: [],
    head_snapshot_digest: null,
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    immutable_snapshot_history: true,
    explicit_head_move_required: true,
    machine_can_choose_head: false,
    automatic_truth_inference: false,
    machine_can_decide_review: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_WORKSPACE_SNAPSHOT_REGISTRY_BOUNDARY,
  };

  registry.registry_digest = registryDigest(registry);

  const validation = validateWorkspaceSnapshotRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `invalid workspace snapshot registry: ${validation.issues.join("; ")}`,
    );
  }

  return deepFreeze(registry);
}

export function registerWorkspaceSnapshot(registry, input) {
  const validation = validateWorkspaceSnapshotRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot extend invalid workspace snapshot registry: ${validation.issues.join("; ")}`,
    );
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("workspace snapshot registration input required");
  }

  const snapshotValidation = validateResearchWorkspaceSnapshot(input.snapshot);
  if (!snapshotValidation.ok) {
    throw new Error(
      `invalid workspace snapshot: ${snapshotValidation.issues.join("; ")}`,
    );
  }

  if (
    registry.snapshots.some(
      (record) => record.snapshot_digest === input.snapshot.snapshot_digest,
    )
  ) {
    throw new Error(
      `snapshot digest ${input.snapshot.snapshot_digest} is already registered`,
    );
  }

  if (
    input.snapshot.parent_snapshot_digest !== null &&
    !registry.snapshots.some(
      (record) =>
        record.snapshot_digest === input.snapshot.parent_snapshot_digest,
    )
  ) {
    throw new Error(
      `parent snapshot ${input.snapshot.parent_snapshot_digest} must be registered before child ${input.snapshot.snapshot_digest}`,
    );
  }

  const record = {
    record_id: `SNAPSHOT:${input.snapshot.snapshot_digest}`,
    snapshot_digest: input.snapshot.snapshot_digest,
    snapshot_key: input.snapshot.snapshot_key,
    label: input.snapshot.label,
    snapshot_created_at: input.snapshot.created_at,
    parent_snapshot_digest: input.snapshot.parent_snapshot_digest,
    registered_at: cleanString(input.registered_at, "registered_at"),
    snapshot: clone(input.snapshot),
    record_digest: "",
  };
  record.record_digest = recordDigest(record);

  const next = clone(registry);
  next.snapshots.push(record);
  next.registry_digest = registryDigest(next);

  const nextValidation = validateWorkspaceSnapshotRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(
      `snapshot registration produced invalid registry: ${nextValidation.issues.join("; ")}`,
    );
  }

  return deepFreeze(next);
}

export function moveWorkspaceSnapshotHead(registry, input) {
  const validation = validateWorkspaceSnapshotRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot move HEAD in invalid workspace snapshot registry: ${validation.issues.join("; ")}`,
    );
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("workspace HEAD move input required");
  }

  const toDigest = cleanString(input.to_snapshot_digest, "to_snapshot_digest");
  if (!HEX_64.test(toDigest)) {
    throw new TypeError("to_snapshot_digest must be SHA-256 hex");
  }
  recordForDigest(registry, toDigest);

  const fromDigest = registry.head_snapshot_digest;
  if (fromDigest === toDigest) {
    throw new Error(`HEAD already points to snapshot ${toDigest}`);
  }

  const event = {
    event_id: `HEAD:${registry.head_events.length + 1}:${toDigest.slice(0, 16)}`,
    from_snapshot_digest: fromDigest,
    to_snapshot_digest: toDigest,
    moved_at: cleanString(input.moved_at, "moved_at"),
    reason: cleanString(input.reason, "reason"),
    explicit_human_signal: cleanString(
      input.explicit_human_signal,
      "explicit_human_signal",
    ),
    event_digest: "",
  };
  event.event_digest = eventDigest(event);

  const next = clone(registry);
  next.head_events.push(event);
  next.head_snapshot_digest = toDigest;
  next.registry_digest = registryDigest(next);

  const nextValidation = validateWorkspaceSnapshotRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(
      `HEAD move produced invalid registry: ${nextValidation.issues.join("; ")}`,
    );
  }

  return deepFreeze(next);
}

function validateSnapshotRecord(record, issues, seenDigests, seenIds) {
  if (!record || typeof record !== "object") {
    issues.push("snapshot record must be object");
    return;
  }

  for (const field of [
    "record_id",
    "snapshot_digest",
    "snapshot_key",
    "label",
    "snapshot_created_at",
    "registered_at",
    "record_digest",
  ]) {
    if (!nonEmpty(record[field])) {
      issues.push(`snapshot record ${field} required`);
    }
  }

  if (!HEX_64.test(record.snapshot_digest ?? "")) {
    issues.push(`${record.record_id}: snapshot_digest must be SHA-256 hex`);
  }
  if (
    record.parent_snapshot_digest !== null &&
    !HEX_64.test(record.parent_snapshot_digest ?? "")
  ) {
    issues.push(
      `${record.record_id}: parent_snapshot_digest must be null or SHA-256 hex`,
    );
  }
  if (!HEX_64.test(record.record_digest ?? "")) {
    issues.push(`${record.record_id}: record_digest must be SHA-256 hex`);
  }

  const snapshotValidation = validateResearchWorkspaceSnapshot(record.snapshot);
  if (!snapshotValidation.ok) {
    issues.push(
      ...snapshotValidation.issues.map(
        (issue) => `${record.record_id}: snapshot: ${issue}`,
      ),
    );
  } else {
    if (record.snapshot.snapshot_digest !== record.snapshot_digest) {
      issues.push(`${record.record_id}: embedded snapshot digest drift`);
    }
    if (record.snapshot.snapshot_key !== record.snapshot_key) {
      issues.push(`${record.record_id}: snapshot_key drift`);
    }
    if (record.snapshot.label !== record.label) {
      issues.push(`${record.record_id}: label drift`);
    }
    if (record.snapshot.created_at !== record.snapshot_created_at) {
      issues.push(`${record.record_id}: snapshot_created_at drift`);
    }
    if (
      record.snapshot.parent_snapshot_digest !== record.parent_snapshot_digest
    ) {
      issues.push(`${record.record_id}: parent snapshot drift`);
    }
  }

  if (
    HEX_64.test(record.record_digest ?? "") &&
    recordDigest(record) !== record.record_digest
  ) {
    issues.push(`${record.record_id}: record_digest mismatch`);
  }

  if (seenDigests.has(record.snapshot_digest)) {
    issues.push(`duplicate snapshot_digest ${record.snapshot_digest}`);
  }
  seenDigests.add(record.snapshot_digest);

  if (seenIds.has(record.record_id)) {
    issues.push(`duplicate record_id ${record.record_id}`);
  }
  seenIds.add(record.record_id);
}

function validateGraph(records, issues) {
  const byDigest = new Map(
    records.map((record) => [record.snapshot_digest, record]),
  );

  for (const record of records) {
    if (
      record.parent_snapshot_digest !== null &&
      !byDigest.has(record.parent_snapshot_digest)
    ) {
      issues.push(
        `${record.record_id}: orphan parent ${record.parent_snapshot_digest}`,
      );
    }
  }

  for (const record of records) {
    const seen = new Set();
    let cursor = record;
    while (cursor?.parent_snapshot_digest !== null) {
      if (seen.has(cursor.snapshot_digest)) {
        issues.push(`${record.record_id}: lineage cycle detected`);
        break;
      }
      seen.add(cursor.snapshot_digest);
      cursor = byDigest.get(cursor.parent_snapshot_digest);
      if (!cursor) break;
    }
  }
}

function validateHeadEvents(registry, issues) {
  const known = new Set(
    registry.snapshots.map((record) => record.snapshot_digest),
  );

  let expectedFrom = null;
  const eventIds = new Set();

  for (const event of registry.head_events) {
    if (!event || typeof event !== "object") {
      issues.push("HEAD event must be object");
      continue;
    }

    for (const field of [
      "event_id",
      "to_snapshot_digest",
      "moved_at",
      "reason",
      "explicit_human_signal",
      "event_digest",
    ]) {
      if (!nonEmpty(event[field])) issues.push(`HEAD event ${field} required`);
    }

    if (
      event.from_snapshot_digest !== null &&
      !HEX_64.test(event.from_snapshot_digest ?? "")
    ) {
      issues.push(
        `${event.event_id}: from_snapshot_digest must be null or SHA-256 hex`,
      );
    }
    if (!HEX_64.test(event.to_snapshot_digest ?? "")) {
      issues.push(`${event.event_id}: to_snapshot_digest must be SHA-256 hex`);
    }
    if (!HEX_64.test(event.event_digest ?? "")) {
      issues.push(`${event.event_id}: event_digest must be SHA-256 hex`);
    }

    if (event.from_snapshot_digest !== expectedFrom) {
      issues.push(
        `${event.event_id}: HEAD event chain drift; expected from ${expectedFrom ?? "null"}`,
      );
    }
    if (!known.has(event.to_snapshot_digest)) {
      issues.push(
        `${event.event_id}: HEAD target ${event.to_snapshot_digest} not registered`,
      );
    }
    if (
      event.from_snapshot_digest !== null &&
      !known.has(event.from_snapshot_digest)
    ) {
      issues.push(
        `${event.event_id}: HEAD source ${event.from_snapshot_digest} not registered`,
      );
    }
    if (event.from_snapshot_digest === event.to_snapshot_digest) {
      issues.push(`${event.event_id}: HEAD no-op event forbidden`);
    }
    if (
      HEX_64.test(event.event_digest ?? "") &&
      eventDigest(event) !== event.event_digest
    ) {
      issues.push(`${event.event_id}: event_digest mismatch`);
    }
    if (eventIds.has(event.event_id)) {
      issues.push(`duplicate HEAD event_id ${event.event_id}`);
    }
    eventIds.add(event.event_id);

    expectedFrom = event.to_snapshot_digest;
  }

  const derived = currentHeadFromEvents(registry.head_events);
  if (registry.head_snapshot_digest !== derived) {
    issues.push(
      `head_snapshot_digest drift; expected ${derived ?? "null"}`,
    );
  }
}

export function validateWorkspaceSnapshotRegistry(registry) {
  const issues = [];

  if (!registry || typeof registry !== "object") {
    return deepFreeze({ ok: false, issues: ["registry must be object"] });
  }

  if (registry.registry_id !== HNK_WORKSPACE_SNAPSHOT_REGISTRY_ID) {
    issues.push(`unexpected registry_id ${registry.registry_id}`);
  }
  if (
    registry.registry_version !== HNK_WORKSPACE_SNAPSHOT_REGISTRY_VERSION
  ) {
    issues.push(`unexpected registry_version ${registry.registry_version}`);
  }
  if (registry.authority !== "HNK_AUTHORED_WORKSPACE_SNAPSHOT_REGISTRY") {
    issues.push(`unexpected authority ${registry.authority}`);
  }

  for (const field of ["registry_key", "title", "created_at"]) {
    if (!nonEmpty(registry[field])) issues.push(`${field} required`);
  }

  if (!Array.isArray(registry.snapshots)) {
    issues.push("snapshots must be array");
  } else {
    const seenDigests = new Set();
    const seenIds = new Set();
    for (const record of registry.snapshots) {
      validateSnapshotRecord(record, issues, seenDigests, seenIds);
    }
    validateGraph(registry.snapshots, issues);
  }

  if (!Array.isArray(registry.head_events)) {
    issues.push("head_events must be array");
  } else if (Array.isArray(registry.snapshots)) {
    validateHeadEvents(registry, issues);
  }

  if (
    registry.head_snapshot_digest !== null &&
    !HEX_64.test(registry.head_snapshot_digest ?? "")
  ) {
    issues.push("head_snapshot_digest must be null or SHA-256 hex");
  }

  if (registry.persistence !== "USER_CONTROLLED_FILE_ONLY") {
    issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  }
  if (registry.server_persistence !== false) {
    issues.push("server_persistence must remain false");
  }
  if (registry.browser_persistence !== false) {
    issues.push("browser_persistence must remain false");
  }
  if (registry.immutable_snapshot_history !== true) {
    issues.push("immutable_snapshot_history must remain true");
  }
  if (registry.explicit_head_move_required !== true) {
    issues.push("explicit_head_move_required must remain true");
  }
  if (registry.machine_can_choose_head !== false) {
    issues.push("machine_can_choose_head must remain false");
  }
  if (registry.automatic_truth_inference !== false) {
    issues.push("automatic_truth_inference must remain false");
  }
  if (registry.machine_can_decide_review !== false) {
    issues.push("machine_can_decide_review must remain false");
  }
  if (registry.automatic_canon_promotion !== false) {
    issues.push("automatic_canon_promotion must remain false");
  }
  if (registry.canon_promotion_permitted !== false) {
    issues.push("canon_promotion_permitted must remain false");
  }
  if (registry.claim_boundary !== HNK_WORKSPACE_SNAPSHOT_REGISTRY_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${registry.claim_boundary}`);
  }

  if (!HEX_64.test(registry.registry_digest ?? "")) {
    issues.push("registry_digest must be SHA-256 hex");
  } else if (registryDigest(registry) !== registry.registry_digest) {
    issues.push("registry_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function workspaceSnapshotRegistryIndex(registry) {
  const validation = validateWorkspaceSnapshotRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot index invalid workspace snapshot registry: ${validation.issues.join("; ")}`,
    );
  }

  const children = new Map(
    registry.snapshots.map((record) => [record.snapshot_digest, []]),
  );

  for (const record of registry.snapshots) {
    if (record.parent_snapshot_digest !== null) {
      children.get(record.parent_snapshot_digest).push(record.snapshot_digest);
    }
  }

  const roots = registry.snapshots
    .filter((record) => record.parent_snapshot_digest === null)
    .map((record) => record.snapshot_digest);

  const tips = registry.snapshots
    .filter((record) => children.get(record.snapshot_digest).length === 0)
    .map((record) => record.snapshot_digest);

  const forks = [...children.entries()]
    .filter(([, childDigests]) => childDigests.length > 1)
    .map(([parentDigest, childDigests]) => ({
      parent_snapshot_digest: parentDigest,
      child_snapshot_digests: [...childDigests],
    }));

  return deepFreeze({
    registry_key: registry.registry_key,
    snapshot_count: registry.snapshots.length,
    root_count: roots.length,
    tip_count: tips.length,
    fork_count: forks.length,
    head_snapshot_digest: registry.head_snapshot_digest,
    roots,
    tips,
    forks,
    timeline: clone(registry.snapshots),
    head_history: clone(registry.head_events),
    orphan_count: 0,
    truth_assessed: false,
    canon_promotion_permitted: false,
  });
}

export function workspaceSnapshotAncestry(registry, snapshotDigest) {
  const validation = validateWorkspaceSnapshotRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot trace invalid workspace snapshot registry: ${validation.issues.join("; ")}`,
    );
  }

  const digest = cleanString(snapshotDigest, "snapshotDigest");
  const map = bySnapshotDigest(registry);
  let cursor = map.get(digest);
  if (!cursor) throw new Error(`snapshot ${digest} not registered`);

  const reverse = [];
  while (cursor) {
    reverse.push(cursor.snapshot_digest);
    if (cursor.parent_snapshot_digest === null) break;
    cursor = map.get(cursor.parent_snapshot_digest);
  }

  const path = reverse.reverse();

  return deepFreeze({
    snapshot_digest: digest,
    root_snapshot_digest: path[0],
    path_root_to_snapshot: path,
    depth: path.length - 1,
  });
}

export function compareRegisteredWorkspaceSnapshots(
  registry,
  leftDigest,
  rightDigest,
) {
  const validation = validateWorkspaceSnapshotRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot compare snapshots in invalid registry: ${validation.issues.join("; ")}`,
    );
  }

  const left = recordForDigest(
    registry,
    cleanString(leftDigest, "leftDigest"),
  );
  const right = recordForDigest(
    registry,
    cleanString(rightDigest, "rightDigest"),
  );

  return compareResearchWorkspaceSnapshots(left.snapshot, right.snapshot);
}

export function serializeWorkspaceSnapshotRegistry(registry) {
  const validation = validateWorkspaceSnapshotRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot serialize invalid workspace snapshot registry: ${validation.issues.join("; ")}`,
    );
  }

  return `${JSON.stringify(registry, null, 2)}\n`;
}

export function parseWorkspaceSnapshotRegistry(text) {
  if (!nonEmpty(text)) {
    throw new TypeError("workspace snapshot registry JSON text required");
  }

  let registry;
  try {
    registry = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid workspace snapshot registry JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateWorkspaceSnapshotRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `invalid workspace snapshot registry: ${validation.issues.join("; ")}`,
    );
  }

  return deepFreeze(registry);
}

export function workspaceSnapshotRegistrySummary() {
  return deepFreeze({
    registry_id: HNK_WORKSPACE_SNAPSHOT_REGISTRY_ID,
    version: HNK_WORKSPACE_SNAPSHOT_REGISTRY_VERSION,
    identity: "SNAPSHOT_DIGEST",
    parent_must_be_registered_first: true,
    orphan_snapshots_permitted: false,
    forks_permitted_and_detected: true,
    timeline: true,
    ancestry: true,
    compare_any_registered_pair: true,
    explicit_head_move_required: true,
    head_event_history: true,
    machine_can_choose_head: false,
    immutable_snapshot_history: true,
    persistence: "USER_CONTROLLED_FILE_ONLY",
    automatic_truth_inference: false,
    machine_can_decide_review: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_WORKSPACE_SNAPSHOT_REGISTRY_BOUNDARY,
  });
}
