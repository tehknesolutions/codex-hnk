import { sha256Canonical, sha256Hex } from "@hnk/experiment-attestation";
import {
  evaluateDeploymentCandidate,
  validateDeploymentGateRegistry,
} from "@hnk/deployment-gate-registry";
import {
  releaseVerificationRegistryIndex,
  validateReleaseVerificationRegistry,
} from "@hnk/release-verification-registry";

export const HNK_DEPLOYMENT_EXECUTION_RECEIPT_ID =
  "HNK_DEPLOYMENT_EXECUTION_RECEIPT_V1";
export const HNK_DEPLOYMENT_EXECUTION_RECEIPT_VERSION = "1.0.0";
export const HNK_DEPLOYMENT_EXECUTION_RECEIPT_BOUNDARY =
  "DEPLOYMENT_RECEIPT_ATTESTS_RECORDED_EXECUTION_METADATA_AGAINST_CURRENT_HUMAN_AUTHORIZATION_NOT_PROVIDER_SIGNATURE_READINESS_TRUTH_OR_CANON";
export const HNK_DEPLOYMENT_EXECUTION_RESULTS = Object.freeze([
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "UNKNOWN",
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
  if (!nonEmpty(value)) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function exactText(value, field) {
  if (!nonEmpty(value)) {
    throw new TypeError(`${field} must be non-empty text`);
  }
  return value;
}

export function deploymentExecutionReceiptProjection(receipt) {
  const projected = clone(receipt);
  delete projected.receipt_digest;
  return deepFreeze(projected);
}

function receiptDigest(receipt) {
  return sha256Canonical(deploymentExecutionReceiptProjection(receipt));
}

function releaseState(releaseRegistry, releaseKey) {
  const index = releaseVerificationRegistryIndex(releaseRegistry);
  const status = index.statuses.find((entry) => entry.release_key === releaseKey) ?? null;
  if (!status) return null;

  const reportRecord = releaseRegistry.reports.find(
    (entry) => entry.report_digest === status.latest_report_digest,
  ) ?? null;
  const releaseDecision = status.current_decision_id
    ? releaseRegistry.decisions.find(
        (entry) => entry.decision_id === status.current_decision_id,
      ) ?? null
    : null;

  return { status, reportRecord, releaseDecision };
}

function expectedGitCommit(reportRecord) {
  const check = reportRecord?.report?.checks?.find(
    (entry) => entry.check_id === "GIT:COMMIT",
  );
  const expected = check?.expected;
  if (!nonEmpty(expected) || !GIT_OID.test(expected)) {
    throw new Error(
      "current Verification Report does not expose a valid expected GIT:COMMIT binding",
    );
  }
  return expected;
}

function latestApprovedDeploymentDecision(deploymentRegistry, candidateId) {
  const decision = deploymentRegistry.decisions
    .filter((event) => event.candidate_id === candidateId)
    .at(-1) ?? null;
  if (!decision || decision.decision !== "DEPLOYMENT_APPROVED") {
    throw new Error(
      `candidate ${candidateId} does not have current DEPLOYMENT_APPROVED decision`,
    );
  }
  return decision;
}

export function createDeploymentExecutionReceipt(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("deployment execution receipt input required");
  }

  const deploymentValidation = validateDeploymentGateRegistry(
    input.deployment_gate_registry,
  );
  if (!deploymentValidation.ok) {
    throw new Error(
      `invalid deployment gate registry: ${deploymentValidation.issues.join("; ")}`,
    );
  }

  const releaseValidation = validateReleaseVerificationRegistry(
    input.release_verification_registry,
  );
  if (!releaseValidation.ok) {
    throw new Error(
      `invalid release verification registry: ${releaseValidation.issues.join("; ")}`,
    );
  }

  const candidateId = cleanString(input.candidate_id, "candidate_id");
  const candidate = input.deployment_gate_registry.candidates.find(
    (entry) => entry.candidate_id === candidateId,
  );
  if (!candidate) {
    throw new Error(`deployment candidate ${candidateId} not found`);
  }

  const evaluation = evaluateDeploymentCandidate(
    input.deployment_gate_registry,
    input.release_verification_registry,
    candidateId,
  );
  if (!evaluation.approved_for_deployment) {
    throw new Error(
      `deployment receipt requires currently approved candidate; current eligibility=${evaluation.eligibility_status}, decision=${evaluation.latest_deployment_decision ?? "NONE"}`,
    );
  }

  const deploymentDecision = latestApprovedDeploymentDecision(
    input.deployment_gate_registry,
    candidateId,
  );

  const state = releaseState(
    input.release_verification_registry,
    candidate.release_key,
  );
  if (!state?.status?.accepted || !state.reportRecord || !state.releaseDecision) {
    throw new Error(
      `release ${candidate.release_key} must remain currently accepted with report/decision bindings`,
    );
  }

  if (state.status.latest_report_digest !== candidate.report_digest) {
    throw new Error("candidate report binding is stale");
  }
  if (state.status.current_decision_id !== candidate.release_decision_id) {
    throw new Error("candidate release decision binding is stale");
  }
  if (state.releaseDecision.decision_digest !== candidate.release_decision_digest) {
    throw new Error("candidate release decision digest is stale");
  }

  const expectedCommit = expectedGitCommit(state.reportRecord);
  const observedCommit = cleanString(
    input.observed_git_commit_sha,
    "observed_git_commit_sha",
  );
  if (!GIT_OID.test(observedCommit)) {
    throw new TypeError(
      "observed_git_commit_sha must be lowercase 40- or 64-character Git object id",
    );
  }
  if (observedCommit !== expectedCommit) {
    throw new Error(
      `observed deployment commit ${observedCommit} does not match approved release commit ${expectedCommit}`,
    );
  }

  const provider = input.provider ?? {};
  if (!HNK_DEPLOYMENT_EXECUTION_RESULTS.includes(provider.result)) {
    throw new TypeError(
      `unsupported deployment execution result ${provider.result}`,
    );
  }
  const providerPayloadText = exactText(
    provider.provider_payload_text,
    "provider.provider_payload_text",
  );

  const deploymentUrl =
    provider.deployment_url === undefined || provider.deployment_url === null
      ? null
      : cleanString(provider.deployment_url, "provider.deployment_url");

  const execution = input.execution ?? {};
  const startedAt =
    execution.started_at === undefined || execution.started_at === null
      ? null
      : cleanString(execution.started_at, "execution.started_at");

  const receipt = {
    receipt_id: HNK_DEPLOYMENT_EXECUTION_RECEIPT_ID,
    receipt_version: HNK_DEPLOYMENT_EXECUTION_RECEIPT_VERSION,
    authority: "HNK_AUTHORED_DEPLOYMENT_EXECUTION_RECEIPT",
    receipt_key: cleanString(input.receipt_key, "receipt_key"),
    created_at: cleanString(input.created_at, "created_at"),
    release_key: candidate.release_key,
    candidate_id: candidate.candidate_id,
    candidate_digest: candidate.candidate_digest,
    deployment_decision_id: deploymentDecision.deployment_decision_id,
    deployment_decision_digest: deploymentDecision.decision_digest,
    source_deployment_gate_registry_digest:
      input.deployment_gate_registry.registry_digest,
    source_release_verification_registry_digest:
      input.release_verification_registry.registry_digest,
    source_report_digest: state.status.latest_report_digest,
    source_release_decision_id: state.status.current_decision_id,
    source_release_decision_digest: state.releaseDecision.decision_digest,
    target_environment: candidate.target_environment,
    expected_git_commit_sha: expectedCommit,
    observed_git_commit_sha: observedCommit,
    provider: {
      name: cleanString(provider.name, "provider.name"),
      deployment_id: cleanString(
        provider.deployment_id,
        "provider.deployment_id",
      ),
      deployment_url: deploymentUrl,
      result: provider.result,
    },
    execution: {
      started_at: startedAt,
      completed_at: cleanString(
        execution.completed_at,
        "execution.completed_at",
      ),
      observed_by: cleanString(execution.observed_by, "execution.observed_by"),
      observed_at: cleanString(execution.observed_at, "execution.observed_at"),
      evidence_note: cleanString(
        execution.evidence_note,
        "execution.evidence_note",
      ),
      provider_payload_digest: sha256Hex(providerPayloadText),
    },
    receipt_digest: "",
    deployment_authorization_current_at_receipt_creation: true,
    deployment_execution_recorded: true,
    deployment_execution_performed_by_contract: false,
    provider_signature_verified: false,
    content_integrity_scope: true,
    production_readiness_inferred: false,
    truth_assessed: false,
    authorship_proof: false,
    trusted_timestamp_proof: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_DEPLOYMENT_EXECUTION_RECEIPT_BOUNDARY,
  };

  receipt.receipt_digest = receiptDigest(receipt);

  const validation = validateDeploymentExecutionReceipt(receipt);
  if (!validation.ok) {
    throw new Error(
      `invalid deployment execution receipt: ${validation.issues.join("; ")}`,
    );
  }

  return deepFreeze(receipt);
}

export function validateDeploymentExecutionReceipt(receipt) {
  const issues = [];

  if (!receipt || typeof receipt !== "object") {
    return deepFreeze({ ok: false, issues: ["receipt must be object"] });
  }

  if (receipt.receipt_id !== HNK_DEPLOYMENT_EXECUTION_RECEIPT_ID) {
    issues.push(`unexpected receipt_id ${receipt.receipt_id}`);
  }
  if (receipt.receipt_version !== HNK_DEPLOYMENT_EXECUTION_RECEIPT_VERSION) {
    issues.push(`unexpected receipt_version ${receipt.receipt_version}`);
  }
  if (receipt.authority !== "HNK_AUTHORED_DEPLOYMENT_EXECUTION_RECEIPT") {
    issues.push(`unexpected authority ${receipt.authority}`);
  }

  for (const field of [
    "receipt_key",
    "created_at",
    "release_key",
    "candidate_id",
    "candidate_digest",
    "deployment_decision_id",
    "deployment_decision_digest",
    "source_deployment_gate_registry_digest",
    "source_release_verification_registry_digest",
    "source_report_digest",
    "source_release_decision_id",
    "source_release_decision_digest",
    "target_environment",
    "expected_git_commit_sha",
    "observed_git_commit_sha",
  ]) {
    if (!nonEmpty(receipt[field])) issues.push(`${field} required`);
  }

  for (const field of [
    "candidate_digest",
    "deployment_decision_digest",
    "source_deployment_gate_registry_digest",
    "source_release_verification_registry_digest",
    "source_report_digest",
    "source_release_decision_digest",
  ]) {
    if (!HEX_64.test(receipt[field] ?? "")) {
      issues.push(`${field} must be SHA-256 hex`);
    }
  }

  if (!GIT_OID.test(receipt.expected_git_commit_sha ?? "")) {
    issues.push("expected_git_commit_sha must be valid Git object id");
  }
  if (!GIT_OID.test(receipt.observed_git_commit_sha ?? "")) {
    issues.push("observed_git_commit_sha must be valid Git object id");
  }
  if (
    nonEmpty(receipt.expected_git_commit_sha) &&
    nonEmpty(receipt.observed_git_commit_sha) &&
    receipt.expected_git_commit_sha !== receipt.observed_git_commit_sha
  ) {
    issues.push("observed_git_commit_sha must equal expected_git_commit_sha");
  }

  if (!receipt.provider || typeof receipt.provider !== "object") {
    issues.push("provider required");
  } else {
    if (!nonEmpty(receipt.provider.name)) issues.push("provider.name required");
    if (!nonEmpty(receipt.provider.deployment_id)) {
      issues.push("provider.deployment_id required");
    }
    if (
      receipt.provider.deployment_url !== null &&
      !nonEmpty(receipt.provider.deployment_url)
    ) {
      issues.push("provider.deployment_url must be null or non-empty");
    }
    if (!HNK_DEPLOYMENT_EXECUTION_RESULTS.includes(receipt.provider.result)) {
      issues.push("provider.result unsupported");
    }
  }

  if (!receipt.execution || typeof receipt.execution !== "object") {
    issues.push("execution required");
  } else {
    if (
      receipt.execution.started_at !== null &&
      !nonEmpty(receipt.execution.started_at)
    ) {
      issues.push("execution.started_at must be null or non-empty");
    }
    for (const field of [
      "completed_at",
      "observed_by",
      "observed_at",
      "evidence_note",
    ]) {
      if (!nonEmpty(receipt.execution[field])) {
        issues.push(`execution.${field} required`);
      }
    }
    if (!HEX_64.test(receipt.execution.provider_payload_digest ?? "")) {
      issues.push("execution.provider_payload_digest must be SHA-256 hex");
    }
  }

  const locks = {
    deployment_authorization_current_at_receipt_creation: true,
    deployment_execution_recorded: true,
    deployment_execution_performed_by_contract: false,
    provider_signature_verified: false,
    content_integrity_scope: true,
    production_readiness_inferred: false,
    truth_assessed: false,
    authorship_proof: false,
    trusted_timestamp_proof: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_DEPLOYMENT_EXECUTION_RECEIPT_BOUNDARY,
  };

  for (const [field, expected] of Object.entries(locks)) {
    if (receipt[field] !== expected) {
      issues.push(`${field} must remain ${String(expected)}`);
    }
  }

  if (!HEX_64.test(receipt.receipt_digest ?? "")) {
    issues.push("receipt_digest must be SHA-256 hex");
  } else if (receiptDigest(receipt) !== receipt.receipt_digest) {
    issues.push("receipt_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function serializeDeploymentExecutionReceipt(receipt) {
  const validation = validateDeploymentExecutionReceipt(receipt);
  if (!validation.ok) {
    throw new Error(
      `cannot serialize invalid deployment execution receipt: ${validation.issues.join("; ")}`,
    );
  }
  return `${JSON.stringify(receipt, null, 2)}\n`;
}

export function parseDeploymentExecutionReceipt(text) {
  if (!nonEmpty(text)) {
    throw new TypeError("deployment execution receipt JSON text required");
  }

  let receipt;
  try {
    receipt = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid deployment execution receipt JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateDeploymentExecutionReceipt(receipt);
  if (!validation.ok) {
    throw new Error(
      `invalid deployment execution receipt: ${validation.issues.join("; ")}`,
    );
  }

  return deepFreeze(receipt);
}

export function deploymentExecutionReceiptSummary() {
  return deepFreeze({
    receipt_id: HNK_DEPLOYMENT_EXECUTION_RECEIPT_ID,
    version: HNK_DEPLOYMENT_EXECUTION_RECEIPT_VERSION,
    requires_current_approved_deployment_candidate: true,
    exact_git_commit_match_required: true,
    provider_payload_sha256_binding: true,
    deployment_approval_is_not_execution: true,
    deployment_execution_recorded: true,
    deployment_execution_performed_by_contract: false,
    provider_signature_verified: false,
    success_does_not_infer_production_readiness: true,
    production_readiness_inferred: false,
    truth_assessed: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    persistence: "USER_CONTROLLED_FILE_ONLY",
    claim_boundary: HNK_DEPLOYMENT_EXECUTION_RECEIPT_BOUNDARY,
  });
}
