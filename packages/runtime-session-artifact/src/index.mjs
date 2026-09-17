// @ts-nocheck
import {
  HNK_SYMBOLIC_RUNTIME_CONTRACT_ID,
  HNK_SYMBOLIC_RUNTIME_VERSION,
  applySymbolicRuntimeEvent,
  createSymbolicRuntimeSession,
  validateSymbolicRuntimeSession,
} from "@hnk/symbolic-runtime-contract";

export const HNK_RUNTIME_SESSION_ARTIFACT_ID = "HNK_RUNTIME_SESSION_ARTIFACT_V1";
export const HNK_RUNTIME_SESSION_ARTIFACT_VERSION = "1.0.0";
const CLAIM_BOUNDARY = "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF";

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

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateInitial(initial, issues) {
  if (!initial || typeof initial !== "object") {
    issues.push("initial required");
    return;
  }
  for (const field of ["session_id", "created_at", "intention", "current_state", "target_state"]) {
    if (!nonEmpty(initial[field])) issues.push(`initial.${field} required`);
  }
}

function validateArtifactShape(artifact) {
  const issues = [];
  if (!artifact || typeof artifact !== "object") return ["artifact must be an object"];

  if (artifact.artifact_id !== HNK_RUNTIME_SESSION_ARTIFACT_ID) issues.push(`unexpected artifact_id ${artifact.artifact_id}`);
  if (artifact.artifact_version !== HNK_RUNTIME_SESSION_ARTIFACT_VERSION) issues.push(`unexpected artifact_version ${artifact.artifact_version}`);
  if (!nonEmpty(artifact.exported_at)) issues.push("exported_at required");
  if (artifact.persistence !== "USER_CONTROLLED_FILE_ONLY") issues.push("persistence must be USER_CONTROLLED_FILE_ONLY");
  if (artifact.server_persistence !== false) issues.push("server_persistence must be false");
  if (artifact.browser_persistence !== false) issues.push("browser_persistence must be false");
  if (artifact.runtime_contract_id !== HNK_SYMBOLIC_RUNTIME_CONTRACT_ID) issues.push(`unexpected runtime_contract_id ${artifact.runtime_contract_id}`);
  if (artifact.runtime_contract_version !== HNK_SYMBOLIC_RUNTIME_VERSION) issues.push(`unexpected runtime_contract_version ${artifact.runtime_contract_version}`);
  if (artifact.claim_boundary !== CLAIM_BOUNDARY) issues.push(`unexpected claim_boundary ${artifact.claim_boundary}`);

  validateInitial(artifact.initial, issues);

  const runtimeValidation = validateSymbolicRuntimeSession(artifact.session);
  if (!runtimeValidation.ok) issues.push(...runtimeValidation.issues.map((issue) => `session: ${issue}`));

  if (artifact.initial && artifact.session) {
    if (artifact.initial.session_id !== artifact.session.session_id) issues.push("initial.session_id must match session.session_id");
    if (artifact.initial.created_at !== artifact.session.created_at) issues.push("initial.created_at must match session.created_at");
    if (artifact.initial.intention !== artifact.session.intention) issues.push("initial.intention must match session.intention");
    if (artifact.initial.target_state !== artifact.session.target_state) issues.push("initial.target_state must match session.target_state");

    if (artifact.session.specification?.from_state && artifact.session.specification.from_state !== artifact.initial.current_state) {
      issues.push("initial.current_state must match specification.from_state");
    }

    if (artifact.session.phase !== "CLOSED" && artifact.session.current_state !== artifact.initial.current_state) {
      issues.push("non-closed session.current_state must match initial.current_state");
    }

    if (artifact.session.phase === "CLOSED") {
      if (!artifact.session.result) issues.push("closed artifact session requires result");
      if (artifact.session.result?.claim_boundary !== CLAIM_BOUNDARY) issues.push("closed result claim boundary drift");
      if (artifact.session.result?.result_state !== artifact.session.current_state) issues.push("closed result_state must match session.current_state");
    }
  }

  return issues;
}

export function replayRuntimeSessionArtifact(artifact) {
  const issues = validateArtifactShape(artifact);
  if (issues.length) return deepFreeze({ ok: false, replayed: null, matches_snapshot: false, issues });

  try {
    let replayed = createSymbolicRuntimeSession({
      session_id: artifact.initial.session_id,
      created_at: artifact.initial.created_at,
      intention: artifact.initial.intention,
      current_state: artifact.initial.current_state,
      target_state: artifact.initial.target_state,
    });

    for (const runtimeEvent of artifact.session.events) {
      replayed = applySymbolicRuntimeEvent(replayed, clone(runtimeEvent));
    }

    const matches = sameJson(replayed, artifact.session);
    return deepFreeze({
      ok: matches,
      replayed,
      matches_snapshot: matches,
      issues: matches ? [] : ["deterministic replay does not match stored session snapshot"],
    });
  } catch (error) {
    return deepFreeze({
      ok: false,
      replayed: null,
      matches_snapshot: false,
      issues: [error instanceof Error ? error.message : "runtime replay failed"],
    });
  }
}

export function validateRuntimeSessionArtifact(artifact) {
  const issues = validateArtifactShape(artifact);
  if (!issues.length) {
    const replay = replayRuntimeSessionArtifact(artifact);
    if (!replay.ok) issues.push(...replay.issues);
  }
  return deepFreeze({ ok: issues.length === 0, issues });
}

export function createRuntimeSessionArtifact(input) {
  if (!input || typeof input !== "object") throw new TypeError("artifact input required");
  if (!nonEmpty(input.exported_at)) throw new TypeError("exported_at must be a non-empty string");

  const runtimeValidation = validateSymbolicRuntimeSession(input.session);
  if (!runtimeValidation.ok) throw new Error(`cannot export invalid symbolic runtime session: ${runtimeValidation.issues.join("; ")}`);

  const artifact = deepFreeze({
    artifact_id: HNK_RUNTIME_SESSION_ARTIFACT_ID,
    artifact_version: HNK_RUNTIME_SESSION_ARTIFACT_VERSION,
    exported_at: input.exported_at.trim(),
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    runtime_contract_id: HNK_SYMBOLIC_RUNTIME_CONTRACT_ID,
    runtime_contract_version: HNK_SYMBOLIC_RUNTIME_VERSION,
    claim_boundary: CLAIM_BOUNDARY,
    initial: clone(input.initial),
    session: clone(input.session),
  });

  const validation = validateRuntimeSessionArtifact(artifact);
  if (!validation.ok) throw new Error(`invalid runtime session artifact: ${validation.issues.join("; ")}`);
  return artifact;
}

export function serializeRuntimeSessionArtifact(artifact) {
  const validation = validateRuntimeSessionArtifact(artifact);
  if (!validation.ok) throw new Error(`cannot serialize invalid runtime session artifact: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(artifact, null, 2)}\n`;
}

export function parseRuntimeSessionArtifact(text) {
  if (!nonEmpty(text)) throw new TypeError("artifact JSON text required");
  let artifact;
  try {
    artifact = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid runtime session artifact JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }
  const validation = validateRuntimeSessionArtifact(artifact);
  if (!validation.ok) throw new Error(`invalid runtime session artifact: ${validation.issues.join("; ")}`);
  return deepFreeze(artifact);
}

function metric(key, left, right) {
  return deepFreeze({ key, left, right, equal: left === right });
}

export function compareRuntimeSessionArtifacts(left, right) {
  const leftValidation = validateRuntimeSessionArtifact(left);
  const rightValidation = validateRuntimeSessionArtifact(right);
  if (!leftValidation.ok) throw new Error(`left artifact invalid: ${leftValidation.issues.join("; ")}`);
  if (!rightValidation.ok) throw new Error(`right artifact invalid: ${rightValidation.issues.join("; ")}`);

  const leftTypes = left.session.events.map((event) => event.type).join(" → ");
  const rightTypes = right.session.events.map((event) => event.type).join(" → ");

  const metrics = [
    metric("phase", left.session.phase, right.session.phase),
    metric("cycle", left.session.cycle, right.session.cycle),
    metric("event_count", left.session.events.length, right.session.events.length),
    metric("observation_count", left.session.observations.length, right.session.observations.length),
    metric("feedback_count", left.session.feedback.length, right.session.feedback.length),
    metric("initial_state", left.initial.current_state, right.initial.current_state),
    metric("target_state", left.initial.target_state, right.initial.target_state),
    metric("result_state", left.session.result?.result_state ?? null, right.session.result?.result_state ?? null),
    metric("evidence_scope", left.session.result?.evidence_scope ?? null, right.session.result?.evidence_scope ?? null),
    metric("event_sequence", leftTypes, rightTypes),
  ];

  const differences = metrics.filter((entry) => !entry.equal).map((entry) => entry.key);
  return deepFreeze({
    compatible: left.runtime_contract_id === right.runtime_contract_id && left.runtime_contract_version === right.runtime_contract_version,
    same_event_sequence: leftTypes === rightTypes,
    differences,
    metrics,
  });
}

export function runtimeSessionArtifactSummary() {
  return deepFreeze({
    artifact_id: HNK_RUNTIME_SESSION_ARTIFACT_ID,
    version: HNK_RUNTIME_SESSION_ARTIFACT_VERSION,
    runtime_contract_id: HNK_SYMBOLIC_RUNTIME_CONTRACT_ID,
    deterministic_replay: true,
    comparison: true,
    server_persistence: false,
    browser_persistence: false,
    user_controlled_export: true,
    claim_boundary: CLAIM_BOUNDARY,
  });
}
