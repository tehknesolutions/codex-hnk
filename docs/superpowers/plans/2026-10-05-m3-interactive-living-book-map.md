# M3 Interactive Living Book Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Living Book MAPA spread into progressive sphere → range → Day → chamber navigation using only confirmed Day 001–072 routes.

**Architecture:** Keep `packages/visual-contract/src/tree.ts` as structural truth, add pure helpers for executable Day derivation, and add one focused client component for map interaction. `LivingBook.tsx` hosts that component; `KnowledgeTree.tsx` continues to provide macro orientation from the same contract.

**Tech Stack:** Next.js/React/TypeScript, existing visual-contract package, existing Node validation-script pattern, pnpm/turbo.

**Spec:** `docs/superpowers/specs/2026-10-05-m3-interactive-living-book-map-design.md`

## Global Constraints

- Do not invent Day 073 or later content.
- Preserve existing Day 001–072 Golden V2 implementations and `DayLivingBook` adapter.
- Dormant structures are visible but never manufacture navigation.
- No graph/3D engine, database, or new dependency.
- Core navigation must work on desktop/mobile and remain keyboard accessible.
- Do not make local-only tooling a prerequisite for project progress.

## Review Focus

- Boundary values 001, 036, 037, and 072 must map to valid `/day-NNN` routes; 073 must never be emitted.
- Dormant BINAH must remain visible but non-navigable.
- Unknown/non-executable structural state must fail closed rather than create a guessed route.
- Re-selecting spheres must replace, not accumulate, the visible Day set.
- Mobile/progressive rendering must not expose a mandatory 72-item wall before sphere selection.

---

### Task 1: Executable Journey Contract

**Files:**
- Modify: `packages/visual-contract/src/tree.ts`
- Create: `scripts/validate-living-book-map-contract.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `getExecutableDays(levelId: HnkTreeLevelId): readonly HnkDayRoute[]`
- Produces: `HnkDayRoute = { day: string; href: string }`
- Consumes: existing `hnkTreeLevels`, `HnkTreeLevelId`, and current executable boundary 001–072.

- [ ] **Step 1: Write the failing contract validator**

Create `scripts/validate-living-book-map-contract.mjs` asserting that KETHER resolves exactly `001..036`, CHOKHMAH exactly `037..072`, BINAH resolves `[]`, boundary hrefs are `/day-001`, `/day-036`, `/day-037`, `/day-072`, and no result contains `/day-073`.

- [ ] **Step 2: Run the validator and verify it fails**

Run: `node scripts/validate-living-book-map-contract.mjs`
Expected: FAIL because `getExecutableDays`/the executable Day contract does not exist yet.

- [ ] **Step 3: Implement the executable Day contract**

In `packages/visual-contract/src/tree.ts`, add `HnkDayRoute` and `getExecutableDays(levelId: HnkTreeLevelId): readonly HnkDayRoute[]`. Derive only the two confirmed executable ranges; return an empty array for BINAH or any level without executable content. Format Day IDs as three digits.

- [ ] **Step 4: Add the repository validation command**

Add `validate:living-book-map` to `package.json` using the new Node validator. Do not add it to the very large global `check` chain until the focused M3 integration is green.

- [ ] **Step 5: Run focused validation**

Run: `pnpm validate:living-book-map`
Expected: PASS and explicit confirmation that only Day 001–072 routes are executable.

- [ ] **Step 6: Commit**

```bash
git add packages/visual-contract/src/tree.ts scripts/validate-living-book-map-contract.mjs package.json
git commit -m "feat(codex): define executable Living Book journey contract"
```

### Task 2: Progressive Living Book Map

**Files:**
- Create: `apps/web/app/_components/LivingBookMap.tsx`
- Extend: `scripts/validate-living-book-map-contract.mjs`

**Interfaces:**
- Consumes: `hnkTreeNodes`, `getExecutableDays(levelId)` from Task 1.
- Produces: `LivingBookMap(): JSX.Element` client component.

- [ ] **Step 1: Extend the failing validator for component invariants**

Add source-level assertions that `LivingBookMap.tsx` is a client component, consumes the shared tree contract, exposes sphere selection semantics, renders Day links from `getExecutableDays`, and does not contain literal `/day-073` or a hardcoded 001–072 route list.

- [ ] **Step 2: Run focused validation and verify it fails**

Run: `pnpm validate:living-book-map`
Expected: FAIL because `LivingBookMap.tsx` does not exist.

- [ ] **Step 3: Implement `LivingBookMap`**

Create `LivingBookMap.tsx` with local `selectedLevelId: HnkTreeLevelId | null`. Render all spheres as controls; selected sphere exposes `aria-pressed=true`; dormant/no-Day sphere remains selectable for explanation but emits no chamber links. After selection, derive Days only through `getExecutableDays`. Render explicit empty/dormant copy when the result is empty. Each available Day link uses its shared-contract href and an accessible `Abrir Day NNN` label.

- [ ] **Step 4: Preserve progressive disclosure**

Before a sphere is selected, render orientation/state information but no complete Day grid. On a new selection, derive a fresh Day list from the selected level only.

- [ ] **Step 5: Run focused validation**

Run: `pnpm validate:living-book-map`
Expected: PASS.

- [ ] **Step 6: Run web typecheck**

Run: `pnpm typecheck`
Expected: PASS for the workspace, or no new M3 TypeScript errors if an unrelated pre-existing workspace failure is documented.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/_components/LivingBookMap.tsx scripts/validate-living-book-map-contract.mjs
git commit -m "feat(web): add progressive Living Book knowledge map"
```

### Task 3: Host the Map in the Living Book

**Files:**
- Modify: `apps/web/app/_components/LivingBook.tsx`
- Extend: `scripts/validate-living-book-map-contract.mjs`

**Interfaces:**
- Consumes: `LivingBookMap` from Task 2.
- Preserves: existing `LivingBookPrototype`, spread tabs, keyboard spread navigation, and PRÁTICA overview.

- [ ] **Step 1: Add failing integration assertions**

Extend the validator to require `LivingBook.tsx` to import/render `LivingBookMap` in the `mapa` spread and to reject the old MAPA-only static journey entry as the sole map interaction.

- [ ] **Step 2: Run focused validation and verify it fails**

Run: `pnpm validate:living-book-map`
Expected: FAIL because MAPA is still static.

- [ ] **Step 3: Integrate the component**

Import `LivingBookMap` and render it in the MAPA spread. Keep concise Macro → Micro explanatory copy on the opposite page. Do not move Day content into `LivingBook.tsx` and do not duplicate route generation there.

- [ ] **Step 4: Run focused validation**

Run: `pnpm validate:living-book-map`
Expected: PASS.

- [ ] **Step 5: Run typecheck/build gates**

Run: `pnpm typecheck`
Expected: PASS or documented unrelated pre-existing failure.

Run: `pnpm build`
Expected: PASS or documented unrelated pre-existing failure; no M3 compile/build regression.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/_components/LivingBook.tsx scripts/validate-living-book-map-contract.mjs
git commit -m "feat(web): embed interactive map in Living Book"
```

### Task 4: Shared-Truth Regression Gate

**Files:**
- Modify: `apps/web/app/_components/KnowledgeTree.tsx` only if needed to remove remaining duplicated range truth.
- Extend: `scripts/validate-living-book-map-contract.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: shared tree/range contract from Task 1.
- Produces: one M3 validation gate that covers macro tree + Living Book map + route boundary.

- [ ] **Step 1: Add regression assertions**

Require the validator to confirm that `KnowledgeTree.tsx` does not invent `/day-073`/`/day-074`, dormant nodes do not become executable anchors, and both macro tree and Living Book map import the shared visual contract.

- [ ] **Step 2: Run validator and inspect any failure**

Run: `pnpm validate:living-book-map`
Expected: PASS if shared-truth cleanup is already sufficient; otherwise FAIL only on the duplicated/inconsistent source identified by the assertion.

- [ ] **Step 3: Apply only required shared-truth cleanup**

If the validator found duplication, make `KnowledgeTree.tsx` read labels/ranges/states from shared data rather than a local competing range table. Do not refactor unrelated landing-page code.

- [ ] **Step 4: Promote focused validation into the normal gate**

Add `pnpm validate:living-book-map` to `check` only after Tasks 1–3 are green.

- [ ] **Step 5: Run final M3 gates**

Run: `pnpm validate:living-book-map`
Expected: PASS.

Run: `pnpm typecheck`
Expected: PASS or documented unrelated pre-existing failure.

Run: `pnpm build`
Expected: PASS or documented unrelated pre-existing failure.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/_components/KnowledgeTree.tsx scripts/validate-living-book-map-contract.mjs package.json
git commit -m "test(codex): gate Living Book map against journey contract"
```

## Self-review result

- Spec coverage: source of truth, progressive interaction, dormant behavior, Living Book hosting, KnowledgeTree shared truth, accessibility semantics, responsive progressive disclosure, error/gap behavior, and Day 072 boundary are assigned to tasks.
- Type consistency: `HnkTreeLevelId`, `HnkDayRoute`, `getExecutableDays`, and `LivingBookMap` names are stable across tasks.
- Review-focus failures are explicitly covered in Tasks 1–4.
- No new runtime dependency or local-only prerequisite is introduced.
- Expanded total-map mode remains an architectural extension point, not unnecessary M3 implementation scope.
