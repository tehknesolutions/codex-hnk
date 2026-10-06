# M6 — Journey / Day Chambers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the confirmed executable Day journey into a first-class Living Book Chamber flow with a 001–109 structural horizon, fail-closed availability, registry-driven navigation, isolated personal progress, resume, and shared web/mobile semantics.

**Architecture:** Introduce a small shared `@hnk/journey-contract` package as the single M6 authority for Day descriptors, chamber projection, navigation, progress and resume. Existing Day implementations remain authoritative and are adapted into the five-surface Chamber model; UI layers consume the shared contract instead of deriving availability arithmetically. Repository/CI validators prove the integration without making local runtime or Vercel a product gate.

**Tech Stack:** TypeScript, React/Next.js web, Expo/React Native mobile, pnpm/Turbo monorepo, Node contract validators, existing HNK completion/practice/Supabase adapters where compatible.

**Spec:** `docs/superpowers/specs/2026-10-06-m6-journey-day-chambers-design.md`

## Global Constraints

- Existing Golden V2 Day content is preserved through an adapter, not rewritten as a prerequisite.
- AVAILABLE requires repository-backed executable evidence; a numeric slot alone never creates a route.
- The approved M6 spec currently fixes the executable frontier at `001–072`; `073–109` remain `DORMANT/UNAVAILABLE` unless the spec is explicitly amended after reconciling newer repository evidence.
- No automatic generation of missing Day content.
- Personal progress never changes canon, source authority, claims, evidence, correspondence registries, or Day availability.
- Desktop and mobile share Day IDs, chamber semantics, navigation semantics and progress states.
- Unknown or unregistered Days fail closed.
- M6 consumes shared structural authority and must not create a competing tree/day frontier.
- Local environment and Vercel are not product gates; repository/CI evidence is authoritative.
- Missing chamber facets are explicit `UNAVAILABLE`, never synthesized.

## Review Focus

- A syntactically valid Day such as `109` with no executable registration must stay dormant and must not acquire an href.
- Malformed IDs (`73`, `abc`, `000`, `110`) must fail closed rather than normalize into executable routes.
- Duplicate or incomplete AVAILABLE descriptors must make registry validation fail rather than silently choose one.
- A stale resume pointer to a dormant/unregistered Day must be discarded/fallback safely and never resurrect that route.
- Progress persistence failure must leave Day content readable and canon/availability unchanged.

---

## File Structure

Create `packages/journey-contract/` as the bounded shared M6 domain. Keep files focused: `types.ts` owns public types, `registry.ts` owns the 109-slot/executable authority, `chamber.ts` owns five-surface projection, `navigation.ts` owns previous/next/deep-link resolution, `progress.ts` owns personal progress/resume rules, and `index.ts` is the public barrel. Tests live beside each unit.

Web integration lives under `apps/web/app/_components/journey/` plus minimal changes to the existing Living Book entry/map and Day wrappers. Mobile integration lives under `apps/mobile/src/features/journey/` plus minimal route wrappers. `scripts/validate-m6-journey.mjs` and `.github/workflows/m6-journey-gate.yml` are the repository-first proof layer.

### Task 1: Establish the Journey Registry and 109-slot authority

**Files:**
- Create: `packages/journey-contract/package.json`
- Create: `packages/journey-contract/tsconfig.json`
- Create: `packages/journey-contract/src/types.ts`
- Create: `packages/journey-contract/src/registry.ts`
- Create: `packages/journey-contract/src/registry.test.ts`
- Create: `packages/journey-contract/src/index.ts`
- Modify: `packages/visual-contract/src/tree.ts`
- Modify: `packages/visual-contract/src/tree.mjs`

**Interfaces:**
- Produces: `DayId`, `JourneyDayStatus`, `JourneyDayDescriptor`, `JourneySlot`, `JOURNEY_HORIZON`, `getJourneySlots()`, `getJourneyDay(dayId)`, `isExecutableDay(dayId)`.
- `getJourneySlots(): readonly JourneySlot[]` returns exactly 109 slots, zero-padded `001` through `109`.
- AVAILABLE descriptors require `{ dayId, status: "AVAILABLE", href, sourceKind }`; dormant slots expose no executable href.

- [ ] **Step 1: Write failing registry tests** asserting: 109 slots; `001` and `072` AVAILABLE; `073` and `109` DORMANT under the approved spec; malformed IDs fail closed; no dormant slot has `href`; duplicate/incomplete AVAILABLE registrations are rejected.

- [ ] **Step 2: Run the focused test**

Run: `pnpm --filter @hnk/journey-contract test -- registry.test.ts`
Expected: FAIL because the package/registry does not exist.

- [ ] **Step 3: Implement the minimal registry contract** in `types.ts` and `registry.ts`. Source the executable ranges from one explicit registry definition and make `visual-contract` delegate to/align with that authority rather than maintaining an independent range algorithm.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @hnk/journey-contract test`
Expected: PASS.

- [ ] **Step 5: Run structural regressions**

Run: `node scripts/validate-living-book-map-contract.mjs && node scripts/validate-living-book-total-map.mjs && node scripts/validate-knowledge-lens.mjs`
Expected: all existing M3–M5 validators PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/journey-contract packages/visual-contract/src/tree.ts packages/visual-contract/src/tree.mjs
git commit -m "feat(m6): add authoritative journey registry"
```

### Task 2: Add the five-surface Day Chamber contract and legacy adapter

**Files:**
- Create: `packages/journey-contract/src/chamber.ts`
- Create: `packages/journey-contract/src/chamber.test.ts`
- Modify: `packages/journey-contract/src/index.ts`
- Reference without rewriting: existing Day/Golden implementations under `apps/web/app/day-*` and `apps/mobile/src/features/**/Day*`.

**Interfaces:**
- Consumes: `JourneyDayDescriptor` from Task 1.
- Produces: `ChamberSurfaceId = "VISAO" | "MANUSCRITO" | "ARTEFATO" | "PRATICA" | "DIARIO"`, `ChamberSurface`, `DayChamberProjection`, `projectDayChamber(descriptor, evidence)`.
- Every projection contains exactly five surfaces; an unsupported facet is `{ status: "UNAVAILABLE" }`, never generated filler.

- [ ] **Step 1: Write failing chamber tests** proving exactly five surfaces, preservation of Day identity/href/source kind, explicit unavailable facets, and rejection of projection for a dormant Day.

- [ ] **Step 2: Run the focused test**

Run: `pnpm --filter @hnk/journey-contract test -- chamber.test.ts`
Expected: FAIL because `projectDayChamber` is undefined.

- [ ] **Step 3: Implement the minimal projection/adapter API**. Treat confirmed legacy content as evidence references; do not copy or rewrite Golden V2 manuscript content into the contract package.

- [ ] **Step 4: Run contract tests**

Run: `pnpm --filter @hnk/journey-contract test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/journey-contract/src/chamber.ts packages/journey-contract/src/chamber.test.ts packages/journey-contract/src/index.ts
git commit -m "feat(m6): add day chamber projection contract"
```

### Task 3: Make navigation registry-driven and fail closed

**Files:**
- Create: `packages/journey-contract/src/navigation.ts`
- Create: `packages/journey-contract/src/navigation.test.ts`
- Modify: `packages/journey-contract/src/index.ts`

**Interfaces:**
- Consumes: Task 1 registry.
- Produces: `getJourneyNavigation(dayId)`, `resolveJourneyTarget(dayId)`.
- `getJourneyNavigation` returns previous/next AVAILABLE descriptors or `null`; `resolveJourneyTarget` returns `AVAILABLE | DORMANT | UNAVAILABLE` without manufacturing routes.

- [ ] **Step 1: Write failing navigation tests** for first Day, last approved executable Day, dormant target, malformed target, and a synthetic registry gap proving previous/next skips non-executable slots.

- [ ] **Step 2: Run focused tests**

Run: `pnpm --filter @hnk/journey-contract test -- navigation.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement navigation solely from registry descriptors**, never `day + 1` route construction.

- [ ] **Step 4: Run all journey-contract tests**

Run: `pnpm --filter @hnk/journey-contract test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/journey-contract/src/navigation.ts packages/journey-contract/src/navigation.test.ts packages/journey-contract/src/index.ts
git commit -m "feat(m6): add fail-closed journey navigation"
```

### Task 4: Add isolated Progress Ledger and Resume Pointer

**Files:**
- Create: `packages/journey-contract/src/progress.ts`
- Create: `packages/journey-contract/src/progress.test.ts`
- Modify: `packages/journey-contract/src/index.ts`
- Reuse where compatible: `packages/completion-contract/src/types.ts`, `packages/completion-contract/src/offline.ts`, `packages/completion-contract/src/service.ts`, `packages/practice-contract/src/sync.ts`.

**Interfaces:**
- Consumes: registry/navigation from Tasks 1 and 3.
- Produces: `JourneyProgressState = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"`, `JourneyProgressRecord`, `ResumePointer`, `ProgressLedgerPort`, `resolveResumePointer(records, pointer)`.
- Persistence adapter errors are returned to the caller; they do not mutate registry/canon.

- [ ] **Step 1: Write failing progress tests** proving state transitions, immutability of Day descriptors, stale/dormant resume rejection, valid resume acceptance, and persistence-error isolation.

- [ ] **Step 2: Run focused tests**

Run: `pnpm --filter @hnk/journey-contract test -- progress.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement the pure progress/resume domain** and a port interface. Reuse existing completion/practice persistence only behind an adapter; do not introduce a new backend schema in M6 unless compatibility cannot be achieved and the spec is amended.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @hnk/journey-contract test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/journey-contract/src/progress.ts packages/journey-contract/src/progress.test.ts packages/journey-contract/src/index.ts
git commit -m "feat(m6): add journey progress and resume contract"
```

### Task 5: Integrate the Journey horizon and Chamber shell on Web

**Files:**
- Create: `apps/web/app/_components/journey/JourneyGrid.tsx`
- Create: `apps/web/app/_components/journey/DayChamberShell.tsx`
- Create: `apps/web/app/_components/journey/journey.css`
- Modify: `apps/web/app/_components/LivingBook.tsx`
- Modify: `apps/web/app/_components/LivingBookMap.tsx`
- Modify: `apps/web/app/_components/DayLivingBook.tsx`
- Modify: representative adapter entry points first: `apps/web/app/day-001/page.tsx`, `apps/web/app/day-036/page.tsx`, `apps/web/app/day-037/page.tsx`, `apps/web/app/day-072/page.tsx`
- Modify: `apps/web/package.json` only if workspace dependency declaration is required.

**Interfaces:**
- Consumes: `getJourneySlots`, `projectDayChamber`, `getJourneyNavigation`, progress/resume contract.
- Produces: a desktop Living Book spread that renders AVAILABLE vs DORMANT textually, five Chamber surfaces, registry-driven previous/next and safe Journey return.

- [ ] **Step 1: Add a failing repository validator fixture/check** in the future M6 validator (Task 7 file may be introduced here) asserting Web imports the shared contract, renders 109 slots, has textual dormant state, and no arithmetic `/day-${n+1}` navigation remains in the M6 shell.

- [ ] **Step 2: Run validator**

Run: `node scripts/validate-m6-journey.mjs`
Expected: FAIL on missing Web integration.

- [ ] **Step 3: Implement `JourneyGrid` and `DayChamberShell`**, then wrap the representative boundary Days `001`, `036`, `037`, `072` without rewriting their confirmed Day bodies. Use those four to prove both level boundaries and Golden/legacy compatibility before broad mechanical adoption.

- [ ] **Step 4: Update Living Book entry/map** so the Journey surface can show the 001–109 horizon and a valid “Continuar” action only when the resume resolver returns an AVAILABLE Day.

- [ ] **Step 5: Run Web and contract gates**

Run: `pnpm --filter @hnk/web typecheck && node scripts/validate-m6-journey.mjs`
Expected: PASS for Web M6 assertions.

- [ ] **Step 6: Commit**

```bash
git add apps/web packages/journey-contract scripts/validate-m6-journey.mjs
git commit -m "feat(m6): integrate journey chambers on web"
```

### Task 6: Integrate the same semantics on Mobile

**Files:**
- Create: `apps/mobile/src/features/journey/JourneyScreen.tsx`
- Create: `apps/mobile/src/features/journey/DayChamberMobile.tsx`
- Create: `apps/mobile/src/features/journey/progress-adapter.ts`
- Modify: `apps/mobile/src/app/index.tsx`
- Modify: representative routes: `apps/mobile/src/app/day-001.tsx`, `apps/mobile/src/app/day-036.tsx`, `apps/mobile/src/app/day-037.tsx`, `apps/mobile/src/app/day-072.tsx`
- Modify: `apps/mobile/package.json` only if workspace dependency declaration is required.

**Interfaces:**
- Consumes: the exact shared M6 domain from Tasks 1–4.
- Produces: vertical mobile Journey/Chamber presentation with no alternate availability/progress semantics.

- [ ] **Step 1: Extend the M6 validator with failing Mobile assertions** proving imports come from `@hnk/journey-contract`, the same five surface IDs are consumed, and representative routes delegate navigation semantics rather than computing them independently.

- [ ] **Step 2: Run validator**

Run: `node scripts/validate-m6-journey.mjs`
Expected: FAIL on Mobile integration assertions.

- [ ] **Step 3: Implement `JourneyScreen` and `DayChamberMobile`** as a vertical renderer over the same projection. Keep existing Day feature components authoritative; wrap them instead of duplicating content.

- [ ] **Step 4: Implement the mobile progress adapter** using existing authenticated/offline completion infrastructure where compatible; on failure, surface progress failure while leaving the chamber readable.

- [ ] **Step 5: Run Mobile checks**

Run: `pnpm --filter @hnk/mobile typecheck && node scripts/validate-m6-journey.mjs`
Expected: PASS for Mobile M6 assertions.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile scripts/validate-m6-journey.mjs
git commit -m "feat(m6): integrate journey chambers on mobile"
```

### Task 7: Reconcile post-spec Day evidence before any frontier expansion

**Files:**
- Inspect: `apps/web/app/day-073/**`, `apps/web/app/day-074/**`
- Inspect: `apps/mobile/src/app/day-073.tsx`, `apps/mobile/src/app/day-074.tsx`
- Inspect: `packages/completion-contract/src/day073.ts`, `packages/completion-contract/src/day074.ts`
- Inspect: `packages/practice-contract/src/day073.ts`, `packages/practice-contract/src/day074.ts`
- Inspect: `content/canon/atziluth/chokmah/dia-073.md`, `content/canon/atziluth/binah/dia-074.md`
- Inspect: Day 073/074 validators/workflows.
- Modify only after explicit reconciliation: M6 spec, registry tests/registry, tree authority.

**Interfaces:**
- Consumes: repository evidence that may have landed after the M6 design snapshot.
- Produces: either (A) a documented decision to keep `073+` dormant in M6, or (B) an explicit spec amendment plus tests that promote only repository-proven Days. No silent promotion is allowed.

- [ ] **Step 1: Run/read repository-first Day 073/074 gates and compare their evidence with the approved M6 spec.**

- [ ] **Step 2: If evidence is insufficient or contradictory, keep `073–109` dormant** and record the conflict in the M6 delivery note/PR.

- [ ] **Step 3: If evidence proves executable authority and the product decision is to include it, amend the spec first**, then change registry tests from RED to the newly approved frontier. Never change the registry first.

- [ ] **Step 4: Run the complete journey-contract and Day-specific gates** after any amendment.

- [ ] **Step 5: Commit only if a reconciliation change is required.**

### Task 8: Finish repository/CI gate and regression proof

**Files:**
- Finalize: `scripts/validate-m6-journey.mjs`
- Create: `.github/workflows/m6-journey-gate.yml`
- Modify: `package.json` to add `validate:m6:journey`.
- Create: `docs/superpowers/evidence/2026-10-06-m6-journey-day-chambers.md`

**Interfaces:**
- Consumes: Tasks 1–7.
- Produces: one deterministic repository command and CI workflow proving M6 plus required regressions.

- [ ] **Step 1: Make the validator fail if any M6 invariant is absent**: 109-slot horizon, fail-closed dormant/unknown targets, five surfaces, registry navigation, progress/canon separation, Web/Mobile shared contract, and resume safety.

- [ ] **Step 2: Add root command** `validate:m6:journey` that runs the journey-contract tests, M6 validator, M3/M4/M5 validators, representative Day 001/036/037/072 gates, and any Day 073/074 gates admitted by Task 7.

- [ ] **Step 3: Add `.github/workflows/m6-journey-gate.yml`** using repository checkout + pnpm install/cache + `pnpm validate:m6:journey`. Do not require Vercel or a developer workstation.

- [ ] **Step 4: Run the full gate**

Run: `pnpm validate:m6:journey`
Expected: PASS with every named sub-gate green.

- [ ] **Step 5: Write the evidence note** with commit SHA, exact commands, PASS results, approved executable frontier, dormant frontier, and any known non-blocking limitations.

- [ ] **Step 6: Commit**

```bash
git add scripts/validate-m6-journey.mjs .github/workflows/m6-journey-gate.yml package.json docs/superpowers/evidence/2026-10-06-m6-journey-day-chambers.md
git commit -m "ci(m6): certify journey day chambers"
```

## Final Definition of Done

M6 is done only when the repository/CI evidence proves that a user can enter the Journey, see the 001–109 structural horizon, open every registry-AVAILABLE Day as a Chamber, traverse the five semantic surfaces with explicit unavailable facets, navigate only across executable Days, record progress without mutating canon, safely resume a valid Day, fail closed on dormant/invalid targets, and consume the same semantic contract on Web and Mobile.

The executable frontier recorded in the final evidence MUST match the latest explicitly approved M6 spec. Repository files that appear newer than the design snapshot are evidence to reconcile, not permission for silent scope expansion.
