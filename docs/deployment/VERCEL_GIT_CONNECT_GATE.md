# VERCEL_GIT_CONNECT_GATE

Status: `PENDING_MANUAL_VERCEL_GIT_CONNECT`

## Target

Existing Vercel project:
- Team: `thales-dvfs-projects`
- Project: `codex-hnk-app`
- Project ID: `prj_mYZ4jhXE4nxDDrRziPraWKL7J1Aq`
- Production domain: `codex-hnk-app.vercel.app`

Canonical Git source:
- Provider: GitHub
- Repository: `tehknesolutions/codex-hnk`
- Production branch: `main`
- Root Directory: `apps/web`
- Framework: Next.js

## Required manual mutation

The currently available Vercel connector can inspect projects/deployments and deploy files, but it does not expose the project Git-connect mutation (`vercel git connect` / project Git repository write). Therefore the following mutation must be performed once in the Vercel dashboard or authenticated Vercel CLI:

1. Open `https://vercel.com/thales-dvfs-projects/codex-hnk-app/settings/git`.
2. Connect Git Repository.
3. Choose GitHub repository `tehknesolutions/codex-hnk`.
4. Set Production Branch to `main`.
5. In Build and Deployment, set Root Directory to `apps/web`.
6. Keep the existing project/domain; do not create a second Vercel project.

Equivalent authenticated CLI flow from a clone of the repository linked to the existing project:

```bash
vercel link --project codex-hnk-app --scope thales-dvfs-projects
vercel git connect
```

## Acceptance criteria

The gate is closed only after all conditions are observed:

- Vercel project reports a GitHub link to `tehknesolutions/codex-hnk`.
- Root Directory is `apps/web`.
- Production Branch is `main`.
- A new commit pushed to `main` automatically creates a Vercel production deployment.
- The deployment metadata identifies the Git commit/repository.
- `https://codex-hnk-app.vercel.app` resolves to the resulting production deployment.

## Evidence before connection

At creation of this gate, `codex-hnk-app` reported no Git link and a new documentation commit in `tehknesolutions/codex-hnk` did not create a Vercel deployment. This confirms auto-deploy is not yet wired.
