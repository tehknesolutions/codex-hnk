# HNK-KODE × MANDALA — Encoding Architecture V1

Status: **CANDIDATE ARCHITECTURE / HUMAN GATE REQUIRED**

## 1. Authority boundary

This document maps the measured Mandala Computable V1 geometry into a candidate HNK-KODE encoding architecture. It does **not** assign semantic, phonological, sacred, lexical, or canonical meaning to individual addresses or generated glyphs.

The source structural model remains authoritative for geometry. HNK-KODE remains authoritative for linguistic meaning.

## 2. Structural constants

The Mandala Computable V1 supports:

- 72 angular sectors, 5° each.
- 6 sectorized layers.
- 432 regular sector-layer fields (`6 × 72`).
- 9 choir/sefirah outer cells.
- 441 outer-layout blocks (`432 + 9`).
- 22 central Rose fields (`3 + 7 + 12`).
- 463 major addressable-field candidates (`441 + 22`).
- hierarchical central core excluded from the 463 count pending governance/sub-addressing.

Important: **463 is a major address-space candidate, not the frozen canonical AK count.**

## 3. Address namespaces

### MF — Mandala Field

Regular 6 × 72 field.

Canonical candidate syntax:

`MF:L{01..06}:S{01..72}`

Cardinality: **432**.

### CG — Choir Group

Outer choir/sefirah group cell.

Candidate syntax:

`CG:{01..09}`

Cardinality: **9**.

Each CG spans eight angular sectors:

- CG01 → S01..S08
- CG02 → S09..S16
- ...
- CG09 → S65..S72

### CR — Central Rose

Central Rose topology.

Candidate namespaces:

- `CR:T:{01..03}` — triad
- `CR:H:{01..07}` — heptad
- `CR:D:{01..12}` — dodecad

Cardinality: **22**.

Exact letter/petal rotation remains unresolved and MUST NOT be inferred by this encoding layer.

### HC — Hierarchical Core

Reserved namespace for the composite center.

Candidate syntax:

`HC:*`

Status: **UNCOUNTED / NON-ADDRESSABLE IN V1**.

Observed source structure includes a white central field, five red rose petals, four green diagonal rays and four visible gold-cross arms. External-reference structure differs in counting granularity. Therefore no HC sub-addresses are promoted in V1.

## 4. Major address-space cardinality

```text
MF = 6 × 72 = 432
CG = 9
CR = 3 + 7 + 12 = 22

MAJOR = MF + CG + CR
      = 432 + 9 + 22
      = 463
```

`HC` is deliberately excluded.

## 5. Glyph model

A Mandala address is **not automatically a glyph**.

A glyph is generated from an ordered traversal over the address graph:

```text
GLYPH := START_ADDRESS + ORDERED_PATH + EDGE_SEQUENCE + TRANSFORM_PROFILE
```

Therefore:

```text
463 addresses ≠ 463 letters
463 addresses ≠ 463 words
```

The 463-field architecture is the substrate from which glyph paths may be constructed.

## 6. HNK40 role

HNK40 remains the **Genesis benchmark family**.

Its purpose is to validate:

- deterministic PATH generation;
- structural uniqueness;
- edge-distance behavior;
- visual distinguishability;
- raster robustness;
- HNKP transport/integrity;
- Human Gate procedures.

HNK40 MUST NOT be interpreted as the complete alphabet or complete glyph inventory.

## 7. Linguistic layering

Candidate separation of concerns:

```text
HENUVOKODAN / HNK-KODE
        ↓
linguistic + semantic authority
        ↓
lexeme / grammar / phonology
        ↓
glyph binding layer
        ↓
PATH / edge sequence
        ↓
463-address Mandala substrate
        ↓
source-measured geometry
```

Existing HNK-KODE letters, sacred-name rules and lexemes are not modified by this architecture.

## 8. Transport rule

Existing HNKP transport proves ordered-path serialization over MF nodes. V1 expansion SHOULD extend namespace encoding to CG and CR without breaking existing MF packet decoding.

Compatibility requirement:

`existing MF-only HNKP packet → same decoded PATH after V1 extension`.

No HC transport namespace is authorized until HC governance closes.

## 9. Governance states

Every address/glyph binding MUST expose one of:

- `STRUCTURAL_ONLY`
- `HNK_CANDIDATE`
- `HUMAN_REVIEW`
- `HNK_CANON`
- `RESERVED`

Geometry alone MUST NOT promote a glyph to `HNK_CANON`.

## 10. V1 invariants

1. MF cardinality = 432.
2. CG cardinality = 9.
3. CR cardinality = 22.
4. Major candidate address space = 463.
5. HC excluded from 463.
6. 72-sector angular resolution preserved.
7. Existing HNK40 candidates remain candidates.
8. No automatic semantic assignment.
9. No forced 1:1 address→glyph mapping.
10. Human Gate remains mandatory for canonical promotion.

## 11. Next gates

### E1 — Address Registry
Materialize all 463 addresses deterministically.

### E2 — Graph Topology
Define legal adjacency and transition classes for MF↔MF, MF↔CG, MF↔CR and CR↔CR without inventing unsupported source geometry.

### E3 — HNKP Namespace Extension
Allocate transport namespaces for CG and CR while preserving MF compatibility.

### E4 — Genesis Projection
Project HNK40 into the V1 address model and prove lossless compatibility.

### E5 — Glyph-Space Census
Calculate the legal PATH search space under bounded path laws. This, not 463 alone, determines the potential structural glyph capacity.

### E6 — Linguistic Binding Gate
Only after E1–E5 may HNK-KODE semantic/phonological bindings be proposed for Human Gate review.

## 12. Decision

**463 is adopted in this document as the candidate major Mandala address-space cardinality for HNK-KODE engineering.**

It is **not** declared the canonical AK count, because the source structural model explicitly leaves `canonicalAKCount = NOT_YET_FROZEN` and excludes the hierarchical core pending a scope decision.
