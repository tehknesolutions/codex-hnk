# HNK Binah — Portal 109 Executable Spec V1

**Status:** executable architecture contract / production transition still blocked  
**Scope:** Day 109 · end of Binah / end of Atziluth  
**Source draft:** `content/editorial/binah-drafts/dia-109.md`  
**Editorial batch:** `docs/experience/binah/editorial/HNK_BINAH_PORTAL_109_BATCH_V1.md`  
**Safety disposition:** `docs/experience/binah/HNK_BINAH_PORTAL109_SAFETY_DISPOSITION_V1.md`  
**Tracking:** Issue #17

## 1. Purpose

Separate the parts of Portal 109 that can be implemented/tested now from the canonical operators and progression decisions that remain unresolved.

This contract does not invent:

- an Angelic Psalm Tuner preset;
- a Saturn→Jupiter carrier/base or binaural difference;
- a transition sigil/visual variant;
- a post-Binah grade/title;
- whether the canonical next progression target is primarily a **Sephira transition to Chesed**, a **world transition toward Beriah**, or a formally defined combination of both.

Those decisions require explicit canonical approval.

## 2. Current backend fact

The applied Atziluth progression migration already enforces the Day 109 prerequisite:

```text
Day 109 requires exactly 35 prior Binah completions: Days 074–108.
```

However, the current `public.complete_codex_day(...)` progression logic contains explicit grade/chapter/sephira transitions only for:

```text
Day 036 → Grade 2 / Iniciado / Chokmah
Day 073 → Grade 3 / Teurgo / Binah
```

There is currently no equivalent `p_day = 109` promotion branch after XP/completion insertion.

**Therefore Portal 109 production release is blocked until the post-Binah authoritative transition is defined and implemented server-side.**

## 3. Canonical reference blockers

Hard production blockers remain:

1. approved Angelic Psalm Tuner preset/asset with provenance/checksum;
2. approved Saturn→Jupiter transition audio semantics without inferred carrier/difference;
3. approved transition visual/sigil assets and orientation/version provenance;
4. explicit canonical post-Binah progression target/state.

The paper-burning safety subgate is no longer a blocker: the approved no-fire product closure is defined separately.

## 4. Pre-flight / eligibility

A canonical Portal 109 attempt may become eligible only when authoritative state proves:

- Days 074–108 are all canonically complete;
- Day 109 exists as canonical successor content;
- all mandatory production operator versions are approved and resolvable;
- the Portal evidence schema version is supported;
- the encrypted synthesis/Vault path is available;
- Return/Safety state permits the flow;
- post-Binah transition target/version is approved by the backend contract.

Client-rendered progress is never sufficient authority.

## 5. Visible canonical sequence

When all references and transition semantics are approved, the production flow must preserve the source-level structure:

```text
Portal pre-flight
→ Binah synthesis / Espelho Astral da Alma
→ approved Angelic Psalm Tuner
→ approved Saturn→Jupiter transition operator
→ approved critical-factor-reduction / induction sequence
→ approved visual/sigil operator(s), when required
→ written synthesis closure
→ no-fire closure by default (or separately reviewed optional fire path)
→ voluntary Return Gate
→ encrypted Vault receipt
→ structural Portal evidence submission
→ authoritative server transaction
→ +500 XP exactly once
→ approved post-Binah transition exactly once
```

No unresolved operator may be replaced silently.

## 6. Encrypted synthesis contract

Intimate synthesis belongs to the encrypted Vault.

Required behavior:

- plaintext synthesis is never stored in progression tables;
- plaintext is excluded from analytics/logs/error telemetry;
- server-side progression receives only structural evidence and encrypted payload receipt/reference;
- offline retry stores encrypted/local pending state without duplicating plaintext;
- completion failure must never cause a fallback plaintext upload.

## 7. Structural evidence

The authoritative completion operation must be able to verify at minimum:

- `day = 109`;
- evidence schema version;
- Tuner version/reference id;
- Saturn→Jupiter transition preset/version id;
- required visual/sigil version ids where applicable;
- induction/critical-factor-reduction structural checkpoint;
- written synthesis closure checkpoint;
- no-fire or approved-fire closure mode;
- Return Gate confirmation;
- encrypted Vault receipt/reference;
- attempt/session id;
- idempotency key;
- server-resolved Binah 35/35 eligibility;
- approved post-Binah progression contract version.

A merely non-empty evidence object is insufficient.

## 8. Atomic Portal 109 transaction

Once the canonical target is approved, one server-authoritative transaction must perform all final effects or none:

```text
complete Day 109
+ award +500 XP exactly once
+ persist Portal completion exactly once
+ apply approved post-Binah grade/title/world/sephira state exactly once
+ unlock only the approved next content boundary
+ do not auto-start the next Day/realm
```

The exact values of grade/title/world/sephira are intentionally **UNRESOLVED** in this V1. They must not be inferred from the issue title or from traditional Tree-of-Life ordering.

## 9. Transition naming mismatch gate

Current project sources use two non-identical descriptions:

- Issue #17 title: `Binah→Chesed`;
- reviewed Day 109/batch: closure of Atziluth and symbolic preparation/movement toward `Beriah`.

These are different axes:

- `Chesed` is a Sephira label;
- `Beriah` is a world label.

This spec does not decide whether the product transition should update one, the other, or both. Before implementing the server mutation, create an explicit canonical decision that freezes:

```text
next initiatory grade
next initiatory title
next current world
next current sephira
next chapter/content boundary
next Day identifier or non-Day landing state
whether next content auto-starts (default: NO)
```

## 10. Idempotency and concurrency

### P109-IDEM-001 — duplicate submit

Repeated valid requests must produce one Day 109 completion, one +500 XP event and one post-Binah transition.

### P109-IDEM-002 — concurrent submit

Concurrent requests converge to one authoritative transaction. No duplicate XP, promotion history or unlock state.

### P109-IDEM-003 — lost response / retry

If the server committed but the client lost the response, retry with the same idempotency identity reconciles the existing result.

## 11. Offline semantics

If the ritual flow finishes offline:

- local evidence may become `pending_sync`;
- no new canonical grade/title/world/sephira is displayed as final from local state alone;
- encrypted synthesis remains protected;
- retry preserves idempotency;
- the post-Binah ceremony appears only after authoritative confirmation.

## 12. Return / safety boundary

A blocking Safety Stop or failed Return Gate:

- preserves Days 074–108;
- does not award canonical +500 XP;
- does not apply the post-Binah transition;
- may preserve a non-canonical attempt record;
- never requires fire;
- never treats interruption as spiritual failure.

## 13. E2E matrix

| ID | Scenario | Required result |
|---|---|---|
| P109-001 | fewer than 35 prior Binah Days | `binah_portal_locked`; no reward |
| P109-002 | operator unresolved | production Portal blocked |
| P109-003 | transition target unresolved | production promotion blocked |
| P109-004 | incomplete evidence | server rejects completion |
| P109-005 | synthesis plaintext reaches operational storage | test fails |
| P109-006 | safe no-fire closure | same progression eligibility as approved closure path |
| P109-007 | double submit | +500 / transition once |
| P109-008 | concurrent submit | one authoritative result |
| P109-009 | offline completion | pending only; no final promotion |
| P109-010 | retry after commit | reconcile existing result |
| P109-011 | failed Return Gate / Safety Stop | no Portal reward/promotion |
| P109-012 | successful completion | next approved boundary unlocked, not auto-started |
| P109-013 | client forges target grade/world | server ignores/rejects forged canonical state |

## 14. Engineering that can proceed now

Allowed with explicit `TEST_ONLY` fixtures:

1. Portal 109 state machine;
2. structural evidence types/validators;
3. encrypted Vault receipt integration;
4. idempotency/concurrency harness;
5. offline `pending_sync` reconciliation;
6. no-fire closure UI;
7. negative E2E tests;
8. backend test proving current code lacks post-109 promotion and therefore must remain release-blocked.

Must wait for canonical decisions:

1. production audio operator bindings;
2. production visual/sigil bindings;
3. final post-Binah grade/title/world/sephira mutation;
4. canonical Day 109 promotion to source;
5. release E2E sign-off.

## 15. Issue #17 status after this spec

```text
paper/fire safety subgate            RESOLVED
no-fire closure                      APPROVED
Binah 35/35 prerequisite             ALREADY IMPLEMENTED
Vault/privacy contract               DEFINED
idempotency/offline contract         DEFINED
post-109 backend promotion            MISSING / BLOCKED
Chesed-vs-Beriah transition semantics UNRESOLVED
Tuner reference                      BLOCKED
Saturn→Jupiter audio                 BLOCKED
visual/sigil references              BLOCKED
production release                   BLOCKED
```

Issue #17 remains OPEN.
