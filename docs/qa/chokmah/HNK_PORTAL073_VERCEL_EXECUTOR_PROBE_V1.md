# HNK Portal073 — Vercel Executor Probe V1

State: `ISOLATED_QA_PROBE__DO_NOT_MERGE_BUILD_OVERRIDE`

Purpose: obtain actual Node execution evidence for dependency-free Portal073 static gates while the authorized physical executor is offline and GitHub Actions fails before steps.

This branch temporarily changes only the Web build command so Vercel Preview executes, before Next build:

1. `node ../../scripts/validate-portal073-materialization.mjs`
2. `node ../../scripts/validate-portal073-vault-materialization.mjs`
3. normal `next build`

The build override is QA-only and MUST NOT be merged to production. A successful preview proves only these two static Node validators plus the normal Web build/TypeScript/static generation. It does not prove Expo, SecureStore, Supabase Vault E2E, device lifecycle, listening QA, concurrency, XP, Teurgo, Binah, publication or Day074 runtime unlock.

Fail closed remains authoritative: `PORTAL073_PRODUCTION_ENABLED=false`.
