# CC-G05-D4 — Mask Calibration V1

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Fonte:** `SOURCE-RASTER-900`, 900×900 px  
**Estado:** CANON-ANALYSIS / MASK-CALIBRATION

## Objetivo

Materializar a geometria necessária para resolver cromaticamente os 43 AK ainda pendentes sem herdar cor dos setores externos e sem confundir glifos/contornos com fundo estrutural.

## Famílias de máscara

```text
HEADER-MASK-01..09       = 9
TRANSITION-MASK-01..12   = 12
ROSE-MASK-01..22         = 22
TOTAL                    = 43
```

## Pipeline obrigatório

```text
SOURCE-RASTER-900
→ máscara geométrica do AK
→ erosão interna da máscara
→ exclusão de contorno/preto/branco de interferência
→ histograma RGB exato
→ MODAL-RGB
→ DOMINANCE-RATIO
→ COLOR-ID candidato
→ confidence
→ validação visual/geométrica
→ COLOR-ID confirmado ou UNRESOLVED
```

## Auditoria de calibração

Foi feita amostragem interior em múltiplos raios e ângulos. A faixa externa/transicional reproduz a sequência cromática setorial já encontrada no ramo radial, enquanto a região da Rosa apresenta interferência estrutural crescente e não pode ser classificada por propagação angular simples.

Isso confirma duas regras:

1. `TRANSITION-MASK` pode usar o setor angular como hipótese inicial, mas precisa ser confirmado pelos pixels internos da própria máscara.
2. `ROSE-MASK` deve ser individual e independente; não herdar `COLOR-ID` do setor externo.

## Critério de promoção

Um AK interno só recebe `COLOR-ID` quando:

```text
MASK_VALID = true
PIXEL_SAMPLE_N > 0
MODAL_RGB é estruturalmente compatível com a região
DOMINANCE_RATIO é registrado
contorno/glifo não domina artificialmente a amostra
```

Se esses critérios não forem satisfeitos:

```text
COLOR_ID = UNRESOLVED
```

## Checksum preservado

```text
COLOR_RESOLVED_AK   = 432
COLOR_PENDING_AK    = 43
TOTAL_AK            = 475
432 + 43             = 475
```

Nenhum dos 43 AK é promovido neste gate apenas por semelhança visual.

## Próximo gate — CC-G05-D5

Executar primeiro `TRANSITION-MASK-01..12`, por ser a família com geometria mais regular. Para cada máscara registrar:

```text
AK-ID
MASK-ID
ANGLE-RANGE
PIXEL-SAMPLE-N
MODAL-RGB
HEX
DOMINANCE-RATIO
COLOR-ID
CONFIDENCE
SOURCE-ID
```

Se os 12 forem confirmados, o checksum passará de `432/475` para `444/475`, restando `9 HEADER + 22 ROSE = 31`.