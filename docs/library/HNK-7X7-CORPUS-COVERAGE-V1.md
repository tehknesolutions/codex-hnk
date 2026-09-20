# HNK-7×7 Corpus Coverage V1

Este relatório é gerado a partir dos **mapeamentos de indexação já registrados** no Pilot + Expansion Batches 001–002. Cobertura significa apenas que pelo menos um conceito extraído foi indexado naquele domínio. **Não significa validação ontológica, verdade científica ou HNK_APPROVED.**

Execute:

```bash
node scripts/compile-hnk-7x7-coverage.mjs > data/library/hnk-7x7.coverage.json
node scripts/report-hnk-7x7-coverage.mjs
```

O relatório deve sempre preservar três contagens separadas: conceitos, fontes únicas e células 7×7 cobertas. Isso evita confundir “muitos links” com “boa cobertura”.

Prioridade de ingestão futura: selecionar fontes pelas células vazias ou fracamente cobertas, sem inventar correspondências para preencher a matriz.
