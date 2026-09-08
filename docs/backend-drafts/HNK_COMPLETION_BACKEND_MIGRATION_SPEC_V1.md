# HNK CODEX — Completion Backend Migration Spec V1

**Status:** APPLIED / SUPERSEDED BY LIVE MIGRATION  
**Applied migration:** `supabase/migrations/20260908011647_day001_completion_contract_v2.sql`  
**Live Supabase project:** `codex-hnk-app`

## Resultado

O Completion Backend V2 deixou de ser apenas draft. A migration oficial `20260908011647_day001_completion_contract_v2` foi aplicada ao projeto Supabase vivo e está registrada no histórico de migrations.

O RPC público ativo é:

`public.complete_codex_day_v2(...)`

Ele é `SECURITY INVOKER`. A operação privilegiada vive em:

`hnk_private.complete_codex_day_v2_impl(...)`

com `SECURITY DEFINER`, `search_path=''`, autenticação por `auth.uid()` e grants explícitos.

O RPC legado `public.complete_codex_day(...)` permanece temporariamente disponível apenas para compatibilidade de clientes. Ele deve ser revogado em migration separada depois que Web + Expo usarem V2 e os testes E2E de replay/concorrência estiverem verdes.

## Baseline preservado

A implementação anterior já oferecia:

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

V2 preserva essas garantias e acrescenta contrato versionado.

## Delta V2 aplicado

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

Day 001 ativo:

- `HNK-KETHER-D001-COMP-V2`
- `HNK-KETHER-D001-V2`
- SHA `a01d13b43cbddb92236fc1e3b6c2a7e140d87d29`
- validator `day001_v2`.

## Validação estrutural Day 001

O backend vivo exige:

- protocolo, SHA e `session_id` corretos;
- `session_id` da evidence igual à `practice_session` usada na conclusão;
- tipos JSON reais para booleanos/números;
- rejeição de campos desconhecidos para impedir prose privada em evidence;
- Jachin iniciado/concluído/return + duração estruturada;
- 528 iniciado;
- Boaz iniciado/concluído/return + três distrações;
- prática vocal do Meio concluída + return;
- gravação vocal opcional;
- `encrypted_voice_ref` apenas quando gravação existe;
- Espelho concluído;
- ratings opcionais 0–10;
- refs privadas opacas;
- fenomenologia somente no enum permitido e sem duplicatas;
- conclusão voluntária.

## Replay offline e concorrência

`client_completion_id` é a chave de replay do cliente.

O servidor mantém receipt privado e serializa `user_id + client_completion_id` com advisory transaction lock. A proteção final fica em três camadas:

1. advisory lock para replay idêntico;
2. `day_completions (user_id, day)` para impedir dois selos;
3. `xp_events.idempotency_key` para impedir XP duplicado.

## Verificação executada no banco vivo

- validator V2 aceitou evidence válida;
- rejeitou boolean falso como string;
- rejeitou campo privado desconhecido;
- rejeitou gravação `true` sem ref cifrada;
- rejeitou Boaz com menos de três distrações;
- auth gate rejeitou chamada sem usuário autenticado;
- advisors não apontaram novo alerta de segurança para V2;
- FKs novas receberam índices de cobertura.

## Estado do rollout

### Fase A — CONCLUÍDA
Migration V2 aplicada mantendo RPC legado.

### Fase B — PENDENTE
Migrar Web + Expo para `complete_codex_day_v2`.

### Fase C — PENDENTE
Rodar E2E autenticado de replay/concorrência a partir do shell migrado.

### Fase D — PENDENTE
Auditar telemetria sem conteúdo privado.

### Fase E — PENDENTE
Revogar `EXECUTE` autenticado do RPC legado em migration separada.

O antigo draft `docs/backend-drafts/20260907_complete_codex_day_v2.sql` permanece somente como registro histórico de design e não é mais fonte operacional.
