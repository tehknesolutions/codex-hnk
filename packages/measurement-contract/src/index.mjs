import { createExperimentAttestation, sha256Canonical } from "@hnk/experiment-attestation";
import { validateExperimentProtocol } from "@hnk/experiment-protocol";

export const HNK_MEASUREMENT_CONTRACT_ID = "HNK_MEASUREMENT_CONTRACT_V1";
export const HNK_MEASUREMENT_CONTRACT_VERSION = "1.0.0";
export const HNK_MEASUREMENT_CLAIM_BOUNDARY = "MEASUREMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF";
export const HNK_MEASUREMENT_TYPES = Object.freeze(["NUMBER", "BOOLEAN", "CATEGORY", "TEXT", "COUNT", "SCALE"]);
export const HNK_MEASUREMENT_EVIDENCE_SOURCES = Object.freeze(["RUNTIME_DERIVED", "SELF_REPORT", "OBSERVER_RECORDED", "INSTRUMENT", "EXTERNAL_RECORD"]);
export const HNK_MEASUREMENT_TIMEPOINTS = Object.freeze(["PRE", "DURING", "POST", "FOLLOW_UP", "EVENT_BOUNDARY"]);

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

function uniqueStrings(values, field, { min = 0 } = {}) {
  if (!Array.isArray(values)) throw new TypeError(`${field} must be an array`);
  const cleaned = values.map((value) => cleanString(value, `${field} entry`));
  if (cleaned.length < min) throw new TypeError(`${field} must contain at least ${min} entries`);
  if (new Set(cleaned).size !== cleaned.length) throw new Error(`${field} entries must be unique`);
  return cleaned;
}

function normalizeBounds(bounds, field) {
  if (bounds === null || bounds === undefined) return null;
  if (!bounds || typeof bounds !== "object") throw new TypeError(`${field} must be an object or null`);
  const min = bounds.min === null || bounds.min === undefined ? null : Number(bounds.min);
  const max = bounds.max === null || bounds.max === undefined ? null : Number(bounds.max);
  if (min !== null && !Number.isFinite(min)) throw new TypeError(`${field}.min must be finite or null`);
  if (max !== null && !Number.isFinite(max)) throw new TypeError(`${field}.max must be finite or null`);
  if (min !== null && max !== null && min > max) throw new RangeError(`${field}.min cannot exceed max`);
  return { min, max };
}

function normalizeScale(scale, field) {
  if (!scale || typeof scale !== "object") throw new TypeError(`${field} required for SCALE metrics`);
  const min = Number(scale.min);
  const max = Number(scale.max);
  const step = Number(scale.step);
  if (![min, max, step].every(Number.isFinite)) throw new TypeError(`${field} min/max/step must be finite numbers`);
  if (min >= max) throw new RangeError(`${field}.min must be less than max`);
  if (step <= 0) throw new RangeError(`${field}.step must be > 0`);
  const anchors = (scale.anchors ?? []).map((anchor, index) => {
    if (!anchor || typeof anchor !== "object") throw new TypeError(`${field}.anchors[${index}] must be an object`);
    const value = Number(anchor.value);
    if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(`${field}.anchors[${index}].value out of range`);
    return { value, label: cleanString(anchor.label, `${field}.anchors[${index}].label`) };
  });
  return { min, max, step, anchors };
}

function normalizeMetric(metric, index) {
  if (!metric || typeof metric !== "object") throw new TypeError(`metrics[${index}] must be an object`);
  const type = cleanString(metric.type, `metrics[${index}].type`);
  if (!HNK_MEASUREMENT_TYPES.includes(type)) throw new RangeError(`metrics[${index}].type invalid: ${type}`);
  const evidenceSource = cleanString(metric.evidence_source, `metrics[${index}].evidence_source`);
  if (!HNK_MEASUREMENT_EVIDENCE_SOURCES.includes(evidenceSource)) throw new RangeError(`metrics[${index}].evidence_source invalid: ${evidenceSource}`);
  const timepoint = cleanString(metric.timepoint, `metrics[${index}].timepoint`);
  if (!HNK_MEASUREMENT_TIMEPOINTS.includes(timepoint)) throw new RangeError(`metrics[${index}].timepoint invalid: ${timepoint}`);

  const normalized = {
    metric_id: cleanString(metric.metric_id, `metrics[${index}].metric_id`),
    source_variable: cleanString(metric.source_variable, `metrics[${index}].source_variable`),
    label: cleanString(metric.label, `metrics[${index}].label`),
    type,
    unit: cleanString(metric.unit, `metrics[${index}].unit`, { nullable: true }),
    collection_method: cleanString(metric.collection_method, `metrics[${index}].collection_method`),
    evidence_source: evidenceSource,
    timepoint,
    timepoint_label: cleanString(metric.timepoint_label, `metrics[${index}].timepoint_label`, { nullable: true }),
    evaluation_criterion: cleanString(metric.evaluation_criterion, `metrics[${index}].evaluation_criterion`),
    numeric_bounds: null,
    category_options: [],
    scale: null,
  };

  if (["NUMBER", "COUNT"].includes(type)) normalized.numeric_bounds = normalizeBounds(metric.numeric_bounds, `metrics[${index}].numeric_bounds`);
  if (type === "COUNT" && normalized.numeric_bounds?.min !== null && normalized.numeric_bounds.min < 0) throw new RangeError(`metrics[${index}].numeric_bounds.min cannot be negative for COUNT`);
  if (type === "CATEGORY") normalized.category_options = uniqueStrings(metric.category_options, `metrics[${index}].category_options`, { min: 2 });
  if (type === "SCALE") normalized.scale = normalizeScale(metric.scale, `metrics[${index}].scale`);
  if (["FOLLOW_UP", "EVENT_BOUNDARY"].includes(timepoint) && !normalized.timepoint_label) throw new TypeError(`metrics[${index}].timepoint_label required for ${timepoint}`);

  return normalized;
}

function normalizeMeasurementValue(metric, value) {
  if (metric.type === "NUMBER") {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new TypeError(`${metric.metric_id} requires a finite number`);
    const bounds = metric.numeric_bounds;
    if (bounds?.min !== null && bounds?.min !== undefined && number < bounds.min) throw new RangeError(`${metric.metric_id} below minimum ${bounds.min}`);
    if (bounds?.max !== null && bounds?.max !== undefined && number > bounds.max) throw new RangeError(`${metric.metric_id} above maximum ${bounds.max}`);
    return number;
  }
  if (metric.type === "COUNT") {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0) throw new TypeError(`${metric.metric_id} requires an integer >= 0`);
    const bounds = metric.numeric_bounds;
    if (bounds?.min !== null && bounds?.min !== undefined && number < bounds.min) throw new RangeError(`${metric.metric_id} below minimum ${bounds.min}`);
    if (bounds?.max !== null && bounds?.max !== undefined && number > bounds.max) throw new RangeError(`${metric.metric_id} above maximum ${bounds.max}`);
    return number;
  }
  if (metric.type === "BOOLEAN") {
    if (typeof value !== "boolean") throw new TypeError(`${metric.metric_id} requires a boolean`);
    return value;
  }
  if (metric.type === "CATEGORY") {
    const category = cleanString(value, `${metric.metric_id} value`);
    if (!metric.category_options.includes(category)) throw new RangeError(`${metric.metric_id} category must be one of: ${metric.category_options.join(", ")}`);
    return category;
  }
  if (metric.type === "TEXT") return cleanString(value, `${metric.metric_id} value`);
  if (metric.type === "SCALE") {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new TypeError(`${metric.metric_id} requires a finite scale value`);
    const { min, max, step } = metric.scale;
    if (number < min || number > max) throw new RangeError(`${metric.metric_id} must be between ${min} and ${max}`);
    const steps = (number - min) / step;
    if (Math.abs(steps - Math.round(steps)) > 1e-9) throw new RangeError(`${metric.metric_id} must follow step ${step}`);
    return number;
  }
  throw new RangeError(`unsupported measurement type ${metric.type}`);
}

function metricMap(contract) {
  return new Map(contract.metrics.map((metric) => [metric.metric_id, metric]));
}

export function measurementPlanProjection(contract) {
  return deepFreeze({
    contract_id: contract.contract_id,
    contract_version: contract.contract_version,
    authority: contract.authority,
    experiment_id: contract.experiment_id,
    experiment_protocol_version: contract.experiment_protocol_version,
    experiment_preregistration_digest: contract.experiment_preregistration_digest,
    created_at: contract.created_at,
    locked_at: contract.locked_at,
    plan_locked: contract.plan_locked,
    observed_variables: clone(contract.observed_variables),
    metrics: clone(contract.metrics),
    persistence: contract.persistence,
    server_persistence: contract.server_persistence,
    browser_persistence: contract.browser_persistence,
    causal_claim_permitted: contract.causal_claim_permitted,
    metaphysical_proof_permitted: contract.metaphysical_proof_permitted,
    claim_boundary: contract.claim_boundary,
  });
}

export function createMeasurementContract(protocol, input) {
  const protocolValidation = validateExperimentProtocol(protocol);
  if (!protocolValidation.ok) throw new Error(`invalid experiment protocol: ${protocolValidation.issues.join("; ")}`);
  if (protocol.status !== "PREREGISTERED" || protocol.sessions.length !== 0) throw new Error("measurement plan must be sealed against a preregistered experiment before sessions are admitted");
  if (!input || typeof input !== "object") throw new TypeError("measurement contract input required");
  const createdAt = cleanString(input.created_at, "created_at");
  const lockedAt = cleanString(input.locked_at, "locked_at");
  if (createdAt > lockedAt) throw new Error("locked_at cannot precede created_at");
  if (!Array.isArray(input.metrics) || input.metrics.length === 0) throw new TypeError("metrics must contain at least one metric definition");

  const metrics = input.metrics.map(normalizeMetric);
  const metricIds = metrics.map((metric) => metric.metric_id);
  if (new Set(metricIds).size !== metricIds.length) throw new Error("metric_id values must be unique");
  const sourceVariables = metrics.map((metric) => metric.source_variable);
  if (new Set(sourceVariables).size !== sourceVariables.length) throw new Error("each observed variable must map to exactly one metric in V1");

  const observed = [...protocol.plan.observed_variables];
  const observedSet = new Set(observed);
  if (sourceVariables.length !== observed.length || sourceVariables.some((value) => !observedSet.has(value))) {
    throw new Error("typed metrics must cover the preregistered observed_variables exactly once");
  }

  const preregistration = createExperimentAttestation(protocol, { generated_at: lockedAt });
  const draft = {
    contract_id: HNK_MEASUREMENT_CONTRACT_ID,
    contract_version: HNK_MEASUREMENT_CONTRACT_VERSION,
    authority: "HNK_AUTHORED_MEASUREMENT_CONTRACT",
    experiment_id: protocol.experiment_id,
    experiment_protocol_version: protocol.protocol_version,
    experiment_preregistration_digest: preregistration.preregistration_digest,
    created_at: createdAt,
    locked_at: lockedAt,
    plan_locked: true,
    observed_variables: observed,
    metrics,
    measurement_plan_digest: "",
    records: [],
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_MEASUREMENT_CLAIM_BOUNDARY,
  };
  draft.measurement_plan_digest = sha256Canonical(measurementPlanProjection(draft));
  const validation = validateMeasurementContract(draft, protocol);
  if (!validation.ok) throw new Error(`invalid measurement contract: ${validation.issues.join("; ")}`);
  return deepFreeze(draft);
}

function validateMetricDefinition(metric, issues, index) {
  try {
    const normalized = normalizeMetric(metric, index);
    if (JSON.stringify(normalized) !== JSON.stringify(metric)) issues.push(`metrics[${index}] is not normalized`);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : `metrics[${index}] invalid`);
  }
}

function validateRecord(record, metricById, issues, index) {
  if (!record || typeof record !== "object") {
    issues.push(`records[${index}] must be an object`);
    return;
  }
  for (const field of ["measurement_id", "assignment_id", "session_id", "metric_id", "measured_at", "role"]) {
    if (!nonEmpty(record[field])) issues.push(`records[${index}].${field} required`);
  }
  const metric = metricById.get(record.metric_id);
  if (!metric) {
    issues.push(`records[${index}] references unknown metric ${record.metric_id}`);
    return;
  }
  try {
    const normalized = normalizeMeasurementValue(metric, record.value);
    if (JSON.stringify(normalized) !== JSON.stringify(record.value)) issues.push(`records[${index}].value is not normalized for ${metric.type}`);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : `records[${index}].value invalid`);
  }
  if (record.note !== null && record.note !== undefined && !nonEmpty(record.note)) issues.push(`records[${index}].note must be null or non-empty`);
}

export function validateMeasurementContract(contract, protocol = null) {
  const issues = [];
  if (!contract || typeof contract !== "object") return deepFreeze({ ok: false, issues: ["contract must be an object"] });
  if (contract.contract_id !== HNK_MEASUREMENT_CONTRACT_ID) issues.push(`unexpected contract_id ${contract.contract_id}`);
  if (contract.contract_version !== HNK_MEASUREMENT_CONTRACT_VERSION) issues.push(`unexpected contract_version ${contract.contract_version}`);
  if (contract.authority !== "HNK_AUTHORED_MEASUREMENT_CONTRACT") issues.push(`unexpected authority ${contract.authority}`);
  if (!nonEmpty(contract.experiment_id)) issues.push("experiment_id required");
  if (!nonEmpty(contract.experiment_protocol_version)) issues.push("experiment_protocol_version required");
  if (!/^[0-9a-f]{64}$/.test(contract.experiment_preregistration_digest ?? "")) issues.push("experiment_preregistration_digest must be SHA-256 hex");
  if (!nonEmpty(contract.created_at) || !nonEmpty(contract.locked_at)) issues.push("created_at and locked_at required");
  if (contract.plan_locked !== true) issues.push("plan_locked must remain true");
  if (contract.persistence !== "USER_CONTROLLED_FILE_ONLY") issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  if (contract.server_persistence !== false) issues.push("server_persistence must remain false");
  if (contract.browser_persistence !== false) issues.push("browser_persistence must remain false");
  if (contract.causal_claim_permitted !== false) issues.push("causal_claim_permitted must remain false");
  if (contract.metaphysical_proof_permitted !== false) issues.push("metaphysical_proof_permitted must remain false");
  if (contract.claim_boundary !== HNK_MEASUREMENT_CLAIM_BOUNDARY) issues.push(`unexpected claim_boundary ${contract.claim_boundary}`);

  if (!Array.isArray(contract.observed_variables) || contract.observed_variables.length === 0) issues.push("observed_variables required");
  if (!Array.isArray(contract.metrics) || contract.metrics.length === 0) issues.push("metrics required");
  const ids = new Set();
  const sources = new Set();
  for (const [index, metric] of (contract.metrics ?? []).entries()) {
    validateMetricDefinition(metric, issues, index);
    if (ids.has(metric.metric_id)) issues.push(`duplicate metric_id ${metric.metric_id}`);
    ids.add(metric.metric_id);
    if (sources.has(metric.source_variable)) issues.push(`duplicate source_variable ${metric.source_variable}`);
    sources.add(metric.source_variable);
  }
  if (Array.isArray(contract.observed_variables)) {
    if (contract.observed_variables.length !== sources.size || contract.observed_variables.some((value) => !sources.has(value))) issues.push("metrics must cover observed_variables exactly once");
  }

  if (!/^[0-9a-f]{64}$/.test(contract.measurement_plan_digest ?? "")) issues.push("measurement_plan_digest must be SHA-256 hex");
  else if (sha256Canonical(measurementPlanProjection(contract)) !== contract.measurement_plan_digest) issues.push("measurement_plan_digest mismatch");

  if (!Array.isArray(contract.records)) issues.push("records must be an array");
  else {
    const metricById = metricMap(contract);
    const measurementIds = new Set();
    const assignmentMetricPairs = new Set();
    for (const [index, record] of contract.records.entries()) {
      validateRecord(record, metricById, issues, index);
      if (measurementIds.has(record.measurement_id)) issues.push(`duplicate measurement_id ${record.measurement_id}`);
      measurementIds.add(record.measurement_id);
      const pair = `${record.assignment_id}::${record.metric_id}`;
      if (assignmentMetricPairs.has(pair)) issues.push(`duplicate measurement for ${pair}`);
      assignmentMetricPairs.add(pair);
    }
  }

  if (protocol) {
    const protocolValidation = validateExperimentProtocol(protocol);
    if (!protocolValidation.ok) issues.push(...protocolValidation.issues.map((issue) => `experiment protocol: ${issue}`));
    else {
      if (protocol.experiment_id !== contract.experiment_id) issues.push("experiment_id does not match measurement contract");
      if (protocol.protocol_version !== contract.experiment_protocol_version) issues.push("experiment protocol version mismatch");
      const currentPreregistration = createExperimentAttestation(protocol, { generated_at: contract.locked_at }).preregistration_digest;
      if (currentPreregistration !== contract.experiment_preregistration_digest) issues.push("experiment preregistration digest mismatch");
      if (JSON.stringify(protocol.plan.observed_variables) !== JSON.stringify(contract.observed_variables)) issues.push("experiment observed_variables drifted from measurement contract");
      const assignments = new Map(protocol.sessions.map((entry) => [entry.assignment_id, entry]));
      for (const record of contract.records ?? []) {
        const assignment = assignments.get(record.assignment_id);
        if (!assignment) {
          issues.push(`measurement ${record.measurement_id} references missing assignment ${record.assignment_id}`);
          continue;
        }
        if (assignment.role !== record.role) issues.push(`measurement ${record.measurement_id} role mismatch`);
        if (assignment.artifact.initial.session_id !== record.session_id) issues.push(`measurement ${record.measurement_id} session_id mismatch`);
      }
    }
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function addMeasurementRecord(contract, protocol, input) {
  const validation = validateMeasurementContract(contract, protocol);
  if (!validation.ok) throw new Error(`cannot record measurement against invalid contract: ${validation.issues.join("; ")}`);
  if (!input || typeof input !== "object") throw new TypeError("measurement input required");
  const measurementId = cleanString(input.measurement_id, "measurement_id");
  const assignmentId = cleanString(input.assignment_id, "assignment_id");
  const metricId = cleanString(input.metric_id, "metric_id");
  const measuredAt = cleanString(input.measured_at, "measured_at");
  const metric = metricMap(contract).get(metricId);
  if (!metric) throw new Error(`unknown metric ${metricId}`);
  const assignment = protocol.sessions.find((entry) => entry.assignment_id === assignmentId);
  if (!assignment) throw new Error(`unknown experiment assignment ${assignmentId}`);
  if (contract.records.some((record) => record.measurement_id === measurementId)) throw new Error(`duplicate measurement_id ${measurementId}`);
  if (contract.records.some((record) => record.assignment_id === assignmentId && record.metric_id === metricId)) throw new Error(`measurement already exists for ${assignmentId} / ${metricId}`);

  const next = clone(contract);
  next.records.push({
    measurement_id: measurementId,
    assignment_id: assignmentId,
    role: assignment.role,
    session_id: assignment.artifact.initial.session_id,
    metric_id: metricId,
    measured_at: measuredAt,
    value: normalizeMeasurementValue(metric, input.value),
    note: cleanString(input.note, "note", { nullable: true }),
  });
  const nextValidation = validateMeasurementContract(next, protocol);
  if (!nextValidation.ok) throw new Error(`measurement produced invalid contract: ${nextValidation.issues.join("; ")}`);
  return deepFreeze(next);
}

function roleAssignments(protocol, role) {
  return protocol.sessions.filter((entry) => entry.role === role);
}

export function measurementMatrix(contract, protocol) {
  const validation = validateMeasurementContract(contract, protocol);
  if (!validation.ok) throw new Error(`cannot create matrix from invalid measurement contract: ${validation.issues.join("; ")}`);
  const recordsByPair = new Map(contract.records.map((record) => [`${record.assignment_id}::${record.metric_id}`, record]));
  return deepFreeze({
    experiment_id: contract.experiment_id,
    metrics: contract.metrics.map((metric) => ({ metric_id: metric.metric_id, label: metric.label, type: metric.type, unit: metric.unit, timepoint: metric.timepoint })),
    rows: protocol.sessions.map((assignment) => ({
      assignment_id: assignment.assignment_id,
      role: assignment.role,
      session_id: assignment.artifact.initial.session_id,
      values: Object.fromEntries(contract.metrics.map((metric) => {
        const record = recordsByPair.get(`${assignment.assignment_id}::${metric.metric_id}`);
        return [metric.metric_id, record ? clone(record.value) : null];
      })),
      missing_metrics: contract.metrics.filter((metric) => !recordsByPair.has(`${assignment.assignment_id}::${metric.metric_id}`)).map((metric) => metric.metric_id),
    })),
    claim_boundary: contract.claim_boundary,
  });
}

function numericSummary(values) {
  if (!values.length) return { n: 0, min: null, max: null, mean: null };
  const total = values.reduce((sum, value) => sum + value, 0);
  return { n: values.length, min: Math.min(...values), max: Math.max(...values), mean: total / values.length };
}

function categoricalSummary(values) {
  const counts = {};
  for (const value of values) counts[String(value)] = (counts[String(value)] ?? 0) + 1;
  return { n: values.length, counts };
}

export function measurementDescriptiveSummary(contract, protocol) {
  const validation = validateMeasurementContract(contract, protocol);
  if (!validation.ok) throw new Error(`cannot summarize invalid measurement contract: ${validation.issues.join("; ")}`);
  const assignmentsByRole = {
    CONTROL: roleAssignments(protocol, "CONTROL"),
    EXPERIMENT: roleAssignments(protocol, "EXPERIMENT"),
  };

  const metrics = contract.metrics.map((metric) => {
    const recordsForMetric = contract.records.filter((record) => record.metric_id === metric.metric_id);
    const summarize = (role) => {
      const roleAssignmentsList = assignmentsByRole[role];
      const assignmentIds = new Set(roleAssignmentsList.map((entry) => entry.assignment_id));
      const values = recordsForMetric.filter((record) => assignmentIds.has(record.assignment_id)).map((record) => record.value);
      const missing = roleAssignmentsList.length - values.length;
      if (["NUMBER", "COUNT", "SCALE"].includes(metric.type)) return { ...numericSummary(values), missing };
      if (["BOOLEAN", "CATEGORY"].includes(metric.type)) return { ...categoricalSummary(values), missing };
      return { n: values.length, non_empty: values.filter((value) => nonEmpty(value)).length, missing };
    };
    return {
      metric_id: metric.metric_id,
      label: metric.label,
      type: metric.type,
      unit: metric.unit,
      evaluation_criterion: metric.evaluation_criterion,
      control: summarize("CONTROL"),
      experiment: summarize("EXPERIMENT"),
    };
  });

  return deepFreeze({
    experiment_id: contract.experiment_id,
    measurement_plan_digest: contract.measurement_plan_digest,
    metrics,
    inferential_statistics_performed: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: contract.claim_boundary,
  });
}

export function serializeMeasurementContract(contract) {
  const validation = validateMeasurementContract(contract);
  if (!validation.ok) throw new Error(`cannot serialize invalid measurement contract: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(contract, null, 2)}\n`;
}

export function parseMeasurementContract(text) {
  if (!nonEmpty(text)) throw new TypeError("measurement contract JSON text required");
  let contract;
  try {
    contract = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid measurement contract JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }
  const validation = validateMeasurementContract(contract);
  if (!validation.ok) throw new Error(`invalid measurement contract: ${validation.issues.join("; ")}`);
  return deepFreeze(contract);
}

export function measurementContractSummary() {
  return deepFreeze({
    contract_id: HNK_MEASUREMENT_CONTRACT_ID,
    version: HNK_MEASUREMENT_CONTRACT_VERSION,
    types: [...HNK_MEASUREMENT_TYPES],
    evidence_sources: [...HNK_MEASUREMENT_EVIDENCE_SOURCES],
    timepoints: [...HNK_MEASUREMENT_TIMEPOINTS],
    preregistration_binding: "SHA-256",
    observed_variables_exactly_typed: true,
    plan_locked_before_sessions: true,
    one_record_per_assignment_metric_v1: true,
    descriptive_statistics_only: true,
    inferential_statistics_performed: false,
    server_persistence: false,
    browser_persistence: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_MEASUREMENT_CLAIM_BOUNDARY,
  });
}
