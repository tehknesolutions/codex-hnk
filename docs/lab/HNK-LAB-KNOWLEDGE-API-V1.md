# HNK Laboratory Knowledge API Contract V1

Contrato read-only entre o corpus/Knowledge Graph e o Laboratório Interativo HNK.

A UI não decide cânone. Ela consulta e apresenta proveniência, status, relações, maturidade e lacunas.

## Superfícies
- Heatmap 7×7 dos pilares
- Matriz 49×49 dos domínios
- Graph Explorer
- Domain Inspector
- Provenance Drawer
- Busca por conceito/fonte/domínio

## Estados obrigatórios
`SOURCE_ASSERTED`, `HNK_CANDIDATE`, `HNK_APPROVED`, `UNRESOLVED`.

`UNKNOWN` e ausência de link precisam continuar visíveis; a interface não pode convertê-los silenciosamente em zero, falso ou inexistente.

O payload V1 é estático e determinístico. Uma camada HTTP/Next pode servi-lo depois sem duplicar regras de conhecimento no frontend.
