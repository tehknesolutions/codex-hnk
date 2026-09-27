# E5 — Reversal Equivalence Gate

Status: **PROPOSED STRUCTURAL QUOTIENT / HUMAN-CANON GATE**

## Input

Exact ordered N=12 simple-path census:

- Major-463: `95,284,518`
- repeated address: forbidden
- ordered traversal: preserved in source census
- symmetry reduction: none in source census

## Proposed equivalence

For a simple path

`P = [v1, v2, ..., v12]`

define

`reverse(P) = [v12, v11, ..., v1]`.

The quotient proposal is:

`P ~ reverse(P)`

**only if HNK canon declares traversal direction irrelevant to glyph identity.**

This operation changes no visited address and no undirected edge. It changes only traversal direction.

## Fixed-point proof

No N=12 simple path can satisfy `P = reverse(P)`.

Equality would require `v1 = v12`; however the simple-path law forbids repeated addresses and N=12 has distinct endpoints. Therefore reversal acts freely on this census: every reversal orbit contains exactly two ordered paths.

## Exact conditional quotient

`95,284,518 / 2 = 47,642,259`

Therefore:

- ordered addressed simple paths: `95,284,518`
- reversal-equivalence classes: `47,642,259`
- fixed reversal classes: `0`
- orbit size: exactly `2`

## Canonical warning

`47,642,259` is **not yet the final render-distinct glyph count**.

This gate does not apply:

- rotation,
- reflection,
- sector translation,
- layer translation,
- graph automorphism,
- geometric/render equivalence,
- semantic equivalence.

Those require separate proofs.

## Decision gate

If HNK canon says drawing the identical undirected trace from the opposite endpoint is the same glyph, approve reversal equivalence and promote `47,642,259` as the next exact E5 count.

If traversal direction carries meaning, reject this quotient and retain `95,284,518` as the structural addressed count.
