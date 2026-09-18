# HNK CODEX — Tríade I M90

> Kether · Chokhmah · Binah · successor canônico Atziluth 109/109

## Estado executivo — 2026-09-18

O HNK CODEX já não está em “migração inicial”. O repositório atual é um monorepo Web + Mobile com runtime, progressão server-authoritative, Vault, pesquisa/evidência, Human Gates e governança formal de release/deploy/produção.

### Verdades de estado

- a RC1 histórica `HNK_M90_TRIADE_I_FINAL_RC1` permanece **NOT RECOVERED**; nenhum snapshot ausente é representado como recuperado;
- o sucessor canônico em `content/canon/atziluth/` possui cobertura editorial/auditada **109/109**;
- Kether (001–036) está estruturalmente implementada;
- Chokhmah (037–072) está estruturalmente implementada, mas a sequência permanece bloqueada por `DAY045_FINAL_QA_LOCK`;
- Portal073 está **APPROVED_NOT_PUBLISHED**;
- Binah runtime/progressão (074–109) ainda não está liberada;
- Web e Mobile existem como apps reais no monorepo;
- GitHub-hosted Actions continua sem prova confiável de execução quando apresenta `runner_id=0` / `steps=[]`;
- o estado de produção atual não é inferido de merge, build parcial, aprovação editorial ou ausência de erro.

## Gargalo atual

```
DAY045 FINAL QA
      ↓
PORTAL073 G7/G8
      ↓
PUBLISH PORTAL073
      ↓
DAY074 / BINAH
      ↓
074–109 RUNTIME
      ↓
PREMIUM VISUAL PASS
      ↓
ATZILUTH GOLD / PORTAL109
```

Nenhuma nova camada de infraestrutura deve substituir o fechamento desses gates.

## Fronteiras de autoridade

```
SOURCE ≠ HNK_CANON
MATCH ≠ RELEASE_ACCEPTED
RELEASE_ACCEPTED ≠ DEPLOYMENT_APPROVED
DEPLOYMENT_APPROVED ≠ DEPLOYMENT_EXECUTED
DEPLOYMENT_EXECUTED ≠ PRODUCTION_ACCEPTED
```

Decisões humanas permanecem explícitas e registradas; máquinas podem validar integridade/estado, mas não fabricar Human Gate.

## Apps

- `apps/web` — Next.js / React / TypeScript
- `apps/mobile` — Expo / React Native

## Pacotes centrais

O workspace inclui contratos e runtimes compartilhados para canon, quests, áudio, progressão, Vault, evidência, pesquisa, release, deploy e produção. O `@hnk/quest-engine` atua como ponto de integração para vários desses contratos.

## QA / execução

O estado correto para workflows GitHub com `runner_id=0`, `steps=[]` e ausência de log é:

```
NOT_EXECUTED_PRESTEP_INFRA_FAILURE
```

Isso não é PASS nem code FAIL.

O runbook executável da fronteira Chokhmah está em:

`docs/qa/chokmah/HNK_CHOKMAH_RELEASE_GATE_EXECUTION_V1.md`

O snapshot executivo consolidado está em:

`docs/status/HNK_CODEX_EXECUTION_FIRST_STATUS_2026-09-18.md`

## Regra operacional atual

**Execution-first.** Prioridade: fechar Day045 → Portal073 → Binah → Atziluth Gold antes de expandir novas camadas arquiteturais.
