# HNK40 → E5 Hybrid Projection Architecture — Design

Date: 2026-09-27
Status: DESIGN_APPROVED / SPEC_REVIEW_REQUIRED
Branch: `research/hnk40-legacy-e5-bridge`

## Intent

Preserve HNK40 historical identity exactly while allowing HNK-KODESCRIPT/E5 to represent one or more derived simple-path projections without inventing a forced 1:1 mapping.

The architecture must preserve the strongest current research result: 38/40 HNK40 records have a unique derived E5 projection under the V4 structural heuristic, while G17 and G20 remain structurally ambiguous. Ambiguity is data, not an error to hide.

## Design decision

Adopt the hybrid model (C):

`LEGACY_IDENTITY → E5_PROJECTION_SET[] → RESOLUTION_STATUS → ACQUISITION`

A legacy identity is immutable. Its projection set may contain one or multiple E5 candidates. A future independently governed rule may select a preferred projection without deleting historical candidates or rewriting the legacy source.

## Domain model

### LegacyIdentity

Represents the immutable HNK40 source identity.

Required fields:
- `glyphId`: `G01`…`G40`;
- `sourceRef`: locator for the verified legacy source;
- `sourceFingerprint`: integrity reference/hash where available;
- `legacyPath`: original walk, including legal revisits;
- `authority`: `HNK40_LEGACY`.

### E5Projection

A derived E5 candidate.

Required fields:
- `projectionId`: stable deterministic identifier;
- `path`: exactly 12 unique E5 addresses;
- `derivationRule`: versioned rule identifier;
- `metrics`: structural evidence used by that rule;
- `authority`: `DERIVED_STRUCTURAL`;
- `canonical`: always `false` unless separately promoted by an explicit future governance action.

### HybridProjectionRecord

Required fields:
- `legacyIdentity`;
- `projectionSet`: array of `E5Projection`;
- `resolutionStatus`;
- `preferredProjectionId`: nullable;
- `resolutionEvidence`: nullable/versioned;
- `acquisitionEligibility`.

Allowed `resolutionStatus` values:
- `DIRECT`;
- `DERIVED_UNIQUE`;
- `DERIVED_AMBIGUOUS`;
- `NO_E5_PROJECTION`;
- `PENDING_RULE`.

### Preferred projection rule

`preferredProjectionId` MUST be null for `DERIVED_AMBIGUOUS` unless an independently governed identity-bearing rule explicitly resolves the ambiguity.

Selecting a preferred projection does not delete alternate candidates.

## Current HNK40 state

The V1–V7 research chain establishes the current input state:

- G01, G11, G21, G31: direct E5 simple paths;
- 34 additional glyphs: unique V4-derived projection candidates;
- G17, G20: two tied V4 candidates each and therefore `DERIVED_AMBIGUOUS`;
- total unique/direct resolution: 38/40;
- no packet, CRC, semantic, phonetic, transliteration, PUA, visual, numerological or independently governed identity field currently resolves G17/G20.

The V4 scoring model remains research-derived, not canonical HNK semantics. Its output must be labeled accordingly.

## Acquisition semantics

The acquisition layer consumes projection state rather than pretending every glyph has a single E5 answer.

- `DIRECT`: eligible as high-confidence structural training/evaluation evidence.
- `DERIVED_UNIQUE`: eligible only with provenance retaining the derivation rule and research authority.
- `DERIVED_AMBIGUOUS`: all candidates remain visible; supervised acquisition MUST NOT silently choose one.
- `NO_E5_PROJECTION`: excluded from E5 target training but retained in legacy datasets.
- `PENDING_RULE`: retained but unresolved.

Held-out and benchmark partitions must preserve resolution status so ambiguity cannot leak into a single-answer evaluation label.

## Invariants

1. HNK40 cardinality remains exactly 40.
2. Legacy source data are never mutated by projection generation.
3. Every E5 projection contains exactly 12 unique addresses.
4. Every derived projection identifies the exact derivation-rule version.
5. Ambiguous candidates are preserved as a set.
6. No arbitrary lexicographic, glyph-ID, semantic, phonetic, visual, numerological, PUA or CRC tie-break is permitted.
7. A future resolution is append-only evidence: it may set `preferredProjectionId` but may not erase prior candidates.
8. Canonical promotion is a separate governance action and is never implied by successful derivation.
9. Direct and derived identities remain distinguishable in datasets and APIs.
10. G17/G20 remain unresolved until independent evidence exists.

## Persistence artifacts

Create a versioned schema and generated corpus artifact rather than modifying the HNK40 legacy files.

Planned artifacts:
- `spec/hnk40-e5-hybrid-projection.schema.json` — machine-readable contract;
- `scripts/hnk40-e5-hybrid-projection.mjs` — deterministic generator/validator;
- `docs/research/mandala/final/hnk40-e5-hybrid-projection.v1.json` — generated 40-record research artifact;
- tests validating cardinality, uniqueness, provenance, ambiguity and non-mutation.

## API/consumer behavior

Consumers must branch on `resolutionStatus`.

A consumer requesting a single E5 projection:
- receives the sole/direct candidate for `DIRECT` or `DERIVED_UNIQUE`;
- receives an explicit ambiguity result plus candidate set for `DERIVED_AMBIGUOUS`;
- receives no projection for `NO_E5_PROJECTION`/`PENDING_RULE`.

No convenience API may silently collapse an ambiguous set.

## Verification gates

The implementation is accepted only when automated tests establish:

- exactly 40 hybrid records;
- exactly 4 `DIRECT` under current evidence;
- exactly 34 `DERIVED_UNIQUE` under current V4 research rule;
- exactly 2 `DERIVED_AMBIGUOUS`: G17 and G20;
- G17 and G20 each retain both tied candidates;
- all projection paths are N=12 simple paths;
- legacy source fixture/hash remains unchanged;
- no preferred projection is assigned to G17/G20;
- repeated generation is byte-for-byte deterministic;
- acquisition export preserves ambiguity rather than emitting a fabricated single target.

## Non-goals

This design does not:
- canonize the V4 heuristic;
- resolve G17/G20;
- rewrite HNK40 legacy walks;
- assign new meanings to glyphs;
- use semantic relations as geometric selectors;
- require a bijection between historical and E5 identity spaces.

## Future extension

If a separately governed identity-bearing rule is discovered or approved, a new rule version may attach `resolutionEvidence` and `preferredProjectionId` to an ambiguous record. The original projection set and legacy evidence remain intact for reproducibility and audit.