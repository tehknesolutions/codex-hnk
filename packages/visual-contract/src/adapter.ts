import type { HnkVisualPrimitive, VisualPrimitiveKind } from "./types.js";

export type VisualPlatform = "WEB" | "EXPO";

export interface VisualViewport {
  width: number;
  height: number;
  pixelRatio: number;
}

export interface VisualRuntimeState {
  reduceMotion: boolean;
  firstSpark: boolean;
  completionAuthority: "SERVER" | "DEMO";
}

export interface VisualRenderContext {
  platform: VisualPlatform;
  viewport: VisualViewport;
  state: VisualRuntimeState;
  semanticTokens: Readonly<Record<string, string>>;
}

export interface ProductVisualAsset {
  assetKey: string;
  id: string;
  path: string;
  sha256: string;
  canonicalAsset: false;
}

export interface VisualAdapterOutput {
  primitiveId: string;
  platform: VisualPlatform;
  reducedMotionApplied: boolean;
  opaqueHandle: unknown;
}

export interface HnkVisualAdapter {
  readonly platform: VisualPlatform;
  supports(kind: VisualPrimitiveKind): boolean;
  render(primitive: HnkVisualPrimitive, context: VisualRenderContext): VisualAdapterOutput;
  resolveProductAsset(asset: ProductVisualAsset): unknown;
}

export const DAY001_REQUIRED_PRIMITIVES = Object.freeze([
  "HNK-D001-VIS-ORIGIN-COSMOS-V1",
  "HNK-D001-VIS-BOAZ-AXIS-V1",
  "HNK-D001-VIS-CONVERGENCE-V1",
  "HNK-D001-VIS-TREE-FIELD-V1",
  "HNK-D001-VIS-REFLECTION-FIELD-V1",
] as const);

export const DAY001_REQUIRED_PRODUCT_ASSETS = Object.freeze([
  "kether-crown-symbol",
  "day001-key-art",
  "soul-mirror-background",
] as const);

export const DAY001_REQUIRED_BINDINGS = Object.freeze([
  "kether-origin-background",
  "kether-tree-node",
  "day001-jachin-field",
  "day001-boaz-field",
  "day001-middle-field",
  "soul-mirror-background",
  "first-spark-animation",
] as const);

export function assertDay001AdapterCoverage(input: {
  primitiveIds: readonly string[];
  productAssetKeys: readonly string[];
  bindingKeys: readonly string[];
}): true {
  const primitiveIds = new Set(input.primitiveIds);
  const productAssets = new Set(input.productAssetKeys);
  const bindings = new Set(input.bindingKeys);

  for (const id of DAY001_REQUIRED_PRIMITIVES) {
    if (!primitiveIds.has(id)) throw new Error(`day001_visual_adapter_missing_primitive:${id}`);
  }
  for (const key of DAY001_REQUIRED_PRODUCT_ASSETS) {
    if (!productAssets.has(key)) throw new Error(`day001_visual_adapter_missing_product_asset:${key}`);
  }
  for (const key of DAY001_REQUIRED_BINDINGS) {
    if (!bindings.has(key)) throw new Error(`day001_visual_adapter_missing_binding:${key}`);
  }
  return true;
}
