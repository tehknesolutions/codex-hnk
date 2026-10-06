export const JOURNEY_HORIZON = 109;
export const APPROVED_EXECUTABLE_FRONTIER = 72;

const dayIdPattern = /^\d{3}$/;
const toDayId = (day) => String(day).padStart(3, '0');

function parseDayId(value) {
  if (!dayIdPattern.test(value)) return undefined;
  const day = Number(value);
  if (!Number.isInteger(day) || day < 1 || day > JOURNEY_HORIZON) return undefined;
  return day;
}

const registrations = Object.freeze(Array.from({ length: APPROVED_EXECUTABLE_FRONTIER }, (_, index) => {
  const day = index + 1;
  const dayId = toDayId(day);
  return Object.freeze({
    dayId,
    status: 'AVAILABLE',
    href: `/day-${dayId}`,
    sourceKind: day <= 36 ? 'LEGACY_DAY' : 'GOLDEN_V2',
  });
}));

export function buildJourneyRegistry(entries) {
  const executable = new Map();
  for (const entry of entries) {
    if (parseDayId(entry.dayId) === undefined) throw new Error(`Invalid journey day id: ${entry.dayId}`);
    if (!entry.href?.trim()) throw new Error(`AVAILABLE day ${entry.dayId} requires href`);
    if (!entry.sourceKind) throw new Error(`AVAILABLE day ${entry.dayId} requires sourceKind`);
    if (executable.has(entry.dayId)) throw new Error(`Duplicate journey day: ${entry.dayId}`);
    executable.set(entry.dayId, Object.freeze({ ...entry }));
  }
  return Object.freeze(Array.from({ length: JOURNEY_HORIZON }, (_, index) => {
    const dayId = toDayId(index + 1);
    return executable.get(dayId) ?? Object.freeze({ dayId, status: 'DORMANT' });
  }));
}

const registry = buildJourneyRegistry(registrations);
export const getJourneySlots = () => registry;
export function getJourneyDay(dayId) {
  const day = parseDayId(dayId);
  return day === undefined ? undefined : registry[day - 1];
}
export const isExecutableDay = (dayId) => getJourneyDay(dayId)?.status === 'AVAILABLE';
