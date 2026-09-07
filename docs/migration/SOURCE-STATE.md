# MIG-01 — Estado das Fontes

Data de auditoria: 2026-09-07

## Destino canônico

- Repositório: `tehknesolutions/codex-hnk`
- Branch de integração limpa: `migration/m90-unified-v2`
- `main` no início da migração: `5b623dd3827fa8cf453f3b89cb630056435bd4cc`
- Estratégia: preservation-first; sem force-push.

## Fonte editorial pública

- Repositório: `Tehkne-Solutions/hnk-codex-365`
- Commit congelado: `4a5a88cc014308d3d2e27b581dd26be70b9d7cf4`
- Manifesto público: 39 dias escritos/revisados/canônicos.
- Kether: 36/36.
- Chokmah: 3/37 (Dias 37–39).
- Binah: 0/36 no `main` público.
- O repositório mantém `canon/`, `docs/`, `reviews/`, `templates/`, `scripts/`, `CODEX_MANIFEST.yaml` e CI editorial.

## Fonte da plataforma pública

- Repositório: `Tehkne-Solutions/codex-hnk-app`
- Commit congelado: `4b63e2916ca2b0c9f654718d27e344851f9718d1`
- Stack: Node 22, pnpm 12, Turborepo, Next.js, Expo/React Native, TypeScript, Supabase, Vercel e GitHub Actions.
- Estrutura observada: `apps/`, `packages/`, `assets/`, `docs/`, `scripts/`, `supabase/`, `.env.example`, `package.json`, `pnpm-workspace.yaml`, `turbo.json`.
- O `check` público inclui validações de arquitetura, UI, Day 001, experiência, áudio, referências canônicas de Kether, boards e Vault/E2EE.

## RC1 M90 de 109 fólios

A migração anterior registrou a existência do baseline `HNK_M90_TRIADE_I_FINAL_RC1` com Kether + Chokmah + Binah (109/109), além de gates M90. Esse snapshot é mais avançado do que os dois `main` públicos acima.

No estado atual desta sessão, o pacote RC1 completo não está disponível como arquivo recuperável. As branches antigas de tentativa de migração (`migration/m90-triade-i-rc1` e `migration/m90-triade-i-rc1-clean`) contêm apenas chunks Base64/probes incompletos e **não são tratadas como baseline válido**.

Portanto:

1. os repositórios públicos serão importados como fontes históricas verificáveis;
2. eles não poderão sobrescrever conteúdo RC1 quando o snapshot 109/109 for recuperado;
3. a promoção para release M90 continuará bloqueada até a RC1 109/109 ser restaurada e seus contratos reexecutados.

## Regra anti-regressão

Nenhuma métrica pública de 39 dias pode ser interpretada como substituta do baseline RC1 de 109 fólios. O merge final em `main` só será autorizado após reconciliação explícita entre as fontes e validação dos gates do M90.
