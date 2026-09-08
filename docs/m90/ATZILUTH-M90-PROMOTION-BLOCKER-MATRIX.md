# Atziluth M90 — Promotion Blocker Matrix

Status: **ACTIVE / RELEASE-GATING**

This matrix separates editorial coverage from canonical promotion and runtime release. A row marked `OPEN` blocks promotion or release for the affected Day; it does not invalidate the staged 705-word editorial draft.

| Scope | Day(s) | Blocker | Type | Status | Promotion impact |
|---|---:|---|---|---|---|
| Kether | 019 | Acoustic Lab device/CI proof | hardware/QA | OPEN | release proof |
| Kether | 025 | native AR device/CI proof | hardware/QA | OPEN | release proof |
| Kether | 028 | Gneo Geo canonical geometry/reference | reference | OPEN | canon/runtime |
| Kether | 030 | approved ASMR/control pair | audio | OPEN | canon/runtime |
| Kether | 036 | Sintonizador/Solfeggio/sigil operators | reference/audio | OPEN | Portal runtime |
| Chokmah | 040–073 | canonical successor promotion | governance | OPEN | canon/runtime |
| Chokmah | 045 | 12 Hz context requires approved carrier/preset semantics | audio | OPEN | canon/runtime |
| Chokmah | 066 | Gneo Geo canonical geometry/reference | reference | OPEN | canon/runtime |
| Chokmah | 070 | Pantáculo Tetragrammaton production provenance | reference | OPEN | canon/runtime |
| Chokmah | 073 | transition operators/references | reference/audio | OPEN | Portal runtime |
| Binah | 074–109 | canonical successor promotion | governance | OPEN | canon/runtime |
| Binah | 079 | Thurisaz exact asset/orientation | reference | OPEN | canon/runtime |
| Binah | 083 | physical-circle product safety disposition | safety | OPEN | canon/runtime |
| Binah | 105 | 22-petal Rose/Hermetic Cross exact reference | reference | OPEN | canon/runtime |
| Binah | 107 | Saturn binaural/planetary audio preset | audio | OPEN | canon/runtime |
| Binah | 109 | Sintonizador + Saturn→Jupiter transition + no-fire closure | reference/audio/safety | OPEN | Portal runtime |
| Global | 001–109 | GitHub Actions runner allocation / CI green | CI | OPEN | release/tag |

## Invariants

- No row may be closed by guessing a numeric frequency, sigil variant, geometry, orientation, carrier pair or ritual asset.
- `status: draft` content cannot award canonical XP.
- Canon promotion requires the workflow in `docs/editorial/HNK_CANONICAL_SUCCESSOR_PROMOTION_V1.md`.
- Hardware/CI proof may block release even when editorial/canonical content is valid.
- Portal promotion remains server-side, sequential and idempotent.

## Current editorial milestone

- Kether: 001–036 represented.
- Chokmah: 037–073 represented; 037–039 recovered canon, 040–073 draft.
- Binah: 074–109 represented; all current files draft.
- Atziluth: **109/109 editorial coverage**, not 109/109 canon.
