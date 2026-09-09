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

- Maior Dia armazenado no fechamento de Chokmah: **072**.
- Commit imutável da última promoção Chokmah: `19da2e2d4e3a636cfef21b15c6c5928967e8268a`.
- Dias 066, 070 e 073 permanecem ausentes do root canônico e de `public.codex_days`.
- Dia 045 continua bloqueado: diferença binaural de 12 Hz, mas nenhum carrier/base aprovado; nenhum par foi inventado.

## Fronteira operacional — Atziluth / Binah

Estado final da esteira de promoção G5/G6 com a evidência atual:

```text
074–078  ✅ Hariel
079      ⛔ REFERENCE_REVIEW — Thurisaz
080–082  ✅ Hakamiah
083      ⛔ SAFETY_REVIEW — sal/carvão
084      ⛔ SAFETY_REVIEW — espelho em baixa luz + vela
085–088  ✅ Lauviah
089      ⛔ SAFETY_REVIEW — silêncio de 6 horas
090–092  ✅ Caliel
093      ⛔ SAFETY_REVIEW — respiração 4-4-4-4
094–104  ✅ Leuviah + Pahaliah + Nelchael 104
105      ⛔ REFERENCE_REVIEW — Rosa de 22 Pétalas / Cruz Hermética
106      ✅ Nelchael
107      ⛔ AUDIO_PRESET_PENDING — Saturno
108      ✅ Nelchael
109      ⛔ PORTAL RUNTIME BLOCKED
```

Immutable G6 commits:

- 074–078: `166d109e7292edf0d12574cc85ff132573bca0ff`;
- 080–082: `acd1a38af3a371a8121d14987f3bfde4e11e1d68`;
- 085–088: `e1f7cb48356979d572ca66a4d42373ad44840885`;
- 090–092: `3e63916bb56ff8bf3bc91e249731040f119855e8`;
- 094–098: `e1fa9d39ed956d31cdeb91904d191f9b7f28d658`;
- 099–103: `ae9f78694d05d5c4a1f29909da53fd3bc86e23fc`;
- 104, 106, 108: `530b8ce2e45ba5246b93a88753cb298264f08e61`.

Audit result:

- maior Dia armazenado como successor canon: **108**;
- fronteira executável contínua para primeira conclusão/XP: **044**;
- Dias ausentes de `public.codex_days` em Binah: **079, 083, 084, 089, 093, 105, 107, 109**;
- todo successor canon auditado aponta para `source_repository = tehknesolutions/codex-hnk`;
- todos os G6 retornaram blob SHA idêntico ao Git canônico do respectivo commit imutável;
- nenhum placeholder, frequência inferida, geometria inventada ou fallback de segurança não revisado foi usado.

Promotion records:

- `docs/editorial/promotions/HNK_BINAH_HARIEL_HAKAMIAH_074_083_CANONICAL_PROMOTION_RECORD_V1.md`;
- `docs/editorial/promotions/HNK_BINAH_084_109_CANONICAL_PROMOTION_RECORD_V1.md`.

## Portal 109 — bloqueio final de Atziluth

O Portal 109 permanece fora do cânone. Antes de G5/G6 são exigidos:

1. Sintonizador Angelical aprovado + proveniência;
2. preset Saturno→Júpiter aprovado com semântica de áudio precisa;
3. assets visuais/sigilos de transição aprovados com versão/orientação;
4. alternativa sem fogo revisada para destruição dos papéis;
5. contrato E2E server-side comprovando sequência, idempotência, evidência, Vault e promoção atômica para o próximo mundo.

## Próxima frente recomendada — Blocker Resolution Sprint

A promoção em massa chegou ao limite seguro. A prioridade muda agora de drafting/promotion para resolução de blockers.

Ordem recomendada:

1. **Day 045 / Haziel áudio** — prioridade absoluta, pois sozinho mantém a fronteira executável em 044;
2. Day 066 / Gneo Geo;
3. Day 070 / Pantáculo;
4. Day 073 / Portal Chokmah;
5. Day 079 / Thurisaz;
6. Days 083, 084, 089, 093 / safety dispositions;
7. Day 105 / Rosa de 22 Pétalas;
8. Day 107 / Saturn audio preset;
9. Day 109 / Portal operators + E2E;
10. Atziluth Gold audit e somente então Beriah unlock/release.

## Próxima sprint — MIG-02

Após o merge seguro:

1. separar fixtures/checkpoints de outputs gerados;
2. tornar `dist/` 100% reproduzível;
3. deduplicar arquivos idênticos;
4. consolidar deploy Web/Vercel;
5. normalizar ambientes;
6. promover assets licenciados/aprovados;
7. concluir Kether–Chokmah–Binah como produto pronto para uso e auditado.
