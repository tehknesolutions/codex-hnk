# CODEX-HNK — Visual Target V1 Design Foundation

## Status

Phase 1 of Issue #356.

This document turns the 12-source visual dissection into implementation contracts without inventing pixel values that the sources do not establish.

## Existing foundation

The repository already contains `packages/visual-contract`, including visual primitives, motion tokens, provenance and reduced-motion requirements.

This phase extends that contract with the cross-source roles identified in:

- `DEEP-DISSECTION-12-SOURCES.md`
- `VISUAL-SOURCE-REGISTRY.md`
- `VISUAL-QA-MATRIX.md`

## 1. Visual role system

### Surfaces

- `cosmic` — deep world/background layer.
- `manuscript` — parchment/document layer.
- `panel` — structured interface layer.
- `artifact` — object/ornamental layer.
- `overlay` — transient UI layer.
- `active` — selected/active state.

### Material roles

- `parchment`
- `gold`
- `obsidian`
- `glass-cosmos`
- `stone`
- `metal`

These are roles, not hard-coded CSS colors.

### Typography roles

- `display-sacred`
- `display-editorial`
- `heading-system`
- `body-editorial`
- `body-system`
- `label-upper`
- `caption`
- `numeric`
- `glyph`

## 2. Symbol taxonomy

The source analysis establishes three distinct classes:

### Canonical
A symbol with semantic authority from a canonical source.

### Functional
A UI symbol used to communicate interaction/state.

### Decorative
A visual ornament used for atmosphere/composition.

A decorative symbol must never silently become a canonical glyph.

## 3. Frame primitives

Required reusable primitives:

- `CodexFrame`
- `FrameCorner`
- `GoldRule`
- `SacredDivider`
- `ArtifactBorder`
- `ManuscriptEdge`

## 4. Portal primitives

Required reusable primitives:

- `SpherePortal`
- `PortalCard`
- `PortalCTA`
- `PortalArtwork`
- `SphereLabel`

The three sphere portals share structure while allowing theme-specific content.

## 5. Tree primitives

- `HnkTree`
- `TreeNode`
- `TreeConnection`
- `TreeLegend`

The tree must remain data-driven. Artwork must not encode node state.

## 6. Motion language

Supported semantic motion roles:

- `emission`
- `breathing`
- `response`
- `impact`
- `transmutation`

Every motion definition must provide a reduced-motion behavior.

## 7. Responsive rule

Desktop is not a scaled mobile.

Desktop prioritizes:

`world → navigation → composition`

Mobile prioritizes:

`story → action → state → next`

The information hierarchy must survive the recomposition.

## 8. Source provenance

Every derived visual implementation must identify its source IDs.

Example:

```text
SpherePortal/Kether
source: VS-02
source-region: macrocosm / Kether portal
```

When multiple sources support a component, list all source IDs.

## 9. Semantic separation

The implementation must preserve:

```
ARTWORK ≠ UI STATE ≠ DATA ≠ CANON
```

Examples:

- artwork can depict a lit tree node;
- actual node state belongs to application data;
- canonical meaning belongs to canonical content/contracts;
- CSS animation belongs to the visual system.

## 10. Performance boundary

Original source PNGs are source artifacts.

Production rendering should use derived optimized assets when available.

Semantic UI must remain real DOM/SVG rather than being baked into artwork.

## 11. QA gates

A component is visually acceptable only when:

1. silhouette matches the source role;
2. hierarchy matches;
3. material role matches;
4. geometry remains recognizable;
5. semantic interaction works;
6. responsive composition works;
7. accessibility works;
8. reduced motion works;
9. source provenance is recorded.

## 12. Implementation order

1. tokens/roles;
2. frame primitives;
3. portal primitives;
4. tree primitives;
5. glyph boundaries;
6. motion primitives;
7. Portal Home;
8. Knowledge Map;
9. Day/Chamber;
10. Practice/Journey.

