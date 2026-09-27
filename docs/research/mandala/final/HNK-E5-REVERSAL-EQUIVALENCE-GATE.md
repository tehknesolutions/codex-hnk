# E5 — Reversal Equivalence Gate

Status: **APPROVED / CANONICAL STRUCTURAL QUOTIENT**

## Input

Exact ordered N=12 simple-path census:

- Major-463: `95,284,518`
- repeated address: forbidden
- ordered traversal: preserved in source census
- symmetry reduction: none in source census

## Canonical law — FORM ≠ EXECUTION

For a simple path

`P = [v1, v2, ..., v12]`

define

`reverse(P) = [v12, v11, ..., v1]`.

HNK-KODE canon adopts:

`P ~ reverse(P)`

for **geometric glyph identity**.

The identical undirected trace drawn from the opposite endpoint is the same base glyph. Traversal direction is preserved as independent operational metadata and may later carry phonetic, semantic, animation, ritual, or execution information without creating a second geometric glyph identity.

## Fixed-point proof

No N=12 simple path can satisfy `P = reverse(P)`.

Equality would require `v1 = v12`; however the simple-path law forbids repeated addresses and N=12 has distinct endpoints. Therefore reversal acts freely on this census: every reversal orbit contains exactly two ordered paths.

## Exact canonical quotient

`95,284,518 / 2 = 47,642,259`

Therefore:

- ordered addressed simple paths: `95,284,518`
- canonical reversal-equivalence classes: `47,642,259`
- fixed reversal classes: `0`
- orbit size: exactly `2`
- traversal direction: retained as metadata, not base-form identity

## Boundary of this approval

`47,642,259` is **not yet the final render-distinct glyph count**.

This canonical gate does not apply:

- rotation,
- reflection,
- sector translation,
- layer translation,
- graph automorphism,
- geometric/render equivalence beyond reversal,
- semantic equivalence.

Those require separate proofs and gates.

## Canonical decision

**APPROVED:** drawing the identical undirected trace from the opposite endpoint is the same HNK geometric glyph.

The next exact E5 baseline is therefore **47,642,259 reversal classes**.
