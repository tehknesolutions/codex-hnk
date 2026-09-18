import {
  claimReevaluationQueueIndex,
  validateClaimReevaluationQueue,
} from "@hnk/claim-reevaluation-queue";
import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  researchArtifactLibraryIndex,
  validateResearchArtifactLibrary,
} from "@hnk/research-artifact-library";
import {
  reviewedClaimRegistryIndex,
  validateReviewedClaimRegistry,
} from "@hnk/reviewed-claim-registry";

export const HNK_RESEARCH_WORKSPACE_SNAPSHOT_ID =
  "HNK_RESEARCH_WORKSPACE_SNAPSHOT_V1";
export const HNK_RESEARCH_WORKSPACE_SNAPSHOT_VERSION = "1.0.0";
export const HNK_RESEARCH_WORKSPACE_SNAPSHOT_BOUNDARY =
  "WORKSPACE_SNAPSHOT_FREEZES_RESEARCH_STATE_NOT_TRUTH_REVIEW_DECISION_OR_CANON";
export const HNK_WORKSPACE_COMPONENTS = Object.freeze([
  "ARTIFACT_LIBRARY",
  "REVIEWED_CLAIM_REGISTRY",
  "CLAIM_REEVALUATION_QUEUE",
]);

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

function validateComponents(artifactLibrary, reviewedRegistry, reevaluationQueue) {
  const issues = [];

  const artifactValidation = validateResearchArtifactLibrary(artifactLibrary);
  if (!artifactValidation.ok) {
    issues.push(...artifactValidation.issues.map((issue) => `artifact_library: ${issue}`));
  }

  const reviewedValidation = validateReviewedClaimRegistry(reviewedRegistry);
  if (!reviewedValidation.ok) {
    issues.push(...reviewedValidation.issues.map((issue) => `reviewed_claim_registry: ${issue}`));
  }

  const queueValidation = validateClaimReevaluationQueue(reevaluationQueue);
  if (!queueValidation.ok) {
    issues.push(...queueValidation.issues.map((issue) => `claim_reevaluation_queue: ${issue}`));
  }

  return issues;
}

function stateSummary(artifactLibrary, reviewedRegistry, reevaluationQueue) {
  const artifacts = researchArtifactLibraryIndex(artifactLibrary);
  const reviewed = reviewedClaimRegistryIndex(reviewedRegistry);
  const queue = claimReevaluationQueueIndex(reevaluationQueue);

  return {
    artifacts: artifacts.total_artifacts,
    latest_artifacts: artifacts.latest_artifacts,
    reviewed_records: reviewed.total_records,
    active_claims: reviewed.active_claims,
    review_due_items: queue.review_due,
  };
}

export function researchWorkspaceSnapshotProjection(snapshot) {
  const projected = clone(snapshot);
  delete projected.snapshot_digest;
  return deepFreeze(projected);
}

function snapshotDigest(snapshot) {
  return sha256Canonical(researchWorkspaceSnapshotProjection(snapshot));
}

export function createResearchWorkspaceSnapshot(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("research workspace snapshot input required");
  }

  const componentIssues = validateComponents(
    input.artifact_library,
    input.reviewed_claim_registry,
    input.claim_reevaluation_queue,
  );
  if (componentIssues.length) {
    throw new Error(`invalid workspace components: ${componentIssues.join("; ")}`);
  }

  const parent = input.parent_snapshot_digest ?? null;
  if (parent !== null && !HEX_64.test(parent)) {
    throw new TypeError("parent_snapshot_digest must be null or SHA-256 hex");
  }

  const snapshot = {
    snapshot_id: HNK_RESEARCH_WORKSPACE_SNAPSHOT_ID,
    snapshot_version: HNK_RESEARCH_WORKSPACE_SNAPSHOT_VERSION,
    authority: "HNK_AUTHORED_RESEARCH_WORKSPACE_SNAPSHOT",
    snapshot_key: cleanString(input.snapshot_key, "snapshot_key"),
    label: cleanString(input.label, "label"),
    created_at: cleanString(input.created_at, "created_at"),
    parent_snapshot_digest: parent,
    components: {
      artifact_library: clone(input.artifact_library),
      reviewed_claim_registry: clone(input.reviewed_claim_registry),
      claim_reevaluation_queue: clone(input.claim_reevaluation_queue),
    },
    component_digests: {
      artifact_library: input.artifact_library.library_digest,
      reviewed_claim_registry: input.reviewed_claim_registry.registry_digest,
      claim_reevaluation_queue: input.claim_reevaluation_queue.queue_digest,
    },
    state_summary: stateSummary(
      input.artifact_library,
      input.reviewed_claim_registry,
      input.claim_reevaluation_queue,
    ),
    snapshot_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    immutable_checkpoint: true,
    automatic_truth_inference: false,
    machine_can_decide_review: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_RESEARCH_WORKSPACE_SNAPSHOT_BOUNDARY,
  };

  snapshot.snapshot_digest = snapshotDigest(snapshot);

  const validation = validateResearchWorkspaceSnapshot(snapshot);
  if (!validation.ok) {
    throw new Error(`invalid research workspace snapshot: ${validation.issues.join("; ")}`);
  }

  return deepFreeze(snapshot);
}

export function validateResearchWorkspaceSnapshot(snapshot) {
  const issues = [];

  if (!snapshot || typeof snapshot !== "object") {
    return deepFreeze({ ok: false, issues: ["snapshot must be an object"] });
  }

  if (snapshot.snapshot_id !== HNK_RESEARCH_WORKSPACE_SNAPSHOT_ID) {
    issues.push(`unexpected snapshot_id ${snapshot.snapshot_id}`);
  }
  if (snapshot.snapshot_version !== HNK_RESEARCH_WORKSPACE_SNAPSHOT_VERSION) {
    issues.push(`unexpected snapshot_version ${snapshot.snapshot_version}`);
  }
  if (snapshot.authority !== "HNK_AUTHORED_RESEARCH_WORKSPACE_SNAPSHOT") {
    issues.push(`unexpected authority ${snapshot.authority}`);
  }

  for (const field of ["snapshot_key", "label", "created_at"]) {
    if (!nonEmpty(snapshot[field])) issues.push(`${field} required`);
  }

  if (
    snapshot.parent_snapshot_digest !== null &&
    !HEX_64.test(snapshot.parent_snapshot_digest ?? "")
  ) {
    issues.push("parent_snapshot_digest must be null or SHA-256 hex");
  }

  const components = snapshot.components;
  if (!components || typeof components !== "object") {
    issues.push("components required");
  } else {
    issues.push(
      ...validateComponents(
        components.artifact_library,
        components.reviewed_claim_registry,
        components.claim_reevaluation_queue,
      ),
    );
  }

  const componentDigests = snapshot.component_digests;
  if (!componentDigests || typeof componentDigests !== "object") {
    issues.push("component_digests required");
  } else if (components && typeof components === "object") {
    const expected = {
      artifact_library: components.artifact_library?.library_digest,
      reviewed_claim_registry: components.reviewed_claim_registry?.registry_digest,
      claim_reevaluation_queue: components.claim_reevaluation_queue?.queue_digest,
    };
    for (const [key, value] of Object.entries(expected)) {
      if (!HEX_64.test(componentDigests[key] ?? "")) {
        issues.push(`component_digests.${key} must be SHA-256 hex`);
      } else if (componentDigests[key] !== value) {
        issues.push(`component_digests.${key} does not match embedded component`);
      }
    }
  }

  if (!snapshot.state_summary || typeof snapshot.state_summary !== "object") {
    issues.push("state_summary required");
  } else if (components && typeof components === "object") {
    try {
      const expected = stateSummary(
        components.artifact_library,
        components.reviewed_claim_registry,
        components.claim_reevaluation_queue,
      );
      for (const [key, value] of Object.entries(expected)) {
        if (snapshot.state_summary[key] !== value) {
          issues.push(`state_summary.${key} drift: expected ${value}`);
        }
      }
    } catch (error) {
      issues.push(
        `state_summary validation failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  if (snapshot.persistence !== "USER_CONTROLLED_FILE_ONLY") {
    issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  }
  if (snapshot.server_persistence !== false) {
    issues.push("server_persistence must remain false");
  }
  if (snapshot.browser_persistence !== false) {
    issues.push("browser_persistence must remain false");
  }
  if (snapshot.immutable_checkpoint !== true) {
    issues.push("immutable_checkpoint must remain true");
  }
  if (snapshot.automatic_truth_inference !== false) {
    issues.push("automatic_truth_inference must remain false");
  }
  if (snapshot.machine_can_decide_review !== false) {
    issues.push("machine_can_decide_review must remain false");
  }
  if (snapshot.automatic_canon_promotion !== false) {
    issues.push("automatic_canon_promotion must remain false");
  }
  if (snapshot.canon_promotion_permitted !== false) {
    issues.push("canon_promotion_permitted must remain false");
  }
  if (snapshot.claim_boundary !== HNK_RESEARCH_WORKSPACE_SNAPSHOT_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${snapshot.claim_boundary}`);
  }

  if (!HEX_64.test(snapshot.snapshot_digest ?? "")) {
    issues.push("snapshot_digest must be SHA-256 hex");
  } else if (snapshotDigest(snapshot) !== snapshot.snapshot_digest) {
    issues.push("snapshot_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function compareResearchWorkspaceSnapshots(left, right) {
  const leftValidation = validateResearchWorkspaceSnapshot(left);
  if (!leftValidation.ok) {
    throw new Error(`invalid left snapshot: ${leftValidation.issues.join("; ")}`);
  }
  const rightValidation = validateResearchWorkspaceSnapshot(right);
  if (!rightValidation.ok) {
    throw new Error(`invalid right snapshot: ${rightValidation.issues.join("; ")}`);
  }

  const componentChanges = {
    ARTIFACT_LIBRARY:
      left.component_digests.artifact_library !== right.component_digests.artifact_library,
    REVIEWED_CLAIM_REGISTRY:
      left.component_digests.reviewed_claim_registry !==
      right.component_digests.reviewed_claim_registry,
    CLAIM_REEVALUATION_QUEUE:
      left.component_digests.claim_reevaluation_queue !==
      right.component_digests.claim_reevaluation_queue,
  };

  const changedComponents = HNK_WORKSPACE_COMPONENTS.filter(
    (component) => componentChanges[component],
  );

  let lineageRelation = "UNRELATED_OR_INDIRECT";
  if (left.snapshot_digest === right.snapshot_digest) {
    lineageRelation = "SAME";
  } else if (right.parent_snapshot_digest === left.snapshot_digest) {
    lineageRelation = "LEFT_PARENT_OF_RIGHT";
  } else if (left.parent_snapshot_digest === right.snapshot_digest) {
    lineageRelation = "RIGHT_PARENT_OF_LEFT";
  }

  const deltas = Object.fromEntries(
    Object.keys(left.state_summary).map((key) => [
      key,
      right.state_summary[key] - left.state_summary[key],
    ]),
  );

  return deepFreeze({
    left_snapshot_digest: left.snapshot_digest,
    right_snapshot_digest: right.snapshot_digest,
    same_snapshot: left.snapshot_digest === right.snapshot_digest,
    lineage_relation: lineageRelation,
    changed_components: changedComponents,
    component_changes: componentChanges,
    deltas,
    truth_assessed: false,
    canon_promotion_permitted: false,
  });
}

export function restoreResearchWorkspaceSnapshot(snapshot) {
  const validation = validateResearchWorkspaceSnapshot(snapshot);
  if (!validation.ok) {
    throw new Error(`cannot restore invalid workspace snapshot: ${validation.issues.join("; ")}`);
  }

  return deepFreeze({
    restored_from_snapshot_digest: snapshot.snapshot_digest,
    artifact_library: clone(snapshot.components.artifact_library),
    reviewed_claim_registry: clone(snapshot.components.reviewed_claim_registry),
    claim_reevaluation_queue: clone(snapshot.components.claim_reevaluation_queue),
    exact_component_restore: true,
    server_write_performed: false,
    browser_persistence_performed: false,
  });
}

export function serializeResearchWorkspaceSnapshot(snapshot) {
  const validation = validateResearchWorkspaceSnapshot(snapshot);
  if (!validation.ok) {
    throw new Error(`cannot serialize invalid workspace snapshot: ${validation.issues.join("; ")}`);
  }
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

export function parseResearchWorkspaceSnapshot(text) {
  if (!nonEmpty(text)) throw new TypeError("workspace snapshot JSON text required");

  let snapshot;
  try {
    snapshot = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid workspace snapshot JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateResearchWorkspaceSnapshot(snapshot);
  if (!validation.ok) {
    throw new Error(`invalid workspace snapshot: ${validation.issues.join("; ")}`);
  }

  return deepFreeze(snapshot);
}

export function researchWorkspaceSnapshotSummary() {
  return deepFreeze({
    snapshot_id: HNK_RESEARCH_WORKSPACE_SNAPSHOT_ID,
    version: HNK_RESEARCH_WORKSPACE_SNAPSHOT_VERSION,
    components: [...HNK_WORKSPACE_COMPONENTS],
    root_digest: "SHA-256",
    component_digest_binding: true,
    direct_parent_lineage: true,
    comparison: true,
    exact_component_restore: true,
    persistence: "USER_CONTROLLED_FILE_ONLY",
    immutable_checkpoint: true,
    automatic_truth_inference: false,
    machine_can_decide_review: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_RESEARCH_WORKSPACE_SNAPSHOT_BOUNDARY,
  });
}
