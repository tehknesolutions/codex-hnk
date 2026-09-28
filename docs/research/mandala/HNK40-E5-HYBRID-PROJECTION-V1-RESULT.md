# HNK40 → E5 Hybrid Projection V1 — Gate Result

Status: RESEARCH_RESULT / NON-CANONICAL
Date: 2026-09-28
Rule: `HNK40-E5-V4-DIRECTION-DISTANCE@1`

## Source

Verified legacy input:
`docs/research/mandala/final/hnk40-e4-genesis-projection.v1.json`

Generated projection artifact:
`docs/research/mandala/final/hnk40-e5-hybrid-projection.v1.json`

Generated acquisition artifact:
`docs/research/mandala/final/hnk40-e5-acquisition.v1.json`

## Result

- Total legacy records: 40
- `DIRECT`: 4 (`G01`, `G11`, `G21`, `G31`)
- `DERIVED_UNIQUE`: 34
- `DERIVED_AMBIGUOUS`: 2 (`G17`, `G20`)
- `NO_E5_PROJECTION`: 0
- `PENDING_RULE`: 0

G17 and G20 retain both minimum-score candidates. Neither record has a preferred projection. The acquisition export exposes them as `CANDIDATE_SET`, not as fabricated scalar targets.

Every emitted E5 candidate is a 12-node simple path. The generator validates the exact G01…G40 source identity set, source edge geometry, and Mandala addresses before projection. Generation does not mutate the legacy source and repeated generation is byte-deterministic.

## Authority boundary

The V4 bridge is a structural research derivation. Its projections have `authority: DERIVED_STRUCTURAL` and `canonical: false`.

This result does **not** canonize an E5 identity mapping and does not authorize semantic, phonetic, visual, numerological, PUA, CRC, transport-level, glyph-ordinal, or lexicographic tie-breaking.

## Reproduction

From the repository root:

```powershell
node --test test/hnk40-e5-hybrid-projection.schema.test.mjs test/hnk40-e5-hybrid-projection.generator.test.mjs test/hnk40-e5-hybrid-projection.integrity.test.mjs test/hnk40-e5-hybrid-projection.artifact.test.mjs test/hnk40-e5-acquisition-export.test.mjs
```

Gate evidence before this note was written: 14 tests, 14 pass, 0 fail.

The gate must be rerun after this note is added before implementation completion is claimed.
