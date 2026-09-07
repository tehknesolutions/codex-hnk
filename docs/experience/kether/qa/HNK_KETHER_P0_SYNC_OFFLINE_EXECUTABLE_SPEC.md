# HNK KETHER — P0 OFFLINE / SYNC / MULTI-DEVICE EXECUTABLE SPEC

**Status:** Executable QA Contract v1  
**Scope:** Kether synchronization integrity before RC1  
**Parent contract:** `docs/experience/kether/HNK_KETHER_ACCEPTANCE_QA_MATRIX.md`  
**DB companion:** `docs/experience/kether/qa/HNK_KETHER_P0_DB_EXECUTABLE_SPEC.md`  
**Tracking issue:** `codex-hnk-app#7`

> This document specifies observable reconciliation behavior for offline Practice Records, competing devices and Portal promotion. It does not define transport internals or require a specific local-storage library.

---

## 1. CURRENT IMPLEMENTATION BASELINE

The database already supports two important synchronization anchors:

1. `practice_sessions.client_session_id` is unique per `(user_id, client_session_id)`;
2. canonical Day Completion is unique per `(user_id, day)` and XP uses an idempotency key.

The client packages do not yet have runtime integration tests proving offline reconciliation behavior.

Therefore this document defines the required contract before implementation details are chosen.

---

## 2. AUTHORITY MODEL

The client may record practice locally, but canonical progression is server-authoritative.

```text
LOCAL PRACTICE
      ↓
SYNC ATTEMPT
      ↓
SERVER PRACTICE SESSION
      ↓
complete_codex_day(...)
      ↓
SERVER DECIDES
first completion OR already completed
      ↓
CLIENT RECONCILES TO SERVER STATE
```

The client must never decide locally that XP or Initiatory Grade is final.

### Authoritative server fields

At minimum:

- canonical Day Completion existence;
- `xp_awarded`;
- `xp_total`;
- Crown state;
- `initiatory_grade`;
- `initiatory_title`;
- current Day/Chapter/Sephira after a confirmed Portal.

### Local evidence ownership

A server conflict must not cause the client to silently discard the user's local Practice Record/evidence.

A local attempt can remain meaningful even when another device already created the canonical completion.

---

## 3. FIXTURE MODEL

Use one authenticated user with two independent client identities:

- `DEVICE_A`;
- `DEVICE_B`.

Each device has:

- independent local storage;
- independent `client_session_id` generation;
- independent network state;
- the same authenticated HNK user account.

A third fixture may simulate a fresh reinstall/device when needed.

No test uses production data.

---

## 4. CLIENT SESSION ID CONTRACT

A locally created Practice Session receives a stable `client_session_id` before network synchronization.

Required properties:

1. it survives retries for the same local session;
2. retrying the same local session does not intentionally mint a new ID merely because transport failed;
3. two genuinely distinct sessions use distinct IDs;
4. the server uniqueness rule prevents duplicate rows for the same user/session ID.

### Supporting regression — stable retry identity

**Given** DEVICE_A creates local session `A1`.  
**And** its first upload request times out with unknown server outcome.  
**When** DEVICE_A retries.  
**Then** it retries using `A1`, not a newly generated session ID.

Expected result: at most one server Practice Session represents that local attempt.

---

## 5. OFF-002 — SERVER DETERMINES FIRST COMPLETION AFTER SYNC

### Scenario A — no competing completion exists

**Given** Day N is eligible and not yet canonically complete.  
**And** DEVICE_A completes its practice offline with structured evidence.  
**When** A reconnects and synchronizes the Practice Session/evidence.  
**And** calls the canonical completion RPC.  
**Then** the server may return:

```text
first_completion = true
xp_awarded = canonical Day XP
```

And the client marks the Day as server-confirmed COMPLETE only after receiving that response.

### Scenario B — DEVICE_B wins while A is offline

**Given** DEVICE_A has a completed local Day N attempt but has not synchronized it.  
**And** DEVICE_B completes the same Day online first.  
**Then** Day N already has one canonical completion and XP award.

**When** DEVICE_A reconnects and uploads its distinct Practice Session.  
**And** A calls `complete_codex_day` for Day N.  
**Then** the server must return the already-complete outcome:

```text
first_completion = false
xp_awarded = 0
```

Post-conditions:

- canonical Day Completion count remains `1`;
- canonical XP Event count remains `1`;
- A's Practice Session is preserved/synchronized;
- A's local evidence is not silently discarded;
- A reconciles its Day UI to canonical COMPLETE;
- A must not display a second XP celebration.

The client may describe A's attempt as an additional practice/reconciled attempt, but must not rewrite the original canonical completion owner/session reference.

---

## 6. OFF-003 — TWO-DEVICE CONFLICT CANNOT DUPLICATE XP/COMPLETION

**Given** DEVICE_A and DEVICE_B each hold a distinct ready Practice Session for the same user and same not-yet-completed Day.  
**When** both synchronize and release completion requests with overlapping timing.  
**Then** the server invariants are:

```text
day_completion_count = 1
canonical_xp_event_count = 1
xp_total_delta = canonical_xp
```

Client reconciliation requirements:

- the winning response may show first completion celebration;
- the losing response must show no additional XP;
- after state refresh, both devices display the same canonical Day/Crown/XP state;
- neither device rolls the server state backward based on stale local state.

### Stale snapshot rule

If DEVICE_A cached:

```text
xp_total = X
```

and DEVICE_B's successful completion changed server XP to:

```text
X + day_xp
```

DEVICE_A must not overwrite the server with cached `X` during reconciliation.

Canonical progression is read/derived from the server, not pushed as a client snapshot.

---

## 7. ORDERING / SEQUENCE CONFLICT

### Scenario — offline Day N+1 cannot bypass missing canonical Day N

**Given** DEVICE_A locally performed Day N+1 while its local view incorrectly/stalely believed Day N was complete.  
**But** the server does not contain canonical Day N completion.  
**When** A synchronizes and calls completion for N+1.  
**Then** the server's `previous_day_required` result wins.

Required client behavior:

- preserve the local attempt/evidence;
- do not grant XP;
- do not mark N+1 canonically complete;
- explain that progression confirmation is pending/blocked by canonical sequence;
- allow later retry after Day N is legitimately completed.

The client must not forge the missing prior completion to preserve local sequence appearance.

---

## 8. SYNC FAILURE MUST NOT DESTROY EVIDENCE

Supporting P1 behavior required for the P0 flows to be reliable.

**Given** a user finishes a practice and has unsynced structured evidence.  
**When** network upload or completion RPC fails.  
**Then**:

- local session/evidence remains recoverable;
- UI exposes retry;
- retry uses stable session identity;
- UI does not falsely label server-confirmed COMPLETE;
- no duplicate local XP is minted as compensation.

A crash/relaunch between failure and retry must not silently erase the unsynced record where offline support is declared.

---

## 9. LOCAL PENDING VS SERVER CONFIRMED

The UI must distinguish at least these semantic states, regardless of internal enum names:

```text
LOCAL PRACTICE COMPLETE / SYNC PENDING
SERVER-CONFIRMED DAY COMPLETE
```

For ordinary Days, celebratory presentation may acknowledge finishing the local practice, but canonical XP/Crown state must be reconciled to server confirmation.

For the Portal, the distinction is stricter and defined below.

---

## 10. OFF-006 — OFFLINE PORTAL = PROMOTION_PENDING_SYNC

### Precondition

A Portal attempt may be run offline only when the product has a previously synchronized state showing:

```text
Days 001–035 complete
Crown 7/7
Grade 1 — Neófito
Portal assets/content available for the supported offline path
```

### Required behavior

**Given** DEVICE_A performs the complete Portal flow offline.  
**Then** the client may preserve:

- Portal Practice Record;
- structured evidence;
- encrypted local Journal update;
- local ceremony-preparation state.

But until backend confirmation, the user remains canonically:

```text
Level 1 — Neófito
```

The UI must represent the result as semantic state:

`PROMOTION_PENDING_SYNC`

### Forbidden offline finalization

Before server confirmation the client must not finalize:

- `Level 2 — Iniciado` as canonical account state;
- +500 canonical XP;
- permanent Chokmah unlock state;
- final Crown→Portal success ceremony implying server-confirmed promotion.

It may say the Portal practice was completed locally and awaits confirmation.

### Successful reconnect

**When** A reconnects, uploads the Portal Practice Session/evidence and receives a successful first-completion response.  
**Then** only after the backend response confirms Grade 2 may the client finalize:

```text
+500 XP
Level 2 — Iniciado
Chokmah unlocked
Day 037 not auto-started
```

### Conflict on reconnect

If another device already completed Portal 036 while A was offline:

- A's attempt is still preserved as a Practice Session;
- server response must not award another 500 XP;
- A reconciles to already-confirmed Grade 2;
- no duplicate promotion ceremony should imply a second initiation event.

The product may acknowledge the local attempt separately from the canonical promotion event.

---

## 11. PORTAL STALE-GATE PROTECTION

**Given** DEVICE_A cached `Portal AVAILABLE`.  
**And** the account/server state later changes in a way that makes a valid completion impossible or requires revalidation.  
**When** A reconnects.  
**Then** server validation wins.

The client must never treat cached `portal_unlocked = true` as authority to force a Day 036 completion.

For the current Kether model, completed Days normally do not regress, but the rule protects against data repair, account migration and future governance operations.

---

## 12. MULTI-DEVICE CROWN RECONCILIATION

After any successful completion on DEVICE_B:

**When** DEVICE_A next refreshes/synchronizes Crown state.  
**Then** A derives/displays Crown fragments from the current server completion state.

A must not maintain a conflicting mutable local Crown currency.

Example:

```text
A cached: 4/7
B completes Cycle V
server: 5/7
A syncs
A displays: 5/7
```

No local "fragment merge" arithmetic is needed; server-derived completion state is authoritative.

---

## 13. RETRY IDEMPOTENCY MATRIX

| Case | Retry identity | Expected canonical side effect |
|---|---|---|
| same Practice Session upload retry | same `client_session_id` | at most one server session for that ID |
| same completion RPC retry | same Day / same or existing session | one Day Completion, one XP Event |
| second device same Day | different session ID | still one Day Completion, one XP Event |
| revisit after canonical completion | new session ID | new Practice Session, zero canonical XP |
| offline Portal reconnect | stable offline session ID | at most one canonical promotion/500 XP |

---

## 14. PRIVACY DURING SYNC

Sync/retry diagnostics may record operational metadata such as:

- session ID/hash;
- Day;
- retry count;
- transport error category;
- sync latency;
- server completion outcome.

They must not log:

- decrypted Journal text;
- dream text;
- prayer/confession content;
- decrypted Portal synthesis;
- raw private audio;
- camera frames.

Test failure output must obey the same restriction.

---

## 15. AUTOMATION LAYERS

Recommended verification split:

### DB / integration

- OFF-002 server first-vs-existing outcome;
- OFF-003 same-Day two-device idempotency;
- server sequence remains authoritative.

### Package integration

- stable `client_session_id` retry;
- local pending preservation;
- server response reconciliation;
- stale local XP/Crown cannot overwrite remote truth.

### E2E web/mobile

- visible pending vs confirmed state;
- reconnect flow;
- offline Portal remains `PROMOTION_PENDING_SYNC`;
- final ceremony occurs only after confirmed backend promotion.

---

## 16. NEGATIVE TESTS

The suite must explicitly prove these anti-patterns do **not** occur:

1. client awards XP optimistically and never corrects it;
2. retry creates multiple Practice Sessions for one local attempt because ID changes;
3. stale device overwrites newer `xp_total`/grade;
4. losing device displays duplicate first-completion celebration after server says `first_completion = false`;
5. offline Portal displays canonical `Iniciado` before server confirmation;
6. sync error deletes unsynced evidence;
7. cached Crown counter conflicts with server-derived fragments;
8. Day N+1 local attempt bypasses server sequence rules.

---

## 17. DEFINITION OF DONE — P0 SYNC LAYER

This layer is done only when:

- `OFF-002`, `OFF-003` and `OFF-006` are automated and GREEN;
- competing-device tests use independent client state;
- local retries use stable session identity;
- server outcome always wins for canonical progression;
- unsynced attempts survive recoverable failures;
- no duplicate XP, Day Completion or Portal promotion is possible through retries;
- offline Portal never finalizes Initiated status before backend confirmation;
- privacy assertions cover logs and failure paths;
- tests run in CI without production user data.
