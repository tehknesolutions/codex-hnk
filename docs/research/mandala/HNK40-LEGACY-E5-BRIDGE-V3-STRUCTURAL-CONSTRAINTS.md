# HNK40 Legacy → E5 Bridge — V3 Structural Constraints

Status: RESEARCH_RESULT / NON-CANONICAL
Branch: `research/hnk40-legacy-e5-bridge`

Source: `docs/research/mandala/final/hnk40-e4-genesis-projection.v1.json` (SHA `ae6481cc86bc50bb653451b6f24d282434467f2f`).

## V3-A — V2-B plus exact endpoint preservation

Rule:
- preserve the first address;
- preserve only ANGULAR/RADIAL edge class at each position;
- require a simple 12-address path;
- require the final address to equal the legacy final address.

Result:
- 18 glyphs: zero candidates;
- 18 glyphs: exactly 2 candidates;
- 4 glyphs: exactly 5 candidates (G01, G11, G21, G31).

Thus endpoint preservation is a useful structural constraint, but it does not identify a unique bridge for any of the 36 legacy-repeating glyphs.

## V3-B — endpoint-preserving candidates + minimum positional edit distance

Distance tested: Hamming distance over the 12 path positions against the legacy source path. This is an exploratory structural heuristic only; it is not canonical.

For the 18 glyphs with two endpoint-preserving candidates, minimum Hamming distance selected one unique candidate in every case. For G01/G11/G21/G31, the original path itself remains the unique distance-0 candidate.

However, the other 18 glyphs have no candidate under exact endpoint preservation. Therefore minimum Hamming distance cannot by itself provide a 40/40 bridge.

## Important limitation

The endpoint and Hamming experiments do NOT establish a valid HNK40→E5 acquisition rule. They show only how far source-derived structural constraints can narrow the search.

In particular, selecting a bridge by “minimum edits” would introduce an optimization criterion that is not presently encoded as a canonical HNK rule. It must remain a research heuristic until independently justified by existing HNK40 protocol data or another explicit specification.

## Structural observation

The 40 records are organized into four 10-glyph families by their layer/radial profiles, while their E1 ordinal deltas are mathematically determined by layer and sector transitions. Therefore E1 ordinals do not constitute an independent selector when the address geometry itself is already being constrained.

## Next gate: V4

Search for a **source-internal lift function** that maps repeated legacy occurrences to distinct E5 addresses without choosing by meaning. Candidate families to test:

1. occurrence index of repeated addresses;
2. first/last occurrence role;
3. local turn/reversal state;
4. radial depth at the occurrence;
5. sector displacement accumulated since the previous radial transition;
6. family-preserving transformations across the four 10-glyph blocks;
7. reversibility/involution constraints.

Acceptance criteria:
- deterministic;
- reproducible;
- 40/40 coverage;
- 12 unique E5 addresses per glyph;
- no mutation of HNK1/legacy source;
- no semantic or phonetic selector;
- no canonical promotion until the rule is explicitly approved.
