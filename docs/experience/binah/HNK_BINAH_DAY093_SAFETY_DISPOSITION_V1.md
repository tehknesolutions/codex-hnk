# HNK Binah — Day 093 Safety Disposition V1

Status: **SAFETY APPROVED WITH GUARDS / CANONICAL 4-4-4-4 PRESERVED**

Scope: Day 093 — Caliel — O Sopro do Ar Puro

## 1. Editorial source

The Chapter 3 plan explicitly defines square/box Pranayama `4-4-4-4` for Day 093. No source-backed alternative rhythm was found in the HNK source set.

Therefore this disposition does **not** silently replace the canonical practice with a different breath ratio.

## 2. External safety review

Reviewed 2026-09-09 against public clinical/health guidance:

- Cleveland Clinic — *Box Breathing Benefits and Techniques*: describes 4-4-4-4 / box breathing and explicitly recommends staying at a comfortable level, breathing gently and not straining.
- American Lung Association — *The Possibly Deadly Consequences of Social Media Breathing Challenges*: distinguishes ordinary box breathing from dangerous breath-holding challenges, states that box breathing should not involve breath-holding to the point of distress, and notes that tolerance/risk varies by individual health context.
- University College London Hospitals NHS Foundation Trust — respiratory physiotherapy guidance includes square/box breathing as a paced-breathing technique.

These references support a conservative product implementation but do not establish medical benefit or universal suitability.

## 3. Production guards

The canonical product path must enforce all of the following:

1. **No autoplay / no forced pacing.** The user starts voluntarily.
2. **Gentle count, not maximal breath.** Four counts are timing cues, not an instruction to inhale/exhale to capacity.
3. **No minimum cycle quota for XP.** The product must never reward endurance, longer retention or competitive cycle counts.
4. **Immediate Safety Stop.** Dizziness, shortness of breath, pain, increasing anxiety, faintness or meaningful discomfort ends the paced pattern immediately.
5. **Return to natural breathing.** After Safety Stop, the app guides ordinary comfortable breathing and orientation; this is a Return Gate, not a replacement `4-x-x-x` canonical rhythm.
6. **No driving/water/high-consequence context.** The exercise is not presented for situations where transient lightheadedness could create danger.
7. **No physiological claims.** The app does not claim oxygenation, CO2 optimization, neurological entrainment, healing or lung-capacity increase.
8. **No shame/failure language.** Stopping is a valid safety outcome.

## 4. Completion semantics

The Day is an educational/ritual practice, not an endurance test.

A first-completion Practice Session may be considered structurally valid when the user:

- enters the Day voluntarily;
- receives the safety preflight;
- begins the canonical 4-4-4-4 pattern **or elects to stop before/while attempting because of comfort/safety**;
- completes the Return Gate;
- records structured evidence including `safety_stop` when applicable.

There is **no required minimum number of completed retention cycles** for canonical XP. This follows the already-frozen Day 093 draft rule that XP must not depend on completing a fixed number of cycles when discomfort occurs.

A user who does not wish to perform breath retention may follow the Return Gate / natural-breathing path and still close the Day as a safety-adapted completion; the system must label this as `SAFETY_ADAPTATION`, not as a completed physiological 4-4-4-4 execution.

## 5. Evidence contract

Operational evidence may store only structured fields such as:

```text
practice = day093_box_breathing
canonical_pattern = 4-4-4-4
attempted = true|false
completed_cycles = integer >= 0
safety_stop = true|false
safety_stop_reason = optional bounded enum
return_gate = confirmed
adaptation = none|SAFETY_ADAPTATION
```

No private health narrative is required for XP. Free text, if the user chooses to add it, belongs in the encrypted Vault.

## 6. Canonical disposition

G3 safety gate for Day 093 is **PASS WITH GUARDS**.

This disposition authorizes promotion of the already reviewed Day 093 editorial body without changing its 705-word structural blocks. Promotion metadata must reference this document.

## 7. Epistemic boundary

The practice may support attention/relaxation for some users, but HNK does not convert subjective effects into proof of neurological, pulmonary, therapeutic or spiritual mechanisms. Safety Stop and ordinary breathing always outrank ritual completion pressure.
