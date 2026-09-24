# CC-G06 — MEGA-GATE DE DIMENSÕES DOS 475 AK — V1

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica HNK:** TW DA VINCI  
**Fonte raster operacional:** Mandala 900×900  
**Regime:** BATCH-FIRST / EVIDENCE-FIRST / NO-MICRO-GATES

## Objetivo

Extrair em um único passe lógico o máximo de dimensões observáveis ou deterministicamente deriváveis dos 475 Atomic-Kodes (AK), evitando fragmentação artificial do trabalho.

## Matriz mestre

Cada AK passa a admitir os seguintes eixos:

```text
AK-ID
REGION-ID
UNIT-TYPE
PARENT-ID
POSITION-ID
CHOIR-ID
SECTOR12-ID
RING-ID
ANGLE-START
ANGLE-END
COLOR-ID
SYMBOL-ID
SYMBOL-FAMILY-ID
INK-COLOR-ID
RELATION-ID[]
SOURCE-ID
EVIDENCE-STATE
CONFIDENCE
```

## Estados de evidência

- CONFIRMED — diretamente sustentado pela fonte.
- DERIVED — obtido deterministicamente da geometria/estrutura já confirmada.
- UNRESOLVED — a fonte disponível não sustenta identificação segura.

UNRESOLVED não bloqueia o processamento das demais dimensões.

## Baseline cromático herdado

```text
AK_TOTAL = 475
COLOR_AUDITED = 475
COLOR_RESOLVED = 453
COLOR_UNRESOLVED = 22
```

Os 22 `COLOR_UNRESOLVED` pertencem à ROSE e permanecem explicitamente não inventados.

## Famílias iniciais de símbolos para classificação

O reconhecimento não deve confundir símbolo com significado. Primeiro registrar forma/família observável; semântica entra apenas quando sustentada por fonte.

```text
ASTROLOGICAL
PLANETARY
ZODIACAL
HEBREW_GLYPH
LETTER_OR_TEXT
NUMERAL
GEOMETRIC
COLOR_MARK
ICONOGRAPHIC
COMPOSITE
EMPTY_OR_BACKGROUND
UNRESOLVED
```

## Regra de multiplicidade

Um AK pode conter zero, um ou vários símbolos. Portanto `SYMBOL-ID` não deve ser forçado a cardinalidade 1:1. Quando houver múltiplos elementos, usar relação AK↔SYMBOL em vez de apagar informação.

## Relações estruturais

Registrar separadamente:

```text
ADJACENT_CLOCKWISE
ADJACENT_COUNTERCLOCKWISE
RADIAL_INNER
RADIAL_OUTER
SAME_POSITION
SAME_SECTOR
SAME_CHOIR
SAME_COLOR
OVERLAPS
CONTAINS
CONTAINED_BY
```

## Estratégia eficiente

1. Processar todos os 475 AK antes de abrir novos subgates.
2. Resolver em lote primeiro geometria e relações determinísticas.
3. Extrair símbolos observáveis em lote.
4. Separar tinta (`INK-COLOR-ID`) do fundo (`COLOR-ID`).
5. Não parar o lote por causa de AK ambíguo.
6. Registrar `UNRESOLVED` e seguir.
7. Produzir relatório apenas ao fim de um mega-gate ou quando surgir bloqueio real.

## Hierarquia recursiva

```text
AK (atômico)
  ↓
microgrupos
  ↓
mesogrupos
  ↓
macrogrupos
  ↓
Círculo Cabalístico completo
```

Toda agregação futura deve ser reconstruível a partir dos AK e suas relações, evitando informação apenas narrativa sem vínculo atômico.

## Destino RPG/educacional

A matriz não cria automaticamente significado de gameplay. Após a taxonomia factual da Mandala estar suficientemente resolvida, uma camada HNK de design poderá mapear as unidades para:

```text
CLASSE
CLÃ
GUILDA baseada em habilidades
QUEST educacional
progressão matemática/exatas
```

Esses mapeamentos serão identificados como camada HNK/game-design, separados da descrição documental da fonte cabalística.

## Gate de saída CC-G06

O mega-gate termina quando os 475 AK tiverem sido percorridos em todos os eixos aplicáveis e cada célula estiver em um dos estados:

```text
CONFIRMED | DERIVED | UNRESOLVED
```

Sem células implicitamente desconhecidas e sem dados inventados para completar percentuais.