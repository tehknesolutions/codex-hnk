# CC-G04-D — Atomicidade da Rosa e da Transição

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Estado:** CANON-ANALYSIS / PASS PARCIAL  
**Fonte raster:** Mandala dos 72 com Rosa disponível no projeto (900 × 900 px)  
**Derivados analisados:** center_crop_big, polar_mid_100_320, polar_custom, central_emblem_big.

## 1. Objetivo

Aplicar o teste de atomicidade às duas estruturas internas já detectadas:

1. TRANSITION-12;
2. ROSE-22.

A regra operacional usada neste gate é:

> Um AK é uma região estrutural mínima, individualmente delimitada, cujo fundo não é subdividido por outra fronteira estrutural. Glifos, letras e linhas simbólicas sobrepostos não criam automaticamente novos AKs.

Isso preserva:

```
AK ≠ SYMBOL-OCCURRENCE
AK ≠ GLYPH
AK ≠ STROKE
```

## 2. PASS — TRANSITION-12

A projeção polar mostra uma faixa estreita imediatamente acima/fora das pétalas externas da Rosa.

Ela possui:

```
TRANSITION_AK = 12
```

Cada unidade:

- ocupa 30°;
- possui duas fronteiras radiais laterais;
- possui fronteira radial interna e externa;
- mantém um fundo estrutural contínuo dentro do setor;
- pode conter um triângulo/linha simbólica sobreposta, sem que essa linha divida o fundo em células estruturais independentes.

Checksum:

```
12 × 30° = 360°
```

e, contra a malha de 72:

```
1 TRANSITION-AK = 6 POSITION-UNIT
12 × 6 = 72 POSITION-UNIT
```

Portanto:

> **TRANSITION-12 = 12 AK confirmados.**

## 3. PASS — ROSE-22

As pétalas da Rosa são regiões fechadas, com contorno próprio e fundo cromático contínuo.

A estrutura medida é:

```
STRATUM-3  = 3 AK
STRATUM-7  = 7 AK
STRATUM-12 = 12 AK
```

Checksum:

```
3 + 7 + 12 = 22
```

Os glifos inscritos nas pétalas são ocorrências simbólicas sobrepostas ao fundo e não subdividem a pétala em novos AKs.

Portanto:

> **ROSE-22 = 22 AK confirmados.**

## 4. Novo subtotal confirmado

Do gate anterior:

```
AK_OUTER_REGULAR = 441
```

Neste gate:

```
TRANSITION_AK = 12
ROSE_AK = 22
```

Logo:

```
AK_CONFIRMED_SUBTOTAL
= 441 + 12 + 22
= 475
```

> **AK_CONFIRMED_SUBTOTAL = 475**

Este valor ainda não inclui a decomposição atômica definitiva do emblema central.

## 5. Hierarquia reconstruída até 475 AK

```
CÍRCULO
│
├── OUTER-ANNULUS = 441 AK
│   ├── 72 POSITION-UNIT
│   │   └── 6 AK regulares por posição
│   └── 9 HEADER-AK
│
├── TRANSITION-12 = 12 AK
│   └── 12 × 30°
│
└── ROSE-22 = 22 AK
    ├── STRATUM-3  = 3 AK
    ├── STRATUM-7  = 7 AK
    └── STRATUM-12 = 12 AK
```

Subtotal:

```
441 + 12 + 22 = 475 AK
```

## 6. Relações mesoscópicas

A mesma malha angular permite duas composições paralelas:

```
72 POSITION-UNIT
├── 12 grupos de 6 posições = 30°
└── 9 grupos de 8 posições  = 40°
```

A transição usa a partição de 12 × 30°.

Os Coros usam a partição de 9 × 40°.

Logo:

```
TRANSITION-AK-ID ≠ CHOIR-ID
```

embora ambos sejam alinhados à mesma circunferência de 360°.

## 7. Emblema central permanece fora do subtotal

O emblema central contém, visivelmente:

```
CIRCULAR-FIELD
CROSS-MOTIF
GREEN-SET = 4 formas
RED-ROSETTE = 5 lóbulos
CENTRAL-WHITE-COMPONENT
```

Esses elementos são sobrepostos e não formam a mesma tesselação usada no anel, transição e pétalas.

Por isso, neste gate:

```
CENTRAL-EMBLEM-AK = UNRESOLVED
```

e não são somados ao subtotal 475.

## 8. Próximo gate — CC-G04-E

**Atomicidade do Emblema Central.**

O próximo teste deve determinar se o centro deve ser contado por:

1. faces cromáticas visíveis;
2. primitivas gráficas independentes;
3. regiões de fundo;
4. ou uma combinação explicitamente tipada dessas unidades.

Critério obrigatório:

```
nenhuma unidade pode ser promovida a AK apenas porque possui uma cor diferente
```

Ela deve ser uma unidade mínima estrutural do Círculo, não apenas uma ocorrência pictórica.

A próxima saída deve produzir:

```
CENTRAL-EMBLEM-AK = N
AK_CONFIRMED_SUBTOTAL = 475 + N
```

ou manter N como UNRESOLVED se a fonte raster não permitir uma decisão segura.
