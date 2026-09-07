# HNK CODEX · Tríade I · RC V2

Status: `READY_FOR_HUMAN_RELEASE_SIGNOFF_WITH_VISUAL_SMOKE_PENDING`

## Evidence boundary

- Kether 001–036: recovered executable evidence / validation 36/36. Full literary payload is not claimed as rehydrated in this RC preview.
- Chokmah 037–073: reconstructed from recovered source, validated V2.
- Binah 074–109: reconstructed from recovered source, validated V2.
- Original lost RC1 restored: **NO**.

## Technical gates

- structural coverage: `109/109`
- literary matrix: `76,845/76,845`
- Global QA V2: `PASS`
- exact duplicate segments after remediation: `0`
- renderer integration 037–109: `PASS`
- reconstructed crypto smoke: `PASS`
- deployment HTTP smoke: `8/8 PASS`
- build errors: `0`
- runtime errors observed: `0`
- browser/visual smoke: `NOT_RUN`
- human sign-off: `ABSENT`

Audit deployment: https://hnk-triad-i-rc-v2-audit.vercel.app

Critical routes use `/day/NNN`, including `/day/036`, `/day/072`, `/day/073`, and `/day/109`.

`main` and public runtime remain blocked until explicit release approval and the provenance boundary above is preserved.
