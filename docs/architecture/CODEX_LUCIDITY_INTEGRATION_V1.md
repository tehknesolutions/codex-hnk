# CODEX LUCIDITY INTEGRATION V1

**Scope:** CODEX-HNK only  
**Constitutional source:** `docs/governance/HNK_CONSTITUICAO_LUCIDEZ_V1.md`

## Purpose

Turn Lucidity from governance prose into an executable, auditable layer across Codex knowledge, practice, evidence and canon workflows.

## Living lifecycle

`SOURCE → CLAIM → CLASSIFICATION → PRACTICE → EXPERIENCE → OBSERVATION → EVIDENCE → INTERPRETATION → CONTESTATION → REVIEW → CANON STATE`

The lifecycle is not a mandatory linear ladder. Records may remain testimony, hypothesis, contested material or legacy-unclassified indefinitely.

## Three HNK axes

`BELIEVE · DOUBT · PROVE`

These are analytical/practical axes, not automatic truth scores. A record may use one or more axes without gaining canonical authority.

## V1 epistemic states

- `LEGACY_UNCLASSIFIED` — existing material not retroactively classified by inference.
- `TESTIMONY` — a reported experience or testimony.
- `HYPOTHESIS` — proposition under investigation.
- `SOURCE_BACKED` — proposition with explicit source support.
- `PRACTICE_RECORDED` — practice/experiment has an auditable record.
- `EVIDENCE_ATTACHED` — explicit evidence references exist.
- `CONTESTED` — substantive challenge/disagreement is registered.
- `REVIEWED` — review exists; this alone is not canon approval.
- `CANON_APPROVED` — explicit canonical approval with review + canon references.
- `CANON_REJECTED` — explicitly rejected from canon.
- `SUPERSEDED` — replaced by a newer version/decision.

## Non-equivalence invariants

`EXPERIENCE ≠ INTERPRETATION ≠ EVIDENCE ≠ CANON`

`BELIEF ≠ PROOF`

`SOURCE ≠ AUTOMATIC TRUTH`

`REVIEW ≠ CANON APPROVAL`

`TW ROOT AUTHORITY ≠ FABRICATED EVIDENCE`

Canonical authority inside HNK and evidentiary status are separate dimensions. TW may define/change HNK canon as creator/governor; the system must still preserve whether a statement is definition, testimony, hypothesis, sourced claim, evidence-backed claim, interpretation, or other epistemic class.

## Legacy migration rule

V1 MUST NOT mass-infer authority for existing Days, chapters, practices or dossiers.

When a legacy item has not been deliberately classified, adapters should expose `LEGACY_UNCLASSIFIED` with provenance `explicitly-not-inferred`.

Migration therefore becomes incremental and auditable instead of rewriting historical content as if classifications had always existed.

## Runtime contract

Executable contract: `packages/lucidity-contract`.

Minimum record dimensions:

- subject identity/type;
- epistemic state;
- BELIEVE/DOUBT/PROVE axes when deliberately assigned;
- source references;
- practice references;
- evidence references;
- interpretation references;
- contestation references;
- review references;
- canon references;
- provenance.

## Integration sequence

### L1 — Contract

Lock schema, states, validation and legacy fallback.

### L2 — Existing evidence infrastructure

Bridge without replacing existing `claim-dossier`, `evidence-ledger`, `evidence-review-gate`, canon contracts/resolvers and reevaluation packages.

Lucidity is an integration layer over those capabilities, not a parallel evidence database.

### L3 — Runtime telemetry

Emit explicit transitions when a claim/practice changes epistemic state. Never infer a transition solely because a UI was opened or content was read.

### L4 — Days / Living Grimoire UI

Expose status and provenance progressively. Do not block legacy content merely because it predates V1.

### L5 — Migration batches

Classify content in reviewable batches with diffs, evidence and rollback rather than bulk semantic rewriting.

## Acceptance gates

V1 integration is not complete until:

1. contract tests pass;
2. legacy fallback is deterministic;
3. evidence/canon states reject missing required references;
4. at least one existing claim/evidence path is bridged end-to-end;
5. at least one Day or Living Grimoire surface displays the status without changing the underlying canon;
6. telemetry records a real state transition;
7. no bulk migration silently upgrades legacy authority;
8. CI protects the contract.

## Current implementation state

This PR begins **L1 — Contract** only.

`SPECIFIED → CONTRACT_IMPLEMENTED → TESTED → BRIDGED → UI_EXPOSED → MIGRATION_READY`

Do not report later states until evidence exists.