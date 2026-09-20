# HNK Convergence Matrices V1

Gera duas superfícies computáveis a partir do Convergence Map:

- **7×7 Pillar Matrix** — cada célula registra quantos pares de domínios possuem links semânticos materializados entre os dois pilares.
- **49×49 Domain Matrix** — cada célula registra quantas arestas semânticas revisadas conectam os dois domínios.

As matrizes são simétricas para visualização. As arestas conceituais originais continuam preservadas no Knowledge Graph com direção e tipo.

**Zero não significa inexistência de relação.** Significa apenas ausência de link semântico materializado no corpus auditado.

O exporter produz CSVs próprios para heatmap, tabela, notebook ou Laboratório HNK.
