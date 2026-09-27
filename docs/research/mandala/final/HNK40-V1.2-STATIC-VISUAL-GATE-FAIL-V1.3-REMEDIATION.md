# HNK40 V1.2 Static Visual Gate — FAIL / V1.3 Remediation

Status: **V1.2 BLOCKED FOR PROMOTION · V1.3 HNK_CANDIDATE**

## Finding

The V1.2 family proved 40 unique ordered PATHs and 40 unique ordered edge signatures, but that was not sufficient for a static glyph system.

When stroke order, traversal direction and duplicate retracing are removed — exactly what happens in a static font outline, printed glyph or ordinary SVG — V1.2 collapses:

- ordered PATHs: **40**
- static visible segment signatures: **26**
- lost static identities: **14**
- static collision groups: **12**
- largest collision: **G07 / G15 / G27 / G35**

Therefore V1.2 fails the Human Gate before semantic or phonological review. No G-ID is promoted.

## Corrected invariant

A structural family must now satisfy all of the following simultaneously:

1. 40/40 ordered PATHs unique.
2. 40/40 ordered edge signatures unique.
3. 40/40 **static-visible signatures unique**.
4. Minimum pairwise 11-edge distance >= 3.
5. HNKP transport round-trip preserved.
6. All candidates remain `HNK_CANDIDATE`.

Static-visible signature = the translation-normalized set of unique, undirected MF adjacency segments. It intentionally ignores stroke order and retracing.

## V1.3 minimal remediation

The Hamming(7,4) column code is preserved. Nodes/edges remain 12/11. W1 is unchanged.

Only six world-schedule slots move:

- W2: slots 1 and 3
- W3: slots 2 and 3
- W4: slots 4 and 6

Computed result:

- ordered PATHs: **40/40**
- ordered edge signatures: **40/40**
- static-visible signatures: **40/40**
- minimum pairwise edge distance: **3**
- packet size: **70 bytes**
- semantic assignment: **NONE**
- binding authority: **HNK_CANDIDATE**

## Governance

This is a structural repair, not canonization. V1.3 becomes the preferred family for the next human visual pass only after executable validation. HNK-KODE remains linguistic authority.
