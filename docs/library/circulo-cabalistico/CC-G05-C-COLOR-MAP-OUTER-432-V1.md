# CC-G05-C — COLOR MAP do anel radial 432 — V1

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Fonte de medição:** `SOURCE-RASTER-900`, 900×900 px  
**Estado:** CANON-ANALYSIS / PASS PARCIAL

## 1. Objetivo

Determinar a cor estrutural de fundo dos AKs do anel radial sem confundir fundo com glifos, letras, linhas, antialiasing ou contornos.

## 2. Método

A amostragem foi feita no interior dos setores, evitando deliberadamente limites radiais. Para cada um dos 12 setores de 30°, foram amostrados múltiplos ângulos internos e múltiplos raios no anel externo. A cor modal do fundo foi então registrada.

O teste confirmou uma propriedade estrutural importante: as seis faixas radiais de cada posição de 5° compartilham o fundo cromático do setor de 30° ao qual pertencem.

Assim:

```text
1 setor cromático = 30°
1 setor cromático = 6 POSITION-UNIT de 5°
1 POSITION-UNIT = 6 RADIAL-AK
1 setor cromático = 6 × 6 = 36 RADIAL-AK
```

Checksum:

```text
12 × 36 = 432 RADIAL-AK
```

## 3. COLOR-ID estruturais do anel radial

| COLOR-ID | RGB | HEX | setor angular* | RADIAL-AK |
|---|---:|---|---:|---:|
| COLOR-01 | 191,63,127 | #BF3F7F | 0 | 36 |
| COLOR-02 | 127,0,127 | #7F007F | 1 | 36 |
| COLOR-03 | 63,0,127 | #3F007F | 2 | 36 |
| COLOR-04 | 0,0,255 | #0000FF | 3 | 36 |
| COLOR-05 | 0,127,127 | #007F7F | 4 | 36 |
| COLOR-06 | 65,192,127 | #41C07F | 5 | 36 |
| COLOR-07 | 191,255,65 | #BFFF41 | 6 | 36 |
| COLOR-08 | 255,255,0 | #FFFF00 | 7 | 36 |
| COLOR-09 | 255,191,0 | #FFBF00 | 8 | 36 |
| COLOR-10 | 255,127,0 | #FF7F00 | 9 | 36 |
| COLOR-11 | 255,65,0 | #FF4100 | 10 | 36 |
| COLOR-12 | 255,0,0 | #FF0000 | 11 | 36 |

\* `setor angular` usa índice relativo 0–11 nesta medição. O alinhamento semântico/nomeado será ligado posteriormente a `SECTOR12-ID`; não inferir nomes apenas da cor.

## 4. Resultado fechado

```text
RADIAL_AK_TOTAL = 432
COLOR_COUNT = 12
AK_PER_COLOR = 36
12 × 36 = 432
UNRESOLVED_RADIAL_AK = 0
```

Portanto, para o ramo radial regular:

> **432/432 AK possuem COLOR-ID estrutural resolvido.**

## 5. O que ainda não foi incluído

O Registry completo possui 475 AK:

```text
9 HEADER-AK
432 RADIAL-AK
12 TRANSITION-AK
22 ROSE-AK
----------------
475 AK
```

Este gate resolve somente os 432 RADIAL-AK. Permanecem para classificação cromática individual:

```text
9 + 12 + 22 = 43 AK
```

Logo:

```text
COLOR_RESOLVED_AK = 432
COLOR_UNRESOLVED_AK = 43
432 + 43 = 475
```

## 6. Regra de evidência

As cores secundárias encontradas dentro dos mesmos setores — usadas em glifos, letras e símbolos — não foram promovidas a `COLOR-ID` de fundo. Elas deverão entrar em `SYMBOL-COLOR-ID` / `INK-COLOR-ID` em uma camada própria.

## 7. Próximo gate

**CC-G05-D — HEADER + TRANSITION + ROSE COLOR MAP**

Objetivo:

1. medir os 9 HEADER-AK individualmente;
2. medir os 12 TRANSITION-AK individualmente;
3. medir as 22 pétalas/ROSE-AK individualmente;
4. reutilizar COLOR-ID existentes quando o RGB estrutural coincidir;
5. criar novos COLOR-ID apenas quando uma nova cor de fundo estrutural for comprovada;
6. fechar a equação final:

```text
Σ AK_COLOR + AK_UNRESOLVED = 475
```

Meta: `AK_UNRESOLVED = 0` quando a fonte permitir.