import {
  validateClaimDossier,
} from "@hnk/claim-dossier";
import {
  verifyEvidenceReviewGate,
  validateEvidenceReviewGate,
} from "@hnk/evidence-review-gate";
import { sha256Canonical } from "@hnk/experiment-attestation";

export const HNK_REVIEWED_CLAIM_REGISTRY_ID = "HNK_REVIEWED_CLAIM_REGISTRY_V1";
export const HNK_REVIEWED_CLAIM_REGISTRY_VERSION = "1.0.0";
export const HNK_REVIEWED_CLAIM_REGISTRY_BOUNDARY =
  "REVIEWED_CLAIM_REGISTRY_INDEXES_HUMAN_REVIEW_CLASSIFICATIONS_NOT_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON";
export const HNK_REVIEWED_CLAIM_CLASSIFICATIONS = Object.freeze([
  "DESCRIPTIVE_SUMMARY",
  "HYPOTHESIS",
  "MORE_EVIDENCE_REQUIRED",
  "UNSUPPORTED_AT_SCOPE",
]);

const HEX_64 = /^[0-9a-f]{64}$/;

const OUTCOME_TO_CLASSIFICATION = Object.freeze({
  ACCEPT_AS_DESCRIPTIVE_SUMMARY: "DESCRIPTIVE_SUMMARY",
  KEEP_AS_HYPOTHESIS: "HYPOTHESIS",
  REQUEST_MORE_EVIDENCE: "MORE_EVIDENCE_REQUIRED",
  REJECT_AS_UNSUPPORTED_AT_SCOPE: "UNSUPPORTED_AT_SCOPE",
});

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

function registryDigest(registry) {
  return sha256Canonical(reviewedClaimRegistryProjection(registry));
}

function recordProjection(record) {
  const projected = clone(record);
  delete projected.record_digest;
  return projected;
}

function recordDigest(record) {
  return sha256Canonical(recordProjection(record));
}

function classificationForOutcome(outcome) {
  const classification = OUTCOME_TO_CLASSIFICATION[outcome];
  if (!classification) throw new RangeError(`unsupported evidence review outcome ${outcome}`);
  return classification;
}

function activeEntries(registry) {
  const superseded = new Set(
    registry.records
      .map((record) => record.supersedes_record_id)
      .filter(Boolean),
  );
  return registry.records.filter((record) => !superseded.has(record.record_id));
}

function activeRecordForClaim(registry, claimId) {
  const candidates = activeEntries(registry).filter((record) => record.claim_id === claimId);
  if (candidates.length > 1) {
    throw new Error(`registry invariant failure: multiple active records for claim ${claimId}`);
  }
  return candidates[0] ?? null;
}

function nextClaimVersion(registry, claimId) {
  const versions = registry.records
    .filter((record) => record.claim_id === claimId)
    .map((record) => record.claim_version);
  return versions.length ? Math.max(...versions) + 1 : 1;
}

function buildReviewedRecord(registry, input) {
  if (!input || typeof input !== "object") throw new TypeError("reviewed claim input required");
  const dossier = input.dossier;
  const gate = input.review_gate;

  const dossierValidation = validateClaimDossier(dossier);
  if (!dossierValidation.ok) {
    throw new Error(`invalid claim dossier: ${dossierValidation.issues.join("; ")}`);
  }
  const gateValidation = validateEvidenceReviewGate(gate);
  if (!gateValidation.ok) {
    throw new Error(`invalid evidence review gate: ${gateValidation.issues.join("; ")}`);
  }
  const binding = verifyEvidenceReviewGate(gate, dossier);
  if (!binding.ok) {
    throw new Error(`review gate/dossier binding failed: ${binding.issues.join("; ")}`);
  }
  if (gate.status !== "REVIEWED" || !gate.review?.human_decision) {
    throw new Error("only REVIEWED human-decided evidence review gates may enter the registry");
  }

  const current = activeRecordForClaim(registry, dossier.claim_id);
  const requestedSupersedes = input.supersedes_record_id ?? null;

  if (!current && requestedSupersedes !== null) {
    throw new Error(`claim ${dossier.claim_id} has no active prior record to supersede`);
  }
  if (current && requestedSupersedes === null) {
    throw new Error(
      `claim ${dossier.claim_id} already has active record ${current.record_id}; supersedes_record_id is required`,
    );
  }
  if (current && requestedSupersedes !== current.record_id) {
    throw new Error(
      `supersedes_record_id must reference current active record ${current.record_id} for claim ${dossier.claim_id}`,
    );
  }

  const record = {
    record_id: cleanString(input.record_id, "record_id"),
    claim_id: dossier.claim_id,
    claim_version: nextClaimVersion(registry, dossier.claim_id),
    statement: dossier.statement,
    scope: dossier.scope,
    classification: classificationForOutcome(gate.review.outcome),
    review_outcome: gate.review.outcome,
    dossier_digest: dossier.dossier_digest,
    review_gate_digest: gate.gate_digest,
    synthesis_key: dossier.synthesis_binding.synthesis_key,
    synthesis_digest: dossier.synthesis_binding.synthesis_digest,
    reviewer: gate.review.reviewer,
    reviewed_at: gate.review.reviewed_at,
    explicit_human_signal: gate.review.explicit_human_signal,
    review_rationale: gate.review.rationale,
    unresolved_questions: [...gate.review.unresolved_questions],
    gaps: [...dossier.gaps],
    conflicts: [...dossier.conflicts],
    registered_at: cleanString(input.registered_at, "registered_at"),
    supersedes_record_id: requestedSupersedes,
    record_digest: "",
    human_review_derived: true,
    truth_assessed: false,
    canon_status: "NOT_CANON",
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
  };
  record.record_digest = recordDigest(record);
  return deepFreeze(record);
}

export function reviewedClaimRegistryProjection(registry) {
  const projected = clone(registry);
  delete projected.registry_digest;
  return deepFreeze(projected);
}

export function createReviewedClaimRegistry(input) {
  if (!input || typeof input !== "object") throw new TypeError("reviewed claim registry input required");

  const registry = {
    registry_id: HNK_REVIEWED_CLAIM_REGISTRY_ID,
    registry_version: HNK_REVIEWED_CLAIM_REGISTRY_VERSION,
    authority: "HNK_AUTHORED_REVIEWED_CLAIM_REGISTRY",
    registry_key: cleanString(input.registry_key, "registry_key"),
    title: cleanString(input.title, "title"),
    created_at: cleanString(input.created_at, "created_at"),
    records: [],
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    machine_can_decide_review: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_REVIEWED_CLAIM_REGISTRY_BOUNDARY,
  };
  registry.registry_digest = registryDigest(registry);

  const validation = validateReviewedClaimRegistry(registry);
  if (!validation.ok) throw new Error(`invalid reviewed claim registry: ${validation.issues.join("; ")}`);
  return deepFreeze(registry);
}

export function addReviewedClaim(registry, input) {
  const validation = validateReviewedClaimRegistry(registry);
  if (!validation.ok) {
    throw new Error(`cannot extend invalid reviewed claim registry: ${validation.issues.join("; ")}`);
  }

  const record = buildReviewedRecord(registry, input);

  if (registry.records.some((item) => item.record_id === record.record_id)) {
    throw new Error(`duplicate record_id ${record.record_id}`);
  }
  if (registry.records.some((item) => item.dossier_digest === record.dossier_digest)) {
    throw new Error(`dossier ${record.dossier_digest} is already registered`);
  }
  if (registry.records.some((item) => item.review_gate_digest === record.review_gate_digest)) {
    throw new Error(`review gate ${record.review_gate_digest} is already registered`);
  }

  const next = clone(registry);
  next.records.push(clone(record));
  next.registry_digest = registryDigest(next);

  const nextValidation = validateReviewedClaimRegistry(next);
  if (!nextValidation.ok) {
    throw new Error(`reviewed claim produced invalid registry: ${nextValidation.issues.join("; ")}`);
  }
  return deepFreeze(next);
}

function validateRecord(record, issues, seen) {
  if (!record || typeof record !== "object") {
    issues.push("record must be an object");
    return;
  }

  for (const field of [
    "record_id",
    "claim_id",
    "statement",
    "scope",
    "classification",
    "review_outcome",
    "synthesis_key",
    "reviewer",
    "reviewed_at",
    "explicit_human_signal",
    "review_rationale",
    "registered_at",
  ]) {
    if (!nonEmpty(record[field])) issues.push(`reviewed claim ${field} required`);
  }

  if (!Number.isInteger(record.claim_version) || record.claim_version < 1) {
    issues.push(`${record.record_id}: claim_version must be integer >= 1`);
  }
  if (!["DESCRIPTIVE", "PROCESS_INTEGRITY", "EXPLORATORY_INTERPRETATION"].includes(record.scope)) {
    issues.push(`${record.record_id}: invalid scope ${record.scope}`);
  }
  if (!HNK_REVIEWED_CLAIM_CLASSIFICATIONS.includes(record.classification)) {
    issues.push(`${record.record_id}: invalid classification ${record.classification}`);
  }

  let expectedClassification = null;
  try {
    expectedClassification = classificationForOutcome(record.review_outcome);
  } catch {
    issues.push(`${record.record_id}: invalid review_outcome ${record.review_outcome}`);
  }
  if (expectedClassification && record.classification !== expectedClassification) {
    issues.push(`${record.record_id}: classification does not match review_outcome`);
  }

  for (const field of ["dossier_digest", "review_gate_digest", "synthesis_digest", "record_digest"]) {
    if (!HEX_64.test(record[field] ?? "")) {
      issues.push(`${record.record_id}: ${field} must be SHA-256 hex`);
    }
  }

  for (const field of ["unresolved_questions", "gaps", "conflicts"]) {
    if (!Array.isArray(record[field]) || record[field].some((value) => !nonEmpty(value))) {
      issues.push(`${record.record_id}: ${field} must contain only non-empty strings`);
    }
  }

  if (record.supersedes_record_id !== null && !nonEmpty(record.supersedes_record_id)) {
    issues.push(`${record.record_id}: supersedes_record_id must be null or non-empty string`);
  }
  if (record.human_review_derived !== true) issues.push(`${record.record_id}: human_review_derived must remain true`);
  if (record.truth_assessed !== false) issues.push(`${record.record_id}: truth_assessed must remain false`);
  if (record.canon_status !== "NOT_CANON") issues.push(`${record.record_id}: canon_status must remain NOT_CANON`);
  if (record.causal_claim_permitted !== false) issues.push(`${record.record_id}: causal_claim_permitted must remain false`);
  if (record.metaphysical_proof_permitted !== false) issues.push(`${record.record_id}: metaphysical_proof_permitted must remain false`);

  if (HEX_64.test(record.record_digest ?? "") && recordDigest(record) !== record.record_digest) {
    issues.push(`${record.record_id}: record_digest mismatch`);
  }

  for (const [key, value] of [
    ["record_id", record.record_id],
    ["dossier_digest", record.dossier_digest],
    ["review_gate_digest", record.review_gate_digest],
  ]) {
    if (seen[key].has(value)) issues.push(`duplicate ${key} ${value}`);
    seen[key].add(value);
  }
}

function validateLineage(records, issues) {
  const byId = new Map(records.map((record) => [record.record_id, record]));
  const versionsByClaim = new Map();

  for (const record of records) {
    const versions = versionsByClaim.get(record.claim_id) ?? [];
    versions.push(record.claim_version);
    versionsByClaim.set(record.claim_id, versions);

    if (record.supersedes_record_id !== null) {
      const previous = byId.get(record.supersedes_record_id);
      if (!previous) {
        issues.push(`${record.record_id}: supersedes_record_id ${record.supersedes_record_id} not found`);
      } else {
        if (previous.claim_id !== record.claim_id) {
          issues.push(`${record.record_id}: cannot supersede a different claim_id`);
        }
        if (previous.claim_version + 1 !== record.claim_version) {
          issues.push(`${record.record_id}: claim_version must increment superseded record by exactly 1`);
        }
      }
    } else if (record.claim_version !== 1) {
      issues.push(`${record.record_id}: first lineage record must have claim_version 1`);
    }
  }

  for (const [claimId, versions] of versionsByClaim.entries()) {
    const sorted = [...versions].sort((a, b) => a - b);
    const expected = Array.from({ length: sorted.length }, (_, index) => index + 1);
    if (JSON.stringify(sorted) !== JSON.stringify(expected)) {
      issues.push(`claim ${claimId}: versions must be contiguous from 1`);
    }
  }

  const superseded = new Set(records.map((record) => record.supersedes_record_id).filter(Boolean));
  const activeByClaim = new Map();
  for (const record of records.filter((item) => !superseded.has(item.record_id))) {
    activeByClaim.set(record.claim_id, (activeByClaim.get(record.claim_id) ?? 0) + 1);
  }
  for (const [claimId, count] of activeByClaim.entries()) {
    if (count !== 1) issues.push(`claim ${claimId}: exactly one active record required`);
  }
}

export function validateReviewedClaimRegistry(registry) {
  const issues = [];
  if (!registry || typeof registry !== "object") {
    return deepFreeze({ ok: false, issues: ["registry must be an object"] });
  }

  if (registry.registry_id !== HNK_REVIEWED_CLAIM_REGISTRY_ID) {
    issues.push(`unexpected registry_id ${registry.registry_id}`);
  }
  if (registry.registry_version !== HNK_REVIEWED_CLAIM_REGISTRY_VERSION) {
    issues.push(`unexpected registry_version ${registry.registry_version}`);
  }
  if (registry.authority !== "HNK_AUTHORED_REVIEWED_CLAIM_REGISTRY") {
    issues.push(`unexpected authority ${registry.authority}`);
  }
  for (const field of ["registry_key", "title", "created_at"]) {
    if (!nonEmpty(registry[field])) issues.push(`${field} required`);
  }

  if (!Array.isArray(registry.records)) {
    issues.push("records must be an array");
  } else {
    const seen = {
      record_id: new Set(),
      dossier_digest: new Set(),
      review_gate_digest: new Set(),
    };
    for (const record of registry.records) validateRecord(record, issues, seen);
    validateLineage(registry.records, issues);
  }

  if (registry.persistence !== "USER_CONTROLLED_FILE_ONLY") issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  if (registry.server_persistence !== false) issues.push("server_persistence must remain false");
  if (registry.browser_persistence !== false) issues.push("browser_persistence must remain false");
  if (registry.machine_can_decide_review !== false) issues.push("machine_can_decide_review must remain false");
  if (registry.automatic_truth_inference !== false) issues.push("automatic_truth_inference must remain false");
  if (registry.automatic_canon_promotion !== false) issues.push("automatic_canon_promotion must remain false");
  if (registry.canon_promotion_permitted !== false) issues.push("canon_promotion_permitted must remain false");
  if (registry.causal_claim_permitted !== false) issues.push("causal_claim_permitted must remain false");
  if (registry.metaphysical_proof_permitted !== false) issues.push("metaphysical_proof_permitted must remain false");
  if (registry.claim_boundary !== HNK_REVIEWED_CLAIM_REGISTRY_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${registry.claim_boundary}`);
  }

  if (!HEX_64.test(registry.registry_digest ?? "")) {
    issues.push("registry_digest must be SHA-256 hex");
  } else if (registryDigest(registry) !== registry.registry_digest) {
    issues.push("registry_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function verifyReviewedClaimRecord(record, dossier, reviewGate) {
  const issues = [];
  const dossierValidation = validateClaimDossier(dossier);
  if (!dossierValidation.ok) issues.push(...dossierValidation.issues.map((issue) => `dossier: ${issue}`));
  const gateValidation = validateEvidenceReviewGate(reviewGate);
  if (!gateValidation.ok) issues.push(...gateValidation.issues.map((issue) => `gate: ${issue}`));
  const binding = verifyEvidenceReviewGate(reviewGate, dossier);
  if (!binding.ok) issues.push(...binding.issues);

  if (reviewGate.status !== "REVIEWED" || !reviewGate.review?.human_decision) {
    issues.push("review gate must be REVIEWED with human_decision=true");
  }

  if (
    record.claim_id !== dossier.claim_id ||
    record.statement !== dossier.statement ||
    record.scope !== dossier.scope ||
    record.dossier_digest !== dossier.dossier_digest ||
    record.review_gate_digest !== reviewGate.gate_digest ||
    record.synthesis_key !== dossier.synthesis_binding.synthesis_key ||
    record.synthesis_digest !== dossier.synthesis_binding.synthesis_digest
  ) {
    issues.push("reviewed claim record does not match supplied dossier/gate snapshot");
  }

  if (reviewGate.review) {
    if (
      record.classification !== classificationForOutcome(reviewGate.review.outcome) ||
      record.review_outcome !== reviewGate.review.outcome ||
      record.reviewer !== reviewGate.review.reviewer ||
      record.reviewed_at !== reviewGate.review.reviewed_at ||
      record.explicit_human_signal !== reviewGate.review.explicit_human_signal ||
      record.review_rationale !== reviewGate.review.rationale ||
      JSON.stringify(record.unresolved_questions) !== JSON.stringify(reviewGate.review.unresolved_questions)
    ) {
      issues.push("reviewed claim record review snapshot drift");
    }
  }

  if (
    JSON.stringify(record.gaps) !== JSON.stringify(dossier.gaps) ||
    JSON.stringify(record.conflicts) !== JSON.stringify(dossier.conflicts)
  ) {
    issues.push("reviewed claim record dossier gaps/conflicts drift");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

function registryEntries(registry) {
  const supersededBy = new Map();
  for (const record of registry.records) {
    if (record.supersedes_record_id) supersededBy.set(record.supersedes_record_id, record.record_id);
  }
  return registry.records.map((record) => ({
    ...clone(record),
    active: !supersededBy.has(record.record_id),
    superseded_by_record_id: supersededBy.get(record.record_id) ?? null,
  }));
}

export function reviewedClaimRegistryIndex(registry) {
  const validation = validateReviewedClaimRegistry(registry);
  if (!validation.ok) throw new Error(`cannot index invalid reviewed claim registry: ${validation.issues.join("; ")}`);

  const records = registryEntries(registry);
  const active = records.filter((record) => record.active);
  const classificationCounts = Object.fromEntries(
    HNK_REVIEWED_CLAIM_CLASSIFICATIONS.map((classification) => [
      classification,
      records.filter((record) => record.classification === classification).length,
    ]),
  );
  const activeClassificationCounts = Object.fromEntries(
    HNK_REVIEWED_CLAIM_CLASSIFICATIONS.map((classification) => [
      classification,
      active.filter((record) => record.classification === classification).length,
    ]),
  );

  return deepFreeze({
    registry_key: registry.registry_key,
    total_records: records.length,
    active_claims: active.length,
    claim_ids: new Set(records.map((record) => record.claim_id)).size,
    classification_counts: classificationCounts,
    active_classification_counts: activeClassificationCounts,
    records,
    truth_assessed: false,
    canon_promotion_permitted: false,
  });
}

export function queryReviewedClaimRegistry(registry, query = {}) {
  const index = reviewedClaimRegistryIndex(registry);
  let records = [...index.records];

  if (query.active_only !== false) records = records.filter((record) => record.active);
  if (query.classification) {
    if (!HNK_REVIEWED_CLAIM_CLASSIFICATIONS.includes(query.classification)) {
      throw new RangeError(`invalid reviewed claim classification ${query.classification}`);
    }
    records = records.filter((record) => record.classification === query.classification);
  }
  if (query.scope) records = records.filter((record) => record.scope === query.scope);
  if (query.claim_id) records = records.filter((record) => record.claim_id === query.claim_id);

  if (nonEmpty(query.q)) {
    const needle = query.q.trim().toLowerCase();
    records = records.filter((record) =>
      [
        record.claim_id,
        record.statement,
        record.classification,
        record.review_outcome,
        record.reviewer,
        record.review_rationale,
        record.synthesis_key,
        ...record.gaps,
        ...record.conflicts,
        ...record.unresolved_questions,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }

  return deepFreeze(records);
}

export function serializeReviewedClaimRegistry(registry) {
  const validation = validateReviewedClaimRegistry(registry);
  if (!validation.ok) {
    throw new Error(`cannot serialize invalid reviewed claim registry: ${validation.issues.join("; ")}`);
  }
  return `${JSON.stringify(registry, null, 2)}\n`;
}

export function parseReviewedClaimRegistry(text) {
  if (!nonEmpty(text)) throw new TypeError("reviewed claim registry JSON text required");
  let registry;
  try {
    registry = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid reviewed claim registry JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }
  const validation = validateReviewedClaimRegistry(registry);
  if (!validation.ok) {
    throw new Error(`invalid reviewed claim registry: ${validation.issues.join("; ")}`);
  }
  return deepFreeze(registry);
}

export function reviewedClaimRegistrySummary() {
  return deepFreeze({
    registry_id: HNK_REVIEWED_CLAIM_REGISTRY_ID,
    version: HNK_REVIEWED_CLAIM_REGISTRY_VERSION,
    classifications: [...HNK_REVIEWED_CLAIM_CLASSIFICATIONS],
    source_gate: "HNK_EVIDENCE_REVIEW_GATE_V1",
    reviewed_gate_required: true,
    human_decision_required: true,
    versioning: "CLAIM_ID_WITH_CONTIGUOUS_VERSIONS",
    supersession: "NEW_VERSION_POINTS_TO_CURRENT_ACTIVE_RECORD",
    non_destructive_history: true,
    searchable: true,
    active_and_historical_views: true,
    machine_can_decide_review: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_REVIEWED_CLAIM_REGISTRY_BOUNDARY,
  });
}
