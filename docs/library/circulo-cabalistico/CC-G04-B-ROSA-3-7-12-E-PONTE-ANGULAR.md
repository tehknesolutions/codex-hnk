# CC-G04-B — Rosa 3–7–12 e Ponte Angular

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Estado:** CANON-ANALYSIS / medição estrutural parcial  
**Fonte raster analisada:** Mandala dos 72 com Rosa, versão 900 × 900 px disponível no projeto.

## 1. Objetivo

Continuar a reconstrução recursiva iniciada no anel externo, agora descendo da malha 72 para a faixa de transição e a Rosa central.

A regra permanece:

```
unidade → fronteira → filhos → repetição → simetria → pai → ID → repetir
```

Nenhum nível é promovido apenas por analogia simbólica.

---

## 2. Estrutura medida da Rosa

A segmentação geométrica dos lóbulos coloridos ao redor do núcleo revela três estratos concêntricos:

```
STRATUM-INNER  = 3 pétalas
STRATUM-MIDDLE = 7 pétalas
STRATUM-OUTER  = 12 pétalas
```

Checksum:

```
3 + 7 + 12 = 22
```

Portanto:

> **ROSE-PETAL-TOTAL = 22**

### 2.1 Estrato externo — 12

Foram isolados 12 componentes grandes com centros angulares aproximadamente:

```
14.86°
45.13°
74.62°
105.49°
134.86°
165.03°
194.84°
224.50°
255.23°
284.57°
315.38°
345.07°
```

Diferença angular média:

```
360° / 12 = 30°
```

A dispersão observada em torno de 30° é compatível com rasterização e contornos gráficos.

### 2.2 Estrato médio — 7

Foram isolados 7 componentes grandes com centros angulares aproximadamente:

```
37.44°
88.66°
140.43°
193.04°
244.41°
295.86°
346.22°
```

Diferença angular média:

```
360° / 7 = 51.428571...°
```

### 2.3 Estrato interno — 3

Os três grandes fundos cromáticos imediatamente ao redor do emblema central foram medidos com centros aproximados em:

```
29.08°
146.59°
273.30°
```

Os espaçamentos observados giram em torno de:

```
120°
```

O desvio local é esperado em uma imagem raster de 900 px e em pétalas assimétricas.

---

## 3. Interpretação estrutural

Os valores 3, 7 e 12 NÃO formam uma cadeia pai-filho entre si.

Eles são três estratos irmãos que compõem a Rosa de 22:

```
                 ROSE-22
              /     |     \
        STRATUM-3 STRATUM-7 STRATUM-12
           |          |          |
        3 pétalas   7 pétalas  12 pétalas
```

Portanto a modelagem correta é composição paralela:

```
ROSE-22 = 3 + 7 + 12
```

e não:

```
3 → 7 → 12
```

---

## 4. Ponte com a malha angular externa

O anel externo possui 72 posições de 5°.

```
72 × 5° = 360°
```

O estrato externo da Rosa possui 12 pétalas regularmente espaçadas:

```
360° / 12 = 30°
30° / 5° = 6 posições
```

Assim existe uma ponte geométrica natural:

```
6 POSITION-UNIT
        ↓
1 setor de 30°
        ↓
1 posição angular do STRATUM-12
```

Checksum:

```
12 × 6 = 72
```

Esta relação é estruturalmente distinta da divisão por Coros.

---

## 5. 12 setores versus 9 Coros

No ramo dos Coros:

```
1 CHOIR-UNIT = 8 posições × 5° = 40°
9 × 40° = 360°
```

No ramo de 12:

```
1 SECTOR-12 = 6 posições × 5° = 30°
12 × 30° = 360°
```

Logo:

```
CHOIR-ID ≠ SECTOR12-ID
```

São duas partições simultâneas da mesma circunferência.

### 5.1 Primeiro macroencontro entre as duas partições

O menor ângulo em que limites de 30° e 40° voltam a coincidir é:

```
LCM(30°, 40°) = 120°
```

Um macrosetor de 120° contém simultaneamente:

```
4 × SECTOR-12
3 × CHOIR-UNIT
24 × POSITION-UNIT
```

e:

```
3 × 120° = 360°
```

Portanto há uma macroestrutura angular matematicamente demonstrável:

```
POSITION-5°
   ├── 6 posições → SECTOR-30°
   └── 8 posições → CHOIR-40°

SECTOR-30° × 4
CHOIR-40°  × 3
        ↓
MACROSECTOR-120°
        ↓
3 × MACROSECTOR-120°
        ↓
CÍRCULO-360°
```

---

## 6. Relação potencial com o estrato de 3 pétalas

O STRATUM-3 possui periodicidade aproximada de 120°.

Isso é geometricamente compatível com os três MACROSECTOR-120° obtidos pelo encontro das partições de 12 e 9.

**Estado:** CORRESPONDENCE-CANDIDATE.

Ainda não promover como equivalência canônica exata até registrar a orientação global da Rosa contra os limites angulares do anel externo.

---

## 7. Ciclo de 7 como eixo transversal

```
360° / 7 = 51.428571...°
```

Como 72 não é divisível por 7:

```
72 / 7 = 10.285714...
```

o STRATUM-7 não deve ser artificialmente forçado para dentro da árvore 72 → 12/9.

Ele deve permanecer, por enquanto, como **eixo transversal de sete unidades**.

Isso é exatamente o tipo de caso que justifica separar:

```
HIERARQUIA ≠ EIXO PARALELO
```

---

## 8. Correspondência externa — Sefer Yetzirah

A divisão clássica das 22 letras hebraicas em:

```
3 Mothers
7 Doubles
12 Simples
```

é documentada em tradições/textos sobre o Sefer Yetzirah.

A coincidência numérica com os três estratos medidos na Rosa é forte.

Porém, no HNK Codex ela deve permanecer separada epistemicamente:

```
CANON-ANALYSIS:
Rosa medida = 3 + 7 + 12 = 22

EXTERNAL-CORRESPONDENCE:
Sefer Yetzirah = 3 Mothers + 7 Doubles + 12 Simples
```

A equivalência semântica específica entre cada pétala da imagem e cada letra deverá ser validada pétala por pétala.

---

## 9. Hierarquia reconstruída até este gate

```
AK
│
├── RAMO EXTERNO
│   └── POSITION-UNIT: 6 AK no anel regular já medido
│       ├── 6 posições → SECTOR-30° → 12 por círculo
│       └── 8 posições → CHOIR-40°  → 9 por círculo
│
├── PONTE MACRO
│   └── MACROSECTOR-120°
│       ├── 4 × SECTOR-30°
│       ├── 3 × CHOIR-40°
│       └── 24 × POSITION-UNIT
│
└── RAMO ROSA
    └── ROSE-22
        ├── STRATUM-3
        ├── STRATUM-7
        └── STRATUM-12
```

O Círculo completo possui três MACROSECTOR-120°.

---

## 10. Próximo gate

**CC-G04-C — decomposição do emblema central e da faixa geométrica entre ROSE-22 e a malha 72.**

Precisamos responder:

1. quantos AK visíveis existem no emblema central;
2. quantas células mínimas existem na faixa geométrica de transição;
3. se a faixa de transição é 12-setorial, 24-setorial, 72-setorial ou uma composição de mais de uma malha;
4. qual é a relação exata de orientação entre STRATUM-3, MACROSECTOR-120°, STRATUM-12 e SECTOR-30°;
5. qual é o novo subtotal de AK após incorporar centro + transição.

Até esse gate:

```
AK_OUTER_REGULAR = 441
ROSE_PETALS = 22 blocos estruturais visíveis
AK_TOTAL = UNRESOLVED
```

Não somar automaticamente 22 aos 441 como AK_TOTAL antes de concluir a decomposição interna do centro e da transição.
