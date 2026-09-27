# E4 — HNK40 Genesis Projection Gate

Status: **EXECUTION GATE / SOURCE RECOVERED**

## Authoritative structural input

`glyph-genesis-hnk40-candidates.v1.4.2.json`

The source contains all 40 individual candidates with:

- exact ordered `path[]` (12 E1 MF addresses),
- exact ordered `edges[]` (11 E2 transitions),
- immutable HNKP1 packet evidence (`bytes`, `crc32Hex`, `packetHex`, `base64url`).

Therefore E4 MUST consume this file directly. It MUST NOT infer paths from SVG, raster output, contact sheets, semantic registries, or `@hnk/glyphs` visual assets.

## Projection law

For every `G01..G40`:

1. Read the exact V1.4.2 ordered MF path.
2. Convert each `MF:Lxx:Syy` address to E1 MF ordinal:
   `ordinal = (layer - 1) * 72 + sector`.
3. Encode HNKP2 node as `namespace=1 + ordinal:u16BE`.
4. Preserve the ordered edge sequence exactly.
5. Encode HNKP2 header `HNKP | version=2 | flags=2 | nodeCount=12`.
6. Append the 11 edge enum bytes under E3.
7. Append CRC32 IEEE big-endian over all preceding bytes.
8. Decode independently.
9. Convert decoded MF ordinals back to E1 address IDs.
10. Compare decoded PATH and edges against V1.4.2 source.
11. Independently verify the stored HNKP1 packet evidence is unchanged.

## Required PASS invariants

E4 may be marked PASS only if all are true:

- `candidateCount == 40`
- `pathRoundTripPass == 40`
- `edgeRoundTripPass == 40`
- `hnkp2CrcPass == 40`
- `hnkp2PacketBytes == 58` for every 12-node candidate
- `hnkp1SourcePacketBytes == 70` for every candidate
- `hnkp1MutationCount == 0`
- `semanticAssignmentsAdded == 0`
- `canonicalPromotions == 0`

## Failure policy

Any single mismatch keeps E4 OPEN and records the failing glyph ID, source path, encoded packet and decoded result. No majority/threshold acceptance is allowed.

## Output contract

The completed executor must materialize:

- `hnk40-e4-genesis-projection.v1.json`
- `HNK40-E4-GENESIS-PROJECTION-REPORT.md`

The JSON report must contain one record per glyph with source path/edges, E1 ordinals, HNKP2 hex/base64url/CRC, decoded path/edges, HNKP1 evidence digest, and PASS/FAIL flags.

## Gate after E4

Only a strict **40/40 PASS** opens **E5 — Glyph-Space Census**.
