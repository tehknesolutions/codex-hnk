# HNK Knowledge Graph Schema V1

O Knowledge Graph é a camada que conecta a Biblioteca ao restante do Codex sem apagar a identidade das fontes.

## Unidade fundamental

```
NODE ── EDGE + PROVENANCE ──> NODE
```

Uma relação proveniente de uma obra permanece `SOURCE_ASSERTED`. Ela só se torna ligação canônica HNK por decisão explícita `HNK_APPROVED`.

## Famílias de nós

Fontes · Conceitos · Símbolos · Práticas · Pessoas · Tradições · HNK-7×7 · Glifos · Days · Sephirot · Caminhos · Letras · Tarot · Astrologia · Cores · Números · Alquimia · Estados de consciência · Produtos.

## Quatro estados de aresta

- `SOURCE_ASSERTED` — a relação é apresentada pela fonte.
- `HNK_CANDIDATE` — relação proposta para avaliação HNK.
- `HNK_APPROVED` — relação incorporada explicitamente pela governança HNK.
- `UNRESOLVED` — relação detectada mas ainda não determinada.

## Invariante de proveniência

Toda aresta externa exige no mínimo `source_id + locator`.

## Não-redução

O schema não contém campo obrigatório REAL/SIMBÓLICO. Proveniência, tradição, relação e decisão HNK são dimensões independentes.

## Consultas-alvo

O modelo deve futuramente permitir consultas como:
- tudo que uma fonte relaciona a Mercúrio;
- caminhos que conectam Tarot e letras;
- conceitos ligados simultaneamente a Alquimia e Consciência;
- fontes que sustentam uma determinada correspondência;
- células HNK-7×7 associadas a um conceito;
- quais relações são SOURCE_ASSERTED, CANDIDATE ou APPROVED;
- quais Glifos/Days/Produtos possuem vínculo explicitamente aprovado.

## Seed

`knowledge-graph.seed.json` contém somente relações já extraídas de SRC-024 e SRC-026. Nenhum vínculo HNK-40/Day/Sephirah foi criado por inferência.
