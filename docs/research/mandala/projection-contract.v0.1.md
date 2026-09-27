# HNK Mandala Projection Contract V0.1

## Invariant

Mandala topology is authoritative. Pixel, IsoPixel and Voxel coordinates are projections, never primary identities.

## Canonical research identity

`GLYPH := { AK_SET, ORDERED_PATH, FIELD_STATE, RELATIONS }`

A raster or spatial rendering MUST preserve a machine-readable route back to its AK source field(s).

## Projection families

- `projectPixel(AK, projectionVersion) -> PX`
- `projectSpatial(AK, spatialVersion) -> (x,y,z)`
- `projectIso(x,y,z, isoVersion) -> (isoX,isoY)`
- `encode(discreteMap, encodingVersion) -> bits/hex`

## Prohibited shortcuts

1. No arbitrary grid size may become canonical before topology census.
2. No screen pixel may become an AK identity.
3. No hand-drawn isometric variant may be called an encoding.
4. No BIN/HEX coincidence creates a symbolic correspondence.
5. No 441-AK or 22/72 structural hypothesis is promoted without source verification.

## Required provenance

Every projected cell stores `akRefs`, projection version, state and structural/render role. Sampling that combines multiple source fields must explicitly record all contributing AKs or weights.

## Reversibility gate

For a projection classified as an encoding, the implementation must demonstrate deterministic regeneration from canonical AK/path/state data. Lossy display renderings must be labeled `RENDER_ONLY` and cannot be used to reconstruct canon.
