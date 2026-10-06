import { getLabDefinition } from "./definition.js";
import { isExecutableLab } from "./registry.js";

export type LabSessionState =
  | "ACTIVE"
  | "PAUSED"
  | "SAFETY_STOPPED"
  | "EVIDENCE_PENDING"
  | "READY_FOR_COMPLETION"
  | "COMPLETED";

export interface LabExecutionSession {
  sessionId: string;
  dayId: string;
  state: LabSessionState;
  currentStep: number;
  startedAt: string;
  updatedAt: string;
  safetyStopReason?: string;
}

function assertTimestamp(value: string): void {
  if (!value.trim() || Number.isNaN(Date.parse(value))) throw new Error("lab_timestamp_invalid");
}

export function startLabSession(input: { sessionId: string; dayId: string; at: string }): LabExecutionSession {
  if (!input.sessionId.trim()) throw new Error("lab_session_id_required");
  assertTimestamp(input.at);
  if (!isExecutableLab(input.dayId)) throw new Error(`lab_not_executable:${input.dayId}`);
  if (!getLabDefinition(input.dayId)) throw new Error(`lab_definition_missing:${input.dayId}`);
  return Object.freeze({ sessionId: input.sessionId, dayId: input.dayId, state: "ACTIVE", currentStep: 1, startedAt: input.at, updatedAt: input.at });
}

function transition(session: LabExecutionSession, state: LabSessionState, at: string, extra: Partial<LabExecutionSession> = {}): LabExecutionSession {
  assertTimestamp(at);
  return Object.freeze({ ...session, ...extra, state, updatedAt: at });
}

export function pauseLabSession(session: LabExecutionSession, at: string): LabExecutionSession {
  if (session.state !== "ACTIVE") throw new Error("lab_pause_invalid_state");
  return transition(session, "PAUSED", at);
}

export function resumeLabSession(session: LabExecutionSession, at: string): LabExecutionSession {
  if (session.state !== "PAUSED") throw new Error("lab_resume_invalid_state");
  if (!isExecutableLab(session.dayId)) throw new Error(`lab_not_executable:${session.dayId}`);
  return transition(session, "ACTIVE", at);
}

export function advanceLabStep(session: LabExecutionSession, at: string): LabExecutionSession {
  if (session.state !== "ACTIVE") throw new Error("lab_step_invalid_state");
  const definition = getLabDefinition(session.dayId);
  if (!definition) throw new Error(`lab_definition_missing:${session.dayId}`);
  if (session.currentStep >= definition.steps.length) return transition(session, "EVIDENCE_PENDING", at);
  return transition(session, "ACTIVE", at, { currentStep: session.currentStep + 1 });
}

export function safetyStopLabSession(session: LabExecutionSession, reason: string, at: string): LabExecutionSession {
  if (!["ACTIVE", "PAUSED"].includes(session.state)) throw new Error("lab_safety_stop_invalid_state");
  if (!reason.trim()) throw new Error("lab_safety_stop_reason_required");
  return transition(session, "SAFETY_STOPPED", at, { safetyStopReason: reason.trim() });
}

export function markEvidenceReady(session: LabExecutionSession, at: string): LabExecutionSession {
  if (session.state !== "EVIDENCE_PENDING") throw new Error("lab_evidence_invalid_state");
  return transition(session, "READY_FOR_COMPLETION", at);
}

export function applyAuthoritativeLabCompletion(session: LabExecutionSession, receipt: { accepted: boolean; completionId?: string }, at: string): LabExecutionSession {
  if (session.state !== "READY_FOR_COMPLETION") throw new Error("lab_completion_invalid_state");
  if (!receipt.accepted || !receipt.completionId?.trim()) throw new Error("lab_authoritative_completion_required");
  return transition(session, "COMPLETED", at);
}
