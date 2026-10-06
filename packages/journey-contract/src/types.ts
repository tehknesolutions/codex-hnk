export type DayId = `${number}${number}${number}`;

export type JourneyDayStatus = "AVAILABLE" | "DORMANT";
export type JourneySourceKind = "LEGACY_DAY" | "GOLDEN_V2";

export type AvailableJourneyDay = Readonly<{
  dayId: DayId;
  status: "AVAILABLE";
  href: string;
  sourceKind: JourneySourceKind;
}>;

export type DormantJourneyDay = Readonly<{
  dayId: DayId;
  status: "DORMANT";
}>;

export type JourneyDayDescriptor = AvailableJourneyDay | DormantJourneyDay;
export type JourneySlot = JourneyDayDescriptor;
