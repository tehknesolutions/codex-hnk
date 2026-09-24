# ELEMENTOS DA MANDALA — Inventário Mestre

**Corpus:** Círculo Cabalístico  
**Categoria:** HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Status:** CANÔNICO / CENSO EM ANDAMENTO  
**Data:** 2026-09-23

## Regra-mãe

Este arquivo é a fonte-mãe do inventário da Mandala. O objetivo é identificar e contar tudo antes de converter qualquer elemento em mecânica, classe, clã, guilda, ficha ou card.

`FONTE → ELEMENTO → OCORRÊNCIA → BLOCO → ATOMIC-KODE (AK) → COR → SÍMBOLO → DIMENSÃO → RELAÇÃO → VISUAL → FICHA RPG → CARD HNK`

Não confundir:

- **ELEMENTO** = tipo conceitual único;
- **OCORRÊNCIA** = aparição visual de um elemento;
- **BLOCO** = agrupamento/célula/região delimitada que pode conter uma ou mais unidades mínimas;
- **ATOMIC-KODE (AK)** = menor unidade discreta contabilizável do Círculo Cabalístico; corresponde ao "bloquinho" mínimo individualizado no censo;
- **PIXEL** = unidade raster da imagem-fonte; pixel não é automaticamente um AK.

### Definição canônica de ATOMIC-KODE

Por decisão de TW DA VINCI:

> **ATOMIC-KODE (AK) é a menor unidade do Círculo Cabalístico.**

No censo cromático, portanto:

> **"bloquinhos por cor" = quantidade de AK daquela cor/grupo cromático.**

Um AK deve ser uma unidade visual/estrutural indivisível para os fins do modelo da Mandala. Se uma região puder ser decomposta em unidades discretas menores que preservam identidade própria no sistema visual, a região é BLOCO/GRUPO e essas unidades menores são os AKs.

### Identificação

Cada Atomic-Kode receberá ID estável:

`AK-0001 ... AK-N`

Campos mínimos previstos:

`AK-ID | SOURCE-ID | grupo | coro | setor | anel | cor estrutural | RGB/HEX medido | símbolo/conteúdo | x | y | width | height | r_min | r_max | θ_min | θ_max | relações | estado`

### Contadores canônicos

- `E_TOTAL` = elementos únicos;
- `O_TOTAL` = ocorrências visuais;
- `B_TOTAL` = blocos/grupos delimitados;
- `AK_TOTAL` = quantidade total de Atomic-Kodes.

Para distribuição cromática:

`AK_COR[c] = número de Atomic-Kodes pertencentes à cor/grupo c`

Checksum principal:

`AK_TOTAL = Σ AK_COR[c]`

Nenhum total é congelado antes do censo integral.

## 1. Geometria estrutural

Catalogar:

- circunferência externa;
- centro geométrico;
- anéis concêntricos;
- setores radiais;
- separadores;
- eixos;
- linhas radiais;
- linhas concêntricas;
- linhas de ligação internas;
- círculos;
- semicírculos/arcos;
- triângulos;
- quadrados;
- retângulos;
- losangos;
- estrelas;
- polígonos;
- pétalas;
- formas compostas;
- sobreposições geométricas.

### Geometria principal já estabelecida

- 72 posições radiais;
- 5° por posição;
- 72 × 5° = 360°;
- 9 grupos principais;
- 8 posições por grupo;
- 40° por grupo.

## 2. Nove coros / grupos externos

| Posições | Coro |
|---|---|
| 01–08 | Serafins |
| 09–16 | Querubins |
| 17–24 | Tronos |
| 25–32 | Dominações |
| 33–40 | Potestades |
| 41–48 | Virtudes |
| 49–56 | Principados |
| 57–64 | Arcanjos |
| 65–72 | Anjos |

Cada coro deve receber posteriormente: `ID`, faixa angular, cor estrutural, blocos, AKs, símbolos, nomes, ocorrências e dimensões.

## 3. As 72 posições

Cada posição 01–72 deve ser registrada individualmente. Campos mínimos:

`ID | número | nome | nome hebraico mostrado | coro | ângulo inicial | ângulo final | cor | blocos | AKs | símbolos | planeta/astro | signo | elemento | outras correspondências | SOURCE-ID`

A lista nominal integral será fechada no gate `CC-G06`, diretamente contra a imagem/fonte canônica.

## 4. Sefirot / Árvore

Inventariar individualmente onde representadas:

1. Keter
2. Chokhmah
3. Binah
4. Chesed
5. Gevurah
6. Tiferet
7. Netzach
8. Hod
9. Yesod
10. Malkuth

Para cada ocorrência: posição, cor, forma, rótulo, linhas incidentes, símbolos associados e variante da Mandala.

## 5. Letras e escrita hebraica

Catalogar letras hebraicas únicas, ocorrências, sequências/tríades, nomes hebraicos, letras usadas em caminhos/diagramas, orientação, posição, cor do glifo e AK/bloco de suporte.

As 22 letras devem ser tratadas como conjunto conceitual quando efetivamente representadas, sem confundir `22 letras únicas` com o número total de ocorrências gráficas.

## 6. Símbolos planetários e astrais

Inventariar cada glifo planetário/astral presente, sua ocorrência, posição, cor e AK/bloco. Variantes da Mandala que substituem ou reorganizam os 72 gênios permanecem separadas por `SOURCE-ID`.

## 7. Zodíaco

Catalogar os 12 signos e todas as suas ocorrências: símbolo, nome, setor, cor, posição angular, associações mostradas, triplicidade/decanato quando explicitamente representado e relação com posições 01–72.

## 8. Elementos

Catalogar Fogo, Água, Ar e Terra quando representados, distinguindo conceito, glifo, cor, ocorrência, setor e associação apresentada pela fonte. Quintessência é registrada separadamente quando apresentada.

## 9. Tetragrama e estruturas de cinco

Catalogar letras/estágios apresentados pela obra e suas ocorrências, mantendo a grafia da fonte. Não fundir automaticamente esta camada com nomenclaturas próprias HNK sem síntese HNK explicitamente aprovada.

## 10. Cores

O censo cromático passa a ter como unidade quantitativa mínima o **AK**:

`FAMÍLIA CROMÁTICA → COR ESTRUTURAL → AMOSTRA RGB/HEX → AKs → OCORRÊNCIAS → BLOCOS/GRUPOS`

Para cada grupo de cor calcular:

`AK_COR = COUNT(AK pertencentes ao grupo)`

Não contar como novas cores conceituais antialiasing, artefatos de compressão, bordas interpoladas ou pequenas variações rasterizadas da mesma área estrutural.

Catalogar separadamente cores de fundo, setores, anéis, textos, letras, glifos, geometria, centro, Árvore, Rosa e bordas/separadores.

## 11. Centro simbólico / Rosa

O centro não é um único elemento. Decompor núcleo, rosa/flor, pétalas, círculos, anéis, letras, glifos, símbolos elementais, números, cores, formas, sobreposições, conexões e textos. Quando uma dessas regiões contiver unidades mínimas discretas, enumerá-las como AKs próprios.

## 12. Diagrama central / variante com Árvore

Catalogar cada nó, caminho, região cromática, texto, número, símbolo, círculo, triângulo, quadrado/retângulo, linha, arco, relação espacial e demais rótulos visíveis. Unidades mínimas discretas recebem `AK-ID`.

## 13. Textos e nomenclaturas

Inventariar nomes das 72 posições, números 01–72, nomes dos coros, sefirot, qualificadores, rótulos centrais, marcações temporais/espaciais e autoria/data quando integrantes da imagem.

## 14. Dimensões

Cada AK mensurável deverá possuir dois sistemas de dimensão.

### Raster

`x | y | width_px | height_px | center_x | center_y`

### Geométrico

`raio_inicial | raio_final | ângulo_inicial | ângulo_final | arco | proporção_do_círculo`

## 15. Relações numéricas

Registrar como relações — não como AKs automáticos — 4 elementos, estruturas de 5 quando presentes, 9 coros, 10 sefirot, 12 signos, 22 letras, 72 posições/gênios, 360 graus, 8 posições por coro, 5° por posição, 40° por coro e outras relações verificadas.

## 16. Proveniência e variantes

Toda ocorrência e todo AK apontam para uma imagem-fonte:

- `CC-SOURCE-01` — mandala circular detalhada / 72 posições;
- `CC-SOURCE-02` — variante com diagrama central/Árvore;
- demais variantes aprovadas — IDs sequenciais.

Nunca fundir duas variantes sem indicar explicitamente a operação.

## 17. Estados epistemológicos internos

- `CANON-SOURCE` — está efetivamente no livro/imagem canonizado;
- `CANON-ANALYSIS` — medição ou relação demonstrada sobre a fonte;
- `HNK-SYNTHESIS` — nova integração HNK aprovada por TW DA VINCI;
- `UNRESOLVED` — ainda não identificável com segurança.

## 18. Pipeline visual aprovado

Após o censo: gerar VISUAL-ID, representação isolada, vista técnica, vista simbólica/canônica, ficha de RPG hermético HNK e Card HNK.

Famílias previstas:

`SEFIRAH | ANJO/GÊNIO | CORO | PLANETA/ASTRO | SIGNO | ELEMENTO | LETRA HEBRAICA | GEOMETRIA | COR | CAMINHO | SÍMBOLO | RITUAL | CORRESPONDÊNCIA`

## 19. Relação futura com SIMPLEWAY MATH

A unidade quantitativa do Círculo para o sistema passa a ser `AK_TOTAL`. A regra anterior baseada genericamente em B_TOTAL é substituída por:

`CLASSES + CLÃS + GUILDAS = AK_TOTAL`

A distribuição não altera retroativamente o censo dos AKs.

## 20. Próximos gates

- `CC-G01` inventário integral das fontes canônicas;
- `CC-G02` mapa geométrico;
- `CC-G03` censo cromático + `AK_COR`;
- `CC-G04` anéis, blocos e Atomic-Kodes;
- `CC-G05` símbolos e ocorrências;
- `CC-G06` tabela 01–72;
- `CC-G07` comparação entre variantes;
- `CC-G08` correspondências do corpus;
- `CC-G09` sínteses HNK;
- `CC-G10` versão digital/interativa;
- `CC-G11` Visual Atlas;
- `CC-G12` Hermetic RPG Card System.

**Estado:** `ATOMIC-KODE (AK)` canonizado como menor unidade do Círculo Cabalístico. `AK_TOTAL` e `AK_COR` ainda aguardam censo fino completo.
