# E5 — Render-Distinct Identity Gate

Status: **ACTIVE / FINAL IDENTITY PROOF**

## Exact input

The preceding E5 automorphism census produced:

- reversal baseline: `47,642,259`
- MF+CG D9 classes: `2,647,891`
- CR:D D12 classes: `1`
- Major-463 geometric classes: **`2,647,892`**

## Renderer frozen from measured geometry

The source structural model freezes:

- center `(449.5,449.5)`;
- 72 sectors of `5°`;
- six distinct MF radial bands;
- nine CG cells spanning `40°` each;
- CR:T/C3, CR:H/C7, CR:D/C12 as independent central cycles under the currently frozen graph.

MF address coordinates SHALL use the center angle of the addressed 5-degree sector and a fixed representative radius per frozen layer. CG coordinates SHALL use the center angle of its 8-sector/40-degree group and a representative radius in the choir band.

## Identity law

A base glyph render is the undirected geometric trace formed by its consecutive path edges.

Two already symmetry-quotiented structural classes may collapse further only if their normalized rendered traces are exactly equal under the renderer's declared numeric tolerance and normalization law.

The renderer MUST NOT use labels, semantics, traversal direction, color, stroke animation, or HNK meaning to distinguish base geometry.

## Proof strategy

Before attempting to materialize millions of SVGs, prove whether the address-to-coordinate map plus straight-edge trace is injective on structural edge sets.

For MF+CG, distinct frozen addresses have distinct polar coordinates because:

1. MF sectors have distinct center angles within a layer;
2. MF layers have distinct representative radii;
3. CG uses a distinct choir radius and nine distinct group-center angles.

Therefore address vertices are coordinate-injective.

If straight segments between frozen address coordinates are also uniquely recoverable as endpoint pairs (no two distinct allowed graph edges have the same unordered geometric segment), then a rendered trace uniquely determines its undirected edge set. Under that condition, no additional render collapse exists beyond reversal + approved Mandala automorphisms.

## Required executor checks

The final executor must verify over all 895 frozen graph edges:

1. no coordinate collisions between distinct addresses within each connected rendered domain;
2. no distinct allowed edges map to the same normalized unordered segment;
3. all approved D9/D12 transformations correspond to the Euclidean symmetries already quotiented;
4. renderer normalization does not discard radial layer identity or merge CG with MF vertices;
5. CR components remain separately namespaced unless their render placement is canonically frozen into one shared central coordinate system.

## Important CR boundary

The current structural source explicitly leaves MF↔CR binding and CR cross-family geometry unresolved. Therefore E5 MUST NOT claim a cross-component render collapse involving CR:T, CR:H, or CR:D until their absolute central placement is frozen.

For N=12 simple paths, CR:T and CR:H contribute zero. CR:D contributes one geometric class after D12. Thus the unresolved cross-family placement can affect the final Major-463 count only if that single CR:D trace is later proven identical to an MF+CG trace under the same canonical renderer.

## Completion rule

If the executor proves coordinate injectivity and edge-segment injectivity, and no CR:D↔MF+CG equality is canonically established, then:

**renderDistinctCount(N=12) = 2,647,892**

and E5 may close with this as the final currently-computable Mandala glyph-space number.

If any collision exists, enumerate the collision classes exactly before closing E5.
