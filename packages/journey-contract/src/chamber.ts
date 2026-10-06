import type { JourneyDayDescriptor, JourneySourceKind } from "./types.js";

export const CHAMBER_SURFACE_IDS = ["VISAO", "MANUSCRITO", "ARTEFATO", "PRATICA", "DIARIO"] as const;
export type ChamberSurfaceId = (typeof CHAMBER_SURFACE_IDS)[number];

export type ChamberEvidence = Readonly<{ ref: string }>;
export type ChamberEvidenceMap = Readonly<Partial<Record<ChamberSurfaceId, ChamberEvidence>>>;

export type ChamberSurface =
  | Readonly<{ id: ChamberSurfaceId; status: "AVAILABLE"; evidence: ChamberEvidence }>
  | Readonly<{ id: ChamberSurfaceId; status: "UNAVAILABLE" }>;

export type DayChamberProjection = Readonly<{
  dayId: string;
  href: string;
  sourceKind: JourneySourceKind;
  surfaces: readonly ChamberSurface[];
}>;

export function projectDayChamber(
  descriptor: JourneyDayDescriptor,
  evidence: ChamberEvidenceMap,
): DayChamberProjection {
  if (descriptor.status !== "AVAILABLE") {
    throw new Error(`Cannot project dormant Day ${descriptor.dayId} as an available Chamber`);
  }

  const surfaces = CHAMBER_SURFACE_IDS.map((id): ChamberSurface => {
    const facet = evidence[id];
    return facet
      ? Object.freeze({ id, status: "AVAILABLE" as const, evidence: Object.freeze({ ...facet }) })
      : Object.freeze({ id, status: "UNAVAILABLE" as const });
  });

  return Object.freeze({
    dayId: descriptor.dayId,
    href: descriptor.href,
    sourceKind: descriptor.sourceKind,
    surfaces: Object.freeze(surfaces),
  });
}
