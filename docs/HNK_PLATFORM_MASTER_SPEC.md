# HNK PLATFORM MASTER SPEC

Status: **Baseline v0.1**  
Produto: **HNK Codex Interativo 365 — Plataforma Digital**  
Repositório da plataforma: `Tehkne-Solutions/codex-hnk-app`  
Fonte canônica editorial: `Tehkne-Solutions/hnk-codex-365`

## 1. Princípio de arquitetura

O HNK opera com separação explícita entre **conteúdo canônico** e **produto executável**.

- `hnk-codex-365` é a fonte de verdade do Codex: dias, capítulos, metadados, protocolo epistêmico, XP editorial e conteúdo aprovado.
- `codex-hnk-app` consome esse conteúdo e implementa experiência, autenticação, progresso, áudio, QR, diário, assets, gamificação, sincronização e interfaces.
- O aplicativo não pode alterar silenciosamente o texto canônico. Mudanças editoriais retornam ao repositório do Codex.

## 2. Objetivo do primeiro vertical slice

Entregar **Kether completo — Dias 1 a 36** como primeira experiência jogável e validável antes da produção do restante do Codex.

O vertical slice deve provar:

1. onboarding;
2. criação da ficha HNK;
3. sete atributos `HIP`, `VNT`, `PER`, `SIN`, `BIO`, `INT`, `DIS`;
4. leitura diária do Codex;
5. execução da Kavanah;
6. Ordália e registro;
7. player de áudio HNK;
8. leitura de QR;
9. diário criptografado localmente;
10. XP, progressão e Level;
11. navegação pela Árvore da Vida;
12. assets visuais por dia;
13. passagem final Kether → Chokmah.

## 3. Stack oficial

### Mobile
- Expo / React Native
- Expo Router
- TypeScript
- módulos Expo para câmera, storage seguro, notificações, haptics e APIs nativas quando necessários

### Web e Studio
- Next.js App Router
- TypeScript
- Vercel

### Backend
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime somente onde houver benefício real
- Supabase Edge Functions para operações servidoras estritamente necessárias

### Monorepo e CI
- pnpm workspaces
- Turborepo
- GitHub Actions

### Áudio
- Web Audio API no navegador
- camada equivalente/native no mobile quando o comportamento de background ou APIs do dispositivo exigirem
- presets declarativos versionados por dia

## 4. Aplicações

### `apps/mobile`
Experiência principal do praticante em iOS e Android.

Módulos alvo:
- despertar/onboarding;
- ficha de personagem;
- Hoje;
- Codex;
- Kavanah;
- Ordália;
- Sintonizador;
- scanner QR;
- Diário Criptografado;
- progresso/XP;
- Árvore da Vida;
- configurações e segurança.

### `apps/web`
Experiência web pública e autenticada.

Responsabilidades:
- landing;
- documentação pública selecionada;
- acesso ao Codex quando apropriado;
- visão de progresso;
- deep links do QR;
- suporte e política de privacidade.

### `apps/admin`
**HNK Studio**: cockpit editorial/visual e operacional.

Responsabilidades:
- acompanhar 365 dias;
- visualizar status editorial e de assets;
- aprovar/rejeitar assets;
- editar metadados não canônicos;
- gerir presets de áudio;
- preview mobile/web;
- acompanhar publicação;
- auditar sincronização com o Codex.

## 5. Pacotes compartilhados

### `packages/domain`
Tipos e regras HNK puras. Não deve depender de React, Expo, Next ou Supabase.

Inclui:
- atributos;
- levels;
- XP;
- Sephiroth;
- mundos;
- ciclos;
- estados de progresso;
- contratos de Dia/Quest/Asset.

### `packages/codex`
Cliente e normalizador do conteúdo proveniente de `hnk-codex-365`.

### `packages/ui`
Design system compartilhado entre web/admin e, quando compatível, tokens utilizados pelo mobile.

### `packages/audio`
Presets, validação e lógica de síntese sonora.

### `packages/crypto`
Contratos de criptografia do Diário. A chave de conteúdo permanece sob controle do dispositivo do usuário.

### `packages/assets`
Tipos, manifestos, validação e adapters da HNK Asset Factory.

### `packages/analytics`
Eventos estritamente necessários para produto; nunca deve coletar conteúdo em claro do Diário.

## 6. Fonte de dados do Codex

Fluxo desejado:

```text
hnk-codex-365
  ↓ GitHub Action / Content Sync
canonical Markdown
  ↓ parser + validation
normalized content bundle
  ↓
Supabase / app cache
  ↓
mobile + web + admin
```

Todo bundle publicado deve registrar:
- commit SHA da fonte;
- dia;
- capítulo;
- versão editorial;
- protocolo epistêmico;
- checksum do conteúdo.

Isso permite rastrear exatamente qual versão do Codex o usuário recebeu.

## 7. Modelo de dados inicial

Entidades previstas:

- `profiles`
- `character_sheets`
- `attribute_scores`
- `codex_releases`
- `codex_days`
- `day_progress`
- `xp_events`
- `quests`
- `quest_completions`
- `audio_presets`
- `asset_registry`
- `journal_entries_ciphertext`
- `devices`
- `user_settings`

Toda tabela exposta ao cliente deverá ter RLS e políticas de propriedade explícitas.

## 8. Diário Zero-Knowledge

Princípios obrigatórios:

1. texto em claro nasce no dispositivo;
2. NLP local pode operar antes da criptografia;
3. criptografia acontece antes do sync;
4. servidor recebe somente ciphertext e metadados mínimos;
5. chaves não são enviadas ao Supabase;
6. biometria autoriza acesso à chave armazenada de forma segura; biometria não é armazenada como segredo HNK;
7. perda de chave precisa ter política explícita de recuperação ou perda irreversível — nunca promessa ambígua.

## 9. Sistema de áudio

Presets são dados, não arquivos gigantes.

Exemplo conceitual:

```json
{
  "id": "kether-day-036-transition",
  "carrierLeft": 432,
  "carrierRight": 436,
  "durationSeconds": 600,
  "fadeInSeconds": 10,
  "fadeOutSeconds": 15,
  "layers": []
}
```

O engine deve suportar posteriormente:
- binaural;
- isocrônico;
- ruído;
- drones;
- ASMR layers;
- voz/fórmula;
- timers;
- cues de sessão.

Claims fisiológicos externos não são codificados como fatos científicos; o produto registra o preset e a experiência observada.

## 10. HNK Asset Factory

A Asset Factory será multimotor e baseada em adapters. Nenhum fornecedor específico é requisito estrutural.

Fontes prioritárias operáveis pelo ecossistema do projeto:
- geração de imagem integrada ao ChatGPT;
- Adobe;
- Figma;
- Canva;
- Higgsfield quando útil;
- adapters externos futuros.

Cada asset deve possuir provenance:
- modelo/ferramenta;
- prompt/brief;
- referências;
- data;
- versão;
- estado de aprovação;
- checksum;
- licença/origem quando aplicável.

## 11. Experiência diária

Fluxo-base:

```text
Hoje
 → leitura
 → preparação
 → áudio/preset quando aplicável
 → Kavanah
 → Ordália
 → registro
 → XP
 → reflexão
 → próximo dia
```

O sistema deve permitir registrar uma prática sem obrigar o usuário a afirmar que um fenômeno metafísico ocorreu.

## 12. Segurança e privacidade

- nunca incluir `service_role` em clientes;
- RLS obrigatória em schemas expostos;
- segredos apenas em ambientes de servidor/CI apropriados;
- diário cifrado antes de sincronizar;
- logs não devem conter diário em claro;
- analytics não recebe conteúdo espiritual/terapêutico em claro;
- uploads privados usam políticas por usuário;
- toda ação destrutiva relevante deve ser auditável.

## 13. Estratégia de assets para Kether

Antes de Chokmah:

1. criar Visual Bible;
2. aprovar tokens e linguagem gráfica;
3. gerar os assets canônicos reutilizáveis de Kether;
4. gerar assets de Dia 1–36;
5. testar em UI real;
6. corrigir sistema visual;
7. congelar `KETHER_ASSET_SET_V1`;
8. somente então escalar para Chokmah.

## 14. Roadmap de implementação

### Fase 0 — Foundation
- monorepo;
- documentação mestre;
- CI;
- integração GitHub;
- desenho do schema Supabase;
- Visual Bible;
- Asset Manifest.

### Fase 1 — Shell
- Expo app;
- Next web;
- HNK Studio;
- auth;
- navegação;
- design tokens.

### Fase 2 — Kether Core
- ingestão dos 36 dias;
- Hoje;
- player;
- QR;
- progresso;
- XP.

### Fase 3 — Vault
- Diário criptografado;
- sync;
- export/backup;
- segurança e testes.

### Fase 4 — Asset Factory
- registry;
- approval workflow;
- geração/edição;
- publicação.

### Fase 5 — Kether Release Candidate
- 36/36 dias;
- assets completos;
- Portal Kether → Chokmah;
- QA mobile/web;
- analytics mínimos;
- release fechado.

## 15. Regra de avanço

**O Capítulo 2 não deve dirigir novas decisões de arquitetura antes de Kether funcionar como vertical slice.**

Chokmah continua canonicamente planejado no Codex, mas a plataforma é validada primeiro com Kether 1–36.
