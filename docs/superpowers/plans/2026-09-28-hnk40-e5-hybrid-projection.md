# HNK40 → E5 Hybrid Projection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved hybrid HNK40→E5 projection model with 40 deterministic records, preserving 4 DIRECT, 34 DERIVED_UNIQUE, and G17/G20 as DERIVED_AMBIGUOUS without mutating legacy evidence.

**Architecture:** Add a versioned JSON Schema, a deterministic generator over the verified HNK40 E4 source, a generated research artifact, and an acquisition export that preserves projection multiplicity. The V4 structural scorer remains explicitly research-derived and non-canonical; consumers must branch on `resolutionStatus` and may never silently collapse ambiguity.

**Tech Stack:** Node.js 22 ESM, JSON Schema Draft 2020-12, `node:test`, existing HNK40/E5 JSON research artifacts.

**Spec:** `docs/superpowers/specs/2026-09-27-hnk40-e5-hybrid-projection-design.md`

## Global Constraints

- HNK40 cardinality MUST remain exactly 40.
- Legacy source data MUST NOT be mutated.
- Every E5 projection MUST contain exactly 12 unique addresses.
- Every derived projection MUST carry an exact versioned derivation rule.
- `DERIVED_AMBIGUOUS` MUST preserve every tied candidate and MUST NOT receive `preferredProjectionId` without independent governed evidence.
- No lexicographic, glyph-ID, semantic, phonetic, visual, numerological, PUA, CRC, or transport-level tie-break is permitted.
- Canonical promotion is outside this implementation; generated projections use research/derived authority only.
- Current acceptance state is exactly 4 DIRECT + 34 DERIVED_UNIQUE + 2 DERIVED_AMBIGUOUS (`G17`, `G20`).

## Review Focus

- Malformed/repeated-address E5 candidate: reject instead of serializing an invalid projection.
- V4 score tie outside G17/G20: preserve ambiguity rather than silently choosing the first candidate.
- Legacy input cardinality or glyph IDs drift from G01…G40: fail generation loudly.
- Acquisition export receives `DERIVED_AMBIGUOUS`: emit candidate set/status, never a fabricated scalar target.
- Re-running against identical legacy input: produce byte-for-byte identical JSON ordering and projection IDs.

---

### Task 1: Hybrid Projection Contract

**Files:**
- Create: `spec/hnk40-e5-hybrid-projection.schema.json`
- Create: `test/hnk40-e5-hybrid-projection.schema.test.mjs`

**Interfaces:**
- Consumes: approved design domain model.
- Produces: schema `$id = hnk-kode/hnk40-e5-hybrid-projection.schema.json`; statuses `DIRECT | DERIVED_UNIQUE | DERIVED_AMBIGUOUS | NO_E5_PROJECTION | PENDING_RULE`.

- [ ] **Step 1: Write failing schema-contract tests** asserting required legacy identity fields, `projectionSet`, allowed statuses, N=12/`uniqueItems`, derived authority, nullable preferred projection, and the rule that ambiguous records cannot carry a preferred projection.
- [ ] **Step 2: Run** `node --test test/hnk40-e5-hybrid-projection.schema.test.mjs`; expect FAIL because schema does not exist.
- [ ] **Step 3: Implement the Draft 2020-12 schema** with strict `additionalProperties: false` boundaries and conditional constraints for ambiguous records.
- [ ] **Step 4: Run the schema test**; expect PASS.
- [ ] **Step 5: Commit** `test/hnk40-e5-hybrid-projection.schema.test.mjs` and `spec/hnk40-e5-hybrid-projection.schema.json` with `feat(hnk40): define hybrid E5 projection contract`.

### Task 2: Deterministic Projection Generator

**Files:**
- Create: `scripts/lib/hnk40-e5-hybrid-projection.mjs`
- Create: `test/hnk40-e5-hybrid-projection.generator.test.mjs`
- Read-only fixture: `docs/research/mandala/final/hnk40-e4-genesis-projection.v1.json`

**Interfaces:**
- Consumes: `generateHybridProjection(source)` where `source.records` contains the verified 40 HNK40 E4 records.
- Produces: `{ schemaVersion, source, derivationRule, summary, records }` with stable projection IDs and ordered G01…G40 records.

- [ ] **Step 1: Write failing generator tests** for: 40-record validation; G01/G11/G21/G31 `DIRECT`; 34 `DERIVED_UNIQUE`; G17/G20 `DERIVED_AMBIGUOUS`; both tied candidates retained for each; no preferred projection for ambiguity; every candidate N=12 unique; unexpected ties preserved rather than collapsed.
- [ ] **Step 2: Run** `node --test test/hnk40-e5-hybrid-projection.generator.test.mjs`; expect FAIL because generator module does not exist.
- [ ] **Step 3: Implement address parsing and frozen MF adjacency helpers** for angular next/prev and radial in/out, without semantic inputs.
- [ ] **Step 4: Implement candidate enumeration** preserving the source start address and ANGULAR/RADIAL class sequence while forbidding revisits.
- [ ] **Step 5: Implement V4 research scoring** as lexicographic tuple `(directionMismatchCount, cyclicMandalaDistance)` and retain *all* candidates tied at the minimum.
- [ ] **Step 6: Implement stable projection IDs** derived only from glyph ID, rule version, and complete candidate path; sort records and candidate sets deterministically.
- [ ] **Step 7: Implement status classification**: source path already simple and minimum score 0/0 → `DIRECT`; one minimum candidate → `DERIVED_UNIQUE`; multiple minima → `DERIVED_AMBIGUOUS`; zero candidates → `NO_E5_PROJECTION`.
- [ ] **Step 8: Run generator tests**; expect PASS and exact summary `{DIRECT:4, DERIVED_UNIQUE:34, DERIVED_AMBIGUOUS:2}` with ambiguous IDs exactly `G17,G20`.
- [ ] **Step 9: Commit** generator + tests with `feat(hnk40): generate deterministic hybrid E5 projections`.

### Task 3: Legacy Non-Mutation and Determinism Gate

**Files:**
- Create: `test/hnk40-e5-hybrid-projection.integrity.test.mjs`
- Modify only if required: `scripts/lib/hnk40-e5-hybrid-projection.mjs`

**Interfaces:**
- Consumes: `generateHybridProjection(source)` from Task 2.
- Produces: verified non-mutation and stable serialization behavior.

- [ ] **Step 1: Write failing integrity tests** that deep-clone the source before generation, assert deep equality afterward, reject source cardinality != 40 or duplicate/missing G IDs, generate twice and assert identical serialized bytes, and reject malformed candidate addresses.
- [ ] **Step 2: Run** `node --test test/hnk40-e5-hybrid-projection.integrity.test.mjs`; expect at least one FAIL until guards/serialization are complete.
- [ ] **Step 3: Add minimal validation/normalization required** to make source validation strict while leaving source objects untouched.
- [ ] **Step 4: Run Tasks 1–3 tests together** with `node --test test/hnk40-e5-hybrid-projection.*.test.mjs`; expect all PASS.
- [ ] **Step 5: Commit** with `test(hnk40): lock hybrid projection integrity invariants`.

### Task 4: Materialized 40-Record Research Artifact

**Files:**
- Create: `scripts/hnk40-e5-hybrid-projection.mjs`
- Create/generated: `docs/research/mandala/final/hnk40-e5-hybrid-projection.v1.json`
- Create: `test/hnk40-e5-hybrid-projection.artifact.test.mjs`

**Interfaces:**
- Consumes: generator from Task 2 and verified legacy source file.
- Produces: deterministic pretty-printed UTF-8 JSON artifact ending with newline.

- [ ] **Step 1: Write failing artifact test** asserting exactly 40 records, 4/34/2 summary, ambiguous IDs G17/G20, two candidates retained for each, zero canonical promotions, null preferred projections for ambiguity, and regenerated bytes equal checked-in artifact bytes.
- [ ] **Step 2: Run artifact test**; expect FAIL because CLI/artifact do not exist.
- [ ] **Step 3: Implement CLI** that reads the verified source, invokes the library, writes only the derived artifact, and never writes the source fixture.
- [ ] **Step 4: Run CLI** `node scripts/hnk40-e5-hybrid-projection.mjs` to materialize the v1 artifact.
- [ ] **Step 5: Run artifact test**; expect PASS.
- [ ] **Step 6: Commit** CLI, artifact, and test with `research(hnk40): materialize hybrid E5 projection v1`.

### Task 5: Acquisition Export Without Ambiguity Collapse

**Files:**
- Create: `scripts/lib/hnk40-e5-acquisition-export.mjs`
- Create: `test/hnk40-e5-acquisition-export.test.mjs`
- Create/generated: `docs/research/mandala/final/hnk40-e5-acquisition.v1.json`

**Interfaces:**
- Consumes: `exportAcquisitionDataset(hybridArtifact)`.
- Produces: acquisition records retaining `glyphId`, `resolutionStatus`, provenance/rule version, and either one projection target or an explicit candidate set.

- [ ] **Step 1: Write failing acquisition tests** asserting DIRECT and DERIVED_UNIQUE can expose a sole structural target, G17/G20 expose two candidates plus ambiguity status, no ambiguous record has a scalar `targetProjectionId`, and NO_E5/PENDING states (fixture cases) expose no target.
- [ ] **Step 2: Run** `node --test test/hnk40-e5-acquisition-export.test.mjs`; expect FAIL because exporter does not exist.
- [ ] **Step 3: Implement `exportAcquisitionDataset(hybridArtifact)`** with explicit union-shaped output keyed by `resolutionStatus`; do not add a convenience fallback that selects candidate index 0.
- [ ] **Step 4: Generate acquisition artifact** from the checked-in hybrid projection artifact.
- [ ] **Step 5: Run acquisition tests**; expect PASS with G17/G20 ambiguity intact.
- [ ] **Step 6: Commit** exporter, artifact, and tests with `feat(kodescript): preserve HNK40 ambiguity in acquisition export`.

### Task 6: Full Gate and Documentation Sync

**Files:**
- Create: `docs/research/mandala/HNK40-E5-HYBRID-PROJECTION-V1-RESULT.md`
- Modify: relevant test/workflow entry only if an existing HNK40 integrity workflow has a supported insertion point.

**Interfaces:**
- Consumes: all previous artifacts/tests.
- Produces: one reproducible verification command and a result note clearly labeling V4 derivation as research/non-canonical.

- [ ] **Step 1: Add/identify one full verification command** that runs schema, generator, integrity, artifact, and acquisition tests without depending on unavailable GitHub-hosted runner behavior.
- [ ] **Step 2: Run the full command** and record actual pass/fail counts; do not claim PASS without successful output.
- [ ] **Step 3: Write the V1 result note** containing source locator, rule version, exact 4/34/2 counts, G17/G20 ambiguity, non-canonical authority, and reproduction command.
- [ ] **Step 4: Run the full verification command again** after documentation/artifact changes; expect PASS.
- [ ] **Step 5: Commit** with `docs(hnk40): publish hybrid E5 projection v1 gate result`.

## Completion Criteria

Implementation is complete only when the repository can reproducibly demonstrate all of the following from the verified legacy source: 40 records; 4 DIRECT; 34 DERIVED_UNIQUE; exactly G17/G20 DERIVED_AMBIGUOUS with both candidates retained; all E5 candidates are 12-node simple paths; no legacy mutation; no ambiguous preferred target; deterministic regeneration; and an acquisition export that carries ambiguity explicitly.
