# HNK CODEX — Practice Session & Evidence Persistence V1

**Status:** APPROVED ARCHITECTURE / HEADLESS

## Problema encontrado

O adapter legado `practice-record` aceitava apenas evidência plana com valores `number | boolean | null`. Isso era suficiente para o baseline antigo, mas é incompatível com `HNK-KETHER-D001-V2`, que exige um envelope estruturado e versionado contendo:

- `protocol_version`;
- `source_sha`;
- blocos `jachin`, `ritual_tone_528`, `boaz`, `middle`, `soul_mirror`;
- enum de fenomenologia;
- refs opacas para Vault/mídia criptografada.

A solução não é liberar `Record<string, any>`.

## Decisão

Criar `@hnk/practice-contract` como domínio headless entre Quest Runtime e qualquer persistence adapter.

O pacote:

1. define a identidade versionada da sessão;
2. constrói Evidence V2 por builders tipados;
3. mantém métricas simples separadas da evidência estrutural;
4. permite refs opacas para Vault, nunca conteúdo privado;
5. fornece uma porta de persistência independente de Supabase;
6. fornece fila offline idempotente para start/save.

## Fronteira de privacidade

Pode ir para `practice_sessions.evidence`:

- IDs de protocolo;
- SHA canônico;
- flags booleanas;
- durações;
- contagens;
- ratings estruturados;
- enum de fenomenologia;
- refs opacas de Vault;
- refs de mídia já cifrada.

Não pode ir:

- texto do Espelho;
- texto das três distrações;
- sonhos em prosa;
- oração/intenção;
- objeto concreto da fé;
- transcrição vocal;
- áudio em claro.

## Day 001 builder

`buildDay001EvidenceV2(...)` é a única construção recomendada para o Golden Day.

Ele fixa automaticamente:

- `protocol_version = HNK-KETHER-D001-V2`;
- `source_sha = a01d13b43cbddb92236fc1e3b6c2a7e140d87d29`;
- Jachin/Boaz/Meio como concluídos somente quando o chamador chega à fase final;
- `return_confirmed = true` nos três atos;
- `voluntary_completion_confirmed = true`;
- três distrações mínimas em Boaz;
- gravação vocal opcional;
- `encrypted_voice_ref` obrigatório somente se `voice_recorded=true`.

## Persistence Port

Web/Expo/Supabase devem implementar:

```ts
interface PracticePersistencePort<TEvidence> {
  start(command): Promise<PracticeSessionSnapshot<TEvidence>>;
  save(command): Promise<PracticeSessionSnapshot<TEvidence>>;
}
```

O domínio não conhece Supabase, React, Expo ou IndexedDB.

## Offline

`PracticeSyncService` enfileira:

- `START_SESSION`;
- `SAVE_RECORD`.

A conclusão canônica continua fora desse serviço e passa por `@hnk/completion-contract`.

Portanto:

```text
QuestRuntime
  ↓
Practice Contract
  ↓
local persistence / sync
  ↓
practice_sessions = evidence_pending
  ↓
Completion Contract
  ↓
server authoritative seal
```

## Migração futura do adapter Supabase

Quando `packages/supabase-client` chegar ao novo repo:

1. preservar auth/client setup;
2. substituir o antigo normalizador plano para Evidence V2;
3. manter `metrics` como dados não sensíveis;
4. aceitar `Day001EvidenceV2` como JSON estruturado;
5. nunca aceitar prose genérica na API pública;
6. migrar `completeCodexDay` para `complete_codex_day_v2` através de `@hnk/completion-contract`.

## Invariante

> Evidência estruturada prova execução do protocolo; Vault preserva a experiência íntima; nenhum dos dois prova sucesso paranormal.
