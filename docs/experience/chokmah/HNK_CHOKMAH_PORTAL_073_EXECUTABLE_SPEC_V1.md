# HNK Chokmah — Portal 073 Executable Spec V1

**Status:** executable architecture contract / production canonical operators still blocked  
**Scope:** Day 073 · Chokmah → Binah · `Level 2 — Iniciado` → `Level 3 — Teurgo`  
**Source draft:** `content/editorial/chokmah-drafts/dia-073.md`  
**Editorial batch:** `docs/experience/chokmah/editorial/HNK_CHOKMAH_PORTAL_072_073_BATCH_V1.md`  
**Tracking:** Issue #19

## 1. Intent

Separate the Portal 073 work that can be implemented safely now from the canonical-reference work that must remain blocked. This contract deliberately reuses the server-authority, return-gate, privacy, idempotency and offline principles already established by Portal 036 without copying Kether-specific ritual operators into Chokmah.

No generic frequency, lookalike sigil or client-side promotion may satisfy this contract.

## 2. Production reference blockers

The following remain unresolved and are **hard production blockers**:

1. approved Angelic Psalm Tuner preset for the Portal;
2. exact Chokmah→Binah Solfeggio transition definition without invented carrier/base frequency;
3. canonical primary Magician sigil asset, orientation and provenance/checksum.

Until all three are approved/versioned, production UI must present Portal 073 as canonically unavailable even if non-production fixtures exist for engineering tests.

## 3. Preconditions

A canonical completion request for Portal 073 is eligible only when the authoritative backend confirms:

- Days 037–072 required by the Chokmah path are canonically complete under the active progression contract;
- Day 073 has not already granted its canonical completion reward;
- the user is currently eligible for the Chokmah→Binah transition;
- the required Portal reference versions are production-approved;
- no blocking safety/return state is active;
- evidence schema version is supported by the server.

Client UI state is never sufficient authority.

## 4. Canonical visible sequence

When references are approved, the supported production sequence is:

```text
Portal pre-flight
→ Angelic Psalm Tuner
→ approved Chokmah→Binah transition preset
→ Dave Elman auto-induction
→ primary Magician sigil
→ voluntary Return Gate
→ encrypted synchronicity-note upload
→ structural evidence submission
→ authoritative server completion
→ +500 XP exactly once
→ Iniciado → Teurgo exactly once
→ Binah / Day 074 unlocked
→ Day 074 NOT auto-started
```

The current draft does not supply enough information to synthesize the missing audio/sigil operators. Fixtures may model the state machine but must be clearly `TEST_ONLY`.

## 5. Privacy / Vault contract

The synchronicity diary is private content.

Required behavior:

- diary plaintext is encrypted before remote persistence using the approved Vault path;
- plaintext is excluded from analytics, structured operational evidence, console logging and error telemetry;
- canonical progression stores only the minimum structural evidence necessary to prove the required flow;
- retry/offline state may reference encrypted payload identifiers, never duplicate diary plaintext into a progression table;
- failure to upload private content must not expose it while reporting the error.

## 6. Structural evidence contract

The exact SQL/TypeScript schema may evolve, but the authoritative completion call must be able to establish at minimum:

- `day = 73`;
- Portal evidence schema version;
- canonical operator version identifiers for Tuner, transition preset and Magician sigil;
- induction completed flag/structured checkpoint;
- Return Gate confirmed after the practice;
- encrypted Vault upload receipt/reference without plaintext;
- attempt/session id;
- client idempotency key;
- prior Chokmah completion eligibility resolved server-side.

A non-empty JSON object is not sufficient evidence.

## 7. Atomic progression transaction

One authoritative server transaction must guarantee:

```text
complete Day 073
+ add canonical +500 XP once
+ promote grade 2 → grade 3 once
+ set title Iniciado → Teurgo once
+ mark Binah available
+ mark Day 074 available
+ do NOT create Day 074 practice start/completion
```

If any mandatory condition fails, none of those canonical progression effects may be partially committed.

## 8. Idempotency and concurrency

### P73-IDEM-001 — repeated request

Submitting the same valid completion request twice must produce one canonical completion, one +500 XP grant and one grade promotion.

### P73-IDEM-002 — concurrent requests

Two simultaneous valid requests for the same user/session must converge to one authoritative outcome. No duplicated XP, title history or unlock rows.

### P73-IDEM-003 — network retry after committed server response was lost

Retry with the same idempotency identity must return/reconcile the existing completion rather than grant a second reward.

## 9. Offline behavior

If the practice is completed while network confirmation is unavailable:

- local evidence may remain `pending_sync`;
- the UI must not display canonical `Teurgo` as finalized solely from local state;
- encrypted Vault material remains protected;
- sync retry must preserve idempotency;
- once the server confirms, the client reconciles to the authoritative state;
- Day 074 may become available only after server authority confirms the Portal transition.

## 10. Return / safety boundary

Before encrypted upload and canonical progression submission, the experience requires an explicit Return Gate appropriate to Portal 073. It must confirm that the active ritual/induction phase has ended and that the user has voluntarily returned/oriented enough to proceed.

A blocking stop:

- preserves prior Chokmah progress;
- grants no +500 canonical XP;
- grants no Teurgo promotion;
- does not auto-start Day 074;
- may preserve a non-canonical attempt record for later review without punitive language.

## 11. E2E acceptance matrix

| ID | Scenario | Expected canonical result |
|---|---|---|
| P73-001 | prior Chokmah requirement missing | Portal rejected; no reward/promotion |
| P73-002 | production operator unresolved | production Portal blocked; no substitute |
| P73-003 | incomplete structural evidence | server rejects completion |
| P73-004 | diary upload attempted in plaintext | test must fail |
| P73-005 | successful encrypted upload + valid evidence | eligible for atomic completion |
| P73-006 | double submit | +500 and promotion once |
| P73-007 | concurrent submit | one authoritative result |
| P73-008 | offline completion | pending only; no canonical Teurgo locally |
| P73-009 | server confirms after retry | reconcile exactly once |
| P73-010 | successful Portal | Binah/074 available; Day 074 not started |
| P73-011 | safety/return stop | prior progress preserved; no Portal reward |
| P73-012 | client forges grade/title | server state remains authoritative |

## 12. Implementation packages

The following engineering can proceed before reference approval:

1. define Portal 073 evidence type and validators;
2. define server-side atomic/idempotent progression operation;
3. implement encrypted Vault receipt integration;
4. implement `pending_sync` reconciliation;
5. implement Portal state machine using `TEST_ONLY` operator fixtures;
6. implement E2E negative tests for reference absence, plaintext leakage, duplicate reward and premature Day 074 start.

The following must wait for canonical approval:

1. production Tuner preset binding;
2. production transition-audio binding;
3. production Magician sigil binding;
4. final canonical Portal 073 release sign-off.

## 13. Issue #19 status after this spec

```text
server authority contract         DEFINED
privacy boundary                  DEFINED
offline semantics                 DEFINED
idempotency/concurrency contract  DEFINED
Day 074 no-auto-start             DEFINED
production Tuner reference        BLOCKED
production transition preset      BLOCKED
production Magician sigil         BLOCKED
runtime implementation            PENDING
E2E execution                     PENDING

Issue #19 remains OPEN, but is no longer an undifferentiated blocker.
```
