/**
 * CODEX-HNK Visual Target V1
 *
 * Semantic roles derived from the 12-source visual dissection.
 * These are role names, not pixel/color prescriptions.
 */

export const visualSurfaceRoles = [
  "cosmic",
  "manuscript",
  "panel",
  "artifact",
  "overlay",
  "active",
] as const;

export const visualMaterialRoles = [
  "parchment",
  "gold",
  "obsidian",
  "glass-cosmos",
  "stone",
  "metal",
] as const;

export const visualTypographyRoles = [
  "display-sacred",
  "display-editorial",
  "heading-system",
  "body-editorial",
  "body-system",
  "label-upper",
  "caption",
  "numeric",
  "glyph",
] as const;

export const visualSymbolRoles = [
  "canonical",
  "functional",
  "decorative",
] as const;

export const visualMotionRoles = [
  "emission",
  "breathing",
  "response",
  "impact",
  "transmutation",
] as const;

export const visualSourceIds = [
  "VS-01",
  "VS-02",
  "VS-03",
  "VS-04",
  "VS-05",
  "VS-06",
  "VS-07",
  "VS-08",
  "VS-09",
  "VS-10",
  "VS-11",
  "VS-12",
] as const;

export type VisualSourceId = (typeof visualSourceIds)[number];
export type VisualSurfaceRole = (typeof visualSurfaceRoles)[number];
export type VisualMaterialRole = (typeof visualMaterialRoles)[number];
export type VisualTypographyRole = (typeof visualTypographyRoles)[number];
export type VisualSymbolRole = (typeof visualSymbolRoles)[number];
export type VisualMotionRole = (typeof visualMotionRoles)[number];

export interface VisualProvenance {
  sourceIds: readonly VisualSourceId[];
  sourceRegion?: string;
}

export interface VisualRoleBinding {
  surface?: VisualSurfaceRole;
  material?: VisualMaterialRole;
  typography?: VisualTypographyRole;
  symbol?: VisualSymbolRole;
  motion?: VisualMotionRole;
  provenance: VisualProvenance;
}
