# HNK VISUAL CONTRACT V1

## Objetivo

Separar a geometria e o significado visual reutilizável do shell React/Expo que originalmente a implementou.

O contrato visual não é Canon teológico/editorial. Ele é uma especificação de apresentação auditada, com proveniência explícita, destinada a Web, Expo e futuros renderers.

## Fonte recuperada

`Tehkne-Solutions/codex-hnk-app/apps/mobile/src/features/kether/Day001ImmersiveMobileVerticalSlice.tsx`

Git blob SHA-1: `c5f37b1ea2ca985575f497fe4843c0c8f1db006d`

Primitivas extraídas:

- `OriginCosmos` → `HNK-D001-VIS-ORIGIN-COSMOS-V1`;
- `BoazAxis` → `HNK-D001-VIS-BOAZ-AXIS-V1`;
- `ConvergenceGeometry` → `HNK-D001-VIS-CONVERGENCE-V1`;
- `TreeField` → `HNK-D001-VIS-TREE-FIELD-V1`;
- `ReflectionField` → `HNK-D001-VIS-REFLECTION-FIELD-V1`.

## Regras

1. Geometria recuperada pode ser preservada; copy, XP e regras antigas não migram por associação visual.
2. Cores de runtime devem usar tokens semânticos HNK, não depender dos RGBA do componente legado.
3. Reduced motion é obrigatório.
4. O estado visual de `KETHER_FIRST_SPARK` é derivado da conclusão autoritativa do servidor.
5. O campo do Espelho nunca transforma texto livre em Evidence; prose continua `VAULT_ONLY`.
6. Nenhuma primitive visual recebe status de `CANON` apenas por estar presente na experiência.
7. Web e Expo devem implementar adapters para o mesmo manifest, não manter geometrias divergentes.

## Distribuição

A fonte TypeScript vive em:

`packages/visual-contract/`

A representação incluída no Quest Pack vive em:

`docs/experience/kether/day-001/day-001.visual.manifest.json`

## Estado do blocker

`ASSET-001-PROCEDURAL-EXTRACTION` está resolvido pela extração headless.

O próximo estado é:

`ASSET-001-PROCEDURAL-ADAPTER`

Esse blocker só pode ser fechado quando Web/Expo consumirem o contrato compartilhado no shell migrado.

## Não resolvidos por este contrato

- derivativo canônico da Coroa para o Day 001;
- key art final;
- aprovação visual final do Soul Mirror;
- assets binários adicionais que venham a ser aprovados.
