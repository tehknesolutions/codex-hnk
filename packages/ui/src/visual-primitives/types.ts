import type { VisualProvenance } from "@hnk/visual-contract";

export interface CodexFrameSpec {
  kind: "CodexFrame";
  surface: "manuscript" | "panel" | "artifact";
  provenance: VisualProvenance;
}

export interface PortalSpec {
  kind: "SpherePortal" | "PortalCard" | "PortalCTA" | "PortalArtwork" | "SphereLabel";
  state: "idle" | "active" | "disabled";
  provenance: VisualProvenance;
}

export interface TreeSpec {
  kind: "HnkTree" | "TreeNode" | "TreeConnection" | "TreeLegend";
  state?: "unlit" | "lit" | "selected";
  provenance: VisualProvenance;
}

export interface GlyphBoundary {
  semanticRole: "canonical" | "functional" | "decorative";
  renderMode: "data" | "ui" | "ornament";
  provenance: VisualProvenance;
}
