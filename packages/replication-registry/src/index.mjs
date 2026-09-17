import { validateEvidenceLedger } from "@hnk/evidence-ledger";
import { sha256Canonical } from "@hnk/experiment-attestation";

export const HNK_REPLICATION_REGISTRY_ID = "HNK_REPLICATION_REGISTRY_V1";
export const HNK_REPLICATION_REGISTRY_VERSION = "1.0.0";
export const HNK_REPLICATION_REGISTRY_BOUNDARY =
  "REPLICATION_REGISTRY_DESCRIBES_REPEATABILITY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF";
export const HNK_REPLICATION_STATUSES = Object.freeze([
  "INSUFFICIENT",
  "SINGLE_RUN",
  "REPLICATED",
  "MIXED",
]);
export const HNK_REPLICATION_DIRECTIONS = Object.freeze([
  "HIGHER",
  "LOWER",
  "EQUAL",
  "INSUFFICIENT",
]);
export const HNK_REPLICATION_METRIC_TYPES = Object.freeze([
  "NUMBER",
  "COUNT",
  "SCALE",
  "BOOLEAN",
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

function metricEntries(ledger, metricId) {
  return ledger.evidence_entries.filter(
    (entry) => entry.kind === "MEASUREMENT_RECORD" && entry.metric_id === metricId,
  );
}

function metricSignatureProjection(signature) {
  const projected = clone(signature);
  delete projected.signature_digest;
  return projected;
}

function metricSignatureFromLedger(ledger, metricId) {
  const entries = metricEntries(ledger, metricId);
  if (!entries.length) throw new Error(`ledger ${ledger.experiment_id} has no measurement records for metric ${metricId}`);

  const first = entries[0];
  const signature = {
    metric_id: metricId,
    metric_type: first.metadata?.metric_type ?? null,
    label: first.metadata?.metric_label ?? null,
    unit: first.metadata?.unit ?? null,
    evidence_source: first.evidence_source ?? null,
    timepoint: first.timepoint ?? null,
    evaluation_criterion: first.metadata?.evaluation_criterion ?? null,
    signature_digest: "",
  };

  if (!HNK_REPLICATION_METRIC_TYPES.includes(signature.metric_type)) {
    throw new Error(
      `metric ${metricId} type ${String(signature.metric_type)} is not supported by Replication Registry V1`,
    );
  }
  if (!nonEmpty(signature.label)) throw new Error(`metric ${metricId} label is missing`);

  for (const entry of entries.slice(1)) {
    const candidate = {
      metric_id: metricId,
      metric_type: entry.metadata?.metric_type ?? null,
      label: entry.metadata?.metric_label ?? null,
      unit: entry.metadata?.unit ?? null,
      evidence_source: entry.evidence_source ?? null,
      timepoint: entry.timepoint ?? null,
      evaluation_criterion: entry.metadata?.evaluation_criterion ?? null,
    };
    const baseline = metricSignatureProjection(signature);
    if (JSON.stringify(candidate) !== JSON.stringify(baseline)) {
      throw new Error(`metric ${metricId} metadata is internally inconsistent inside ledger ${ledger.experiment_id}`);
    }
  }

  signature.signature_digest = sha256Canonical(metricSignatureProjection(signature));
  return deepFreeze(signature);
}

function signatureCompatible(expected, actual) {
  return expected.signature_digest === actual.signature_digest &&
    JSON.stringify(metricSignatureProjection(expected)) === JSON.stringify(metricSignatureProjection(actual));
}

function aggregateValues(entries, metricType) {
  if (!entries.length) return { n: 0, aggregate: null };

  if (metricType === "BOOLEAN") {
    const values = entries.map((entry) => entry.metadata?.value);
    if (values.some((value) => typeof value !== "boolean")) {
      throw new TypeError("BOOLEAN replication metric contains non-boolean measurement value");
    }
    const trueCount = values.filter(Boolean).length;
    return { n: values.length, aggregate: trueCount / values.length };
  }

  const values = entries.map((entry) => Number(entry.metadata?.value));
  if (values.some((value) => !Number.isFinite(value))) {
    throw new TypeError(`${metricType} replication metric contains non-numeric measurement value`);
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return { n: values.length, aggregate: total / values.length };
}

function descriptiveDirection(control, experiment) {
  if (!control.n || !experiment.n || control.aggregate === null || experiment.aggregate === null) {
    return "INSUFFICIENT";
  }
  const delta = experiment.aggregate - control.aggregate;
  if (Math.abs(delta) <= 1e-12) return "EQUAL";
  return delta > 0 ? "HIGHER" : "LOWER";
}

function buildRun(ledger, expectedSignature, runId, addedAt) {
  const ledgerValidation = validateEvidenceLedger(ledger);
  if (!ledgerValidation.ok) {
    throw new Error(`invalid evidence ledger: ${ledgerValidation.issues.join("; ")}`);
  }
  const signature = metricSignatureFromLedger(ledger, expectedSignature.metric_id);
  if (!signatureCompatible(expectedSignature, signature)) {
    throw new Error(
      `metric signature mismatch for ${ledger.experiment_id}: expected ${expectedSignature.signature_digest}, found ${signature.signature_digest}`,
    );
  }

  const entries = metricEntries(ledger, expectedSignature.metric_id);
  const control = aggregateValues(
    entries.filter((entry) => entry.role === "CONTROL"),
    expectedSignature.metric_type,
  );
  const experiment = aggregateValues(
    entries.filter((entry) => entry.role === "EXPERIMENT"),
    expectedSignature.metric_type,
  );
  const insufficiencyReasons = [];
  if (!control.n) insufficiencyReasons.push("NO_CONTROL_MEASUREMENTS");
  if (!experiment.n) insufficiencyReasons.push("NO_EXPERIMENT_MEASUREMENTS");
  const direction = descriptiveDirection(control, experiment);

  return deepFreeze({
    run_id: cleanString(runId, "run_id"),
    experiment_id: ledger.experiment_id,
    ledger_digest: ledger.ledger_digest,
    added_at: cleanString(addedAt, "added_at"),
    metric_signature_digest: expectedSignature.signature_digest,
    control,
    experiment,
    direction,
    eligible: direction !== "INSUFFICIENT",
    insufficiency_reasons: insufficiencyReasons,
  });
}

function registryDigest(registry) {
  return sha256Canonical(replicationRegistryProjection(registry));
}

export function replicationRegistryProjection(registry) {
  const projected = clone(registry);
  delete projected.registry_digest;
  return deepFreeze(projected);
}

export function createReplicationRegistry(input) {
  if (!input || typeof input !== "object") throw new TypeError("replication registry input required");
  const ledgerValidation = validateEvidenceLedger(input.seed_ledger);
  if (!ledgerValidation.ok) {
    throw new Error(`invalid seed evidence ledger: ${ledgerValidation.issues.join("; ")}`);
  }

  const metricId = cleanString(input.metric_id, "metric_id");
  const signature = metricSignatureFromLedger(input.seed_ledger, metricId);

  const registry = {
    registry_id: HNK_REPLICATION_REGISTRY_ID,
    registry_version: HNK_REPLICATION_REGISTRY_VERSION,
    authority: "HNK_AUTHORED_REPLICATION_REGISTRY",
    replication_key: cleanString(input.replication_key, "replication_key"),
    title: cleanString(input.title, "title"),
    question: cleanString(input.question, "question"),
    metric_signature: clone(signature),
    created_at: cleanString(input.created_at, "created_at"),
    runs: [
      buildRun(
        input.seed_ledger,
        signature,
        input.seed_run_id,
        input.seed_added_at,
      ),
    ],
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    automatic_truth_inference: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_REPLICATION_REGISTRY_BOUNDARY,
  };
  registry.registry_digest = registryDigest(registry);
  const validation = validateReplicationRegistry(registry);
  if (!validation.ok) throw new Error(`invalid replication registry: ${validation.issues.join("; ")}`);
  return deepFreeze(registry);
}

export function addReplicationLedger(registry, input) {
  const validation = validateReplicationRegistry(registry);
  if (!validation.ok) throw new Error(`cannot extend invalid replication registry: ${validation.issues.join("; ")}`);
  if (!input || typeof input !== "object") throw new TypeError("replication run input required");

  const run = buildRun(
    input.ledger,
    registry.metric_signature,
    input.run_id,
    input.added_at,
  );

  if (registry.runs.some((entry) => entry.run_id === run.run_id)) {
    throw new Error(`duplicate run_id ${run.run_id}`);
  }
  if (registry.runs.some((entry) => entry.experiment_id === run.experiment_id)) {
    throw new Error(`experiment ${run.experiment_id} is already registered; replications require distinct experiment IDs`);
  }
  if (registry.runs.some((entry) => entry.ledger_digest === run.ledger_digest)) {
    throw new Error(`ledger ${run.ledger_digest} is already registered`);
  }

  const next = clone(registry);
  next.runs.push(clone(run));
  next.registry_digest = registryDigest(next);
  const nextValidation = validateReplicationRegistry(next);
  if (!nextValidation.ok) throw new Error(`replication run produced invalid registry: ${nextValidation.issues.join("; ")}`);
  return deepFreeze(next);
}

function validateRun(run, signature, issues, seen) {
  if (!run || typeof run !== "object") {
    issues.push("run must be an object");
    return;
  }
  for (const field of ["run_id", "experiment_id", "added_at"]) {
    if (!nonEmpty(run[field])) issues.push(`run.${field} required`);
  }
  if (!HEX_64.test(run.ledger_digest ?? "")) issues.push(`${run.run_id}: ledger_digest must be SHA-256 hex`);
  if (run.metric_signature_digest !== signature.signature_digest) {
    issues.push(`${run.run_id}: metric_signature_digest mismatch`);
  }
  if (!HNK_REPLICATION_DIRECTIONS.includes(run.direction)) issues.push(`${run.run_id}: invalid direction ${run.direction}`);
  for (const side of ["control", "experiment"]) {
    if (!run[side] || typeof run[side] !== "object") {
      issues.push(`${run.run_id}: ${side} summary required`);
      continue;
    }
    if (!Number.isInteger(run[side].n) || run[side].n < 0) issues.push(`${run.run_id}: ${side}.n must be integer >= 0`);
    if (run[side].aggregate !== null && !Number.isFinite(run[side].aggregate)) {
      issues.push(`${run.run_id}: ${side}.aggregate must be finite or null`);
    }
  }
  const expectedEligible = run.direction !== "INSUFFICIENT";
  if (run.eligible !== expectedEligible) issues.push(`${run.run_id}: eligible must match direction sufficiency`);
  if (!Array.isArray(run.insufficiency_reasons)) issues.push(`${run.run_id}: insufficiency_reasons must be an array`);
  if (run.eligible && run.insufficiency_reasons?.length) issues.push(`${run.run_id}: eligible run cannot have insufficiency reasons`);

  for (const [key, value] of [
    ["run_id", run.run_id],
    ["experiment_id", run.experiment_id],
    ["ledger_digest", run.ledger_digest],
  ]) {
    if (seen[key].has(value)) issues.push(`duplicate ${key} ${value}`);
    seen[key].add(value);
  }
}

export function validateReplicationRegistry(registry) {
  const issues = [];
  if (!registry || typeof registry !== "object") {
    return deepFreeze({ ok: false, issues: ["registry must be an object"] });
  }
  if (registry.registry_id !== HNK_REPLICATION_REGISTRY_ID) issues.push(`unexpected registry_id ${registry.registry_id}`);
  if (registry.registry_version !== HNK_REPLICATION_REGISTRY_VERSION) issues.push(`unexpected registry_version ${registry.registry_version}`);
  if (registry.authority !== "HNK_AUTHORED_REPLICATION_REGISTRY") issues.push(`unexpected authority ${registry.authority}`);
  for (const field of ["replication_key", "title", "question", "created_at"]) {
    if (!nonEmpty(registry[field])) issues.push(`${field} required`);
  }
  if (registry.persistence !== "USER_CONTROLLED_FILE_ONLY") issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  if (registry.server_persistence !== false) issues.push("server_persistence must remain false");
  if (registry.browser_persistence !== false) issues.push("browser_persistence must remain false");
  if (registry.automatic_truth_inference !== false) issues.push("automatic_truth_inference must remain false");
  if (registry.causal_claim_permitted !== false) issues.push("causal_claim_permitted must remain false");
  if (registry.metaphysical_proof_permitted !== false) issues.push("metaphysical_proof_permitted must remain false");
  if (registry.claim_boundary !== HNK_REPLICATION_REGISTRY_BOUNDARY) issues.push(`unexpected claim_boundary ${registry.claim_boundary}`);

  const signature = registry.metric_signature;
  if (!signature || typeof signature !== "object") {
    issues.push("metric_signature required");
  } else {
    if (!nonEmpty(signature.metric_id)) issues.push("metric_signature.metric_id required");
    if (!HNK_REPLICATION_METRIC_TYPES.includes(signature.metric_type)) issues.push(`unsupported metric_type ${signature.metric_type}`);
    if (!nonEmpty(signature.label)) issues.push("metric_signature.label required");
    if (!HEX_64.test(signature.signature_digest ?? "")) {
      issues.push("metric_signature.signature_digest must be SHA-256 hex");
    } else if (sha256Canonical(metricSignatureProjection(signature)) !== signature.signature_digest) {
      issues.push("metric_signature.signature_digest mismatch");
    }
  }

  if (!Array.isArray(registry.runs) || registry.runs.length === 0) {
    issues.push("at least one replication run required");
  } else if (signature && typeof signature === "object") {
    const seen = { run_id: new Set(), experiment_id: new Set(), ledger_digest: new Set() };
    for (const run of registry.runs) validateRun(run, signature, issues, seen);
  }

  if (!HEX_64.test(registry.registry_digest ?? "")) {
    issues.push("registry_digest must be SHA-256 hex");
  } else if (registryDigest(registry) !== registry.registry_digest) {
    issues.push("registry_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function replicationReport(registry) {
  const validation = validateReplicationRegistry(registry);
  if (!validation.ok) throw new Error(`cannot report invalid replication registry: ${validation.issues.join("; ")}`);

  const eligible = registry.runs.filter((run) => run.eligible);
  const directionCounts = {
    HIGHER: eligible.filter((run) => run.direction === "HIGHER").length,
    LOWER: eligible.filter((run) => run.direction === "LOWER").length,
    EQUAL: eligible.filter((run) => run.direction === "EQUAL").length,
  };
  const observedDirections = Object.entries(directionCounts)
    .filter(([, count]) => count > 0)
    .map(([direction]) => direction);

  let status = "INSUFFICIENT";
  let repeatedDirection = null;
  if (eligible.length === 1) {
    status = "SINGLE_RUN";
    repeatedDirection = eligible[0].direction;
  } else if (eligible.length >= 2 && observedDirections.length === 1) {
    status = "REPLICATED";
    repeatedDirection = observedDirections[0];
  } else if (eligible.length >= 2 && observedDirections.length > 1) {
    status = "MIXED";
  }

  return deepFreeze({
    replication_key: registry.replication_key,
    metric_signature: clone(registry.metric_signature),
    total_runs: registry.runs.length,
    eligible_runs: eligible.length,
    insufficient_runs: registry.runs.length - eligible.length,
    direction_counts: directionCounts,
    status,
    repeated_direction: repeatedDirection,
    run_results: clone(registry.runs),
    truth_assessed: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: registry.claim_boundary,
  });
}

export function serializeReplicationRegistry(registry) {
  const validation = validateReplicationRegistry(registry);
  if (!validation.ok) throw new Error(`cannot serialize invalid replication registry: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(registry, null, 2)}\n`;
}

export function parseReplicationRegistry(text) {
  if (!nonEmpty(text)) throw new TypeError("replication registry JSON text required");
  let registry;
  try {
    registry = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid replication registry JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }
  const validation = validateReplicationRegistry(registry);
  if (!validation.ok) throw new Error(`invalid replication registry: ${validation.issues.join("; ")}`);
  return deepFreeze(registry);
}

export function replicationRegistrySummary() {
  return deepFreeze({
    registry_id: HNK_REPLICATION_REGISTRY_ID,
    version: HNK_REPLICATION_REGISTRY_VERSION,
    statuses: [...HNK_REPLICATION_STATUSES],
    directions: [...HNK_REPLICATION_DIRECTIONS],
    supported_metric_types: [...HNK_REPLICATION_METRIC_TYPES],
    comparison_basis: "CONTROL_VS_EXPERIMENT_DESCRIPTIVE_AGGREGATE",
    replicated_means: "SAME_DESCRIPTIVE_DIRECTION_IN_AT_LEAST_TWO_ELIGIBLE_RUNS",
    distinct_experiment_ids_required: true,
    exact_metric_signature_required: true,
    automatic_truth_inference: false,
    inferential_statistics_performed: false,
    server_persistence: false,
    browser_persistence: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_REPLICATION_REGISTRY_BOUNDARY,
  });
}
