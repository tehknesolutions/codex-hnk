# HNK Thurisaz Canonical Reference Freeze V1

Status: **CANONICAL REFERENCE FROZEN / RUNTIME NATIVE INTEGRATION PENDING**

Scope: Binah · Day 079 · Hakamiah · Thurisaz

## 1. Canonical identity

The canonical semantic identity is:

- Unicode code point: `U+16A6`
- Unicode name: `RUNIC LETTER THURISAZ THURS THORN`
- canonical glyph identity: `ᚦ`

Normative references:

- Unicode NamesList Runic block: `https://www.unicode.org/charts/nameslist/n_16A0.html`
- Unicode 17.0 UnicodeData: `https://www.unicode.org/Public/17.0.0/ucd/UnicodeData.txt`

The UnicodeData record for U+16A6 is:

`16A6;RUNIC LETTER THURISAZ THURS THORN;Lo;0;L;;;;;N;;;;;`

The `N` bidi-mirroring field is frozen as the HNK **no-mirroring rule** for this asset.

## 2. HNK master asset

Canonical asset:

`assets/canonical/binah/thurisaz-hnk-master-v1.svg`

Git blob SHA-1:

`c0233d0036f80c34c06dbb3e1108fc311d4fa1a2`

Deterministic file SHA-256:

`c7e0967c30f084a9b57f864342613d1af6209de148bf9ae9b941896b6c3980ea`

Asset characteristics:

- 200 × 240 viewBox;
- no font dependency;
- no external embedded binary;
- no copied third-party vector path;
- original HNK geometric rendering anchored to U+16A6 identity;
- upright orientation;
- right-facing angular wedge;
- explicitly not mirrored;
- transparent background;
- black structural stroke `#111111` with red inner stroke `#B3192E`, satisfying the Chapter 3 red/black requirement without changing topology.

## 3. Provenance / rights

The SVG geometry is authored inside the HNK project. No Noto font file, Wikimedia SVG or other third-party binary/vector is embedded or redistributed.

Unicode is used only as the normative character identity/property source. The HNK SVG is a project-owned rendering of that identity.

## 4. Editorial relation

Chapter 3 requires Day 079 to meditate on Thurisaz in red/black. The editorial candidate already separates traditional/symbolic use from claims of objective psychic attack or invulnerability.

This freeze resolves the former `REFERENCE_REVIEW` ambiguity:

- exact character identity: frozen;
- orientation: frozen;
- no-mirroring: frozen;
- palette: frozen;
- master asset: frozen;
- checksum: frozen;
- provenance: frozen.

## 5. Runtime disposition

Web can render the canonical SVG directly.

The current Mobile dependency set does not contain `react-native-svg`. Native production integration must therefore choose a deterministic supported path (for example an approved raster derivative or a future shared vector renderer) and prove visual parity against this master.

That renderer work is a **G7/runtime QA item**, not a reason to keep the editorial canonical reference undefined.

No Native implementation may substitute a font glyph or mirrored lookalike and call it canonical without parity review.

## 6. Promotion disposition

Day 079 G4 `REFERENCE_REVIEW` is resolved for canonical editorial promotion.

The Day may be promoted to `content/canon` and immutable-sync'd into `codex_days`, while final user-facing runtime remains subject to renderer/QA gates.
