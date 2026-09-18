import { sha256Canonical, sha256Hex } from "@hnk/experiment-attestation";
import {
  validateDeploymentExecutionReceipt,
} from "@hnk/deployment-execution-receipt";

export const HNK_PRODUCTION_VERIFICATION_REGISTRY_ID =
  "HNK_PRODUCTION_VERIFICATION_REGISTRY_V1";
export const HNK_PRODUCTION_VERIFICATION_REGISTRY_VERSION = "1.0.0";
export const HNK_PRODUCTION_VERIFICATION_REGISTRY_BOUNDARY =
  "PRODUCTION_REGISTRY_PRESERVES_DEPLOYMENT_RECEIPTS_POST_DEPLOYMENT_OBSERVATIONS_AND_EXPLICIT_HUMAN_PRODUCTION_DECISIONS_NOT_GLOBAL_READINESS_TRUTH_OR_CANON";
export const HNK_POST_DEPLOYMENT_CHECK_RESULTS = Object.freeze([
  "PASS",
  "FAIL",
  "UNVERIFIED",
]);
export const HNK_POST_DEPLOYMENT_OVERALL_STATUSES = Object.freeze([
  "PASS",
  "FAIL",
  "UNVERIFIED",
]);
export const HNK_PRODUCTION_GATE_DECISIONS = Object.freeze([
  "PRODUCTION_ACCEPTED",
  "PRODUCTION_REJECTED",
  "PRODUCTION_HELD",
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

function exactText(value, field) {
  if (!nonEmpty(value)) throw new TypeError(`${field} must be non-empty text`);
  return value;
}

function receiptRecordProjection(record) {
  const projected = clone(record);
  delete projected.record_digest;
  return projected;
}

function receiptRecordDigest(record) {
  return sha256Canonical(receiptRecordProjection(record));
}

function verificationProjection(verification) {
  const projected = clone(verification);
  delete projected.verification_digest;
  return projected;
}

function verificationDigest(verification) {
  return sha256Canonical(verificationProjection(verification));
}

function decisionProjection(decision) {
  const projected = clone(decision);
  delete projected.decision_digest;
  return projected;
}

function decisionDigest(decision) {
  return sha256Canonical(decisionProjection(decision));
}

export function productionVerificationRegistryProjection(registry) {
  const projected = clone(registry);
  delete projected.registry_digest;
  return deepFreeze(projected);
}

function registryDigest(registry) {
  return sha256Canonical(productionVerificationRegistryProjection(registry));
}

function overallStatus(checks) {
  if (checks.some((check) => check.result === "FAIL")) return "FAIL";
  if (checks.some((check) => check.result === "UNVERIFIED")) return "UNVERIFIED";
  return "PASS";
}

function receiptByDigest(registry, digest) {
  return registry.receipts.find((record) => record.receipt_digest === digest) ?? null;
}

function verificationByDigest(registry, digest) {
  return registry.verifications.find(
    (verification) => verification.verification_digest === digest,
  ) ?? null;
}

function releaseEnvironmentKey(releaseKey, targetEnvironment) {
  return `${releaseKey}\u0000${targetEnvironment}`;
}

function decisionsForReleaseEnvironment(registry, releaseKey, targetEnvironment) {
  return registry.decisions.filter(
    (event) =>
      event.release_key === releaseKey &&
      event.target_environment === targetEnvironment,
  );
}

export function createProductionVerificationRegistry(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("production verification registry input required");
  }

  const registry = {
    registry_id: HNK_PRODUCTION_VERIFICATION_REGISTRY_ID,
    registry_version: HNK_PRODUCTION_VERIFICATION_REGISTRY_VERSION,
    authority: "HNK_AUTHORED_PRODUCTION_VERIFICATION_REGISTRY",
    registry_key: cleanString(input.registry_key, "registry_key"),
    title: cleanString(input.title, "title"),
    created_at: cleanString(input.created_at, "created_at"),
    receipts: [],
    verifications: [],
    decisions: [],
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    immutable_receipt_history: true,
    immutable_verification_history: true,
    immutable_decision_history: true,
    human_production_gate_required: true,
    deployment_succeeded_auto_accepts_production: false,
    post_deployment_pass_auto_accepts_production: false,
    latest_receipt_and_verification_required: true,
    production_accept_requires_succeeded_receipt_and_pass_verification: true,
    machine_can_accept_production: false,
    network_checks_executed_by_registry: false,
    automatic_truth_inference: false,
    production_readiness_inferred: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_PRODUCTION_VERIFICATION_REGISTRY_BOUNDARY,
  };

  registry.registry_digest = registryDigest(registry);
  const validation = validateProductionVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `invalid production verification registry: ${validation.issues.join("; ")}`,
    );
  }

  return deepFreeze(registry);
}

export function registerDeploymentExecutionReceipt(registry, input) {
  const validation = validateProductionVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot extend invalid production verification registry: ${validation.issues.join("; ")}`,
    );
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("deployment execution receipt registration input required");
  }

  const receiptValidation = validateDeploymentExecutionReceipt(input.receipt);
  if (!receiptValidation.ok) {
    throw new Error(
      `invalid deployment execution receipt: ${receiptValidation.issues.join("; ")}`,
    );
  }

  if (
    registry.receipts.some(
      (record) => record.receipt_digest === input.receipt.receipt_digest,
    )
  ) {
    throw new Error(
      `deployment execution receipt ${input.receipt.receipt_digest} already registered`,
    );
  }

  const record = {
    record_id:
      `DEPLOY_RECEIPT:${input.receipt.release_key}:${input.receipt.target_environment}:${input.receipt.receipt_digest.slice(0, 12)}`,
    release_key: input.receipt.release_key,
    target_environment: input.receipt.target_environment,
    receipt_digest: input.receipt.receipt_digest,
    provider_result: input.receipt.provider.result,
    registered_at: cleanString(input.registered_at, "registered_at"),
    receipt: clone(input.receipt),
    record_digest: "",
  };
  record.record_digest = receiptRecordDigest(record);

  const next = clone(registry);
  next.receipts.push(record);
  next.registry_digest = registryDigest(next);

  const nextValidation = validateProductionVerificationRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(
      `receipt registration produced invalid registry: ${nextValidation.issues.join("; ")}`,
    );
  }

  return deepFreeze(next);
}

export function createPostDeploymentVerification(registry, input) {
  const validation = validateProductionVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot verify against invalid production verification registry: ${validation.issues.join("; ")}`,
    );
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("post-deployment verification input required");
  }

  const receiptDigestValue = cleanString(input.receipt_digest, "receipt_digest");
  const receiptRecord = receiptByDigest(registry, receiptDigestValue);
  if (!receiptRecord) {
    throw new Error(`deployment receipt ${receiptDigestValue} is not registered`);
  }

  const observedCommit = cleanString(
    input.observed_git_commit_sha,
    "observed_git_commit_sha",
  );
  if (!GIT_OID.test(observedCommit)) {
    throw new TypeError(
      "observed_git_commit_sha must be lowercase 40- or 64-character Git object id",
    );
  }
  if (observedCommit !== receiptRecord.receipt.expected_git_commit_sha) {
    throw new Error(
      `post-deployment observed commit ${observedCommit} does not match receipt commit ${receiptRecord.receipt.expected_git_commit_sha}`,
    );
  }

  if (!Array.isArray(input.checks) || input.checks.length === 0) {
    throw new TypeError("post-deployment verification requires at least one check");
  }

  const ids = new Set();
  const checks = input.checks.map((check, index) => {
    if (!check || typeof check !== "object") {
      throw new TypeError(`checks[${index}] must be object`);
    }
    const checkId = cleanString(check.check_id, `checks[${index}].check_id`);
    if (ids.has(checkId)) {
      throw new Error(`duplicate post-deployment check_id ${checkId}`);
    }
    ids.add(checkId);

    if (!["URL", "HEALTH", "SMOKE", "CUSTOM"].includes(check.kind)) {
      throw new TypeError(`unsupported post-deployment check kind ${check.kind}`);
    }
    if (!HNK_POST_DEPLOYMENT_CHECK_RESULTS.includes(check.result)) {
      throw new TypeError(
        `unsupported post-deployment check result ${check.result}`,
      );
    }

    return {
      check_id: checkId,
      kind: check.kind,
      expected: cleanString(check.expected, `checks[${index}].expected`),
      observed: cleanString(check.observed, `checks[${index}].observed`),
      result: check.result,
      evidence_note: cleanString(
        check.evidence_note,
        `checks[${index}].evidence_note`,
      ),
      evidence_digest: sha256Hex(
        exactText(check.evidence_text, `checks[${index}].evidence_text`),
      ),
    };
  });

  const verification = {
    verification_id:
      `POST_DEPLOY:${receiptRecord.release_key}:${receiptRecord.target_environment}:${registry.verifications.length + 1}:${receiptDigestValue.slice(0, 12)}`,
    release_key: receiptRecord.release_key,
    target_environment: receiptRecord.target_environment,
    receipt_digest: receiptDigestValue,
    expected_git_commit_sha: receiptRecord.receipt.expected_git_commit_sha,
    observed_git_commit_sha: observedCommit,
    observed_url: cleanString(input.observed_url, "observed_url"),
    checks,
    overall_status: overallStatus(checks),
    verified_by: cleanString(input.verified_by, "verified_by"),
    verified_at: cleanString(input.verified_at, "verified_at"),
    verification_digest: "",
    network_checks_executed_by_contract: false,
    production_readiness_inferred: false,
    truth_assessed: false,
  };
  verification.verification_digest = verificationDigest(verification);

  if (
    registry.verifications.some(
      (entry) => entry.verification_digest === verification.verification_digest,
    )
  ) {
    throw new Error(
      `post-deployment verification ${verification.verification_digest} already registered`,
    );
  }

  const next = clone(registry);
  next.verifications.push(verification);
  next.registry_digest = registryDigest(next);

  const nextValidation = validateProductionVerificationRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(
      `post-deployment verification produced invalid registry: ${nextValidation.issues.join("; ")}`,
    );
  }

  return deepFreeze(next);
}

export function productionVerificationRegistryIndex(registry) {
  const validation = validateProductionVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot index invalid production verification registry: ${validation.issues.join("; ")}`,
    );
  }

  const keys = [];
  const seen = new Set();
  for (const receipt of registry.receipts) {
    const key = releaseEnvironmentKey(
      receipt.release_key,
      receipt.target_environment,
    );
    if (!seen.has(key)) {
      seen.add(key);
      keys.push({
        key,
        release_key: receipt.release_key,
        target_environment: receipt.target_environment,
      });
    }
  }

  const states = keys.map(({ release_key, target_environment }) => {
    const receipts = registry.receipts.filter(
      (record) =>
        record.release_key === release_key &&
        record.target_environment === target_environment,
    );
    const latestReceipt = receipts.at(-1);
    const verifications = registry.verifications.filter(
      (verification) =>
        verification.receipt_digest === latestReceipt.receipt_digest,
    );
    const latestVerification = verifications.at(-1) ?? null;
    const decisions = decisionsForReleaseEnvironment(
      registry,
      release_key,
      target_environment,
    );
    const currentDecision = decisions.at(-1) ?? null;
    const decisionOnLatest = Boolean(
      currentDecision &&
        latestVerification &&
        currentDecision.verification_digest ===
          latestVerification.verification_digest &&
        currentDecision.receipt_digest === latestReceipt.receipt_digest,
    );

    const productionAccepted = Boolean(
      decisionOnLatest &&
        currentDecision?.decision === "PRODUCTION_ACCEPTED" &&
        latestReceipt.provider_result === "SUCCEEDED" &&
        latestVerification?.overall_status === "PASS",
    );

    return {
      release_key,
      target_environment,
      receipt_count: receipts.length,
      latest_receipt_digest: latestReceipt.receipt_digest,
      latest_provider_result: latestReceipt.provider_result,
      verification_count_for_latest_receipt: verifications.length,
      latest_verification_digest:
        latestVerification?.verification_digest ?? null,
      latest_verification_status:
        latestVerification?.overall_status ?? null,
      decision_count: decisions.length,
      current_decision: currentDecision?.decision ?? null,
      current_decision_id: currentDecision?.decision_id ?? null,
      current_decision_is_on_latest_verification: decisionOnLatest,
      production_accepted: productionAccepted,
      human_production_gate_pending:
        Boolean(latestVerification) && !decisionOnLatest,
      verification_required: !latestVerification,
    };
  });

  return deepFreeze({
    registry_key: registry.registry_key,
    release_environments: states.length,
    receipts: registry.receipts.length,
    verifications: registry.verifications.length,
    decisions: registry.decisions.length,
    production_accepted: states.filter((state) => state.production_accepted).length,
    pending_human_gate: states.filter(
      (state) => state.human_production_gate_pending,
    ).length,
    awaiting_verification: states.filter(
      (state) => state.verification_required,
    ).length,
    pass_without_acceptance: states.filter(
      (state) =>
        state.latest_provider_result === "SUCCEEDED" &&
        state.latest_verification_status === "PASS" &&
        !state.production_accepted,
    ).length,
    states,
    machine_can_accept_production: false,
    network_checks_executed_by_registry: false,
    truth_assessed: false,
    production_readiness_inferred: false,
    canon_promotion_permitted: false,
  });
}

export function decideHumanProductionGate(registry, input) {
  const validation = validateProductionVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot decide invalid production verification registry: ${validation.issues.join("; ")}`,
    );
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("human production gate input required");
  }
  if (!HNK_PRODUCTION_GATE_DECISIONS.includes(input.decision)) {
    throw new TypeError(`unsupported production gate decision ${input.decision}`);
  }

  const releaseKey = cleanString(input.release_key, "release_key");
  const targetEnvironment = cleanString(
    input.target_environment,
    "target_environment",
  );
  const verificationDigestValue = cleanString(
    input.verification_digest,
    "verification_digest",
  );
  const verification = verificationByDigest(
    registry,
    verificationDigestValue,
  );
  if (!verification) {
    throw new Error(
      `post-deployment verification ${verificationDigestValue} is not registered`,
    );
  }
  if (
    verification.release_key !== releaseKey ||
    verification.target_environment !== targetEnvironment
  ) {
    throw new Error(
      "production decision release/environment does not match verification",
    );
  }

  const index = productionVerificationRegistryIndex(registry);
  const state = index.states.find(
    (entry) =>
      entry.release_key === releaseKey &&
      entry.target_environment === targetEnvironment,
  );
  if (!state) {
    throw new Error(
      `release/environment ${releaseKey}/${targetEnvironment} not found`,
    );
  }
  if (state.latest_verification_digest !== verificationDigestValue) {
    throw new Error(
      "human production decision must target latest verification for latest deployment receipt",
    );
  }

  const latestReceipt = receiptByDigest(
    registry,
    state.latest_receipt_digest,
  );
  if (!latestReceipt) {
    throw new Error("latest deployment receipt not found");
  }

  if (
    input.decision === "PRODUCTION_ACCEPTED" &&
    (
      latestReceipt.provider_result !== "SUCCEEDED" ||
      verification.overall_status !== "PASS"
    )
  ) {
    throw new Error(
      `PRODUCTION_ACCEPTED requires SUCCEEDED receipt and PASS verification; got receipt=${latestReceipt.provider_result}, verification=${verification.overall_status}`,
    );
  }

  const previous = decisionsForReleaseEnvironment(
    registry,
    releaseKey,
    targetEnvironment,
  ).at(-1) ?? null;

  const event = {
    decision_id:
      `PRODUCTION_GATE:${releaseKey}:${targetEnvironment}:${registry.decisions.filter(
        (entry) =>
          entry.release_key === releaseKey &&
          entry.target_environment === targetEnvironment,
      ).length + 1}:${verificationDigestValue.slice(0, 12)}`,
    release_key: releaseKey,
    target_environment: targetEnvironment,
    receipt_digest: latestReceipt.receipt_digest,
    verification_digest: verificationDigestValue,
    verification_status: verification.overall_status,
    decision: input.decision,
    reviewer: cleanString(input.reviewer, "reviewer"),
    decided_at: cleanString(input.decided_at, "decided_at"),
    explicit_human_signal: cleanString(
      input.explicit_human_signal,
      "explicit_human_signal",
    ),
    rationale: cleanString(input.rationale, "rationale"),
    supersedes_decision_id: previous?.decision_id ?? null,
    decision_digest: "",
    human_decision: true,
    machine_can_decide: false,
  };
  event.decision_digest = decisionDigest(event);

  const next = clone(registry);
  next.decisions.push(event);
  next.registry_digest = registryDigest(next);

  const nextValidation = validateProductionVerificationRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(
      `human production decision produced invalid registry: ${nextValidation.issues.join("; ")}`,
    );
  }

  return deepFreeze(next);
}

function validateReceiptRecord(record, issues, recordIds, receiptDigests) {
  if (!record || typeof record !== "object") {
    issues.push("deployment receipt record must be object");
    return;
  }

  for (const field of [
    "record_id",
    "release_key",
    "target_environment",
    "receipt_digest",
    "provider_result",
    "registered_at",
    "record_digest",
  ]) {
    if (!nonEmpty(record[field])) issues.push(`receipt record ${field} required`);
  }

  if (!HEX_64.test(record.receipt_digest ?? "")) {
    issues.push(`${record.record_id}: receipt_digest must be SHA-256 hex`);
  }
  if (!HEX_64.test(record.record_digest ?? "")) {
    issues.push(`${record.record_id}: record_digest must be SHA-256 hex`);
  }

  const receiptValidation = validateDeploymentExecutionReceipt(record.receipt);
  if (!receiptValidation.ok) {
    issues.push(
      ...receiptValidation.issues.map(
        (issue) => `${record.record_id}: receipt: ${issue}`,
      ),
    );
  } else {
    if (record.receipt.release_key !== record.release_key) {
      issues.push(`${record.record_id}: release_key drift`);
    }
    if (record.receipt.target_environment !== record.target_environment) {
      issues.push(`${record.record_id}: target_environment drift`);
    }
    if (record.receipt.receipt_digest !== record.receipt_digest) {
      issues.push(`${record.record_id}: receipt_digest drift`);
    }
    if (record.receipt.provider.result !== record.provider_result) {
      issues.push(`${record.record_id}: provider_result drift`);
    }
  }

  if (
    HEX_64.test(record.record_digest ?? "") &&
    receiptRecordDigest(record) !== record.record_digest
  ) {
    issues.push(`${record.record_id}: record_digest mismatch`);
  }

  if (recordIds.has(record.record_id)) {
    issues.push(`duplicate record_id ${record.record_id}`);
  }
  recordIds.add(record.record_id);

  if (receiptDigests.has(record.receipt_digest)) {
    issues.push(`duplicate receipt_digest ${record.receipt_digest}`);
  }
  receiptDigests.add(record.receipt_digest);
}

function validateVerification(verification, registry, issues, ids, digests) {
  if (!verification || typeof verification !== "object") {
    issues.push("post-deployment verification must be object");
    return;
  }

  for (const field of [
    "verification_id",
    "release_key",
    "target_environment",
    "receipt_digest",
    "expected_git_commit_sha",
    "observed_git_commit_sha",
    "observed_url",
    "overall_status",
    "verified_by",
    "verified_at",
    "verification_digest",
  ]) {
    if (!nonEmpty(verification[field])) {
      issues.push(`post-deployment verification ${field} required`);
    }
  }

  if (!HEX_64.test(verification.receipt_digest ?? "")) {
    issues.push(`${verification.verification_id}: receipt_digest must be SHA-256 hex`);
  }
  if (!GIT_OID.test(verification.expected_git_commit_sha ?? "")) {
    issues.push(
      `${verification.verification_id}: expected_git_commit_sha invalid`,
    );
  }
  if (!GIT_OID.test(verification.observed_git_commit_sha ?? "")) {
    issues.push(
      `${verification.verification_id}: observed_git_commit_sha invalid`,
    );
  }
  if (
    verification.expected_git_commit_sha !==
    verification.observed_git_commit_sha
  ) {
    issues.push(
      `${verification.verification_id}: observed commit must equal expected commit`,
    );
  }

  const receiptRecord = receiptByDigest(registry, verification.receipt_digest);
  if (!receiptRecord) {
    issues.push(
      `${verification.verification_id}: target receipt is not registered`,
    );
  } else {
    if (receiptRecord.release_key !== verification.release_key) {
      issues.push(`${verification.verification_id}: release_key drift`);
    }
    if (receiptRecord.target_environment !== verification.target_environment) {
      issues.push(`${verification.verification_id}: target_environment drift`);
    }
    if (
      receiptRecord.receipt.expected_git_commit_sha !==
      verification.expected_git_commit_sha
    ) {
      issues.push(
        `${verification.verification_id}: expected Git commit does not match receipt`,
      );
    }
  }

  if (!Array.isArray(verification.checks) || verification.checks.length === 0) {
    issues.push(`${verification.verification_id}: checks must be non-empty array`);
  } else {
    const checkIds = new Set();
    for (const [index, check] of verification.checks.entries()) {
      if (!nonEmpty(check?.check_id)) {
        issues.push(
          `${verification.verification_id}: checks[${index}].check_id required`,
        );
      }
      if (!["URL", "HEALTH", "SMOKE", "CUSTOM"].includes(check?.kind)) {
        issues.push(
          `${verification.verification_id}: checks[${index}].kind unsupported`,
        );
      }
      if (!nonEmpty(check?.expected)) {
        issues.push(
          `${verification.verification_id}: checks[${index}].expected required`,
        );
      }
      if (!nonEmpty(check?.observed)) {
        issues.push(
          `${verification.verification_id}: checks[${index}].observed required`,
        );
      }
      if (!HNK_POST_DEPLOYMENT_CHECK_RESULTS.includes(check?.result)) {
        issues.push(
          `${verification.verification_id}: checks[${index}].result unsupported`,
        );
      }
      if (!nonEmpty(check?.evidence_note)) {
        issues.push(
          `${verification.verification_id}: checks[${index}].evidence_note required`,
        );
      }
      if (!HEX_64.test(check?.evidence_digest ?? "")) {
        issues.push(
          `${verification.verification_id}: checks[${index}].evidence_digest invalid`,
        );
      }
      if (checkIds.has(check?.check_id)) {
        issues.push(
          `${verification.verification_id}: duplicate check_id ${check?.check_id}`,
        );
      }
      checkIds.add(check?.check_id);
    }

    const expectedOverall = overallStatus(verification.checks);
    if (verification.overall_status !== expectedOverall) {
      issues.push(
        `${verification.verification_id}: overall_status drift; expected ${expectedOverall}`,
      );
    }
  }

  if (!HNK_POST_DEPLOYMENT_OVERALL_STATUSES.includes(verification.overall_status)) {
    issues.push(`${verification.verification_id}: overall_status unsupported`);
  }
  if (verification.network_checks_executed_by_contract !== false) {
    issues.push(
      `${verification.verification_id}: network_checks_executed_by_contract must remain false`,
    );
  }
  if (verification.production_readiness_inferred !== false) {
    issues.push(
      `${verification.verification_id}: production_readiness_inferred must remain false`,
    );
  }
  if (verification.truth_assessed !== false) {
    issues.push(
      `${verification.verification_id}: truth_assessed must remain false`,
    );
  }

  if (!HEX_64.test(verification.verification_digest ?? "")) {
    issues.push(
      `${verification.verification_id}: verification_digest must be SHA-256 hex`,
    );
  } else if (verificationDigest(verification) !== verification.verification_digest) {
    issues.push(`${verification.verification_id}: verification_digest mismatch`);
  }

  if (ids.has(verification.verification_id)) {
    issues.push(`duplicate verification_id ${verification.verification_id}`);
  }
  ids.add(verification.verification_id);

  if (digests.has(verification.verification_digest)) {
    issues.push(
      `duplicate verification_digest ${verification.verification_digest}`,
    );
  }
  digests.add(verification.verification_digest);
}

function validateDecisions(registry, issues) {
  const ids = new Set();
  const lastByReleaseEnvironment = new Map();

  for (const event of registry.decisions) {
    if (!event || typeof event !== "object") {
      issues.push("production decision event must be object");
      continue;
    }

    for (const field of [
      "decision_id",
      "release_key",
      "target_environment",
      "receipt_digest",
      "verification_digest",
      "verification_status",
      "decision",
      "reviewer",
      "decided_at",
      "explicit_human_signal",
      "rationale",
      "decision_digest",
    ]) {
      if (!nonEmpty(event[field])) {
        issues.push(`production decision ${field} required`);
      }
    }

    if (!HEX_64.test(event.receipt_digest ?? "")) {
      issues.push(`${event.decision_id}: receipt_digest invalid`);
    }
    if (!HEX_64.test(event.verification_digest ?? "")) {
      issues.push(`${event.decision_id}: verification_digest invalid`);
    }
    if (!HEX_64.test(event.decision_digest ?? "")) {
      issues.push(`${event.decision_id}: decision_digest invalid`);
    }
    if (!HNK_POST_DEPLOYMENT_OVERALL_STATUSES.includes(event.verification_status)) {
      issues.push(`${event.decision_id}: verification_status unsupported`);
    }
    if (!HNK_PRODUCTION_GATE_DECISIONS.includes(event.decision)) {
      issues.push(`${event.decision_id}: decision unsupported`);
    }

    const verification = verificationByDigest(
      registry,
      event.verification_digest,
    );
    if (!verification) {
      issues.push(`${event.decision_id}: target verification not registered`);
    } else {
      if (verification.release_key !== event.release_key) {
        issues.push(`${event.decision_id}: release_key drift`);
      }
      if (verification.target_environment !== event.target_environment) {
        issues.push(`${event.decision_id}: target_environment drift`);
      }
      if (verification.receipt_digest !== event.receipt_digest) {
        issues.push(`${event.decision_id}: receipt_digest drift`);
      }
      if (verification.overall_status !== event.verification_status) {
        issues.push(`${event.decision_id}: verification_status drift`);
      }

      const receiptRecord = receiptByDigest(
        registry,
        verification.receipt_digest,
      );
      if (
        event.decision === "PRODUCTION_ACCEPTED" &&
        (
          receiptRecord?.provider_result !== "SUCCEEDED" ||
          verification.overall_status !== "PASS"
        )
      ) {
        issues.push(
          `${event.decision_id}: PRODUCTION_ACCEPTED requires SUCCEEDED receipt and PASS verification`,
        );
      }
    }

    if (event.human_decision !== true) {
      issues.push(`${event.decision_id}: human_decision must remain true`);
    }
    if (event.machine_can_decide !== false) {
      issues.push(`${event.decision_id}: machine_can_decide must remain false`);
    }

    const key = releaseEnvironmentKey(
      event.release_key,
      event.target_environment,
    );
    const expectedPrevious = lastByReleaseEnvironment.get(key) ?? null;
    if (event.supersedes_decision_id !== expectedPrevious) {
      issues.push(
        `${event.decision_id}: production decision chain drift; expected supersedes ${expectedPrevious ?? "null"}`,
      );
    }
    lastByReleaseEnvironment.set(key, event.decision_id);

    if (
      HEX_64.test(event.decision_digest ?? "") &&
      decisionDigest(event) !== event.decision_digest
    ) {
      issues.push(`${event.decision_id}: decision_digest mismatch`);
    }

    if (ids.has(event.decision_id)) {
      issues.push(`duplicate decision_id ${event.decision_id}`);
    }
    ids.add(event.decision_id);
  }
}

export function validateProductionVerificationRegistry(registry) {
  const issues = [];

  if (!registry || typeof registry !== "object") {
    return deepFreeze({ ok: false, issues: ["registry must be object"] });
  }

  if (registry.registry_id !== HNK_PRODUCTION_VERIFICATION_REGISTRY_ID) {
    issues.push(`unexpected registry_id ${registry.registry_id}`);
  }
  if (registry.registry_version !== HNK_PRODUCTION_VERIFICATION_REGISTRY_VERSION) {
    issues.push(`unexpected registry_version ${registry.registry_version}`);
  }
  if (registry.authority !== "HNK_AUTHORED_PRODUCTION_VERIFICATION_REGISTRY") {
    issues.push(`unexpected authority ${registry.authority}`);
  }

  for (const field of ["registry_key", "title", "created_at"]) {
    if (!nonEmpty(registry[field])) issues.push(`${field} required`);
  }

  if (!Array.isArray(registry.receipts)) {
    issues.push("receipts must be array");
  } else {
    const ids = new Set();
    const digests = new Set();
    for (const record of registry.receipts) {
      validateReceiptRecord(record, issues, ids, digests);
    }
  }

  if (!Array.isArray(registry.verifications)) {
    issues.push("verifications must be array");
  } else if (Array.isArray(registry.receipts)) {
    const ids = new Set();
    const digests = new Set();
    for (const verification of registry.verifications) {
      validateVerification(verification, registry, issues, ids, digests);
    }
  }

  if (!Array.isArray(registry.decisions)) {
    issues.push("decisions must be array");
  } else if (
    Array.isArray(registry.receipts) &&
    Array.isArray(registry.verifications)
  ) {
    validateDecisions(registry, issues);
  }

  const locks = {
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    immutable_receipt_history: true,
    immutable_verification_history: true,
    immutable_decision_history: true,
    human_production_gate_required: true,
    deployment_succeeded_auto_accepts_production: false,
    post_deployment_pass_auto_accepts_production: false,
    latest_receipt_and_verification_required: true,
    production_accept_requires_succeeded_receipt_and_pass_verification: true,
    machine_can_accept_production: false,
    network_checks_executed_by_registry: false,
    automatic_truth_inference: false,
    production_readiness_inferred: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_PRODUCTION_VERIFICATION_REGISTRY_BOUNDARY,
  };

  for (const [field, expected] of Object.entries(locks)) {
    if (registry[field] !== expected) {
      issues.push(`${field} must remain ${String(expected)}`);
    }
  }

  if (!HEX_64.test(registry.registry_digest ?? "")) {
    issues.push("registry_digest must be SHA-256 hex");
  } else if (registryDigest(registry) !== registry.registry_digest) {
    issues.push("registry_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function serializeProductionVerificationRegistry(registry) {
  const validation = validateProductionVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot serialize invalid production verification registry: ${validation.issues.join("; ")}`,
    );
  }
  return `${JSON.stringify(registry, null, 2)}\n`;
}

export function parseProductionVerificationRegistry(text) {
  if (!nonEmpty(text)) {
    throw new TypeError("production verification registry JSON text required");
  }

  let registry;
  try {
    registry = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid production verification registry JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateProductionVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `invalid production verification registry: ${validation.issues.join("; ")}`,
    );
  }

  return deepFreeze(registry);
}

export function productionVerificationRegistrySummary() {
  return deepFreeze({
    registry_id: HNK_PRODUCTION_VERIFICATION_REGISTRY_ID,
    version: HNK_PRODUCTION_VERIFICATION_REGISTRY_VERSION,
    append_only_receipt_history: true,
    append_only_post_deployment_verification_history: true,
    append_only_human_production_decision_history: true,
    deployment_succeeded_auto_accepts_production: false,
    post_deployment_pass_auto_accepts_production: false,
    latest_receipt_and_verification_required: true,
    production_accept_requires_succeeded_receipt_and_pass_verification: true,
    new_receipt_reopens_production_gate: true,
    new_verification_reopens_production_gate: true,
    explicit_human_production_gate_required: true,
    machine_can_accept_production: false,
    network_checks_executed_by_registry: false,
    production_readiness_inferred: false,
    truth_assessed: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    persistence: "USER_CONTROLLED_FILE_ONLY",
    claim_boundary: HNK_PRODUCTION_VERIFICATION_REGISTRY_BOUNDARY,
  });
}
