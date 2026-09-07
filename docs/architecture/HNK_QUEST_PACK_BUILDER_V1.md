# HNK QUEST PACK BUILDER V1

## Objetivo

Transformar um Day validado em uma unidade determinística, verificável e offline-capable, sem misturar coerência de contratos com prontidão de release.

## Princípio central

`integrity_state` e `release_state` são estados diferentes.

Um pack pode estar estruturalmente íntegro e ainda estar bloqueado para produção por asset, áudio, edição canônica ou backend.

## Fonte do Day 001

- Quest Definition: `HNK-KETHER-D001-V2`
- Completion Contract: `HNK-KETHER-D001-COMP-V2`
- Canon blob: `a01d13b43cbddb92236fc1e3b6c2a7e140d87d29`
- Canon counted core: 705 palavras

## Conteúdo do Pack

O Day 001 referencia:

1. Quest Definition
2. Canon Blocks
3. Renderer Profile
4. Evidence Schema
5. Completion Schema
6. Completion Service Profile
7. RPC Request Schema
8. RPC Response Schema
9. Asset Manifest
10. Audio Manifest
11. Safety Policy
12. Episteme Manifest
13. Repository Integrity Index

O runtime build acrescenta um `runtime-pack.index.json` com SHA-256 dos bytes efetivamente distribuídos.

## Duas camadas de integridade

### Repositório

`day-001.checksums.json` usa Git blob SHA-1 para detectar drift exato dos artefatos versionados no Git.

### Payload de distribuição

`build-day001-quest-pack.mjs` calcula SHA-256 sobre os bytes que entram no pacote de runtime.

Os SHA-256 internos de cada bloco canônico continuam independentes e permitem verificar Canon por bloco.

## Offline

O Pack permite:

- leitura do Canon empacotado;
- execução das práticas suportadas localmente;
- checkpoints;
- Structured Evidence local;
- Vault local-first;
- fila de sync.

O Pack NÃO concede conclusão canônica offline.

A fronteira continua:

`Evidence local -> sync -> complete_codex_day_v2 -> resposta autoritativa -> XP/Coroa/First Spark`.

## Assets

Assets obrigatórios permanecem referências até serem resolvidos no Asset Registry.

`release_ready=false` é obrigatório enquanto qualquer asset requerido estiver em `UNRESOLVED_IN_NEW_REPO` ou equivalente.

O símbolo `dai-koo-myo-approved` deve apontar para asset aprovado; o runtime não pode improvisá-lo por IA.

## Audio

### 528 Hz

Contrato pronto para síntese em runtime:

- frequência: 528 Hz;
- autoplay: não;
- volume: controlado pelo usuário;
- duração mínima: não inventada.

### Theta / 432

Permanece `CANONICAL_MAPPING_PENDING`.

O builder não aceita uma diferença binaural inventada para tornar o pack “completo”.

## Safety

Safety é parte do Pack, não um detalhe visual do app.

O renderer deve respeitar:

- pause;
- stop;
- safety stop;
- Return Gate;
- reduced motion;
- ausência de perda de progresso por safety stop;
- ausência de fenômeno subjetivo obrigatório.

## Episteme

O Pack declara HNK-EP-1.1 e as anotações E1-E5/Operational Hypothesis utilizadas pelas fases.

Canon e Guide continuam vozes diferentes.

## Build

Produção:

```bash
node scripts/validate-day001-golden.mjs
node scripts/build-day001-quest-pack.mjs
```

Se houver blocker, o build encerra com código 2.

Para auditoria/desenvolvimento somente:

```bash
node scripts/build-day001-quest-pack.mjs --allow-blocked
```

Um pack `BLOCKED` gerado dessa forma recebe `development_only=true` e não deve ser publicado.

## Blockers atuais do Day 001

- `EDITORIAL-001-UNIVERSAL-ENTRY`
- `EDITORIAL-001-VOICE`
- `AUDIO-001-THETA-432`
- `BACKEND-001-COMPLETION-V2`
- `ASSET-001-REGISTRY-RESOLUTION`

## Definition of Done do Quest Pack V1

O Day 001 pode ser considerado Pack READY quando:

- todos os gates Golden passam;
- Canon bruto confere com o blob esperado;
- todos os artefatos do Pack possuem integridade válida;
- assets requeridos estão resolvidos e aprovados;
- áudio requerido possui runtime adapter verificado;
- mapping Theta/432 está resolvido ou removido editorialmente;
- patch vocal está reconciliado com o Canon;
- Complete Day V2 está ativo no backend migrado;
- `release_state` muda de `BLOCKED` para `READY` sem esconder qualquer blocker.

## Regra final

> O Quest Pack não serve para declarar que um Day está pronto. Ele serve para provar exatamente o que está pronto, exatamente o que falta e exatamente quais bytes serão executados.
