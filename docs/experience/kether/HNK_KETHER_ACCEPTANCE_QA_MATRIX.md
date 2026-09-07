# HNK KETHER — ACCEPTANCE & QA MATRIX

**Status:** QA Contract v1  
**Scope:** Chapter 1 — Kether / Days 001–036  
**World:** Atziluth  
**Entry grade:** Level 1 — Neófito  
**Exit grade:** Level 2 — Iniciado only after valid Day 036 completion  
**Canonical source of truth:** `Tehkne-Solutions/hnk-codex-365`

> This document converts the approved Kether Experience Architecture into verifiable acceptance criteria. It does not replace canonical Codex content or create new ritual rules.

---

## 1. PURPOSE

Kether is release-ready only when the implementation proves, through repeatable tests, that:

- canonical content is consumed without silent rewriting;
- practice state is reliable across mobile/web/offline/retry;
- XP, Crown fragments and Initiatory Grade cannot drift or duplicate;
- private journal content remains encrypted/private;
- active/control protocols require both sides where canon demands comparison;
- safety interruption is valid data and never treated as spiritual failure;
- E1–E5 remain epistemically distinct in UI and analytics;
- special modules such as audio, Acoustic Lab and AR behave as real product features, not decorative mockups;
- Portal 036 cannot promote prematurely and cannot promote twice.

---

## 2. TEST LEVELS

Each test is classified by one or more levels:

- `UNIT` — pure functions, reducers, validators, parsers.
- `DB` — SQL/RLS/RPC/integrity behavior.
- `INTEGRATION` — app service + Supabase + local storage/audio/device boundary.
- `E2E-WEB` — complete Next.js browser flow.
- `E2E-MOBILE` — complete Expo/React Native device flow.
- `DEVICE` — microphone, camera, headphones, orientation, background/foreground behavior.
- `A11Y` — keyboard, screen reader, reduced motion, contrast, non-visual alternatives.
- `MANUAL` — editorial/visual/safety review that must not be reduced to automation.

Severity:

- `P0` — release blocker / integrity or privacy failure.
- `P1` — major experience or canonical compliance failure.
- `P2` — degraded experience, non-critical.

---

## 3. GLOBAL RELEASE GATES

A Kether Release Candidate cannot be approved while any of these conditions is true:

1. any `P0` test fails;
2. canonical blockers affecting executable content are unresolved;
3. Day 019 ships without functional Acoustic Lab;
4. Day 025 claims AR but only renders a fake 2D overlay without approved fallback semantics;
5. Day 030 lacks the approved ACTIVE/CONTROL audio pair;
6. Portal 036 operators are not canonically defined/versioned;
7. client can write XP, Day Completion or Initiatory Grade directly;
8. decrypted journal text can appear in analytics/logs/network payloads;
9. duplicate completion can duplicate XP or promotion;
10. Chokmah/Day 037 starts automatically after Portal while Chapter 2 production is frozen.

---

## 4. CANON / CONTENT INTEGRITY

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| CAN-001 | P0 | UNIT/INTEGRATION | Day body is rendered from synchronized canonical Markdown/content, not from a rewritten local copy. |
| CAN-002 | P0 | DB/INTEGRATION | App Day number, XP, chapter, Sephira and status match `codex_days` synchronized metadata. |
| CAN-003 | P1 | MANUAL | UI does not silently replace unresolved canonical references with invented symbols, frequencies, names or geometry. |
| CAN-004 | P1 | INTEGRATION | A canonical resync updates source SHA/checksum metadata and does not mutate user Practice Records. |
| CAN-005 | P1 | MANUAL | E1/E2/E3/E4/E5 labels and explanatory language remain faithful to HNK epistemic separation. |
| CAN-006 | P0 | INTEGRATION | Canonical source commit/version used by the client is auditable from the content record. |

---

## 5. DAY STATE MACHINE

Target state model:

`LOCKED → AVAILABLE → ACTIVE → EVIDENCE_PENDING → COMPLETE`

A completed Day may enter `REVISIT` without changing the original canonical completion.

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| DAY-001 | P0 | UNIT/E2E | Day 001 is AVAILABLE for an eligible new Kether user. |
| DAY-002 | P0 | DB/E2E | Day N>1 first completion is blocked when Day N-1 is incomplete. |
| DAY-003 | P1 | E2E | Future Days may be visible but are visually/semantically LOCKED and cannot start a completion session. |
| DAY-004 | P1 | E2E | ACTIVE session can pause/exit without being converted to COMPLETE. |
| DAY-005 | P0 | DB/INTEGRATION | First completion from ACTIVE without required evidence is rejected. |
| DAY-006 | P0 | DB/INTEGRATION | First completion from `evidence_pending`/`complete` with valid evidence can seal exactly once. |
| DAY-007 | P1 | E2E | Interrupted session remains an attempt record and does not erase previous Kether progress. |
| DAY-008 | P0 | DB/E2E | Revisit creates a new Practice Session but not a second Day Completion. |

---

## 6. PRACTICE RECORD / EVIDENCE

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| PRC-001 | P0 | DB | RLS prevents reading another user's Practice Sessions. |
| PRC-002 | P0 | DB | RLS prevents modifying another user's Practice Sessions. |
| PRC-003 | P0 | DB/INTEGRATION | First completion requires non-empty structured evidence. |
| PRC-004 | P1 | INTEGRATION | Safety interruption can be saved as an interrupted session without granting XP. |
| PRC-005 | P1 | E2E | User can record “no sensation”, “no dream recall” or equivalent null/neutral result where allowed without being blocked. |
| PRC-006 | P0 | MANUAL/INTEGRATION | Free autobiographical/spiritual text is not placed in Practice Session evidence/metrics. |
| PRC-007 | P1 | UNIT | Active/control protocols expose a single combined completion contract when canon requires both conditions. |
| PRC-008 | P0 | DB/E2E | Completing only one side of a required ACTIVE/CONTROL pair cannot seal the Day. |

---

## 7. XP / COMPLETION / IDEMPOTENCY

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| XP-001 | P0 | DB | Authenticated client cannot directly INSERT/UPDATE/DELETE `xp_events`. |
| XP-002 | P0 | DB | Authenticated client cannot directly INSERT/UPDATE/DELETE `day_completions`. |
| XP-003 | P0 | DB | Authenticated client cannot directly mutate `user_progress` grade/XP state. |
| XP-004 | P0 | DB/INTEGRATION | `complete_codex_day` awards canonical XP exactly once on first valid completion. |
| XP-005 | P0 | DB | Two concurrent valid completion requests award XP at most once. |
| XP-006 | P0 | DB/E2E | Revisit returns `xp_awarded = 0`. |
| XP-007 | P1 | INTEGRATION | XP amount comes from canonical Day metadata, not hardcoded client constants. |
| XP-008 | P1 | E2E | UI can display high cumulative XP while still showing Grade 1 — Neófito before Portal 036. |

---

## 8. COROA / FRAGMENTS

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| CRW-001 | P0 | DB/UNIT | Fragment state is derived from completed Days; no client-written Crown currency exists. |
| CRW-002 | P1 | E2E | Fragment I lights only after Days 001–005 are all complete. |
| CRW-003 | P1 | E2E | Fragment II lights only after Days 006–010 are all complete. |
| CRW-004 | P1 | E2E | Fragment III lights only after Days 011–015 are all complete. |
| CRW-005 | P1 | E2E | Fragment IV lights only after Days 016–020 are all complete. |
| CRW-006 | P1 | E2E | Fragment V lights only after Days 021–025 are all complete. |
| CRW-007 | P1 | E2E | Fragment VI lights only after Days 026–030 are all complete. |
| CRW-008 | P1 | E2E | Fragment VII lights only after Days 031–035 are all complete. |
| CRW-009 | P0 | DB/E2E | Portal 036 remains locked at 34/35 completed Days. |
| CRW-010 | P0 | DB/E2E | Portal 036 becomes available at 35/35 and Coroa 7/7, while user remains Neófito. |

---

## 9. JOURNAL VAULT / PRIVACY

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| VLT-001 | P0 | DB/MANUAL | No plaintext journal column exists in the remote Vault model. |
| VLT-002 | P0 | INTEGRATION | Server receives ciphertext/nonce/AAD/crypto metadata only for private journal payloads. |
| VLT-003 | P0 | MANUAL | Decrypted journal, dreams, confessions, prayer text or vocal transcription never appear in analytics. |
| VLT-004 | P0 | MANUAL/INTEGRATION | Crash/error logs do not include decrypted private text. |
| VLT-005 | P1 | E2E | User can complete operational evidence while optional private reflection stays in the Vault. |
| VLT-006 | P1 | E2E | Portal review is read-only over old records; it cannot rewrite Days 001–035 to improve the ascent narrative. |

---

## 10. SAFETY / REVERSIBILITY

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| SAF-001 | P0 | E2E | Focus/trance experiences expose pause/stop/return controls. |
| SAF-002 | P0 | E2E | `safety_stop` never erases earlier completed Days or Crown fragments. |
| SAF-003 | P1 | MANUAL | UI never rewards tolerating pain, breathing difficulty, dangerous immobility, disorientation or “invulnerability”. |
| SAF-004 | P1 | E2E | Movement for comfort/safety in stillness protocols is accepted as valid data, not moral/spiritual failure. |
| SAF-005 | P1 | E2E | Achaiah return gates require explicit orientation/movement/clarity before completion where specified. |
| SAF-006 | P0 | PORTAL/E2E | Portal attempt with unresolved blocking safety state cannot promote. |

---

## 11. EPISTEMIC PRODUCT RULES

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| EPI-001 | P1 | MANUAL | User-reported sensation is not rendered as biomedical proof. |
| EPI-002 | P1 | MANUAL | Acoustic signal features are not rendered as proof of spiritual origin, brain state or angelic harmonic. |
| EPI-003 | P1 | MANUAL | AR/camera output is not described as detecting Prana/Ki, aura or spiritual presence. |
| EPI-004 | P1 | MANUAL | Active/control differences are displayed as protocol observations, not automatic causal proof. |
| EPI-005 | P1 | MANUAL | Oracular transitions are framed as Codex/traditional language, not deterministic future prediction. |

---

## 12. AUDIO QA

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| AUD-001 | P0 | MANUAL/INTEGRATION | Ambiguous canonical audio values remain `PRESET_PENDING` rather than silently normalized by client code. |
| AUD-002 | P1 | DEVICE | User controls volume; no forced maximum volume. |
| AUD-003 | P1 | DEVICE | Pause/stop/background/foreground transitions do not leave uncontrolled playback. |
| AUD-004 | P1 | A11Y | Audio-led practice provides usable non-animated textual/timer guidance. |
| AUD-005 | P0 | DEVICE/E2E | Day 030 ACTIVE/CONTROL use the approved versioned audio pair and both are required for first completion. |
| AUD-006 | P1 | INTEGRATION | Cached approved audio can support the intended offline flow where product capability declares offline support. |

---

## 13. DAY 019 — ACOUSTIC LAB

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| ACO-001 | P0 | DEVICE | Microphone permission is requested contextually, not at app launch without need. |
| ACO-002 | P0 | DEVICE | User can record the canonical session duration target without network dependency where supported. |
| ACO-003 | P1 | DEVICE | Waveform and spectrum/spectrogram represent captured audio rather than fabricated animation. |
| ACO-004 | P1 | DEVICE | Replay is user-controlled. |
| ACO-005 | P0 | MANUAL/INTEGRATION | Raw private audio is excluded from analytics. |
| ACO-006 | P1 | A11Y | Non-animated/tabular summary exists for users who cannot use an animated spectrum. |
| ACO-007 | P1 | E2E | User can delete raw audio independently from structured Practice Record where storage design allows it. |
| ACO-008 | P0 | MANUAL | Analyzer never emits spiritual/diagnostic inference from acoustic features. |

---

## 14. DAY 025 — SPATIAL AR

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| AR-001 | P0 | DEVICE | Camera permission is requested contextually. |
| AR-002 | P0 | DEVICE | Primary supported mobile target performs real spatial anchoring/tracking, not a mislabeled static overlay. |
| AR-003 | P1 | DEVICE | Tracking loss has recover/recenter flow. |
| AR-004 | P1 | DEVICE | Active/control spatial layouts are repeatable enough for comparison. |
| AR-005 | P0 | PRIVACY/MANUAL | Video/camera frames are not persisted or sent to analytics by default. |
| AR-006 | P1 | E2E | Camera denial preserves prior progress and does not silently mark Day complete. |
| AR-007 | P1 | MANUAL | UI provides physical-space safety guidance while user moves. |
| AR-008 | P0 | CAN/MANUAL | Canonical symbol/geometry is not invented while Dai Koo Myo reference remains unresolved. |

---

## 15. ACCESSIBILITY

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| A11Y-001 | P1 | A11Y | Core web flow is keyboard navigable. |
| A11Y-002 | P1 | A11Y | Buttons/state changes have meaningful accessible names. |
| A11Y-003 | P1 | A11Y | Reduced-motion preference removes or simplifies non-essential ritual animations without blocking completion. |
| A11Y-004 | P1 | A11Y | Color alone is never the only indicator of LOCKED/AVAILABLE/COMPLETE/Crown state. |
| A11Y-005 | P1 | A11Y | Timers/focus states have readable text equivalents. |
| A11Y-006 | P1 | A11Y | Portal ceremony has a reduced-motion route with the same canonical state result. |

---

## 16. OFFLINE / SYNC / MULTI-DEVICE

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| OFF-001 | P1 | E2E | A local Practice Session can be created offline with stable `client_session_id`. |
| OFF-002 | P0 | INTEGRATION | On reconnect, server determines whether completion is first completion or already completed/revisit. |
| OFF-003 | P0 | DB | Same Day completed from two devices cannot duplicate Day Completion or XP. |
| OFF-004 | P1 | E2E | Sync failure preserves local unsynced evidence and offers retry rather than silently discarding it. |
| OFF-005 | P1 | E2E | UI distinguishes local pending state from server-confirmed canonical completion. |
| OFF-006 | P0 | PORTAL/E2E | Offline Portal completion remains `PROMOTION_PENDING_SYNC`; ceremony/promotion title is not finalized before backend confirmation. |

---

## 17. PORTAL 036 — BOSS ACCEPTANCE

| ID | Sev | Level | Acceptance |
|---|---|---|---|
| P36-001 | P0 | DB/E2E | Portal cannot start as valid exam before 35/35. |
| P36-002 | P0 | E2E | Coroa 7/7 alone does not change Grade. |
| P36-003 | P0 | CAN/MANUAL | Final production Portal does not use invented Sintonizador/Solfeggio/sigil references. |
| P36-004 | P1 | E2E | Pre-flight confirms interruption agency, environment/readiness and required local resources. |
| P36-005 | P0 | E2E | Condition A includes approved Portal sequence and explicit Return Gate A. |
| P36-006 | P0 | E2E | Condition B excludes Portal operators and ends with Return Gate B. |
| P36-007 | P1 | E2E | Portal/base comparison is stored before Promotion Review. |
| P36-008 | P1 | E2E | Review Lens identifies 3 consolidated + 3 fragile competencies without modifying historical records. |
| P36-009 | P1 | E2E | Attribute evidence flow records seven evidence selections/markers without inventing automatic attribute gains. |
| P36-010 | P0 | VLT/E2E | Kether synthesis free text is stored only through the encrypted Vault path. |
| P36-011 | P1 | E2E | Readiness rating is visible as subjective data but not used as the sole promotion threshold. |
| P36-012 | P0 | DB | Day 036 completion requires all structural promotion evidence. |
| P36-013 | P0 | DB | Valid Day 036 completion awards exactly +500 XP once. |
| P36-014 | P0 | DB | Valid Day 036 completion atomically sets `initiatory_grade = 2`, `initiatory_title = Iniciado`. |
| P36-015 | P0 | DB | Repeated/concurrent Day 036 RPC calls cannot promote twice or add XP twice. |
| P36-016 | P0 | E2E | Ceremony runs only after backend confirms successful canonical completion/promotion. |
| P36-017 | P1 | E2E | Ceremony presents Fehu→Uruz, Louco→Mago and Hexagrama 1→2 as Codex/oracular transition language. |
| P36-018 | P0 | E2E | Chokmah becomes unlocked after promotion, but Day 037 does not auto-start. |

---

## 18. DAILY COVERAGE MAP — DAYS 001–036

This table does not restate canonical ritual content. It identifies the minimum QA focus for each Day implementation.

| Day | Cycle | Primary QA focus |
|---:|---|---|
| 001 | Vehuiah | vertical-slice shell, intention/baseline, Vault creation, first XP |
| 002 | Vehuiah | stillness timer, impulse logging, safe movement |
| 003 | Vehuiah | structured belief/model record separated from private text |
| 004 | Vehuiah | before/after evidence, no causal overclaim |
| 005 | Vehuiah | safe closing action, Fragment I only at 5/5 |
| 006 | Jeliel | sound observation, unresolved audio semantics stay pending |
| 007 | Jeliel | voluntary relaxation, reversibility |
| 008 | Jeliel | countdown/depth as self-report, no competition |
| 009 | Jeliel | pre-sleep/morning capture; “no recall” valid; sleep not gamified |
| 010 | Jeliel | anchor active/control, cancel/reversibility, Fragment II |
| 011 | Sitael | observation vs judgment; no premature cycle completion |
| 012 | Sitael | focus/fire safety, ocular comfort |
| 013 | Sitael | arithmetic focus without speed leaderboard |
| 014 | Sitael | internal visualization support, grounding |
| 015 | Sitael | safe symbolic closure, tearing option valid, Fragment III |
| 016 | Elemiah | perception/label distinction |
| 017 | Elemiah | optional voluntary vocalization, privacy |
| 018 | Elemiah | body map accepts weak/none sensation |
| 019 | Elemiah | real Acoustic Lab, local/private signal analysis |
| 020 | Elemiah | post-vocalization vs quiet comparison, return, Fragment IV |
| 021 | Mahasiah | breath/axis visualization, neutral result accepted |
| 022 | Mahasiah | canonical Dai Koo Myo reference required for publication |
| 023 | Mahasiah | ACTIVE/CONTROL single completion contract |
| 024 | Mahasiah | sequence comparison and no energetic proof claim |
| 025 | Mahasiah | real spatial AR + control + camera privacy, Fragment V |
| 026 | Lelahel | frontal focus vs control; Ajna/BA10 not conflated |
| 027 | Lelahel | blue vs gray visualization comparison; eye safety |
| 028 | Lelahel | Gneo Geo canonical reference pending; no invented circuits |
| 029 | Lelahel | identity ≠ pattern, safe symbolic closure, follow-up data |
| 030 | Lelahel | approved ASMR/control pair, auditory comfort, Fragment VI |
| 031 | Achaiah | analysis/surrender, orientation return |
| 032 | Achaiah | elevator vs countdown, no pain/anesthesia testing |
| 033 | Achaiah | voluntary stillness, safety movement, motor return |
| 034 | Achaiah | sign-anchor vs control, explicit cancellation |
| 035 | Achaiah | ritual/control, no invented pentagram, prudence, Fragment VII |
| 036 | Portal | full boss gate, comparison, review, Vault synthesis, atomic promotion |

---

## 19. AUTOMATION TARGETS

### Must be automated before RC1

- sequential Day gating;
- evidence-required first completion;
- active/control completion validation where modeled structurally;
- RLS ownership tests;
- direct-write denial for XP/completions/progress;
- XP idempotency/concurrency;
- Crown derivation;
- Portal 35/35 gate;
- Day 036 atomic promotion;
- revisit `xp_awarded = 0`;
- offline sync conflict handling at service level;
- canonical metadata loading;
- Day 037 not auto-started.

### Must include real-device/manual validation

- audio loudness/stop/background behavior;
- microphone permission and Acoustic Lab;
- AR tracking/recovery/privacy;
- reduced motion and screen-reader flows;
- long-session thermal/battery behavior on representative devices;
- ritual readability/legibility in dark environments;
- safety copy and grounding clarity;
- epistemic wording review.

---

## 20. RC1 EXIT CRITERIA

Kether RC1 may be declared only when:

- all 36 Days have executable flows or explicitly approved canonical fallbacks;
- all P0 tests pass on backend + web + primary mobile target as applicable;
- all P1 failures have documented disposition and no canonical/safety/privacy blocker remains;
- canonical blockers #3/#4/#8/#11/#12/#14 are resolved wherever they block executable production content;
- app blockers #1/#3/#4/#5/#6 are resolved or superseded by accepted implementation;
- Supabase schema/data match the app types;
- no unresolved security advisor finding represents an unmitigated risk;
- CI is green;
- a clean test user can complete the journey from Kether entry through Day 036 and finish as:

```text
KETHER 36/36
COROA 7/7
XP TOTAL = canonical accumulated result
LEVEL 2 — INICIADO
CHOKMAH UNLOCKED
DAY 037 NOT AUTO-STARTED
```

---

## 21. QA PRINCIPLE

Kether QA is not a test of whether a user reports extraordinary experiences.

It is a test of whether the HNK platform reliably preserves:

`CÂNONE → AGÊNCIA → EXECUÇÃO → EVIDÊNCIA → PRIVACIDADE → COMPARAÇÃO → RETORNO → PROGRESSÃO`

If those properties remain intact from Day 001 through Portal 036, the product is behaving according to the approved Kether Experience Architecture.
