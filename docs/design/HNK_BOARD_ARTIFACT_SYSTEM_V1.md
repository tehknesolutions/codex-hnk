# HNK BOARD ARTIFACT SYSTEM V1

Status: **proposed / implementation baseline**

## 1. Purpose

A visual board in HNK is not a loose generated image. It is a versioned editorial artifact with three synchronized representations:

1. **board-img** — the rendered visual reference (PNG/WebP/SVG when appropriate);
2. **board-doc** — the human-readable editorial specification and provenance;
3. **board-code** — the structured data and renderer used by web/mobile/admin.

This keeps the Codex reproducible, editable and traceable across the premium digital edition, the HNK platform and future export pipelines.

## 2. Board families

### chapter-overview
Dense editorial map of one Sephira/chapter. May include chapter range, world, level, attributes, oracular keys, conceptual pillars, angelic cycles, portal days and XP progression.

This is the family revealed by the recent Chokmah infographic experiment. It must **not** be classified as `key-art`.

### cycle-overview
Visual summary of one five-day cycle, its angel, focus, practice, attributes and progression.

### day-board
One-day editorial board derived from the canonical day. It complements, but never replaces, the exact canonical text.

### portal-board
Transition board for chapter/world/level thresholds such as Day 036.

### system-board
Explanatory board for RPG attributes, Tree of Life, mastery tracks, journal, scanner, audio or onboarding systems.

### concept-board
Exploration-only board used to compare visual directions. A concept board is never silently promoted to a published asset.

## 3. Separation from other asset kinds

- `key-art`: cinematic identity image, low text density, high symbolic/emotional value.
- `background`: atmospheric surface behind UI/content.
- `diagram`: instructional or structural explanation.
- `thumbnail`: small recognition image.
- `board`: editorial composition combining structured information into one navigable surface.

A board can contain small decorative art, but it is fundamentally information architecture.

## 4. The triple artifact contract

Every approved board SHALL have the same stable key across all three layers.

Example key:

`chokmah-chapter-overview-v1`

Recommended paths:

```text
assets/boards/chapter/chokmah/v1/chokmah-chapter-overview.webp
assets/boards/chapter/chokmah/v1/README.md
packages/assets/src/boards/chokmah-chapter-overview.ts
```

The image path is the rendered artifact. The README or linked design document is the editorial/provenance record. The TypeScript module is the machine-readable source for code renderers.

## 5. Source-of-truth rules

Boards never become a new doctrinal source of truth.

Textual hierarchy:

1. canonical Codex day/chapter source;
2. normalized platform data synchronized from the canonical source;
3. board structured data derived from that source;
4. rendered board image.

If the generated image contains text that differs from source data, the image is wrong. The source is not changed to match the image.

## 6. Required board metadata

Each board must record:

- `id` and `slug`;
- `family`;
- `scope` and `scopeId`;
- semantic version;
- lifecycle state;
- source references;
- render targets;
- image path when a render exists;
- content checksum when available;
- generation/render provenance when applicable;
- accessibility summary/alt text;
- mobile-density policy;
- sections represented;
- explicit forbidden additions.

## 7. Lifecycle

```text
planned -> structured -> rendered -> review -> approved -> published
                                     \-> rejected
```

`structured` means board-doc + board-code exist and validate, even if no final image render has been approved.

`rendered` means an image or HTML render exists, not that it is approved.

Only `published` boards may be treated as production assets.

## 8. Rendering model

The primary long-term representation should be data-driven HTML/React rather than text baked into an AI image.

Recommended pipeline:

```text
Canonical content
    -> Board data object
        -> React renderer
            -> responsive web/mobile surface
            -> print/PDF screenshot/export
            -> PNG/WebP board-img
```

Generative imagery may supply atmosphere, ornaments or key art fragments, but factual chapter/day text should come from structured data.

## 9. Responsive behavior

A chapter overview board can be landscape/dense for document export, but the code version must reflow.

Targets:

- `print-landscape`: dense overview;
- `desktop`: multi-panel board;
- `tablet`: reduced columns;
- `mobile-390`: stacked panels with no microscopic text;
- `thumbnail`: summary only, never the full information board shrunk illegibly.

This preserves the Visual Bible rule that geometry and information remain legible on small screens.

## 10. Visual Bible alignment

Boards inherit `HNK SACRED EDITORIAL FANTASY`:

- sacred editorial composition;
- cinematic but operational;
- light as state;
- gold as material, not generic yellow border;
- deep darkness without sacrificing legibility;
- geometry with functional meaning;
- no generic SaaS dashboard;
- no decorative symbol inflation;
- no invented canonical glyphs, angels or sacred text.

A dense board may use HUD grammar, but its hierarchy must remain editorial first.

## 11. Evaluation of the Chokmah infographic experiment

### What worked

- clear chapter-level hierarchy;
- strong premium dark/gold/blue editorial language;
- good sense of codex + instrument panel;
- strong grouping for metadata, engineering and cycles;
- immediately suggests a reusable chapter-overview family.

### What must change before production

- do not let image generation invent or rewrite source text;
- do not treat AI-rendered small text as authoritative;
- reduce ornamental symbol invention;
- keep sacred names and correspondences sourced, not improvised;
- separate chapter board from key art;
- create responsive code instead of relying on one fixed raster composition;
- generate the final raster only from approved structured content/layout.

## 12. Implementation decision

HNK will use **Board as Data**.

The first implementation lives in `packages/assets` and defines the board contract independently from any one UI renderer. Web, mobile, admin and document-export layers consume the same board object.

The initial reference board is Kether Chapter Overview V1 because Kether is the active validated vertical slice. Chokmah may use the same renderer later without being promoted to canonical content prematurely.

## 13. Definition of done for one board

A board is production-ready only when:

- source references resolve;
- structured data validates;
- board-doc exists;
- code renderer works at 390px and desktop;
- visual export exists;
- accessibility text exists;
- provenance is recorded;
- review state is `approved`;
- registry state is `published` when released.
