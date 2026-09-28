import type { VisualMotionRole } from "../../../visual-contract/src/visualTargetV1";

export interface MotionSpec {
  role: VisualMotionRole;
  durationMs: number;
  easing: "linear" | "ease-out" | "ease-in-out";
  reduced: "none" | "opacity" | "instant";
}

export const visualMotion: Record<VisualMotionRole, MotionSpec> = {
  emission: { role: "emission", durationMs: 900, easing: "ease-in-out", reduced: "opacity" },
  breathing: { role: "breathing", durationMs: 2200, easing: "ease-in-out", reduced: "none" },
  response: { role: "response", durationMs: 180, easing: "ease-out", reduced: "opacity" },
  impact: { role: "impact", durationMs: 260, easing: "ease-out", reduced: "opacity" },
  transmutation: { role: "transmutation", durationMs: 1200, easing: "ease-in-out", reduced: "opacity" },
};

export function motionFor(role: VisualMotionRole, prefersReducedMotion: boolean): MotionSpec {
  const spec = visualMotion[role];
  return prefersReducedMotion
    ? { ...spec, durationMs: spec.reduced === "instant" ? 0 : 180 }
    : spec;
}
