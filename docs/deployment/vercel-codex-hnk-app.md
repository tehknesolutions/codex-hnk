# Vercel — codex-hnk-app

## Canonical linkage

- Git repository: `tehknesolutions/codex-hnk`
- Vercel team: `thales-dvfs-projects`
- Vercel team ID: `team_GAFmMllTKaWx5iGEa8sTZJ0T`
- Vercel project: `codex-hnk-app`
- Vercel project ID: `prj_mYZ4jhXE4nxDDrRziPraWKL7J1Aq`
- Production domain: `codex-hnk-app.vercel.app`
- Production branch: `main`
- Monorepo root: repository root
- Vercel Root Directory: `apps/web`
- Framework: Next.js
- Package manager: pnpm

## Required Git integration state

The existing Vercel project `codex-hnk-app` must be connected to the existing GitHub repository `tehknesolutions/codex-hnk`.

Expected behavior after connection:

1. pushes to `main` create production deployments;
2. non-production branches / pull requests create Preview deployments according to Vercel Git defaults;
3. Vercel builds the Next.js application from `apps/web` while retaining access to workspace packages under `packages/*`;
4. the production alias remains `codex-hnk-app.vercel.app`;
5. no second Vercel project should be created for this linkage.

## Dashboard values

When connecting through Vercel Project Settings → Git:

- Provider: GitHub
- Repository: `tehknesolutions/codex-hnk`
- Production Branch: `main`

Under Project Settings → Build and Deployment:

- Root Directory: `apps/web`
- Framework Preset: Next.js

Do not point Root Directory to the repository root as if it were a single Next.js app; the repository is a pnpm monorepo and the deployable frontend lives in `apps/web`.

## Current known state at creation of this record

The Vercel connector reported the existing project with `link: null`; therefore Git auto-deploy was not yet formally connected. The latest inspected deployment was READY, but was not a Git-linked deployment.

This file is a deployment-governance record only. It does not contain Vercel credentials or secrets.
