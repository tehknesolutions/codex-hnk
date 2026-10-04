# HNK Chromatic Genesis — Governed Energy Glyph Path Selection Spec v0.1

Status: RESEARCH / HNK:CANDIDATE
Applies first to: `CG-ENERGY-001 / ZARENU`
Parent plan: `docs/superpowers/plans/2026-10-04-chromatic-genesis-glyph-manifestation.md`

## 1. Purpose

Define how an Energy Object may constrain selection or generation of a legal Mandala traversal without confusing semantics, geometry, color, ordinal position, or aesthetic preference.

This specification creates a deterministic research selection contract. It does not assign canonical semantic meaning to Mandala addresses.

## 2. Existing structural authority

The Mandala V1 architecture defines a glyph structurally as:

`GLYPH := START_ADDRESS + ORDERED_PATH + EDGE_SEQUENCE + TRANSFORM_PROFILE`

Available major namespaces are `MF`, `CG`, `CR_T`, `CR_H`, and `CR_D`. `HC` remains reserved/non-addressable. The HNKP2 candidate transport provides namespace enums and edge enums, but enum availability does not itself authorize an edge; active topology remains authoritative.

## 3. Separation invariant

```text
ENERGY SEMANTICS != MANDALA ADDRESS SEMANTICS
ENERGY COLOR != GLYPH IDENTITY
LEXEME G-ID != ENERGY GLYPH PATH
ORDINAL POSITION != PATH SEED
VISUAL PREFERENCE != BINDING AUTHORITY
```

A semantic profile may constrain **structural properties of a search**, but it may not declare that a particular Mandala cell 'means' mind, space, power, life, consciousness, etc. unless a separate provenance-bearing binding is later approved.

## 4. Input contract

A path-selection request MUST contain:

- `semanticId`
- `authorityState`
- `forceProfile.intentVector[]`
- `forceProfile.tendency`
- `formProfile.constraints[]`
- `lexicalBinding.lexeme`
- `lexicalBinding.authorityState`
- `selectionProfileVersion`
- `topologyProfileVersion`
- `candidateCount`
- `pathLengthBounds`
- `deterministicSeedMaterial`

For v0.1, deterministic seed material is a normalized serialization of the research identity and semantic/form constraints, **not** a numeric reduction of gemstone/color/ordinal data.

## 5. Deterministic seed law

Seed source:

```text
seedSource = canonical-json({
  semanticId,
  lexicalBinding.lexeme,
  forceProfile.intentVector,
  forceProfile.tendency,
  formProfile.constraints,
  selectionProfileVersion,
  topologyProfileVersion
})
```

A stable cryptographic digest MAY be used to initialize candidate enumeration/order. The digest is an engineering determinism mechanism only. It has no numerological or sacred meaning.

Prohibited seed material:

- energy ordinal (`E1`, `E2`, ... ) by itself;
- RGB/HEX value;
- Marvel/Infinity Stone order;
- letter-count numerology;
- gematria unless separately governed as an explicit external correspondence experiment;
- HC observations;
- human aesthetic ranking before structural validation.

## 6. Allowed namespace policy v0.1

For the ZARENU Golden Prototype:

- `MF`: ALLOWED.
- `CG`: ALLOWED only through transitions authorized by active E2 topology.
- `CR_T`, `CR_H`, `CR_D`: STRUCTURALLY ALLOWED only if active topology authorizes the transition; their 3/7/12 structure must not be interpreted as Yetziratic semantics during path selection.
- `HC`: FORBIDDEN.

A prototype MAY choose an MF-only path if that is the strongest currently proven topology. Using more namespaces is not inherently better.

## 7. Legal edge policy

HNKP2 currently exposes:

- `ANGULAR_NEXT`
- `ANGULAR_PREV`
- `RADIAL_IN`
- `RADIAL_OUT`
- `ROSE_NEXT`
- `ROSE_PREV`
- `TO_CHOIR`
- `FROM_CHOIR`
- `CHOIR_NEXT`
- `CHOIR_PREV`

`CONTAINS`, `MEMBER_OF`, and `BRIDGE` remain blocked/reserved by the E3 transport governance record.

The selector MUST validate every transition against the active topology profile. Edge enum existence is insufficient.

## 8. Semantic-to-structural constraint adapter

Semantics may influence path search only through an explicit adapter whose outputs are topology-neutral structural preferences.

For ZARENU v0.1:

| Semantic input | Candidate structural preference | Authority |
|---|---|---|
| `perceive` | require local sampling/variation rather than a degenerate repeated edge | HNK:HYPOTHESIS |
| `model` | require recurrence or structural coherence measurable from edge sequence | HNK:HYPOTHESIS |
| `relate` | prefer paths using at least two legal transition classes | HNK:HYPOTHESIS |
| `orchestrate` | prefer a balanced ordered sequence with no single edge class monopolizing the path | HNK:HYPOTHESIS |

These rules describe **path morphology**, not address meaning. They remain replaceable research hypotheses.

## 9. ZARENU candidate invariants v0.1

A candidate path is eligible only if:

1. every address is valid under the active address registry;
2. every transition is legal under the active topology profile;
3. HC never appears;
4. path length is within declared bounds;
5. at least two legal transition classes occur when topology permits;
6. no immediate A→B→A oscillation dominates the path;
7. path and edge sequence are deterministic for the same input/profile;
8. serialized HNKP representation round-trips to the exact ordered path where the namespace profile is transport-supported;
9. candidate differs structurally from reserved/selected benchmark paths above a declared minimum distance;
10. all selection metrics and rejection reasons are persisted as evidence.

## 10. Candidate generation and ranking

Pipeline:

```text
Energy Object
→ normalize governed input
→ deterministic seed
→ enumerate legal candidate traversals
→ hard-filter topology/invariants
→ calculate structural metrics
→ apply semantic-to-structural preference scores
→ collision/distance filter
→ deterministic ranking
→ research lead
→ Human Gate
```

Hard validity filters always precede semantic preference scoring. A high semantic score can never rescue an illegal path.

## 11. Ranking dimensions

Candidate ranking MAY use:

- topology legality: mandatory pass/fail;
- determinism: mandatory pass/fail;
- transport round-trip: mandatory where applicable;
- structural uniqueness/distance;
- edge-class diversity;
- oscillation penalty;
- recurrence/coherence metric;
- path compactness/extent metric;
- semantic-adapter preference score.

Visual beauty is deliberately absent from machine ranking v0.1.

Visual review occurs only after a structurally valid research lead exists.

## 12. Collision law

The ZARENU Energy Glyph MUST NOT be selected by reusing a HNK40 glyph because its index or appearance feels appropriate.

Before lead selection, compare candidate path identity against:

- HNK40 Genesis candidate ordered paths;
- already selected Chromatic Genesis Energy Glyph paths;
- any reserved path registry that becomes available.

Exact path collision is rejection. Near-collision threshold is a research parameter and must be recorded rather than hidden.

## 13. Transform profile

`TRANSFORM_PROFILE` is part of glyph identity and MUST be explicit. It may define normalization/rotation/reflection/render-space operations only when such operations are already licensed by the active glyph architecture.

No transform may be chosen solely to make the glyph resemble an external occult, Marvel, planetary, alchemical, or alphabetic symbol.

## 14. Evidence record

Each generated candidate SHOULD emit:

```json
{
  "candidateId": "...",
  "semanticId": "CG-ENERGY-001",
  "seedDigest": "...",
  "topologyProfile": "...",
  "startAddress": "...",
  "orderedPath": [],
  "edgeSequence": [],
  "transformProfile": "...",
  "metrics": {},
  "hardValidation": {},
  "semanticPreferenceScores": {},
  "collisions": [],
  "rejectionReasons": [],
  "authorityState": "HNK:CANDIDATE"
}
```

Rejected candidates are useful evidence and SHOULD be retained when practical.

## 15. Human Gate

The machine may nominate a research lead. It may not canonize it.

Human review receives:

- path record;
- structural metrics;
- collision report;
- packet round-trip evidence;
- rendered preview;
- provenance;
- semantic adapter version;
- explicit statement that address semantics were not inferred.

Available decisions:

- `SELECT_RESEARCH_LEAD`
- `REQUEST_NEW_CANDIDATES`
- `REVISE_SEMANTIC_ADAPTER`
- `REJECT_PATH_FAMILY`
- `HOLD_UNRESOLVED`

Canonical promotion remains a later, separate gate.

## 16. Golden Prototype next implementation

The next implementation step is a ZARENU path-candidate validator/generator that consumes `CG-ENERGY-001.ZARENU.v0.1.json`, the active Mandala address/topology registries, and HNK40 benchmark paths.

The first generated artifact MUST be machine-readable evidence before any decorative TKN rendering is produced.

## 17. Decision

Chromatic Genesis adopts **semantic-constrained structural search** rather than semantic assignment of Mandala cells.

This preserves the HNK authority boundary while allowing Energy Objects to generate reproducible, inspectable, computational glyph candidates.
