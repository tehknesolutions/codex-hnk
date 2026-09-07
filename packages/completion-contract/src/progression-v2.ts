import type {
  CompletionFailure,
  CompletionProgressState,
} from "./types.js";

export interface SephirahCycleState {
  id: string;
  label: string;
  days: [number, number];
  completed_days: number;
  complete: boolean;
}

export interface SephirahProgressState {
  sephira: string;
  days_completed: number;
  days_total: number;
  portal_unlocked: boolean;
  complete: boolean;
  cycles: SephirahCycleState[];
}

export interface CompleteDayResponseV2 {
  day: number;
  completion_contract_id: string;
  quest_definition_id: string;
  canonical_source_sha: string;
  first_completion: boolean;
  xp_awarded: number;
  xp_total: number;
  initiatory_grade: number;
  initiatory_title: string;
  sephirah_state: SephirahProgressState;
  progress: CompletionProgressState;
  progression_events: string[];
  server_completed_at: string;
}

export interface CompletionSuccessV2 {
  ok: true;
  response: CompleteDayResponseV2;
}

export type CompletionResultV2 = CompletionSuccessV2 | CompletionFailure;
