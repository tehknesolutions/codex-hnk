import type { CompletionErrorCode, CompletionFailure } from "./types.js";

const NON_RETRYABLE = new Set<CompletionErrorCode>([
  "authentication_required",
  "invalid_day",
  "canonical_day_not_found",
  "evidence_required",
  "completion_contract_required",
  "completion_contract_not_found",
  "completion_contract_mismatch",
  "completion_contract_invalid",
  "quest_definition_mismatch",
  "canonical_source_sha_mismatch",
  "previous_day_required",
  "kether_portal_locked",
]);

const RESYNC_REQUIRED = new Set<CompletionErrorCode>([
  "practice_session_not_found",
  "practice_session_not_ready",
  "server_state_conflict",
  "canonical_source_sha_mismatch",
  "quest_definition_mismatch",
]);

export function asCompletionFailure(code: string, message?: string): CompletionFailure {
  const normalized = normalizeCompletionErrorCode(code);
  return {
    ok: false,
    code: normalized,
    retryable: normalized === "transport_unavailable" || !NON_RETRYABLE.has(normalized),
    resyncRequired: RESYNC_REQUIRED.has(normalized),
    message,
  };
}

export function normalizeCompletionErrorCode(code: string): CompletionErrorCode {
  const known: CompletionErrorCode[] = [
    "authentication_required",
    "invalid_day",
    "canonical_day_not_found",
    "practice_session_not_found",
    "practice_session_not_ready",
    "evidence_required",
    "completion_contract_required",
    "completion_contract_not_found",
    "completion_contract_mismatch",
    "completion_contract_invalid",
    "quest_definition_mismatch",
    "canonical_source_sha_mismatch",
    "previous_day_required",
    "kether_portal_locked",
    "server_state_conflict",
    "transport_unavailable",
  ];
  return (known as string[]).includes(code) ? (code as CompletionErrorCode) : "unknown_completion_error";
}
