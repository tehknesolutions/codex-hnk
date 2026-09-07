# HNK KETHER — P0 DB / RLS / RPC EXECUTABLE SPEC

**Status:** Executable QA Contract v1  
**Scope:** Kether P0 database integrity before RC1  
**Parent contract:** `docs/experience/kether/HNK_KETHER_ACCEPTANCE_QA_MATRIX.md`  
**Tracking issue:** `codex-hnk-app#7`  
**Database authority:** Supabase migrations in `supabase/migrations/`

> This document turns the P0 database acceptance rules into deterministic test scenarios. It does not alter canonical Codex content, ritual execution, XP values or Portal requirements.

---

## 1. CURRENT IMPLEMENTATION BASELINE

The current database already provides:

- `practice_sessions` with RLS ownership;
- authenticated read-only access to `day_completions`, `xp_events` and `user_progress`;
- `complete_codex_day(...)` as the privileged completion path;
- sequence validation for Days 002–035;
- 35/35 gate for Day 036;
- evidence-required validation for first completion;
- idempotent Day Completion and XP insertion;
- `get_kether_crown_state()` derived from canonical Day Completions;
- initiatory grade promotion to `2 / Iniciado` on valid Day 036 completion.

The database package currently has no runtime database test suite, so these invariants are not yet proven in CI.

### Known RED contract — Portal structural evidence

The current `complete_codex_day(...)` implementation validates that first-completion evidence is non-empty, but it does **not yet validate the complete Portal 036 structural evidence contract** defined in `HNK_KETHER_PORTAL_036_SPEC.md`.

Therefore:

- `P36-012` is intentionally expected to be **RED** against the current implementation;
- RC1 must not be approved while it remains RED;
- the implementation migration should reject structurally incomplete Portal evidence before Day 036 completion/promotion.

Do not weaken `P36-012` merely to make CI green.

---

## 2. TEST HARNESS CONTRACT

The Production Lab may choose the exact open-source runner, but every implementation must provide the same observable behavior.

Recommended shape:

```text
isolated local/test Supabase database
        ↓
apply all migrations
        ↓
load canonical Kether fixture metadata
        ↓
create USER_A and USER_B
        ↓
simulate authenticated sessions so auth.uid() resolves correctly
        ↓
run P0 scenarios
        ↓
rollback/reset fixture state
```

No scenario may use production user data.

### Required fixture users

- `USER_A` — primary test subject;
- `USER_B` — cross-user RLS adversarial subject.

Each test must begin from a deterministic state and must not depend on execution order unless the scenario explicitly tests a chain.

### Canonical Day fixture rule

Tests must read XP and Day metadata from `codex_days`.

They must not hardcode normal Day XP as business logic. Day 036 may assert `500` only because the canonical Day 036 metadata currently defines 500 XP and the acceptance contract explicitly requires it.

### Session fixture helper

Conceptual helper:

```text
create_practice_session(
  user,
  day,
  state,
  evidence,
  mode = first_completion
)
```

The actual runner may implement this through authenticated inserts, admin fixture setup or equivalent isolated test plumbing.

---

## 3. RLS / DIRECT WRITE P0

### PRC-001 — another user's Practice Sessions are unreadable

**Given** USER_B owns at least one `practice_sessions` row.  
**When** USER_A selects `practice_sessions`.  
**Then** USER_B's row is absent from USER_A's result set.

Post-condition:

```text
visible(USER_A, USER_B.session) = false
```

### PRC-002 — another user's Practice Sessions are immutable

**Given** USER_B owns a Practice Session.  
**When** USER_A attempts to update that row.  
**Then** no mutation of USER_B's row occurs.

Assert before/after equality for state, evidence, metrics and timestamps controlled by the attempted update.

### XP-001 — authenticated client cannot write xp_events directly

**When** USER_A attempts client-role `INSERT`, `UPDATE` or `DELETE` against `xp_events`.  
**Then** the operation is rejected or affects zero rows according to the database privilege boundary.  
**And** no XP Event is created/changed/deleted.

### XP-002 — authenticated client cannot write day_completions directly

Same structure as `XP-001`, targeting `day_completions`.

### XP-003 — authenticated client cannot mutate canonical progress directly

**When** USER_A attempts to change `xp_total`, `initiatory_grade`, `initiatory_title`, `current_day`, `current_chapter` or `current_sephira` directly in `user_progress`.  
**Then** the authenticated client cannot perform the mutation.

---

## 4. DAY STATE / SEQUENCE P0

### DAY-002 — previous Day required

**Given** USER_A has no Day 001 completion.  
**And** a Day 002 Practice Session exists in `evidence_pending` with non-empty evidence.  
**When** USER_A calls `complete_codex_day(2, session_id, ...)`.  
**Then** the RPC fails with semantic error `previous_day_required`.  
**And** no Day 002 completion exists.  
**And** no Day 002 XP Event exists.  
**And** `xp_total` is unchanged.

### DAY-005A — ACTIVE session cannot seal

**Given** Day 001 is eligible for first completion.  
**And** its Practice Session state is `active`.  
**When** USER_A calls `complete_codex_day`.  
**Then** the RPC fails with `practice_session_not_ready`.

### DAY-005B — empty evidence cannot seal first completion

**Given** Day 001 session state is `evidence_pending`.  
**And** evidence is `{}`.  
**When** USER_A calls `complete_codex_day`.  
**Then** the RPC fails with `evidence_required`.  
**And** no completion/XP exists.

### DAY-006 — valid first completion seals exactly once

**Given** an eligible Day with state `evidence_pending` and non-empty structured evidence.  
**When** `complete_codex_day` succeeds.  
**Then**:

- exactly one `(user_id, day)` exists in `day_completions`;
- `first_completion_session_id` points to the Practice Session;
- the Practice Session becomes `complete`;
- exactly one canonical XP Event exists for the Day;
- `xp_awarded` equals the XP read from `codex_days`;
- `xp_total` increases by exactly that amount;
- response `first_completion = true`.

### DAY-008 — revisit never creates a second canonical completion

**Given** USER_A already completed Day N.  
**And** a new `practice_sessions` row exists with `mode = revisit` and valid ready state.  
**When** USER_A calls `complete_codex_day(N, revisit_session_id, ...)`.  
**Then**:

- Day Completion count for `(USER_A, N)` remains `1`;
- canonical XP Event count remains `1`;
- response `first_completion = false`;
- response `xp_awarded = 0`;
- revisit Practice Session may become `complete`;
- original `first_completion_session_id` is unchanged.

---

## 5. XP / IDEMPOTENCY P0

### XP-004 — canonical XP awarded exactly once

For an eligible first completion:

```text
xp_before = user_progress.xp_total
canonical_xp = codex_days.xp
complete Day
xp_after = user_progress.xp_total
```

Assert:

```text
xp_after - xp_before = canonical_xp
xp_event.amount = canonical_xp
```

No client constant is accepted as authority.

### XP-005 — concurrent completion awards XP at most once

**Given** two distinct ready Practice Sessions `S1` and `S2` for the same USER_A and same not-yet-completed Day.  
**When** two completion RPC calls are released concurrently.  
**Then**, after both settle:

```text
day_completion_count = 1
canonical_xp_event_count = 1
xp_total_delta = canonical_xp
```

And exactly one call may report `first_completion = true`; the other must not produce a second award.

This test must use true overlapping requests, not two serial calls labeled "concurrent".

### XP-006 — revisit returns zero new XP

Covered by `DAY-008` but retained as an independent release assertion:

```text
first_completion = false
xp_awarded = 0
xp_total_delta = 0
```

---

## 6. COROA / PORTAL GATE P0

### CRW-001 — Crown state is derived

**Given** completed Day sets are changed only through controlled fixture state.  
**When** `get_kether_crown_state()` is called as USER_A.  
**Then** `fragments_lit`, each cycle's `completed_days`, `portal_unlocked` and `kether_complete` match the actual `day_completions` rows.

No separate mutable Crown counter may be required for the assertion to pass.

### CRW-009 — 34/35 keeps Portal locked

**Given** USER_A has exactly 34 unique completions among Days 001–035.  
**When** Crown state is read.  
**Then** `portal_unlocked = false`.  
**And** an attempted first completion of Day 036 fails with `kether_portal_locked`.

### CRW-010 — 35/35 unlocks Portal but does not promote

**Given** USER_A has Days 001–035 complete.  
**When** Crown state is read before Day 036 completion.  
**Then**:

```text
portal_unlocked = true
fragments_lit = 7
initiatory_grade = 1
initiatory_title = Neófito
kether_complete = false
```

Crown completion alone must never set Grade 2.

---

## 7. PORTAL 036 P0

### P36-001 — valid exam cannot complete before 35/35

Database assertion is equivalent to `CRW-009`, but must be executed specifically with a ready Day 036 Practice Session to prove the Portal RPC boundary.

Expected semantic error:

`kether_portal_locked`

### P36-002 — Coroa 7/7 does not itself promote

Equivalent to `CRW-010`; retain as a Portal-specific regression test.

### P36-012 — structural Portal evidence is mandatory — EXPECTED RED TODAY

**Required final behavior:** after Days 001–035 are complete, create a Day 036 Practice Session in `evidence_pending` containing a deliberately insufficient but non-empty evidence object, for example:

```json
{
  "protocol_completed": true
}
```

**When** the Portal completion RPC is called.  
**Then** the final implementation must reject promotion because required Portal structure is absent.

The final validator must require the approved structural fields from `HNK_KETHER_PORTAL_036_SPEC.md`, including at minimum:

- Portal condition complete;
- base condition complete;
- Portal/base comparison complete;
- return/orientation confirmed;
- review of Days 001–035 complete;
- exactly/at least 3 consolidated competencies per approved schema;
- exactly/at least 3 fragile competencies per approved schema;
- 7 attribute evidence records per approved schema;
- premature-promotion criterion declared;
- Kether synthesis complete;
- journal update confirmed without plaintext entering operational evidence;
- no blocking safety state.

**Current expected result:** this test is RED because the current RPC only checks `evidence != {}` before promoting.

A future migration should introduce a deterministic semantic rejection such as `portal_evidence_incomplete`; exact error naming may change, but the acceptance behavior may not.

### P36-013 — +500 XP exactly once

**Given** a structurally valid Portal session after 35/35.  
**When** Day 036 is completed.  
**Then**:

```text
xp_awarded = 500
Day 036 canonical xp_event count = 1
xp_total delta = 500
```

Repeating the call or revisiting Day 036 must award `0` additional XP.

### P36-014 — grade/title promotion is atomic with first valid Day 036 completion

After a valid first Day 036 completion, assert in the same committed state:

```text
day 036 completion exists
initiatory_grade = 2
initiatory_title = Iniciado
current_day = 37
current_chapter = 2
current_sephira = Chokmah
kether_complete = true
```

There must be no committed state where Day 036 is complete but the user remains officially Neófito.

### P36-015 — concurrent/repeated Portal calls cannot duplicate promotion or XP

Use two ready Day 036 sessions for the same 35/35 user and release concurrent calls.

After settlement:

```text
Day 036 completion count = 1
Day 036 canonical xp_event count = 1
xp_total delta = 500
initiatory_grade = 2
initiatory_title = Iniciado
```

No third state or duplicate promotion event is permitted.

### P36-018 — Chokmah unlock does not auto-start Day 037

After valid Portal completion:

- `current_day = 37` is allowed as the next navigation target;
- no Day 037 `day_completions` row is created automatically;
- no Day 037 Practice Session is created automatically by the completion RPC;
- no Day 037 XP Event exists merely because the Portal succeeded.

This preserves the product boundary: Chokmah unlocked, Day 037 not auto-started.

---

## 8. CROSS-USER ADVERSARIAL CASES

The P0 suite must include attempts where USER_A supplies identifiers belonging to USER_B.

Required assertions:

1. USER_A calls `complete_codex_day` using USER_B's Practice Session ID → `practice_session_not_found` or equivalent non-disclosing failure; USER_B state unchanged.
2. USER_A cannot infer USER_B's Practice Record contents through Crown or completion RPC responses.
3. USER_A Crown state reflects only USER_A completions because `get_kether_crown_state()` executes under invoker security and RLS.

---

## 9. TRANSACTION / FAILURE POST-CONDITIONS

For every rejected completion attempt, assert all of the following unless the test explicitly targets another behavior:

```text
no new day_completion
no new xp_event
no xp_total increment
no initiatory_grade change
no current_chapter/sephira promotion
existing Crown fragments preserved
attempt Practice Session preserved for audit/retry
```

A test that only asserts the error string is insufficient.

---

## 10. CI GATE

Minimum CI rule for this layer:

```text
P0 DB suite fails
      ↓
workflow fails
      ↓
RC1 cannot be declared
```

Every test name must begin with the stable Matrix ID, e.g.:

- `PRC-001 ...`
- `XP-005 ...`
- `CRW-010 ...`
- `P36-015 ...`

Test logs must never print:

- Journal Vault plaintext;
- decrypted private reflections;
- dreams/confessions/prayer text;
- raw private audio.

---

## 11. IMPLEMENTATION ORDER

Recommended order for the Production Lab:

```text
1. RLS tests — PRC-001/002, XP-001/002/003
2. sequence/evidence — DAY-002/005/006/008
3. XP/idempotency — XP-004/005/006
4. Crown — CRW-001/009/010
5. Portal lock — P36-001/002
6. add Portal structural-evidence migration
7. turn P36-012 from RED to GREEN
8. Portal XP/promotion/concurrency — P36-013/014/015/018
9. wire whole P0 DB suite into CI
```

Do not proceed to Kether RC1 with `P36-012` waived.

---

## 12. DEFINITION OF DONE — P0 DB LAYER

This layer is done only when:

- all P0 scenarios above are automated;
- every scenario runs against a fresh isolated migrated database;
- concurrency scenarios truly overlap;
- `P36-012` is GREEN because the backend validates Portal structure;
- repeated runs are deterministic;
- no production user data is used;
- no private plaintext appears in logs;
- the CI workflow fails on any P0 regression;
- parent QA Matrix and issue #7 remain synchronized with the implemented test IDs.
