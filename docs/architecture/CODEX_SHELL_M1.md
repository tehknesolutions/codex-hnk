# M1 — Persistent Codex Shell

Status: IMPLEMENTATION CONTRACT
Depends on: `docs/visual-target/CODEX_NORTH_STAR_V1.md`
Master roadmap: #379

## Objective
Replace the landing-page-first composition with a persistent application shell that makes every principal route feel like a chamber/surface of the same CODEX.

## Component boundary

```text
CodexShell
├── CodexTopbar
├── CodexNavRail
├── CodexViewport
│   └── route content
└── CodexContextRail
```

On compact/mobile layouts the rails may become drawers/sheets, but their information architecture must remain stable.

## CodexTopbar
Responsibilities:
- product identity;
- current location/breadcrumb context;
- global search entry;
- global utility controls;
- never dominate the manuscript surface.

## CodexNavRail
Primary destinations:
- Início
- Jornada
- Árvore HNK
- Fólio 1096
- Biblioteca
- HENUVOKODAN
- Labs

Secondary/user destinations may include Perfil and Configurações when supported.

Rules:
- persistent on monumental desktop layouts;
- active location is explicit;
- icons/sigils complement labels rather than replace accessibility text;
- navigation state cannot depend only on color.

## CodexViewport
The main stage. It must accept current route content during M1 and later accept M2 primitives:
- CodexBook
- CodexSpread
- CodexPage
- PageTabs
- diagrams/hotspots
- route-aware transitions

M1 must not hard-code the viewport around the current Home page.

## CodexContextRail
Contextual, not globally noisy. Depending on route it may expose:
- system/ontology shortcuts;
- progress;
- current Pillar/Domain/Day;
- related concepts;
- provenance/source status;
- next meaningful action.

On mobile this becomes an on-demand contextual surface.

## Migration strategy
1. Introduce shell primitives without deleting current routes.
2. Move global navigation/identity out of individual pages.
3. Render current Home and Day content inside CodexViewport.
4. Establish responsive shell behavior.
5. Remove duplicate route-level headers/navigation.
6. Hand central viewport to M2 Living Book Engine.

## State contract
Shell navigation state should derive from route/data rather than duplicated visual constants.

At minimum expose:
- active section;
- optional active Day;
- optional active Pillar/Domain;
- progress summary when authoritative data exists;
- context actions.

Unknown values remain unknown; do not fabricate progress or canonical mappings.

## Accessibility
- semantic navigation landmarks;
- keyboard reachable destinations and controls;
- visible focus state;
- labels for sigil/icon controls;
- no information encoded solely by glow/color;
- reduced-motion mode honored from the shell onward.

## Responsive behavior
### Monumental desktop
Left navigation rail + central Codex viewport + contextual right rail.

### Tablet
Compact left rail or drawer + central viewport + collapsible context.

### Mobile
Codex remains the conceptual primary surface. Navigation/context become controlled overlays/sheets; content must not degrade into an unrelated generic card feed.

## Acceptance gate
M1 passes when Home and at least one Journey/Day route can live inside the same persistent shell with coherent navigation, responsive behavior and no canonical-data invention.

M1 does not require the final physical page-turn implementation; that belongs to M2.