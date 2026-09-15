export type Rgb = Readonly<{ r: number; g: number; b: number }>;

export type CameraStickerSample = Readonly<{
  rgb: Rgb;
  bestDigit: number;
  bestDistance: number;
  secondDistance: number;
  confidence: number;
}>;

export function rgbDistanceSquared(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

export function classifyRgb(rgb: Rgb, prototypes: ReadonlyArray<Rgb>): CameraStickerSample {
  if (prototypes.length !== 6) throw new Error(`Expected 6 color prototypes; got ${prototypes.length}`);
  const ranked = prototypes
    .map((prototype, digit) => ({ digit, distance: rgbDistanceSquared(rgb, prototype) }))
    .sort((a, b) => a.distance - b.distance || a.digit - b.digit);
  const best = ranked[0];
  const second = ranked[1];
  const separation = second.distance - best.distance;
  const confidence = second.distance === 0 ? 0 : Math.max(0, Math.min(1, separation / second.distance));
  return Object.freeze({
    rgb: Object.freeze({ ...rgb }),
    bestDigit: best.digit,
    bestDistance: best.distance,
    secondDistance: second.distance,
    confidence,
  });
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export function averagePatch(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius = 4,
): Rgb {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  const x0 = Math.max(0, Math.floor(centerX - radius));
  const x1 = Math.min(width - 1, Math.ceil(centerX + radius));
  const y0 = Math.max(0, Math.floor(centerY - radius));
  const y1 = Math.min(height - 1, Math.ceil(centerY + radius));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const offset = (y * width + x) * 4;
      r += data[offset];
      g += data[offset + 1];
      b += data[offset + 2];
      count += 1;
    }
  }
  if (!count) throw new Error('Empty camera sample patch');
  return Object.freeze({ r: r / count, g: g / count, b: b / count });
}

export function sampleNinePatches(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ReadonlyArray<Rgb> {
  const insetX = width * 0.24;
  const insetY = height * 0.24;
  const spanX = width - insetX * 2;
  const spanY = height - insetY * 2;
  const samples: Rgb[] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = insetX + (spanX * col) / 2;
      const y = insetY + (spanY * row) / 2;
      samples.push(averagePatch(data, width, height, x, y));
    }
  }
  return Object.freeze(samples);
}
