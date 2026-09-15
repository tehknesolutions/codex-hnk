# HNK ORACULUM — CAMERA-ASSISTED CAPTURE V0.7

**Status:** `HNK_AUTHORED_CANDIDATE_AWAITING_HUMAN_PROMOTION`  
**Dependency:** `HOC-FACELET-SCAN-V1` / HNK Oraculum V0.6 physical surface  
**Raw protocol:** unchanged `HNK-ORACULUM-CUBE/V0.4`

## 1. Purpose

V0.7 adds an optional camera-assisted transcription path for a real 3×3 cube. It is a capture convenience layer only. It does not alter the SHA-256 commit, bit map, interpretation profiles, HNK40 identity or Malkuth contract.

Pipeline:

`CAMERA -> SIX FACE FRAMES -> 9 SAMPLE POINTS/FACE -> COLOR PROTOTYPES -> 54 CANDIDATE CELLS -> HUMAN REVIEW -> HOC-FACELET-SCAN-V1 -> RAW V0.4`

## 2. Hard safety / governance boundary

1. Camera output is always a **candidate transcript**.
2. No camera-derived state may be hashed automatically without a human review step.
3. The user can change any of the 54 cells before consultation.
4. The six centers remain authoritative calibration anchors for digits `0..5`.
5. If camera access is unavailable or classification confidence is weak, manual V0.6 capture remains fully usable.
6. Camera images are processed locally in the browser in V0.7; the consultation API receives only the final 54-digit transcript, intention and optional move sequence.

## 3. Face capture convention

The physical viewing convention is inherited unchanged from `HOC-FACELET-SCAN-V1`:

- serialize faces `U -> R -> F -> D -> L -> B`;
- read each viewed face left-to-right, top-to-bottom;
- F/R/L/B: keep physical U toward the top of the frame;
- U: F edge toward the bottom of the frame;
- D: F edge toward the top of the frame.

## 4. Sampling model

Each captured frame is sampled on a fixed 3×3 lattice centered inside the camera preview. The nine sample patches are averaged in RGB space. Center sample `5` becomes that face digit's measured color prototype.

After all six faces are captured, every non-center sample is assigned to the nearest of the six center prototypes by squared RGB Euclidean distance.

This is an intentionally simple deterministic candidate classifier, not a claim of robust computer vision under arbitrary lighting.

## 5. Confidence

For each sticker, V0.7 records the best and second-best color distance. Confidence is derived from their separation. Low-confidence cells must be visually highlighted for manual inspection.

No confidence score is a probability of correctness.

## 6. Privacy

V0.7 must not upload live video or captured frames to `/api/oraculum`. Canvas sampling and classification happen client-side. Frames may be held in browser memory for review and discarded when the page is reset or closed.

## 7. Promotion gates

Before V0.7 can leave candidate status:

- camera permission denied path tested;
- mobile portrait camera tested;
- desktop webcam tested;
- all six orientation instructions verified with a physical cube;
- solved cube camera capture yields nine of each digit after review;
- mixed cube capture supports correction of every cell;
- final transcript is visibly confirmed before hash generation;
- V0.4 golden vector remains unchanged.
