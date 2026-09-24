# CC-G05-B — Paleta Estrutural V1

Fonte: SOURCE-RASTER-900 (900×900 RGB derivado da Mandala canônica).
Estado: CANON-ANALYSIS / medição pixel-exact.

## Regra
Este gate separa cores exatas recorrentes do raster de clusters derivados por antialiasing/compressão. A presença de uma cor exata em muitos pixels é evidência de cor gráfica do raster, mas ainda não equivale automaticamente a COLOR-ID de fundo de AK.

## Cores exatas dominantes observadas

| SAMPLE | HEX | RGB | PIXELS |
|---|---|---:|---:|
| PE-001 | #FF0000 | 255,0,0 | 38,567 |
| PE-002 | #0000FF | 0,0,255 | 36,777 |
| PE-003 | #FFFF00 | 255,255,0 | 35,633 |
| PE-004 | #FF7F00 | 255,127,0 | 34,143 |
| PE-005 | #7F007F | 127,0,127 | 32,240 |
| PE-006 | #3F007F | 63,0,127 | 27,281 |
| PE-007 | #007F7F | 0,127,127 | 25,494 |
| PE-008 | #41C07F | 65,192,127 | 25,448 |
| PE-009 | #FFBF00 | 255,191,0 | 25,406 |
| PE-010 | #FF4100 | 255,65,0 | 25,148 |
| PE-011 | #BFFF41 | 191,255,65 | 24,725 |
| PE-012 | #BF3F7F | 191,63,127 | 24,468 |
| PE-013 | #3FBF7F | 63,191,127 | 8,295 |
| PE-014 | #00FFFF | 0,255,255 | 4,654 |
| PE-015 | #80FF80 | 128,255,128 | 2,885 |
| PE-016 | #00A859 | 0,168,89 | 2,685 |
| PE-017 | #007FFF | 0,127,255 | 2,199 |

Os 17 samples acima somam 376,048 pixels do raster de 810,000 pixels.

## Cores auxiliares importantes
O raster contém também grandes massas de preto (#000000 = 172,042 px), cinzas e branco/fundo. Elas não são promovidas neste gate a cores estruturais de AK porque participam de texto, contorno, glifos, fundo externo e linhas.

## Estado epistemológico
PE-ID = Pixel-Exact Sample. Não confundir com COLOR-ID.

Promoção para COLOR-ID exige amostragem espacial dentro da célula de cada AK e exclusão de texto, glifo, borda e linha sobreposta.

## Próximo gate
CC-G05-C — AK Background Sampling:
1. calcular ponto/área interior de cada AK;
2. evitar bordas e glifos por amostragem robusta;
3. mapear o fundo para PE-ID/paleta;
4. promover famílias comprovadas a COLOR-ID;
5. fechar Σ AK_COLOR + AK_UNRESOLVED = 475.
