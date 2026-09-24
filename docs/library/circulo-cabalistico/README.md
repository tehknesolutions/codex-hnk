# Círculo Cabalístico — Dossiê HNK Codex

**Status:** pesquisa / SOURCE-LOCK  
**Entrada no HNK Codex:** 2026-09-23  
**Escopo:** documentação, decomposição visual, matemática, correspondências e posterior comparação HNK.

> Regra epistemológica: este dossiê registra a fonte estudada e nossas observações sobre ela. Elementos da mandala não se tornam cânone HNK automaticamente. Correspondências HNK exigem validação explícita do Criador.

## 1. Objeto de estudo

O objeto atualmente chamado de **Círculo Cabalístico** é a mandala circular atribuída a Inácio Vacchiano apresentada nas imagens de referência fornecidas ao projeto. A composição combina uma estrutura radial de 72 posições com nomes angelicais, letras/símbolos hebraicos, signos astrológicos/planetários, cores, coros angelicais e correspondências cabalísticas.

Também existe uma variante visual que introduz no centro uma composição diagramática relacionada à Árvore da Vida e outras correspondências. As variantes devem permanecer separadas por IMAGE-ID; não se deve fundir visualmente dados de versões distintas sem documentação.

## 2. Macroestrutura confirmada para o levantamento

A circunferência principal está organizada em **72 posições**, distribuídas em **9 grupos de 8**. Cada posição ocupa **5 graus**, portanto:

- 72 × 5° = 360°
- 9 × 8 = 72 posições
- cada grupo de 8 ocupa 40°

Grupos usados no censo atual:

| Faixa | Grupo | Quantidade |
|---|---|---:|
| 01–08 | Serafins | 8 |
| 09–16 | Querubins | 8 |
| 17–24 | Tronos | 8 |
| 25–32 | Dominações | 8 |
| 33–40 | Potestades | 8 |
| 41–48 | Virtudes | 8 |
| 49–56 | Principados | 8 |
| 57–64 | Arcanjos | 8 |
| 65–72 | Anjos | 8 |

## 3. Correspondências visíveis no anel externo

Na referência atualmente analisada, os setores externos apresentam associações textuais entre coros e conceitos/sefirot, incluindo rótulos como:

- Serafins — Keter — Coroa
- Querubins — Chokhmah — Sabedoria
- Tronos — Binah — Inteligência
- Dominações — Chesed — Misericórdia
- Potestades — Julgamento
- Virtudes — Tiferet — Esplendor
- Principados — Netzach — Beleza
- Arcanjos — Hod — Verdade
- Anjo — Yesod — Fundamento

Esses rótulos são registrados como **conteúdo da fonte visual**, não como equivalências HNK aprovadas.

## 4. Modelo de decomposição

O estudo deve decompor a mandala nesta ordem:

`CÍRCULO → GRUPO → POSIÇÃO → NOME → COR → ANEL → BLOCO → SUB-BLOCO → SÍMBOLO → CORRESPONDÊNCIA → CONTAGEM`

### Regra cromática

Não confundir:

`GRUPO CROMÁTICO ≠ COR RGB ≠ BLOCO VISUAL`

Antialiasing, compressão e pequenas variações rasterizadas não constituem novas cores conceituais.

## 5. Censo cromático

O próximo gate quantitativo é construir o **CENSO CROMÁTICO V1**, contendo para cada família cromática:

- intervalo angular;
- posições abrangidas;
- grupo/coro associado;
- cor conceitual;
- amostras RGB/HEX quando mensuráveis;
- quantidade de blocos radiais;
- quantidade de sub-blocos;
- símbolos contidos;
- exceções e sobreposições.

Nenhum `B_TOTAL` deve ser congelado antes dessa decomposição.

## 6. Censo simbólico

Catalogar separadamente:

- 72 nomes/posições;
- grafia hebraica mostrada;
- símbolos planetários;
- símbolos zodiacais;
- números;
- glifos geométricos;
- círculos, quadrados, triângulos e polígonos;
- linhas radiais e concêntricas;
- cores de fundo e de glifo;
- elementos centrais;
- textos periféricos.

Quando um símbolo não puder ser identificado com segurança, usar `UNRESOLVED` em vez de inferir.

## 7. Variantes da fonte

Manter versões distintas da mandala sob IDs independentes, por exemplo:

- `CC-SOURCE-01` — mandala circular detalhada / 72 posições;
- `CC-SOURCE-02` — variante com diagrama central/Árvore da Vida;
- futuras variantes — novos IDs sequenciais.

A proveniência, resolução, data, autor indicado e URL de origem devem ser preservadas quando verificadas.

## 8. Integração HNK

A entrada deste objeto no repositório significa que ele passa a integrar a **biblioteca de pesquisa do HNK Codex**, não que todas as doutrinas ou equivalências da fonte tenham sido incorporadas ao cânone.

A integração HNK deverá possuir três camadas:

1. **SOURCE** — o que a fonte efetivamente mostra/diz;
2. **ANALYSIS** — matemática, estrutura, padrões e comparações verificáveis;
3. **HNK-MAPPING** — somente correspondências explicitamente propostas e posteriormente aprovadas.

Isso permite estudar possíveis relações com numerologia HNK, 72/144, estruturas radiais, cores, glifos, sefirot e demais sistemas sem apagar a proveniência histórica da fonte.

## 9. Gates seguintes

- `CC-G01` — inventário das imagens-fonte;
- `CC-G02` — geometria 72 × 5°;
- `CC-G03` — censo cromático;
- `CC-G04` — censo de anéis/blocos/sub-blocos;
- `CC-G05` — censo dos símbolos;
- `CC-G06` — tabela das 72 posições;
- `CC-G07` — comparação entre variantes;
- `CC-G08` — matriz de correspondências tradicionais;
- `CC-G09` — mapa comparativo HNK, sem promoção automática a cânone;
- `CC-G10` — especificação digital/interativa para o Codex.

## 10. Estado atual

**REGISTRADO NO HNK CODEX / SOURCE-LOCK / CENSO EM ANDAMENTO.**

O princípio de trabalho é: **primeiro medir e documentar; depois interpretar; somente então propor integração HNK.**
