export const hnkTreeLevels = [
  { id: "keter", label: "KETHER", index: "01", dayRange: "001—036", state: "acquired" },
  { id: "chokhmah", label: "CHOKHMAH", index: "02", dayRange: "037—072", state: "active" },
  { id: "binah", label: "BINAH", index: "03", dayRange: "073+", state: "dormant" },
] as const;

export type HnkTreeLevelId = (typeof hnkTreeLevels)[number]["id"];
export type HnkTreeState = "dormant" | "perceived" | "active" | "revealed" | "acquired";

export interface HnkTreeNode {
  id: string;
  levelId: HnkTreeLevelId;
  label: string;
  index: string;
  state: HnkTreeState;
  href?: string;
}

export interface HnkDayRoute {
  day: string;
  href: string;
}

const executableRanges: Partial<Record<HnkTreeLevelId, readonly [number, number]>> = {
  keter: [1, 36],
  chokhmah: [37, 72],
};

export function getExecutableDays(levelId: HnkTreeLevelId): readonly HnkDayRoute[] {
  const range = executableRanges[levelId];
  if (!range) return [];
  const [start, end] = range;
  return Array.from({ length: end - start + 1 }, (_, offset) => {
    const day = String(start + offset).padStart(3, "0");
    return { day, href: `/day-${day}` };
  });
}

export const hnkTreeNodes: readonly HnkTreeNode[] = hnkTreeLevels.map((level) => ({
  id: level.id,
  levelId: level.id,
  label: level.label,
  index: level.index,
  state: level.state,
  href: getExecutableDays(level.id)[0]?.href,
}));
