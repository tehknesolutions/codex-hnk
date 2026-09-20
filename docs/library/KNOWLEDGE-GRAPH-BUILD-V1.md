# Deterministic Knowledge Graph Build V1

O grafo deixa de depender de seed manual. O builder compila quatro autoridades de entrada:

```
library.sources.registry.json
        +
concepts.pilot.registry.json
        +
correspondences.registry.json
        +
hnk-7x7.registry.json
        ↓
knowledge-graph.generated.json
```

## Gates

- IDs de nós únicos;
- IDs de arestas únicos;
- nenhuma aresta órfã;
- proveniência obrigatória;
- conceitos → fonte preservados como `SOURCE_ASSERTED`;
- indexação 7×7 derivada da curadoria fica `HNK_CANDIDATE`;
- **o builder é proibido de produzir `HNK_APPROVED` automaticamente**.

Isso separa mecanicamente compilação de dados e autoridade canônica.
