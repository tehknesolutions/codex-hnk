# HNK40 Human Review Matrix V1.3

Status: **PENDING HUMAN REVIEW**

Preferred structural family: **V1.3 static-visible unique**.

Machine gates now prove 40 ordered PATHs, 40 edge signatures and **40 static-visible shapes**, with minimum edge distance 3. Priority remains review ordering only; it does not promote or reject a glyph.

## Priority counts

- CRITICAL: 4
- HIGH: 21
- MEDIUM: 8
- NORMAL: 7

## Orientation-risk finding

V1.3 contains **10 exact mirror/rotation-equivalent pairs**. These are distinct in canonical orientation, but they must be tested for mirror/rotation confusion. This is separate from static-visible collision, which is now zero.

| G-ID | World | Col | Priority | Nearest structural risk | Transform peer(s) | Decision |
|---|---:|---:|---|---|---|---|
| G01 | W1 | 1 | NORMAL | — | — | **PENDING** |
| G02 | W1 | 2 | HIGH | — | G06 [mx/my] | **PENDING** |
| G03 | W1 | 3 | HIGH | G08 (42) | G13 [r180/mx] | **PENDING** |
| G04 | W1 | 4 | NORMAL | — | — | **PENDING** |
| G05 | W1 | 5 | MEDIUM | G07 (42) | — | **PENDING** |
| G06 | W1 | 6 | HIGH | G08 (42) | G02 [mx/my] | **PENDING** |
| G07 | W1 | 7 | HIGH | G05 (42) | G10 [r180/mx] | **PENDING** |
| G08 | W1 | 8 | HIGH | G03 (42) | G09 [mx] | **PENDING** |
| G09 | W1 | 9 | HIGH | G07 (42) | G08 [mx] | **PENDING** |
| G10 | W1 | 10 | HIGH | G08 (42) | G07 [r180/mx] | **PENDING** |
| G11 | W2 | 1 | NORMAL | — | — | **PENDING** |
| G12 | W2 | 2 | CRITICAL | G19 (34) | — | **PENDING** |
| G13 | W2 | 3 | HIGH | G15 (44) | G03 [r180/mx] | **PENDING** |
| G14 | W2 | 4 | MEDIUM | G16 (44) | — | **PENDING** |
| G15 | W2 | 5 | MEDIUM | G12 (44) | — | **PENDING** |
| G16 | W2 | 6 | MEDIUM | G14 (44) | — | **PENDING** |
| G17 | W2 | 7 | HIGH | G19 (42) | G20 [mx] | **PENDING** |
| G18 | W2 | 8 | HIGH | G20 (42) | G19 [mx] | **PENDING** |
| G19 | W2 | 9 | CRITICAL | G12 (34) | G18 [mx] | **PENDING** |
| G20 | W2 | 10 | HIGH | G18 (42) | G17 [mx] | **PENDING** |
| G21 | W3 | 1 | NORMAL | — | — | **PENDING** |
| G22 | W3 | 2 | HIGH | G29 (38) | — | **PENDING** |
| G23 | W3 | 3 | MEDIUM | G26 (44) | — | **PENDING** |
| G24 | W3 | 4 | NORMAL | — | — | **PENDING** |
| G25 | W3 | 5 | MEDIUM | G22 (44) | — | **PENDING** |
| G26 | W3 | 6 | MEDIUM | G23 (44) | — | **PENDING** |
| G27 | W3 | 7 | HIGH | G29 (42) | G30 [mx] | **PENDING** |
| G28 | W3 | 8 | HIGH | G30 (42) | G29 [mx] | **PENDING** |
| G29 | W3 | 9 | HIGH | G22 (38) | G28 [mx] | **PENDING** |
| G30 | W3 | 10 | HIGH | G28 (42) | G27 [mx] | **PENDING** |
| G31 | W4 | 1 | NORMAL | — | — | **PENDING** |
| G32 | W4 | 2 | CRITICAL | G39 (34) | — | **PENDING** |
| G33 | W4 | 3 | MEDIUM | G38 (42) | — | **PENDING** |
| G34 | W4 | 4 | NORMAL | — | — | **PENDING** |
| G35 | W4 | 5 | HIGH | G37 (40) | — | **PENDING** |
| G36 | W4 | 6 | HIGH | G38 (40) | — | **PENDING** |
| G37 | W4 | 7 | HIGH | G35 (40) | G40 [mx] | **PENDING** |
| G38 | W4 | 8 | HIGH | G36 (40) | G39 [mx] | **PENDING** |
| G39 | W4 | 9 | CRITICAL | G32 (34) | G38 [mx] | **PENDING** |
| G40 | W4 | 10 | HIGH | — | G37 [mx] | **PENDING** |

## Gate rule

No KEEP / REVISE / REJECT / HOLD choice is automated. Human review must inspect distinctness, confusability, stroke economy, balance, projection stability, scale robustness and orientation robustness. HNK-KODE remains linguistic authority.
