# HNK Mandala Authority Model V0.1

## Evidence authority is per assertion

A record may contain multiple assertions with different authorities. Never promote an entire object merely because one field is verified.

### OBSERVED
Directly legible/visible in a locked source.

### MEASURED
Produced by a declared measurement method from a locked source. Include uncertainty/error where relevant.

### DERIVED
Deterministic consequence of declared observed/measured inputs and formula/rule.

### EXTERNAL_REFERENCE
Claim/correspondence stated by an identified external source or tradition. It is evidence about that source/tradition, not HNK truth by default.

### HYPOTHESIS
Testable research proposition.

### HNK_CANDIDATE
Authored HNK relation/meaning proposed for validation.

### HNK_CANONICAL
Explicit HNK decision promoted through project governance.

### UNRESOLVED
Evidence is absent, insufficient or conflicting.

## Promotion rule

`OBSERVED -> MEASURED -> DERIVED` is not a universal lifecycle. These are epistemic types. Likewise, `EXTERNAL_REFERENCE` does not automatically promote into HNK. HNK_CANDIDATE/HNK_CANONICAL are governance states for authored HNK correspondences.

## Conflict rule

Contradictory external correspondences coexist as separate sourced edges. The graph MUST NOT silently reconcile them. An HNK canonical choice, if later made, is represented separately with its own provenance.
