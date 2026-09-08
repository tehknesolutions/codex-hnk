# HNK CODEX — ATTRIBUTE PROGRESSION MATRIX V1

**Status:** FROZEN V1  
**Scope:** Kether / Days 001–036  
**Matrix ID:** `HNK-ATTRIBUTE-PROGRESSION-MATRIX-V1`

## Separation of systems

`XP != Initiatory Grade != Attribute != Track Mastery`

- XP remains canonical completion score loaded from `codex_days`.
- Initiatory Grade changes only at approved Portals.
- Attributes are slow-moving training indicators on a 1–20 scale.
- Track Mastery remains a separate progression dimension and is not derived from attribute totals.

## Attribute semantics

| Code | Player-facing label |
|---|---|
| HIP | Autorregulação & Linguagem |
| VNT | Perseverança & Vontade |
| PER | Percepção & Observação |
| SIN | Significado & Sintonia |
| BIO | Corpo & Sensibilidade |
| INT | Conhecimento & Sistemas |
| DIS | Prática & Constância |

These values represent trained affinity / practice history. They do not measure spiritual worth, paranormal ability, holiness, intelligence, health, diagnosis or metaphysical power.

## V1 progression rule

1. Scale is 1–20.
2. Onboarding baseline remains 5 with the previously defined 15-point distribution pool.
3. A first canonical completion can award at most **+1 total attribute point**.
4. Revisits award zero attribute points.
5. Secondary attributes are descriptive in V1 and award zero.
6. A gain is legal only when the matrix row is versioned and `FROZEN`.
7. A subjective phenomenon is never sufficient evidence for a gain.
8. Visions, energy sensations, trance depth, dream recall, glossolalia intensity and other extraordinary reports never increase attributes by themselves.
9. XP does not multiply attribute gain.
10. Initiatory Grade does not multiply attribute gain.
11. Values saturate at 20 and never overflow.
12. Portal 036 changes Grade/unlocks Chokhmah and gives **no attribute point** in V1.
13. Every applied point must create an idempotent server-side attribute event.

## Kether cadence

Kether V1 contains **14 possible attribute gains across 36 Days**, deliberately slower than XP progression. This avoids reaching the 1–20 cap early in the 365-day journey.

The cadence is a **product progression decision**, not a canonical metaphysical claim. The matrix records its basis per row:

- `CANON_EXPLICIT`: Canon directly names the attribute outcome.
- `CANON_EPISTEMIC`: Canon describes a measurable competence that maps to an attribute.
- `EXPERIENCE_MATRIX`: mapping comes from the Kether experience mechanic/evidence.
- `EXPERIENCE_MATRIX_CHECKPOINT`: same, but selected as a V1 slow-progression checkpoint.
- `BASELINE_ONLY`: practice is meaningful but grants no point.
- `PORTAL_GRADE_ONLY`: Portal affects Grade, not attributes.

Day 002 is the strongest direct case: its Canon explicitly says the Asana updates **Disciplina**, therefore the frozen row is `DIS +1`.

## Server invariants

Attribute progression is applied only after an authoritative first completion accepted by `complete_codex_day_v2`.

Recommended idempotency key:

`{user_id}:day:{day}:attribute:{primary_attribute}:matrix:1`

The server:
1. loads the active matrix row;
2. verifies `attribute_gain` is 0 or 1;
3. creates the user `attribute_state` baseline when absent;
4. refuses a second event for the same user/day/attribute/matrix version;
5. applies `min(20, current + gain)`;
6. records the event and source basis;
7. never reads Vault prose to decide a gain.

## Day 001 and Day 002

- Day 001: `SIN / PER`, gain `0`. The Character Sheet is revealed, not artificially boosted.
- Day 002: `DIS / PER`, gain `+1 DIS`, based on explicit canonical wording and structured Asana evidence.
- The Day 002 completion contract remains `reviewed` until the canonical binaural-528 profile is frozen; therefore the +1 cannot be obtained prematurely.

## Balance

V1 does **not** restore the legacy “-40% XP imbalance debuff”. Any future Balance/Equilibrium Compass is advisory and non-punitive.

## Change policy

Any change to a Day's primary attribute, numeric gain, 1–20 bounds, cadence or gain eligibility requires a new matrix version or formally versioned amendment. Silent rebalance is forbidden.
