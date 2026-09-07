export type CompletionRequestMode = "first_completion" | "revisit";

export interface CompleteDayRequestV1 {
  day: number;
  sessionId: string;
  completionContractId: string;
  questDefinitionId: string;
  canonicalSourceSha: string;
  clientCompletionId: string;
  clientCompletedAt?: string;
  localRecordHash?: string;
  mode?: CompletionRequestMode;
}

export interface CrownCycleState {
  fragment: number;
  angel: string;
  days: [number, number];
  completed_days: number;
  lit: boolean;
}

export interface KetherCrownState {
  sephira: "Kether";
  days_completed: number;
  fragments_lit: number;
  fragments_total: 7;
  portal_unlocked: boolean;
  kether_complete: boolean;
  cycles: CrownCycleState[];
}

export type ProgressionEvent =
  | "KETHER_FIRST_SPARK"
  | "KETHER_FRAGMENT_LIT"
  | "KETHER_PORTAL_UNLOCKED"
  | "KETHER_COMPLETE"
  | "INITIATORY_GRADE_CHANGED"
  | "NEXT_DAY_UNLOCKED";

export interface CompletionProgressState {
  current_day: number;
  current_chapter: number;
  current_sephira: string;
  initiatory_grade: number;
  initiatory_title: string;
  xp_total: number;
}

export interface CompleteDayResponseV1 {
  day: number;
  completion_contract_id: string;
  quest_definition_id: string;
  canonical_source_sha: string;
  first_completion: boolean;
  xp_awarded: number;
  xp_total: number;
  initiatory_grade: number;
  initiatory_title: string;
  crown: KetherCrownState;
  progress: CompletionProgressState;
  progression_events: ProgressionEvent[];
  server_completed_at: string;
}

export type CompletionErrorCode =
  | "authentication_required"
  | "invalid_day"
  | "canonical_day_not_found"
  | "practice_session_not_found"
  | "practice_session_not_ready"
  | "evidence_required"
  | "completion_contract_required"
  | "completion_contract_not_found"
  | "completion_contract_mismatch"
  | "completion_contract_invalid"
  | "quest_definition_mismatch"
  | "canonical_source_sha_mismatch"
  | "previous_day_required"
  | "kether_portal_locked"
  | "server_state_conflict"
  | "transport_unavailable"
  | "unknown_completion_error";

export interface CompletionFailure {
  ok: false;
  code: CompletionErrorCode;
  retryable: boolean;
  resyncRequired: boolean;
  message?: string;
}

export interface CompletionSuccess {
  ok: true;
  response: CompleteDayResponseV1;
}

export type CompletionResult = CompletionSuccess | CompletionFailure;

export interface CompletionRpcArgsV2 {
  p_day: number;
  p_session_id: string;
  p_completion_contract_id: string;
  p_quest_definition_id: string;
  p_canonical_source_sha: string;
  p_client_completion_id: string;
  p_local_record_hash?: string;
  p_client_completed_at?: string;
}
