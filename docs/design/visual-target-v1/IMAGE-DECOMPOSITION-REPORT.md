# CODEX-HNK — Visual Target V1
# Canonical Image Decomposition Report

**Status:** CANONICAL SUPPORT ARTIFACT
**Date:** 2026-09-28
**Canonical issue:** #342
**Source branch:** docs/canonical-visual-sources-v1

## 1. Purpose

This report is stored beside the canonical visual-source manifest so the repository retains not only the visual references, but also the technical decomposition used to implement them.

The source images remain the authority. This document records the decomposition of their visible structure into reusable product components, visual tokens, assets, states and acceptance criteria.

## 2. Canonical source set

| Source | Role | Integrity |
|---|---|---|
| painel-cosmico-codex-hnk.png | Full CODEX-HNK macrocosm / dashboard-density reference | SHA-256 recorded in CANONICAL-SOURCES.md |
| portal-cosmico-codex-hnk.png | Clean monumental portal / first-fold reference | SHA-256 recorded in CANONICAL-SOURCES.md |

The repository must preserve the distinction between source artwork and implementation. Crops, previews and screenshots are derivatives.

## 3. Visual North Star

The visual language is: **Sacred Editorial Fantasy + Dark Luxury + Cosmic Architecture + Codex Manuscript + Interactive Journey.**

The target is not a conventional SaaS dashboard. The interface must read as a navigable codex/artifact.

Core principle: **rigid structure underneath; living experience above.**

## 4. Global composition

The macro composition decomposes into:

1. Global navigation
2. Intro/editorial panel
3. Three sphere portals
4. HNK Tree / macro journey panel
5. Sacred metrics strip
6. Narrative portal grid
7. Ornamental frame / termination

Conceptual structure: CodexShell → Header/Navigation/Search/Identity → Macrocosm → CodexIntro + KetherPortal + ChokhmahPortal + BinahPortal + HnkTree → SacredMetrics → CodexPortalGrid.

## 5. Global navigation decomposition

Visible responsibilities: HNK/CODEX identity lockup; primary navigation; search; theme/appearance control; identity/avatar; responsive navigation drawer.

Implementation boundary: CodexHeader → HnkSigil, BrandLockup, PrimaryNavigation, CodexSearch, ThemeControl, IdentityBadge.

Navigation must remain semantic HTML and must not be embedded into artwork.

## 6. Editorial intro panel

Content hierarchy: eyebrow BEM-VINDO AO CODEX HNK; monumental HNK title; editorial phrase Sacred Editorial Fantasy; concise description; primary journey CTA; secondary tree CTA.

Typography relationship: display uses a high-contrast editorial serif / elegant italic; interface uses sans-serif, uppercase, tracking and restrained weight.

The image establishes hierarchy rather than requiring a pixel-identical font.

## 7. Sphere portals

### Kether — 001–036
Gold / ivory; warm celestial atmosphere; mountains; luminous city/temple; foundation / roots / sacred structure; crown, circle and vertical-axis geometry.

### Chokhmah — 037–073
Celestial blue / cyan; cosmic depth; suspended architecture; expansion / radiance / wave / spiral; vision / knowledge / creation.

### Binah — 074–109
Royal violet / indigo; nocturnal architecture; vertical structures; mystery / containment; triangle / vessel / structural geometry; discernment / order / manifestation.

A sphere is NOT merely a color theme. It owns an art-direction profile.

Component: SpherePortal → ArchFrame, SphereSigil, SphereHeading, Range, RealmArtwork, SphereKeywords, SphereDescription, EnterSphereCTA.

## 8. HNK Tree decomposition

The right-side macro panel represents the complete journey.

Semantic responsibilities: journey title; HNK Tree visualization; 109-day relationship; macro CTA; progression state.

Required future states: locked, available, active, completed, canonical.

Preferred implementation: SVG + semantic React state + CSS states rather than a single rasterized tree image.

## 9. Sacred metrics strip

The light manuscript strip deliberately interrupts the dark cosmic field.

Canonical values shown in the reference: **705 LUX — Pactos de Luz; 26 VERBUM — Princípios Vivos; 365 OPERATIO — Dias em Ação.**

Material direction: ivory/parchment, dark ink, gold, subtle grain, restrained manuscript texture.

Intended rhythm: COSMOS ESCURO → MANUSCRITO CLARO → COSMOS ESCURO.

## 10. Narrative portal grid

The reference establishes four destinations: FÓLIO 1096, JORNADA HNK, BIBLIOTECA, SOBRE O CODEX.

Each portal combines cinematic artwork, dark lower gradient, editorial title, metadata and circular arrow CTA.

The whole card is the navigation target. Avoid oversized generic buttons covering the artwork.

Component model: CodexPortalGrid → FolioPortal, JourneyPortal, LibraryPortal, AboutPortal.

## 11. Depth model

The composition uses approximately five visual planes:

1. Cosmic background
2. Architecture / cathedral
3. Realm artwork
4. Sigils / glow / stars / particles
5. UI / typography / interaction

CSS and DOM should preserve these planes.

Glow belongs primarily to sigils, stars, lines and active portals. Normal text must remain clean and legible.

## 12. Ornament system

Recurring motifs: thin gold rules, filigree, corner ornaments, hermetic circles, stars, arches, columns, frames, particles and geometric symbols.

Reusable primitives: GoldRule, CornerOrnament, CanonicalGlyph, ArchFrame, StarField, ManuscriptDivider, CodexFrame.

Rule: **ornament follows hierarchy.** Ornament must not become arbitrary decoration or compete with primary content.

## 13. Material system

Primary material families: obsidian/black, gold, ivory/parchment, cosmic blue, royal violet, architectural stone, manuscript ink and subtle grain.

Recommended responsibility: SVG for glyphs/geometry/diagrams; AVIF for hero and realm artwork; WebP for supporting artwork; CSS for atmosphere/light/vignette/grain/states; HTML for all semantic content.

The UI itself must never become one flattened raster image.

## 14. Motion

Motion vocabulary: emanação, respiração, resposta, impacto, transmutação.

Motion should be slow, deliberate and architectural.

Required: prefers-reduced-motion. Reduced motion removes non-essential loops without removing information, navigation or state.

## 15. Responsive decomposition

Mobile is not a scaled-down desktop. It is a recomposition preserving meaning, sequence, hierarchy, state and primary CTA.

Desktop prioritizes monumental composition. Mobile prioritizes narrative progression and action.

Canonical responsive rule: **same semantic state, different composition.**

## 16. Macro / Meso / Micro scales

MACROCOSMO: Home, Árvore HNK, Jornada, Henuvokodan, 7 Pilares, Matriz 7×7, Knowledge Graph, Biblioteca.

MESOCOSMO: Day, portal, chamber, manuscript, revelation, artifact, correspondences, Kavanah, choice, quest, mirror, passage.

MICROCOSMO: preparation, objective, timer, events, focus/return, reflection, journal, XP, achievement.

Canonical flow: MACROCOSMO → MESOCOSMO → MICROCOSMO → TRANSFORMAÇÃO → RETORNO À ÁRVORE.

## 17. Chamber relationship

The macro portal opens into a Day chamber.

Canonical renderer relationship: DayDefinition → ChamberRenderer → SphereTheme → UniqueManifestation.

Standard chamber anatomy: Limiar → Chave → Atmosfera → Revelação → Manuscrito → Artefato → Descoberta → Kavanah → Escolha → Quest → Espelho → Passagem.

The 109 Days must be data-driven rather than manually authored as 109 independent interfaces.

## 18. Practice relationship

The LAB reference supplies visual identity; the functional practice contract supplies behavior.

States: preparação → prática → prática ativa → conclusão → percepção → diário → recompensa → correspondências → próximo passo.

Visual implementation must not duplicate or replace the existing canonical practice authority.

## 19. Glyph semantics

Hard rule: **Sigil != Ornament**.

Semantic classes: CanonicalGlyph, PortalGlyph, SphereGlyph, OperatorGlyph, DecorativeGeometry, Ornament.

Canonical glyphs must come from the canonical registry.

Unknown glyphs must remain explicitly unknown. They must never be silently replaced with decorative symbols.

## 20. Asset families

A — Realm artwork: Kether, Chokhmah, Binah.
B — Portal artwork: Folio, Jornada, Biblioteca, Sobre.
C — Sacred geometry: HNK Tree, sigils, diagrams, portal geometry, structural ornaments.
D — Materials: parchment, grain, cosmos, gold textures, architectural textures.

## 21. Performance constraints

Canonical target: hero assets < 1.5 MB; first view < 3 MB; below-fold artwork lazy loaded; AVIF/WebP for raster artwork; SVG for geometry; semantic HTML for text.

The visual target must not produce a 20–40 MB homepage.

## 22. Accessibility constraints

Required: WCAG AA contrast target; focus-visible; keyboard navigation; reduced-motion; semantic headings; alt text; aria-label for interactive glyphs; touch targets >= 44px; text outside images.

## 23. Anti-patterns

Do not implement: generic SaaS dashboard; generic rounded-card grid; indiscriminate glassmorphism; generic purple/blue gradients; excessive neon; 109 handcrafted page layouts; essential text baked into artwork; single giant AI background containing the UI; excessive animation; ornament without hierarchy/function.

## 24. Visual acceptance order

Every visual review follows this order: 1) Silhouette, 2) Grid, 3) Hierarchy, 4) Typography, 5) Portal architecture, 6) Art direction, 7) HNK Tree, 8) Materiality, 9) Ornamentation, 10) Motion, 11) Responsiveness, 12) Performance.

Fidelity is evaluated by preservation of **hierarchy + monumentality + depth + codex/navigation feeling**, not by counting copied pixels or decorative elements.

## 25. Implementation decomposition

Component units: CodexShell, CodexHeader, CodexSearch, SacredPortalHome, CodexIntro, SpherePortal, SphereSigil, RealmArtwork, HnkTree, HnkTreeNode, SacredMetrics, CodexPortalGrid, CodexPortal, ChamberShell, ChamberHero, ChamberManuscript, ChamberArtifact, ChamberPractice, ChamberVault, ChamberNavigation, PracticeEngine, Progression, CanonicalGlyph, ArchFrame, GoldRule, CornerOrnament, StarField.

Data/configuration boundaries: lib/codex/spheres.ts, days.ts, navigation.ts, visual-tokens.ts, glyph-registry.ts.

## 26. Existing repository authority

The repository already contains the formal Visual Target V1 design and implementation plan:

- docs/superpowers/specs/2026-09-28-codex-hnk-visual-target-v1-design.md
- docs/superpowers/plans/2026-09-28-codex-hnk-visual-target-v1.md

Those documents define the formal component boundaries, SphereTheme, Chamber Engine, Practice Engine, responsive equivalence, glyph semantics and acceptance sequence.

This report is the **image-decomposition companion**, not a replacement for the formal specification.

## 27. Canonical source chain

ORIGINAL USER-PROVIDED IMAGE → CANONICAL-SOURCES.md → IMAGE DECOMPOSITION REPORT → VISUAL TARGET V1 SPEC → IMPLEMENTATION PLAN → COMPONENTS / TOKENS / ASSETS → CI VISUAL + ACCESSIBILITY + PERFORMANCE GATES → PRODUCTION.

No implementation screenshot becomes a new source of truth without an explicit canonical decision.

## 28. Source integrity

The exact SHA-256 values and original byte sizes are maintained in docs/design/visual-target-v1/CANONICAL-SOURCES.md.

This report intentionally does not duplicate those hashes, preventing multiple competing manifests.

## 29. Final decomposition principle

The images are not a mockup to be copied literally.

They are the visual specification for a reusable system:

**COSMOS → ARCHITECTURE → GEOMETRY → ARTIFACT → INFORMATION → INTERACTION**

The implementation must preserve that progression while making every semantic layer real, responsive, accessible and data-driven.