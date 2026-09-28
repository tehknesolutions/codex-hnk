# HNK40 Legacy → E5 Bridge — Spec V1

Status: RESEARCH_GATE
Authority: non-canonical projection research
Base: `research/hnk-kode-e5-simple-paths` @ `b368af47b783618e28cd47f1a0d87c615aa2eabb`

## Problem

The historical HNK40 genesis projection contains 40 valid legacy records, but its PATH representation is a walk and may revisit Mandala addresses. The E5 KODESCRIPT identity space is intentionally stricter: N=12 simple paths, with no repeated address.

Therefore the two representations MUST NOT be conflated.

## Immutable source class

`HNK40_LEGACY_GENESIS_WALK`

- Preserve every historical HNK40 record byte-for-byte at its source.
- Preserve G01..G40 identity.
- Preserve sourcePath, sourceEdges, HNKP1/HNKP2 evidence and CRC evidence.
- Revisited addresses are legal in this legacy class.
- No legacy record is rewritten merely to satisfy E5 constraints.

## Target class

`E5_KODESCRIPT_SIMPLE_PATH`

A candidate target MUST satisfy the E5 N=12 simple-path rules defined by the E5 corpus/gate. In particular, repeated Mandala addresses are forbidden.

## Bridge object

The bridge is a derived research artifact, not a mutation of either source system.

For each G01..G40 it records:

- `glyphId`
- immutable legacy source locator
- legacy walk/path fingerprint
- whether the legacy path is already E5-admissible
- repeated-address diagnostics
- zero or more E5 candidate identities
- derivation rule identifier for every candidate
- evidence sufficient to reproduce the derivation
- resolution status

## Resolution statuses

- `DIRECT`: legacy path already satisfies E5 identity constraints.
- `DERIVED_UNIQUE`: exactly one E5 identity is produced by an approved deterministic bridge rule.
- `DERIVED_AMBIGUOUS`: multiple valid E5 identities remain.
- `NO_E5_PROJECTION`: no valid E5 identity can be established under approved rules.
- `PENDING_RULE`: projection would require a bridge rule not yet governed/approved.

## Hard rules

1. `LEGACY_WALK != E5_SIMPLE_PATH`.
2. Never delete/reorder legacy nodes to manufacture an E5 identity unless that exact transformation is separately specified, versioned and approved as a bridge rule.
3. No semantic similarity may choose among geometric candidates.
4. No phonetic similarity, transliteration, numerology, visual similarity, PUA value or glyph meaning may select an E5 candidate.
5. A bridge result does not canonically promote or replace the historical HNK40 identity.
6. Ambiguity is preserved; it is not guessed away.
7. Every derived result must be reproducible from source locators plus a versioned deterministic rule.
8. HNK40 cardinality remains exactly 40.

## Gate V1

The first executable gate MUST be diagnostic only:

1. Load all 40 historical HNK40 genesis records.
2. For each record, detect repeated Mandala addresses.
3. Classify direct E5 admissibility without modifying the path.
4. Produce a 40/40 report.
5. Assert zero canonical promotions.
6. Assert zero semantic assignments.
7. Assert source HNK40 evidence remains unchanged.

No normalization algorithm is authorized in V1.

## Expected V1 output

`docs/research/mandala/final/hnk40-legacy-e5-bridge-audit.v1.json`

Minimum summary fields:

```json
{
  "glyphCount": 40,
  "directE5": 0,
  "requiresBridge": 0,
  "canonicalPromotions": 0,
  "semanticAssignmentsAdded": 0,
  "sourceMutationCount": 0
}
```

`directE5` and `requiresBridge` are computed values and MUST sum to 40.

## Next gate

Only after the V1 40/40 diagnostic is reproducible may V2 propose deterministic legacy→E5 transformation rules. Any such rule must be evaluated against the exact E5 corpus rather than inventing a replacement path.
