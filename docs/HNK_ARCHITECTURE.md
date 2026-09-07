# HNK ARCHITECTURE

Status: **v0.1**

## 1. Topologia

```text
                    ┌──────────────────────────────┐
                    │ Tehkne-Solutions/hnk-codex-365 │
                    │ Canon / Markdown / Manifest  │
                    └───────────────┬──────────────┘
                                    │
                         Content Sync / SHA
                                    │
                                    v
┌──────────────────────────────────────────────────────────────┐
│                 Tehkne-Solutions/codex-hnk-app               │
│                                                              │
│ apps/mobile      apps/web        apps/admin                  │
│ Expo/RN          Next.js         HNK Studio                  │
│      \              |               /                       │
│       └────── packages compartilhados ──────┘                │
│ domain | codex | ui | audio | crypto | assets | analytics   │
└───────────────────────────┬──────────────────────────────────┘
                            │
             ┌──────────────┴───────────────┐
             v                              v
       Supabase                         Vercel
 DB/Auth/Storage/Functions          web/admin deploy
```

## 2. Fronteiras obrigatórias

### Canon
O texto editorial não nasce no banco. Nasce e é aprovado no `hnk-codex-365`.

### Domain
Regras de negócio puras não dependem de UI nem infraestrutura.

### Infra
Supabase e Vercel implementam persistência/deploy, mas não definem conceitos HNK.

### Assets
Assets têm ciclo de vida separado do texto canônico e podem ser regenerados sem alterar a doutrina.

## 3. Apps

### Mobile
Aplicação de uso diário. Deve privilegiar offline-first para conteúdo já sincronizado, progresso local pendente e Diário.

### Web
Camada de acesso web e deep-link. Pode compartilhar domínio, contratos e design tokens, mas não deve forçar abstrações que prejudiquem APIs nativas do mobile.

### Admin
Ferramenta interna HNK Studio. Não é fonte canônica do texto; é cockpit de assets, publicação, previews e metadados da plataforma.

## 4. Supabase

### Auth
Identidade do usuário e sessão.

### PostgreSQL
Persistência de perfil, ficha, progresso, XP, releases, registry de assets e metadados de journal cifrado.

### Storage
Primeira escolha para assets da plataforma e backups cifrados. Migração futura para outro object storage deve ser possível via adapter.

### Edge Functions
Somente para operações que necessitam segredo, assinatura, transformação controlada ou integração server-to-server.

### Realtime
Uso seletivo. Não é requisito para o fluxo diário principal.

## 5. Segurança Supabase

- RLS em toda tabela exposta;
- políticas combinam papel autenticado com ownership;
- `service_role` somente servidor/CI;
- dados de autorização ficam em metadata confiável do app, nunca em metadata editável pelo usuário;
- funções privilegiadas ficam fora de schemas expostos quando possível;
- Storage usa políticas equivalentes ao ownership de registros.

## 6. Diário

```text
entrada do usuário
   ↓
processamento local opcional
   ↓
AES-GCM / envelope local
   ↓
Ciphertext + IV + versão do formato
   ↓
Supabase
```

A arquitetura deve permitir uma política de recuperação separada da cifra principal. Qualquer mecanismo de recovery deverá ser explicitamente opt-in e documentado.

## 7. Content Sync

O parser do Codex produz um `CodexDay` normalizado.

Campos mínimos:

```ts
interface CodexDay {
  day: number;
  chapter: number;
  sephira: string;
  world: string;
  angel: string;
  level: number;
  xp: number;
  editorialVersion: string;
  epistemicProtocol: string;
  title: string;
  markdown: string;
  sourceCommitSha: string;
  checksum: string;
}
```

Publicação deve ser idempotente: o mesmo SHA/checksum não cria releases duplicadas.

## 8. Audio Engine

O engine recebe `AudioPreset`; UI apenas inicia/pausa/encerra.

```ts
interface AudioPreset {
  id: string;
  durationSeconds: number;
  fadeInSeconds?: number;
  fadeOutSeconds?: number;
  carrierLeft?: number;
  carrierRight?: number;
  layers: AudioLayer[];
}
```

Web usa Web Audio API. Mobile poderá usar implementação nativa/Expo quando necessário. Preset permanece portátil.

## 9. Assets

Aplicações nunca dependem diretamente de nomes de arquivos improvisados. Consomem `AssetRegistryEntry`.

```ts
interface AssetRegistryEntry {
  id: string;
  scope: 'global' | 'sephira' | 'cycle' | 'day';
  kind: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'retired';
  storagePath: string;
  checksum: string;
  version: number;
}
```

## 10. CI/CD

GitHub Actions deverá evoluir em camadas:

1. validação estrutural;
2. install + lint + typecheck + tests;
3. content sync dry-run;
4. security checks;
5. web/admin preview;
6. EAS build/check do mobile;
7. release controlada.

## 11. Ferramentas operáveis pelo chat

Prioridade operacional:

- GitHub: fonte e CI;
- Supabase: DB/Auth/Storage/Functions;
- Vercel: web/admin deploy e logs;
- Figma: produto/design;
- geração de imagem integrada: concept/hero;
- Adobe: edição e acabamento;
- Canva: derivados de comunicação;
- Higgsfield: motion/vídeo quando necessário.

Expo/React Native permanece controlado via código no GitHub; não é necessário que Expo tenha integração própria no chat para fazer parte do core.

## 12. Decisões adiadas de propósito

- provedor externo adicional de object storage;
- analytics vendor;
- motor específico externo de imagem;
- 3D completo da Árvore;
- pagamentos;
- comunidades/social;
- recursos multiplayer.

Essas decisões entram somente depois do vertical slice Kether.
