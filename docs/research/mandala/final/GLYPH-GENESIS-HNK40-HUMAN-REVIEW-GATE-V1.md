# HNK40 Glyph Genesis — Human Review Gate V1.1

Status: **HNK_CANDIDATE / HUMAN REVIEW REQUIRED**

This gate reviews the 40 deterministic structural seeds generated from the frozen Mandala MF topology. Passing this review does **not** promote language, semantics or glyph identity automatically.

## Computational preconditions

The executable validator must establish:

- 40/40 ordered PATHs unique
- 40/40 angular-translation-normalized shape signatures unique
- 9 MF nodes and 8 legal edges per seed
- typed 14-bit MF tuple round-trip
- Pixel/IsoPixel/Voxel derivability
- HNKP1 packet round-trip
- CRC32 / HEX / base64url vector integrity

GitHub Actions infrastructure failure without executed steps is not a candidate rejection.

## Matrix

- **W1:** G01(0000) · G02(0001) · G03(0010) · G04(0011) · G05(0100) · G06(0101) · G07(0110) · G08(0111) · G09(1000) · G10(1001)
- **W2:** G11(0000) · G12(0001) · G13(0010) · G14(0011) · G15(0100) · G16(0101) · G17(0110) · G18(0111) · G19(1000) · G20(1001)
- **W3:** G21(0000) · G22(0001) · G23(0010) · G24(0011) · G25(0100) · G26(0101) · G27(0110) · G28(0111) · G29(1000) · G30(1001)
- **W4:** G31(0000) · G32(0001) · G33(0010) · G34(0011) · G35(0100) · G36(0101) · G37(0110) · G38(0111) · G39(1000) · G40(1001)

The 4-bit value is **column code only**. It is not semantic, phonological, mystical or I-Ching meaning.

## Human review dimensions

For every candidate G01..G40, record:

1. **Distinctness** — recognizably different from the other 39 when isolated from Mandala position.
2. **Confusability** — identify pairs that could be mistaken at small size or fast reading.
3. **Stroke economy** — path complexity is justified; no unnecessary oscillation or accidental self-cancellation.
4. **Balance** — usable as a standalone glyph without relying on decorative rendering.
5. **Directional stability** — remains recognizable in Pixel, IsoPixel and Mandala projections.
6. **Scale robustness** — survives coarse rasterization and future font construction.
7. **HNK-KODE compatibility** — only after structural review, compare with the existing G-ID/phoneme authority in HNK-KODE.
8. **Promotion decision** — KEEP, REVISE, REJECT or HOLD. No automatic FROZEN/CANON promotion.

## Prohibited shortcuts

- Do not approve a seed because its packet is valid.
- Do not assign meaning because a shape “looks like” a concept.
- Do not infer sacred correspondence from binary/sector coincidence.
- Do not replace the ordered PATH with an SVG, PNG, font outline or screenshot as identity.
- Do not migrate linguistic authority back from HNK-KODE into CODEX-HNK.

## Gate output

A future review artifact must produce one explicit decision per G-ID and preserve rejected/revised candidate provenance.

Current registry:
`glyph-genesis-hnk40-candidates.v1.json`

Current seed law:
`glyph-genesis-hnk40-seed-family.v1.json`

Transport:
`HNKP1-MF-TUPLE-BE`
