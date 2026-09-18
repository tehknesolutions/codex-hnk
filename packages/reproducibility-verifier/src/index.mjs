import { sha256Canonical, sha256Hex } from "@hnk/experiment-attestation";
import {
  HNK_RELEASE_VALIDATOR_RESULTS,
  validateResearchReleaseManifest,
} from "@hnk/research-release-manifest";

export const HNK_REPRODUCIBILITY_VERIFIER_ID =
  "HNK_REPRODUCIBILITY_VERIFIER_V1";
export const HNK_REPRODUCIBILITY_VERIFIER_VERSION = "1.0.0";
export const HNK_REPRODUCIBILITY_VERIFIER_BOUNDARY =
  "VERIFIER_CHECKS_MANIFEST_BOUND_STATE_AGAINST_OBSERVED_PROJECT_STATE_NOT_TRUTH_AUTHORSHIP_TIME_READINESS_OR_CANON";
export const HNK_REPRODUCIBILITY_STATUSES = Object.freeze([
  "MATCH",
  "DRIFT",
  "MISSING",
  "UNVERIFIED",
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

function statusForExpectedObserved(expected, observed, {
  missing = "UNVERIFIED",
  normalize = (value) => value,
} = {}) {
  if (observed === undefined || observed === null || observed === "") {
    return missing;
  }
  return normalize(observed) === normalize(expected) ? "MATCH" : "DRIFT";
}

function overallStatus(checks) {
  if (checks.some((check) => check.status === "DRIFT")) return "DRIFT";
  if (checks.some((check) => check.status === "MISSING")) return "MISSING";
  if (checks.some((check) => check.status === "UNVERIFIED")) return "UNVERIFIED";
  return "MATCH";
}

function counts(checks) {
  return {
    MATCH: checks.filter((check) => check.status === "MATCH").length,
    DRIFT: checks.filter((check) => check.status === "DRIFT").length,
    MISSING: checks.filter((check) => check.status === "MISSING").length,
    UNVERIFIED: checks.filter((check) => check.status === "UNVERIFIED").length,
  };
}

function normalizeRepo(value) {
  if (!nonEmpty(value)) return "";
  return value
    .trim()
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/^git@github\.com:/, "")
    .replace(/\.git$/, "")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

function makeCheck({
  check_id,
  category,
  subject,
  expected = null,
  observed = null,
  status,
  note,
}) {
  return {
    check_id,
    category,
    subject,
    expected: expected === undefined ? null : String(expected),
    observed: observed === undefined ? null : observed === null ? null : String(observed),
    status,
    note,
  };
}

function uniqueMap(entries, key, label) {
  const map = new Map();
  for (const entry of entries ?? []) {
    const value = entry?.[key];
    if (!nonEmpty(value)) throw new TypeError(`${label} ${key} required`);
    if (map.has(value)) throw new Error(`duplicate ${label} ${key} ${value}`);
    map.set(value, entry);
  }
  return map;
}

export function reproducibilityVerificationReportProjection(report) {
  const projected = clone(report);
  delete projected.report_digest;
  return deepFreeze(projected);
}

function reportDigest(report) {
  return sha256Canonical(reproducibilityVerificationReportProjection(report));
}

export function verifyResearchReleaseManifest(
  manifest,
  observed = {},
  input = {},
) {
  const manifestValidation = validateResearchReleaseManifest(manifest);
  if (!manifestValidation.ok) {
    throw new Error(
      `cannot verify invalid research release manifest: ${manifestValidation.issues.join("; ")}`,
    );
  }

  if (!observed || typeof observed !== "object") {
    throw new TypeError("observed project state must be object");
  }

  const generatedAt = input.generated_at ?? new Date().toISOString();
  cleanString(generatedAt, "generated_at");

  const files = uniqueMap(observed.files ?? [], "source_path", "file observation");
  const validatorExecutions = uniqueMap(
    observed.validator_executions ?? [],
    "validator_id",
    "validator execution observation",
  );

  const checks = [];

  checks.push(makeCheck({
    check_id: "MANIFEST:INTEGRITY",
    category: "MANIFEST",
    subject: manifest.release_key,
    expected: manifest.manifest_digest,
    observed: manifest.manifest_digest,
    status: "MATCH",
    note: "Release Manifest passed its own contract validation before verification.",
  }));

  checks.push(makeCheck({
    check_id: "WORKSPACE:REGISTRY_DIGEST",
    category: "WORKSPACE",
    subject: "workspace_registry_digest",
    expected: manifest.workspace_registry_digest,
    observed: manifest.workspace_snapshot_registry.registry_digest,
    status: manifest.workspace_registry_digest === manifest.workspace_snapshot_registry.registry_digest
      ? "MATCH"
      : "DRIFT",
    note: "Embedded Workspace Snapshot Registry digest must match the release binding.",
  }));

  checks.push(makeCheck({
    check_id: "WORKSPACE:HEAD_SNAPSHOT",
    category: "WORKSPACE",
    subject: "head_snapshot_digest",
    expected: manifest.head_snapshot_digest,
    observed: manifest.workspace_snapshot_registry.head_snapshot_digest,
    status: manifest.head_snapshot_digest === manifest.workspace_snapshot_registry.head_snapshot_digest
      ? "MATCH"
      : "DRIFT",
    note: "Release HEAD must match the embedded registry HEAD.",
  }));

  const gitObserved = observed.git ?? {};
  const expectedRepo = manifest.git.repository_full_name;
  checks.push(makeCheck({
    check_id: "GIT:REPOSITORY",
    category: "GIT",
    subject: "repository_full_name",
    expected: expectedRepo,
    observed: gitObserved.repository_full_name ?? null,
    status: statusForExpectedObserved(expectedRepo, gitObserved.repository_full_name, {
      normalize: normalizeRepo,
    }),
    note: "Repository comparison normalizes common GitHub HTTPS/SSH forms.",
  }));

  checks.push(makeCheck({
    check_id: "GIT:COMMIT",
    category: "GIT",
    subject: "commit_sha",
    expected: manifest.git.commit_sha,
    observed: gitObserved.commit_sha ?? null,
    status: statusForExpectedObserved(manifest.git.commit_sha, gitObserved.commit_sha),
    note: "Commit verification is exact.",
  }));

  checks.push(makeCheck({
    check_id: "GIT:REF",
    category: "GIT",
    subject: "ref",
    expected: manifest.git.ref,
    observed: gitObserved.ref ?? null,
    status: statusForExpectedObserved(manifest.git.ref, gitObserved.ref),
    note: "Detached checkouts may leave ref unverified even when commit matches.",
  }));

  const runtimeObserved = observed.runtime ?? {};
  checks.push(makeCheck({
    check_id: "RUNTIME:NODE_ENGINE",
    category: "RUNTIME",
    subject: "node_engine",
    expected: manifest.runtime.node_engine,
    observed: runtimeObserved.node_engine ?? null,
    status: statusForExpectedObserved(
      manifest.runtime.node_engine,
      runtimeObserved.node_engine,
    ),
    note: "Caller should normalize the observed Node runtime to the manifest convention, e.g. 22.x.",
  }));

  checks.push(makeCheck({
    check_id: "RUNTIME:PACKAGE_MANAGER",
    category: "RUNTIME",
    subject: "package_manager",
    expected: manifest.runtime.package_manager,
    observed: runtimeObserved.package_manager ?? null,
    status: statusForExpectedObserved(
      manifest.runtime.package_manager,
      runtimeObserved.package_manager,
    ),
    note: "Package manager comparison is exact.",
  }));

  for (const contract of manifest.contracts) {
    const file = files.get(contract.source_path);
    const observedDigest = file ? sha256Hex(file.source_text) : null;
    checks.push(makeCheck({
      check_id: `CONTRACT_SOURCE:${contract.contract_id}`,
      category: "CONTRACT_SOURCE",
      subject: contract.source_path,
      expected: contract.content_digest,
      observed: observedDigest,
      status: file
        ? observedDigest === contract.content_digest ? "MATCH" : "DRIFT"
        : "MISSING",
      note: file
        ? "Exact observed source text hashed with SHA-256."
        : "Expected contract source path was not supplied to the verifier.",
    }));
  }

  for (const validator of manifest.validators) {
    const file = files.get(validator.source_path);
    const observedDigest = file ? sha256Hex(file.source_text) : null;
    checks.push(makeCheck({
      check_id: `VALIDATOR_SOURCE:${validator.validator_id}`,
      category: "VALIDATOR_SOURCE",
      subject: validator.source_path,
      expected: validator.content_digest,
      observed: observedDigest,
      status: file
        ? observedDigest === validator.content_digest ? "MATCH" : "DRIFT"
        : "MISSING",
      note: file
        ? "Exact observed validator source text hashed with SHA-256."
        : "Expected validator source path was not supplied to the verifier.",
    }));

    const execution = validatorExecutions.get(validator.validator_id);
    let executionStatus = "UNVERIFIED";
    let observedResult = null;
    let executionNote =
      "Validator execution was not re-observed; historical manifest evidence remains recorded but not rerun.";

    if (execution) {
      if (!HNK_RELEASE_VALIDATOR_RESULTS.includes(execution.result)) {
        throw new TypeError(
          `unsupported observed validator result ${execution.result} for ${validator.validator_id}`,
        );
      }
      observedResult = execution.result;
      executionStatus = execution.result === validator.result ? "MATCH" : "DRIFT";
      executionNote =
        executionStatus === "MATCH"
          ? "Observed validator result reproduces the result recorded by the manifest."
          : "Observed validator result differs from the historical result recorded by the manifest.";
    }

    checks.push(makeCheck({
      check_id: `VALIDATOR_EXECUTION:${validator.validator_id}`,
      category: "VALIDATOR_EXECUTION",
      subject: validator.validator_id,
      expected: validator.result,
      observed: observedResult,
      status: executionStatus,
      note: executionNote,
    }));
  }

  checks.push(makeCheck({
    check_id: "REPRODUCTION:COMMAND_EXECUTION",
    category: "REPRODUCTION",
    subject: "recorded_commands",
    expected: "RECORDED_ONLY",
    observed: null,
    status: "UNVERIFIED",
    note: "Verifier V1 does not execute manifest reproduction commands automatically.",
  }));

  const report = {
    verifier_id: HNK_REPRODUCIBILITY_VERIFIER_ID,
    verifier_version: HNK_REPRODUCIBILITY_VERIFIER_VERSION,
    authority: "HNK_AUTHORED_REPRODUCIBILITY_VERIFIER",
    generated_at: generatedAt,
    release_key: manifest.release_key,
    manifest_digest: manifest.manifest_digest,
    recorded_validator_execution_status: manifest.validator_execution_status,
    overall_status: overallStatus(checks),
    counts: counts(checks),
    checks,
    report_digest: "",
    commands_executed: false,
    filesystem_scanned_by_contract: false,
    content_integrity_scope: true,
    authorship_proof: false,
    trusted_timestamp_proof: false,
    truth_assessed: false,
    production_readiness_inferred: false,
    machine_can_decide_review: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_REPRODUCIBILITY_VERIFIER_BOUNDARY,
  };

  report.report_digest = reportDigest(report);

  const validation = validateReproducibilityVerificationReport(report);
  if (!validation.ok) {
    throw new Error(
      `verifier produced invalid report: ${validation.issues.join("; ")}`,
    );
  }

  return deepFreeze(report);
}

export function validateReproducibilityVerificationReport(report) {
  const issues = [];

  if (!report || typeof report !== "object") {
    return deepFreeze({ ok: false, issues: ["report must be object"] });
  }

  if (report.verifier_id !== HNK_REPRODUCIBILITY_VERIFIER_ID) {
    issues.push(`unexpected verifier_id ${report.verifier_id}`);
  }
  if (report.verifier_version !== HNK_REPRODUCIBILITY_VERIFIER_VERSION) {
    issues.push(`unexpected verifier_version ${report.verifier_version}`);
  }
  if (report.authority !== "HNK_AUTHORED_REPRODUCIBILITY_VERIFIER") {
    issues.push(`unexpected authority ${report.authority}`);
  }

  for (const field of ["generated_at", "release_key", "manifest_digest"]) {
    if (!nonEmpty(report[field])) issues.push(`${field} required`);
  }
  if (!HEX_64.test(report.manifest_digest ?? "")) {
    issues.push("manifest_digest must be SHA-256 hex");
  }

  if (!Array.isArray(report.checks) || report.checks.length === 0) {
    issues.push("checks must be a non-empty array");
  } else {
    const ids = new Set();
    for (const [index, check] of report.checks.entries()) {
      if (!nonEmpty(check?.check_id)) issues.push(`checks[${index}].check_id required`);
      if (!nonEmpty(check?.category)) issues.push(`checks[${index}].category required`);
      if (!nonEmpty(check?.subject)) issues.push(`checks[${index}].subject required`);
      if (!HNK_REPRODUCIBILITY_STATUSES.includes(check?.status)) {
        issues.push(`checks[${index}].status unsupported`);
      }
      if (!nonEmpty(check?.note)) issues.push(`checks[${index}].note required`);
      if (ids.has(check?.check_id)) issues.push(`duplicate check_id ${check?.check_id}`);
      ids.add(check?.check_id);
    }

    const expectedOverall = overallStatus(report.checks);
    if (report.overall_status !== expectedOverall) {
      issues.push(`overall_status drift: expected ${expectedOverall}`);
    }

    const expectedCounts = counts(report.checks);
    for (const status of HNK_REPRODUCIBILITY_STATUSES) {
      if (report.counts?.[status] !== expectedCounts[status]) {
        issues.push(`counts.${status} drift: expected ${expectedCounts[status]}`);
      }
    }
  }

  if (!HNK_REPRODUCIBILITY_STATUSES.includes(report.overall_status)) {
    issues.push("overall_status unsupported");
  }
  if (!["COMPLETE_PASS", "HAS_FAILURE", "INCOMPLETE"].includes(report.recorded_validator_execution_status)) {
    issues.push("recorded_validator_execution_status unsupported");
  }

  if (report.commands_executed !== false) {
    issues.push("commands_executed must remain false");
  }
  if (report.filesystem_scanned_by_contract !== false) {
    issues.push("filesystem_scanned_by_contract must remain false");
  }
  if (report.content_integrity_scope !== true) {
    issues.push("content_integrity_scope must remain true");
  }
  if (report.authorship_proof !== false) issues.push("authorship_proof must remain false");
  if (report.trusted_timestamp_proof !== false) issues.push("trusted_timestamp_proof must remain false");
  if (report.truth_assessed !== false) issues.push("truth_assessed must remain false");
  if (report.production_readiness_inferred !== false) {
    issues.push("production_readiness_inferred must remain false");
  }
  if (report.machine_can_decide_review !== false) {
    issues.push("machine_can_decide_review must remain false");
  }
  if (report.automatic_canon_promotion !== false) {
    issues.push("automatic_canon_promotion must remain false");
  }
  if (report.canon_promotion_permitted !== false) {
    issues.push("canon_promotion_permitted must remain false");
  }
  if (report.claim_boundary !== HNK_REPRODUCIBILITY_VERIFIER_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${report.claim_boundary}`);
  }

  if (!HEX_64.test(report.report_digest ?? "")) {
    issues.push("report_digest must be SHA-256 hex");
  } else if (reportDigest(report) !== report.report_digest) {
    issues.push("report_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function serializeReproducibilityVerificationReport(report) {
  const validation = validateReproducibilityVerificationReport(report);
  if (!validation.ok) {
    throw new Error(
      `cannot serialize invalid reproducibility verification report: ${validation.issues.join("; ")}`,
    );
  }
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function parseReproducibilityVerificationReport(text) {
  if (!nonEmpty(text)) {
    throw new TypeError("reproducibility verification report JSON text required");
  }

  let report;
  try {
    report = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid reproducibility verification report JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateReproducibilityVerificationReport(report);
  if (!validation.ok) {
    throw new Error(
      `invalid reproducibility verification report: ${validation.issues.join("; ")}`,
    );
  }

  return deepFreeze(report);
}

export function reproducibilityVerifierSummary() {
  return deepFreeze({
    verifier_id: HNK_REPRODUCIBILITY_VERIFIER_ID,
    version: HNK_REPRODUCIBILITY_VERIFIER_VERSION,
    statuses: [...HNK_REPRODUCIBILITY_STATUSES],
    verifies_manifest_integrity: true,
    verifies_workspace_head_binding: true,
    verifies_git_observations: true,
    verifies_runtime_observations: true,
    verifies_exact_contract_source_digests: true,
    verifies_exact_validator_source_digests: true,
    optional_validator_execution_reobservation: true,
    automatic_command_execution: false,
    automatic_filesystem_scan_in_contract: false,
    drift_precedence: "DRIFT>MISSING>UNVERIFIED>MATCH",
    content_integrity_scope: true,
    authorship_proof: false,
    trusted_timestamp_proof: false,
    truth_assessed: false,
    production_readiness_inferred: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_REPRODUCIBILITY_VERIFIER_BOUNDARY,
  });
}
