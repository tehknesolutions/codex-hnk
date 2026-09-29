# HNK Lexeme ↔ Glyph Structural Binding Contract V1

**Contract ID:** HNK-LEXEME-GLYPH-STRUCTURAL-BINDING-V1  
**Version:** 1.0.0  
**Status:** HNK_APPROVED_BY_TW  
**Authority:** CODEX-HNK  
**Consumer:** HNK-KODE / haKodan

## Purpose

Define the structural boundary for binding canonical HNK-language lexemes to Mandala/HNK-MATH glyph identities.

## Structural rule

A canonical linguistic binding MUST reference a glyph identity that is reconstructible from versioned HNK Mandala structure.

Canonical glyph identity is not a bitmap or codepoint.

```text
GLYPH := { AK_SET, ORDERED_PATH, FIELD_STATE, RELATIONS }
```

and may be represented by MHCM as:

```text
START_CELL + PATH + EDGE_SEQUENCE + TRANSFORM
```

## Authority boundary

CODEX-HNK governs:
- ROOT constants;
- AK identities;
- Mandala topology;
- legal structural paths/edges;
- structural family evidence;
- geometric provenance.

HNK-KODE governs:
- lexeme identity;
- semantic ID;
- namespace;
- phonological/grammatical/semantic payload;
- explicit lexeme↔glyph binding;
- linguistic canon promotion.

SIGILKODE-HNK may render/compile a bound glyph but cannot create HNK semantic authority.

## Binding requirements

A HNK-KODE canonical lexeme may bind only when:
1. the lexeme is explicitly canonical;
2. the structural glyph candidate is valid under the versioned Mandala/HNK-MATH rules;
3. the candidate is render-distinct and reversible to its structural identity;
4. collision/confusion checks are recorded;
5. provenance is complete;
6. HNK40 benchmark/collision review is complete where applicable;
7. HNK-KODE records the linguistic binding;
8. Creator/Human Gate approves the binding;
9. tests validate the canonical record.

## Prohibited shortcuts

The following are not sufficient structural identity or promotion evidence:
- sequential numeric allocation;
- hash-derived assignment by itself;
- visual similarity;
- color;
- codepoint;
- bitmap/SVG;
- external correspondence;
- numerological convenience.

## Projection rule

Unicode/PUA, binary, hexadecimal, pixel, isopixel, voxel and rendered sigil forms are projections after structural identity.

No final codepoint is assigned before a canonical binding exists.

## Initial queue

Existing canonical lexemes AHNUVA, EMANU, HAYA, HODERU and KODAN are eligible to enter structural candidate search. This contract assigns no PATH to them.

## Change rule

Any change to the structural identity law or ROOT constants requires a versioned CODEX-HNK contract update. Linguistic rebindings require versioned HNK-KODE provenance and migration records.
