# HNK CHOKMAH — HAZIEL BATCH V1

**Status:** EDITORIAL DRAFT BATCH / NOT CANON  
**Cycle:** Haziel — Days 042–046  
**Source authority:** `capitulo_2_plano_escrita.md`  
**Source plan SHA-256:** `49917dc66e8401d17d3af362d2370bf532e7388145b6d481bae18d48e95cac59`  
**Editorial protocol:** HNK-EP-1.1 / `137 + 72 + 26` × 3 = **705 structural words per Day**

> These files are staged in `codex-hnk` because the current GitHub integration cannot create a branch in the older `Tehkne-Solutions/hnk-codex-365` repository (HTTP 403). They must not be treated as canonical `codex_days` source until explicitly promoted to the canonical repository and synced by immutable commit SHA.

## 1. Batch inventory

| Day | Plan title | XP | Git blob SHA | State |
|---:|---|---:|---|---|
| 042 | Estimulação Cortical Frontal | 100 | `d84bf2ab43506b34eb0761c243653fece4c8dab5` | draft |
| 043 | A Visão Astral da Pérola Azul | 150 | `6efe79cf784b997260060122377e58c816c1765c` | draft |
| 044 | Roteirização de Truísmos | 150 | `0b70a0bec9ba394bdfae5be847f131b503b61ff2` | draft |
| 045 | Sintonizador Digital de Kether-Chokmah | 100 | `75abeaeea7caae03c2e8e4e745379e21c61d09d9` | draft / audio blocker |
| 046 | Leitura da Aura Vegetal | 150 | `36b454419ebde83c789a51579331928f4f544208` | draft |

## 2. Epistemic adaptations locked in the drafts

The source plan terminology is preserved, while HNK-EP-1.1 keeps source claims in their proper layer:

- **Day 042:** Ajna/Terceiro Olho is traditional language; Brodmann 10 is a reference named by the plan, not a measured cortical effect. The draft does not claim that forehead massage selectively activates Brodmann 10.
- **Day 043:** Blue Pearl remains the named traditional operator. Deliberate imagery, spontaneous light, afterimage/noise and interpretation remain distinguishable. Brightness does not prove clairvoyance.
- **Day 044:** Milton truisms remain the planned technique, but every suggestion is voluntary, rejectable and auditable. A truism cannot be used to smuggle in an unsupported conclusion.
- **Day 045:** 12 Hz remains the planned binaural-difference target. Playback is not neural measurement. Production is blocked until carriers, control, loudness, provenance and checksums are approved.
- **Day 046:** plant aura language remains in the traditional layer. The draft adds an inert-object comparison and alternative environmental explanations; sensation is not automatic proof of an external etheric field.

## 3. Product boundary

Current Chokmah product truth:

```text
037–039  CANON → runtime executable
040–041  DRAFT → editorial gate, no Practice Session / XP
042–046  DRAFT → editorial gate, no Practice Session / XP
```

No Haziel runtime should call `startPracticeSession` or `complete_codex_day` until the corresponding Day has been promoted to canonical source and synchronized into `codex_days` with `status='canon'`.

## 4. Known blocker

- GitHub issue **#10** — approve/version Haziel Day 045 binaural ACTIVE/CONTROL preset.

This blocker does not prevent editorial review of Day 045, but it prevents a production-completable audio runtime.

## 5. Promotion checklist

For every Day 042–046:

1. review wording against the Chokmah source plan;
2. run `pnpm validate:editorial`;
3. confirm nine counted blocks remain exactly `137/72/26 × 3`;
4. preserve `HNK-EP-1.1` framing;
5. promote the reviewed text into `Tehkne-Solutions/hnk-codex-365/canon/capitulo-02-chokmah/` only when write access is restored;
6. change `status: draft` to `status: canon` only in the canonical promotion commit;
7. record the canonical source commit SHA;
8. sync via `sync_atziluth_codex_range(...)` using that immutable source commit SHA;
9. only then create/enable the production Day runtime.

## 6. Next editorial batch

`Aladiah 047–051` is next. Its source scope is already present in the frozen Chokmah plan; it remains unwritten in public canon and must therefore enter the same draft → review → canon → immutable sync → runtime pipeline.
