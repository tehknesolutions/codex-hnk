# HNK Mandala Projection Stack V1

The efficient projection stack is now frozen from the Mandala mathematics rather than from a decorative raster choice.

## Canonical PixelMap

The major field atlas has exactly **463 active logical pixels**:

- MF plane: 72×6 = 432
- GRP plane: 9
- Rose Mothers: 3
- Rose Doubles: 7
- Rose Simples: 12

Total: **463**.

A compact single-raster transport at fixed Mandala width 72 therefore needs **72×7 = 504 slots**, of which 463 are active and 41 are reserved. Seven rows are minimal because ceil(463/72)=7.

The primitive atlas has exactly **109 active pixels** and can be transported in **72×2 = 144 slots**, with 35 reserved.

Logical planes are canonical. Packed image layout is only canonical when its version/plane metadata is retained.

## IsoPixel

The reversible integer 2D lattice transform is:

u = x - y
v = x + y

and:

x = (u+v)/2
y = (v-u)/2

with plane identity carried separately. Cylindrical and perspective-looking projections are render layers, not identity.

## Voxel

Voxel identity retains typed source coordinates. For MF, the natural 3D interpretation is six stacked 72-sector rings. No floating-point coordinate replaces the typed address.

## I-Ching-compatible binary factor

Because 72 = 9×8, every sector decomposes exactly into:

group0 ∈ 0..8
slot0 ∈ 0..7

The 3-bit slot is stable and I-Ching-compatible as a trigram-sized binary space. Traditional trigram names/meanings are not assumed; they require an explicit sourced permutation layer.

## Glyph packet

A future HNK glyph is not fundamentally an image.

It is a versioned ordered PATH over AK/MF addresses. Pixel, IsoPixel, cylindrical Mandala art, Voxel and QR are all projections/transports of the same path.

This closes the projection architecture needed to begin mathematically generated HNK-KODE glyphs.
