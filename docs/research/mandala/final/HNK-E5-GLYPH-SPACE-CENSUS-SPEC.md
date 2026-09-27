# E5 — HNK Mandala Glyph-Space Census

Status: **ACTIVE / CENSUS DEFINITION**

## Objective

Compute, rather than assume, the number of structurally valid glyphs available in the frozen Mandala graph.

The original HNK40 is a validated Genesis seed family. It is **not** the language-size ceiling.

## Frozen evidence entering E5

- E1 major address registry: 463 addresses.
- E2 known graph: 895 undirected edges under frozen topology.
- E3 HNKP2 transport for MF, CG and CR namespaces.
- E4: strict 40/40 HNK40 projection PASS.

## Census must distinguish these quantities

1. `rawWalkCount(N)` — all legal directed walks of N nodes.
2. `simplePathCount(N)` — legal N-node paths with no repeated address.
3. `edgeSimpleTrailCount(N)` — legal N-node trails with no repeated edge.
4. `canonicalPathCount(N)` — after an explicitly approved equivalence law.
5. `renderDistinctCount(N)` — after proven geometric/render equivalence only.
6. `languageAssignableCount(N)` — subset approved by later HNK-KODE semantic/human gates.

These values MUST NOT be collapsed into one number.

## Genesis-comparable primary census

The first exact target is `N=12`, because every HNK40 Genesis candidate has 12 ordered nodes and 11 ordered edges.

E5 SHALL compute at minimum:

- MF-only counts on `P6 □ C72`;
- MF+CG counts on the frozen 441-node component;
- CR:T (`C3`), CR:H (`C7`), CR:D (`C12`) separately;
- major-463 counts only under frozen edges, preserving disconnected components;
- distributions by starting namespace/layer and edge-class composition.

## Equivalence policy

No rotational, reflectional, reversal, translational, semantic or visual equivalence may be silently applied.

Every quotient must name its equivalence group and prove that the transformation preserves the frozen graph/render law.

Until that gate is approved, the authoritative E5 number is the **addressed structural count**, not a symmetry-reduced estimate.

## Safety against combinatorial explosion

For exact N=12 census, use dynamic programming / state compression where possible. If simple-path enumeration cannot be completed exactly with available resources, report a proven bound and keep that metric OPEN; do not substitute Monte Carlo estimates as exact counts.

## Required outputs

- `hnk-e5-glyph-space-census.v1.json`
- `HNK-E5-GLYPH-SPACE-CENSUS-REPORT.md`
- reproducible census executor under `scripts/`

## E5 completion gate

E5 closes only when the primary N=12 addressed structural count is independently reproducible and its path law is explicit. Symmetry-reduced and semantic counts may remain later gates.
