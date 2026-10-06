import fs from "node:fs";

const required = [
  "packages/lab-contract/src/registry.ts",
  "packages/lab-contract/src/definition.ts",
  "packages/lab-contract/src/session.ts",
  "packages/lab-contract/src/evidence.ts",
  "packages/lab-contract/src/completion-bridge.ts",
  "apps/web/app/_components/labs/LabJourneyProjection.tsx",
  "apps/mobile/src/features/labs/mobileLabAdapter.ts",
  "apps/mobile/src/features/labs/LabMobileScreen.tsx",
];

for (const path of required) {
  if (!fs.existsSync(path)) throw new Error(`M8 missing ${path}`);
}

const registry = fs.readFileSync(required[0], "utf8");
for (const token of ["getJourneySlots", "DORMANT", "practiceContractRef"]) {
  if (!registry.includes(token)) throw new Error(`M8 registry invariant missing ${token}`);
}

const session = fs.readFileSync(required[2], "utf8");
for (const token of ["SAFETY_STOPPED", "EVIDENCE_PENDING", "READY_FOR_COMPLETION", "lab_authoritative_completion_required"]) {
  if (!session.includes(token)) throw new Error(`M8 session invariant missing ${token}`);
}

const bridge = fs.readFileSync(required[4], "utf8");
for (const token of ["applyAuthoritativeCompletion", "applyAuthoritativeLabCompletion", "lab_completion_day_mismatch"]) {
  if (!bridge.includes(token)) throw new Error(`M8 completion invariant missing ${token}`);
}

for (const path of required.slice(5)) {
  const ui = fs.readFileSync(path, "utf8");
  if (!ui.includes("@hnk/lab-contract") && !ui.includes("mobileLabAdapter")) {
    throw new Error(`M8 projection is not registry-backed: ${path}`);
  }
}

console.log("M8_LABS_PRACTICE_GATE_OK");
