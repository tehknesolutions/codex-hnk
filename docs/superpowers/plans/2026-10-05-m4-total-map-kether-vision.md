# M4 Total Map / Visão Kether Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a semantic Total Map to the Living Book that gives a Kether-like macro overview and descends through the existing shared sphere selection into confirmed Day 001–072 chambers.

**Architecture:** `tree.ts` remains the only structural authority. A new `LivingBookTotalMap` is a controlled presentation component; `LivingBookMap` becomes controlled by the same selected `HnkTreeLevelId`, and the MAPA host coordinates both representations so macro and progressive navigation cannot diverge.

**Tech Stack:** Next.js, React, TypeScript, existing visual-contract package, semantic HTML/CSS, existing Node validation-script pattern, pnpm/turbo.

**Spec:** `docs/superpowers/specs/2026-10-05-m4-total-map-kether-vision-design.md`

## Global Constraints

- `packages/visual-contract/src/tree.ts` remains the structural authority.
- KETHER is executable only for Day 001–036.
- CHOKHMAH is executable only for Day 037–072.
- BINAH 073+ remains structurally visible and dormant until confirmed repository content exists.
- No M4 component may manufacture `/day-073` or later routes.
- Existing Golden V2 Day 001–072 implementations remain content authority.
- M4 does not silently reinterpret HNK canon, sphere names, ranges, or states.
- No graph engine, canvas renderer, WebGL/3D system, physics layout, or new visualization dependency.
- Do not require local-only tooling to continue development.

## Review Focus

- BINAH selection must update orientation while still yielding zero executable chamber links.
- Switching selection between the macro and progressive representations must update one shared value, never two competing states.
- Missing/unknown executable data must fail closed rather than guess a Day range or route.
- Mobile must remain operable without horizontal pan/zoom and without showing a 72-item wall before selection.
- Keyboard/reduced-motion users must receive the same selection/navigation semantics without motion being required for comprehension.

---

### Task 1: Controlled Progressive Map Contract

**Files:**
- Modify: `apps/web/app/_components/LivingBookMap.tsx`
- Create: `scripts/validate-living-book-total-map.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `HnkTreeLevelId`, `hnkTreeNodes`, `hnkTreeLevels`, `getExecutableDays(levelId)` from `tree.ts`.
- Produces: `LivingBookMapProps = { selectedLevelId: HnkTreeLevelId | null; onSelectLevel(levelId: HnkTreeLevelId): void }` and `LivingBookMap(props: LivingBookMapProps): JSX.Element`.

- [ ] **Step 1: Write the failing M4 validator**

Create `scripts/validate-living-book-total-map.mjs` asserting that `LivingBookMap.tsx` declares controlled `selectedLevelId` and `onSelectLevel` props, contains no local `useState<HnkTreeLevelId`, continues to derive Days through `getExecutableDays`, and contains no `/day-073` literal.

- [ ] **Step 2: Run the validator and verify RED**

Run: `node scripts/validate-living-book-total-map.mjs`
Expected: FAIL because the M3 component still owns local sphere selection.

- [ ] **Step 3: Convert `LivingBookMap` to controlled selection**

Implement the exact `LivingBookMapProps` interface above. Replace local selection mutation with `onSelectLevel(node.levelId)` while preserving current progressive disclosure, `aria-pressed`, dormant explanation, and Day links derived only from `getExecutableDays(selectedLevelId)`.

- [ ] **Step 4: Register the focused command**

Add `validate:living-book-total-map` to `package.json`. Keep it separate from the global `check` chain until the complete M4 flow is green.

- [ ] **Step 5: Verify GREEN**

Run: `pnpm validate:living-book-total-map`
Expected: PASS for the controlled progressive-map contract.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/_components/LivingBookMap.tsx scripts/validate-living-book-total-map.mjs package.json
git commit -m "refactor(web): control Living Book sphere selection"
```

### Task 2: Semantic Total Map

**Files:**
- Create: `apps/web/app/_components/LivingBookTotalMap.tsx`
- Extend: `scripts/validate-living-book-total-map.mjs`

**Interfaces:**
- Consumes: `hnkTreeLevels`, `hnkTreeNodes`, `HnkTreeLevelId`.
- Produces: `LivingBookTotalMapProps = { selectedLevelId: HnkTreeLevelId | null; onSelectLevel(levelId: HnkTreeLevelId): void }` and `LivingBookTotalMap(props: LivingBookTotalMapProps): JSX.Element`.

- [ ] **Step 1: Extend validator for total-map invariants**

Assert that `LivingBookTotalMap.tsx` exists, imports shared tree metadata, exposes the controlled props above, renders semantic sphere buttons with programmatic selected state, marks connectors decorative, and contains neither a local range table nor `/day-073`/Day URL generation.

- [ ] **Step 2: Run focused validation and verify RED**

Run: `pnpm validate:living-book-total-map`
Expected: FAIL because `LivingBookTotalMap.tsx` does not exist.

- [ ] **Step 3: Implement `LivingBookTotalMap`**

Render canonical-order nodes from shared metadata. Each sphere button calls `onSelectLevel(node.levelId)`, exposes `aria-pressed`, label, shared range, and state. Render connectors as `aria-hidden="true"`; dormant BINAH remains a selectable structural node but never becomes a chamber link.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm validate:living-book-total-map`
Expected: PASS for semantic macro-map invariants.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/_components/LivingBookTotalMap.tsx scripts/validate-living-book-total-map.mjs
git commit -m "feat(web): add semantic Kether total map"
```

### Task 3: One Selection Model in MAPA

**Files:**
- Modify: `apps/web/app/_components/LivingBook.tsx`
- Extend: `scripts/validate-living-book-total-map.mjs`

**Interfaces:**
- Consumes: `LivingBookTotalMap`, controlled `LivingBookMap`, `HnkTreeLevelId`.
- Produces: one MAPA host selection state passed to both map scales.

- [ ] **Step 1: Add failing host-integration assertions**

Require `LivingBook.tsx` to import both map components, own exactly one `HnkTreeLevelId | null` selection state for MAPA, and pass the same `selectedLevelId` and selection callback to both components.

- [ ] **Step 2: Run focused validation and verify RED**

Run: `pnpm validate:living-book-total-map`
Expected: FAIL because the MAPA spread does not yet coordinate the two representations.

- [ ] **Step 3: Add focused MAPA host component/state**

Keep the existing spread system intact, but move MAPA's interactive body into a focused host if needed so React state is not created inside static spread data. The host owns `selectedLevelId: HnkTreeLevelId | null` and renders `LivingBookTotalMap` followed by `LivingBookMap` with the same value/callback.

- [ ] **Step 4: Pin BINAH fail-closed behavior**

Extend the validator to confirm the progressive component still uses `getExecutableDays` and the structural contract has no executable BINAH range. No host code may special-case a guessed Day 073 route.

- [ ] **Step 5: Verify GREEN**

Run: `pnpm validate:living-book-total-map`
Expected: PASS, including the one-selection-model assertions.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/_components/LivingBook.tsx scripts/validate-living-book-total-map.mjs
git commit -m "feat(web): unify total and progressive map selection"
```

### Task 4: Responsive Kether Visual Layer

**Files:**
- Modify: `apps/web/app/living-book-map.css`
- Extend: `scripts/validate-living-book-total-map.mjs`

**Interfaces:**
- Consumes: class names emitted by `LivingBookTotalMap` and the existing M3 visual tokens/states.
- Produces: desktop macro composition plus compact mobile stacked overview without a second visual system.

- [ ] **Step 1: Add failing visual-contract assertions**

Require CSS selectors for the total-map root, nodes, decorative connectors, selected state, dormant state, `:focus-visible`, a mobile media query, and `prefers-reduced-motion` handling.

- [ ] **Step 2: Run focused validation and verify RED**

Run: `pnpm validate:living-book-total-map`
Expected: FAIL because M4-specific visual selectors are absent.

- [ ] **Step 3: Implement desktop composition**

Extend the existing map stylesheet using current dark/gold tokens. Create a clear macro hierarchy through layout, rings/frames, connectors, spacing, and typography; selected state must be distinguishable beyond color alone.

- [ ] **Step 4: Implement mobile/reduced-motion behavior**

At the existing mobile breakpoint pattern, stack/compact the total map so no horizontal pan/zoom is required. Keep controls touch-sized and DOM order meaningful. Disable nonessential transitions/animation under `prefers-reduced-motion: reduce`.

- [ ] **Step 5: Verify GREEN**

Run: `pnpm validate:living-book-total-map`
Expected: PASS for visual/accessibility contracts.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/living-book-map.css scripts/validate-living-book-total-map.mjs
git commit -m "feat(web): style responsive Kether total map"
```

### Task 5: M4 Regression Gate and Remote Handoff

**Files:**
- Modify: `scripts/validate-living-book-total-map.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: all M4 components and M3 shared contracts.
- Produces: focused M4 regression gate suitable for remote CI evidence.

- [ ] **Step 1: Add cross-surface regression assertions**

Assert no local structural/range table exists in either map component; no M4 component generates Day URLs; `tree.ts` remains the executable authority; M3 `Abrir Day NNN` links remain present; and PortalHome/KnowledgeTree continue consuming shared metadata rather than reintroducing conflicting ranges.

- [ ] **Step 2: Run focused M3 + M4 validators**

Run: `pnpm validate:living-book-map && pnpm validate:living-book-total-map`
Expected: PASS.

- [ ] **Step 3: Run workspace compile gates when executable infrastructure is available**

Run: `pnpm typecheck`
Expected: PASS or a separately documented pre-existing/infrastructure failure with no M4 product-failure claim.

Run: `pnpm build`
Expected: PASS or a separately documented pre-existing/infrastructure failure with no M4 product-failure claim.

- [ ] **Step 4: Promote M4 focused validation into `check` only after focused GREEN**

Append `pnpm validate:living-book-total-map` to the normal `check` chain after both focused validators pass. Do not weaken or delete existing Day gates.

- [ ] **Step 5: Create remote review handoff**

Push/commit the final branch state and open or update a dedicated M4 PR. Remote runner failure before repository steps execute must be tracked as infrastructure debt rather than silently treated as product regression or fake PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/validate-living-book-total-map.mjs package.json
git commit -m "test(codex): gate M4 Kether total map"
```

## Self-review result

- Spec coverage: macro map, one shared selection model, progressive descent authority, desktop/mobile distinction, dormant BINAH, accessibility, fail-closed gaps, shared visual language, and no-heavy-engine constraint are assigned to Tasks 1–5.
- Step scan: every implementation task begins with a failing focused assertion and ends with an independently reviewable commit.
- Type consistency: both map components use the same `HnkTreeLevelId | null` selected value and `onSelectLevel(levelId: HnkTreeLevelId): void` callback.
- Review Focus coverage: BINAH fail-closed is covered in Tasks 2–3; competing state in Tasks 1–3; unknown route/range generation in Tasks 1, 2, and 5; mobile/no-pan behavior in Task 4; keyboard/reduced-motion in Tasks 2 and 4.
- Proportion: implementation bodies are intentionally omitted; the plan fixes interfaces, tests, commands, and canonical values without transcribing the program.
- M4 remains an extension of M3 rather than a second engine, and infrastructure failures remain decoupled from feature progress.
