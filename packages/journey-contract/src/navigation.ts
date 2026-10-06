import { getJourneyDay, getJourneySlots } from "./registry.js";
import type { AvailableJourneyDay, JourneySlot } from "./types.js";

export type JourneyNavigation = Readonly<{
  current: AvailableJourneyDay;
  previous: AvailableJourneyDay | null;
  next: AvailableJourneyDay | null;
}>;

export type JourneyTargetResolution =
  | AvailableJourneyDay
  | Readonly<{ dayId: string; status: "DORMANT" }>
  | Readonly<{ dayId: string; status: "UNAVAILABLE" }>;

function available(slot: JourneySlot | undefined): slot is AvailableJourneyDay {
  return slot?.status === "AVAILABLE";
}

export function getJourneyNavigationFromRegistry(
  dayId: string,
  registry: readonly JourneySlot[],
): JourneyNavigation {
  const index = registry.findIndex((slot) => slot.dayId === dayId);
  const current = index >= 0 ? registry[index] : undefined;
  if (!available(current)) throw new Error(`Journey navigation requires an AVAILABLE Day: ${dayId}`);

  let previous: AvailableJourneyDay | null = null;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const candidate = registry[cursor];
    if (available(candidate)) {
      previous = candidate;
      break;
    }
  }

  let next: AvailableJourneyDay | null = null;
  for (let cursor = index + 1; cursor < registry.length; cursor += 1) {
    const candidate = registry[cursor];
    if (available(candidate)) {
      next = candidate;
      break;
    }
  }

  return Object.freeze({ current, previous, next });
}

export function getJourneyNavigation(dayId: string): JourneyNavigation {
  return getJourneyNavigationFromRegistry(dayId, getJourneySlots());
}

export function resolveJourneyTarget(dayId: string): JourneyTargetResolution {
  const descriptor = getJourneyDay(dayId);
  if (!descriptor) return Object.freeze({ dayId, status: "UNAVAILABLE" as const });
  if (descriptor.status === "DORMANT") {
    return Object.freeze({ dayId: descriptor.dayId, status: "DORMANT" as const });
  }
  return descriptor;
}
