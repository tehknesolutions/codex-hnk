import type { VisualMotionRole } from "../../../visual-contract/src/visualTargetV1";
import type { CodexFrameSpec, PortalSpec, TreeSpec } from "./types";

export interface PrimitiveRenderModel {
  id: string;
  role: string;
  motion?: VisualMotionRole;
  state: "idle" | "active" | "disabled" | "unlit" | "lit" | "selected";
  provenance: { sourceIds: readonly string[]; sourceRegion?: string };
}

export function frameModel(spec: CodexFrameSpec): PrimitiveRenderModel {
  return {
    id: "codex-frame",
    role: spec.kind,
    state: "idle",
    provenance: spec.provenance,
  };
}

export function portalModel(spec: PortalSpec, id: string): PrimitiveRenderModel {
  return {
    id,
    role: spec.kind,
    state: spec.state,
    provenance: spec.provenance,
  };
}

export function treeModel(spec: TreeSpec, id: string): PrimitiveRenderModel {
  return {
    id,
    role: spec.kind,
    state: spec.state ?? "unlit",
    provenance: spec.provenance,
  };
}
