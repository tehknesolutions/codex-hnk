# CODEX HNK Visual Target V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o Visual Target V1 canônico em um sistema de componentes reutilizável para Kether, Chokhmah e Binah sem rasterizar a UI nem criar 109 páginas manuais.

**Architecture:** Design tokens e primitivas semânticas alimentam um CodexShell. Macrocosmo, Chamber Engine e Practice Engine compartilham contratos tipados, enquanto SphereTheme e DayDefinition controlam manifestação visual e conteúdo. Mobile recompõe os mesmos estados por equivalência narrativa.

**Tech Stack:** Next.js/React, TypeScript, CSS, SVG, AVIF/WebP.

**Spec:** `docs/superpowers/specs/2026-09-28-codex-hnk-visual-target-v1-design.md`

## Global Constraints
- Visual Target V1 e issue #342 são autoridade visual.
- `Sigil != Ornament`; glifos canônicos nunca são escolhidos como decoração livre.
- Hero assets < 1.5 MB; primeira dobra < 3 MB.
- Contraste AA, focus-visible, teclado, reduced-motion e touch targets >= 44px.
- Nenhum texto essencial rasterizado em imagens.
- Nenhuma implementação manual por 109 Days.

## Review Focus
- Day sem artwork específico deve degradar para atmosfera temática sem quebrar layout.
- Reduced-motion deve remover loops sem esconder conteúdo/estado.
- Mobile deve manter ordem narrativa e CTA principal.
- Glifo desconhecido deve falhar de forma explícita, não substituir por símbolo decorativo.
- Artwork ausente/lento não pode tornar texto ou navegação ilegíveis.

---

### Task 1: Visual tokens + semantic primitives
**Files:** Create `apps/web/lib/codex/visual-tokens.ts`; create `apps/web/components/codex/ornaments/*`; test token invariants in existing web test convention.
**Interfaces:** Produces `SphereTheme`, material/light/motion tokens and ornament primitives.
- [ ] Write failing tests for three sphere themes, semantic glyph/ornament separation and fallback-safe material tokens.
- [ ] Run focused tests and confirm failure.
- [ ] Implement tokens and primitives with no product-page coupling.
- [ ] Verify tests and reduced-motion CSS contract.
- [ ] Commit `feat(codex): add canonical visual tokens and primitives`.

### Task 2: CodexShell
**Files:** Create `apps/web/components/codex/CodexShell.tsx`, `CodexHeader.tsx`, `CodexSearch.tsx`; integrate from `apps/web/app/layout.tsx`.
**Interfaces:** Consumes Task 1 tokens; produces shared shell slots for Macrocosm and Chambers.
- [ ] Add tests for semantic navigation, keyboard focus, search affordance and mobile header composition.
- [ ] Implement shell/header/search with accessible landmarks.
- [ ] Verify desktop/mobile and no-JS readable navigation.
- [ ] Commit `feat(codex): build canonical shell and navigation`.

### Task 3: Sacred Portal Home
**Files:** Split current `apps/web/app/page.tsx`; create `SacredPortalHome`, `SpherePortal`, `HnkTree`, `SacredMetrics`, `CodexPortalGrid`.
**Interfaces:** Consumes `SphereTheme`; produces canonical Macrocosm entry.
- [ ] Add component tests for Kether 001–036, Chokhmah 037–073, Binah 074–109 and destination links.
- [ ] Implement portal architecture and HNK Tree SVG as real UI, not rasterized mockup.
- [ ] Add progressive artwork loading and text-safe fallback states.
- [ ] Verify first-fold asset budget and responsive narrative ordering.
- [ ] Commit `feat(codex): manifest Sacred Portal Home`.

### Task 4: Chamber Engine
**Files:** Create `apps/web/lib/codex/days.ts`; create `components/codex/chamber/*`; migrate one representative Day per sphere before bulk adoption.
**Interfaces:** Produces `DayDefinition` and `ChamberRenderer`; consumes `SphereTheme`.
- [ ] Test required DayDefinition fields, unknown Day behavior, section ordering and navigation boundaries.
- [ ] Implement `Limiar → Chave → Atmosfera → Revelação → Manuscrito → Artefato → Descoberta → Kavanah → Escolha → Quest → Espelho → Passagem`.
- [ ] Migrate representative Kether/Chokhmah/Binah Days without changing canonical content.
- [ ] Verify keyboard/mobile/reduced-motion and commit.

### Task 5: Practice Engine
**Files:** Create `components/codex/practice/*` and typed practice state model; connect existing practice contract rather than duplicating it.
**Interfaces:** States: preparation, practice, active, completion, perception, journal, reward, correspondences, next.
- [ ] Test legal state transitions, timer independence, focus returns, reflection persistence and completion idempotency.
- [ ] Implement LAB visual language over functional wireflow.
- [ ] Verify interruption/resume, reduced-motion and mobile CTA behavior.
- [ ] Commit `feat(codex): add canonical practice engine`.

### Task 6: Progression + Tree state
**Files:** Create focused progression presentation components; reuse existing canonical XP/backend contracts.
**Interfaces:** Consumes completion/XP/artifact state; produces visual tree/progression state only.
- [ ] Test locked/available/active/completed/canonical visual states and idempotent reward display.
- [ ] Implement XP, achievements, artifacts and tree state without inventing authority client-side.
- [ ] Verify fail-closed behavior when backend state is absent.
- [ ] Commit `feat(codex): project canonical progression into visual system`.

### Task 7: Knowledge + Henuvokodan surfaces
**Files:** Create Macrocosm modules for Pillars/7×7/Graph and `glyph-registry.ts` adapter over canonical HNK data.
**Interfaces:** Consumes canonical research/artifacts; never fabricates unresolved mappings.
- [ ] Test glyph category boundaries, unresolved glyph behavior and 7×7 navigation semantics.
- [ ] Implement book/map presentation and registry-backed glyph rendering.
- [ ] Verify unknown mappings remain explicitly unknown.
- [ ] Commit `feat(codex): add knowledge and Henuvokodan visual surfaces`.

### Task 8: Mobile narrative compositions
**Files:** Add responsive composition rules beside owning components; avoid separate duplicate mobile app markup where possible.
**Interfaces:** Same semantic state as desktop, different composition.
- [ ] Test DOM/narrative order at mobile breakpoints and 44px targets.
- [ ] Implement vertical recomposition for Home, Chamber and Practice.
- [ ] Verify representative narrow/wide viewport snapshots and keyboard order.
- [ ] Commit `feat(codex): enforce responsive narrative equivalence`.

### Task 9: Visual acceptance gate
**Files:** Add visual-target checklist/docs and available automated accessibility/performance assertions.
**Interfaces:** Gate order: silhouette, grid, hierarchy, typography, portals, art direction, Tree, materiality, ornament, motion, responsive, performance.
- [ ] Capture representative Home/Chamber/Practice desktop+mobile evidence.
- [ ] Run typecheck/tests/accessibility/performance checks available in repository.
- [ ] Record deviations explicitly; do not call partial fidelity complete.
- [ ] Commit `test(codex): gate Visual Target V1 fidelity`.