# Kether Foundation Freeze — Candidate

Date: 2026-09-07
Branch: `migration/m90-unified-v2`
Status: **FOUNDATION FREEZE CANDIDATE / NOT A RELEASE**

## Meaning of this gate

This freeze locks the architecture used to produce Kether Days 001–036 at scale. It does **not** claim that all 36 user-facing experiences are implemented, that CI is green, or that Kether RC is releasable.

After this gate, new Kether Days should be produced by extending the frozen runtime/contracts instead of redefining progression, XP, Vault, Crown or Portal semantics per screen.

## Frozen product invariants

- Canonical editorial content comes from synchronized `codex_days` with source path/SHA provenance.
- First completion is sequential.
- A Practice Session is not a Day Completion.
- Structured evidence is separate from private prose.
- Private prose goes through the client-encrypted Vault boundary.
- XP comes from canonical Day metadata and is awarded only by `complete_codex_day(...)`.
- Revisit creates another Practice Session but awards zero canonical XP.
- Crown state is derived from canonical Day Completions.
- Seven Kether fragments map to 001–005, 006–010, 011–015, 016–020, 021–025, 026–030 and 031–035.
- 35/35 unlocks Portal 036 but does not promote the user.
- Day 036 requires structural Portal evidence and a Day 036 encrypted Vault entry.
- Only a valid server-confirmed Day 036 completion promotes `Neófito → Iniciado`, awards the canonical +500 XP once and unlocks Chokmah.
- Day 037 is not auto-started.
- Offline/local completion is never equivalent to server-confirmed canonical completion.
- Offline Portal completion remains `PROMOTION_PENDING_SYNC` until server confirmation.

## Foundation restored / present

### Workspace

- Node 22 / pnpm / Turborepo root contracts.
- Expo/React Native mobile application.
- Next.js web application.
- shared packages (`database`, `supabase-client`, `ui`, Vault interop and supporting packages).
- restored mobile `app.json` and `tsconfig.json`.

### Day runtime

A new cross-platform pure TypeScript package now exists at `packages/day-runtime`.

It owns:

- Day gate evaluation;
- runtime state machine;
- first-completion vs revisit semantics;
- structured evidence validation;
- explicit local-pending vs canonical-complete distinction;
- application of authoritative server completion results;
- Kether cycle map and Crown derivation.

It deliberately does **not** derive canonical XP or Initiatory Grade locally.

### Mobile journey

- Vehuiah 001–005 remains on the recovered vertical-slice implementation.
- Mobile entry now routes by server `current_day` through `KetherJourney`.
- Jeliel Cycle II has a server-driven 006–010 rail.
- Day 006 is the first production Day using the shared Day Runtime.
- Day 006 loads canonical body from synchronized `codex_days`, performs timed practice, tracks non-sensitive evidence, encrypts private reflection locally and seals through the canonical backend RPC.
- Days 007–010 currently have runtime contracts but are not yet claimed as completed UI implementations.

### Backend

Restored Supabase foundation includes:

- initial schema and RLS;
- Practice Sessions;
- server-authoritative Day Completion;
- XP idempotency/atomicity;
- Kether Crown state;
- Portal 036 evidence enforcement;
- Vault ciphertext model and recovery envelopes;
- canonical sync tooling;
- asset registry and Kether reference registry.

### QA

Restored/created:

- Kether Acceptance & QA Matrix;
- P0 DB/RLS/RPC executable contract;
- P0 Portal 036 E2E executable contract;
- P0 offline/sync/multi-device executable contract;
- pgTAP Kether suite;
- true-concurrency shell proof;
- privilege barriers;
- offline reconciliation proof;
- shared Day Runtime unit tests.

### CI

`.github/workflows/foundation.yml` is restored and ready to run:

- architecture validation;
- UI validation;
- Day 001 validation;
- Experience QA;
- audio/reference/board checks;
- Vault checks;
- TypeScript typecheck;
- tests;
- builds;
- local Supabase P0 suite;
- real completion concurrency proof.

## Provenance note — Vehuiah runtime

Original public platform source:

- path: `apps/mobile/src/features/kether/VehuiahDayExperience.tsx`
- source commit: `4b63e2916ca2b0c9f654718d27e344851f9718d1`
- source blob SHA: `95bcb8b04383270ee80418652c017caa65a59362`
- source size: `47,508` bytes

Current migration branch:

- target blob SHA: `6fdf87a24b749def9119973a37e2eabb7413dc52`
- target size: `47,507` bytes

The recovered text is semantically identical; the one-byte difference is the final end-of-file line terminator omitted during recovery. This is classified as **EOL-only normalization**, not product or canonical drift. The original source SHA remains recorded for provenance.

## External release blocker — GitHub Actions runner allocation

Latest smoke evidence for run `34146399206`, attempt 2:

- job created and completed as failure;
- requested label: `ubuntu-latest`;
- `steps = []`;
- `runner_id = 0`;
- `runner_name = ""`;
- `runner_group_id = 0`.

Therefore the workflow is failing before the first workflow step executes. The current evidence does not identify the exact GitHub account/repository setting responsible, so no narrower cause is asserted here.

**Consequence:** CI remains a release blocker, but is not a reason to stop product reconstruction on the migration branch.

## Freeze decision

Architecture status: **FROZEN FOR PRODUCTION**.

Release status: **NOT GREEN / NOT MERGEABLE TO MAIN YET**.

Allowed after this gate:

- implement Days 007–035 through the shared runtime;
- implement Portal 036 UI against the frozen backend contract;
- add reusable cycle-specific components;
- add tests and approved assets/audio/references;
- repair defects while preserving the frozen invariants.

Requires explicit contract migration/version change:

- changing XP authority;
- making grade client-authoritative;
- changing Crown fragment ranges;
- changing Portal 036 promotion semantics;
- storing private journal prose in operational evidence;
- treating local/offline completion as canonical completion;
- bypassing server sequential progression.

## Exit to Kether Product

This candidate is sufficient to move production into:

`KETHER 001–036 PRODUCT`

Current production frontier:

`001–005 recovered vertical slice → 006 shared-runtime implementation → 007–010 next → 011–035 → Portal 036`

Final Kether Release remains gated by the full Acceptance & QA Matrix and green CI.
