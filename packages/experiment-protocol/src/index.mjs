import {
  parseRuntimeSessionArtifact,
  replayRuntimeSessionArtifact,
  validateRuntimeSessionArtifact,
} from "@hnk/runtime-session-artifact";

export const HNK_EXPERIMENT_PROTOCOL_ID = "HNK_EXPERIMENT_PROTOCOL_V1";
export const HNK_EXPERIMENT_PROTOCOL_VERSION = "1.0.0";
export const HNK_EXPERIMENT_CLAIM_BOUNDARY = "EXPERIMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF";
export const HNK_EXPERIMENT_ROLES = Object.freeze(["CONTROL", "EXPERIMENT"]);
export const HNK_EXPERIMENT_STATUSES = Object.freeze(["PREREGISTERED", "IN_PROGRESS", "READY_TO_FINALIZE", "COMPLETED"]);

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

function cleanStrings(values, field, { required = false } = {}) {
  if (!Array.isArray(values)) throw new TypeError(`${field} must be an array`);
  const cleaned = values.map((value) => {
    if (!nonEmpty(value)) throw new TypeError(`${field} entries must be non-empty strings`);
    return value.trim();
  });
  if (required && cleaned.length === 0) throw new TypeError(`${field} must contain at least one entry`);
  return cleaned;
}

function positiveInteger(value, field) {
  if (!Number.isInteger(value) || value < 1) throw new TypeError(`${field} must be an integer >= 1`);
  return value;
}

function computeStatus(protocol) {
  if (protocol.report) return "COMPLETED";
  const control = protocol.sessions.filter((entry) => entry.role === "CONTROL").length;
  const experiment = protocol.sessions.filter((entry) => entry.role === "EXPERIMENT").length;
  const ready = control >= protocol.plan.control_sessions_required && experiment >= protocol.plan.experimental_sessions_required;
  if (ready) return "READY_TO_FINALIZE";
  if (protocol.sessions.length > 0) return "IN_PROGRESS";
  return "PREREGISTERED";
}

function validateSessionEntry(entry, issues, seenAssignments, seenSessions) {
  if (!entry || typeof entry !== "object") {
    issues.push("session entry must be an object");
    return;
  }
  if (!nonEmpty(entry.assignment_id)) issues.push("session assignment_id required");
  if (!HNK_EXPERIMENT_ROLES.includes(entry.role)) issues.push(`invalid session role ${entry.role}`);
  if (!nonEmpty(entry.added_at)) issues.push("session added_at required");
  if (seenAssignments.has(entry.assignment_id)) issues.push(`duplicate assignment_id ${entry.assignment_id}`);
  seenAssignments.add(entry.assignment_id);

  const artifactValidation = validateRuntimeSessionArtifact(entry.artifact);
  if (!artifactValidation.ok) issues.push(...artifactValidation.issues.map((issue) => `${entry.assignment_id || "session"}: ${issue}`));
  const replay = replayRuntimeSessionArtifact(entry.artifact);
  if (!replay.ok || !replay.matches_snapshot) issues.push(`${entry.assignment_id || "session"}: deterministic replay mismatch`);
  const sessionId = entry.artifact?.initial?.session_id;
  if (sessionId) {
    if (seenSessions.has(sessionId)) issues.push(`duplicate runtime session ${sessionId}`);
    seenSessions.add(sessionId);
  }
}

export function createExperimentProtocol(input) {
  if (!input || typeof input !== "object") throw new TypeError("experiment input required");
  for (const field of ["experiment_id", "created_at", "locked_at", "title", "question", "hypothesis"]) {
    if (!nonEmpty(input[field])) throw new TypeError(`${field} must be a non-empty string`);
  }
  if (input.created_at > input.locked_at) throw new Error("locked_at cannot precede created_at");

  const plan = {
    observed_variables: cleanStrings(input.plan?.observed_variables, "plan.observed_variables", { required: true }),
    controlled_variables: cleanStrings(input.plan?.controlled_variables ?? [], "plan.controlled_variables"),
    intervention: nonEmpty(input.plan?.intervention) ? input.plan.intervention.trim() : null,
    control_sessions_required: positiveInteger(input.plan?.control_sessions_required, "plan.control_sessions_required"),
    experimental_sessions_required: positiveInteger(input.plan?.experimental_sessions_required, "plan.experimental_sessions_required"),
    completion_criteria: cleanStrings(input.plan?.completion_criteria, "plan.completion_criteria", { required: true }),
    exclusion_criteria: cleanStrings(input.plan?.exclusion_criteria ?? [], "plan.exclusion_criteria"),
  };

  const protocol = deepFreeze({
    protocol_id: HNK_EXPERIMENT_PROTOCOL_ID,
    protocol_version: HNK_EXPERIMENT_PROTOCOL_VERSION,
    authority: "HNK_AUTHORED_EXPERIMENT_PROTOCOL",
    experiment_id: input.experiment_id.trim(),
    created_at: input.created_at.trim(),
    locked_at: input.locked_at.trim(),
    preregistration_locked: true,
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    title: input.title.trim(),
    question: input.question.trim(),
    hypothesis: input.hypothesis.trim(),
    plan,
    sessions: [],
    report: null,
    status: "PREREGISTERED",
    claim_boundary: HNK_EXPERIMENT_CLAIM_BOUNDARY,
  });

  const validation = validateExperimentProtocol(protocol);
  if (!validation.ok) throw new Error(`invalid experiment protocol: ${validation.issues.join("; ")}`);
  return protocol;
}

export function addExperimentArtifact(protocol, input) {
  const validation = validateExperimentProtocol(protocol);
  if (!validation.ok) throw new Error(`cannot extend invalid experiment protocol: ${validation.issues.join("; ")}`);
  if (protocol.status === "COMPLETED") throw new Error("completed experiment cannot accept new sessions");
  if (!input || typeof input !== "object") throw new TypeError("session assignment input required");
  if (!nonEmpty(input.assignment_id)) throw new TypeError("assignment_id required");
  if (!HNK_EXPERIMENT_ROLES.includes(input.role)) throw new RangeError(`invalid role ${input.role}`);
  if (!nonEmpty(input.added_at)) throw new TypeError("added_at required");

  const artifact = typeof input.artifact === "string" ? parseRuntimeSessionArtifact(input.artifact) : input.artifact;
  const artifactValidation = validateRuntimeSessionArtifact(artifact);
  if (!artifactValidation.ok) throw new Error(`invalid runtime artifact: ${artifactValidation.issues.join("; ")}`);
  const replay = replayRuntimeSessionArtifact(artifact);
  if (!replay.ok || !replay.matches_snapshot) throw new Error("runtime artifact deterministic replay mismatch");

  if (protocol.sessions.some((entry) => entry.assignment_id === input.assignment_id.trim())) throw new Error(`duplicate assignment_id ${input.assignment_id.trim()}`);
  if (protocol.sessions.some((entry) => entry.artifact.initial.session_id === artifact.initial.session_id)) throw new Error(`runtime session already assigned: ${artifact.initial.session_id}`);

  const next = clone(protocol);
  next.sessions.push({
    assignment_id: input.assignment_id.trim(),
    role: input.role,
    added_at: input.added_at.trim(),
    artifact: clone(artifact),
  });
  next.status = computeStatus(next);

  const nextValidation = validateExperimentProtocol(next);
  if (!nextValidation.ok) throw new Error(`experiment assignment produced invalid protocol: ${nextValidation.issues.join("; ")}`);
  return deepFreeze(next);
}

export function finalizeExperimentProtocol(protocol, input) {
  const validation = validateExperimentProtocol(protocol);
  if (!validation.ok) throw new Error(`cannot finalize invalid experiment protocol: ${validation.issues.join("; ")}`);
  if (protocol.status !== "READY_TO_FINALIZE") throw new Error(`experiment is not ready to finalize: ${protocol.status}`);
  if (!input || typeof input !== "object") throw new TypeError("final report input required");
  for (const field of ["completed_at", "descriptive_summary", "interpretation"]) {
    if (!nonEmpty(input[field])) throw new TypeError(`${field} must be a non-empty string`);
  }

  const next = clone(protocol);
  next.report = {
    completed_at: input.completed_at.trim(),
    descriptive_summary: input.descriptive_summary.trim(),
    interpretation: input.interpretation.trim(),
    limitations: cleanStrings(input.limitations ?? [], "limitations"),
    conclusion_scope: "DESCRIPTIVE_AND_INTERPRETIVE_ONLY",
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
  };
  next.status = "COMPLETED";

  const nextValidation = validateExperimentProtocol(next);
  if (!nextValidation.ok) throw new Error(`finalization produced invalid experiment protocol: ${nextValidation.issues.join("; ")}`);
  return deepFreeze(next);
}

export function experimentDescriptiveSummary(protocol) {
  const validation = validateExperimentProtocol(protocol);
  if (!validation.ok) throw new Error(`cannot summarize invalid experiment protocol: ${validation.issues.join("; ")}`);

  const summarizeRole = (role) => protocol.sessions.filter((entry) => entry.role === role).map((entry) => ({
    assignment_id: entry.assignment_id,
    session_id: entry.artifact.initial.session_id,
    phase: entry.artifact.session.phase,
    result_state: entry.artifact.session.result?.result_state ?? null,
    evidence_scope: entry.artifact.session.result?.evidence_scope ?? null,
    observations: entry.artifact.session.observations.length,
    feedback: entry.artifact.session.feedback.length,
    event_count: entry.artifact.session.events.length,
  }));

  return deepFreeze({
    experiment_id: protocol.experiment_id,
    status: protocol.status,
    question: protocol.question,
    hypothesis: protocol.hypothesis,
    preregistration_locked: protocol.preregistration_locked,
    plan: clone(protocol.plan),
    control: summarizeRole("CONTROL"),
    experiment: summarizeRole("EXPERIMENT"),
    counts: {
      control: protocol.sessions.filter((entry) => entry.role === "CONTROL").length,
      experiment: protocol.sessions.filter((entry) => entry.role === "EXPERIMENT").length,
      total: protocol.sessions.length,
    },
    claim_boundary: protocol.claim_boundary,
  });
}

export function validateExperimentProtocol(protocol) {
  const issues = [];
  if (!protocol || typeof protocol !== "object") return deepFreeze({ ok: false, issues: ["protocol must be an object"] });
  if (protocol.protocol_id !== HNK_EXPERIMENT_PROTOCOL_ID) issues.push(`unexpected protocol_id ${protocol.protocol_id}`);
  if (protocol.protocol_version !== HNK_EXPERIMENT_PROTOCOL_VERSION) issues.push(`unexpected protocol_version ${protocol.protocol_version}`);
  if (protocol.authority !== "HNK_AUTHORED_EXPERIMENT_PROTOCOL") issues.push(`unexpected authority ${protocol.authority}`);
  if (!HNK_EXPERIMENT_STATUSES.includes(protocol.status)) issues.push(`invalid status ${protocol.status}`);
  if (protocol.preregistration_locked !== true) issues.push("preregistration_locked must remain true");
  if (protocol.persistence !== "USER_CONTROLLED_FILE_ONLY") issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  if (protocol.server_persistence !== false) issues.push("server_persistence must remain false");
  if (protocol.browser_persistence !== false) issues.push("browser_persistence must remain false");
  if (protocol.claim_boundary !== HNK_EXPERIMENT_CLAIM_BOUNDARY) issues.push(`unexpected claim_boundary ${protocol.claim_boundary}`);
  for (const field of ["experiment_id", "created_at", "locked_at", "title", "question", "hypothesis"]) {
    if (!nonEmpty(protocol[field])) issues.push(`${field} required`);
  }

  if (!protocol.plan || typeof protocol.plan !== "object") issues.push("plan required");
  else {
    if (!Array.isArray(protocol.plan.observed_variables) || protocol.plan.observed_variables.length === 0) issues.push("plan.observed_variables required");
    if (!Array.isArray(protocol.plan.controlled_variables)) issues.push("plan.controlled_variables must be an array");
    if (!Number.isInteger(protocol.plan.control_sessions_required) || protocol.plan.control_sessions_required < 1) issues.push("plan.control_sessions_required must be >= 1");
    if (!Number.isInteger(protocol.plan.experimental_sessions_required) || protocol.plan.experimental_sessions_required < 1) issues.push("plan.experimental_sessions_required must be >= 1");
    if (!Array.isArray(protocol.plan.completion_criteria) || protocol.plan.completion_criteria.length === 0) issues.push("plan.completion_criteria required");
    if (!Array.isArray(protocol.plan.exclusion_criteria)) issues.push("plan.exclusion_criteria must be an array");
  }

  if (!Array.isArray(protocol.sessions)) issues.push("sessions must be an array");
  else {
    const seenAssignments = new Set();
    const seenSessions = new Set();
    for (const entry of protocol.sessions) validateSessionEntry(entry, issues, seenAssignments, seenSessions);
  }

  const expectedStatus = protocol.plan && Array.isArray(protocol.sessions) ? computeStatus(protocol) : protocol.status;
  if (protocol.status !== expectedStatus) issues.push(`status ${protocol.status} does not match derived status ${expectedStatus}`);

  if (protocol.status === "COMPLETED") {
    if (!protocol.report || typeof protocol.report !== "object") issues.push("completed experiment requires report");
    else {
      if (!nonEmpty(protocol.report.completed_at)) issues.push("report.completed_at required");
      if (!nonEmpty(protocol.report.descriptive_summary)) issues.push("report.descriptive_summary required");
      if (!nonEmpty(protocol.report.interpretation)) issues.push("report.interpretation required");
      if (!Array.isArray(protocol.report.limitations)) issues.push("report.limitations must be an array");
      if (protocol.report.conclusion_scope !== "DESCRIPTIVE_AND_INTERPRETIVE_ONLY") issues.push("report conclusion_scope drift");
      if (protocol.report.causal_claim_permitted !== false) issues.push("report causal_claim_permitted must be false");
      if (protocol.report.metaphysical_proof_permitted !== false) issues.push("report metaphysical_proof_permitted must be false");
    }
  } else if (protocol.report !== null) {
    issues.push("non-completed experiment report must remain null");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function serializeExperimentProtocol(protocol) {
  const validation = validateExperimentProtocol(protocol);
  if (!validation.ok) throw new Error(`cannot serialize invalid experiment protocol: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(protocol, null, 2)}\n`;
}

export function parseExperimentProtocol(text) {
  if (!nonEmpty(text)) throw new TypeError("experiment JSON text required");
  let protocol;
  try {
    protocol = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid experiment protocol JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }
  const validation = validateExperimentProtocol(protocol);
  if (!validation.ok) throw new Error(`invalid experiment protocol: ${validation.issues.join("; ")}`);
  return deepFreeze(protocol);
}

export function experimentProtocolSummary() {
  return deepFreeze({
    protocol_id: HNK_EXPERIMENT_PROTOCOL_ID,
    version: HNK_EXPERIMENT_PROTOCOL_VERSION,
    roles: [...HNK_EXPERIMENT_ROLES],
    statuses: [...HNK_EXPERIMENT_STATUSES],
    preregistration_required: true,
    control_required: true,
    experimental_sessions_required: true,
    deterministic_artifact_replay_required: true,
    server_persistence: false,
    browser_persistence: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_EXPERIMENT_CLAIM_BOUNDARY,
  });
}
