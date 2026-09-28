# CODEX-HNK — Visual Source Registry V1

## Purpose

Machine-oriented registry for the 12 canonical visual references.

The original PNGs are the visual source layer. Production assets may be derived from them, but derived assets must retain a source reference.

## Source records

| ID | File | Size | Role | Primary subsystem |
|---|---|---:|---|---|
| VS-01 | codex-hnk-mapa-sete-pilares.png | 1536×1024 | Knowledge map | Knowledge Graph |
| VS-02 | painel-cosmico-codex-hnk.png | 1536×1024 | Dense macro home | Portal Home |
| VS-03 | codex-hnk-vida-que-transforma.png | 1536×1024 | Personal dossier | Personal Codex |
| VS-04 | codex-lab-001-coroa-antes-da-forma-03.png | 1055×1491 | Practice variant | Practice Engine |
| VS-05 | portal-cosmico-codex-hnk.png | 1536×1024 | Monumental portal | Portal Home |
| VS-06 | codex-lab-001-coroa-antes-da-forma-02.png | 1055×1491 | Practice variant | Practice Engine |
| VS-07 | codex-lab-001-coroa-antes-da-forma-01.png | 1055×1491 | Practice variant | Practice Engine |
| VS-08 | codex-lab-001-coroa-antes-da-forma.png | 1055×1491 | Practice base variant | Practice Engine |
| VS-09 | codex-digital-o-salto-cosmico.png | 1536×1024 | Day storyboard | Chamber Engine |
| VS-10 | codex-mistico-henuvokodan-arvore-portais-dourados.png | 1312×1199 | Language/portal atlas | Glyph System |
| VS-11 | colagem-cosmica-codex-hnk.png | 1024×1536 | Journey storyboard | Journey Engine |
| VS-12 | proximo-passo-codex-digital-mistico.png | 1536×1024 | Design system board | Design System |

## Source integrity

| ID | SHA-256 |
|---|---|
| VS-01 | 39a8c5c8bab1fa525d4bf40abd4c8fa082e033c4b1f68928f30848c3bddcf958 |
| VS-02 | 76a7ac24f0c68bafe3940f0a0553a629ac21208ab195aa3a33c7146c91ab0bde |
| VS-03 | 59b497ba68ef24195aca2ad3515be44379f9fce712595270a6374dc57acd0d98 |
| VS-04 | 8b673149867fafcb170664d96d0d41952a9c613575eba6cd52098719665ef2be |
| VS-05 | 67a8868ee44f768ebac13310e9023ec354fcc356a10870cb85581fd369f5c147 |
| VS-06 | c8697c92f0c5684de6c572a14f2e29652464f41b4725c1cbfc41b16612d5b0ed |
| VS-07 | df00d604e8092919793706c26bc3499ea3c2315d8372d66a7cefe970643a1ce7 |
| VS-08 | c1302406c4ed280ce10b218c204e47ccf147626639ee4d2b9b814dfb20dd9e0f |
| VS-09 | 15f87261e9e1f5003cf7197c1ef4ead9934eb3792a14522a2eefd69255a24f6b |
| VS-10 | 4f491a4399ae7c13a42d907205a42537d78a9568312874bbc79b70c1ace8c410 |
| VS-11 | ce9fda1ee5394bbab386ecf56428be7a7b3212d95b18e6d07a98c41f3ddaf898 |
| VS-12 | 7cb7783abe841cc1be7fe41881f0877101b713852de48d1c87154cd130836fe6 |

## Usage policy

Every production visual asset derived from a source should be traceable to one or more VS IDs.

Example:

```text
hero-kether.avif
  source: VS-02
  source-region: hero / Kether portal
  derivation: crop + color normalization
```

## No silent replacement

If an implementation diverges from a source for functional reasons, document the divergence.

If a new image becomes canonical, add a new source ID rather than overwriting the historical source.

## Asset classes

- SOURCE — original reference.
- DERIVED — optimized/cropped/resized production asset.
- UI — semantic interface.
- GLYPH — canonical symbolic geometry.
- TEXTURE — material surface.
- MOTION — animation definition.

## Recommended repository structure

```
docs/design/visual-target-v1/
├── README.md
├── CANONICAL-SOURCES.md
├── DEEP-DISSECTION-12-SOURCES.md
├── VISUAL-SOURCE-REGISTRY.md
├── IMAGE-DECOMPOSITION-REPORT.md
└── sources/
```
