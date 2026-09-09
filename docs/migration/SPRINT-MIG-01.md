# SPRINT MIG-01 — Migração e Unificação do HNK CODEX

## Objetivo

Transformar `tehknesolutions/codex-hnk` no repositório canônico unificado do HNK CODEX sem regredir o baseline M90 e sem perder a proveniência dos dois repositórios públicos anteriores.

## Definition of Done

A sprint só termina quando:

- a plataforma pública histórica estiver importada de forma reproduzível;
- o corpus editorial público estiver preservado com proveniência;
- nenhuma branch de staging Base64 for confundida com release;
- a RC1 109/109 estiver recuperada e reconciliada;
- os contratos M90 forem executados novamente no novo repo;
- CI estiver verde;
- nenhum segredo privilegiado estiver versionado;
- houver PR `migration/m90-unified-v2 -> main` revisável e sem force-push;
- a release RC seja rastreável por tag, manifesto e checksum.

## Lote A — Gate 0 / Governança

- [x] Confirmar autenticação como `tehknesolutions`.
- [x] Confirmar `admin` + `push` em `tehknesolutions/codex-hnk`.
- [x] Ler `main` antes de qualquer escrita.
- [x] Preservar tentativas antigas de migração sem force-push.
- [x] Criar branch limpa `migration/m90-unified-v2`.
- [x] Registrar o estado das fontes e a regra anti-regressão.

## Lote B — Importação pública determinística

- [ ] Importar `Tehkne-Solutions/codex-hnk-app` no SHA `4b63e2916ca2b0c9f654718d27e344851f9718d1`.
- [ ] Preservar o README e workflows do repo antigo como documentação de upstream.
- [ ] Importar `Tehkne-Solutions/hnk-codex-365` no SHA `4a5a88cc014308d3d2e27b581dd26be70b9d7cf4` sob namespace editorial de upstream.
- [ ] Gerar `docs/migration/UPSTREAM-PROVENANCE.json` com URLs e SHAs congelados.
- [ ] Garantir que o processo possa ser repetido sem depender da conta GitHub suspensa.

## Lote C — Recuperação da RC1 M90

- [ ] Localizar/restaurar `HNK_M90_TRIADE_I_FINAL_RC1` completo.
- [ ] Verificar integridade pelo checksum conhecido da migração anterior: `278fef245d7c0866174823feb2a766db12b49753cc8b064ef6c1872fc21bd7a5`.
- [ ] Confirmar 109/109 fólios.
- [ ] Confirmar 21/21 ciclos e demais métricas do snapshot.
- [ ] Reconciliar RC1 com o histórico público sem sobrescrever conteúdo mais novo.
- [ ] Remover a dependência operacional dos chunks `.b64` incompletos; mantê-los apenas como evidência histórica até o fechamento da migração.

## Lote D — Estrutura unificada

Estrutura alvo inicial:

```text
codex-hnk/
├─ apps/                     # Web / Mobile / Admin
├─ packages/                 # Pacotes compartilhados
├─ assets/                   # Assets da plataforma
├─ content/
│  ├─ canon/                 # Canon reconciliado e promovido
│  └─ upstream/
│     └─ hnk-codex-365/      # Snapshot editorial público preservado
├─ docs/
│  ├─ migration/
│  └─ upstream/              # README/workflows legados preservados
├─ scripts/
├─ supabase/
├─ tests/
├─ .github/workflows/
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

Regras:

- `content/upstream` é somente evidência/proveniência; não é automaticamente canon.
- `content/canon` só recebe material após reconciliação.
- outputs gerados e checkpoints serão auditados antes de qualquer remoção.

## Lote E — Segurança e higiene

- [ ] Revisar `.env.example`.
- [ ] Bloquear `service_role`, tokens GitHub/Vercel, chaves privadas e dumps plaintext.
- [ ] Confirmar que apenas chaves públicas/publishable aparecem no frontend.
- [ ] Consolidar `.gitignore` e `.gitattributes`.
- [ ] Adicionar `SECURITY.md`, `CONTRIBUTING.md` e `CHANGELOG.md`.
- [ ] Decisão explícita de licença antes de publicar licença do conteúdo.

## Lote F — CI M90

- [ ] Restaurar/installar lockfile reprodutível.
- [ ] Executar `pnpm install --frozen-lockfile` após o lockfile existir.
- [ ] Rodar validators herdados da plataforma.
- [ ] Reintroduzir gates RC1: 109/109, Portal 109, ciclos, XP, persistence/auth-sync, Vault/E2EE e release shell.
- [ ] Bloquear merge se qualquer contrato falhar.

## Lote G — PR e Release

- [ ] Abrir PR de migração para `main` apenas após RC1 recuperada e CI verde.
- [ ] Sem force-push.
- [ ] Tag candidata: `v0.90.0-rc.1` somente após reconciliação completa.
- [ ] Publicar manifesto + SHA-256 + prova de gates.

## Fronteira operacional — Atziluth / Chokmah

Estado auditado em 2026-09-08 (America/Sao_Paulo):

```text
CANON + SUPABASE G6
037–044  ✅
045      ⛔ #10 áudio Haziel
046–065  ✅
066      ⛔ #3 Gneo Geo
067–069  ✅
070      ⛔ #18 Pantáculo
071–072  ✅
073      ⛔ #19 Portal
```

- Maior Dia armazenado como successor canon: **072**.
- Fronteira executável contínua para primeira conclusão/XP: **044**.
- Commit imutável da última promoção Chokmah: `19da2e2d4e3a636cfef21b15c6c5928967e8268a`.
- Dias 066, 070 e 073 permanecem ausentes do root canônico e de `public.codex_days`.
- Dia 045 continua bloqueado: há diferença binaural de 12 Hz no plano, mas nenhum carrier/base aprovado; nenhum par foi inventado.
- Promotion record da última unidade: `docs/editorial/promotions/HNK_CHOKMAH_MEBAHEL_067_073_CANONICAL_PROMOTION_RECORD_V1.md`.
- Supabase migration de correção de proveniência: `20260909013809_fix_atziluth_import_run_source_repo`.
- Próxima frente editorial G4→G5→G6: **Binah 074–109**.
- A passagem para Binah não altera a fronteira executável até o blocker 045 ser resolvido.

## Próxima sprint — MIG-02

Após o merge seguro:

1. separar fixtures/checkpoints de outputs gerados;
2. tornar `dist/` 100% reproduzível;
3. deduplicar arquivos idênticos;
4. consolidar deploy Web/Vercel;
5. normalizar ambientes;
6. promover assets licenciados/aprovados;
7. continuar os três primeiros níveis Kether–Chokmah–Binah como produto pronto para uso.
