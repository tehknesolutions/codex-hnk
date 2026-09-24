# CC-G04-C — Transição e Emblema Central

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Estado:** CANON-ANALYSIS / medição estrutural parcial  
**Fonte raster:** Mandala dos 72 com Rosa disponível no projeto (900 × 900 px)  
**Derivados analisados:** center_crop, center_crop_big, central_emblem_big e polar_mid.

## 1. Objetivo

Continuar a reconstrução recursiva:

```
micro → meso → macro → Círculo Cabalístico completo
```

sem confundir:

```
AK ≠ símbolo ≠ ocorrência ≠ camada gráfica ≠ eixo transversal
```

O gate anterior estabeleceu:

```
AK_OUTER_REGULAR = 441
ROSE-22 = STRATUM-3 + STRATUM-7 + STRATUM-12
```

Este gate mede a faixa imediatamente externa à Rosa e decompõe o emblema central sem transformar sobreposições simbólicas em AKs artificialmente.

---

## 2. Faixa de transição: malha de 12 setores

A faixa geométrica imediatamente externa à Rosa apresenta uma partição regular em **12 setores angulares**.

```
TRANSITION-SECTOR-COUNT = 12
ANGLE_PER_TRANSITION_SECTOR = 30°
```

Checksum:

```
12 × 30° = 360°
```

Como o anel 72 usa posições de 5°:

```
30° / 5° = 6
```

Logo:

```
1 TRANSITION-SECTOR = 6 POSITION-UNIT
12 × 6 = 72 POSITION-UNIT
```

Isto confirma uma ponte mesoscópica entre a malha de 72 e a malha de 12.

### Estado epistemológico

**CANON-ANALYSIS — PASS estrutural** para a contagem 12 × 30°.

A correspondência individual exata entre cada TRANSITION-SECTOR e cada pétala do STRATUM-12 permanece em validação de orientação, embora ambas as estruturas apresentem periodicidade 12.

---

## 3. Rosa: subtotal estrutural

A Rosa permanece composta por:

```
STRATUM-3  = 3
STRATUM-7  = 7
STRATUM-12 = 12

ROSE-PETAL-TOTAL = 22
```

As 22 pétalas são regiões gráficas individualizadas e delimitadas.

**Importante:** neste gate elas são registradas como unidades estruturais visíveis. A promoção definitiva de cada pétala para AK deve obedecer à regra de atomicidade global: nenhuma subdivisão interna de célula cromática pode existir abaixo dela.

---

## 4. Emblema central: estrutura em camadas

O núcleo central não se comporta como uma simples tesselação plana.

Ele é composto por formas sobrepostas.

A análise raster isolou:

```
RED-LOBE-COUNT   = 5
GREEN-TRIANGLE-COUNT = 4
CENTRAL-WHITE-COMPONENT = 1
CROSS-MOTIF = 1
CIRCULAR-FIELD = 1
```

### 4.1 Roseta vermelha

Foram detectados **5 componentes vermelhos desconectados**, radialmente organizados ao redor do centro.

```
RED-ROSETTE = 5 lóbulos
```

Esta é uma unidade pentamérica real do emblema.

### 4.2 Estrutura verde

Foram detectados **4 componentes verdes principais**, dispostos nos quadrantes/intercardinais do emblema.

```
GREEN-SET = 4 componentes
```

### 4.3 Cruz

A forma bege/dourada deve ser tratada primariamente como **um motivo de cruz sobreposto**, não como quatro AKs independentes apenas porque possui quatro braços.

A oclusão pela roseta central faz com que conectividade raster e unidade semântica não sejam equivalentes.

Portanto:

```
CROSS-MOTIF = 1 SYMBOL-OCCURRENCE
```

até que uma malha de células inferior demonstre o contrário.

### 4.4 Componente branco central

Existe um componente branco central isolável dentro da roseta vermelha.

Ele permanece:

```
CENTRAL-WHITE-COMPONENT = 1
```

sem nome geométrico definitivo neste gate.

---

## 5. Descoberta metodológica importante

O centro demonstra que o Círculo possui pelo menos duas lógicas de composição:

### A. lógica tesselar

Exemplo:

```
AK → POSITION-UNIT → SECTOR / CHOIR → ANNULUS
```

As unidades ocupam células/áreas discretas.

### B. lógica de sobreposição simbólica

Exemplo:

```
campo circular
+ cruz
+ 4 formas verdes
+ 5 lóbulos vermelhos
+ componente branco central
```

Nessa lógica, um SYMBOL-OCCURRENCE pode atravessar ou ocultar regiões inferiores.

Consequência:

> **Não é permitido converter automaticamente cada componente visual sobreposto em AK.**

Isso preserva a regra:

```
ELEMENT ≠ OCCURRENCE ≠ BLOCK ≠ AK
```

---

## 6. Hierarquia atual

```
CÍRCULO-360°
│
├── OUTER-ANNULUS
│   ├── 72 POSITION-UNIT
│   │   └── 6 AK regulares por posição
│   ├── 12 SECTOR-30°
│   │   └── 6 POSITION-UNIT por setor
│   ├── 9 CHOIR-40°
│   │   └── 8 POSITION-UNIT por coro
│   └── 3 MACROSECTOR-120°
│       ├── 4 SECTOR-30°
│       └── 3 CHOIR-40°
│
├── TRANSITION-12
│   └── 12 setores de 30°
│
└── ROSE-22
    ├── STRATUM-3
    ├── STRATUM-7
    ├── STRATUM-12
    └── CENTRAL-EMBLEM
        ├── CIRCULAR-FIELD
        ├── CROSS-MOTIF
        ├── GREEN-SET = 4
        ├── RED-ROSETTE = 5
        └── CENTRAL-WHITE-COMPONENT = 1
```

---

## 7. Contagens que NÃO devem ser somadas ainda

Não calcular:

```
441 + 12 + 22 + 4 + 5 + ...
```

como AK_TOTAL.

Motivo: TRANSITION-12, ROSE-22 e CENTRAL-EMBLEM ainda precisam passar pelo teste final de atomicidade de célula.

As contagens acima descrevem **estrutura**, não necessariamente o mesmo tipo de unidade.

---

## 8. Novo protocolo para resolver o centro

Para cada região central:

1. detectar fronteira fechada;
2. verificar se existe subdivisão interna de fundo/cor;
3. separar fundo estrutural de símbolo sobreposto;
4. verificar conectividade;
5. verificar repetição/simetria;
6. classificar como AK, BLOCK, SYMBOL-OCCURRENCE ou COMPOSITE;
7. atribuir ID;
8. somente então atualizar AK_TOTAL.

---

## 9. Próximo gate

**CC-G04-D — Atomicidade da Rosa e do núcleo.**

Objetivos:

```
A. decidir se as 22 pétalas são 22 AK;
B. decidir se os 12 setores da transição são 12 AK;
C. decompor o campo circular central em células cromáticas reais;
D. separar completamente células de símbolos sobrepostos;
E. produzir o primeiro AK_SUBTOTAL_CENTER confiável;
F. integrar esse subtotal aos 441 AK externos.
```

A saída obrigatória será:

```
AK_OUTER_REGULAR = 441
AK_CENTER = N comprovado
AK_SUBTOTAL = 441 + N
```

sem inferência simbólica não medida.
