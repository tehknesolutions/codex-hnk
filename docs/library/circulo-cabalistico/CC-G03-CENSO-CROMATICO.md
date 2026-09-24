# CC-G03 — Censo Cromático Auditável

**Corpus:** Círculo Cabalístico  
**Categoria:** HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Status:** EM CENSO / SOURCE-LOCK  
**Imagem primária:** CC-SOURCE-01 — Mandala dos Anjos 72 COMPLETA – ROSA  
**Resolução publicada:** 4714 × 4714 px

## Objetivo

Mapear todas as cores estruturais da Mandala antes de convertê-las em mecânicas, classes, clãs, guildas, visuais ou cards.

A unidade cromática oficial é:

`FAMÍLIA → COR ESTRUTURAL → OCORRÊNCIA → BLOCO → COORDENADA`

Não confundir cor conceitual com todos os valores RGB produzidos por rasterização, antialiasing, transparência ou compressão.

## 1. Estrutura cromática externa

A Mandala organiza 72 posições em 9 coros de 8 posições. Cada posição cobre 5° e cada coro cobre 40°.

| ID | Coro | Posições | Qtde. posições | Arco |
|---|---|---:|---:|---:|
| CG-01 | Serafins | 01–08 | 8 | 40° |
| CG-02 | Querubins | 09–16 | 8 | 40° |
| CG-03 | Tronos | 17–24 | 8 | 40° |
| CG-04 | Dominações | 25–32 | 8 | 40° |
| CG-05 | Potestades | 33–40 | 8 | 40° |
| CG-06 | Virtudes | 41–48 | 8 | 40° |
| CG-07 | Principados | 49–56 | 8 | 40° |
| CG-08 | Arcanjos | 57–64 | 8 | 40° |
| CG-09 | Anjos | 65–72 | 8 | 40° |

**Checksum:** `9 × 8 = 72`; `72 × 5° = 360°`; `8 × 5° = 40°`.

## 2. Famílias cromáticas provisórias

A inspeção visual permite reconhecer famílias cromáticas distintas nos setores, mas nomes exatos e valores RGB/HEX só serão congelados após amostragem raster da fonte canônica.

IDs provisórios:

- `CF-01` — branco/cinza/neutro;
- `CF-02` — vermelho;
- `CF-03` — laranja;
- `CF-04` — amarelo/dourado;
- `CF-05` — verde-amarelado/lima;
- `CF-06` — verde/turquesa;
- `CF-07` — azul/ciano;
- `CF-08` — violeta/roxo;
- `CF-09` — magenta/rosa.

**IMPORTANTE:** esta lista é uma taxonomia visual provisória, não uma tabela RGB final nem uma afirmação de que exista correspondência bijetiva 1:1 entre `CF-01…09` e `CG-01…09`.

## 3. Cores internas

Além dos setores externos, devem ser contadas separadamente as cores de:

- Rosa central;
- núcleo central;
- pétalas;
- círculos internos;
- anéis internos;
- Árvore da Vida na variante correspondente;
- sefirot;
- caminhos;
- glifos planetários;
- glifos zodiacais;
- letras hebraicas;
- números;
- textos;
- bordas;
- linhas radiais;
- linhas concêntricas;
- fundos;
- formas geométricas.

Portanto `9 grupos externos` **não significa** `9 cores totais`.

## 4. Registro de cada cor estrutural

Cada cor confirmada receberá:

`C-ID | família | nome visual | HEX | RGB | HSL | SOURCE-ID | amostra x/y | região | anel | grupo | nº ocorrências | nº blocos | confiança`

Exemplo de formato (não preenchido):

`C-001 | CF-02 | UNRESOLVED | #------ | rgb(-,-,-) | hsl(-,-,-) | CC-SOURCE-01 | x,y | setor externo | Rxx | CG-xx | n | n | VERIFIED`

## 5. Regra de amostragem

Uma cor estrutural só recebe HEX canônico após:

1. acesso ao raster original/cópia fiel em resolução total;
2. seleção de área interna distante de texto/borda;
3. múltiplas amostras do mesmo bloco;
4. comparação entre blocos equivalentes;
5. registro de mediana/moda quando houver pequenas diferenças raster;
6. documentação da coordenada de amostra.

## 6. O que NÃO vira nova cor

Não criar C-ID novo apenas por:

- antialiasing;
- sombra de texto;
- compressão;
- borda interpolada;
- pixel contaminado por glifo;
- transparência sobre outro fundo;
- variação mínima sem função estrutural demonstrada.

## 7. Relação cor ↔ bloco

Cada bloco-folha do futuro `B_TOTAL` poderá apontar para uma cor estrutural principal e, quando necessário, cores secundárias:

`B-ID → C-PRIMARY + [C-SECONDARY...]`

Isso permitirá calcular:

- blocos por cor;
- blocos por família;
- blocos por coro;
- distribuição angular por cor;
- símbolos por cor;
- frequência de cada cor;
- simetrias cromáticas;
- transições cromáticas entre anéis.

## 8. Separação epistemológica

- `CANON-SOURCE`: cor/organização efetivamente presente na imagem canonizada;
- `CANON-ANALYSIS`: valor medido, frequência, proporção ou relação calculada;
- `HNK-SYNTHESIS`: significado adicional atribuído e aprovado por TW DA VINCI;
- `UNRESOLVED`: identificação ainda não fechada.

Nenhuma interpretação espiritual/numerológica nova deve ser inferida apenas de RGB ou posição.

## 9. Relações do corpus relevantes ao censo

O corpus descreve:

- 72 gênios/arquétipos;
- 9 coros × 8;
- 5° por gênio no nível físico/zodiacal;
- 360° no ciclo completo;
- três níveis de atuação descritos como físico, emocional e mental;
- cinco momentos/atributos relacionados a Yod, He, Vô, segundo He e quintessência;
- relações com zodíaco, planetas, sefirot e elementos.

Essas relações serão cruzadas com as cores somente quando a própria fonte ou uma síntese HNK aprovada estabelecer a ligação.

## 10. Saídas do CC-G03

O gate só poderá ser marcado `PASS` quando existirem:

- `C_TOTAL` — número de cores estruturais confirmadas;
- tabela `C-001…C_TOTAL`;
- `CF_TOTAL` — famílias cromáticas;
- mapa cor → grupo → posições;
- contagem de blocos por cor;
- paleta HEX/RGB auditável;
- exceções documentadas;
- vínculo com `CC-G04` para anéis/blocos.

## 11. Estado atual

`CC-G03-A` — taxonomia cromática: **PASS**  
`CC-G03-B` — amostragem RGB/HEX raster: **PENDENTE**  
`CC-G03-C` — contagem de blocos por cor: **PENDENTE / depende de CC-G04**  
`C_TOTAL`: **UNRESOLVED**  
`B_TOTAL`: **UNRESOLVED**

### Próximo passo

Executar `CC-G04 — Censo de Anéis, Blocos e Sub-blocos`, numerando radialmente as células visuais e vinculando cada bloco-folha ao seu `C-ID`. Somente depois será possível responder rigorosamente quantos bloquinhos existem em cada grupo de cor.
