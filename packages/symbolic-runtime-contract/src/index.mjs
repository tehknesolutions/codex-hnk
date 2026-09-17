// @ts-nocheck
import {
  HNK_CANON_CONTRACT_ID,
  getHnkCanonRecordBySource,
  validateHnkCanonContract,
} from "@hnk/canon-contract";

export const HNK_SYMBOLIC_RUNTIME_CONTRACT_ID = "HNK_SYMBOLIC_RUNTIME_CONTRACT_V1";
export const HNK_SYMBOLIC_RUNTIME_VERSION = "1.0.0";

export const HNK_SYMBOLIC_RUNTIME_PHASES = Object.freeze([
  "INTENTION_CAPTURED",
  "SPECIFIED",
  "CONSTRUCTED",
  "ACTIVE",
  "OBSERVED",
  "FEEDBACK_RECORDED",
  "CLOSED",
  "ABORTED",
]);

export const HNK_SYMBOLIC_RUNTIME_EVENTS = Object.freeze([
  "GENERATE",
  "SPECIFY",
  "CONSTRUCT",
  "BIND",
  "ACTIVATE",
  "OBSERVE",
  "FEEDBACK",
  "REGULATE",
  "PRUNE",
  "CHOOSE",
  "CYCLE",
  "COMPLETE",
  "ABORT",
]);

export const HNK_SYMBOLIC_RUNTIME_CANON_SOURCES = Object.freeze([
  "HNK-R001-039", // Force / Form
  "HNK-R001-041", // State / Path Architecture
  "HNK-R001-042", // Relational Semantics
  "HNK-R001-044", // Generator
  "HNK-R001-045", // Specifier / Constraint Engine
  "HNK-R001-046", // Constructor
  "HNK-R001-047", // Regulatory Operator
  "HNK-R001-048", // Pruning Operator
  "HNK-R001-049", // Choice Gate
  "HNK-R001-050", // Cycle
  "HNK-R001-051", // Feedback
  "HNK-R001-052", // Observation
  "HNK-R001-054", // Symbolic Key
  "HNK-R001-055", // Vessel / Runtime Context
  "HNK-R001-058", // Quest → Observation → Feedback
  "HNK-R001-062", // HNK Symbolic Runtime
]);

export const HNK_SYMBOLIC_RUNTIME_CANON = Object.freeze(
  HNK_SYMBOLIC_RUNTIME_CANON_SOURCES.map((sourceItemId) => {
    const record = getHnkCanonRecordBySource(sourceItemId);
    if (!record) throw new Error(`Missing required HNK canon dependency ${sourceItemId}`);
    return record;
  }),
);

const ALLOWED_EVENTS = Object.freeze({
  INTENTION_CAPTURED: Object.freeze(["GENERATE", "SPECIFY", "ABORT"]),
  SPECIFIED: Object.freeze(["CONSTRUCT", "CHOOSE", "ABORT"]),
  CONSTRUCTED: Object.freeze(["BIND", "ACTIVATE", "REGULATE", "PRUNE", "CHOOSE", "ABORT"]),
  ACTIVE: Object.freeze(["OBSERVE", "REGULATE", "PRUNE", "CHOOSE", "ABORT"]),
  OBSERVED: Object.freeze(["OBSERVE", "FEEDBACK", "REGULATE", "ABORT"]),
  FEEDBACK_RECORDED: Object.freeze(["OBSERVE", "FEEDBACK", "REGULATE", "PRUNE", "CHOOSE", "CYCLE", "COMPLETE", "ABORT"]),
  CLOSED: Object.freeze([]),
  ABORTED: Object.freeze([]),
});

const EVIDENCE_SCOPES = Object.freeze(["OBSERVED", "SELF_REPORTED", "SYSTEM_MEASURED", "MIXED"]);
const FEEDBACK_ACTIONS = Object.freeze(["CONTINUE", "CORRECT", "PRUNE", "CLOSE"]);
const REGULATION_ACTIONS = Object.freeze(["MAINTAIN", "CORRECT", "LIMIT", "PAUSE"]);

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function appendEvent(session, event) {
  if (session.events.some((existing) => existing.event_id === event.event_id)) {
    throw new Error(`duplicate event_id ${event.event_id}`);
  }
  return [...session.events, deepFreeze(clone(event))];
}

export function allowedSymbolicRuntimeEvents(phase) {
  if (!HNK_SYMBOLIC_RUNTIME_PHASES.includes(phase)) throw new RangeError(`unknown symbolic runtime phase ${phase}`);
  return ALLOWED_EVENTS[phase];
}

export function createSymbolicRuntimeSession(input) {
  assertNonEmptyString(input?.session_id, "session_id");
  assertNonEmptyString(input?.created_at, "created_at");
  assertNonEmptyString(input?.intention, "intention");
  assertNonEmptyString(input?.current_state, "current_state");
  assertNonEmptyString(input?.target_state, "target_state");

  const session = {
    contract_id: HNK_SYMBOLIC_RUNTIME_CONTRACT_ID,
    contract_version: HNK_SYMBOLIC_RUNTIME_VERSION,
    canon_contract_id: HNK_CANON_CONTRACT_ID,
    canon_sources: [...HNK_SYMBOLIC_RUNTIME_CANON_SOURCES],
    session_id: input.session_id.trim(),
    created_at: input.created_at.trim(),
    updated_at: input.created_at.trim(),
    phase: "INTENTION_CAPTURED",
    cycle: 1,
    intention: input.intention.trim(),
    current_state: input.current_state.trim(),
    target_state: input.target_state.trim(),
    candidates: [],
    specification: null,
    construction: null,
    symbolic_key: null,
    vessel: null,
    choices: [],
    regulations: [],
    prunings: [],
    observations: [],
    feedback: [],
    result: null,
    abort: null,
    events: [],
  };

  return deepFreeze(session);
}

export function applySymbolicRuntimeEvent(session, event) {
  const validation = validateSymbolicRuntimeSession(session);
  if (!validation.ok) throw new Error(`invalid symbolic runtime session: ${validation.issues.join("; ")}`);

  assertNonEmptyString(event?.event_id, "event_id");
  assertNonEmptyString(event?.type, "type");
  assertNonEmptyString(event?.at, "at");

  if (!HNK_SYMBOLIC_RUNTIME_EVENTS.includes(event.type)) throw new RangeError(`unknown symbolic runtime event ${event.type}`);
  const allowed = allowedSymbolicRuntimeEvents(session.phase);
  if (!allowed.includes(event.type)) throw new Error(`event ${event.type} not allowed in phase ${session.phase}`);

  const next = clone(session);
  next.updated_at = event.at.trim();
  next.events = appendEvent(session, event);
  const payload = event.payload ?? {};

  switch (event.type) {
    case "GENERATE": {
      assertNonEmptyString(payload.candidate_id, "payload.candidate_id");
      assertNonEmptyString(payload.label, "payload.label");
      next.candidates.push({
        candidate_id: payload.candidate_id.trim(),
        label: payload.label.trim(),
        rationale: typeof payload.rationale === "string" ? payload.rationale.trim() : "",
      });
      break;
    }
    case "SPECIFY": {
      assertNonEmptyString(payload.path_id, "payload.path_id");
      assertNonEmptyString(payload.from_state, "payload.from_state");
      assertNonEmptyString(payload.to_state, "payload.to_state");
      const constraints = Array.isArray(payload.constraints)
        ? payload.constraints.map((item) => assertNonEmptyString(item, "payload.constraints[]"))
        : [];
      next.specification = {
        path_id: payload.path_id.trim(),
        from_state: payload.from_state.trim(),
        to_state: payload.to_state.trim(),
        constraints,
      };
      next.phase = "SPECIFIED";
      break;
    }
    case "CONSTRUCT": {
      if (!next.specification) throw new Error("CONSTRUCT requires a specification");
      if (!Array.isArray(payload.steps) || payload.steps.length === 0) throw new Error("payload.steps must contain at least one step");
      next.construction = {
        construction_id: assertNonEmptyString(payload.construction_id, "payload.construction_id"),
        steps: payload.steps.map((step, index) => ({
          step_id: assertNonEmptyString(step?.step_id, `payload.steps[${index}].step_id`),
          action: assertNonEmptyString(step?.action, `payload.steps[${index}].action`),
        })),
      };
      next.phase = "CONSTRUCTED";
      break;
    }
    case "BIND": {
      if (!payload.symbolic_key && !payload.vessel) throw new Error("BIND requires symbolic_key and/or vessel");
      if (payload.symbolic_key) {
        next.symbolic_key = {
          key_id: assertNonEmptyString(payload.symbolic_key.key_id, "payload.symbolic_key.key_id"),
          reference: assertNonEmptyString(payload.symbolic_key.reference, "payload.symbolic_key.reference"),
        };
      }
      if (payload.vessel) {
        next.vessel = {
          vessel_id: assertNonEmptyString(payload.vessel.vessel_id, "payload.vessel.vessel_id"),
          context_type: assertNonEmptyString(payload.vessel.context_type, "payload.vessel.context_type"),
          context_ref: assertNonEmptyString(payload.vessel.context_ref, "payload.vessel.context_ref"),
        };
      }
      break;
    }
    case "ACTIVATE": {
      if (!next.construction) throw new Error("ACTIVATE requires construction");
      if (!next.vessel) throw new Error("ACTIVATE requires a bound vessel/runtime context");
      next.phase = "ACTIVE";
      break;
    }
    case "OBSERVE": {
      assertNonEmptyString(payload.observation_id, "payload.observation_id");
      assertNonEmptyString(payload.raw, "payload.raw");
      next.observations.push({
        observation_id: payload.observation_id.trim(),
        raw: payload.raw.trim(),
        interpretation: typeof payload.interpretation === "string" ? payload.interpretation.trim() : null,
        at: event.at.trim(),
      });
      next.phase = "OBSERVED";
      break;
    }
    case "FEEDBACK": {
      if (next.observations.length === 0) throw new Error("FEEDBACK requires at least one observation");
      assertNonEmptyString(payload.feedback_id, "payload.feedback_id");
      assertNonEmptyString(payload.assessment, "payload.assessment");
      if (!FEEDBACK_ACTIONS.includes(payload.next_action)) throw new RangeError(`invalid feedback next_action ${payload.next_action}`);
      next.feedback.push({
        feedback_id: payload.feedback_id.trim(),
        assessment: payload.assessment.trim(),
        next_action: payload.next_action,
        at: event.at.trim(),
      });
      next.phase = "FEEDBACK_RECORDED";
      break;
    }
    case "REGULATE": {
      assertNonEmptyString(payload.regulation_id, "payload.regulation_id");
      assertNonEmptyString(payload.reason, "payload.reason");
      if (!REGULATION_ACTIONS.includes(payload.action)) throw new RangeError(`invalid regulation action ${payload.action}`);
      next.regulations.push({
        regulation_id: payload.regulation_id.trim(),
        action: payload.action,
        reason: payload.reason.trim(),
        at: event.at.trim(),
      });
      break;
    }
    case "PRUNE": {
      assertNonEmptyString(payload.pruning_id, "payload.pruning_id");
      assertNonEmptyString(payload.reason, "payload.reason");
      if (!Array.isArray(payload.refs) || payload.refs.length === 0) throw new Error("payload.refs must contain at least one reference");
      next.prunings.push({
        pruning_id: payload.pruning_id.trim(),
        refs: payload.refs.map((ref) => assertNonEmptyString(ref, "payload.refs[]")),
        reason: payload.reason.trim(),
        at: event.at.trim(),
      });
      break;
    }
    case "CHOOSE": {
      assertNonEmptyString(payload.choice_id, "payload.choice_id");
      assertNonEmptyString(payload.selected, "payload.selected");
      const alternatives = Array.isArray(payload.alternatives)
        ? payload.alternatives.map((value) => assertNonEmptyString(value, "payload.alternatives[]"))
        : [];
      if (alternatives.length > 0 && !alternatives.includes(payload.selected.trim())) {
        throw new Error("payload.selected must be present in payload.alternatives when alternatives are supplied");
      }
      next.choices.push({
        choice_id: payload.choice_id.trim(),
        selected: payload.selected.trim(),
        alternatives,
        rationale: typeof payload.rationale === "string" ? payload.rationale.trim() : "",
        at: event.at.trim(),
      });
      break;
    }
    case "CYCLE": {
      if (next.feedback.length === 0) throw new Error("CYCLE requires feedback");
      next.cycle += 1;
      next.phase = "ACTIVE";
      break;
    }
    case "COMPLETE": {
      if (next.feedback.length === 0) throw new Error("COMPLETE requires feedback");
      assertNonEmptyString(payload.result_state, "payload.result_state");
      if (!EVIDENCE_SCOPES.includes(payload.evidence_scope)) throw new RangeError(`invalid evidence_scope ${payload.evidence_scope}`);
      next.result = {
        result_state: payload.result_state.trim(),
        evidence_scope: payload.evidence_scope,
        evidence: Array.isArray(payload.evidence) ? payload.evidence.map((item) => clone(item)) : [],
        claim_boundary: "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF",
        completed_at: event.at.trim(),
      };
      next.current_state = payload.result_state.trim();
      next.phase = "CLOSED";
      break;
    }
    case "ABORT": {
      next.abort = {
        reason: assertNonEmptyString(payload.reason, "payload.reason"),
        aborted_at: event.at.trim(),
      };
      next.phase = "ABORTED";
      break;
    }
  }

  const nextValidation = validateSymbolicRuntimeSession(next);
  if (!nextValidation.ok) throw new Error(`symbolic runtime transition produced invalid session: ${nextValidation.issues.join("; ")}`);
  return deepFreeze(next);
}

export function validateSymbolicRuntimeSession(session) {
  const issues = [];
  const canonValidation = validateHnkCanonContract();
  if (!canonValidation.ok) issues.push(`canon contract invalid: ${canonValidation.issues.join(" | ")}`);

  if (session?.contract_id !== HNK_SYMBOLIC_RUNTIME_CONTRACT_ID) issues.push(`unexpected contract_id ${session?.contract_id}`);
  if (session?.contract_version !== HNK_SYMBOLIC_RUNTIME_VERSION) issues.push(`unexpected contract_version ${session?.contract_version}`);
  if (session?.canon_contract_id !== HNK_CANON_CONTRACT_ID) issues.push(`unexpected canon_contract_id ${session?.canon_contract_id}`);
  if (!HNK_SYMBOLIC_RUNTIME_PHASES.includes(session?.phase)) issues.push(`unknown phase ${session?.phase}`);
  if (!Number.isInteger(session?.cycle) || session.cycle < 1) issues.push("cycle must be an integer >= 1");

  for (const field of ["session_id", "created_at", "updated_at", "intention", "current_state", "target_state"]) {
    if (typeof session?.[field] !== "string" || !session[field].trim()) issues.push(`${field} required`);
  }

  if (!Array.isArray(session?.canon_sources) || HNK_SYMBOLIC_RUNTIME_CANON_SOURCES.some((source) => !session.canon_sources.includes(source))) {
    issues.push("canon_sources missing required runtime canon dependencies");
  }

  for (const field of ["candidates", "choices", "regulations", "prunings", "observations", "feedback", "events"]) {
    if (!Array.isArray(session?.[field])) issues.push(`${field} must be an array`);
  }

  const eventIds = new Set();
  for (const event of session?.events ?? []) {
    if (!event?.event_id || eventIds.has(event.event_id)) issues.push(`duplicate or missing event_id ${event?.event_id}`);
    eventIds.add(event?.event_id);
    if (!HNK_SYMBOLIC_RUNTIME_EVENTS.includes(event?.type)) issues.push(`unknown logged event ${event?.type}`);
  }

  if (["SPECIFIED", "CONSTRUCTED", "ACTIVE", "OBSERVED", "FEEDBACK_RECORDED", "CLOSED"].includes(session?.phase) && !session?.specification) {
    issues.push(`${session?.phase} requires specification`);
  }
  if (["CONSTRUCTED", "ACTIVE", "OBSERVED", "FEEDBACK_RECORDED", "CLOSED"].includes(session?.phase) && !session?.construction) {
    issues.push(`${session?.phase} requires construction`);
  }
  if (["ACTIVE", "OBSERVED", "FEEDBACK_RECORDED", "CLOSED"].includes(session?.phase) && !session?.vessel) {
    issues.push(`${session?.phase} requires vessel/runtime context`);
  }
  if (["OBSERVED", "FEEDBACK_RECORDED", "CLOSED"].includes(session?.phase) && (session?.observations?.length ?? 0) === 0) {
    issues.push(`${session?.phase} requires at least one observation`);
  }
  if (["FEEDBACK_RECORDED", "CLOSED"].includes(session?.phase) && (session?.feedback?.length ?? 0) === 0) {
    issues.push(`${session?.phase} requires feedback`);
  }
  if (session?.phase === "CLOSED" && !session?.result) issues.push("CLOSED requires result");
  if (session?.phase === "ABORTED" && !session?.abort) issues.push("ABORTED requires abort record");
  if (session?.result && session.result.claim_boundary !== "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF") {
    issues.push("result claim_boundary must remain evidence-scoped");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function symbolicRuntimeSummary() {
  const canonValidation = validateHnkCanonContract();
  return deepFreeze({
    contract_id: HNK_SYMBOLIC_RUNTIME_CONTRACT_ID,
    version: HNK_SYMBOLIC_RUNTIME_VERSION,
    canon_contract_id: HNK_CANON_CONTRACT_ID,
    canon_contract_ok: canonValidation.ok,
    canon_dependencies: HNK_SYMBOLIC_RUNTIME_CANON.length,
    phases: HNK_SYMBOLIC_RUNTIME_PHASES.length,
    events: HNK_SYMBOLIC_RUNTIME_EVENTS.length,
    deterministic_reducer: true,
    caller_supplied_ids_and_timestamps: true,
    evidence_scoped_results: true,
    metaphysical_efficacy_claimed: false,
  });
}
