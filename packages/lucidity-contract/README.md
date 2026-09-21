# HNK Lucidity Contract V1

Status: IMPLEMENTED_CANDIDATE  
Authority source: docs/governance/HNK_CONSTITUICAO_LUCIDEZ_V1.md

## Purpose

Turn the Constitution of Lucidity into a machine-readable boundary contract without pretending to automate Love, spiritual discernment, truth, or TW's canonical authority.

The contract makes provenance and epistemic state observable. It does **not** decide metaphysical truth.

## Invariants

1. Every record has identity, statement, provenance and audit version.
2. Kind and status are explicit; DATA is not automatically CANON.
3. Belief, doubt and proof scope coexist in the record.
4. Evidence references do not erase alternative hypotheses.
5. UNRESOLVED is a valid state.
6. HNK_APPROVED is explicit rather than inferred.
7. SUPERSEDED preserves history instead of silently overwriting it.
8. Challenge metadata permits contestation without granting canonical authority.
9. Authority metadata is separate from epistemic evidence.
10. The schema cannot declare that an assertion is loving, divine, spiritually true, scientifically true, or canonically approved without the corresponding human/governance process.

## State discipline

PROPOSED ≠ IMPLEMENTED ≠ TESTED ≠ VERIFIED ≠ RELEASED.

This package is a contract layer. Runtime enforcement and UI are separate milestones.
