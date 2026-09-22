# CODEX LUCIDITY — L2 EVIDENCE BRIDGE V1

**Scope:** CODEX-HNK only

## Purpose

Connect the executable Lucidity lifecycle to the existing claim/evidence/human-review infrastructure without replacing any of those systems.

`CLAIM DOSSIER → LUCIDITY → EVIDENCE → HUMAN REVIEW → EXPLICIT CANON DECISION`

## Mapping

- a valid Claim Dossier with linked evidence maps to `EVIDENCE_ATTACHED`;
- a valid pending Evidence Review Gate does not upgrade epistemic state;
- a valid gate with `status=REVIEWED` and `review.human_decision=true` maps to `REVIEWED`;
- `REVIEWED` never implies `CANON_APPROVED`;
- canon approval/rejection requires a separate explicit human decision plus a canon reference.

## Hard invariants

1. `automatic_truth_inference=false` is preserved from Claim Dossier provenance.
2. `automatic_canon_promotion=false` is preserved from Claim Dossier and Evidence Review Gate provenance.
3. `machine_can_decide=false` is preserved from the Human Review Gate.
4. Evidence references and review references remain separate.
5. A machine cannot synthesize the explicit human signal required for canon promotion.
6. Legacy content remains `LEGACY_UNCLASSIFIED` until deliberately classified.
7. This bridge does not mutate Claim Dossiers, Evidence Review Gates, evidence artifacts or canon files.

## Executable surface

Package: `@hnk/lucidity-bridge`

- `bridgeClaimDossierToLucidity(dossier, options)`
- `bridgeHumanReviewToLucidity(dossier, gate, options)`
- `attachExplicitCanonDecision(record, decision)`

## Current gate

This change establishes the bridge API and locks the no-auto-canon invariants with tests.

L2 is considered fully `BRIDGED + TESTED` only after CI passes and an integration fixture exercises a real valid Claim Dossier + Human Evidence Review Gate through the bridge. Until then the correct state is:

`L2_BRIDGE_IMPLEMENTED__INTEGRATION_FIXTURE_PENDING`
