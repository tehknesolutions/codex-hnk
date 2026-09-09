# Day 007 — Dave Elman I

Technical status: `TECHNICALLY_ACTIVE__DEVICE_BROWSER_QA_PENDING`.

## Canon
- Source: `Tehkne-Solutions/hnk-codex-365/canon/capitulo-01-kether/dia-007.md`
- Git blob SHA: `bc12709d5a346870405cf41e62f99ac28d70186d`
- Counted core: 705 words
- Canonical XP: +150

## Runtime
- Web: `/day-007`
- Expo: `/day-007`
- Quest: `HNK-KETHER-D007-V1`
- Completion: `HNK-KETHER-D007-COMP-V1` (`active`)
- Progression: +1 HIP on first canonical completion only
- Jeliel progress after first completion: 2/5
- Crown fragments after first completion: 1/7

## Core semantic rule
Catalepsy is not required. Completion proves that the practitioner executed the voluntary sequence `RELAX → TEST → RELEASE → RECORD`; `catalepsy_reported=false` is valid evidence.

## Safety
- Eyes may open at any time.
- No facial force or forced non-opening is required.
- The suggestion must be released after the short test.
- A second attempt is optional.
- Stop for pain, dizziness or anxiety.

## Proof
`supabase/tests/day007_completion_v1_smoke.sql` reproduces the rollback-only smoke for +150 XP, +1 HIP, replay/revisit idempotency, and a first completion with no catalepsy reported.
