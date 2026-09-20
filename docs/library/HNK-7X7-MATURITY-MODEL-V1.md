# HNK 7×7 Maturity Model V1

A cobertura documental 49/49 encerra a pergunta **“há alguma evidência indexável para cada célula?”**. Ela não encerra a pesquisa.

A próxima camada mede seis dimensões separadas:

1. **Evidence Depth** — profundidade documental.
2. **Source Diversity** — diversidade e triangulação de proveniência.
3. **Formalization** — de conceito informal até contrato executável.
4. **Praxis** — de conceito até execução observada.
5. **Governance** — de não revisado até HNK-approved/canonical.
6. **Cross-Link Density** — relações tipadas com outros domínios.

## Regra central

**Não existe nota geral única.** Somar dimensões apagaria diferenças importantes. Uma célula pode ser altamente formalizada em software e ainda ter pouca diversidade de fontes; outra pode ter tradição bibliográfica extensa e pouca implementação.

`UNKNOWN` também não equivale a zero: ausência de auditoria não é evidência de ausência.

## Próxima compilação

O profiler deve produzir um vetor por célula:

`[depth, diversity, formalization, praxis, governance, links]`

acompanhado de proveniência e perguntas abertas.
