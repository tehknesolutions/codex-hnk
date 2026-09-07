export type VisualToken =
  | "VOID"
  | "ORIGIN_WHITE"
  | "GOLD_MATERIAL"
  | "GOLD_BRIGHT"
  | "TEXT_MUTED";

export type VisualPrimitiveKind =
  | "ORIGIN_COSMOS"
  | "BOAZ_AXIS"
  | "CONVERGENCE"
  | "TREE_FIELD"
  | "REFLECTION_FIELD";

export type MotionToken = "STILL" | "BREATHING" | "EXPANSION" | "CONTRACTION" | "CONVERGENCE" | "REVEAL" | "SEAL";

export interface SourceProvenance {
  repository: string;
  path: string;
  gitBlobSha1: string;
  symbol: string;
}

export interface VisualPrimitiveBase {
  id: string;
  kind: VisualPrimitiveKind;
  version: "1.0.0";
  source: SourceProvenance;
  motion: MotionToken;
  reducedMotion: {
    required: true;
    strategy: "STATIC_GEOMETRY" | "REMOVE_GLOW" | "FADE_ONLY";
  };
  canonicalClaim: false;
  description: string;
}

export interface OriginCosmosSpec extends VisualPrimitiveBase {
  kind: "ORIGIN_COSMOS";
  geometry: {
    height: number;
    axisHeight: number;
    ringDiameters: readonly number[];
    pointDiameter: number;
    glowRadius: number;
  };
  tokens: {
    axis: VisualToken;
    rings: readonly VisualToken[];
    point: VisualToken;
  };
}

export interface BoazAxisSpec extends VisualPrimitiveBase {
  kind: "BOAZ_AXIS";
  geometry: {
    width: number;
    height: number;
    line: { left: number; top: number; height: number; width: number };
    node: { left: number; size: number; rotationDegrees: number; tops: readonly number[] };
  };
}

export interface ConvergenceSpec extends VisualPrimitiveBase {
  kind: "CONVERGENCE";
  geometry: {
    height: number;
    lineWidth: number;
    leftOffset: number;
    rightOffset: number;
    leftRotationDegrees: number;
    rightRotationDegrees: number;
    centerDiameter: number;
  };
}

export interface TreeFieldSpec extends VisualPrimitiveBase {
  kind: "TREE_FIELD";
  geometry: {
    width: number;
    height: number;
    stem: { left: number; top: number; height: number; width: number };
    nodeDiameter: number;
    nodes: readonly (readonly [number, number])[];
    ketherNodeIndex: 0;
    glowRadius: number;
  };
  state: {
    litNodeIsServerDerived: true;
    firstSparkEvent: "KETHER_FIRST_SPARK";
  };
}

export interface ReflectionFieldSpec extends VisualPrimitiveBase {
  kind: "REFLECTION_FIELD";
  geometry: {
    padding: number;
    minInputHeight: number;
    largeInputHeight: number;
  };
  privacy: {
    proseDestination: "VAULT_ONLY";
  };
}

export type HnkVisualPrimitive =
  | OriginCosmosSpec
  | BoazAxisSpec
  | ConvergenceSpec
  | TreeFieldSpec
  | ReflectionFieldSpec;

export interface DayVisualBinding {
  assetKey: string;
  primitiveId: string;
  usage: "BACKGROUND" | "FIELD" | "NODE" | "ANIMATION" | "REFLECTION";
  adapterRequired: true;
}
