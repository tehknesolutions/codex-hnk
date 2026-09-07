# Kether Chapter Overview — Board V1

Asset key: `kether-chapter-overview-v1`

Lifecycle: **rendered**

Family: `chapter-overview`

Scope: `chapter / kether`

## Purpose

This board is the editorial overview surface for Chapter 1 — Kether, Days 1–36. It is designed to exist simultaneously as:

- a premium digital magazine/grimoire spread;
- a responsive coded board in the HNK platform;
- an exported lossless `board-img` master;
- a PDF document generated from the same coded source.

It is intentionally distinct from `kether-key-art`.

## Visual direction

Use `HNK SACRED EDITORIAL FANTASY` with dense editorial hierarchy rather than generic dashboard grammar.

Kether-specific material language:

- deep fertile black;
- intense white origin light;
- restrained gold as material/authority;
- blue only when canonically/contextually required;
- sacred geometry as structure, not ornament;
- minimal particle use;
- strong negative space around the crown/origin hierarchy.

## Information architecture

The code representation carries:

1. chapter identity and range;
2. Sephira / World / Level / Attribute focus;
3. chapter thesis;
4. seven five-day cycles;
5. Day 036 portal to Chokmah;
6. source/provenance references;
7. responsive render targets.

The final visual export may compress or regroup these fields, but may not invent new doctrine, sacred names, correspondences or factual chapter metadata.

## Render outputs

Lossless image master:

`assets/boards/chapter/kether/v1/kether-chapter-overview.png`

Document export:

`assets/boards/chapter/kether/v1/kether-chapter-overview.pdf`

Export manifest with dimensions and SHA-256 checksums:

`assets/boards/chapter/kether/v1/export-manifest.json`

Code source:

`packages/assets/src/boards/kether-chapter-overview.ts`

Document source:

`assets/boards/chapter/kether/v1/README.md`

Renderer:

`apps/web/app/boards/_components/HnkBoardRenderer.tsx`

Export command:

`pnpm export:board -- --id kether-chapter-overview-v1 --route /boards/kether --out assets/boards/chapter/kether/v1`

The export command expects the web app to be available at `HNK_BOARD_BASE_URL` (default `http://127.0.0.1:3000`). The GitHub Actions Board Export workflow builds/starts the app and runs this command automatically.

## First verified render

The first verified deterministic export was produced by GitHub Actions run `33757614148`, artifact `9894117800`.

- PNG dimensions: `1440 × 2449`
- PNG SHA-256: `d2e136be7e7f3f12265c5c74b7595fe178c8741ab25e682f386219e7753cb5fc`
- PDF SHA-256: `de1600b9abb89dd8756fc6890e4ee7cca92fb1f7f4326593d0cf90867d7e4ef6`
- Artifact digest: `sha256:98b41e4b73fdfa106a991ad03f076ed9d90f476253cd162711335be438b3486e`

Visual QA: the PNG and single-page PDF render without clipping or broken layout. The composition is functionally strong, but it remains too close to an editorial dashboard to qualify as final HNK release art. It therefore remains **rendered/generated**, not `approved` or `published`.

## Approval rule

A render becoming available advances the artifact to `rendered`; it does not make it `approved` or `published` automatically. The next visual pass must increase the sacred editorial/grimoire character while preserving the structured-data renderer and legibility.
