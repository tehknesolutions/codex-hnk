# CC-G05-D1 — Raster Band Validation

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Fonte:** SOURCE-RASTER-900, 900×900 RGBA  
**Estado:** CANON-ANALYSIS / PASS

## Objetivo

Validar diretamente nos pixels da fonte local a persistência das cores estruturais em diferentes bandas radiais antes da classificação final dos 43 AK internos.

## Medição

Foram inspecionadas quatro bandas concêntricas aproximadas em torno do centro geométrico (450,450):

- r = 330–390 px
- r = 285–330 px
- r = 220–285 px
- r = 120–220 px

As cores estruturais dominantes reaparecem de forma consistente nas três bandas externas, incluindo azul, teal, verde, amarelo, laranja, vermelho e violetas/magenta.

Exemplos pixel-exact observados:

- #0000FF
- #007F7F
- #41C07F
- #BFFF41
- #FFFF00
- #FFBF00
- #FF7F00
- #FF4100
- #FF0000
- #BF3F7F
- #7F007F
- #3F007F

## Resultado

A paleta estrutural de 12 setores identificada no CC-G05-C não é um artefato de uma única faixa radial: ela persiste ao longo de múltiplas bandas do anel.

A banda r=120–220 já contém forte interferência da Rosa e do emblema central; portanto ela não deve ser classificada por simples maioria global. Para os 43 AK restantes, a unidade correta de medição será a máscara individual de cada AK.

## Regra

```text
ANEL REGULAR → setor angular pode propagar COLOR-ID
ROSA / TRANSITION / HEADER → medir máscara individual
CENTRO COMPOSITE → não converter automaticamente em AK
```

## Próximo gate

Construir as máscaras individuais dos 9 HEADER-AK, 12 TRANSITION-AK e 22 ROSE-AK, erodir bordas e extrair RGB modal + dominance ratio por unidade.
