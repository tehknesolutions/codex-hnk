# HNK Chromatic Genesis Glyph Manifestation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Manifest the selected Chromatic Genesis lexical candidates as provenance-bearing lexical glyph bindings, Energy Objects, governed Mandala-path Energy Glyphs, Composite Sigils, packets, and TKN rendering evidence without promoting unresolved semantics to canon.

**Architecture:** Preserve independent identity layers: lexeme/G-ID sequence, Energy Object Force/Form semantics, Mandala path geometry, Composite Sigil composition, and transport/rendering evidence. Reuse existing HNK40/MHCM and `@hnk/glyphs`/`@hnk/linguas` contracts rather than creating a parallel runtime. Every generated edge remains inspectable and authority-bearing.

**Tech Stack:** Node.js ESM; existing `@hnk/glyphs`; existing `@hnk/linguas`; HNK40/MHCM registries; JSON/Markdown research artifacts; existing repository test conventions.

**Spec:** `docs/spec/HNK-CHROMATIC-GENESIS-ROOT-SPEC-v0.1.md`

## Global Constraints

- Selected lexical candidates are Human-Gate selected CANDIDATES, not HNK_CANON.
- `CG-ENERGY-006` remains `HOLD_UNRESOLVED`; no lexeme or glyph identity may be fabricated for it.
- `SOLENU` and `MALORA` retain external-resonance review flags.
- No `6 energies = 6 runtime operators` shortcut; operator mappings remain many-to-many candidates.
- Energy Glyphs must derive from governed Mandala paths; do not assign G01–G06 by ordinal convenience.
- Lexical Glyph identity and Energy Glyph identity remain independent until an explicit Composite Sigil relation is created.
- HC remains semantically unresolved.
- CR22↔SY22 remains correspondence candidate, not identity.
- No Marvel names, stone identities, glove topology, or recognizable Infinity Gauntlet geometry enters canonical assets.
- Human Gate remains required for promotion.

## Review Focus

1. Accidental semantic promotion caused by naming or file placement.
2. Path selection that is aesthetically convenient but semantically ungoverned.
3. Collision between selected lexemes and existing HNK authored/master lexicons.
4. Loss of provenance between lexeme, G-ID, path, packet, and rendered artifact.
5. Rendering code that makes color the identity rather than a manifestation of the Energy Object.

## Task 1 — Freeze selected lexical bindings as research data

**Deliverable:** Machine-readable registry for ZARENU, TAVERO, DURAKA, NAVIRA, SOLENU, MALORA, TSAVERI, KETARA, NOMURA plus explicit E6 hold.

- [ ] Create `docs/research/chromatic-genesis/data/cg-lexical-selections.v0.1.json` with Semantic ID, selected form, gate state, review flags, authority state, provenance pointers, and E6 hold.
- [ ] Add exact G-ID sequence fields derived through the existing strict transliteration contract.
- [ ] Add IPA derived from existing glyph phoneme bindings; do not preserve provisional IPA when runtime-derived IPA differs.
- [ ] Add tests/validation script that fails on unresolved surface units, duplicate selected forms, or missing provenance.
- [ ] Run the validation and record evidence in `docs/research/chromatic-genesis/evidence/`.
- [ ] Commit as an isolated change.

## Task 2 — Define the Energy Object research schema

**Deliverable:** Schema that separates semantic identity from visual/material manifestation.

- [ ] Create `docs/research/chromatic-genesis/schema/hnk-energy-object.v0.1.schema.json`.
- [ ] Require: semantic ID, authority state, provenance, force profile, form profile, chromatic field, operator bindings, Mandala bindings, lexical binding, conflicts, manifestation rules.
- [ ] Make `glyph`, `operator`, Genius, astrology, alchemy, and external correspondence bindings optional and authority-tagged.
- [ ] Encode a rule that a chromatic value alone cannot satisfy an Energy Object.
- [ ] Add positive fixtures for E1–E5/M1–M4 and a negative fixture proving unresolved E6 cannot masquerade as resolved.
- [ ] Validate fixtures and commit.

## Task 3 — Materialize selected Energy Objects

**Deliverable:** Nine non-canonical Energy Object records plus one explicit unresolved E6 record.

- [ ] Create `docs/research/chromatic-genesis/data/energy-objects/`.
- [ ] Materialize `CG-ENERGY-001` through `005`, `CG-META-001` through `004`, and unresolved `CG-ENERGY-006`.
- [ ] Attach selected lexeme/G-ID data without treating it as final canonical language.
- [ ] Encode Force/Form profiles from the approved ROOT SPEC and Matrix 003.
- [ ] Preserve candidate operator affinities as candidate edges only.
- [ ] Validate all records against the schema.
- [ ] Commit.

## Task 4 — Define governed Mandala path-selection constraints

**Deliverable:** A deterministic research contract for selecting/generating an Energy Glyph path.

- [ ] Audit existing HNK40 path generator, namespace extension, edge vocabulary, transform profile, and uniqueness checks.
- [ ] Create `docs/research/chromatic-genesis/HNK-CG-GLYPH-PATH-SELECTION-SPEC-v0.1.md` documenting allowed inputs and prohibited shortcuts.
- [ ] Define semantic constraints that can affect region/path choice without asserting CR22/Yetzirah identity.
- [ ] Define path invariants: valid namespace addresses, legal edges, deterministic ordering, minimum structural distinction, packet encodability, provenance.
- [ ] Define rejection conditions for ordinal assignment, visual-only selection, semantic collision, or HC-dependent semantics.
- [ ] Commit the spec; do not generate production glyphs in this task.

## Task 5 — Golden Prototype: ZARENU Energy Glyph

**Deliverable:** First governed Mandala-path glyph candidate for `CG-ENERGY-001 / ZARENU`.

- [ ] Write a failing test/validator fixture describing required ZARENU semantic constraints and expected path invariants.
- [ ] Generate candidate Mandala paths using the existing HNK40/MHCM mechanisms.
- [ ] Reject candidates that fail legality, distinction, determinism, or provenance requirements.
- [ ] Select a research lead by declared semantic/path criteria, never by appearance alone.
- [ ] Record start address, ordered path, edge sequence, transform profile, packet representation, authority state, and rationale.
- [ ] Render a research SVG/PNG only after the path record exists.
- [ ] Run tests and record evidence.
- [ ] Commit.

## Task 6 — Lexical Glyph ↔ Energy Glyph Composite Sigil contract

**Deliverable:** A composition spec that keeps both identities recoverable.

- [ ] Define `CompositeSigil` with references to lexical glyph, Energy Glyph, composition transform, provenance, and authority.
- [ ] Require reverse resolution to both source Semantic IDs.
- [ ] Define visual hierarchy so the lexical layer cannot overwrite path geometry.
- [ ] Define TKN material channels: Obsidian substrate, Titanium structural law, Auric containment, energy-local emission.
- [ ] Define accessibility fallback where semantic labels survive without chromatic rendering.
- [ ] Commit.

## Task 7 — Render the ZARENU Composite Sigil proof

**Deliverable:** First complete symbolic manifestation artifact.

- [ ] Compose ZARENU lexical glyph and its approved research Energy Glyph using the Composite Sigil contract.
- [ ] Produce vector-first artifact and metadata sidecar.
- [ ] Generate HNK packet/transport evidence where supported by existing runtime.
- [ ] Verify reverse resolution from artifact metadata to lexical and energy identities.
- [ ] Verify no Marvel-derived recognizable topology/iconography.
- [ ] Record screenshot/render evidence and commit.

## Task 8 — Extend to the remaining selected concepts

**Deliverable:** Eight additional governed Composite Sigil candidates; E6 remains intentionally absent.

- [ ] Repeat Tasks 5–7 for TAVERO, DURAKA, NAVIRA, SOLENU, MALORA, TSAVERI, KETARA, NOMURA.
- [ ] Keep SOLENU/MALORA external-resonance flags visible in metadata.
- [ ] Run pairwise structural-distance checks so Energy Glyphs remain distinct.
- [ ] Run lexical/path collision checks.
- [ ] Commit in reviewable batches rather than one giant change.

## Task 9 — TKN Design System research bridge

**Deliverable:** Semantic token/component contract, not yet site-wide production rollout.

- [ ] Define candidate namespaces `energy.*`, `manifest.auric.*`, `meta.octarine.*`, `law.titanium.*`, `void.obsidian.*`, `glyph.*`.
- [ ] Define Energy Sigil component states: dormant, focused, active, transforming, manifested.
- [ ] Define motion/material rules derived from state rather than decorative randomness.
- [ ] Define reduced-motion and non-color accessibility behavior.
- [ ] Produce one ZARENU component proof using the TKN Arcane visual language.
- [ ] Commit evidence/spec.

## Task 10 — Golden Path evidence and promotion gate

**Deliverable:** End-to-end evidence bundle and explicit decision point.

- [ ] Demonstrate `ALEF → Semantic ID → Energy Object → Force/Form → Mandala Path → Energy Glyph → Lexical Glyph → Composite Sigil → HNK Packet → TKN rendering → MALKUTH artifact → Evidence` for ZARENU.
- [ ] Record every authority/provenance transition.
- [ ] Confirm no stage silently promotes CANDIDATE to CANONICAL.
- [ ] Update Issue #373 with evidence links and unresolved risks.
- [ ] Present the resulting ZARENU proof to the Creator Human Gate.
- [ ] Only after explicit approval, write a separate canon-promotion proposal; do not auto-promote.

## Definition of Done

The phase is complete when ZARENU has a fully traceable Golden Path proof, the remaining selected concepts have validated research-level symbolic artifacts, E6 remains explicitly unresolved, and all artifacts preserve independent lexical, semantic, geometric, transport, rendering, and authority identities.
