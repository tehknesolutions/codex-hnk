# CC-G04-E — Atomicidade do Emblema Central

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Estado:** CANON-ANALYSIS / GATE CONSERVADOR  
**Fonte raster:** emblema central isolado da Mandala dos 72 com Rosa.

## 1. Resultado

O emblema central não apresenta a mesma topologia tesselar encontrada no anel externo, TRANSITION-12 e ROSE-22. Ele é uma composição gráfica por sobreposição.

Estruturas visíveis isoláveis:

- 1 campo circular de suporte;
- 1 motivo de cruz;
- 4 componentes verdes principais;
- 5 lóbulos vermelhos radiais;
- 1 componente branco central.

Esses valores descrevem componentes/ocorrências visuais e **não são promovidos automaticamente a AK**.

## 2. Classificação

Criar provisoriamente:

`COMPOSITE-ID: CMP-CENTRAL-001`

Filhos tipados:

- `SYMBOL-OCCURRENCE`: CROSS-MOTIF;
- `SHAPE-OCCURRENCE`: GREEN-01..04;
- `SHAPE-OCCURRENCE`: RED-LOBE-01..05;
- `SHAPE-OCCURRENCE`: CENTRAL-WHITE-01;
- `FIELD-OCCURRENCE`: CENTRAL-CIRCLE-01.

## 3. Regra de atomicidade preservada

Um componente sobreposto não vira AK apenas por possuir cor, contorno ou conectividade próprios.

Para promoção a AK é necessário demonstrar que ele constitui uma célula estrutural mínima da malha do Círculo, e não apenas uma primitiva/símbolo desenhado sobre outra região.

Portanto:

`CENTRAL-EMBLEM-AK = UNRESOLVED`

## 4. Contagem confirmada permanece

- `OUTER-ANNULUS = 441 AK`
- `TRANSITION-12 = 12 AK`
- `ROSE-22 = 22 AK`

Logo:

`AK_CONFIRMED_SUBTOTAL = 441 + 12 + 22 = 475 AK`

O número 475 é um **subtotal confirmado**, não AK_TOTAL da Mandala inteira.

## 5. Descoberta ontológica

A Mandala exige pelo menos dois sistemas de IDs paralelos:

### Sistema tesselar

`AK-ID → UNIT-ID → SECTOR-ID / CHOIR-ID / RING-ID → CIRCLE-ID`

### Sistema pictográfico/simbólico

`COMPOSITE-ID → FIELD-ID / SHAPE-ID / SYMBOL-ID → OCCURRENCE-ID`

Ambos podem compartilhar `COLOR-ID`, `POSITION-ID`, `ANGLE-ID`, `RELATION-ID` e `SOURCE-ID`, mas não devem ser confundidos.

## 6. Próximo gate

`CC-G04-F — AK Registry 0001–0475`

Objetivo: abandonar apenas as contagens agregadas e criar o primeiro registro individual de cada AK confirmado, com:

`AK-ID | PARENT-ID | COLOR-ID | RING-ID | SECTOR-ID | POSITION-ID | CHOIR-ID | ANGLE-ID | SYMBOL-OCCURRENCE-IDs | SOURCE-ID | STATUS`

Depois disso, o censo cromático poderá calcular `AK[COLOR-ID]` diretamente sobre os registros, em vez de estimativas visuais.
