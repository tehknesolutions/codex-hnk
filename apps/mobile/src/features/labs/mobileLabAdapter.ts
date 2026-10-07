import { getLab, getLabRegistry } from "@hnk/lab-contract";

export function getMobileLabSlots() {
  return getLabRegistry();
}

export function resolveMobileLab(dayId: string) {
  const lab = getLab(dayId);
  if (!lab || lab.status !== "AVAILABLE") {
    throw new Error(`Mobile Lab ${dayId} is not executable`);
  }
  return lab;
}
