# HNK Asset Registry V1

This document records the implemented database contract behind `HNK_ASSET_MANIFEST.md`.

## Scopes

Supported scopes:

- `global`
- `day`
- `chapter`
- `sephira`
- `cycle`
- `oracle`

`scope_id` identifies the concrete object within that scope, for example `kether`, `vehuiah`, `attribute:HIP`, or `036`.

## Lifecycle

Planning and production states:

`planned` → `generated` / `draft` → `review` → `approved` → `published`

Terminal/alternate states:

- `rejected`
- `retired`
- `archived`

Only `published` is eligible for the final user-facing production experience.

## Provenance and approval

The registry carries:

- `asset_version`
- `source_tool`
- `model_version`
- prompt and `prompt_ref`
- negative prompt
- reference assets
- seed when available
- SHA-256 checksum
- license
- approver and approval timestamp
- publication timestamp
- provider/editor metadata through `metadata`

## Kether Asset Set V1 baseline

The first production queue contains **101 planned assets**:

- 15 foundational Kether/global assets;
- 14 reusable cycle assets (emblem + background for Vehuiah, Jeliel, Sitael, Elemiah, Mahasiah, Lelahel and Achaiah);
- 72 mandatory daily assets: one thumbnail and one QR/deep-link asset for each day 1–36.

Heroes and exercise/ritual diagrams are intentionally not bulk-created. They are added only after canonical content review determines that they improve comprehension or experience.

No seeded asset is considered generated, approved or published merely because a registry row exists.

## Kether Canonical Reference Sync V1

Canonical source baseline:

`Tehkne-Solutions/hnk-codex-365@2823aa55e6ddaaa2e9550a3268eff25b81e1bfa8`

The following reference identities are now approved by canon and are seeded idempotently by `supabase/seeds/kether_canonical_references_v1.sql`:

| Reference | Registry key | State | SHA-256 / boundary |
|---|---|---|---|
| Dai Koo Myo Usui HNK V1 | `oracle-dai-ko-myo-usui-hnk-master-v1` | `approved` | `25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0` |
| Gneo Geo V1 | `hnk.gneo_geo.v1.master` | `approved` | `2547d18241651980ed1668408b189ecfd1eb28acb400cdf6c1d96e7514d90436` |
| Kether Sigil V1 | `hnk.kether.sigil.v1.master` | `approved` | `7792ad999497f502d29c4377d3497c02241421701e5762ed247c5351fb24320a` |
| Sintonizador Angelical Kether V1 | `hnk.tuner.kether.v1` | `approved` | controller contract; not an entity detector |
| Kether→Chokmah Transition V1 | `hnk.audio.kether_chokmah.transition.v1` | `review` | master SHA `5289f4b32bb1c1094b16471e262c8abb1886d7d77e595efc2605869a316a8168`; listening QA pending |

### Important lifecycle boundary

`approved` means the canonical identity/topology/contract is approved. It does **not** mean the asset has been placed in production storage.

For Gneo Geo, Dai Koo Myo and the Kether Sigil, `storage_path` remains null until product publication copies the approved bytes to managed storage. They must not be promoted to `published` merely because the canonical repository contains a master.

The transition audio remains `review` even though its recipe is canonically approved and a lossless master has been rendered/checksummed. It can reach `published` only after human listening QA and managed-storage publication.

Current product resolution details live in `docs/experience/kether/HNK_KETHER_CANONICAL_REFERENCE_SYNC_V1.md`.
