export const hnkTreeLevels = [
  { id: "keter", label: "KETHER", index: "01", dayRange: "001—036", state: "acquired" },
  { id: "chokhmah", label: "CHOKHMAH", index: "02", dayRange: "037—072", state: "active" },
  { id: "binah", label: "BINAH", index: "03", dayRange: "073+", state: "dormant" },
] as const;
export type HnkTreeLevelId = (typeof hnkTreeLevels)[number]["id"];
export type HnkTreeState = "dormant" | "perceived" | "active" | "revealed" | "acquired";
export interface HnkTreeNode { id:string; levelId:HnkTreeLevelId; label:string; index:string; state:HnkTreeState; href?:string; }
export const hnkTreeNodes: readonly HnkTreeNode[] = hnkTreeLevels.map((level)=>({
  id:level.id,
  levelId:level.id,
  label:level.label,
  index:level.index,
  state:level.state,
  href:level.id==="keter"?"/day-001":level.id==="chokhmah"?"/day-037":undefined
}));
