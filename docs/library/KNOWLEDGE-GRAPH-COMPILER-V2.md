# HNK Knowledge Graph Compiler V2

V2 acrescenta índices reversos e cobertura HNK-7×7 ao artefato compilado.

## Índices

- `by_type` — nós agrupados por tipo;
- `by_source` — arestas recuperáveis por fonte;
- `by_status` — SOURCE_ASSERTED / HNK_CANDIDATE / HNK_APPROVED / UNRESOLVED quando presentes.

## Heatmap 7×7

Cada uma das 49 células recebe:
- `count` de conceitos candidatos indexados;
- `concept_ids`;
- nome/ID do domínio.

O heatmap mede **cobertura do corpus ingerido**, não importância, verdade ou valor de um pilar. Célula vazia significa somente: ainda não há conceito ingerido e indexado nela.

## Autoridade

O compiler continua proibido de auto-promover qualquer aresta para `HNK_APPROVED`.
