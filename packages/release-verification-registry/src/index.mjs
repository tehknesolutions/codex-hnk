import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  HNK_REPRODUCIBILITY_STATUSES,
  validateReproducibilityVerificationReport,
} from "@hnk/reproducibility-verifier";

export const HNK_RELEASE_VERIFICATION_REGISTRY_ID =
  "HNK_RELEASE_VERIFICATION_REGISTRY_V1";
export const HNK_RELEASE_VERIFICATION_REGISTRY_VERSION = "1.0.0";
export const HNK_RELEASE_VERIFICATION_REGISTRY_BOUNDARY =
  "VERIFICATION_REGISTRY_PRESERVES_REPORT_HISTORY_AND_EXPLICIT_HUMAN_RELEASE_DECISIONS_NOT_TRUTH_READINESS_OR_CANON";
export const HNK_RELEASE_GATE_DECISIONS = Object.freeze([
  "RELEASE_ACCEPTED",
  "RELEASE_REJECTED",
  "RELEASE_HELD",
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

function reportRecordProjection(record) {
  const projected = clone(record);
  delete projected.record_digest;
  return projected;
}

function reportRecordDigest(record) {
  return sha256Canonical(reportRecordProjection(record));
}

function decisionProjection(decision) {
  const projected = clone(decision);
  delete projected.decision_digest;
  return projected;
}

function decisionDigest(decision) {
  return sha256Canonical(decisionProjection(decision));
}

export function releaseVerificationRegistryProjection(registry) {
  const projected = clone(registry);
  delete projected.registry_digest;
  return deepFreeze(projected);
}

function registryDigest(registry) {
  return sha256Canonical(releaseVerificationRegistryProjection(registry));
}

function reportByDigest(registry, reportDigest) {
  return registry.reports.find((record) => record.report_digest === reportDigest) ?? null;
}

function latestDecisionForRelease(registry, releaseKey) {
  const items = registry.decisions.filter((event) => event.release_key === releaseKey);
  return items.at(-1) ?? null;
}

export function createReleaseVerificationRegistry(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("release verification registry input required");
  }

  const registry = {
    registry_id: HNK_RELEASE_VERIFICATION_REGISTRY_ID,
    registry_version: HNK_RELEASE_VERIFICATION_REGISTRY_VERSION,
    authority: "HNK_AUTHORED_RELEASE_VERIFICATION_REGISTRY",
    registry_key: cleanString(input.registry_key, "registry_key"),
    title: cleanString(input.title, "title"),
    created_at: cleanString(input.created_at, "created_at"),
    reports: [],
    decisions: [],
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    immutable_report_history: true,
    immutable_decision_history: true,
    human_release_gate_required: true,
    match_auto_accepts_release: false,
    non_match_acceptance_requires_explicit_override: true,
    machine_can_accept_release: false,
    automatic_truth_inference: false,
    production_readiness_inferred: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_RELEASE_VERIFICATION_REGISTRY_BOUNDARY,
  };

  registry.registry_digest = registryDigest(registry);
  const validation = validateReleaseVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(`invalid release verification registry: ${validation.issues.join("; ")}`);
  }
  return deepFreeze(registry);
}

export function registerReleaseVerificationReport(registry, input) {
  const validation = validateReleaseVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot extend invalid release verification registry: ${validation.issues.join("; ")}`,
    );
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("release verification report registration input required");
  }

  const reportValidation = validateReproducibilityVerificationReport(input.report);
  if (!reportValidation.ok) {
    throw new Error(
      `invalid reproducibility verification report: ${reportValidation.issues.join("; ")}`,
    );
  }

  if (registry.reports.some((record) => record.report_digest === input.report.report_digest)) {
    throw new Error(`report digest ${input.report.report_digest} already registered`);
  }

  const record = {
    record_id: `VERIFY:${input.report.release_key}:${input.report.report_digest.slice(0, 16)}`,
    release_key: input.report.release_key,
    manifest_digest: input.report.manifest_digest,
    report_digest: input.report.report_digest,
    overall_status: input.report.overall_status,
    registered_at: cleanString(input.registered_at, "registered_at"),
    report: clone(input.report),
    record_digest: "",
  };
  record.record_digest = reportRecordDigest(record);

  const next = clone(registry);
  next.reports.push(record);
  next.registry_digest = registryDigest(next);

  const nextValidation = validateReleaseVerificationRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(
      `report registration produced invalid registry: ${nextValidation.issues.join("; ")}`,
    );
  }
  return deepFreeze(next);
}

export function decideHumanReleaseGate(registry, input) {
  const validation = validateReleaseVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot decide invalid release verification registry: ${validation.issues.join("; ")}`,
    );
  }
  if (!input || typeof input !== "object") {
    throw new TypeError("human release gate input required");
  }
  if (!HNK_RELEASE_GATE_DECISIONS.includes(input.decision)) {
    throw new TypeError(`unsupported release gate decision ${input.decision}`);
  }

  const releaseKey = cleanString(input.release_key, "release_key");
  const reportDigestValue = cleanString(input.report_digest, "report_digest");
  const reportRecord = reportByDigest(registry, reportDigestValue);
  if (!reportRecord) {
    throw new Error(`report ${reportDigestValue} must be registered before human release decision`);
  }
  if (reportRecord.release_key !== releaseKey) {
    throw new Error(
      `report ${reportDigestValue} belongs to release ${reportRecord.release_key}, not ${releaseKey}`,
    );
  }

  const explicitSignal = cleanString(
    input.explicit_human_signal,
    "explicit_human_signal",
  );
  const reviewer = cleanString(input.reviewer, "reviewer");
  const decidedAt = cleanString(input.decided_at, "decided_at");
  const rationale = cleanString(input.rationale, "rationale");

  const nonMatchOverride = input.non_match_override_acknowledged === true;

  if (
    input.decision === "RELEASE_ACCEPTED" &&
    reportRecord.overall_status !== "MATCH" &&
    !nonMatchOverride
  ) {
    throw new Error(
      "RELEASE_ACCEPTED on a non-MATCH report requires non_match_override_acknowledged=true",
    );
  }

  const previous = latestDecisionForRelease(registry, releaseKey);
  const decision = {
    decision_id: `RELEASE_GATE:${releaseKey}:${registry.decisions.filter((event) => event.release_key === releaseKey).length + 1}:${reportDigestValue.slice(0, 12)}`,
    release_key: releaseKey,
    report_digest: reportDigestValue,
    report_overall_status: reportRecord.overall_status,
    decision: input.decision,
    reviewer,
    decided_at: decidedAt,
    explicit_human_signal: explicitSignal,
    rationale,
    non_match_override_acknowledged:
      input.decision === "RELEASE_ACCEPTED" &&
      reportRecord.overall_status !== "MATCH"
        ? true
        : false,
    supersedes_decision_id: previous?.decision_id ?? null,
    decision_digest: "",
    human_decision: true,
    machine_can_decide: false,
  };
  decision.decision_digest = decisionDigest(decision);

  const next = clone(registry);
  next.decisions.push(decision);
  next.registry_digest = registryDigest(next);

  const nextValidation = validateReleaseVerificationRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(
      `human release decision produced invalid registry: ${nextValidation.issues.join("; ")}`,
    );
  }
  return deepFreeze(next);
}

function validateReportRecord(record, issues, seenRecordIds, seenReportDigests) {
  if (!record || typeof record !== "object") {
    issues.push("verification report record must be object");
    return;
  }

  for (const field of [
    "record_id",
    "release_key",
    "manifest_digest",
    "report_digest",
    "overall_status",
    "registered_at",
    "record_digest",
  ]) {
    if (!nonEmpty(record[field])) issues.push(`report record ${field} required`);
  }

  if (!HEX_64.test(record.manifest_digest ?? "")) {
    issues.push(`${record.record_id}: manifest_digest must be SHA-256 hex`);
  }
  if (!HEX_64.test(record.report_digest ?? "")) {
    issues.push(`${record.record_id}: report_digest must be SHA-256 hex`);
  }
  if (!HEX_64.test(record.record_digest ?? "")) {
    issues.push(`${record.record_id}: record_digest must be SHA-256 hex`);
  }
  if (!HNK_REPRODUCIBILITY_STATUSES.includes(record.overall_status)) {
    issues.push(`${record.record_id}: unsupported overall_status`);
  }

  const reportValidation = validateReproducibilityVerificationReport(record.report);
  if (!reportValidation.ok) {
    issues.push(
      ...reportValidation.issues.map(
        (issue) => `${record.record_id}: report: ${issue}`,
      ),
    );
  } else {
    if (record.report.release_key !== record.release_key) {
      issues.push(`${record.record_id}: release_key drift`);
    }
    if (record.report.manifest_digest !== record.manifest_digest) {
      issues.push(`${record.record_id}: manifest_digest drift`);
    }
    if (record.report.report_digest !== record.report_digest) {
      issues.push(`${record.record_id}: report_digest drift`);
    }
    if (record.report.overall_status !== record.overall_status) {
      issues.push(`${record.record_id}: overall_status drift`);
    }
  }

  if (
    HEX_64.test(record.record_digest ?? "") &&
    reportRecordDigest(record) !== record.record_digest
  ) {
    issues.push(`${record.record_id}: record_digest mismatch`);
  }

  if (seenRecordIds.has(record.record_id)) {
    issues.push(`duplicate record_id ${record.record_id}`);
  }
  seenRecordIds.add(record.record_id);

  if (seenReportDigests.has(record.report_digest)) {
    issues.push(`duplicate report_digest ${record.report_digest}`);
  }
  seenReportDigests.add(record.report_digest);
}

function validateDecisionEvents(registry, issues) {
  const decisionIds = new Set();
  const lastByRelease = new Map();

  for (const event of registry.decisions) {
    if (!event || typeof event !== "object") {
      issues.push("release decision event must be object");
      continue;
    }

    for (const field of [
      "decision_id",
      "release_key",
      "report_digest",
      "report_overall_status",
      "decision",
      "reviewer",
      "decided_at",
      "explicit_human_signal",
      "rationale",
      "decision_digest",
    ]) {
      if (!nonEmpty(event[field])) issues.push(`release decision ${field} required`);
    }

    if (!HEX_64.test(event.report_digest ?? "")) {
      issues.push(`${event.decision_id}: report_digest must be SHA-256 hex`);
    }
    if (!HEX_64.test(event.decision_digest ?? "")) {
      issues.push(`${event.decision_id}: decision_digest must be SHA-256 hex`);
    }
    if (!HNK_REPRODUCIBILITY_STATUSES.includes(event.report_overall_status)) {
      issues.push(`${event.decision_id}: unsupported report_overall_status`);
    }
    if (!HNK_RELEASE_GATE_DECISIONS.includes(event.decision)) {
      issues.push(`${event.decision_id}: unsupported decision`);
    }
    if (event.human_decision !== true) {
      issues.push(`${event.decision_id}: human_decision must remain true`);
    }
    if (event.machine_can_decide !== false) {
      issues.push(`${event.decision_id}: machine_can_decide must remain false`);
    }
    if (typeof event.non_match_override_acknowledged !== "boolean") {
      issues.push(`${event.decision_id}: non_match_override_acknowledged must be boolean`);
    }

    const reportRecord = reportByDigest(registry, event.report_digest);
    if (!reportRecord) {
      issues.push(`${event.decision_id}: target report is not registered`);
    } else {
      if (reportRecord.release_key !== event.release_key) {
        issues.push(`${event.decision_id}: target report release_key mismatch`);
      }
      if (reportRecord.overall_status !== event.report_overall_status) {
        issues.push(`${event.decision_id}: target report status mismatch`);
      }
      if (
        event.decision === "RELEASE_ACCEPTED" &&
        reportRecord.overall_status !== "MATCH" &&
        event.non_match_override_acknowledged !== true
      ) {
        issues.push(
          `${event.decision_id}: non-MATCH acceptance requires explicit override acknowledgement`,
        );
      }
      if (
        (event.decision !== "RELEASE_ACCEPTED" ||
          reportRecord.overall_status === "MATCH") &&
        event.non_match_override_acknowledged !== false
      ) {
        issues.push(
          `${event.decision_id}: override acknowledgement must be false unless accepting non-MATCH report`,
        );
      }
    }

    const expectedPrevious = lastByRelease.get(event.release_key) ?? null;
    if (event.supersedes_decision_id !== expectedPrevious) {
      issues.push(
        `${event.decision_id}: decision chain drift; expected supersedes ${expectedPrevious ?? "null"}`,
      );
    }
    lastByRelease.set(event.release_key, event.decision_id);

    if (
      HEX_64.test(event.decision_digest ?? "") &&
      decisionDigest(event) !== event.decision_digest
    ) {
      issues.push(`${event.decision_id}: decision_digest mismatch`);
    }

    if (decisionIds.has(event.decision_id)) {
      issues.push(`duplicate decision_id ${event.decision_id}`);
    }
    decisionIds.add(event.decision_id);
  }
}

export function validateReleaseVerificationRegistry(registry) {
  const issues = [];

  if (!registry || typeof registry !== "object") {
    return deepFreeze({ ok: false, issues: ["registry must be object"] });
  }

  if (registry.registry_id !== HNK_RELEASE_VERIFICATION_REGISTRY_ID) {
    issues.push(`unexpected registry_id ${registry.registry_id}`);
  }
  if (registry.registry_version !== HNK_RELEASE_VERIFICATION_REGISTRY_VERSION) {
    issues.push(`unexpected registry_version ${registry.registry_version}`);
  }
  if (registry.authority !== "HNK_AUTHORED_RELEASE_VERIFICATION_REGISTRY") {
    issues.push(`unexpected authority ${registry.authority}`);
  }

  for (const field of ["registry_key", "title", "created_at"]) {
    if (!nonEmpty(registry[field])) issues.push(`${field} required`);
  }

  if (!Array.isArray(registry.reports)) {
    issues.push("reports must be array");
  } else {
    const seenRecordIds = new Set();
    const seenReportDigests = new Set();
    for (const record of registry.reports) {
      validateReportRecord(record, issues, seenRecordIds, seenReportDigests);
    }
  }

  if (!Array.isArray(registry.decisions)) {
    issues.push("decisions must be array");
  } else if (Array.isArray(registry.reports)) {
    validateDecisionEvents(registry, issues);
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
  if (registry.immutable_report_history !== true) {
    issues.push("immutable_report_history must remain true");
  }
  if (registry.immutable_decision_history !== true) {
    issues.push("immutable_decision_history must remain true");
  }
  if (registry.human_release_gate_required !== true) {
    issues.push("human_release_gate_required must remain true");
  }
  if (registry.match_auto_accepts_release !== false) {
    issues.push("match_auto_accepts_release must remain false");
  }
  if (registry.non_match_acceptance_requires_explicit_override !== true) {
    issues.push("non_match_acceptance_requires_explicit_override must remain true");
  }
  if (registry.machine_can_accept_release !== false) {
    issues.push("machine_can_accept_release must remain false");
  }
  if (registry.automatic_truth_inference !== false) {
    issues.push("automatic_truth_inference must remain false");
  }
  if (registry.production_readiness_inferred !== false) {
    issues.push("production_readiness_inferred must remain false");
  }
  if (registry.automatic_canon_promotion !== false) {
    issues.push("automatic_canon_promotion must remain false");
  }
  if (registry.canon_promotion_permitted !== false) {
    issues.push("canon_promotion_permitted must remain false");
  }
  if (registry.claim_boundary !== HNK_RELEASE_VERIFICATION_REGISTRY_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${registry.claim_boundary}`);
  }

  if (!HEX_64.test(registry.registry_digest ?? "")) {
    issues.push("registry_digest must be SHA-256 hex");
  } else if (registryDigest(registry) !== registry.registry_digest) {
    issues.push("registry_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function releaseVerificationRegistryIndex(registry) {
  const validation = validateReleaseVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot index invalid release verification registry: ${validation.issues.join("; ")}`,
    );
  }

  const releaseKeys = [...new Set(registry.reports.map((record) => record.release_key))];
  const statuses = releaseKeys.map((releaseKey) => {
    const reports = registry.reports.filter((record) => record.release_key === releaseKey);
    const latest = reports.at(-1);
    const decisions = registry.decisions.filter((event) => event.release_key === releaseKey);
    const current = decisions.at(-1) ?? null;
    const currentOnLatest = Boolean(
      current && current.report_digest === latest.report_digest,
    );
    const accepted = Boolean(
      currentOnLatest && current?.decision === "RELEASE_ACCEPTED",
    );

    return {
      release_key: releaseKey,
      report_count: reports.length,
      latest_report_digest: latest.report_digest,
      latest_report_status: latest.overall_status,
      decision_count: decisions.length,
      current_decision: current?.decision ?? null,
      current_decision_id: current?.decision_id ?? null,
      current_decision_report_digest: current?.report_digest ?? null,
      current_decision_report_status: current?.report_overall_status ?? null,
      current_decision_is_on_latest_report: currentOnLatest,
      accepted,
      human_gate_pending: !currentOnLatest,
    };
  });

  return deepFreeze({
    registry_key: registry.registry_key,
    releases: statuses.length,
    reports: registry.reports.length,
    decisions: registry.decisions.length,
    accepted_releases: statuses.filter((entry) => entry.accepted).length,
    pending_human_gate: statuses.filter((entry) => entry.human_gate_pending).length,
    match_reports_without_acceptance: statuses.filter(
      (entry) => entry.latest_report_status === "MATCH" && !entry.accepted,
    ).length,
    statuses,
    truth_assessed: false,
    production_readiness_inferred: false,
    canon_promotion_permitted: false,
  });
}

export function serializeReleaseVerificationRegistry(registry) {
  const validation = validateReleaseVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `cannot serialize invalid release verification registry: ${validation.issues.join("; ")}`,
    );
  }
  return `${JSON.stringify(registry, null, 2)}\n`;
}

export function parseReleaseVerificationRegistry(text) {
  if (!nonEmpty(text)) {
    throw new TypeError("release verification registry JSON text required");
  }

  let registry;
  try {
    registry = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid release verification registry JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateReleaseVerificationRegistry(registry);
  if (!validation.ok) {
    throw new Error(
      `invalid release verification registry: ${validation.issues.join("; ")}`,
    );
  }
  return deepFreeze(registry);
}

export function releaseVerificationRegistrySummary() {
  return deepFreeze({
    registry_id: HNK_RELEASE_VERIFICATION_REGISTRY_ID,
    version: HNK_RELEASE_VERIFICATION_REGISTRY_VERSION,
    report_identity: "REPORT_DIGEST",
    append_only_report_history: true,
    append_only_human_decision_history: true,
    human_release_gate_required: true,
    match_auto_accepts_release: false,
    latest_report_reopens_gate: true,
    non_match_acceptance_requires_explicit_override: true,
    machine_can_accept_release: false,
    accepted_means_latest_report_has_explicit_accept_decision: true,
    automatic_truth_inference: false,
    production_readiness_inferred: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    persistence: "USER_CONTROLLED_FILE_ONLY",
    claim_boundary: HNK_RELEASE_VERIFICATION_REGISTRY_BOUNDARY,
  });
}
