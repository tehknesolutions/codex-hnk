import type { CodexFrameSpec, GlyphBoundary, PortalSpec, TreeSpec } from "./types";

export const codexFrame: CodexFrameSpec = {
  kind: "CodexFrame",
  surface: "manuscript",
  provenance: { sourceIds: ["VS-01", "VS-03"] },
};

export const portalPrimitives: readonly PortalSpec[] = [
  { kind: "SpherePortal", state: "idle", provenance: { sourceIds: ["VS-02", "VS-04"] } },
  { kind: "PortalCard", state: "idle", provenance: { sourceIds: ["VS-02", "VS-05"] } },
  { kind: "PortalCTA", state: "idle", provenance: { sourceIds: ["VS-05", "VS-08"] } },
  { kind: "PortalArtwork", state: "idle", provenance: { sourceIds: ["VS-02", "VS-06"] } },
  { kind: "SphereLabel", state: "idle", provenance: { sourceIds: ["VS-02"] } },
];

export const treePrimitives: readonly TreeSpec[] = [
  { kind: "HnkTree", provenance: { sourceIds: ["VS-07", "VS-09"] } },
  { kind: "TreeNode", state: "unlit", provenance: { sourceIds: ["VS-07"] } },
  { kind: "TreeConnection", provenance: { sourceIds: ["VS-07"] } },
  { kind: "TreeLegend", provenance: { sourceIds: ["VS-09"] } },
];

export const glyphBoundaries: readonly GlyphBoundary[] = [
  { semanticRole: "canonical", renderMode: "data", provenance: { sourceIds: ["VS-10", "VS-11"] } },
  { semanticRole: "functional", renderMode: "ui", provenance: { sourceIds: ["VS-08"] } },
  { semanticRole: "decorative", renderMode: "ornament", provenance: { sourceIds: ["VS-01", "VS-03", "VS-12"] } },
];
