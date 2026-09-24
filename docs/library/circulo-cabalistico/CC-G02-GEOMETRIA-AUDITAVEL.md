# CC-G02 — Geometria Auditável do Círculo Cabalístico

**Categoria:** HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Status:** CANÔNICO — BASE GEOMÉTRICA V1  
**Data:** 2026-09-23

## 1. Objetivo

Transformar a Mandala canônica em um sistema geométrico mensurável antes do censo fino de cores, anéis, blocos e sub-blocos.

Este gate NÃO fixa `B_TOTAL`. Ele define o sistema de coordenadas que permitirá contar cada bloco sem duplicidade.

## 2. Fonte raster de referência

`CC-SOURCE-01` — Mandala dos Anjos 72 COMPLETA — ROSA.

Metadado documentado na publicação da fonte: **4714 × 4714 px**.

Para análise raster, adotar provisoriamente:

- largura `W = 4714 px`;
- altura `H = 4714 px`;
- centro geométrico ideal `C = (2357, 2357)`;
- raio normalizado `r ∈ [0,1]`, após determinação do raio útil real da Mandala.

O centro gráfico real deverá ser medido contra a imagem original; `(2357,2357)` é apenas o centro matemático do canvas quadrado.

## 3. Sistema polar

Cada ocorrência visual poderá ser endereçada por:

`P = (r, θ)`

onde:

- `r` = distância radial normalizada;
- `θ` = ângulo em graus;
- `θ ∈ [0°,360°)`.

Também preservar coordenadas cartesianas raster:

`Ppx = (x,y)`.

Conversão conceitual:

`dx = x - Cx`

`dy = Cy - y`

`r_px = sqrt(dx² + dy²)`

`θ = atan2(dy,dx)` normalizado para 0–360°.

O offset angular do setor 01 deve ser medido diretamente na fonte antes de atribuir IDs definitivos.

## 4. Divisão principal 72 × 5°

A fonte descreve 72 posições zodiacais principais de 5°:

`72 × 5° = 360°`

Portanto, após resolver o offset `θ0`, a posição `n` poderá ser expressa por:

`θ_start(n) = θ0 + (n-1)×5°`

`θ_end(n) = θ0 + n×5°`

com normalização módulo 360°.

Cada posição principal é um **SETOR**, não automaticamente um único BLOCO. Um setor pode atravessar múltiplos anéis e conter múltiplos blocos/sub-blocos.

## 5. Nove grupos de 40°

Cada coro ocupa 8 posições:

`8 × 5° = 40°`

Logo:

| Grupo | Posições | Largura angular |
|---|---:|---:|
| Serafins | 01–08 | 40° |
| Querubins | 09–16 | 40° |
| Tronos | 17–24 | 40° |
| Dominações | 25–32 | 40° |
| Potestades | 33–40 | 40° |
| Virtudes | 41–48 | 40° |
| Principados | 49–56 | 40° |
| Arcanjos | 57–64 | 40° |
| Anjos | 65–72 | 40° |

Checksum:

`9 × 40° = 360°`.

## 6. Camadas temporais documentadas no corpus

A fonte descreve diferentes distribuições dos 72 Gênios:

### Física / domicílio

Quinquídios de 5°.

### Emocional / rotação

Progressão de 1° com repetição cíclica dos 72.

### Mental / ciclo diário

`24 h ÷ 72 = 20 min` por posição.

Essas camadas são relações canônicas do corpus e NÃO devem ser confundidas com novos anéis gráficos até que sua representação raster seja verificada.

## 7. Estrutura 5 × 72

O corpus descreve cinco momentos/atributos associados a cada Gênio:

1. Yod — Vontade;
2. He — sentimento;
3. Vô/Vau — pensamento/Lei conforme o contexto da obra;
4. segundo He — cristalização/manifestação física;
5. Quintessência — realização/consolidação além da ação individual.

Relação matemática registrada:

`72 × 5 = 360`.

Isso é uma relação estrutural do corpus; não implica automaticamente 360 blocos visuais. A equivalência com blocos só poderá ser declarada depois do CC-G04.

## 8. Anéis

Cada faixa concêntrica visualmente delimitada deverá receber ID:

`R00, R01, R02 ... Rn`

Para cada anel:

`ring_id | r_inner_px | r_outer_px | r_inner_norm | r_outer_norm | função_visual | source_id | confidence`

### Critério

Uma mudança de cor por si só não cria necessariamente novo anel. Um anel requer fronteira radial visual/estrutural identificável.

## 9. Setores

IDs principais:

`S001 ... S072`

Cada setor guarda:

`sector_id | position_01_72 | θ_start | θ_end | θ_center | coro | source_id`

Subdivisões angulares adicionais receberão IDs próprios somente se existirem graficamente.

## 10. Blocos

Um bloco é definido por uma região delimitada pela interseção de fronteiras radiais/concêntricas ou por outro contorno gráfico inequívoco que funcione como célula.

ID:

`B0001 ... B_TOTAL`

Campos mínimos:

`block_id | ring_id | sector_id | polygon/bounds | color_id | symbol_ids[] | text_ids[] | source_id | confidence`

### Regra

- símbolo sem célula própria = ocorrência, não necessariamente bloco;
- célula vazia = ainda pode ser bloco geométrico;
- vários símbolos na mesma célula = um bloco, múltiplas ocorrências;
- célula subdividida por fronteira real = múltiplos sub-blocos.

## 11. Sub-blocos

Quando um bloco possuir subdivisão interna inequívoca:

`B0001.01`, `B0001.02`, etc.

`B_TOTAL` deverá declarar explicitamente se contabiliza somente blocos-folha ou também contêineres. Para SIMPLEWAY MATH, a recomendação é usar **blocos-folha** como unidade final para evitar dupla contagem.

## 12. Cores

Cada cor estrutural recebe `C-ID` independente do bloco:

`C001 ... Cn`

Campos:

`color_id | family | conceptual_name | sampled_rgb | sampled_hex | source_regions | notes`

Antialiasing/compressão não cria C-ID.

## 13. Símbolos

Cada tipo simbólico recebe `SYM-ID` e cada aparição recebe `O-ID`.

Exemplo conceitual:

`SYM-PLANET-MARS` = tipo Marte.

`O000123` = ocorrência concreta do glifo de Marte em determinado bloco.

Assim:

`ELEMENTO ≠ OCORRÊNCIA ≠ BLOCO`.

## 14. Dimensão de cada elemento

Todo bloco/ocorrência mensurável deve possuir:

### Raster

`x_min, y_min, x_max, y_max, width_px, height_px, center_x, center_y`

### Polar

`r_min, r_max, θ_start, θ_end, θ_center`

### Relativa

`width/W, height/H, area/mandala_area` quando calculável.

## 15. Checksums geométricos

Antes de aprovar o censo:

- setores principais = 72;
- soma angular dos setores = 360°;
- coros = 9;
- posições por coro = 8;
- soma dos grupos = 72;
- largura de cada posição = 5°;
- largura de cada coro = 40°.

Falha em checksum bloqueia a promoção para contagem definitiva.

## 16. Saída esperada do CC-G03/04

O sistema deverá permitir responder objetivamente:

- quantos anéis existem;
- quantos grupos cromáticos existem;
- quantos blocos existem em cada anel;
- quantos blocos existem em cada grupo de cor;
- quantos sub-blocos existem;
- quantos símbolos aparecem;
- quais símbolos se repetem;
- dimensões exatas/proporcionais;
- `E_TOTAL`, `O_TOTAL` e `B_TOTAL`.

## 17. Relação futura com SIMPLEWAY MATH

Somente após `B_TOTAL` auditado:

`CLASSES + CLÃS + GUILDAS = B_TOTAL`

Nenhuma quantidade de Classe/Clã/Guilda deve influenciar a segmentação da Mandala.

## 18. Gate

**CC-G02-A — PASS:** modelo geométrico e identificadores definidos.

**CC-G02-B — PENDENTE:** medir na imagem original o centro gráfico real, raio útil, `θ0`, fronteiras radiais e fronteiras dos anéis.

Próximo: **CC-G03 — Censo Cromático** e **CC-G04 — Censo de Anéis/Blocos**, usando esta geometria como sistema de coordenadas.
