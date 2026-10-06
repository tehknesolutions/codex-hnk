import { getJourneyDay, getJourneySlots } from "@hnk/journey-contract";

export type LabStatus = "AVAILABLE" | "DORMANT";

export interface AvailableLabDescriptor {
  labId: `DAY-${string}`;
  dayId: string;
  status: "AVAILABLE";
  href: string;
  practiceContractRef: `@hnk/practice-contract/day${string}`;
}

export interface DormantLabDescriptor {
  labId: `DAY-${string}`;
  dayId: string;
  status: "DORMANT";
}

export type LabDescriptor = AvailableLabDescriptor | DormantLabDescriptor;

function practiceRef(dayId: string): AvailableLabDescriptor["practiceContractRef"] {
  return `@hnk/practice-contract/day${dayId}`;
}

const LAB_REGISTRY: readonly LabDescriptor[] = Object.freeze(
  getJourneySlots().map((slot): LabDescriptor => {
    if (slot.status !== "AVAILABLE") {
      return Object.freeze({ labId: `DAY-${slot.dayId}`, dayId: slot.dayId, status: "DORMANT" });
    }

    return Object.freeze({
      labId: `DAY-${slot.dayId}`,
      dayId: slot.dayId,
      status: "AVAILABLE",
      href: `/labs/day-${slot.dayId}`,
      practiceContractRef: practiceRef(slot.dayId),
    });
  }),
);

export function getLabRegistry(): readonly LabDescriptor[] {
  return LAB_REGISTRY;
}

export function getLab(dayId: string): LabDescriptor | undefined {
  const journey = getJourneyDay(dayId);
  if (!journey) return undefined;
  return LAB_REGISTRY.find((lab) => lab.dayId === dayId);
}

export function isExecutableLab(dayId: string): boolean {
  return getLab(dayId)?.status === "AVAILABLE";
}
