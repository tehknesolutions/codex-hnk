import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  releaseVerificationRegistryIndex,
  validateReleaseVerificationRegistry,
} from "@hnk/release-verification-registry";

export const HNK_DEPLOYMENT_GATE_REGISTRY_ID =
  "HNK_DEPLOYMENT_GATE_REGISTRY_V1";
export const HNK_DEPLOYMENT_GATE_REGISTRY_VERSION = "1.0.0";
export const HNK_DEPLOYMENT_GATE_REGISTRY_BOUNDARY =
  "DEPLOYMENT_GATE_BINDS_EXPLICIT_HUMAN_DEPLOYMENT_AUTHORIZATION_TO_CURRENT_ACCEPTED_RELEASE_STATE_NOT_EXECUTION_READINESS_TRUTH_OR_CANON";
export const HNK_DEPLOYMENT_GATE_DECISIONS = Object.freeze([
  "DEPLOYMENT_APPROVED",
  "DEPLOYMENT_REJECTED",
  "DEPLOYMENT_HELD",
]);
export const HNK_DEPLOYMENT_ELIGIBILITY_STATUSES = Object.freeze([
  "ELIGIBLE",
  "STALE_RELEASE_STATE",
  "RELEASE_NOT_ACCEPTED",
  "RELEASE_NOT_FOUND",
  "CANDIDATE_NOT_FOUND",
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

function candidateProjection(candidate) {
  const projected = clone(candidate);
  delete projected.candidate_digest;
  return projected;
}

function candidateDigest(candidate) {
  return sha256Canonical(candidateProjection(candidate));
}

function decisionProjection(decision) {
  const projected = clone(decision);
  delete projected.decision_digest;
  return projected;
}

function decisionDigest(decision) {
  return sha256Canonical(decisionProjection(decision));
}

export function deploymentGateRegistryProjection(registry) {
  const projected = clone(registry);
  delete projected.registry_digest;
  return deepFreeze(projected);
}

function registryDigest(registry) {
  return sha256Canonical(deploymentGateRegistryProjection(registry));
}

function latestDeploymentDecision(registry, candidateId) {
  return registry.decisions
    .filter((event) => event.candidate_id === candidateId)
    .at(-1) ?? null;
}

function releaseState(releaseVerificationRegistry, releaseKey) {
  const index = releaseVerificationRegistryIndex(releaseVerificationRegistry);
  const status = index.statuses.find((entry) => entry.release_key === releaseKey) ?? null;
  if (!status) return null;

  const report = releaseVerificationRegistry.reports.find(
    (entry) => entry.report_digest === status.latest_report_digest,
  ) ?? null;

  const decision = status.current_decision_id
    ? releaseVerificationRegistry.decisions.find(
        (entry) => entry.decision_id === status.current_decision_id,
      ) ?? null
    : null;

  return { status, report, decision };
}

export function createDeploymentGateRegistry(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("deployment gate registry input required");
  }

  const registry = {
    registry_id: HNK_DEPLOYMENT_GATE_REGISTRY_ID,
    registry_version: HNK_DEPLOYMENT_GATE_REGISTRY_VERSION,
    authority: "HNK_AUTHORED_DEPLOYMENT_GATE_REGISTRY",
    registry_key: cleanString(input.registry_key, "registry_key"),
    title: cleanString(input.title, "title"),
    created_at: cleanString(input.created_at, "created_at"),
    candidates: [],
    decisions: [],
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    immutable_candidate_history: true,
    immutable_decision_history: true,
    human_deployment_gate_required: true,
    release_accepted_auto_approves_deployment: false,
    machine_can_nominate: false,
    machine_can_approve_deployment: false,
    deployment_execution_performed_by_registry: false,
    automatic_truth_inference: false,
    production_readiness_inferred: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_DEPLOYMENT_GATE_REGISTRY_BOUNDARY,
  };

  registry.registry_digest = registryDigest(registry);
  const validation = validateDeploymentGateRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `invalid deployment gate registry: ${validation.issues.join("; ")}`,
    );
  }
  return deepFreeze(registry);
}

export function nominateDeploymentCandidate(registry, input) {
  const validation = validateDeploymentGateRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot extend invalid deployment gate registry: ${validation.issues.join("; ")}`,
    );
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("deployment candidate nomination input required");
  }

  const releaseValidation = validateReleaseVerificationRegistry(
    input.release_verification_registry,
  );
  if (!releaseValidation.ok) {
    throw new Error(
      `invalid release verification registry: ${releaseValidation.issues.join("; ")}`,
    );
  }

  const releaseKey = cleanString(input.release_key, "release_key");
  const targetEnvironment = cleanString(
    input.target_environment,
    "target_environment",
  );
  const state = releaseState(input.release_verification_registry, releaseKey);
  if (!state) {
    throw new Error(`release ${releaseKey} not found in verification registry`);
  }
  if (!state.status.accepted) {
    throw new Error(
      `release ${releaseKey} must be currently RELEASE_ACCEPTED on its latest report before deployment nomination`,
    );
  }
  if (!state.report || !state.decision) {
    throw new Error(`release ${releaseKey} accepted state is incomplete`);
  }

  const duplicate = registry.candidates.find(
    (candidate) =>
      candidate.release_key === releaseKey &&
      candidate.target_environment === targetEnvironment &&
      candidate.report_digest === state.status.latest_report_digest &&
      candidate.release_decision_id === state.status.current_decision_id,
  );
  if (duplicate) {
    throw new Error(
      `deployment candidate already exists for release ${releaseKey}, report ${state.status.latest_report_digest}, environment ${targetEnvironment}`,
    );
  }

  const candidate = {
    candidate_id:
      `DEPLOY_CANDIDATE:${releaseKey}:${registry.candidates.length + 1}:${state.status.latest_report_digest.slice(0, 12)}`,
    release_key: releaseKey,
    target_environment: targetEnvironment,
    source_release_registry_digest:
      input.release_verification_registry.registry_digest,
    report_digest: state.status.latest_report_digest,
    report_overall_status: state.status.latest_report_status,
    release_decision_id: state.status.current_decision_id,
    release_decision_digest: state.decision.decision_digest,
    nominated_by: cleanString(input.nominated_by, "nominated_by"),
    nominated_at: cleanString(input.nominated_at, "nominated_at"),
    explicit_human_signal: cleanString(
      input.explicit_human_signal,
      "explicit_human_signal",
    ),
    rationale: cleanString(input.rationale, "rationale"),
    candidate_digest: "",
    human_nomination: true,
    machine_can_nominate: false,
    automatic_deployment: false,
    deployment_executed: false,
  };
  candidate.candidate_digest = candidateDigest(candidate);

  const next = clone(registry);
  next.candidates.push(candidate);
  next.registry_digest = registryDigest(next);

  const nextValidation = validateDeploymentGateRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(
      `deployment candidate nomination produced invalid registry: ${nextValidation.issues.join("; ")}`,
    );
  }
  return deepFreeze(next);
}

export function evaluateDeploymentCandidate(
  registry,
  releaseVerificationRegistry,
  candidateId,
) {
  const registryValidation = validateDeploymentGateRegistry(registry);
  if (!registryValidation.ok) {
    throw new Error(
      `cannot evaluate invalid deployment gate registry: ${registryValidation.issues.join("; ")}`,
    );
  }
  const releaseValidation = validateReleaseVerificationRegistry(
    releaseVerificationRegistry,
  );
  if (!releaseValidation.ok) {
    throw new Error(
      `cannot evaluate against invalid release verification registry: ${releaseValidation.issues.join("; ")}`,
    );
  }

  const id = cleanString(candidateId, "candidateId");
  const candidate = registry.candidates.find((entry) => entry.candidate_id === id);
  if (!candidate) {
    return deepFreeze({
      candidate_id: id,
      release_key: "",
      target_environment: "",
      eligibility_status: "CANDIDATE_NOT_FOUND",
      release_exists: false,
      release_accepted: false,
      latest_report_matches_candidate: false,
      release_decision_matches_candidate: false,
      latest_deployment_decision: null,
      latest_deployment_decision_id: null,
      approved_for_deployment: false,
      human_deployment_gate_pending: false,
      deployment_executed: false,
      production_readiness_inferred: false,
      canon_promotion_permitted: false,
    });
  }

  const state = releaseState(releaseVerificationRegistry, candidate.release_key);
  const latestDecision = latestDeploymentDecision(registry, candidate.candidate_id);

  if (!state) {
    return deepFreeze({
      candidate_id: candidate.candidate_id,
      release_key: candidate.release_key,
      target_environment: candidate.target_environment,
      eligibility_status: "RELEASE_NOT_FOUND",
      release_exists: false,
      release_accepted: false,
      latest_report_matches_candidate: false,
      release_decision_matches_candidate: false,
      latest_deployment_decision: latestDecision?.decision ?? null,
      latest_deployment_decision_id:
        latestDecision?.deployment_decision_id ?? null,
      approved_for_deployment: false,
      human_deployment_gate_pending: latestDecision === null,
      deployment_executed: false,
      production_readiness_inferred: false,
      canon_promotion_permitted: false,
    });
  }

  const reportMatches =
    state.status.latest_report_digest === candidate.report_digest;
  const decisionMatches = Boolean(
    state.status.current_decision_id === candidate.release_decision_id &&
      state.decision?.decision_digest === candidate.release_decision_digest,
  );

  let eligibilityStatus = "ELIGIBLE";
  if (!state.status.accepted) {
    eligibilityStatus = "RELEASE_NOT_ACCEPTED";
  } else if (!reportMatches || !decisionMatches) {
    eligibilityStatus = "STALE_RELEASE_STATE";
  }

  const approved =
    eligibilityStatus === "ELIGIBLE" &&
    latestDecision?.decision === "DEPLOYMENT_APPROVED";

  return deepFreeze({
    candidate_id: candidate.candidate_id,
    release_key: candidate.release_key,
    target_environment: candidate.target_environment,
    eligibility_status: eligibilityStatus,
    release_exists: true,
    release_accepted: state.status.accepted,
    latest_report_matches_candidate: reportMatches,
    release_decision_matches_candidate: decisionMatches,
    latest_deployment_decision: latestDecision?.decision ?? null,
    latest_deployment_decision_id:
      latestDecision?.deployment_decision_id ?? null,
    approved_for_deployment: approved,
    human_deployment_gate_pending: latestDecision === null,
    deployment_executed: false,
    production_readiness_inferred: false,
    canon_promotion_permitted: false,
  });
}

export function decideHumanDeploymentGate(registry, input) {
  const validation = validateDeploymentGateRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot decide invalid deployment gate registry: ${validation.issues.join("; ")}`,
    );
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("human deployment gate input required");
  }
  if (!HNK_DEPLOYMENT_GATE_DECISIONS.includes(input.decision)) {
    throw new TypeError(`unsupported deployment gate decision ${input.decision}`);
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
  const candidate = registry.candidates.find(
    (entry) => entry.candidate_id === candidateId,
  );
  if (!candidate) {
    throw new Error(`deployment candidate ${candidateId} not found`);
  }

  const evaluation = evaluateDeploymentCandidate(
    registry,
    input.release_verification_registry,
    candidateId,
  );
  if (evaluation.eligibility_status === "RELEASE_NOT_FOUND") {
    throw new Error(
      `release ${candidate.release_key} not found in current release verification registry`,
    );
  }
  if (
    input.decision === "DEPLOYMENT_APPROVED" &&
    evaluation.eligibility_status !== "ELIGIBLE"
  ) {
    throw new Error(
      `DEPLOYMENT_APPROVED requires ELIGIBLE candidate; current status is ${evaluation.eligibility_status}`,
    );
  }

  const state = releaseState(
    input.release_verification_registry,
    candidate.release_key,
  );
  if (!state?.report || !state.decision) {
    throw new Error(
      `release ${candidate.release_key} current state lacks report/decision binding`,
    );
  }

  const previous = latestDeploymentDecision(registry, candidateId);
  const event = {
    deployment_decision_id:
      `DEPLOY_GATE:${candidateId}:${registry.decisions.filter((entry) => entry.candidate_id === candidateId).length + 1}`,
    candidate_id: candidateId,
    release_key: candidate.release_key,
    target_environment: candidate.target_environment,
    decision: input.decision,
    reviewer: cleanString(input.reviewer, "reviewer"),
    decided_at: cleanString(input.decided_at, "decided_at"),
    explicit_human_signal: cleanString(
      input.explicit_human_signal,
      "explicit_human_signal",
    ),
    rationale: cleanString(input.rationale, "rationale"),
    eligibility_at_decision: evaluation.eligibility_status,
    source_release_registry_digest:
      input.release_verification_registry.registry_digest,
    source_report_digest: state.status.latest_report_digest,
    source_release_decision_id: state.status.current_decision_id,
    source_release_decision_digest: state.decision.decision_digest,
    supersedes_deployment_decision_id:
      previous?.deployment_decision_id ?? null,
    decision_digest: "",
    human_decision: true,
    machine_can_decide: false,
    deployment_executed: false,
  };
  event.decision_digest = decisionDigest(event);

  const next = clone(registry);
  next.decisions.push(event);
  next.registry_digest = registryDigest(next);

  const nextValidation = validateDeploymentGateRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(
      `human deployment decision produced invalid registry: ${nextValidation.issues.join("; ")}`,
    );
  }
  return deepFreeze(next);
}

function validateCandidate(candidate, issues, ids, digests) {
  if (!candidate || typeof candidate !== "object") {
    issues.push("deployment candidate must be object");
    return;
  }
  for (const field of [
    "candidate_id",
    "release_key",
    "target_environment",
    "source_release_registry_digest",
    "report_digest",
    "report_overall_status",
    "release_decision_id",
    "release_decision_digest",
    "nominated_by",
    "nominated_at",
    "explicit_human_signal",
    "rationale",
    "candidate_digest",
  ]) {
    if (!nonEmpty(candidate[field])) {
      issues.push(`deployment candidate ${field} required`);
    }
  }

  for (const field of [
    "source_release_registry_digest",
    "report_digest",
    "release_decision_digest",
    "candidate_digest",
  ]) {
    if (!HEX_64.test(candidate[field] ?? "")) {
      issues.push(`${candidate.candidate_id}: ${field} must be SHA-256 hex`);
    }
  }

  if (candidate.human_nomination !== true) {
    issues.push(`${candidate.candidate_id}: human_nomination must remain true`);
  }
  if (candidate.machine_can_nominate !== false) {
    issues.push(`${candidate.candidate_id}: machine_can_nominate must remain false`);
  }
  if (candidate.automatic_deployment !== false) {
    issues.push(`${candidate.candidate_id}: automatic_deployment must remain false`);
  }
  if (candidate.deployment_executed !== false) {
    issues.push(`${candidate.candidate_id}: deployment_executed must remain false`);
  }
  if (
    HEX_64.test(candidate.candidate_digest ?? "") &&
    candidateDigest(candidate) !== candidate.candidate_digest
  ) {
    issues.push(`${candidate.candidate_id}: candidate_digest mismatch`);
  }

  if (ids.has(candidate.candidate_id)) {
    issues.push(`duplicate candidate_id ${candidate.candidate_id}`);
  }
  ids.add(candidate.candidate_id);

  if (digests.has(candidate.candidate_digest)) {
    issues.push(`duplicate candidate_digest ${candidate.candidate_digest}`);
  }
  digests.add(candidate.candidate_digest);
}

function validateDecisionEvents(registry, issues) {
  const ids = new Set();
  const lastByCandidate = new Map();

  for (const event of registry.decisions) {
    if (!event || typeof event !== "object") {
      issues.push("deployment decision event must be object");
      continue;
    }

    for (const field of [
      "deployment_decision_id",
      "candidate_id",
      "release_key",
      "target_environment",
      "decision",
      "reviewer",
      "decided_at",
      "explicit_human_signal",
      "rationale",
      "eligibility_at_decision",
      "source_release_registry_digest",
      "source_report_digest",
      "source_release_decision_id",
      "source_release_decision_digest",
      "decision_digest",
    ]) {
      if (!nonEmpty(event[field])) {
        issues.push(`deployment decision ${field} required`);
      }
    }

    if (!HNK_DEPLOYMENT_GATE_DECISIONS.includes(event.decision)) {
      issues.push(`${event.deployment_decision_id}: unsupported decision`);
    }
    if (!HNK_DEPLOYMENT_ELIGIBILITY_STATUSES.includes(event.eligibility_at_decision)) {
      issues.push(
        `${event.deployment_decision_id}: unsupported eligibility_at_decision`,
      );
    }
    if (
      event.decision === "DEPLOYMENT_APPROVED" &&
      event.eligibility_at_decision !== "ELIGIBLE"
    ) {
      issues.push(
        `${event.deployment_decision_id}: approval requires ELIGIBLE state`,
      );
    }

    for (const field of [
      "source_release_registry_digest",
      "source_report_digest",
      "source_release_decision_digest",
      "decision_digest",
    ]) {
      if (!HEX_64.test(event[field] ?? "")) {
        issues.push(
          `${event.deployment_decision_id}: ${field} must be SHA-256 hex`,
        );
      }
    }

    const candidate = registry.candidates.find(
      (entry) => entry.candidate_id === event.candidate_id,
    );
    if (!candidate) {
      issues.push(
        `${event.deployment_decision_id}: candidate is not registered`,
      );
    } else {
      if (candidate.release_key !== event.release_key) {
        issues.push(
          `${event.deployment_decision_id}: release_key mismatch`,
        );
      }
      if (candidate.target_environment !== event.target_environment) {
        issues.push(
          `${event.deployment_decision_id}: target_environment mismatch`,
        );
      }
    }

    if (event.human_decision !== true) {
      issues.push(
        `${event.deployment_decision_id}: human_decision must remain true`,
      );
    }
    if (event.machine_can_decide !== false) {
      issues.push(
        `${event.deployment_decision_id}: machine_can_decide must remain false`,
      );
    }
    if (event.deployment_executed !== false) {
      issues.push(
        `${event.deployment_decision_id}: deployment_executed must remain false`,
      );
    }

    const expectedPrevious = lastByCandidate.get(event.candidate_id) ?? null;
    if (event.supersedes_deployment_decision_id !== expectedPrevious) {
      issues.push(
        `${event.deployment_decision_id}: deployment decision chain drift; expected supersedes ${expectedPrevious ?? "null"}`,
      );
    }
    lastByCandidate.set(event.candidate_id, event.deployment_decision_id);

    if (
      HEX_64.test(event.decision_digest ?? "") &&
      decisionDigest(event) !== event.decision_digest
    ) {
      issues.push(
        `${event.deployment_decision_id}: decision_digest mismatch`,
      );
    }

    if (ids.has(event.deployment_decision_id)) {
      issues.push(
        `duplicate deployment_decision_id ${event.deployment_decision_id}`,
      );
    }
    ids.add(event.deployment_decision_id);
  }
}

export function validateDeploymentGateRegistry(registry) {
  const issues = [];

  if (!registry || typeof registry !== "object") {
    return deepFreeze({ ok: false, issues: ["registry must be object"] });
  }

  if (registry.registry_id !== HNK_DEPLOYMENT_GATE_REGISTRY_ID) {
    issues.push(`unexpected registry_id ${registry.registry_id}`);
  }
  if (registry.registry_version !== HNK_DEPLOYMENT_GATE_REGISTRY_VERSION) {
    issues.push(`unexpected registry_version ${registry.registry_version}`);
  }
  if (registry.authority !== "HNK_AUTHORED_DEPLOYMENT_GATE_REGISTRY") {
    issues.push(`unexpected authority ${registry.authority}`);
  }

  for (const field of ["registry_key", "title", "created_at"]) {
    if (!nonEmpty(registry[field])) issues.push(`${field} required`);
  }

  if (!Array.isArray(registry.candidates)) {
    issues.push("candidates must be array");
  } else {
    const ids = new Set();
    const digests = new Set();
    for (const candidate of registry.candidates) {
      validateCandidate(candidate, issues, ids, digests);
    }
  }

  if (!Array.isArray(registry.decisions)) {
    issues.push("decisions must be array");
  } else if (Array.isArray(registry.candidates)) {
    validateDecisionEvents(registry, issues);
  }

  const locks = {
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    immutable_candidate_history: true,
    immutable_decision_history: true,
    human_deployment_gate_required: true,
    release_accepted_auto_approves_deployment: false,
    machine_can_nominate: false,
    machine_can_approve_deployment: false,
    deployment_execution_performed_by_registry: false,
    automatic_truth_inference: false,
    production_readiness_inferred: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_DEPLOYMENT_GATE_REGISTRY_BOUNDARY,
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

export function deploymentGateRegistryIndex(registry) {
  const validation = validateDeploymentGateRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot index invalid deployment gate registry: ${validation.issues.join("; ")}`,
    );
  }

  const latest = registry.candidates.map((candidate) => ({
    candidate,
    decision: latestDeploymentDecision(registry, candidate.candidate_id),
  }));

  return deepFreeze({
    registry_key: registry.registry_key,
    candidates: registry.candidates.length,
    decisions: registry.decisions.length,
    recorded_approvals: latest.filter(
      ({ decision }) => decision?.decision === "DEPLOYMENT_APPROVED",
    ).length,
    recorded_holds: latest.filter(
      ({ decision }) => decision?.decision === "DEPLOYMENT_HELD",
    ).length,
    recorded_rejections: latest.filter(
      ({ decision }) => decision?.decision === "DEPLOYMENT_REJECTED",
    ).length,
    human_gate_pending_without_current_state_check: latest.filter(
      ({ decision }) => !decision,
    ).length,
    machine_can_approve_deployment: false,
    deployment_execution_performed_by_registry: false,
    truth_assessed: false,
    production_readiness_inferred: false,
    canon_promotion_permitted: false,
  });
}

export function serializeDeploymentGateRegistry(registry) {
  const validation = validateDeploymentGateRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot serialize invalid deployment gate registry: ${validation.issues.join("; ")}`,
    );
  }
  return `${JSON.stringify(registry, null, 2)}\n`;
}

export function parseDeploymentGateRegistry(text) {
  if (!nonEmpty(text)) {
    throw new TypeError("deployment gate registry JSON text required");
  }

  let registry;
  try {
    registry = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid deployment gate registry JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateDeploymentGateRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `invalid deployment gate registry: ${validation.issues.join("; ")}`,
    );
  }
  return deepFreeze(registry);
}

export function deploymentGateRegistrySummary() {
  return deepFreeze({
    registry_id: HNK_DEPLOYMENT_GATE_REGISTRY_ID,
    version: HNK_DEPLOYMENT_GATE_REGISTRY_VERSION,
    candidate_requires_current_release_acceptance: true,
    deployment_approval_requires_current_candidate_eligibility: true,
    release_accepted_auto_approves_deployment: false,
    latest_release_evidence_can_stale_candidate: true,
    explicit_human_nomination_required: true,
    human_deployment_gate_required: true,
    machine_can_nominate: false,
    machine_can_approve_deployment: false,
    deployment_execution_performed_by_registry: false,
    automatic_truth_inference: false,
    production_readiness_inferred: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    persistence: "USER_CONTROLLED_FILE_ONLY",
    claim_boundary: HNK_DEPLOYMENT_GATE_REGISTRY_BOUNDARY,
  });
}
