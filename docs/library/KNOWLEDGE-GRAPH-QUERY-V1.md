# HNK Knowledge Graph Query Engine V1

Primeiro runtime consultável do grafo.

## Operações

```bash
node scripts/hnk-kg-query.mjs stats
node scripts/hnk-kg-query.mjs find mercury
node scripts/hnk-kg-query.mjs neighbors N-MERCURY
node scripts/hnk-kg-query.mjs traverse N-PHILOSOPHERS-STONE 2
node scripts/hnk-kg-query.mjs provenance N-MERCURY
```

## Semântica

- `find`: índice textual de IDs/labels do seed.
- `neighbors`: relações diretas, mantendo a aresta completa.
- `traverse`: BFS controlado por profundidade.
- `provenance`: origem/localização/status das relações de um nó.
- `stats`: diagnóstico estrutural.

A resposta do engine nunca promove `SOURCE_ASSERTED` para `HNK_APPROVED`. O status acompanha a aresta durante toda travessia.

## Próxima evolução

1. substituir seed por build gerado dos registries;
2. criar índices reversos por tipo, fonte, domínio e status;
3. permitir consultas compostas;
4. expor API para o Laboratório HNK;
5. criar visualizador interativo do subgrafo retornado.
