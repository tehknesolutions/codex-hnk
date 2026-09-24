# CC-G04 — Medição Atômica do Anel Externo V1

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Status:** MEDIÇÃO PARCIAL / CANON-ANALYSIS  
**Objetivo:** decompor o anel externo em Atomic-Kodes (AK) e identificar o primeiro agrupamento recorrente acima de 1 AK.

## 1. Fonte raster usada nesta medição

A medição visual foi feita sobre a versão raster disponível no projeto com 900 × 900 px, correspondente à Mandala dos 72 com Rosa.

Esta medição é geométrica/estrutural. Ela não substitui a fonte original em resolução máxima; serve como primeiro passe auditável para detectar divisões recorrentes.

## 2. Regra AK

**AK — Atomic-Kode** = menor célula/bloquinho discreto individualizado por fronteiras visuais da Mandala.

Nesta etapa, um AK é contado quando existe uma célula própria delimitada no anel externo.

## 3. Estrutura observada do anel externo

A projeção polar do anel externo revela:

- 1 faixa de cabeçalho dos coros, dividida em **9 células principais**;
- 6 faixas radiais recorrentes, cada uma subdividida em **72 células**;
- uma estreita faixa de transição interna permanece **UNRESOLVED** nesta versão e não entra ainda na contagem.

As seis faixas de 72 células correspondem visualmente a:

1. faixa de glifos/astros;
2. faixa hebraica;
3. faixa dos nomes transliterados;
4. faixa numérica 01–72;
5. faixa simbólica inferior A;
6. faixa simbólica inferior B.

## 4. Contagem parcial comprovada

```
HEADER_AK = 9
RADIAL_AK = 6 × 72 = 432
AK_OUTER_REGULAR = 9 + 432 = 441
```

Portanto:

> **AK_OUTER_REGULAR = 441**

Esse número representa apenas o anel externo regular já segmentado.

**Não é ainda AK_TOTAL da Mandala inteira.**

## 5. Descoberta da primeira unidade acima de AK

As seis faixas de 72 células compartilham as mesmas 72 divisões radiais de 5°.

Isso cria um agrupamento mínimo recorrente:

```
1 posição de 5° = 6 AK empilhados radialmente
```

Provisoriamente:

```
UNIT-02 = POSITION-UNIT
COUNT = 72
AK_COUNT por POSITION-UNIT = 6
```

Assim:

```
72 × 6 AK = 432 AK
```

## 6. Próximo agrupamento recorrente

O cabeçalho superior está dividido em 9 coros. Cada coro cobre 8 posições consecutivas:

```
8 POSITION-UNIT × 6 AK = 48 AK
+ 1 AK de cabeçalho do coro
= 49 AK por CHOIR-UNIT
```

Logo:

```
9 × 49 AK = 441 AK
```

Checksum:

```
9 × (8 × 6 + 1)
= 9 × 49
= 441
```

## 7. Hierarquia parcial demonstrada

```
N0 — AK
↓
N1 — POSITION-UNIT
    6 AK
    72 ocorrências
↓
N2 — CHOIR-UNIT
    8 POSITION-UNIT + 1 HEADER-AK
    49 AK
    9 ocorrências
↓
N3 — OUTER-ANNULUS
    9 CHOIR-UNIT
    441 AK
```

## 8. Relação com cor

Ainda não se deve afirmar que cada coro possui uma única COLOR-ID.

A imagem mostra que o cabeçalho e o corpo de um mesmo coro podem usar cores de fundo diferentes.

Portanto devemos separar:

```
CHOIR-ID ≠ COLOR-ID
```

A próxima contagem cromática será feita diretamente nos 441 AK já identificados:

```
AK_COLOR[c] = quantidade de AK cujo fundo estrutural pertence a COLOR-ID c
```

e deverá satisfazer:

```
Σ AK_COLOR[c] = 441
```

para o anel externo regular.

## 9. Pendências

- confirmar a natureza da estreita faixa de transição interna;
- decompor a Rosa e o núcleo central;
- decompor as macroformas centrais;
- contar AKs não pertencentes ao anel externo;
- medir COLOR-ID por AK;
- fechar AK_TOTAL da Mandala inteira.

## 10. Estado

**PASS PARCIAL:**

- AK confirmado como N0;
- 441 AK confirmados no anel externo regular;
- primeiro agrupamento recorrente acima de AK detectado;
- hierarquia parcial reconstruída de baixo para cima.

```
AK_TOTAL > 441
```

O próximo gate é decompor a faixa de transição e o centro até que nenhum bloco permaneça sem classificação.
