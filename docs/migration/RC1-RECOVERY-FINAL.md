# RC1 Recovery — Final Audit

Date: 2026-09-07
Status: RECOVERY EXHAUSTED / SOURCE NOT RECOVERED
Target branch: `migration/m90-unified-v2`

## Objective

Recover the previously recorded snapshot `HNK_M90_TRIADE_I_FINAL_RC1`, described in prior project audit as the M90 / Atziluth baseline containing Kether + Chokmah + Binah, 109/109 folios and 21/21 cycles.

Recorded SHA-256 of the missing ZIP:

`278fef245d7c0866174823feb2a766db12b49753cc8b064ef6c1872fc21bd7a5`

This checksum is an identity constraint only. It is not proof that the ZIP is currently available.

## Sources checked

### Current project/File Library

Searched for:
- `HNK_M90_TRIADE_I_FINAL_RC1`
- `RC1`
- `M90`
- `109/109`
- `Portal 109`
- `21/21 ciclos`
- the recorded SHA-256

No complete RC1 archive was recovered.

Advanced surviving artifacts were found, including `portal-036.html` and `KETHER-LITERARY-QA-QUEUE.md`. These prove that later Kether production existed outside the public editorial main, but they do not contain the full 109-folio snapshot.

### Public editorial repository

Repository: `Tehkne-Solutions/hnk-codex-365`
Frozen commit: `4a5a88cc014308d3d2e27b581dd26be70b9d7cf4`

Verified state:
- Kether: 36/36
- Chokmah: 3/37 (Days 037–039)
- Binah: 0/36
- total canon in public main: 39/109 for the M90 target

Branch searches found Day 037–039 work only; no M90/Binah recovery branch was found.

No GitHub Release or tag contains the RC1.

### Public platform repository

Repository: `Tehkne-Solutions/codex-hnk-app`
Frozen commit: `4b63e2916ca2b0c9f654718d27e344851f9718d1`

The repository preserves the product foundation and Kether vertical-slice work, but no M90/RC1 branch, release or tag with the 109-folio corpus was found.

### New destination repository

Repository: `tehknesolutions/codex-hnk`

The old branches `migration/m90-triade-i-rc1` and `migration/m90-triade-i-rc1-clean` contain incomplete Base64/probe staging only and are explicitly invalid as release baselines.

## Decision

The recorded RC1 remains historical evidence, not a recoverable source artifact in the currently accessible stores.

Therefore the project moves from **recovery mode** to **controlled reconstruction mode**.

Rules:
1. never downgrade the historical 109/109 record to the public 39-day state;
2. never claim the missing RC1 as currently verified;
3. preserve all recovered public sources by frozen commit SHA;
4. reconstruct Kether → Chokmah → Binah using the canonical plans, recovered artifacts and product contracts;
5. every reconstructed day must pass the current editorial/product gates before promotion;
6. if the original ZIP later reappears, compare it against this reconstruction using the recorded SHA-256 and per-file provenance before reconciliation.

## Exit condition

RC1 Recovery is closed as `NOT RECOVERED` for this migration pass. It must not block production any longer.

Next gate: `KETHER FOUNDATION FREEZE`.
