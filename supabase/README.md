# Supabase — HNK CODEX

The remote Supabase project `codex-hnk-app` is a runtime projection of the canonical Codex and progression contracts. Canonical Day prose is never edited directly in Supabase.

## Live project

- Project: `codex-hnk-app`
- PostgreSQL: 17
- Day 001 Completion V2 migration: `20260908011647_day001_completion_contract_v2`

## Important baseline note

This consolidation repository started receiving the Supabase scaffold after the live project already had historical migrations from the legacy app repository `Tehkne-Solutions/codex-hnk-app`.

Until the historical migration files are fully mirrored here, **do not use this repository alone for a destructive local `db reset`**. The authoritative applied migration list is tracked in `MIGRATION_BASELINE.md` and in the live Supabase migration history.

## Completion rollout

`public.complete_codex_day_v2(...)` is now live for the Day 001 V2 contract. The legacy `public.complete_codex_day(...)` intentionally remains executable until Web and Expo clients migrate and replay/concurrency tests are complete.

The public V2 RPC is `SECURITY INVOKER`; its privileged implementation lives in `hnk_private` with a pinned empty `search_path` and explicit grants.
