# HNK40 Human Review Matrix V1.2

Status: **PENDING HUMAN REVIEW**

Preferred structural family: **V1.2 Hamming-spaced**.

Machine priority is only review ordering. It is not a KEEP/REVISE/REJECT/HOLD decision and does not change HNK-KODE authority.

V1.2 improved the minimum pairwise edge-signature distance from **1 to 3**.

## Priority counts

- CRITICAL: 4
- HIGH: 4
- MEDIUM: 21
- NORMAL: 11

| G-ID | World | Col | Data | Hamming(7,4) | Priority | Nearest flagged pair(s) | Decision |
|---|---:|---:|---:|---:|---|---|---|
| G01 | W1 | 1 | 0000 | 0000000 | NORMAL | — | **PENDING** |
| G02 | W1 | 2 | 0001 | 1101001 | HIGH | G09 (38), G05 (42) | **PENDING** |
| G03 | W1 | 3 | 0010 | 0101010 | MEDIUM | G08 (42) | **PENDING** |
| G04 | W1 | 4 | 0011 | 1000011 | NORMAL | — | **PENDING** |
| G05 | W1 | 5 | 0100 | 1001100 | MEDIUM | G02 (42), G07 (42) | **PENDING** |
| G06 | W1 | 6 | 0101 | 0100101 | MEDIUM | G08 (42) | **PENDING** |
| G07 | W1 | 7 | 0110 | 1100110 | MEDIUM | G05 (42), G09 (42) | **PENDING** |
| G08 | W1 | 8 | 0111 | 0001111 | MEDIUM | G03 (42), G06 (42), G10 (42) | **PENDING** |
| G09 | W1 | 9 | 1000 | 1110000 | HIGH | G02 (38), G07 (42) | **PENDING** |
| G10 | W1 | 10 | 1001 | 0011001 | MEDIUM | G08 (42) | **PENDING** |
| G11 | W2 | 1 | 0000 | 0000000 | NORMAL | — | **PENDING** |
| G12 | W2 | 2 | 0001 | 1101001 | CRITICAL | G19 (34), G15 (42) | **PENDING** |
| G13 | W2 | 3 | 0010 | 0101010 | MEDIUM | G18 (42) | **PENDING** |
| G14 | W2 | 4 | 0011 | 1000011 | NORMAL | — | **PENDING** |
| G15 | W2 | 5 | 0100 | 1001100 | MEDIUM | G12 (42), G17 (42) | **PENDING** |
| G16 | W2 | 6 | 0101 | 0100101 | MEDIUM | G18 (42) | **PENDING** |
| G17 | W2 | 7 | 0110 | 1100110 | MEDIUM | G15 (42), G19 (42) | **PENDING** |
| G18 | W2 | 8 | 0111 | 0001111 | MEDIUM | G13 (42), G16 (42), G20 (42) | **PENDING** |
| G19 | W2 | 9 | 1000 | 1110000 | CRITICAL | G12 (34), G17 (42) | **PENDING** |
| G20 | W2 | 10 | 1001 | 0011001 | MEDIUM | G18 (42) | **PENDING** |
| G21 | W3 | 1 | 0000 | 0000000 | NORMAL | — | **PENDING** |
| G22 | W3 | 2 | 0001 | 1101001 | HIGH | G29 (38), G25 (42) | **PENDING** |
| G23 | W3 | 3 | 0010 | 0101010 | MEDIUM | G28 (42) | **PENDING** |
| G24 | W3 | 4 | 0011 | 1000011 | NORMAL | — | **PENDING** |
| G25 | W3 | 5 | 0100 | 1001100 | MEDIUM | G22 (42), G27 (42) | **PENDING** |
| G26 | W3 | 6 | 0101 | 0100101 | MEDIUM | G28 (42) | **PENDING** |
| G27 | W3 | 7 | 0110 | 1100110 | MEDIUM | G25 (42), G29 (42) | **PENDING** |
| G28 | W3 | 8 | 0111 | 0001111 | MEDIUM | G23 (42), G26 (42), G30 (42) | **PENDING** |
| G29 | W3 | 9 | 1000 | 1110000 | HIGH | G22 (38), G27 (42) | **PENDING** |
| G30 | W3 | 10 | 1001 | 0011001 | MEDIUM | G28 (42) | **PENDING** |
| G31 | W4 | 1 | 0000 | 0000000 | NORMAL | — | **PENDING** |
| G32 | W4 | 2 | 0001 | 1101001 | CRITICAL | G39 (34), G35 (42) | **PENDING** |
| G33 | W4 | 3 | 0010 | 0101010 | MEDIUM | G38 (42) | **PENDING** |
| G34 | W4 | 4 | 0011 | 1000011 | NORMAL | — | **PENDING** |
| G35 | W4 | 5 | 0100 | 1001100 | MEDIUM | G32 (42) | **PENDING** |
| G36 | W4 | 6 | 0101 | 0100101 | NORMAL | — | **PENDING** |
| G37 | W4 | 7 | 0110 | 1100110 | NORMAL | — | **PENDING** |
| G38 | W4 | 8 | 0111 | 0001111 | MEDIUM | G33 (42) | **PENDING** |
| G39 | W4 | 9 | 1000 | 1110000 | CRITICAL | G32 (34) | **PENDING** |
| G40 | W4 | 10 | 1001 | 0011001 | NORMAL | — | **PENDING** |

## Review order

1. CRITICAL pairs: G12/G19 and G32/G39.
2. HIGH pairs: G02/G09 and G22/G29.
3. MEDIUM nearest-pair network.
4. NORMAL residual global pass.
5. Only after direct human visual review may any row move from PENDING to KEEP, REVISE, REJECT or HOLD.

## Required checks

Distinctness, confusability, stroke economy, balance, projection stability and scale robustness must be reviewed from the normalized contact sheet and pair-zoom sheet.

No semantic or phonological assignment is performed in this gate.
