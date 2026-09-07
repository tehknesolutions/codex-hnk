# REMOTE-MIGRATION-11 · Server Contract Registry + Generic Progression V2

## Production fact pattern

The connected `codex-hnk-app` database currently contains only Days 001–036 in `public.codex_days`.
Production exposes the legacy `public.complete_codex_day(...)`; `complete_codex_day_v2(...)` is not deployed.

Therefore this stage is deliberately **migration-draft only**.

## Two-lock rollout

### Catalog lock
Days 037–109 are seedable as `reviewed`, never `canon`.

### Contract lock
The 73 generated completion contracts are seedable as `draft`, never `active`.

The runtime V2 RPC filters for both:
- `public.codex_days.status = 'canon'`
- registry `status = 'active'`

So merely materializing the catalog + registry cannot unlock reconstructed runtime.

## Generic progression

The new private helper returns one stable `sephirah_state` envelope for:
- Kether 001–036,
- Chokhmah 037–073,
- Binah 074–109.

The V2 response also keeps the existing `crown` field for Day 001 compatibility.

## Evidence

Day 001 retains its specialized validator.
Days 037–109 use a generated structural validator bound to:
- Quest Definition ID,
- canonical Git blob SHA,
- Jachin completed + returned,
- Boaz completed + returned,
- Equilibrium completed + returned,
- voluntary completion.

Private Vault text is not required in the RPC.

## Progression gates

- 037 requires 036.
- 038–071 require previous Day.
- 072 requires 35/35 Chokhmah standard Days.
- 073 requires 072.
- 074 requires 073.
- 075–108 require previous Day.
- 109 requires 35/35 Binah standard Days.

## Grade boundary

Day 073 promotes to Grade 3 / `Teurgo`, matching recovered Binah source level.

Day 109 unlocks Day 110 / Chapter 4 / Chesed but **does not invent a Grade 4 transition**. The next grade remains undefined until its own canonical source contract is recovered or approved.

## Security

`SECURITY DEFINER` remains necessary for the atomic completion transaction because it writes protected progression state, but:
- `search_path=''` is pinned;
- every relation/function reference is schema-qualified;
- `auth.uid()` is required;
- `anon` execute is revoked;
- XP is server-derived;
- receipt replay remains idempotent;
- private registry and receipts have all public/anon/authenticated table privileges revoked.

## Production state

This stage makes **no database write**.

A later, explicit database-promotion gate must:
1. materialize the migration in a dev/preview database;
2. run pgTAP + concurrency/replay tests;
3. run Supabase security/performance advisors;
4. only then apply to production;
5. promote Days/contracts in a separate release migration.
