# HNK Completion Progress Genericization V2

**Status:** required before Day 037 production completion.

The current request contract is generic enough for any Day. The current response contract is not: `CompleteDayResponseV1` requires `crown: KetherCrownState`.

## Non-breaking path

Keep V1 intact for Day 001. Add a V2 response envelope:

```ts
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
```

## Invariants

- XP remains server-authoritative.
- Client cannot mark a Day complete directly.
- Source hash, Quest ID and completion-contract ID remain echoed and validated.
- Replay remains idempotent.
- Private journal text never enters the completion RPC.
- Genericization must not weaken sequence or Portal gating.

## Day 037 production gate

Specification, renderer, evidence schema and request builder may exist on the integration branch now. Production completion remains blocked until the V2 progression response, contract registry, evidence validator and replay/concurrency tests are implemented.
