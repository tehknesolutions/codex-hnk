# HNK Chokmah Promotion Candidate V1 — Days 040–041

Status: **EDITORIAL REVIEW PASS / PROMOTION CANDIDATE / NOT CANON**

Scope: Chokmah · Atziluth · Cahetel · Days 040–041  
Source plan: `capitulo_2_plano_escrita.md`  
Source plan SHA-256: `49917dc66e8401d17d3af362d2370bf532e7388145b6d481bae18d48e95cac59`

## Why this exists

The historical editorial source is still readable but not writable through the current integration. The successor-governance contract therefore requires an explicit review stage before any Day moves from staging into a canonical root.

The candidate copies under `content/promotion-candidates/atziluth/chokmah/` are intentionally byte-identical to the staging files and therefore still contain `status: draft`. Their presence **does not** grant XP, create Practice Session completion or establish canon.

## Source reconciliation

### Day 040 — A Auto-Indução Ocular Básica

Source-plan anchors:
- wall/clear visual field;
- imagined micro-point;
- Milton-model truisms;
- eyelid relaxation / perceived heaviness;
- +150 XP.

Review disposition: **PASS WITH HNK-EP PRODUCT EXTENSIONS**.

The draft preserves the planned ocular auto-induction, micro-point, truisms, eyelid relaxation/heaviness and +150 XP. It adds explicit reversibility, normal blinking, stop conditions, a silent comparison condition and a prohibition on treating eye heaviness as involuntary control or neurological proof. These are HNK-EP safety/method extensions, not replacements for the planned practice.

Staging Git blob: `eb9fdd0f91fc69e2a2a76086c78c6dcc93cee001`.

### Day 041 — A Captura da Intuição Zoe

Source-plan anchors:
- formulate a complex spiritual-life question;
- enter trance;
- allow an immediate image or bodily sensation without immediate rational translation;
- journal the result;
- +150 XP.

Review disposition: **PASS WITH HNK-EP PRODUCT EXTENSIONS**.

The draft preserves the spiritual question, trance/receptive interval, image/sensation-first capture, delayed interpretation, journal/Vault direction and +150 XP. It adds non-urgent-question language, alternative explanations, verification before consequential action and an open-reception comparison condition. These are epistemic/safety extensions and do not convert internal experience into automatic revelation.

Staging Git blob: `6ed522a0929d8c613bd6ad46ea55726df9ae93d9`.

## Promotion gates

| Gate | 040 | 041 | Note |
|---|---|---|---|
| G1 structure / HNK-EP / 705 | PASS | PASS | protected by `validate-editorial-drafts.mjs` |
| G2 source fidelity | PASS | PASS | source anchors reconciled above |
| G3 epistemic / safety / privacy | PASS | PASS | reversibility, delayed interpretation and Vault boundaries retained |
| G4 reference provenance | N/A | N/A | no unresolved ritual asset/audio reference identified in these two Days |
| G5 canonical immutable commit | PENDING | PENDING | candidate only; no canonical copy yet |
| G6 database sync | PENDING | PENDING | prohibited before G5 |
| G7 runtime enablement | PENDING | PENDING | prohibited before canonical sync |
| G8 release evidence | PENDING | PENDING | CI/device QA remains separate |

## Candidate integrity rule

Candidate paths must reference the **same Git blobs** as staging:

- Day 040 candidate blob = `eb9fdd0f91fc69e2a2a76086c78c6dcc93cee001`;
- Day 041 candidate blob = `6ed522a0929d8c613bd6ad46ea55726df9ae93d9`.

Any content edit invalidates this review and requires a new candidate version.

## Next atomic action

Create the canonical successor copy only after promotion metadata is materialized. At that step the body must remain unchanged; only canonical metadata/provenance may change, the 705 counted blocks must remain exact, and the resulting canonical blob/commit must be recorded before immutable sync.
