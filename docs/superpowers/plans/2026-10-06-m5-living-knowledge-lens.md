# M5 Living Knowledge Lens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Project confirmed HNK structural, canon, claim/evidence, and correspondence context into one read-only Living Book lens without inventing cross-domain joins or new canon.

**Architecture:** Add a focused `packages/knowledge-lens` adapter that normalizes verified source inputs into an immutable `HnkKnowledgeLensProjection`. The Living Book consumes only that serializable projection and shares the existing M4 `selectedLevelId`; domain registries remain authoritative and React never becomes a resolver or mutation layer.

**Tech Stack:** TypeScript, React/Next.js, existing HNK packages, Node validation scripts, pnpm/turbo.

**Spec:** `docs/superpowers/specs/2026-10-06-m5-living-knowledge-lens-design.md`

## Global Constraints

- `packages/visual-contract/src/tree.ts` remains structural/Day authority.
- `@hnk/evidence-ledger` coverage never becomes truth, causality, or metaphysical proof.
- `@hnk/claim-dossier` gaps/conflicts survive projection and never auto-promote canon.
- `@hnk/correspondence-registry` remains correspondence authority.
- Cross-domain joins require explicit verified bindings; label similarity is insufficient.
- Missing data is `UNAVAILABLE`; unresolved/conflicting data is not silently repaired.
- Adapter is read-only and exposes no mutation API.
- BINAH remains dormant and cannot gain Day 073+ routes.
- Existing M3/M4 navigation remains functional and independent of Lens data density.

## Review Focus

- Unknown or unbound `HnkTreeLevelId`: return fail-closed projection rather than guessing IDs.
- Malformed/failed source validation: never normalize to `CONFIRMED`.
- Conflicting dossier/correspondence records: retain conflicts and expose `UNRESOLVED` where appropriate.
- Empty evidence requirements/coverage: preserve the evidence boundary and never infer truth from zero/missing data.
- Sparse data on mobile/client hydration: render stable explicit empty states without blocking confirmed Day navigation.

---

### Task 1: Knowledge Lens Contract and Fail-Closed Structural Projection

**Files:**
- Create: `packages/knowledge-lens/package.json`
- Create: `packages/knowledge-lens/src/index.ts`
- Create: `packages/knowledge-lens/test/knowledge-lens.test.mjs`
- Modify: root workspace/package configuration only if the repository pattern requires explicit package registration.

**Interfaces:**
- Consumes: `HnkTreeLevelId`, `hnkTreeLevels`, `hnkTreeNodes`, `getExecutableDays(levelId)`.
- Produces: `HnkKnowledgeLensStatus`, `HnkKnowledgeLensProjection`, `KnowledgeLensBindings`, `projectKnowledgeLens(input): HnkKnowledgeLensProjection`.

- [ ] **Step 1: Write RED tests for structural projection and unknown binding behavior**

Tests assert KETHER structural metadata is projected from `tree.ts`, executable count comes from `getExecutableDays`, and absent canon/claim/evidence/correspondence bindings yield `UNAVAILABLE` plus explicit limitation codes. Add a runtime invalid-level test that fails closed instead of fabricating structure.

- [ ] **Step 2: Run focused package test and verify RED**

Run the package's direct Node test command following adjacent package conventions.
Expected: FAIL because `packages/knowledge-lens` does not exist.

- [ ] **Step 3: Implement the minimal immutable projection contract**

Define the four statuses exactly as `CONFIRMED | PARTIAL | UNRESOLVED | UNAVAILABLE`. Implement `projectKnowledgeLens` so structural context comes only from `tree.ts`; all unbound external sections begin `UNAVAILABLE`. Freeze or otherwise expose readonly output consistent with repository conventions.

- [ ] **Step 4: Verify GREEN**

Run the focused package test.
Expected: PASS for structural and fail-closed cases.

- [ ] **Step 5: Commit**

`git commit -m "feat(knowledge): add fail-closed knowledge lens contract"`

### Task 2: Explicit Binding Registry and Correspondence Projection

**Files:**
- Create: `packages/knowledge-lens/src/bindings.ts`
- Modify: `packages/knowledge-lens/src/index.ts`
- Modify: `packages/knowledge-lens/test/knowledge-lens.test.mjs`

**Interfaces:**
- Consumes: `CorrespondenceRegistryApi` (`query`, `resolve`, `compare`, `conflicts`, `coverage`, `validate`) and explicit `KnowledgeLensBindings` keyed by `HnkTreeLevelId`.
- Produces: correspondence section with `status`, `record_count`, `domains`, `traditions`, `gaps`, `conflicts`.

- [ ] **Step 1: Write RED tests for verified binding, no binding, invalid registry, and conflict preservation**

Use a deterministic test registry/stub matching `CorrespondenceRegistryApi`. Assert no binding causes `UNAVAILABLE`; a valid explicit subject binding projects records; failed `validate()` cannot become `CONFIRMED`; gaps/conflicts remain visible and drive `PARTIAL`/`UNRESOLVED` according to the spec.

- [ ] **Step 2: Run focused tests and verify RED**

Expected: FAIL because correspondence projection/bindings are absent.

- [ ] **Step 3: Implement explicit bindings and read-only correspondence adapter**

Do not ship guessed KETHER/CHOKHMAH/BINAH subject mappings. The initial binding table contains only mappings verified from repository datasets during this task; otherwise it remains empty for that level.

- [ ] **Step 4: Verify GREEN**

Expected: PASS including invalid-registry and conflict cases.

- [ ] **Step 5: Commit**

`git commit -m "feat(knowledge): project verified correspondences through lens"`

### Task 3: Claim and Evidence Projection Without Truth Inference

**Files:**
- Modify: `packages/knowledge-lens/src/index.ts`
- Modify: `packages/knowledge-lens/src/bindings.ts`
- Modify: `packages/knowledge-lens/test/knowledge-lens.test.mjs`

**Interfaces:**
- Consumes: verified bound `HnkClaimDossier`/`ClaimDossierAssessment` and `HnkEvidenceLedger`/`EvidenceClaimEvaluation` source projections.
- Produces: claim items preserving statement/scope/gaps/conflicts and evidence section preserving coverage/missing requirements plus literal `truth_assessed: false`, `causal_claim_permitted: false`, `metaphysical_proof_permitted: false`.

- [ ] **Step 1: Write RED boundary tests**

Assert `CONSISTENT_WITH` does not become truth, dossier conflicts remain conflicts, missing requirements produce non-confirmed coverage, and all three evidence safety booleans are always false. Add malformed/unvalidated-source case that cannot become `CONFIRMED`.

- [ ] **Step 2: Run focused tests and verify RED**

Expected: FAIL because claim/evidence normalization is absent.

- [ ] **Step 3: Implement source-input normalization**

Accept validated/evaluated source objects through explicit bindings/input. Preserve native statements/status detail while mapping only presentation status. Expose no `addClaim`, ledger write, dossier write, canon promotion, or registry mutation function.

- [ ] **Step 4: Verify GREEN**

Expected: PASS for boundary, gap/conflict, and malformed-source tests.

- [ ] **Step 5: Commit**

`git commit -m "feat(knowledge): project claims and evidence without truth inference"`

### Task 4: Living Book Knowledge Lens UI on Shared M4 Selection

**Files:**
- Create: `apps/web/app/_components/LivingKnowledgeLens.tsx`
- Modify: `apps/web/app/_components/LivingBook.tsx`
- Modify: `apps/web/app/_components/living-book-map.css`
- Create: `scripts/validate-knowledge-lens.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: serializable `HnkKnowledgeLensProjection` for the same `selectedLevelId` owned by `LivingBookMapa`.
- Produces: semantic sections `CÂNONE`, `CLAIMS`, `EVIDÊNCIA`, `CORRESPONDÊNCIAS`, `LIMITES` and focused `validate:knowledge-lens` gate.

- [ ] **Step 1: Write RED UI validator**

Assert `LivingKnowledgeLens` exists, receives projection rather than raw registries, renders all five semantic sections and explicit status text, and `LivingBookMapa` passes the same selected level used by Total/Progressive maps without adding a second `HnkTreeLevelId` state.

- [ ] **Step 2: Run validator and verify RED**

Run: `node scripts/validate-knowledge-lens.mjs`
Expected: FAIL because UI integration does not exist.

- [ ] **Step 3: Implement semantic Lens component and MAPA integration**

Render scannable summaries first, textual gaps/conflicts/limitations, and stable `UNAVAILABLE` empty states. The Lens must not block `LivingBookMap` or turn status cards into Day links.

- [ ] **Step 4: Extend existing CSS layer**

Reuse Living Book dark/gold tokens. Add visible status treatment beyond color, keyboard-safe controls only if expansion is used, mobile stacking, and reduced-motion compatibility.

- [ ] **Step 5: Register and run focused validator**

Add `validate:knowledge-lens` separately from global `check` initially.
Expected: PASS.

- [ ] **Step 6: Commit**

`git commit -m "feat(web): add Living Knowledge Lens to MAPA"`

### Task 5: Regression Gate, Real Bindings Audit, and Remote Handoff

**Files:**
- Modify: `scripts/validate-knowledge-lens.mjs`
- Modify: `package.json`
- Modify: `packages/knowledge-lens/src/bindings.ts` only if repository audit proves additional explicit bindings.

**Interfaces:**
- Consumes: M3/M4 validators, M5 package tests, public domain APIs.
- Produces: final M5 regression gate and reviewable PR.

- [ ] **Step 1: Audit real repository datasets for explicit subject/source bindings**

Search actual correspondence datasets, claim dossiers/evidence fixtures/materialized sources, and canon resolver APIs. Add only bindings directly supported by repository identifiers. Record unsupported joins as limitations rather than mappings.

- [ ] **Step 2: Harden regression assertions**

Assert no `/day-073`; one shared sphere selection remains; knowledge-lens exposes no mutation/canon-promotion API; evidence safety booleans remain false; absent bindings remain explicit; M3/M4 validators still exist and their navigation contracts are untouched.

- [ ] **Step 3: Run focused gates**

Run package tests plus `pnpm validate:living-book-map`, `pnpm validate:living-book-total-map`, and `pnpm validate:knowledge-lens`.
Expected: PASS when executable infrastructure is available.

- [ ] **Step 4: Run workspace typecheck/build when executable infrastructure is available**

Run: `pnpm typecheck` then `pnpm build`.
Expected: PASS, or separately document pre-existing/runner failure without claiming M5 regression or fake PASS.

- [ ] **Step 5: Promote focused M5 validation into `check` only after focused GREEN**

Do not weaken existing gates. If infrastructure cannot execute repository steps, keep the validator registered but unpromoted and document the reason.

- [ ] **Step 6: Open dedicated M5 PR against `main`**

PR must state verified bindings actually shipped, explicit unavailable domains, safety boundaries, and verification evidence. CI failure before repository steps execute remains infrastructure debt rather than automatic product failure.

- [ ] **Step 7: Commit final gate changes**

`git commit -m "test(codex): gate M5 Living Knowledge Lens"`

## Self-review result

- Spec coverage: adapter boundary, status semantics, explicit bindings, fail-closed behavior, all five UI sections, M4 shared selection, accessibility, first vertical slice, and non-goals are assigned to Tasks 1–5.
- Step scan: every implementation task starts with a failing test/validator and ends with an independently reviewable commit.
- Type consistency: `HnkKnowledgeLensProjection` is produced only by `packages/knowledge-lens` and consumed by the UI; `HnkTreeLevelId` remains the shared selection key.
- Review Focus coverage: unknown bindings Task 1/2; malformed validation Task 2/3; conflicts Task 2/3; empty evidence Task 3; sparse mobile/UI Task 4.
- Proportion: the plan fixes interfaces, boundaries, tests, and commands without transcribing implementation bodies.
- No task invents Day 073+, canon, correspondence mappings, truth, causality, or metaphysical proof.
