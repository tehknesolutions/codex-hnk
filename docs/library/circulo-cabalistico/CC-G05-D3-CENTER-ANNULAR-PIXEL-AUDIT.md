# CC-G05-D3 — CENTER ANNULAR PIXEL AUDIT

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Fonte:** `mandala-dos-anjos-72-completa-rosa-1-CIRCULO-CABALISTICO.webp` — 900×900 RGB  
**Centro de medição:** (450,450)  
**Estado:** CANON-ANALYSIS / EVIDENCE GATE

## Objetivo

Preparar a construção das máscaras geométricas dos 43 AK ainda pendentes de COLOR-ID por meio de uma auditoria pixel-exact das bandas concêntricas do centro.

## Resultado observado

Foram auditadas seis bandas radiais. As cores abaixo são as ocorrências exatas mais frequentes em cada banda, antes de qualquer tentativa de atribuição a um AK individual.

### r = 0–50 px

- #FF0000 — 1695 px
- #00FFFF — 1248 px
- #FFFF00 — 948 px
- #FEFEFE — 638 px
- #0000FF — 283 px
- #00A859 — 141 px
- #D4B072 — 138 px
- #D4B071 — 125 px

### r = 50–80 px

- #FF0000 — 1709 px
- #FFFF00 — 1693 px
- #00FFFF — 1160 px
- #FF7F00 — 1141 px
- #3F007F — 1004 px
- #0000FF — 898 px
- #3FBF7F — 896 px
- #7F007F — 810 px

### r = 80–110 px

- #0000FF — 1868 px
- #3F007F — 1810 px
- #FF0000 — 1791 px
- #FFFF00 — 1776 px
- #FF7F00 — 1733 px
- #7F007F — 1718 px
- #3FBF7F — 1697 px
- #373435 — 279 px

### r = 110–140 px

- #FFFF00 — 1484 px
- #3F007F — 1379 px
- #FFBF00 — 1287 px
- #0000FF — 1272 px
- #41C07F — 1161 px
- #FF0000 — 1130 px
- #BF3F7F — 1101 px
- #BFFF41 — 1088 px

### r = 140–170 px

- #FF0000 — 2963 px
- #00A859 — 2544 px
- #3E4095 — 2544 px
- #FFF212 — 2521 px
- #FF4100 — 557 px
- #FF7F00 — 531 px
- #0000FF — 527 px
- #FFBF00 — 511 px

### r = 170–200 px

- #0000FF — 1829 px
- #FFBF00 — 1483 px
- #BF3F7F — 1450 px
- #FF7F00 — 1447 px
- #BFFF41 — 1388 px
- #007F7F — 1382 px
- #FF0000 — 1364 px
- #41C07F — 1360 px

## Interpretação estrutural

A auditoria confirma que a região central não pode ser tratada como uma simples continuação dos 12 setores cromáticos externos. Há mudanças bruscas de paleta e sobreposição de componentes gráficos em diferentes raios.

Consequentemente:

```text
COLOR-ID(AK interno) != COLOR-ID(setor externo) por herança automática
```

A atribuição dos 43 AK pendentes deve usar máscara individual e pixels internos erodidos.

## Estado do checksum

```text
TOTAL_AK = 475
COLOR_RESOLVED_AK = 432
COLOR_PENDING_AK = 43
432 + 43 = 475
```

Nenhum dos 43 AK é promovido neste documento: esta auditoria serve para impedir falsos positivos antes da segmentação individual.

## Próximo gate — CC-G05-D4

Construir as máscaras em três famílias separadas:

1. `HEADER-MASK-01..09`
2. `TRANSITION-MASK-01..12`
3. `ROSE-MASK-01..22` (estratos 3 + 7 + 12)

Para cada máscara registrar:

```text
AK-ID
MASK-ID
PIXEL-SAMPLE-N
MODAL-RGB
MODAL-HEX
DOMINANCE-RATIO
COLOR-ID
CONFIDENCE
SOURCE-ID
```

Somente após esse passo o contador `COLOR_RESOLVED_AK` pode ultrapassar 432.