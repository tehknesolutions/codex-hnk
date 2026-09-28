# Changelog

GitHub is the primary persistent source for CODEX-HNK. Local worktrees are disposable execution environments.

## [Unreleased]

### Added — 2026-09-28 — HNK40 → E5 Hybrid Projection V1
- Added Draft 2020-12 hybrid projection schema.
- Added deterministic V4 structural projection generator.
- Added integrity/non-mutation tests and deterministic artifact materialization.
- Added HNK-KODESCRIPT acquisition export preserving ambiguity.
- Materialized 40 records: 4 DIRECT, 34 DERIVED_UNIQUE, 2 DERIVED_AMBIGUOUS (G17/G20).
- Added formal gate-result documentation.
- Mirrored `HNK-2647892 Mathematical Kernel` and machine-readable manifest from HNK-KODE for cross-repo provenance.
- Specific HNK40/E5 suite verified at 14/14 PASS.

### Repository policy
- Persistent work must be committed and pushed before being treated as durable.
- Specs, datasets, generated research artifacts, tests and provenance belong in GitHub.
- Cross-repository HNK-KODE mirrors retain source commit provenance.

### Repository hardening status
- `pnpm-lock.yaml` is now committed remotely in `research/hnk40-e5-hybrid-v1`.
- Local disk exhaustion remains only an executor limitation; it is no longer a persistence blocker.
- HNK40/E5 specific verification remains 14/14 PASS; global monorepo dependency materialization is not required for recovering the project from GitHub.
