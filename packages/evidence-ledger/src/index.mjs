import {
  sha256Canonical,
  verifyExperimentAttestation,
  validateExperimentAttestation,
} from "@hnk/experiment-attestation";
import { validateExperimentProtocol } from "@hnk/experiment-protocol";
import { validateMeasurementContract } from "@hnk/measurement-contract";

export const HNK_EVIDENCE_LEDGER_ID = "HNK_EVIDENCE_LEDGER_V1";
export const HNK_EVIDENCE_LEDGER_VERSION = "1.0.0";
export const HNK_EVIDENCE_LEDGER_BOUNDARY =
  "EVIDENCE_LEDGER_TRACKS_COVERAGE_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF";
export const HNK_EVIDENCE_KINDS = Object.freeze([
  "PREREGISTRATION",
  "SESSION_ARTIFACT",
  "MEASUREMENT_RECORD",
  "FINAL_REPORT",
]);
export const HNK_EVIDENCE_CLAIM_SCOPES = Object.freeze([
  "DESCRIPTIVE",
  "PROCESS_INTEGRITY",
  "EXPLORATORY_INTERPRETATION",
]);
export const HNK_EVIDENCE_REQUIREMENT_KINDS = Object.freeze([
  "ATTESTATION_INTEGRITY",
  "SESSION_ROLE_COUNT",
  "METRIC_ROLE_RECORDS",
  "METRIC_ANY_RECORDS",
  "REPORT_PRESENT",
]);
export const HNK_EVIDENCE_COVERAGE_STATUSES = Object.freeze([
  "COMPLETE_FOR_DECLARED_REQUIREMENTS",
  "PARTIAL",
  "INSUFFICIENT",
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

function cleanString(value, field, { nullable = false } = {}) {
  if (nullable && (value === null || value === undefined || value === "")) return null;
  if (!nonEmpty(value)) throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}

function positiveInteger(value, field) {
  if (!Number.isInteger(value) || value < 1) throw new TypeError(`${field} must be an integer >= 1`);
  return value;
}

function requireDigest(value, field) {
  if (!HEX_64.test(value ?? "")) throw new TypeError(`${field} must be a lowercase SHA-256 hex digest`);
  return value;
}

function normalizeRequirement(input, index) {
  if (!input || typeof input !== "object") throw new TypeError(`requirements[${index}] must be an object`);
  const requirement = {
    requirement_id: cleanString(input.requirement_id, `requirements[${index}].requirement_id`),
    kind: input.kind,
    role: input.role ?? null,
    metric_id: input.metric_id ?? null,
    min_count: input.min_count ?? null,
  };
  if (!HNK_EVIDENCE_REQUIREMENT_KINDS.includes(requirement.kind)) {
    throw new RangeError(`requirements[${index}].kind is invalid: ${requirement.kind}`);
  }

  if (["SESSION_ROLE_COUNT", "METRIC_ROLE_RECORDS"].includes(requirement.kind)) {
    if (!["CONTROL", "EXPERIMENT"].includes(requirement.role)) {
      throw new RangeError(`${requirement.requirement_id}: role must be CONTROL or EXPERIMENT`);
    }
  } else {
    requirement.role = null;
  }

  if (["METRIC_ROLE_RECORDS", "METRIC_ANY_RECORDS"].includes(requirement.kind)) {
    requirement.metric_id = cleanString(requirement.metric_id, `${requirement.requirement_id}.metric_id`);
  } else {
    requirement.metric_id = null;
  }

  if (["SESSION_ROLE_COUNT", "METRIC_ROLE_RECORDS", "METRIC_ANY_RECORDS"].includes(requirement.kind)) {
    requirement.min_count = positiveInteger(requirement.min_count ?? 1, `${requirement.requirement_id}.min_count`);
  } else {
    requirement.min_count = null;
  }

  return requirement;
}

function ledgerDigest(ledger) {
  return sha256Canonical(evidenceLedgerProjection(ledger));
}

function attestationEntry(attestation) {
  return {
    evidence_id: "EVIDENCE-PREREGISTRATION",
    kind: "PREREGISTRATION",
    digest: attestation.preregistration_digest,
    assignment_id: null,
    role: null,
    session_id: null,
    metric_id: null,
    measurement_id: null,
    evidence_source: null,
    timepoint: null,
    measured_at: null,
    metadata: {
      protocol_status: attestation.protocol_status,
      protocol_snapshot_digest: attestation.protocol_snapshot_digest,
      attestation_chain_head: attestation.chain_head,
    },
  };
}

function sessionEntries(attestation) {
  return attestation.sessions.map((entry) => ({
    evidence_id: `EVIDENCE-SESSION-${entry.assignment_id}`,
    kind: "SESSION_ARTIFACT",
    digest: entry.artifact_digest,
    assignment_id: entry.assignment_id,
    role: entry.role,
    session_id: entry.session_id,
    metric_id: null,
    measurement_id: null,
    evidence_source: null,
    timepoint: null,
    measured_at: entry.added_at,
    metadata: {
      ordinal: entry.ordinal,
      chain_digest: entry.chain_digest,
    },
  }));
}

function measurementEntries(measurement) {
  const metricById = new Map(measurement.metrics.map((metric) => [metric.metric_id, metric]));
  return measurement.records.map((record) => {
    const metric = metricById.get(record.metric_id);
    return {
      evidence_id: `EVIDENCE-MEASUREMENT-${record.measurement_id}`,
      kind: "MEASUREMENT_RECORD",
      digest: sha256Canonical(record),
      assignment_id: record.assignment_id,
      role: record.role,
      session_id: record.session_id,
      metric_id: record.metric_id,
      measurement_id: record.measurement_id,
      evidence_source: metric?.evidence_source ?? null,
      timepoint: metric?.timepoint ?? null,
      measured_at: record.measured_at,
      metadata: {
        value: clone(record.value),
        note: record.note ?? null,
        metric_label: metric?.label ?? null,
        metric_type: metric?.type ?? null,
        unit: metric?.unit ?? null,
        evaluation_criterion: metric?.evaluation_criterion ?? null,
      },
    };
  });
}

function reportEntries(attestation) {
  if (!attestation.report) return [];
  return [{
    evidence_id: "EVIDENCE-FINAL-REPORT",
    kind: "FINAL_REPORT",
    digest: attestation.report.report_digest,
    assignment_id: null,
    role: null,
    session_id: null,
    metric_id: null,
    measurement_id: null,
    evidence_source: null,
    timepoint: null,
    measured_at: attestation.report.completed_at,
    metadata: {
      chain_digest: attestation.report.chain_digest,
    },
  }];
}

export function evidenceLedgerProjection(ledger) {
  const projected = clone(ledger);
  delete projected.ledger_digest;
  return deepFreeze(projected);
}

export function createEvidenceLedger(protocol, attestation, measurement, input = {}) {
  const protocolValidation = validateExperimentProtocol(protocol);
  if (!protocolValidation.ok) {
    throw new Error(`invalid experiment protocol: ${protocolValidation.issues.join("; ")}`);
  }
  const attestationValidation = validateExperimentAttestation(attestation);
  if (!attestationValidation.ok) {
    throw new Error(`invalid experiment attestation: ${attestationValidation.issues.join("; ")}`);
  }
  const attestationVerification = verifyExperimentAttestation(attestation, protocol);
  if (!attestationVerification.ok ||
      !attestationVerification.preregistration_matches ||
      !attestationVerification.snapshot_matches ||
      !attestationVerification.chain_matches) {
    throw new Error(`experiment attestation does not verify against protocol: ${attestationVerification.issues.join("; ")}`);
  }
  const measurementValidation = validateMeasurementContract(measurement, protocol);
  if (!measurementValidation.ok) {
    throw new Error(`invalid measurement contract: ${measurementValidation.issues.join("; ")}`);
  }
  if (attestation.experiment_id !== protocol.experiment_id ||
      measurement.experiment_id !== protocol.experiment_id) {
    throw new Error("experiment identifiers do not match across evidence sources");
  }
  if (measurement.experiment_preregistration_digest !== attestation.preregistration_digest) {
    throw new Error("measurement preregistration digest does not match attestation");
  }

  const evidenceEntries = [
    attestationEntry(attestation),
    ...sessionEntries(attestation),
    ...measurementEntries(measurement),
    ...reportEntries(attestation),
  ];

  const ledger = {
    ledger_id: HNK_EVIDENCE_LEDGER_ID,
    ledger_version: HNK_EVIDENCE_LEDGER_VERSION,
    authority: "HNK_AUTHORED_EVIDENCE_LEDGER",
    experiment_id: protocol.experiment_id,
    created_at: nonEmpty(input.created_at) ? input.created_at.trim() : new Date().toISOString(),
    bindings: {
      experiment_protocol_version: protocol.protocol_version,
      preregistration_digest: attestation.preregistration_digest,
      protocol_snapshot_digest: attestation.protocol_snapshot_digest,
      attestation_chain_head: attestation.chain_head,
      measurement_plan_digest: measurement.measurement_plan_digest,
      measurement_contract_digest: sha256Canonical(measurement),
    },
    attestation_integrity_verified: true,
    evidence_entries: evidenceEntries,
    claims: [],
    ledger_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    automatic_truth_inference: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_EVIDENCE_LEDGER_BOUNDARY,
  };
  ledger.ledger_digest = ledgerDigest(ledger);
  const validation = validateEvidenceLedger(ledger);
  if (!validation.ok) throw new Error(`invalid evidence ledger: ${validation.issues.join("; ")}`);
  return deepFreeze(ledger);
}

function validateEvidenceEntry(entry, issues, ids) {
  if (!entry || typeof entry !== "object") {
    issues.push("evidence entry must be an object");
    return;
  }
  if (!nonEmpty(entry.evidence_id)) issues.push("evidence_id required");
  if (ids.has(entry.evidence_id)) issues.push(`duplicate evidence_id ${entry.evidence_id}`);
  ids.add(entry.evidence_id);
  if (!HNK_EVIDENCE_KINDS.includes(entry.kind)) issues.push(`${entry.evidence_id}: invalid kind ${entry.kind}`);
  if (!HEX_64.test(entry.digest ?? "")) issues.push(`${entry.evidence_id}: digest must be SHA-256 hex`);
  if (!entry.metadata || typeof entry.metadata !== "object" || Array.isArray(entry.metadata)) {
    issues.push(`${entry.evidence_id}: metadata must be an object`);
  }
  if (entry.kind === "SESSION_ARTIFACT") {
    if (!nonEmpty(entry.assignment_id) || !["CONTROL", "EXPERIMENT"].includes(entry.role) || !nonEmpty(entry.session_id)) {
      issues.push(`${entry.evidence_id}: session evidence requires assignment_id, role and session_id`);
    }
  }
  if (entry.kind === "MEASUREMENT_RECORD") {
    for (const field of ["assignment_id", "session_id", "metric_id", "measurement_id", "measured_at"]) {
      if (!nonEmpty(entry[field])) issues.push(`${entry.evidence_id}: ${field} required`);
    }
    if (!["CONTROL", "EXPERIMENT"].includes(entry.role)) issues.push(`${entry.evidence_id}: measurement role invalid`);
  }
}

function validateClaim(claim, issues, claimIds) {
  if (!claim || typeof claim !== "object") {
    issues.push("claim must be an object");
    return;
  }
  if (!nonEmpty(claim.claim_id)) issues.push("claim_id required");
  if (claimIds.has(claim.claim_id)) issues.push(`duplicate claim_id ${claim.claim_id}`);
  claimIds.add(claim.claim_id);
  if (!nonEmpty(claim.statement)) issues.push(`${claim.claim_id}: statement required`);
  if (!HNK_EVIDENCE_CLAIM_SCOPES.includes(claim.scope)) issues.push(`${claim.claim_id}: invalid scope ${claim.scope}`);
  if (!nonEmpty(claim.created_at)) issues.push(`${claim.claim_id}: created_at required`);
  if (claim.causal_claim_permitted !== false) issues.push(`${claim.claim_id}: causal_claim_permitted must remain false`);
  if (claim.metaphysical_proof_permitted !== false) issues.push(`${claim.claim_id}: metaphysical_proof_permitted must remain false`);
  if (!Array.isArray(claim.requirements) || claim.requirements.length === 0) {
    issues.push(`${claim.claim_id}: at least one evidence requirement required`);
    return;
  }
  const requirementIds = new Set();
  claim.requirements.forEach((requirement, index) => {
    try {
      const normalized = normalizeRequirement(requirement, index);
      if (requirementIds.has(normalized.requirement_id)) issues.push(`${claim.claim_id}: duplicate requirement_id ${normalized.requirement_id}`);
      requirementIds.add(normalized.requirement_id);
    } catch (error) {
      issues.push(`${claim.claim_id}: ${error instanceof Error ? error.message : "invalid requirement"}`);
    }
  });
}

export function validateEvidenceLedger(ledger) {
  const issues = [];
  if (!ledger || typeof ledger !== "object") return deepFreeze({ ok: false, issues: ["ledger must be an object"] });
  if (ledger.ledger_id !== HNK_EVIDENCE_LEDGER_ID) issues.push(`unexpected ledger_id ${ledger.ledger_id}`);
  if (ledger.ledger_version !== HNK_EVIDENCE_LEDGER_VERSION) issues.push(`unexpected ledger_version ${ledger.ledger_version}`);
  if (ledger.authority !== "HNK_AUTHORED_EVIDENCE_LEDGER") issues.push(`unexpected authority ${ledger.authority}`);
  if (!nonEmpty(ledger.experiment_id)) issues.push("experiment_id required");
  if (!nonEmpty(ledger.created_at)) issues.push("created_at required");
  if (ledger.attestation_integrity_verified !== true) issues.push("attestation_integrity_verified must remain true");
  if (ledger.persistence !== "USER_CONTROLLED_FILE_ONLY") issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  if (ledger.server_persistence !== false) issues.push("server_persistence must remain false");
  if (ledger.browser_persistence !== false) issues.push("browser_persistence must remain false");
  if (ledger.automatic_truth_inference !== false) issues.push("automatic_truth_inference must remain false");
  if (ledger.causal_claim_permitted !== false) issues.push("causal_claim_permitted must remain false");
  if (ledger.metaphysical_proof_permitted !== false) issues.push("metaphysical_proof_permitted must remain false");
  if (ledger.claim_boundary !== HNK_EVIDENCE_LEDGER_BOUNDARY) issues.push(`unexpected claim_boundary ${ledger.claim_boundary}`);

  if (!ledger.bindings || typeof ledger.bindings !== "object") {
    issues.push("bindings required");
  } else {
    if (!nonEmpty(ledger.bindings.experiment_protocol_version)) issues.push("bindings.experiment_protocol_version required");
    for (const field of [
      "preregistration_digest",
      "protocol_snapshot_digest",
      "attestation_chain_head",
      "measurement_plan_digest",
      "measurement_contract_digest",
    ]) {
      if (!HEX_64.test(ledger.bindings[field] ?? "")) issues.push(`bindings.${field} must be SHA-256 hex`);
    }
  }

  if (!Array.isArray(ledger.evidence_entries) || ledger.evidence_entries.length === 0) {
    issues.push("evidence_entries required");
  } else {
    const ids = new Set();
    for (const entry of ledger.evidence_entries) validateEvidenceEntry(entry, issues, ids);
    if (!ledger.evidence_entries.some((entry) => entry.kind === "PREREGISTRATION")) {
      issues.push("ledger must contain preregistration evidence");
    }
  }

  if (!Array.isArray(ledger.claims)) {
    issues.push("claims must be an array");
  } else {
    const claimIds = new Set();
    for (const claim of ledger.claims) validateClaim(claim, issues, claimIds);
  }

  if (!HEX_64.test(ledger.ledger_digest ?? "")) issues.push("ledger_digest must be SHA-256 hex");
  else if (ledgerDigest(ledger) !== ledger.ledger_digest) issues.push("ledger_digest mismatch");

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function verifyEvidenceLedger(ledger, protocol, attestation, measurement) {
  const issues = [];
  const validation = validateEvidenceLedger(ledger);
  if (!validation.ok) issues.push(...validation.issues);

  const protocolValidation = validateExperimentProtocol(protocol);
  if (!protocolValidation.ok) issues.push(...protocolValidation.issues.map((issue) => `protocol: ${issue}`));
  const attestationVerification = verifyExperimentAttestation(attestation, protocol);
  const measurementValidation = validateMeasurementContract(measurement, protocol);

  const attestationMatches =
    attestationVerification.ok &&
    attestationVerification.preregistration_matches &&
    attestationVerification.snapshot_matches &&
    attestationVerification.chain_matches &&
    ledger.bindings?.preregistration_digest === attestation.preregistration_digest &&
    ledger.bindings?.protocol_snapshot_digest === attestation.protocol_snapshot_digest &&
    ledger.bindings?.attestation_chain_head === attestation.chain_head;

  const measurementMatches =
    measurementValidation.ok &&
    ledger.bindings?.measurement_plan_digest === measurement.measurement_plan_digest &&
    ledger.bindings?.measurement_contract_digest === sha256Canonical(measurement) &&
    measurement.experiment_preregistration_digest === attestation.preregistration_digest;

  const expectedEntries = [
    attestationEntry(attestation),
    ...sessionEntries(attestation),
    ...measurementEntries(measurement),
    ...reportEntries(attestation),
  ];
  const sourceEntriesMatch =
    JSON.stringify(expectedEntries) === JSON.stringify(ledger.evidence_entries);

  if (ledger.experiment_id !== protocol.experiment_id) issues.push("ledger experiment_id differs from protocol");
  if (!attestationMatches) issues.push("attestation bindings do not match ledger");
  if (!measurementMatches) issues.push("measurement bindings do not match ledger");
  if (!sourceEntriesMatch) issues.push("evidence entries do not match linked source records");

  return deepFreeze({
    ok: issues.length === 0,
    issues,
    sources_match: sourceEntriesMatch,
    attestation_matches: attestationMatches,
    measurement_matches: measurementMatches,
  });
}

export function addEvidenceClaim(ledger, input) {
  const validation = validateEvidenceLedger(ledger);
  if (!validation.ok) throw new Error(`cannot extend invalid evidence ledger: ${validation.issues.join("; ")}`);
  if (!input || typeof input !== "object") throw new TypeError("claim input required");

  const claimId = cleanString(input.claim_id, "claim_id");
  if (ledger.claims.some((claim) => claim.claim_id === claimId)) throw new Error(`duplicate claim_id ${claimId}`);
  const statement = cleanString(input.statement, "statement");
  if (!HNK_EVIDENCE_CLAIM_SCOPES.includes(input.scope)) throw new RangeError(`invalid claim scope ${input.scope}`);
  const createdAt = cleanString(input.created_at, "created_at");
  if (!Array.isArray(input.requirements) || input.requirements.length === 0) {
    throw new TypeError("at least one evidence requirement required");
  }

  const requirements = input.requirements.map(normalizeRequirement);
  if (new Set(requirements.map((item) => item.requirement_id)).size !== requirements.length) {
    throw new Error("claim requirement_id values must be unique");
  }

  const next = clone(ledger);
  next.claims.push({
    claim_id: claimId,
    statement,
    scope: input.scope,
    created_at: createdAt,
    requirements,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
  });
  next.ledger_digest = ledgerDigest(next);
  const nextValidation = validateEvidenceLedger(next);
  if (!nextValidation.ok) throw new Error(`claim produced invalid evidence ledger: ${nextValidation.issues.join("; ")}`);
  return deepFreeze(next);
}

function evaluateRequirement(ledger, requirement) {
  const entries = ledger.evidence_entries;
  if (requirement.kind === "ATTESTATION_INTEGRITY") {
    return {
      requirement_id: requirement.requirement_id,
      kind: requirement.kind,
      satisfied: ledger.attestation_integrity_verified === true,
      observed_count: null,
      required_count: null,
      note: ledger.attestation_integrity_verified
        ? "Attestation integrity was verified when the ledger was created."
        : "Attestation integrity is not verified.",
    };
  }
  if (requirement.kind === "REPORT_PRESENT") {
    const count = entries.filter((entry) => entry.kind === "FINAL_REPORT").length;
    return {
      requirement_id: requirement.requirement_id,
      kind: requirement.kind,
      satisfied: count >= 1,
      observed_count: count,
      required_count: 1,
      note: count >= 1 ? "A final report record is present." : "No final report record is present.",
    };
  }
  if (requirement.kind === "SESSION_ROLE_COUNT") {
    const count = entries.filter((entry) => entry.kind === "SESSION_ARTIFACT" && entry.role === requirement.role).length;
    return {
      requirement_id: requirement.requirement_id,
      kind: requirement.kind,
      satisfied: count >= requirement.min_count,
      observed_count: count,
      required_count: requirement.min_count,
      note: `${requirement.role} sessions: ${count}/${requirement.min_count}`,
    };
  }
  if (requirement.kind === "METRIC_ROLE_RECORDS") {
    const count = entries.filter((entry) =>
      entry.kind === "MEASUREMENT_RECORD" &&
      entry.metric_id === requirement.metric_id &&
      entry.role === requirement.role
    ).length;
    return {
      requirement_id: requirement.requirement_id,
      kind: requirement.kind,
      satisfied: count >= requirement.min_count,
      observed_count: count,
      required_count: requirement.min_count,
      note: `${requirement.metric_id} / ${requirement.role}: ${count}/${requirement.min_count}`,
    };
  }
  const count = entries.filter((entry) =>
    entry.kind === "MEASUREMENT_RECORD" && entry.metric_id === requirement.metric_id
  ).length;
  return {
    requirement_id: requirement.requirement_id,
    kind: requirement.kind,
    satisfied: count >= requirement.min_count,
    observed_count: count,
    required_count: requirement.min_count,
    note: `${requirement.metric_id}: ${count}/${requirement.min_count}`,
  };
}

export function evaluateEvidenceClaim(ledger, claimOrId) {
  const validation = validateEvidenceLedger(ledger);
  if (!validation.ok) throw new Error(`cannot evaluate invalid evidence ledger: ${validation.issues.join("; ")}`);
  const claim = typeof claimOrId === "string"
    ? ledger.claims.find((entry) => entry.claim_id === claimOrId)
    : claimOrId;
  if (!claim) throw new Error(`unknown claim ${String(claimOrId)}`);

  const requirements = claim.requirements.map((requirement) => evaluateRequirement(ledger, requirement));
  const satisfied = requirements.filter((requirement) => requirement.satisfied).length;
  const total = requirements.length;
  const coverageStatus =
    satisfied === total
      ? "COMPLETE_FOR_DECLARED_REQUIREMENTS"
      : satisfied === 0
        ? "INSUFFICIENT"
        : "PARTIAL";

  return deepFreeze({
    claim_id: claim.claim_id,
    statement: claim.statement,
    scope: claim.scope,
    coverage_status: coverageStatus,
    satisfied_requirements: satisfied,
    total_requirements: total,
    missing_requirements: requirements.filter((requirement) => !requirement.satisfied).map((requirement) => requirement.requirement_id),
    requirements,
    truth_assessed: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
  });
}

export function evidenceLedgerIndex(ledger) {
  const validation = validateEvidenceLedger(ledger);
  if (!validation.ok) throw new Error(`cannot index invalid evidence ledger: ${validation.issues.join("; ")}`);
  return deepFreeze({
    experiment_id: ledger.experiment_id,
    ledger_digest: ledger.ledger_digest,
    evidence: {
      preregistration: ledger.evidence_entries.filter((entry) => entry.kind === "PREREGISTRATION").length,
      sessions: ledger.evidence_entries.filter((entry) => entry.kind === "SESSION_ARTIFACT").length,
      measurements: ledger.evidence_entries.filter((entry) => entry.kind === "MEASUREMENT_RECORD").length,
      reports: ledger.evidence_entries.filter((entry) => entry.kind === "FINAL_REPORT").length,
    },
    claims: ledger.claims.map((claim) => evaluateEvidenceClaim(ledger, claim)),
    automatic_truth_inference: false,
    claim_boundary: ledger.claim_boundary,
  });
}

export function serializeEvidenceLedger(ledger) {
  const validation = validateEvidenceLedger(ledger);
  if (!validation.ok) throw new Error(`cannot serialize invalid evidence ledger: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(ledger, null, 2)}\n`;
}

export function parseEvidenceLedger(text) {
  if (!nonEmpty(text)) throw new TypeError("evidence ledger JSON text required");
  let ledger;
  try {
    ledger = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid evidence ledger JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }
  const validation = validateEvidenceLedger(ledger);
  if (!validation.ok) throw new Error(`invalid evidence ledger: ${validation.issues.join("; ")}`);
  return deepFreeze(ledger);
}

export function evidenceLedgerSummary() {
  return deepFreeze({
    ledger_id: HNK_EVIDENCE_LEDGER_ID,
    version: HNK_EVIDENCE_LEDGER_VERSION,
    evidence_kinds: [...HNK_EVIDENCE_KINDS],
    claim_scopes: [...HNK_EVIDENCE_CLAIM_SCOPES],
    requirement_kinds: [...HNK_EVIDENCE_REQUIREMENT_KINDS],
    coverage_statuses: [...HNK_EVIDENCE_COVERAGE_STATUSES],
    sha256_bound_sources: true,
    explicit_insufficiency: true,
    automatic_truth_inference: false,
    inferential_statistics_performed: false,
    server_persistence: false,
    browser_persistence: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_EVIDENCE_LEDGER_BOUNDARY,
  });
}
