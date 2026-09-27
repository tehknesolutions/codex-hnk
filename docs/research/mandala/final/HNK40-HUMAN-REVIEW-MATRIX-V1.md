# HNK40 Human Review Matrix V1

Status: **PENDING HUMAN REVIEW**

No row in this matrix is automatically promoted. Machine confusability flags only prioritize review order.

| G-ID | World | Col | Bits | Priority | Closest flagged pair(s) | Decision |
|---|---:|---:|---:|---|---|---|
| G01 | W1 | 1 | 0000 | CRITICAL_PAIR_FIRST | G02 (score 14) | **PENDING** |
| G02 | W1 | 2 | 0001 | CRITICAL_PAIR_FIRST | G01 (score 14) | **PENDING** |
| G03 | W1 | 3 | 0010 | CRITICAL_PAIR_FIRST | G04 (score 14) | **PENDING** |
| G04 | W1 | 4 | 0011 | CRITICAL_PAIR_FIRST | G03 (score 14) | **PENDING** |
| G05 | W1 | 5 | 0100 | CRITICAL_PAIR_FIRST | G06 (score 14) | **PENDING** |
| G06 | W1 | 6 | 0101 | CRITICAL_PAIR_FIRST | G05 (score 14) | **PENDING** |
| G07 | W1 | 7 | 0110 | CRITICAL_PAIR_FIRST | G08 (score 14) | **PENDING** |
| G08 | W1 | 8 | 0111 | CRITICAL_PAIR_FIRST | G07 (score 14) | **PENDING** |
| G09 | W1 | 9 | 1000 | CRITICAL_PAIR_FIRST | G10 (score 14) | **PENDING** |
| G10 | W1 | 10 | 1001 | CRITICAL_PAIR_FIRST | G09 (score 14) | **PENDING** |
| G11 | W2 | 1 | 0000 | CRITICAL_PAIR_FIRST | G12 (score 12) | **PENDING** |
| G12 | W2 | 2 | 0001 | CRITICAL_PAIR_FIRST | G11 (score 12) | **PENDING** |
| G13 | W2 | 3 | 0010 | CRITICAL_PAIR_FIRST | G14 (score 12) | **PENDING** |
| G14 | W2 | 4 | 0011 | CRITICAL_PAIR_FIRST | G13 (score 12) | **PENDING** |
| G15 | W2 | 5 | 0100 | CRITICAL_PAIR_FIRST | G16 (score 12) | **PENDING** |
| G16 | W2 | 6 | 0101 | CRITICAL_PAIR_FIRST | G15 (score 12) | **PENDING** |
| G17 | W2 | 7 | 0110 | CRITICAL_PAIR_FIRST | G18 (score 12) | **PENDING** |
| G18 | W2 | 8 | 0111 | CRITICAL_PAIR_FIRST | G17 (score 12) | **PENDING** |
| G19 | W2 | 9 | 1000 | CRITICAL_PAIR_FIRST | G20 (score 12) | **PENDING** |
| G20 | W2 | 10 | 1001 | CRITICAL_PAIR_FIRST | G19 (score 12) | **PENDING** |
| G21 | W3 | 1 | 0000 | CRITICAL_PAIR_FIRST | G22 (score 14) | **PENDING** |
| G22 | W3 | 2 | 0001 | CRITICAL_PAIR_FIRST | G21 (score 14) | **PENDING** |
| G23 | W3 | 3 | 0010 | CRITICAL_PAIR_FIRST | G24 (score 14) | **PENDING** |
| G24 | W3 | 4 | 0011 | CRITICAL_PAIR_FIRST | G23 (score 14) | **PENDING** |
| G25 | W3 | 5 | 0100 | CRITICAL_PAIR_FIRST | G26 (score 14) | **PENDING** |
| G26 | W3 | 6 | 0101 | CRITICAL_PAIR_FIRST | G25 (score 14) | **PENDING** |
| G27 | W3 | 7 | 0110 | CRITICAL_PAIR_FIRST | G28 (score 14) | **PENDING** |
| G28 | W3 | 8 | 0111 | CRITICAL_PAIR_FIRST | G27 (score 14) | **PENDING** |
| G29 | W3 | 9 | 1000 | CRITICAL_PAIR_FIRST | G30 (score 14) | **PENDING** |
| G30 | W3 | 10 | 1001 | CRITICAL_PAIR_FIRST | G29 (score 14) | **PENDING** |
| G31 | W4 | 1 | 0000 | CRITICAL_PAIR_FIRST | G32 (score 12) | **PENDING** |
| G32 | W4 | 2 | 0001 | CRITICAL_PAIR_FIRST | G31 (score 12) | **PENDING** |
| G33 | W4 | 3 | 0010 | CRITICAL_PAIR_FIRST | G34 (score 12) | **PENDING** |
| G34 | W4 | 4 | 0011 | CRITICAL_PAIR_FIRST | G33 (score 12) | **PENDING** |
| G35 | W4 | 5 | 0100 | CRITICAL_PAIR_FIRST | G36 (score 12) | **PENDING** |
| G36 | W4 | 6 | 0101 | CRITICAL_PAIR_FIRST | G35 (score 12) | **PENDING** |
| G37 | W4 | 7 | 0110 | CRITICAL_PAIR_FIRST | G38 (score 12) | **PENDING** |
| G38 | W4 | 8 | 0111 | CRITICAL_PAIR_FIRST | G37 (score 12) | **PENDING** |
| G39 | W4 | 9 | 1000 | CRITICAL_PAIR_FIRST | G40 (score 12) | **PENDING** |
| G40 | W4 | 10 | 1001 | CRITICAL_PAIR_FIRST | G39 (score 12) | **PENDING** |

## Review order

1. Review all `CRITICAL_PAIR_FIRST` rows pairwise.
2. Mark each row only as KEEP, REVISE, REJECT or HOLD after direct visual inspection.
3. After pair review, audit all remaining NORMAL rows for global confusability.
4. Only then prepare a promotion proposal; no status in this matrix changes HNK-KODE authority by itself.
