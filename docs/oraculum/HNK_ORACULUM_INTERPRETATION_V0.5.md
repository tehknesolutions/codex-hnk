# HNK ORACULUM — INTERPRETATION / CONVERGENCE V0.5

**Status:** `HNK_AUTHORED_CANDIDATE_AWAITING_HUMAN_PROMOTION`  
**Raw dependency:** `HNK-ORACULUM-CUBE/V0.4`  
**Runtime:** `@hnk/oraculum-engine@0.5.0-candidate`

## 1. Hard boundary

V0.5 never changes the V0.4 commit, SHA-256 seed, bit allocation or raw selectors. A profile is an interpretive overlay only.

`RAW V0.4 -> PROFILE V0.5 -> SIGNALS -> INDEPENDENCE FILTER -> CONVERGENCES / TENSIONS -> STRUCTURAL MALKUTH GATE`

Changing an interpretation profile must never change G01-G40 selection, I Ching lines, Tarot index, astrology raw selectors, alchemy raw selectors, colors or sigil coordinates.

## 2. Authority classes

- `SOURCE_VERIFIED`: directly grounded in the selected historical source.
- `PROFILE_VERIFIED`: a mapping valid inside one declared tradition/profile.
- `HNK_AUTHORED_CANDIDATE`: authored HNK bridge awaiting human promotion.
- `HNK_PROTOCOL`: computational rule defined by the Oraculum protocol.
- `@hnk/glyphs`: authoritative HNK glyph identity only.

No similarity, numerology, glyph shape or PUA code may create a linguistic equivalence.

## 3. Source locks

### SY_CORE_V1
Sefer Yetzirah Gra Version 1:2 is used only for the structural claim `10 Sefirot + 22 Foundation Letters = 32`, with the 22 divided into `3 Mothers + 7 Doubles + 12 Elementals`.

Source: https://www.sefaria.org/Sefer_Yetzirah_Gra_Version.1

### HERMETIC_GD_V1
The Golden Dawn profile owns the explicit Hebrew-letter / Tarot-trump / elemental-planetary-zodiacal overlay for Paths 11-32. This is not attributed to ancient Sefer Yetzirah.

Cross-check sources:
- https://www.hermetics.org/tarocchi.html
- Israel Regardie, *The Complete Golden Dawn System of Magic*, Tarot attribution tables.

### TAROT_GD_V1
Minor-suit elemental attributions are profile-scoped:
- Wands -> Fire
- Cups -> Water
- Swords -> Air
- Pentacles -> Earth

Source family: Golden Dawn Book T / Regardie.

### ICHING_KING_WEN_V1
Trigrams and hexagrams remain structurally independent from Western occult profiles. Lines are interpreted bottom-to-top. Only direct trigram images that are themselves classical elements are promoted to cross-system element signals in V0.5: `Li -> Fire`, `Kan -> Water`, `Kun -> Earth`. `Qian -> Air` is deliberately NOT inferred.

Reference: Stanford Encyclopedia of Philosophy, Chinese Philosophy of Change appendix.

## 4. Independence model

Every interpreted signal carries:

```json
{
  "category": "ELEMENT",
  "key": "FIRE",
  "family": "ICHING",
  "sourceChainId": "ICHING:PRIMARY:30",
  "score": 2,
  "authority": "ICHING_KING_WEN_V1",
  "origin": "ICHING_TRIGRAM_ELEMENT",
  "phase": "PRIMARY"
}
```

A repetition inside one dependency chain does not become independent evidence. Example: Hexagram 30 has Li below and Li above; both generate Fire, but both belong to `ICHING:PRIMARY:30`, so they cannot manufacture two independent votes.

## 5. Weight model

- direct raw selector: `3`
- independent system correspondence: `2`
- same-field profile derivative: `1`

Weights rank structure; they do not measure supernatural truth, probability or certainty.

## 6. Convergence gate

V0.5 currently permits convergence across:

- `ELEMENT`
- `PLANET`
- `ZODIAC`

A convergence exists only when the same key appears in at least **two independent families** after dependency-chain control.

## 7. Tension gate

`HNK_ELEMENT_TENSION_V1` is explicitly `HNK_AUTHORED_CANDIDATE`, not a historical claim.

Current axes:

- `FIRE <-> WATER`
- `AIR <-> EARTH`

A tension records simultaneous presence. It never marks one side false.

## 8. Golden V0.5 interpretation vector

Raw V0.4 seed remains:

`df6bcd1bfd58288fb8f7d7e0f22b69d7e305a24429ba4445c242efc000e3b6fc`

Key raw fields:

- Path 24 -> Nun -> Death -> Scorpio -> Water under `HERMETIC_GD_V1`
- Tarot 71 -> Seven of Pentacles -> Earth under `TAROT_GD_V1`
- Zodiac -> Sagittarius -> Fire
- raw element -> Air
- I Ching primary -> 30, Li over Li -> Fire
- resulting I Ching -> 23, phase-separated from primary convergence
- HNK glyph -> G39; its candidate oracle semantics remain unconsumed by default

Expected independent convergence:

`ELEMENT:FIRE = ASTROLOGY(2) + ICHING(2) = score 4`

Expected tensions:

- `FIRE <-> WATER`: `4 : 1`
- `AIR <-> EARTH`: `3 : 2`

## 9. HNK40 governance

V0.5 records the selected HNK G-ID but does not consume `HNK40-ORACLE-REGISTRY-V1` semantics by default because that registry is still awaiting explicit human promotion.

Status returned by the engine:

`hnkOracleSemantics.status = NOT_CONSUMED`

This prevents an authored candidate role from being silently treated as canon.

## 10. Malkuth gate

V0.5 does not generate prophecy prose. It returns a structural action contract:

- dominant convergence key, if any;
- one action-template ID;
- `verificationRequired: true`.

Natural-language synthesis remains a later layer and must preserve provenance.

## 11. Implementation files

- `packages/oraculum-engine/src/profiles.mjs`
- `packages/oraculum-engine/src/interpretation.mjs`
- `packages/oraculum-engine/test/interpretation.test.mjs`

## 12. Next gate

V0.6 may add human-readable synthesis and a first interactive reading surface, but it must not alter any locked V0.4 raw vector or reinterpret HNK40 candidate semantics as canon without explicit approval.
