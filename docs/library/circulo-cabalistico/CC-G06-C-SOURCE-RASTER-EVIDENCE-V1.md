# CC-G06-C — SOURCE RASTER EVIDENCE — V1

**Corpus:** Círculo Cabalístico / HNK / CABALA
**Autoridade canônica HNK:** TW DA VINCI
**Estado:** CANON-ANALYSIS / SOURCE-LOCK

## Fonte raster efetivamente analisada

Arquivo local: `mandala-dos-anjos-72-completa-rosa-1-CIRCULO-CABALISTICO.webp`

- largura: 900 px
- altura: 900 px
- modo de análise: RGBA
- total de pixels: 810000
- SHA-256 dos bytes da fonte: `7ebf953481cdc0e09de44755bfae45044cb391c799a8ddb0d571ed43e0621ac9`

Este hash passa a identificar de modo reprodutível o raster 900 usado nas medições CC-G05/CC-G06. Resultados derivados de outro raster não devem ser misturados silenciosamente com este SOURCE-ID.

## Contrato eficiente de extração

O pipeline visual passa a operar por uma única varredura lógica por AK, produzindo ocorrências normalizadas em vez de relatórios intermediários.

Campos por ocorrência:

`INSTANCE_ID, AK_ID, SYMBOL_ID, SYMBOL_FAMILY_ID, INK_COLOR_ID, BBOX, CENTROID, ORIENTATION, RELATION_IDS, EVIDENCE_STATUS, CONFIDENCE, SOURCE_HASH`

Estados de evidência:

- `CONFIRMED`: legível/medível diretamente na fonte;
- `DERIVED`: consequência determinística da geometria já comprovada;
- `UNRESOLVED`: fonte 900 insuficiente para identificação segura.

## Regras anti-invenção

1. Não converter forma parecida em símbolo nomeado sem evidência.
2. Não usar OCR como autoridade para hebraico/glifos pequenos.
3. Não fundir `BACKGROUND COLOR` com `INK COLOR`.
4. Não forçar `1 AK = 1 SYMBOL`; um AK pode possuir 0..N ocorrências.
5. Não interromper o lote por `UNRESOLVED` local.
6. Toda ocorrência visual derivada deste raster carrega o SHA-256 acima.

## Topologia já determinística

Para os 432 `RADIAL-AK`, a estrutura angular/posicional já permite preencher sem nova inspeção visual: `POSITION_ID`, `SECTOR12_ID`, intervalo angular, vizinhança circular, relações radiais e grupo de mesma posição.

Para os 12 `TRANSITION-AK`, a relação com os 12 setores cromáticos já foi comprovada no gate cromático.

Logo, visão computacional/manual fica concentrada no conteúdo não determinístico: glifos, texto, símbolos, tinta, Rosa e núcleo.

## Checksum global

`9 HEADER + 432 RADIAL + 12 TRANSITION + 22 ROSE = 475 AK`.

O objetivo do CC-G06 não é obrigar todos os campos a ficarem resolvidos; é auditar todos os 475 AK e preservar explicitamente qualquer lacuna de evidência.