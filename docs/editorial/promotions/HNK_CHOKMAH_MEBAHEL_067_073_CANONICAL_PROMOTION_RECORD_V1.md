# HNK Chokmah — Mebahel 067–073 Canonical Promotion Record V1

Status: **067–069 + 071–072 CANON + IMMUTABLE SYNC / 070 G4 BLOCKED / 073 G4 BLOCKED / G7 SEQUENCE-BLOCKED BY DAY 045**  
Scope: Chokmah · Atziluth · Mebahel + Portal · Days 067–073  
Source plan SHA-256: `49917dc66e8401d17d3af362d2370bf532e7388145b6d481bae18d48e95cac59`

## Promotion chain

| Day | Candidate blob | Canonical blob | XP | G5 | G6 | G7 |
|---:|---|---|---:|---|---|---|
| 067 | `e065a004f7b6551eaa876d5ae102786c97243b10` | `1fe06968c724f74311e4fd567075fabc181f1125` | 200 | PASS | PASS | BLOCKED BY 045 |
| 068 | `ba346da3ba83f8f59aba509103b261276c904f21` | `176ebffccc845a909f5d1d2bdb88181b94809afb` | 200 | PASS | PASS | BLOCKED BY 045 |
| 069 | `e5ad4123b4d14a36b22d4b445b2442b3605008ed` | `5ec5e7ade94e1a20c348028d75517475a6920e5a` | 150 | PASS | PASS | BLOCKED BY 045 |
| 070 | `83311fda66f8cf81f9c8f91998bf333778c9b9cc` | — | — | **BLOCKED #18** | BLOCKED | BLOCKED |
| 071 | `1b12d433834a82ad339c15998339e6e0c68732d6` | `6dfa6b5768bd7cdc2812d5dbfc68a8bc66ad90c3` | 250 | PASS | PASS | BLOCKED BY 045 |
| 072 | `b0538a77c0a2194185f9b3c7164574eeeb6ce725` | `44c11fee26aef72ebb686ab5f8fd8f27f1239cb2` | 300 | PASS | PASS | BLOCKED BY 045 |
| 073 | `8d0109fb6c6b3bda852d9a02c18de099dd65bad9` | — | — | **BLOCKED #19** | BLOCKED | BLOCKED |

Immutable successor commit used for DB sync: `19da2e2d4e3a636cfef21b15c6c5928967e8268a`.

## Integrity and provenance

Days 067–069, 071 and 072 preserve the reviewed editorial body. Promotion changed only canonical metadata/provenance. Supabase verification confirmed exact Git blob SHAs and successor provenance for all five rows.

The G6 sync was deliberately split into two immutable ranges to skip Day 070:

- 067–069 → 3 imported days, status `success`;
- 071–072 → 2 imported days, status `success`.

Both runs reference the same immutable commit `19da2e2d4e3a636cfef21b15c6c5928967e8268a`.

## Negative audit of blockers

The canonical tree and `public.codex_days` intentionally exclude:

- Day 066 — blocker #3, Gneo Geo / Cockpit Astral reference not approved;
- Day 070 — blocker #18, Pantáculo Tetragrammaton provenance not approved;
- Day 073 — blocker #19, Sintonizador/Portal reference not approved.

No substitute geometry, asset, carrier, circuit or reference was invented to bypass G4.

## G4 blocker — Day 070

Day 070 depends on the approved Pantáculo Tetragrammaton visual/provenance package. Until issue #18 is resolved, the Day remains outside `content/canon` and outside `codex_days`.

## G4 blocker — Day 073

Day 073 depends on the approved Portal/Sintonizador reference package. Until issue #19 is resolved, the Day remains outside `content/canon` and outside `codex_days`.

## Import-run provenance correction

During post-sync audit, `codex_import_runs.source_repo` was found inheriting the historical default `Tehkne-Solutions/hnk-codex-365`, even though `codex_days` correctly stored successor provenance. The canonical content and blob SHAs were unaffected.

Supabase migration `20260909013809_fix_atziluth_import_run_source_repo` corrected both existing successor import runs and changed `hnk_private.sync_atziluth_codex_range` to write `source_repo = v_repo` explicitly for future imports. Verification now returns `tehknesolutions/codex-hnk` for both runs.

## Runtime disposition

The largest Day currently stored as successor canon is **072**. The continuous first-completion frontier remains **044** because Day 045 is still blocked by issue #10: the source defines a 12 Hz binaural difference but no approved carrier/base pair. Server-authoritative sequencing must continue preventing later canonical Days from granting first-completion XP out of order.

## Release boundary

G8 remains pending; no Gold claim.

## Next action

Chokmah G5/G6 frontier is closed at the maximum safely promotable state with current evidence. Move the editorial promotion front to **Binah 074–109**, retaining 045, 066, 070 and 073 as explicit blockers and without changing the executable frontier until Day 045 is resolved.
