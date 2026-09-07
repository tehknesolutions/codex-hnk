# HNK KETHER — P0 PORTAL 036 E2E EXECUTABLE SPEC

**Status:** Executable QA Contract v1  
**Scope:** Day 036 boss / rite of passage  
**Parent contract:** `docs/experience/kether/HNK_KETHER_ACCEPTANCE_QA_MATRIX.md`  
**Portal design:** `docs/experience/kether/HNK_KETHER_PORTAL_036_SPEC.md`  
**DB companion:** `docs/experience/kether/qa/HNK_KETHER_P0_DB_EXECUTABLE_SPEC.md`  
**Sync companion:** `docs/experience/kether/qa/HNK_KETHER_P0_SYNC_OFFLINE_EXECUTABLE_SPEC.md`

> This E2E contract verifies that the user-visible Portal honors the same backend rules as the database. It must not substitute UI state for canonical server authority.

---

## 1. RELEASE BLOCKERS BEFORE PRODUCTION E2E

The Portal may be implemented/tested with explicit non-production fixtures, but production RC1 remains blocked until canonical references are approved/versioned for:

- Sintonizador Angelical;
- Solfeggio de transição;
- sigilo de Kether.

Test fixtures must be labeled test-only and must never be published as canonical substitutes.

`P36-012` is also expected RED until the backend validates the complete structural Portal evidence schema.

---

## 2. TARGET PLATFORMS

The Portal must have equivalent canonical outcomes on:

- `E2E-WEB` — Next.js browser flow;
- `E2E-MOBILE` — Expo / React Native device flow.

Platform-specific rendering is allowed. Progression semantics are not.

Minimum parity assertions:

```text
same gate
same evidence contract
same backend completion RPC
same +500 canonical XP
same Neófito → Iniciado transition
same no-auto-start Day 037 rule
```

---

## 3. P36-001 — PORTAL LOCKED BEFORE 35/35

### Fixture

User has exactly 34 of Days 001–035 complete.

### Steps

1. open Kether journey;
2. navigate to Portal 036 entry;
3. inspect Crown/Portal state;
4. attempt to start the Portal through all exposed UI entry points, including deep link if supported.

### Expected

- Portal is semantically LOCKED;
- missing/incomplete Day information is visible without exposing private content;
- user remains `Level 1 — Neófito`;
- no valid Portal Practice Session begins;
- no Day 036 completion exists;
- no +500 XP exists;
- direct/deep-link bypass cannot create a valid completion;
- server rejection remains authoritative if UI state is stale.

---

## 4. P36-002 — COROA 7/7 DOES NOT PROMOTE

### Fixture

Days 001–035 complete, Day 036 incomplete.

### Expected entry state

```text
Crown = 7/7
Portal = AVAILABLE
Grade = 1
Title = Neófito
Kether complete = false
```

Assertions:

- Crown-completion celebration may occur;
- `Iniciado` must not appear as canonical grade;
- +500 Portal XP must not appear;
- Chokmah may remain visually beyond the threshold but must not be represented as officially entered through the Portal yet.

---

## 5. PORTAL PRE-FLIGHT

Before Condition A begins, E2E verifies:

- user can stop before entering;
- audio volume remains under user control;
- Portal content/assets required for the supported path are available;
- Journal Vault write path is available or the UI clearly reports that private synthesis cannot yet be saved;
- current Crown/grade state is refreshed from authoritative state when online;
- safety instructions do not imply invulnerability or guaranteed effects.

If a required production canonical operator is unresolved, a production build must not silently substitute another operator.

---

## 6. CONDITION A — PORTAL COMPLETE SEQUENCE

The visible flow must preserve the canonical sequence:

```text
Sintonizador Angelical
→ Solfeggio de transição
→ complete auto-hypnosis induction
→ stable orientation/depth
→ Kether sigil
→ 5 minutes continued gnosis
→ voluntary return
→ immediate structured record
```

E2E assertions:

- current step is understandable without turning the rite into score/combo gameplay;
- pause/stop/exit remains available where safety requires;
- a sequence mistake can be recorded/recovered without GAME OVER language;
- the client records failure/recovery as evidence, not as moral failure;
- completion of Condition A does not yet promote.

---

## 7. RETURN GATE A — P0 SAFETY BOUNDARY

Before the app allows progression to Condition B, verify explicit return/orientation confirmation.

Required user-visible checks may include the Portal-approved equivalents of:

- eyes/open awareness;
- voluntary movement;
- orientation to environment;
- sufficient clarity to continue;
- explicit session-ended acknowledgement.

### SAF-006 integration

If the user triggers a blocking safety stop or cannot confirm return/orientation:

- attempt is preserved;
- Days 001–035 and Crown 7/7 remain preserved;
- no promotion occurs;
- no +500 canonical XP occurs;
- final promotion ceremony does not fire;
- user can attempt again later.

---

## 8. CONDITION B — SESSION BASE

Condition B must visibly omit the Portal operators specified by canon:

- no Sintonizador Angelical;
- no transition Solfeggio;
- no Kether sigil.

It preserves the base induction/gnosis comparison path.

E2E verifies comparable structured fields are captured for Portal vs base without automatically declaring causal proof.

Condition B completion still does not promote by itself.

---

## 9. RETURN GATE B

Same safety principle as Return Gate A.

The longitudinal review remains unavailable until the required return/orientation state is confirmed.

If the flow exits here, prior Kether progress remains intact and Day 036 remains incomplete.

---

## 10. REVIEW 001–035 — READ-ONLY HISTORY

The Portal review UI must read prior Kether records without rewriting them.

### VLT-006 / history integrity

E2E scenario:

1. snapshot selected existing Day records before Portal review;
2. perform the entire review UI;
3. choose competencies/evidence;
4. finish the review;
5. compare original Day records.

Expected:

- old Practice Records/Day Completions are unchanged;
- the review stores new Portal-specific references/selections only;
- private text remains in Vault rather than being copied into plaintext operational fields.

---

## 11. P36-012 — STRUCTURAL PROMOTION EVIDENCE — EXPECTED RED UNTIL BACKEND FIX

### Negative E2E

With 35/35 and a ready Day 036 session, attempt to bypass required review by producing only a minimal non-empty evidence object or by manipulating client state.

Expected final behavior:

- backend rejects the completion;
- no Day 036 completion is inserted;
- no +500 XP is awarded;
- grade remains Neófito;
- ceremony does not fire;
- UI reports incomplete structural requirements without inventing spiritual failure language.

Client-side form validation is useful but insufficient. The test must prove server rejection when client validation is bypassed.

Required structural areas come from the Portal spec:

- Portal condition;
- base condition;
- comparison;
- return/orientation;
- review 001–035;
- 3 consolidated competencies;
- 3 fragile competencies;
- 7 attribute evidence items;
- premature-promotion criterion;
- Kether synthesis;
- Journal update confirmation;
- no blocking safety state.

---

## 12. PRIVATE KETHER SYNTHESIS

The final synthesis asks what Kether taught, what remains investigable and what discipline continues into Chokmah.

E2E privacy assertions:

- free-text synthesis is sent/stored only through the encrypted Vault path;
- operational completion evidence stores only completion markers/references required by the Portal contract;
- plaintext synthesis is absent from analytics, network telemetry and crash logs;
- test logs use synthetic placeholders and never echo decrypted private content.

---

## 13. P36-013 — +500 XP EXACTLY ONCE

### Online happy path

After all structural requirements are satisfied:

1. record `xp_total_before`;
2. submit final Portal completion;
3. wait for backend-confirmed result;
4. assert response/refresh.

Expected:

```text
xp_awarded = 500
xp_total_after = xp_total_before + 500
Day 036 complete = true
```

Repeat/revisit must not display another +500 award.

The E2E should verify both data and visible user feedback.

---

## 14. P36-014 — ATOMIC NEÓFITO → INICIADO CEREMONY

The promotion ceremony may begin only after backend confirmation reports the committed promotion state.

Expected authoritative state:

```text
Day 036 COMPLETE
Kether 36/36
Crown 7/7
initiatory_grade = 2
initiatory_title = Iniciado
current_day = 37
current_chapter = 2
current_sephira = Chokmah
```

User-visible ceremony then communicates transition, responsibility and continuity.

Forbidden visible states:

- ceremony says `Iniciado` while backend still reports Grade 1;
- Day 036 shown complete while account remains officially Neófito after refresh;
- promotion based only on local optimistic state.

---

## 15. P36-015 — DOUBLE SUBMIT / RETRY / CONCURRENCY

### UI double-submit

Trigger rapid repeated final action where technically possible.

### Transport retry

Simulate timeout/unknown result and resubmit.

### Multi-device

Use two devices with valid Portal sessions against the same account.

Expected after reconciliation:

```text
one canonical Day 036 completion
one +500 XP event
one canonical Grade 2 state
```

User experience must not show a second initiation/promotion as if it were a second canonical event.

A revisit may be acknowledged as a new practice, not a second grade transition.

---

## 16. OFF-006 — OFFLINE PORTAL PENDING CONFIRMATION

When supported offline prerequisites are satisfied:

1. disconnect network;
2. complete Portal practice locally;
3. finish local evidence/synthesis;
4. observe final offline state.

Expected before reconnect:

```text
PROMOTION_PENDING_SYNC
canonical title still Neófito
no finalized +500 XP
no final server-confirmed initiation ceremony
```

After reconnect and successful backend confirmation, the final promotion ceremony may run.

If server says Portal was already completed by another device, reconcile without duplicate XP/promotion.

---

## 17. A11Y-006 — REDUCED-MOTION PORTAL PARITY

Run the successful Portal path with reduced motion enabled.

Expected:

- non-essential Crown/Portal animation is simplified or removed;
- all controls and instructions remain available;
- canonical evidence requirements are unchanged;
- backend result is identical;
- successful user still receives exactly one Grade 2 promotion and +500 XP;
- reduced motion is never treated as an inferior ritual outcome.

---

## 18. P36-018 — CHOKMAH UNLOCKED, DAY 037 NOT AUTO-STARTED

After confirmed successful promotion:

Expected UI state:

```text
KETHER COMPLETE
LEVEL 2 — INICIADO
CHOKMAH UNLOCKED
DAY 037 NOT AUTO-STARTED
```

Assertions:

- no Day 037 Practice Session is created by navigation/promotion alone;
- no Day 037 completion exists;
- no Day 037 XP is awarded;
- user is not dropped into an invented Chokmah practice screen;
- if Chapter 2 production is still frozen, show only the approved threshold/locked-next-content state.

---

## 19. REFRESH / REINSTALL REGRESSION

After a successful Portal:

- refresh web page / relaunch mobile app;
- sign out/in if appropriate in test environment;
- reload canonical progression from server.

Expected:

- Grade 2 persists;
- Kether remains complete;
- XP is unchanged from the single award;
- no promotion ceremony replays as a new canonical event unless product intentionally offers a clearly labeled replay;
- Day 037 remains not auto-started.

---

## 20. FAILURE SIDE-EFFECT MATRIX

For every failed Portal attempt before final backend confirmation, assert:

```text
Days 001–035 preserved
Crown 7/7 preserved
Day 036 not canonically complete
+500 XP not granted
Grade remains 1 / Neófito
no final promotion ceremony
attempt evidence preserved when safe/possible
```

This includes:

- safety stop;
- structural evidence rejection;
- transport failure;
- stale client gate;
- server conflict.

---

## 21. E2E AUTOMATION POLICY

The E2E suite should automate deterministic product behavior and leave inherently editorial/visual judgment to manual QA.

Automate:

- gates;
- required-step navigation;
- server responses;
- state transitions;
- privacy transport assertions where testable;
- double-submit/retry;
- offline pending state;
- reduced-motion parity;
- no Day 037 auto-start.

Manual review remains required for:

- sacred visual fidelity;
- wording/tone of responsibility vs superiority;
- approved canonical operator rendering;
- epistemic framing quality.

---

## 22. DEFINITION OF DONE — PORTAL P0 E2E

Portal E2E is done only when:

- `P36-001`, `P36-002`, `P36-012`, `P36-013`, `P36-014`, `P36-015`, `P36-018`, `SAF-006`, `OFF-006` and reduced-motion parity are GREEN on the supported target matrix;
- structural validation is enforced server-side, not only by UI;
- no duplicate XP/promotion occurs under retry/concurrency;
- private synthesis remains encrypted/private;
- offline completion never finalizes Initiated status before confirmation;
- Chokmah unlock never auto-creates/starts Day 037;
- unresolved canonical Portal operators block production RC rather than being silently replaced.
