# E5 — Mandala Automorphism Proof Gate

Status: **ACTIVE / PROOF REQUIRED**

## Canonical input

After the approved reversal quotient:

- ordered N=12 simple paths: `95,284,518`
- reversal classes: `47,642,259`
- traversal direction is metadata, not base geometric identity.

## Objective

Determine the exact group of graph/geometric transformations that may quotient the HNK Mandala glyph space without destroying canonical structure.

No quotient is permitted merely because two rendered shapes appear similar.

## Candidate transformations to prove independently

### MF sector rotations

For `k in Z72`:

`R_k(MF:L,S) = MF:L,(S+k mod 72)`

A rotation is admissible only if it preserves every frozen MF and MF↔CG edge and preserves the rendering law.

### MF reflections

For reflection axis parameter `a`:

`F_a(MF:L,S) = MF:L,(a-S mod 72)`

Again, preservation of all frozen edges and rendering geometry must be proven.

### CG action

Any admissible MF sector transformation must induce a well-defined permutation of `CG:G01..G09`. Because each CG gate covers an 8-sector block, arbitrary one-sector rotations may fail to preserve the MF↔CG incidence partition. The valid subgroup must be computed, not assumed.

### Layer transformations

No layer translation or layer reflection is assumed. MF layers form a bounded six-layer radial path and may have distinguished inner/outer geometry. Any nontrivial layer automorphism requires explicit proof against both graph incidence and rendering coordinates.

### CR components

`CR:T=C3`, `CR:H=C7`, and `CR:D=C12` are disconnected components with different orders. Their internal dihedral automorphisms may be counted separately, but they cannot be exchanged with one another or with MF+CG.

## Required proof artifacts

The executor/report must provide:

1. exact automorphism candidates;
2. PASS/FAIL for edge preservation;
3. PASS/FAIL for namespace preservation;
4. PASS/FAIL for rendering-coordinate preservation under an allowed Euclidean transform;
5. the resulting approved transformation group;
6. orbit-size distribution over N=12 reversal classes;
7. exact Burnside/orbit count if a nontrivial quotient is approved.

## Critical rule

Do **not** divide `47,642,259` by the size of a symmetry group. Some glyphs can have nontrivial stabilizers. The final quotient must use exact orbit enumeration or Burnside's lemma.

## Current authoritative count

Until this gate closes, the exact canonical structural count remains:

**47,642,259 reversal classes.**
