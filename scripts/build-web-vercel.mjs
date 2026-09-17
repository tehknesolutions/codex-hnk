import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const web = path.join(root, "apps", "web");

const validators = [
  "scripts/validate-portal073-interactive-slice.mjs",
  "scripts/validate-research-decision-layer.mjs",
  "scripts/validate-research-human-gate.mjs",
  "scripts/validate-research-human-gate-batch-001.mjs",
  "scripts/validate-research-001-canon-promotions.mjs",
  "scripts/validate-research-canon-registry.mjs",
  "scripts/validate-hnk-canon-contract.mjs",
  "scripts/validate-hnk-symbolic-runtime-contract.mjs",
  "scripts/validate-hnk-symbolic-runtime-lab.mjs",
  "scripts/validate-hnk-runtime-session-artifact.mjs",
  "scripts/validate-hnk-experiment-protocol.mjs",
  "scripts/validate-hnk-experiment-attestation.mjs",
  "scripts/validate-hnk-measurement-contract.mjs",
  "scripts/validate-hnk-evidence-ledger.mjs",
  "scripts/validate-hnk-replication-registry.mjs",
  "scripts/validate-hnk-evidence-synthesis.mjs",
];

for (const validator of validators) {
  console.log(`[vercel:web] ${validator}`);
  execFileSync(process.execPath, [validator], { cwd: root, stdio: "inherit" });
}

console.log("[vercel:web] next build --webpack");
execFileSync("corepack", ["pnpm", "exec", "next", "build", "--webpack"], {
  cwd: web,
  stdio: "inherit",
});
