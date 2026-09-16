# HNK Chokmah — Portal 073 Executable Spec V1

**Status:** canonical operators approved / production publication QA pending  
**Scope:** Day 073 · Chokmah → Binah · `Level 2 — Iniciado` → `Level 3 — Teurgo`  
**Tracking:** Issue #19

## 1. Intent

Freeze the authoritative Portal 073 runtime contract while preserving fail-closed release behavior. Canonical operators are approved; publication is a separate G7/G8 decision.

No generic frequency, lookalike sigil, plaintext diary payload or client-side promotion may satisfy this contract.

## 2. Approved production references

- tuner: `HNK-ANGELIC-TUNER-D073-V1`;
- transition ACTIVE: `HNK-PORTAL073-CHOKMAH-BINAH-ACTIVE-V1`;
- transition CONTROL: `HNK-PORTAL073-CHOKMAH-BINAH-CONTROL-V1`, QA/contract only;
- primary Magician sigil: `HNK-REF-MAGICIAN-MERCURY-V1`;
- evidence schema: `HNK-PORTAL-073-EVIDENCE-V1`.

These references are approved but do not become production-authoritative until the server operator set is explicitly `published` after release QA.

## 3. Preconditions

A canonical completion request is eligible only when the authoritative backend confirms prior Chokmah completion, current transition eligibility, published exact operator versions, supported evidence schema, no blocking return/safety state and no prior canonical Day073 reward.

Client UI state is never sufficient authority.

## 4. Canonical visible sequence

```text
Portal pre-flight
→ Angelic Psalm Tuner
→ approved Chokmah→Binah transition preset
→ Dave Elman checkpoint/induction contract
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

No Psalm number or induction script may be invented when the source does not supply it.

## 5. Privacy / Vault contract

Diary plaintext is encrypted before remote persistence through the approved Vault path. Plaintext is excluded from analytics, operational evidence, progression tables, console logging and error telemetry. Completion evidence may reference only the minimum encrypted receipt/identifier needed by the server.

## 6. Structural evidence contract

The authoritative completion call must establish at minimum: `day=73`; evidence schema version; exact tuner/transition/sigil IDs; induction checkpoint completed; Return Gate confirmed; encrypted same-user Day073 Vault receipt without plaintext; attempt/session ID; idempotency key; and server-resolved prior Chokmah eligibility.

A non-empty JSON object is not sufficient evidence.

## 7. Atomic progression transaction

One authoritative transaction must guarantee:

```text
complete Day 073
+ canonical +500 XP once
+ grade 2 → grade 3 once
+ Iniciado → Teurgo once
+ current_sephira → Binah
+ Day 074 available
+ Day 074 NOT started
```

If any mandatory condition fails, none of those canonical effects may partially commit.

## 8. Idempotency / concurrency / retry

Repeated, concurrent and post-network-loss retries must converge to one authoritative completion, one +500 XP grant and one promotion. Offline completion may remain `pending_sync`; it must not finalize Teurgo locally before server confirmation.

## 9. Return / safety boundary

A voluntary Return Gate must end the active practice before encrypted upload and canonical completion. A blocking stop preserves prior Chokmah progress, grants no Portal XP/promotion and does not auto-start Day074.

## 10. Release acceptance

Before `portal_operator_sets(73)` may change from `approved` to `published`, current release QA must actually execute and prove:

- Day045 final validator + Expo execution + interactive/listening/device QA;
- Portal audio/static/type validators;
- Web/Native runtime lifecycle and Safety Stop;
- encrypted Vault receipt → completion path without plaintext;
- genuinely simultaneous independent completion requests;
- +500 XP / Teurgo exactly once;
- Day074 unlock without auto-start.

Implementation, code review, historical transaction proofs and Web-only build evidence do not substitute for these executions.

## 11. Current state

```text
canonical references              APPROVED
server authority contract         DEFINED
privacy boundary                  DEFINED
idempotency/concurrency contract  DEFINED
Day074 no-auto-start              DEFINED
upstream Day045 final QA          LOCKED
operator set                      APPROVED_NOT_PUBLISHED
G7/G8 runtime execution           PENDING
production Portal                 FAIL_CLOSED
```
