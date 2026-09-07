# HNK CODEX — Completion Backend Migration Spec V1

**Status:** DRAFT EXECUTÁVEL / NÃO APLICAR AINDA  
**Target future path:** `supabase/migrations/<timestamp>_completion_contract_v2.sql`  
**Current draft path:** `docs/backend-drafts/20260907_complete_codex_day_v2.sql`

## Objetivo

Evoluir o RPC legado `public.complete_codex_day(...)` para uma fronteira de conclusão versionada sem perder as garantias já existentes de atomicidade, sequência, XP idempotente e Coroa derivada.

## Baseline preservado

A implementação anterior já oferece:

- `auth.uid()` como identidade autoritativa;
- lock da `practice_session` com `FOR UPDATE`;
- sessão em `evidence_pending|complete`;
- `day_completions` único por usuário/dia;
- XP derivado de `public.codex_days.xp`;
- `xp_events.idempotency_key`;
- sequência Days 001–035;
- Portal 036 condicionado a 35/35;
- atualização atômica de `user_progress`;
- Coroa derivada por `get_kether_crown_state()`.

V1 **não reescreve essas garantias**. Ele as envolve num contrato mais forte.

## Delta V2

O novo RPC recebe e valida:

- `completion_contract_id`;
- `quest_definition_id`;
- `canonical_source_sha`;
- `client_completion_id`.

O servidor continua sendo a autoridade sobre:

- XP;
- first completion;
- Grade;
- current Day;
- Coroa;
- progression events.

## Registry privado

`hnk_private.completion_contract_registry`

Liga:

`Day → Quest Definition → Canon SHA → Completion Contract → validator_key`.

O Day 001 é congelado como:

- `HNK-KETHER-D001-COMP-V2`
- `HNK-KETHER-D001-V2`
- SHA `a01d13b43cbddb92236fc1e3b6c2a7e140d87d29`
- validator `day001_v2`.

## Validação estrutural Day 001

O backend exige:

- protocolo e SHA corretos;
- Jachin iniciado/concluído/return;
- 528 iniciado;
- Boaz iniciado/concluído/return;
- três distrações;
- prática vocal do Meio concluída;
- return do Meio;
- Espelho concluído;
- conclusão voluntária.

**Não exige gravação vocal.**

## Replay offline

`client_completion_id` é uma chave de replay do cliente.

O servidor salva um receipt privado. Repetir exatamente a mesma requisição devolve a resposta autoritativa original, permitindo:

`offline queue → retry → same result`.

O mesmo `client_completion_id` não pode ser reutilizado para outra identidade de requisição.

Para proteger replays simultâneos da mesma chave, o draft também serializa `user_id + client_completion_id` com advisory transaction lock antes de ler/escrever o receipt.

## Concorrência

A proteção fica em três camadas:

1. advisory lock por `client_completion_id` estabiliza replay idêntico;
2. `day_completions (user_id, day)` impede dois selos;
3. `xp_events.idempotency_key` impede XP duplicado.

## Resposta

O RPC V2 devolve o contrato já congelado no app:

- Day;
- IDs e SHA ecoados;
- `first_completion`;
- `xp_awarded`;
- `xp_total`;
- Grade;
- Crown;
- Progress;
- `progression_events`;
- timestamp do servidor.

Para Day 001 primeira conclusão:

`KETHER_FIRST_SPARK` + `NEXT_DAY_UNLOCKED`.

## Rollout

### Fase A
Aplicar migration V2 mantendo RPC legado executável.

### Fase B
Migrar Web + Expo para `complete_codex_day_v2`.

### Fase C
Rodar pgTAP + concurrency + replay tests.

### Fase D
Auditar logs/telemetria sem conteúdo privado.

### Fase E
Revogar `EXECUTE` autenticado do RPC legado em migration separada.

Nunca revogar o legado no mesmo commit que introduz V2.

## Bloqueio atual

Este draft **não deve ser movido para `supabase/` ainda**, porque o novo repo ainda não recebeu o scaffold canônico do backend. Até lá ele é especificação executável, não migration aplicada.
