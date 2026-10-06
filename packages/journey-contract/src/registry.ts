import type {
  AvailableJourneyDay,
  DayId,
  JourneyDayDescriptor,
  JourneySlot,
  JourneySourceKind,
} from "./types.js";

export const JOURNEY_HORIZON = 109 as const;
export const APPROVED_EXECUTABLE_FRONTIER = 72 as const;

const DAY_ID_PATTERN = /^\d{3}$/;

function toDayId(day: number): DayId {
  return String(day).padStart(3, "0") as DayId;
}

function parseDayId(value: string): number | undefined {
  if (!DAY_ID_PATTERN.test(value)) return undefined;
  const day = Number(value);
  if (!Number.isInteger(day) || day < 1 || day > JOURNEY_HORIZON) return undefined;
  return day;
}

function sourceKindFor(day: number): JourneySourceKind {
  return day <= 36 ? "LEGACY_DAY" : "GOLDEN_V2";
}

function approvedExecutableRegistrations(): AvailableJourneyDay[] {
  return Array.from({ length: APPROVED_EXECUTABLE_FRONTIER }, (_, index) => {
    const day = index + 1;
    const dayId = toDayId(day);
    return {
      dayId,
      status: "AVAILABLE" as const,
      href: `/day-${dayId}`,
      sourceKind: sourceKindFor(day),
    };
  });
}

export function buildJourneyRegistry(
  registrations: readonly AvailableJourneyDay[],
): readonly JourneySlot[] {
  const executable = new Map<DayId, AvailableJourneyDay>();

  for (const registration of registrations) {
    const parsed = parseDayId(registration.dayId);
    if (parsed === undefined) throw new Error(`Invalid journey day id: ${registration.dayId}`);
    if (!registration.href.trim()) throw new Error(`AVAILABLE day ${registration.dayId} requires href`);
    if (!registration.sourceKind) throw new Error(`AVAILABLE day ${registration.dayId} requires sourceKind`);
    if (executable.has(registration.dayId)) throw new Error(`Duplicate journey day: ${registration.dayId}`);
    executable.set(registration.dayId, Object.freeze({ ...registration }));
  }

  return Object.freeze(
    Array.from({ length: JOURNEY_HORIZON }, (_, index): JourneyDayDescriptor => {
      const dayId = toDayId(index + 1);
      return executable.get(dayId) ?? Object.freeze({ dayId, status: "DORMANT" as const });
    }),
  );
}

const JOURNEY_REGISTRY = buildJourneyRegistry(approvedExecutableRegistrations());

export function getJourneySlots(): readonly JourneySlot[] {
  return JOURNEY_REGISTRY;
}

export function getJourneyDay(dayId: string): JourneyDayDescriptor | undefined {
  const day = parseDayId(dayId);
  if (day === undefined) return undefined;
  return JOURNEY_REGISTRY[day - 1];
}

export function isExecutableDay(dayId: string): boolean {
  return getJourneyDay(dayId)?.status === "AVAILABLE";
}
