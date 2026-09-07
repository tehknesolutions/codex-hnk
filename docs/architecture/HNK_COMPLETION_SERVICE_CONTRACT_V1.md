# HNK COMPLETION SERVICE CONTRACT V1

**Status:** approved implementation contract for the Golden Day runtime bridge  
**Scope:** client runtime → completion service → authoritative progression backend  
**Golden implementation:** Kether Day 001  
**Current backend reference:** legacy `complete_codex_day(...)` in `codex-hnk-app`

## 1. Authority boundary

The client may execute the Quest, collect structured evidence, persist private Vault references and request completion.

The client may **not** authoritatively grant XP, create a Day Completion, light Crown fragments, change initiatory grade, unlock the next Sephirah or declare the Day complete.

Only the completion backend may do that.

## 2. Existing backend retained

The existing SQL already provides the correct transaction skeleton:

1. authenticate user;
2. resolve canonical Day XP from `codex_days`;
3. lock the matching `practice_sessions` row;
4. require session readiness;
5. enforce Day sequence / Portal gating;
6. insert at most one `day_completions` row;
7. insert XP with a deterministic idempotency key;
8. update authoritative `user_progress`;
9. mark the practice session complete;
10. return XP, Grade and Crown state.

V1 does **not** replace that skeleton.

## 3. Gap in the legacy RPC

The legacy function only checks that first-completion evidence is non-empty. That is insufficient for `HNK-KETHER-D001-COMP-V2`.

The server must additionally validate:

- `completion_contract_id`;
- `quest_definition_id`;
- canonical source SHA;
- the structured evidence required by the published completion contract.

## 4. Migration-safe RPC

Introduce:

`complete_codex_day_v2(...)`

Required arguments:

- `p_day`;
- `p_session_id`;
- `p_completion_contract_id`;
- `p_quest_definition_id`;
- `p_canonical_source_sha`;
- `p_client_completion_id`.

Optional arguments:

- `p_local_record_hash`;
- `p_client_completed_at`.

The evidence itself remains stored in `practice_sessions.evidence`; the RPC locks and validates that server-visible record rather than trusting a second evidence payload from the client.

## 5. Why a V2 RPC instead of silently overloading the old call

Existing clients may still know the old four-argument RPC. Keeping that path executable for authenticated clients after V2 becomes mandatory would create a bypass around the completion contract.

Migration order:

1. publish V2 RPC;
2. migrate clients;
3. prove V2 in production/RC;
4. revoke authenticated execute on legacy RPC;
5. remove or retain legacy function only for administrative migration tooling.

## 6. Day 001 handshake

`CompletionBoundaryScene` sends no XP value.

It sends identity:

`Day 001 + Session + HNK-KETHER-D001-COMP-V2 + HNK-KETHER-D001-V2 + canonical SHA + client completion id`.

The server validates the locked Practice Session against the Day 001 completion contract.

On first valid completion, expected authoritative transition:

- `first_completion = true`;
- `xp_awarded = 150`;
- `KETHER_FIRST_SPARK` appears in `progression_events`;
- Crown shows Kether Day progress 1/36 and Vehuiah progress derivable as 1/5;
- no fragment is awarded yet;
- Day 002 becomes the next available Day.

On duplicate/replayed completion:

- the request is a successful reconciliation;
- `first_completion = false`;
- `xp_awarded = 0`;
- reward animation must not replay as a new reward.

## 7. Offline-first replay

Offline completion is a pending request, not a local canonical completion.

Client flow:

1. save `practice_session` locally;
2. save structured evidence locally;
3. enqueue a completion request by `client_completion_id`;
4. when online, sync the Practice Session;
5. sync evidence;
6. invoke V2 RPC;
7. accept server state as authoritative;
8. remove queue item on success or terminal non-retryable rejection.

Network failure preserves the queue item.

## 8. Error classes

### Retryable

- transport unavailable;
- transient server state conflict after resync where applicable.

### Resync required

- practice session missing;
- practice session not ready;
- source/Quest identity mismatch.

### User/action correction

- evidence required;
- previous Day required;
- Portal locked.

### Release/version correction

- completion contract missing;
- completion contract mismatch/invalid;
- canonical SHA mismatch;
- Quest definition mismatch.

The UI must not translate any of these into “spiritual failure”.

## 9. Runtime integration

The headless `CompletionService` calls the transport and only invokes `runtime.confirmServerCompletion()` after a validated authoritative response.

Therefore:

`QuestRuntime.EVIDENCE_PENDING → server RPC → authoritative response → confirmServerCompletion() → unlock scene`.

## 10. Security invariants

- authenticated user cannot directly write canonical XP events;
- authenticated user cannot directly write Day Completion;
- XP amount comes from canonical server data, never request payload;
- private journal/audio content is not required in RPC arguments;
- replay cannot duplicate XP;
- old RPC must not remain an authenticated bypass after V2 rollout.

## 11. Next backend implementation

When the Supabase scaffold reaches `tehknesolutions/codex-hnk`, implement a migration that:

1. adds/updates a completion-contract registry or equivalent versioned source;
2. implements Day 001 evidence validation for `HNK-KETHER-D001-COMP-V2`;
3. exposes `complete_codex_day_v2`;
4. returns the richer authoritative progress response defined by the response schema;
5. adds concurrency/replay tests;
6. only then deprecates authenticated access to legacy `complete_codex_day`.
