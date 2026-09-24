# CC-G05-A — COLOR REGISTRY / SOURCE-RASTER-900

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Fonte analisada:** `mandala-dos-anjos-72-completa-rosa-1-CIRCULO-CABALISTICO.webp`  
**Dimensões verificadas:** 900 × 900 px  
**Estado:** CANON-ANALYSIS / COLOR-SAMPLING V1

## Regra

A cor é uma dimensão transversal do AK. Variações de antialiasing, compressão WebP, texto, glifos e linhas sobrepostas não geram automaticamente novos `COLOR-ID`.

```text
AK-ID != COLOR-ID
CHOIR-ID != COLOR-ID
SYMBOL-ID != COLOR-ID
```

## Primeira quantização cromática medida

A imagem foi amostrada dentro da circunferência principal e quantizada para detectar massas cromáticas dominantes. Estes valores são **centroides raster observados**, não ainda a paleta canônica final.

| SAMPLE-ID | RGB medido | HEX | pixels no cluster V1 |
|---|---:|---:|---:|
| CS-001 | 0,0,255 | #0000FF | 47,575 |
| CS-002 | 255,1,1 | #FF0101 | 42,673 |
| CS-003 | 63,191,127 | #3FBF7F | 42,537 |
| CS-004 | 3,135,149 | #038795 | 41,479 |
| CS-005 | 255,127,0 | #FF7F00 | 37,713 |
| CS-006 | 255,255,0 | #FFFF00 | 37,641 |
| CS-007 | 138,4,117 | #8A0475 | 37,494 |
| CS-008 | 63,0,127 | #3F007F | 35,302 |
| CS-009 | 249,248,249 | #F9F8F9 | 34,578 |
| CS-010 | 191,63,123 | #BF3F7B | 33,843 |
| CS-011 | 250,194,32 | #FAC220 | 32,453 |
| CS-012 | 255,68,7 | #FF4407 | 31,749 |
| CS-013 | 185,255,76 | #B9FF4C | 30,077 |
| CS-014 | 163,158,141 | #A39E8D | 22,710 |
| CS-015 | 91,153,140 | #5B998C | 17,365 |
| CS-016 | 72,84,160 | #4854A0 | 14,891 |
| CS-017 | 156,224,134 | #9CE086 | 14,834 |
| CS-018 | 177,92,108 | #B15C6C | 12,378 |
| CS-019 | 50,30,140 | #321E8C | 12,070 |
| CS-020 | 241,240,159 | #F1F09F | 11,024 |
| CS-021 | 53,204,154 | #35CC9A | 8,740 |
| CS-022 | 242,130,82 | #F28252 | 8,609 |
| CS-023 | 250,245,12 | #FAF50C | 8,597 |
| CS-024 | 237,172,112 | #EDAC70 | 5,725 |

## Interpretação

A quantização confirma que a Mandala possui uma paleta estrutural altamente discreta, mas os 24 clusters acima misturam três fenômenos:

1. cores estruturais de fundo;
2. cores de símbolos/textos/linhas;
3. variantes raster causadas por mistura de borda e compressão.

Portanto `CS-*` significa **COLOR-SAMPLE**, não `COLOR-ID` definitivo.

## Próximo gate

`CC-G05-B — BACKGROUND COLOR CLASSIFICATION`

Para cada um dos 475 AK:

1. calcular uma amostra no interior da célula, afastada das bordas;
2. rejeitar pixels pertencentes a glifos/texto/linhas;
3. estimar a cor modal/mediana do fundo;
4. agrupar fundos equivalentes;
5. promover apenas grupos estáveis a `COLOR-ID`;
6. produzir `AK_COUNT` por `COLOR-ID`;
7. manter `UNRESOLVED` quando a geometria do AK ainda não fornecer região de amostragem segura.

A saída final deve satisfazer:

```text
SUM(AK_COUNT por COLOR-ID) + UNRESOLVED = 475
```

Nenhum `COLOR-ID` será criado apenas por correspondência cabalística ou pelo nome textual de um setor; a promoção depende da evidência raster.