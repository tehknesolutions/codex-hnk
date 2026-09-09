# HNK Ansuz Canonical Reference Freeze V1

Status: **CANONICAL REFERENCE FROZEN / RUNTIME QA PENDING**

Scope: shared runic reference; Portal 109 transition `Thurisaz → Ansuz`.

## 1. Canonical identity

- Unicode code point: `U+16A8`
- Unicode name: `RUNIC LETTER ANSUZ A`
- canonical glyph identity: `ᚨ`

Normative references:

- Unicode NamesList Runic block: `https://www.unicode.org/charts/nameslist/n_16A0.html`
- Unicode 17.0 UnicodeData: `https://www.unicode.org/Public/17.0.0/ucd/UnicodeData.txt`

The HNK orientation is upright and not mirrored, matching the same Unicode-identity governance already used for Thurisaz.

## 2. HNK master asset

Canonical asset:

`assets/canonical/shared/runes/ansuz-hnk-master-v1.svg`

Git blob SHA-1:

`207e19dfb7ce097e39e1c7fcb7c9e91e4674c80a`

Deterministic file SHA-256:

`79449e97af47e731f66155ca3ad4847e06fd937ef7953ed837323a02fae3f97a`

Asset characteristics:

- 200 × 240 viewBox;
- no runtime font dependency;
- no embedded third-party binary or copied vector path;
- project-authored geometric rendering anchored to U+16A8 identity;
- vertical stave with two right-facing descending branches;
- upright orientation;
- mirroring forbidden;
- transparent background;
- black structural stroke with red inner stroke for parity with the existing HNK runic master family.

## 3. Provenance / rights

The SVG geometry is authored inside the HNK project. Unicode is used only as the normative character identity/name source. No Unicode font file or third-party glyph vector is redistributed.

## 4. Portal 109 role

The Chapter 3 source plan explicitly freezes the oracular transition:

`Thurisaz → Ansuz`

This freeze resolves the target-rune identity and asset. It does not assign a new magical effect, causal mechanism or empirical property to the rune.

## 5. Runtime boundary

Web may render the SVG directly. Native/raster derivatives require visual parity QA. No renderer may mirror the glyph or substitute a lookalike and call it canonical.
