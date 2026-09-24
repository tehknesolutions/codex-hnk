# CC-G06-A — SYMBOL FAMILY INVENTORY V1

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica HNK:** TW DA VINCI  
**Fonte visual:** SOURCE-RASTER-900 — `mandala-dos-anjos-72-completa-rosa-1-CIRCULO-CABALISTICO.webp` (900×900 RGBA)  
**Método:** inventário visual estrutural em lote; sem OCR; sem forçar identificação semântica quando a fonte não sustenta precisão.

## Objetivo

Substituir micro-gates por um único vocabulário de famílias de símbolos reutilizável no MEGA-GATE dos 475 AK.

## Famílias visuais confirmadas na Mandala

| FAMILY-ID | Família | Exemplos visuais observáveis | Camada |
|---|---|---|---|
| SF-01 | NUMERAL | 01..72 e outros numerais internos | textual-numérica |
| SF-02 | HEBREW-GLYPH | caracteres/palavras em hebraico | escrita/sigilo |
| SF-03 | LATIN-TEXT | nomes e rótulos em alfabeto latino | escrita |
| SF-04 | PLANETARY-ASTRO | Sol, Lua e glifos planetários/astrológicos | astro |
| SF-05 | ZODIACAL | glifos zodiacais presentes nos anéis | astro |
| SF-06 | GEOMETRIC-PRIMITIVE | círculo, triângulo, quadrado, losango e combinações | geometria |
| SF-07 | COLOR-DISC | discos/círculos cromáticos usados como marcadores | geometria/cor |
| SF-08 | LETTER-SIGIL | letras isoladas e formas tipográficas usadas como sigilo | sigilo |
| SF-09 | ANGELIC-NAME | nomes dos 72 anjos no anel nominal | angelologia |
| SF-10 | CHOIR-LABEL | nomes/rótulos dos nove coros/categorias externas | hierarquia |
| SF-11 | ROSE-PETAL-GLYPH | glifos contidos nas pétalas da Rosa central | núcleo |
| SF-12 | CENTRAL-EMBLEM | emblema central multicolorido | núcleo |
| SF-13 | TREE-SEPHIROTIC | elementos/nomes ligados à estrutura sefirótica interna | cabala |
| SF-14 | PATH-LINE | linhas radiais, cordas, conexões e traçados relacionais | relação |
| SF-15 | CARDINAL-DIRECTIONAL | orientação/posição espacial e marcadores direcionais | espacial |
| SF-16 | COMPOSITE-SIGIL | composição de 2+ primitivas/glifos que deve permanecer como unidade visual | composto |

## Regra de modelagem

`AK_ID` NÃO implica `1 AK = 1 SYMBOL`.

A relação canônica é N:N:

```text
AK_ID -> SYMBOL_INSTANCE_ID[]
SYMBOL_INSTANCE_ID -> SYMBOL_FAMILY_ID
SYMBOL_INSTANCE_ID -> INK_COLOR_ID
SYMBOL_INSTANCE_ID -> BBOX / centroid / orientation
SYMBOL_INSTANCE_ID -> EVIDENCE_STATUS
```

Um mesmo símbolo recorrente recebe um `SYMBOL-ID` canônico; cada ocorrência recebe `SYMBOL_INSTANCE_ID` próprio.

## Estados de evidência

- `CONFIRMED`: forma/família diretamente observável.
- `DERIVED`: posição/relação obtida deterministicamente da geometria já validada.
- `UNRESOLVED`: sem resolução suficiente para identificação segura.

`UNRESOLVED` nunca bloqueia os demais campos do mesmo AK.

## Estratégia de alta eficiência

### Passe único por AK

Para cada `AK-0001..AK-0475`, preencher no mesmo passe:

```text
AK-ID
REGION-ID
UNIT-TYPE
POSITION-ID
CHOIR-ID
SECTOR12-ID
ANGLE
COLOR-ID
SYMBOL-INSTANCE-ID[]
SYMBOL-FAMILY-ID[]
INK-COLOR-ID[]
RELATION-ID[]
EVIDENCE-STATUS
CONFIDENCE
SOURCE-ID
```

### Deduplicação global

Após o passe dos 475 AK:

1. agrupar instâncias visualmente equivalentes;
2. criar `SYMBOL-ID` global para cada forma recorrente;
3. preservar `SYMBOL_INSTANCE_ID` para a posição física;
4. contar frequência por AK, cor, setor, coro, anel e região.

## Gate de fechamento CC-G06

O gate não exige que todos os símbolos tenham nome histórico. Exige que todos os 475 AK tenham sido inspecionados e que toda ocorrência visual detectável esteja em um destes estados:

```text
CONFIRMED | DERIVED | UNRESOLVED
```

Checksum estrutural obrigatório:

```text
AK_AUDITED = 475
AK_MISSING = 0
SYMBOL_INSTANCE_ID duplicates = 0
orphan SYMBOL_INSTANCE_ID = 0
```

## Saídas seguintes do mesmo MEGA-GATE

- `CC-G06-SYMBOL-REGISTRY.csv`
- `CC-G06-SYMBOL-INSTANCES.csv`
- `CC-G06-AK-DIMENSION-MATRIX.csv`
- `CC-G06-RELATION-REGISTRY.csv`
- agregações micro → meso → macro → Círculo completo

Este documento define o vocabulário operacional; não substitui a medição/identificação individual das ocorrências.