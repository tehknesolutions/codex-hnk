# Vercel Preview Handoff — Day 002

## Goal

Create an isolated preview for the migrated `tehknesolutions/codex-hnk` monorepo without changing the existing `codex-hnk-app` production project or its domains.

## Why a separate preview project is required

The connected Vercel project currently named `codex-hnk-app` has active production aliases and a recent READY deployment, but its latest preview returned 404 for `/day-001`. It therefore cannot be treated as release evidence for this migrated repository.

Do not repurpose or overwrite that production project solely for QA.

## New preview project settings

- Repository: `tehknesolutions/codex-hnk`
- Framework: Next.js
- Root Directory: `apps/web`
- Node.js: `22.x`
- Package manager: pnpm (workspace root declares `pnpm@12.1.0`)
- Build target: `@hnk/web`

Recommended build command when Vercel is configured from the monorepo root:

```bash
pnpm --filter @hnk/web build
```

Recommended preview checks:

```text
/
/day-001
/day-002
```

## Turborepo

Root `turbo.json` must keep:

```json
"outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
```

This prevents `.next/cache` from being treated as deploy output.

## Environment variables

Set through Vercel project settings; never commit values.

Required Web variables currently used by the app:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Use preview-scoped values appropriate for QA. The frontend key is publishable, but it still belongs in Vercel environment configuration rather than source.

## Day 002 browser acceptance

1. `/day-002` loads without 404 or build/runtime exception.
2. Auth boundary returns to `/day-002` after sign-up/sign-in callback.
3. Canon is loaded from `@hnk/quest-library`; no network fetch is required for the 705-word content bundle.
4. AUDIO phase starts only after a user gesture.
5. Audio controls: start, pause, resume, stop, volume.
6. Headphone disclosure is visible.
7. No claim that the 6 Hz difference proves or guarantees a Theta brain state.
8. Safety Stop immediately stops audio and moves Quest runtime to safety-stop state.
9. Return Gates remain explicit.
10. Completion uses `complete_codex_day_v2` and never client-awards XP/DIS.
11. Private prose remains outside structured Evidence.
12. Reduced-motion mode remains usable.

## Release boundary

A READY Vercel build is not by itself a release approval. Capture:

- preview deployment id/url;
- build status;
- `/day-002` HTTP/UI smoke;
- audio interaction evidence;
- authenticated first-completion evidence;
- accessibility/reduced-motion result.

Then update `docs/qa/DAY002_RUNTIME_QA_V1.md` and Issue #13.
