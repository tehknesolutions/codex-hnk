export type Rgb = Readonly<{ r: number; g: number; b: number }>;
export type CameraStickerSample = Readonly<{ rgb: Rgb; bestDigit: number; bestDistance: number; secondDistance: number; confidence: number }>;
export function rgbDistanceSquared(a: Rgb, b: Rgb): number;
export function classifyRgb(rgb: Rgb, prototypes: ReadonlyArray<Rgb>): CameraStickerSample;
export function rgbToHex(rgb: Rgb): string;
export function averagePatch(data: Uint8ClampedArray, width: number, height: number, centerX: number, centerY: number, radius?: number): Rgb;
export function sampleNinePatches(data: Uint8ClampedArray, width: number, height: number): ReadonlyArray<Rgb>;
