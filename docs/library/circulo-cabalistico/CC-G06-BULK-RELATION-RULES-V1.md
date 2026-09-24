# CC-G06 — BULK RELATION RULES V1

Autoridade canônica HNK: TW DA VINCI
Fonte geométrica: AK Registry V1 + SOURCE-RASTER-900
Estado: CANON-ANALYSIS / DERIVED STRUCTURE

## Objetivo
Eliminar trabalho manual repetitivo. As dimensões geométricas determinísticas passam a ser calculadas por regra, enquanto símbolos visuais permanecem evidence-first.

## Universo
- AK total: 475
- HEADER: 9
- RADIAL: 432 = 6 bandas × 72 posições
- TRANSITION: 12
- ROSE: 22

## Regras radiais determinísticas
Para cada RADIAL-AK:

- POSITION_ID = posição angular 1..72
- ANGLE_START = (POSITION_ID - 1) × 5°
- ANGLE_END = POSITION_ID × 5°
- SECTOR12_ID = floor((POSITION_ID - 1) / 6) + 1
- cada SECTOR12 contém 6 posições = 30°
- cada POSITION contém 6 RADIAL-AK, um em cada banda
- cada setor contém 6 posições × 6 bandas = 36 RADIAL-AK
- ADJACENT_CW = próxima posição na mesma banda, com wrap 72→1
- ADJACENT_CCW = posição anterior na mesma banda, com wrap 1→72
- RADIAL_IN/RADIAL_OUT = mesmo POSITION_ID na banda imediatamente interna/externa, quando existir
- SAME_POSITION_SET = os 6 RADIAL-AK que compartilham POSITION_ID
- SAME_SECTOR_SET = os 36 RADIAL-AK que compartilham SECTOR12_ID

## Cor estrutural bulk
O mapa cromático confirmado para RADIAL + TRANSITION usa 12 COLOR-ID em ordem setorial:
SECTOR12-01→COLOR-01
SECTOR12-02→COLOR-02
SECTOR12-03→COLOR-03
SECTOR12-04→COLOR-04
SECTOR12-05→COLOR-05
SECTOR12-06→COLOR-06
SECTOR12-07→COLOR-07
SECTOR12-08→COLOR-08
SECTOR12-09→COLOR-09
SECTOR12-10→COLOR-10
SECTOR12-11→COLOR-11
SECTOR12-12→COLOR-12

Isto resolve por regra 432 RADIAL-AK e 12 TRANSITION-AK, sem reamostragem individual redundante.

## Header
HEADER-9 mantém relação primária com CHOIR-01..09 e setores angulares de 40°. Não derivar SYMBOL-ID de geometria.

## Rose
ROSE-22 = 3 + 7 + 12 unidades estruturais. Relações de anel e vizinhança podem ser registradas estruturalmente, mas COLOR-ID e SYMBOL-ID individuais não devem ser inferidos sem máscara/evidência suficiente.

## SYMBOL model
SYMBOL-ID não é coluna escalar exclusiva. Relação correta:
AK_ID 1:N SYMBOL_INSTANCE_ID N:1 SYMBOL_ID.
Cada ocorrência recebe FAMILY_ID, INK_COLOR_ID, SOURCE_ID, EVIDENCE_STATUS e CONFIDENCE.

## Estados de evidência
CONFIRMED = explicitamente observável/medido.
DERIVED = consequência matemática de estrutura já confirmada.
UNRESOLVED = fonte insuficiente; não bloqueia outras dimensões.

## Resultado de eficiência
As relações geométricas de todos os 432 RADIAL-AK passam a ser geráveis deterministicamente, junto com 12 TRANSITION-AK. A análise visual fica reservada ao que realmente exige visão: glifos, texto, símbolos compostos, tinta e regiões centrais sobrepostas.

## Checksum
9 + 432 + 12 + 22 = 475
72 × 6 = 432
12 × 36 = 432
432 + 12 = 444 AK com COLOR-ID setorial já resolvido por estrutura/medição anterior.
