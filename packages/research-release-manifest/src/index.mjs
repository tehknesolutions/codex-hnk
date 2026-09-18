import { sha256Canonical, sha256Hex } from "@hnk/experiment-attestation";
import { validateWorkspaceSnapshotRegistry } from "@hnk/research-workspace-snapshot-registry";

export const HNK_RESEARCH_RELEASE_MANIFEST_ID = "HNK_RESEARCH_RELEASE_MANIFEST_V1";
export const HNK_RESEARCH_RELEASE_MANIFEST_VERSION = "1.0.0";
export const HNK_RESEARCH_RELEASE_MANIFEST_BOUNDARY =
  "RELEASE_MANIFEST_BINDS_RESEARCH_STATE_CODE_CONTRACTS_AND_VALIDATION_EVIDENCE_NOT_TRUTH_AUTHORSHIP_TIME_OR_CANON";
export const HNK_RELEASE_VALIDATOR_RESULTS = Object.freeze([
  "PASS",
  "FAIL",
  "NOT_EXECUTED",
  "INFRASTRUCTURE_BLOCKED",
]);

const HEX_64 = /^[0-9a-f]{64}$/;
const GIT_OID = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;

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

function headBindings(registry) {
  if (!registry.head_snapshot_digest) {
    throw new Error("workspace snapshot registry HEAD must be explicitly set before release");
  }

  const record = registry.snapshots.find(
    (entry) => entry.snapshot_digest === registry.head_snapshot_digest,
  );
  if (!record) {
    throw new Error("workspace snapshot registry HEAD record missing");
  }

  const event = registry.head_events.at(-1);
  if (!event || event.to_snapshot_digest !== registry.head_snapshot_digest) {
    throw new Error("workspace snapshot registry HEAD event missing or inconsistent");
  }

  return { record, event };
}

export function createReleaseContractBinding(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("release contract binding input required");
  }

  const sourceText = cleanString(input.source_text, "source_text");
  return deepFreeze({
    contract_id: cleanString(input.contract_id, "contract_id"),
    contract_version: cleanString(input.contract_version, "contract_version"),
    package_name: cleanString(input.package_name, "package_name"),
    source_path: cleanString(input.source_path, "source_path"),
    content_digest: sha256Hex(sourceText),
  });
}

export function createReleaseValidatorBinding(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("release validator binding input required");
  }
  if (!HNK_RELEASE_VALIDATOR_RESULTS.includes(input.result)) {
    throw new TypeError(`unsupported validator result ${input.result}`);
  }

  const executedAt = input.executed_at ?? null;
  if (input.result === "PASS" || input.result === "FAIL") {
    if (!nonEmpty(executedAt)) {
      throw new TypeError("executed_at required for PASS or FAIL validator results");
    }
  } else if (executedAt !== null && !nonEmpty(executedAt)) {
    throw new TypeError("executed_at must be null or a non-empty string");
  }

  const sourceText = cleanString(input.source_text, "source_text");

  return deepFreeze({
    validator_id: cleanString(input.validator_id, "validator_id"),
    source_path: cleanString(input.source_path, "source_path"),
    content_digest: sha256Hex(sourceText),
    result: input.result,
    executed_at: executedAt,
    environment: cleanString(input.environment, "environment"),
    evidence_note: cleanString(input.evidence_note, "evidence_note"),
  });
}

export function releaseValidatorExecutionStatus(validators) {
  if (!Array.isArray(validators) || validators.length === 0) return "INCOMPLETE";
  if (validators.some((entry) => entry.result === "FAIL")) return "HAS_FAILURE";
  if (validators.every((entry) => entry.result === "PASS")) return "COMPLETE_PASS";
  return "INCOMPLETE";
}

export function researchReleaseManifestProjection(manifest) {
  const projected = clone(manifest);
  delete projected.manifest_digest;
  return deepFreeze(projected);
}

function manifestDigest(manifest) {
  return sha256Canonical(researchReleaseManifestProjection(manifest));
}

export function createResearchReleaseManifest(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("research release manifest input required");
  }

  const registryValidation = validateWorkspaceSnapshotRegistry(
    input.workspace_snapshot_registry,
  );
  if (!registryValidation.ok) {
    throw new Error(
      `invalid workspace snapshot registry: ${registryValidation.issues.join("; ")}`,
    );
  }

  const { record, event } = headBindings(input.workspace_snapshot_registry);

  if (!Array.isArray(input.contracts) || input.contracts.length === 0) {
    throw new TypeError("at least one contract binding required");
  }
  if (!Array.isArray(input.validators) || input.validators.length === 0) {
    throw new TypeError("at least one validator binding required");
  }

  const reproduction = input.reproduction ?? {};
  if (!Array.isArray(reproduction.validation_commands) || reproduction.validation_commands.length === 0) {
    throw new TypeError("at least one validation command required");
  }

  const manifest = {
    release_id: HNK_RESEARCH_RELEASE_MANIFEST_ID,
    release_version: HNK_RESEARCH_RELEASE_MANIFEST_VERSION,
    authority: "HNK_AUTHORED_RESEARCH_RELEASE_MANIFEST",
    release_key: cleanString(input.release_key, "release_key"),
    label: cleanString(input.label, "label"),
    created_at: cleanString(input.created_at, "created_at"),
    workspace_snapshot_registry: clone(input.workspace_snapshot_registry),
    workspace_registry_digest: input.workspace_snapshot_registry.registry_digest,
    head_snapshot_digest: input.workspace_snapshot_registry.head_snapshot_digest,
    head_record_digest: record.record_digest,
    head_event_digest: event.event_digest,
    git: {
      repository_full_name: cleanString(input.git?.repository_full_name, "git.repository_full_name"),
      commit_sha: cleanString(input.git?.commit_sha, "git.commit_sha"),
      ref: cleanString(input.git?.ref, "git.ref"),
      working_tree_status: "NOT_ASSESSED",
    },
    runtime: {
      node_engine: cleanString(input.runtime?.node_engine, "runtime.node_engine"),
      package_manager: cleanString(input.runtime?.package_manager, "runtime.package_manager"),
    },
    contracts: clone(input.contracts),
    validators: clone(input.validators),
    validator_execution_status: releaseValidatorExecutionStatus(input.validators),
    reproduction: {
      install_command: cleanString(reproduction.install_command, "reproduction.install_command"),
      validation_commands: reproduction.validation_commands.map((command, index) =>
        cleanString(command, `reproduction.validation_commands[${index}]`),
      ),
      build_command: cleanString(reproduction.build_command, "reproduction.build_command"),
      notes: Array.isArray(reproduction.notes)
        ? reproduction.notes.map((note, index) => cleanString(note, `reproduction.notes[${index}]`))
        : [],
    },
    manifest_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    content_integrity_scope: true,
    authorship_proof: false,
    trusted_timestamp_proof: false,
    truth_assessed: false,
    production_readiness_inferred: false,
    machine_can_decide_review: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_RESEARCH_RELEASE_MANIFEST_BOUNDARY,
  };

  if (!GIT_OID.test(manifest.git.commit_sha)) {
    throw new TypeError("git.commit_sha must be lowercase 40- or 64-character Git object id");
  }

  manifest.manifest_digest = manifestDigest(manifest);

  const validation = validateResearchReleaseManifest(manifest);
  if (!validation.ok) {
    throw new Error(`invalid research release manifest: ${validation.issues.join("; ")}`);
  }

  return deepFreeze(manifest);
}

function validateBindings(manifest, issues) {
  if (!Array.isArray(manifest.contracts) || manifest.contracts.length === 0) {
    issues.push("contracts must be a non-empty array");
  } else {
    const ids = new Set();
    const paths = new Set();
    for (const [index, entry] of manifest.contracts.entries()) {
      for (const field of ["contract_id", "contract_version", "package_name", "source_path"]) {
        if (!nonEmpty(entry?.[field])) issues.push(`contracts[${index}].${field} required`);
      }
      if (!HEX_64.test(entry?.content_digest ?? "")) {
        issues.push(`contracts[${index}].content_digest must be SHA-256 hex`);
      }
      if (ids.has(entry?.contract_id)) issues.push(`duplicate contract_id ${entry.contract_id}`);
      if (paths.has(entry?.source_path)) issues.push(`duplicate contract source_path ${entry.source_path}`);
      ids.add(entry?.contract_id);
      paths.add(entry?.source_path);
    }
  }

  if (!Array.isArray(manifest.validators) || manifest.validators.length === 0) {
    issues.push("validators must be a non-empty array");
  } else {
    const ids = new Set();
    const paths = new Set();
    for (const [index, entry] of manifest.validators.entries()) {
      for (const field of ["validator_id", "source_path", "environment", "evidence_note"]) {
        if (!nonEmpty(entry?.[field])) issues.push(`validators[${index}].${field} required`);
      }
      if (!HEX_64.test(entry?.content_digest ?? "")) {
        issues.push(`validators[${index}].content_digest must be SHA-256 hex`);
      }
      if (!HNK_RELEASE_VALIDATOR_RESULTS.includes(entry?.result)) {
        issues.push(`validators[${index}].result unsupported`);
      }
      if ((entry?.result === "PASS" || entry?.result === "FAIL") && !nonEmpty(entry?.executed_at)) {
        issues.push(`validators[${index}].executed_at required for ${entry?.result}`);
      }
      if (
        entry?.result !== "PASS" &&
        entry?.result !== "FAIL" &&
        entry?.executed_at !== null &&
        !nonEmpty(entry?.executed_at)
      ) {
        issues.push(`validators[${index}].executed_at must be null or non-empty`);
      }
      if (ids.has(entry?.validator_id)) issues.push(`duplicate validator_id ${entry.validator_id}`);
      if (paths.has(entry?.source_path)) issues.push(`duplicate validator source_path ${entry.source_path}`);
      ids.add(entry?.validator_id);
      paths.add(entry?.source_path);
    }
  }

  const expectedStatus = releaseValidatorExecutionStatus(manifest.validators);
  if (manifest.validator_execution_status !== expectedStatus) {
    issues.push(
      `validator_execution_status drift: expected ${expectedStatus}`,
    );
  }
}

export function validateResearchReleaseManifest(manifest) {
  const issues = [];

  if (!manifest || typeof manifest !== "object") {
    return deepFreeze({ ok: false, issues: ["manifest must be object"] });
  }

  if (manifest.release_id !== HNK_RESEARCH_RELEASE_MANIFEST_ID) {
    issues.push(`unexpected release_id ${manifest.release_id}`);
  }
  if (manifest.release_version !== HNK_RESEARCH_RELEASE_MANIFEST_VERSION) {
    issues.push(`unexpected release_version ${manifest.release_version}`);
  }
  if (manifest.authority !== "HNK_AUTHORED_RESEARCH_RELEASE_MANIFEST") {
    issues.push(`unexpected authority ${manifest.authority}`);
  }

  for (const field of ["release_key", "label", "created_at"]) {
    if (!nonEmpty(manifest[field])) issues.push(`${field} required`);
  }

  const registryValidation = validateWorkspaceSnapshotRegistry(
    manifest.workspace_snapshot_registry,
  );
  if (!registryValidation.ok) {
    issues.push(
      ...registryValidation.issues.map((issue) => `workspace_snapshot_registry: ${issue}`),
    );
  } else {
    try {
      const { record, event } = headBindings(manifest.workspace_snapshot_registry);
      if (manifest.workspace_registry_digest !== manifest.workspace_snapshot_registry.registry_digest) {
        issues.push("workspace_registry_digest does not match embedded registry");
      }
      if (manifest.head_snapshot_digest !== manifest.workspace_snapshot_registry.head_snapshot_digest) {
        issues.push("head_snapshot_digest does not match registry HEAD");
      }
      if (manifest.head_record_digest !== record.record_digest) {
        issues.push("head_record_digest does not match registry HEAD record");
      }
      if (manifest.head_event_digest !== event.event_digest) {
        issues.push("head_event_digest does not match latest registry HEAD event");
      }
    } catch (error) {
      issues.push(error instanceof Error ? error.message : "workspace HEAD binding validation failed");
    }
  }

  for (const field of ["workspace_registry_digest", "head_snapshot_digest", "head_record_digest", "head_event_digest"]) {
    if (!HEX_64.test(manifest[field] ?? "")) issues.push(`${field} must be SHA-256 hex`);
  }

  if (!manifest.git || typeof manifest.git !== "object") {
    issues.push("git provenance required");
  } else {
    if (!nonEmpty(manifest.git.repository_full_name)) issues.push("git.repository_full_name required");
    if (!GIT_OID.test(manifest.git.commit_sha ?? "")) issues.push("git.commit_sha must be lowercase 40- or 64-character Git object id");
    if (!nonEmpty(manifest.git.ref)) issues.push("git.ref required");
    if (manifest.git.working_tree_status !== "NOT_ASSESSED") {
      issues.push("git.working_tree_status must remain NOT_ASSESSED");
    }
  }

  if (!manifest.runtime || typeof manifest.runtime !== "object") {
    issues.push("runtime provenance required");
  } else {
    if (!nonEmpty(manifest.runtime.node_engine)) issues.push("runtime.node_engine required");
    if (!nonEmpty(manifest.runtime.package_manager)) issues.push("runtime.package_manager required");
  }

  validateBindings(manifest, issues);

  const reproduction = manifest.reproduction;
  if (!reproduction || typeof reproduction !== "object") {
    issues.push("reproduction instructions required");
  } else {
    if (!nonEmpty(reproduction.install_command)) issues.push("reproduction.install_command required");
    if (!Array.isArray(reproduction.validation_commands) || reproduction.validation_commands.length === 0) {
      issues.push("reproduction.validation_commands must be non-empty");
    } else {
      reproduction.validation_commands.forEach((command, index) => {
        if (!nonEmpty(command)) issues.push(`reproduction.validation_commands[${index}] required`);
      });
    }
    if (!nonEmpty(reproduction.build_command)) issues.push("reproduction.build_command required");
    if (!Array.isArray(reproduction.notes)) issues.push("reproduction.notes must be array");
  }

  if (manifest.persistence !== "USER_CONTROLLED_FILE_ONLY") issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  if (manifest.server_persistence !== false) issues.push("server_persistence must remain false");
  if (manifest.browser_persistence !== false) issues.push("browser_persistence must remain false");
  if (manifest.content_integrity_scope !== true) issues.push("content_integrity_scope must remain true");
  if (manifest.authorship_proof !== false) issues.push("authorship_proof must remain false");
  if (manifest.trusted_timestamp_proof !== false) issues.push("trusted_timestamp_proof must remain false");
  if (manifest.truth_assessed !== false) issues.push("truth_assessed must remain false");
  if (manifest.production_readiness_inferred !== false) issues.push("production_readiness_inferred must remain false");
  if (manifest.machine_can_decide_review !== false) issues.push("machine_can_decide_review must remain false");
  if (manifest.automatic_canon_promotion !== false) issues.push("automatic_canon_promotion must remain false");
  if (manifest.canon_promotion_permitted !== false) issues.push("canon_promotion_permitted must remain false");
  if (manifest.claim_boundary !== HNK_RESEARCH_RELEASE_MANIFEST_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${manifest.claim_boundary}`);
  }

  if (!HEX_64.test(manifest.manifest_digest ?? "")) {
    issues.push("manifest_digest must be SHA-256 hex");
  } else if (manifestDigest(manifest) !== manifest.manifest_digest) {
    issues.push("manifest_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function serializeResearchReleaseManifest(manifest) {
  const validation = validateResearchReleaseManifest(manifest);
  if (!validation.ok) {
    throw new Error(`cannot serialize invalid research release manifest: ${validation.issues.join("; ")}`);
  }
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export function parseResearchReleaseManifest(text) {
  if (!nonEmpty(text)) throw new TypeError("research release manifest JSON text required");

  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid research release manifest JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateResearchReleaseManifest(manifest);
  if (!validation.ok) {
    throw new Error(`invalid research release manifest: ${validation.issues.join("; ")}`);
  }

  return deepFreeze(manifest);
}

export function researchReleaseManifestSummary() {
  return deepFreeze({
    release_id: HNK_RESEARCH_RELEASE_MANIFEST_ID,
    version: HNK_RESEARCH_RELEASE_MANIFEST_VERSION,
    binds_workspace_registry_head: true,
    git_commit_binding: true,
    exact_contract_source_digests: true,
    exact_validator_source_digests: true,
    validator_execution_state_preserved: true,
    infrastructure_blocked_is_not_pass: true,
    reproduction_commands_preserved: true,
    working_tree_status: "NOT_ASSESSED",
    content_integrity_scope: true,
    authorship_proof: false,
    trusted_timestamp_proof: false,
    truth_assessed: false,
    production_readiness_inferred: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    persistence: "USER_CONTROLLED_FILE_ONLY",
    claim_boundary: HNK_RESEARCH_RELEASE_MANIFEST_BOUNDARY,
  });
}
