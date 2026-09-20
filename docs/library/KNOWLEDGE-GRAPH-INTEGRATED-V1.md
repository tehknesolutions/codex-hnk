# HNK Knowledge Graph Integrated V1

Compilador para unir corpus externo, corpus interno, project/chat review e project-file evidence ao HNK-7×7.

Cada conceito gera:
- nó `CONCEPT`;
- aresta `DERIVED_FROM` para sua fonte;
- arestas `INDEXED_IN` para as células 7×7.

Todos os vínculos entram como `HNK_CANDIDATE`. Nenhum batch promove automaticamente uma relação a `HNK_APPROVED`.

## Cross-Link Density V1
A primeira densidade estrutural usa somente relações materializadas `DERIVED_FROM` + `INDEXED_IN`. Relações semânticas mais ricas (USES, INTEGRATES_WITH, CORRESPONDS_TO etc.) ficam para V2. Portanto a métrica V1 mede conectividade documental, não importância, verdade ou maturidade total.
