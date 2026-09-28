# HNK-2647892 — Exact Structural Family Census V1

Status: STRUCTURAL_ONLY / EXACT
Date: 2026-09-28

## Result

The N=12 render-distinct space contains **2,647,892 geometric identities**.

Exact structural-family census:

- **256 coarse families**
- **11,492 topological families**
- **3,041 radial-angular families**

Each family partition independently sums to the same complete geometric identity space.

## Method

The census does not materialize millions of glyph images.

It counts simple ordered N=12 paths, applies the approved reversal identity law, and then applies Burnside over D9 while keeping counts separated by a reversal-invariant family key.

For MF+CG:

- ordered simple paths: 95,284,494
- reversal classes: 47,642,247
- D9 geometric classes: 2,647,891
- reflection anti-fixed ordered paths: 4,398 for each of 9 reflections

CR:D contributes one additional D12 geometric class.

Final total: **2,647,892**.

## Family-size distribution

### Coarse

- families: 256
- median size: 600
- mean size: 10,343.32421875
- p90: 21,328
- p99: 177,827
- max: 230,784
- singleton families: 1

### Topological

- families: 11,492
- median size: 128
- mean size: 230.411677688827
- p90: 528
- p99: 1,472
- max: 2,976
- singleton families: 45

### Radial-angular

- families: 3,041
- median size: 104
- mean size: 870.7303518579415
- p90: 2,547
- p99: 9,856
- max: 24,192
- singleton families: 170

## Distribution digests

The family-count distributions are hashed in numeric canonical-key order:

- coarse: `3f66e9ff8296c6c7548aeace5da8839e700e7e3354d1e02517ce24c44857abe9`
- topological: `1c50ac047a22665d08f931fae22edd29c006d2b354e0dd04c0cf4b16e76b7332`
- radialAngular: `93b61fe1c4c05e7233ffc7e02f2f779af9ac8cab99c2eaf16bf50c24997e639b`

## HNK40 coverage

The current 42 HNK40 E5 projection candidates occupy only:

- 1 of 256 coarse families
- 4 of 11,492 topological families
- 6 of 3,041 radial-angular families

Therefore HNK40 is an excellent Genesis/regression benchmark but a very narrow sample of the full structural space.

G17/G20 are stable at coarse and topological family levels while remaining ambiguous in radial-angular family due to circular span 6 versus 7.

## Language/acquisition implication

The result changes the acquisition problem.

A learner should not memorize 2,647,892 glyphs. A practical system can instead teach a hierarchy:

`primitive -> coarse family -> topological family -> radial/angular contrast -> governed linguistic binding -> composition`

The next experiment should sample representatives by family, not uniformly by individual glyph.

A minimum controlled curriculum can begin with:

1. HNK40 benchmark;
2. representatives across coarse families;
3. topological contrast sets;
4. radial-angular nearest-neighbor contrasts;
5. held-out families for transfer/generalization;
6. semantic/phonological bindings only after explicit HNK-KODE gates.

## Canon boundary

This census classifies geometry only.

It does not imply that 256, 11,492 or 3,041 are alphabets, lexicons, phoneme inventories, grammatical categories or sacred correspondences.

No semantic assignments were added.
