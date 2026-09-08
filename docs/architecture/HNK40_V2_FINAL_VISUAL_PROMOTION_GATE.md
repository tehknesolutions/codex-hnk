# HNK40 V2 — Final Visual Promotion Gate

State: `READY_FOR_FINAL_HUMAN_PROMOTION`

The Candidate D vector set completed Visual Freeze Pass 1 with 40/40 glyphs frozen as candidates.

## Evidence required by this gate

- [x] G01–G40 structural IDs stable
- [x] IPA bindings unchanged
- [x] 40/40 vector glyphs present
- [x] pairwise confusion: 0 high-risk pairs
- [x] pairwise confusion: 0 medium-risk pairs
- [x] maximum measured similarity: 0.549
- [x] 16 px machine legibility/uniqueness PASS
- [x] 24 px machine legibility/uniqueness PASS
- [x] 32 px machine legibility/uniqueness PASS
- [x] 48 px machine legibility/uniqueness PASS
- [x] exact candidate sprite SHA-256 recorded
- [x] ordered G01–G40 set SHA-256 recorded
- [x] no PUA/Unicode assigned prematurely
- [x] no legacy-recovery claim
- [ ] explicit human promotion to `VISUAL-CANON-V2`

## Frozen integrity

Sprite SHA-256:
`87ee43f3785165397752a21eaceffcda8b3240748125062ca275bf8d46234ca4`

Ordered set SHA-256:
`78668df0f707952b7c280de52526abaa2b7900597fb8ff362a3a08641fd1bce5`

## Promotion effect

When explicitly approved, the exact frozen hashes become `VISUAL-CANON-V2`. Only after that promotion should the project allocate a PUA range, generate the HNK40 font cmap, bind Web/Expo renderers, and replace Gxx fallback sequences in the Master Lexicon with actual visual glyph rendering.
