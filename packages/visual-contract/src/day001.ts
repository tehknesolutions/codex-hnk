import type {
  BoazAxisSpec,
  ConvergenceSpec,
  DayVisualBinding,
  OriginCosmosSpec,
  ReflectionFieldSpec,
  TreeFieldSpec,
} from "./types.js";

const LEGACY_SOURCE = {
  repository: "Tehkne-Solutions/codex-hnk-app",
  path: "apps/mobile/src/features/kether/Day001ImmersiveMobileVerticalSlice.tsx",
  gitBlobSha1: "c5f37b1ea2ca985575f497fe4843c0c8f1db006d",
} as const;

export const day001OriginCosmos: OriginCosmosSpec = {
  id: "HNK-D001-VIS-ORIGIN-COSMOS-V1",
  kind: "ORIGIN_COSMOS",
  version: "1.0.0",
  source: { ...LEGACY_SOURCE, symbol: "OriginCosmos" },
  motion: "BREATHING",
  reducedMotion: { required: true, strategy: "REMOVE_GLOW" },
  canonicalClaim: false,
  description: "Interface geometry for Kether threshold: point, three rings and one vertical axis.",
  geometry: {
    height: 330,
    axisHeight: 270,
    ringDiameters: [270, 178, 86],
    pointDiameter: 10,
    glowRadius: 30,
  },
  tokens: {
    axis: "ORIGIN_WHITE",
    rings: ["GOLD_MATERIAL", "GOLD_MATERIAL", "ORIGIN_WHITE"],
    point: "ORIGIN_WHITE",
  },
};

export const day001BoazAxis: BoazAxisSpec = {
  id: "HNK-D001-VIS-BOAZ-AXIS-V1",
  kind: "BOAZ_AXIS",
  version: "1.0.0",
  source: { ...LEGACY_SOURCE, symbol: "BoazAxis" },
  motion: "CONTRACTION",
  reducedMotion: { required: true, strategy: "STATIC_GEOMETRY" },
  canonicalClaim: false,
  description: "Interface geometry for Boaz restriction: one axis and three diamond nodes.",
  geometry: {
    width: 100,
    height: 220,
    line: { left: 49, top: 10, height: 200, width: 1 },
    node: { left: 39, size: 20, rotationDegrees: 45, tops: [24, 104, 184] },
  },
};

export const day001Convergence: ConvergenceSpec = {
  id: "HNK-D001-VIS-CONVERGENCE-V1",
  kind: "CONVERGENCE",
  version: "1.0.0",
  source: { ...LEGACY_SOURCE, symbol: "ConvergenceGeometry" },
  motion: "CONVERGENCE",
  reducedMotion: { required: true, strategy: "STATIC_GEOMETRY" },
  canonicalClaim: false,
  description: "Interface geometry for the Middle path: two lines converging toward one center.",
  geometry: {
    height: 120,
    lineWidth: 140,
    leftOffset: 25,
    rightOffset: 25,
    leftRotationDegrees: 9,
    rightRotationDegrees: -9,
    centerDiameter: 24,
  },
};

export const day001TreeField: TreeFieldSpec = {
  id: "HNK-D001-VIS-TREE-FIELD-V1",
  kind: "TREE_FIELD",
  version: "1.0.0",
  source: { ...LEGACY_SOURCE, symbol: "TreeField" },
  motion: "SEAL",
  reducedMotion: { required: true, strategy: "REMOVE_GLOW" },
  canonicalClaim: false,
  description: "Interface tree field used to reveal the first Kether spark after server-authoritative completion.",
  geometry: {
    width: 300,
    height: 470,
    stem: { left: 149, top: 30, height: 410, width: 1 },
    nodeDiameter: 22,
    nodes: [
      [150, 34],
      [94, 96],
      [206, 96],
      [76, 174],
      [224, 174],
      [150, 220],
      [86, 300],
      [214, 300],
      [150, 366],
      [150, 430],
    ],
    ketherNodeIndex: 0,
    glowRadius: 26,
  },
  state: {
    litNodeIsServerDerived: true,
    firstSparkEvent: "KETHER_FIRST_SPARK",
  },
};

export const day001ReflectionField: ReflectionFieldSpec = {
  id: "HNK-D001-VIS-REFLECTION-FIELD-V1",
  kind: "REFLECTION_FIELD",
  version: "1.0.0",
  source: { ...LEGACY_SOURCE, symbol: "ReflectionField/reflectionField styles" },
  motion: "STILL",
  reducedMotion: { required: true, strategy: "STATIC_GEOMETRY" },
  canonicalClaim: false,
  description: "Private reflective field for Soul Mirror copy; prose remains outside structured evidence.",
  geometry: {
    padding: 12,
    minInputHeight: 100,
    largeInputHeight: 150,
  },
  privacy: {
    proseDestination: "VAULT_ONLY",
  },
};

export const day001VisualBindings: readonly DayVisualBinding[] = [
  { assetKey: "kether-origin-background", primitiveId: day001OriginCosmos.id, usage: "BACKGROUND", adapterRequired: true },
  { assetKey: "kether-tree-node", primitiveId: day001TreeField.id, usage: "NODE", adapterRequired: true },
  { assetKey: "day001-jachin-field", primitiveId: day001OriginCosmos.id, usage: "FIELD", adapterRequired: true },
  { assetKey: "day001-boaz-field", primitiveId: day001BoazAxis.id, usage: "FIELD", adapterRequired: true },
  { assetKey: "day001-middle-field", primitiveId: day001Convergence.id, usage: "FIELD", adapterRequired: true },
  { assetKey: "soul-mirror-background", primitiveId: day001ReflectionField.id, usage: "REFLECTION", adapterRequired: true },
  { assetKey: "first-spark-animation", primitiveId: day001TreeField.id, usage: "ANIMATION", adapterRequired: true },
] as const;

export const day001VisualPrimitives = [
  day001OriginCosmos,
  day001BoazAxis,
  day001Convergence,
  day001TreeField,
  day001ReflectionField,
] as const;
