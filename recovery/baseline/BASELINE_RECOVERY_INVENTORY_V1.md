# HNK M90 Triad I — Baseline Recovery Inventory V1

Status: `RECOVERY-IN-PROGRESS`

Target baseline referenced by repository bootstrap: `HNK_M90_TRIADE_I_FINAL_RC1`.

This inventory separates recovered executable/canonical artifacts from planning/source documents. A planning document MUST NOT be promoted as if it were an authored/validated RC1 build.

## A. Kether / Chapter 1 / Days 001–036

Recovery confidence: `HIGH / EXECUTABLE-CANON-EVIDENCE`

Recovered evidence in File Library:

- `README.md` — Canonical Day Schema v1 + Vehuiah Cycle; identifies:
  - `schema/hnk.codex.day.v1.schema.json`
  - `src/types/hnk-codex-day.ts`
  - `fixtures/day-001.json` … `day-005.json`
  - `scripts/validate-days.mjs`
  - `docs/SOURCE-LOCK.md`
- `SOURCE-LOCK.md` — operational authority and explicit editorial drift policy for Vehuiah 001–005.
- `hnk.codex.day.v1.schema.json` — machine-readable canonical day contract; 705-word architecture, renderer rules and provenance model.
- `validation.txt` — Chapter 1 master validation:
  - `JSON_SCHEMA=PASS`
  - `PORTAL_DAY_036_SCHEMA=PASS`
  - `LEGACY_DRIFT_COMPATIBILITY=PASS`
  - `LEXICAL_MATRIX_137_72_26=PASS`
  - `ALL_36_DAYS_ACTUAL_705=PASS`
  - `RENDERER_V1_2_PORTAL_AWARE=PASS`
  - days 001–036 individually VALID
  - total literary words: 25,380
  - architecture freeze PASS
- `portal-036.html` — rendered portal proof for Kether → Chokmah.
- `KETHER-LITERARY-QA-QUEUE.md` — records Gold locks and Day 036 QA boundary.

Recovery rule: Kether may be reconstructed from these artifacts only with checksum/provenance tracking. Missing individual fixtures or source files must remain marked `MISSING-ARTIFACT`, not regenerated silently.

## B. Chokmah / Chapter 2 / Days 037–073

Recovery confidence: `SOURCE-PLAN-RECOVERED / EXECUTABLE-RC1-NOT-YET-FOUND`

Recovered evidence:

- `capitulo_2_plano_escrita.md` — detailed Chapter 2 plan, pages 37–73, Chokmah / Atziluth / Level 2.

Not yet recovered as RC1 evidence:

- full authored day fixtures 037–073;
- Chapter 2 master validation;
- Portal 073 compiled/rendered artifact;
- renderer regression result specific to the completed Chokmah range;
- release manifest/checksums for this chapter.

Recovery rule: the plan is authoritative planning/source material, NOT proof that the final authored RC1 assets are present.

## C. Binah / Chapter 3 / Days 074–109

Recovery confidence: `SOURCE-PLAN-RECOVERED / EXECUTABLE-RC1-NOT-YET-FOUND`

Recovered evidence:

- `capitulo_3_plano_escrita.md` — detailed Chapter 3 plan, including:
  - seven five-day cycles for days 074–108;
  - Day 109 Portal;
  - transition from Atziluth to Beriah;
  - +500 XP portal rule in the planning source.

Not yet recovered as RC1 evidence:

- full authored day fixtures 074–109;
- Chapter 3 master validation;
- Portal 109 compiled/rendered artifact;
- final Triad I 109/109 validation manifest;
- exact release-shell and cryptographic validation artifacts referenced by the previous local RC1 audit.

Recovery rule: Day 109 planning content must not be represented as a recovered final Portal 109 build until the compiled artifact/validation is found.

## D. Global editorial contract

Recovered:

- `codex_padrao_editorial_705.md`
- canonical formula: `(137 + 72 + 26) × 3 = 705` words per standard Codex day.
- canonical day schema reinforces `705`, three voices/pillars, portal-aware renderer semantics and provenance fields.

## E. Cycle 1 / HNK-LINGUAS delta protected separately

Recovery branch also preserves the post-`df51662` checkpoint:

- L06 source lock;
- L07 source lock;
- L05 K.8 evidence gate;
- L05 K.9 evidence capture harness;
- L05 K.10 controlled pilot UI;
- public runtime remains OFF for guarded content.

This delta is independent from the M90 Triad I baseline recovery and MUST NOT be used to imply that the missing Codex RC1 files have been reconstructed.

## F. Current recovery classification

| Area | Source plan | Canonical schema | Authored/validated range | Compiled portal | RC1 complete |
|---|---|---|---|---|---|
| Kether 001–036 | FOUND | FOUND | 36/36 validation FOUND | Portal 036 FOUND | PARTIAL RECOVERY |
| Chokmah 037–073 | FOUND | shared schema FOUND | NOT YET FOUND | NOT YET FOUND | NO |
| Binah 074–109 | FOUND | shared schema FOUND | NOT YET FOUND | NOT YET FOUND | NO |
| Triad I global | PARTIAL | FOUND | NOT YET PROVEN 109/109 | Portal 109 NOT YET FOUND | NO |

## G. Promotion gate

`main` must remain untouched until one of these conditions is met:

1. original `HNK_M90_TRIADE_I_FINAL_RC1` snapshot/bundle is recovered and its validation reproduced; OR
2. a reconstruction branch reaches equivalent artifact coverage with explicit provenance for every recovered/rebuilt file and reproduces the original contract suite.

No silent regeneration. No source-plan → RC1 promotion. No fabricated validation evidence.
