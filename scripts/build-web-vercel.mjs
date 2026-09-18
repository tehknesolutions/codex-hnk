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
  "scripts/validate-hnk-claim-dossier-review-gate.mjs",
  "scripts/validate-hnk-reviewed-claim-registry.mjs",
  "scripts/validate-hnk-claim-reevaluation-queue.mjs",
  "scripts/validate-hnk-claim-reevaluation-batch-scanner.mjs",
  "scripts/validate-hnk-research-artifact-library.mjs",
  "scripts/validate-hnk-research-workspace-snapshot.mjs",
  "scripts/validate-hnk-workspace-snapshot-registry.mjs",
  "scripts/validate-hnk-research-release-manifest.mjs",
  "scripts/validate-hnk-reproducibility-verifier.mjs",
  "scripts/validate-hnk-release-verification-registry.mjs",
  "scripts/validate-hnk-deployment-gate-registry.mjs",
  "scripts/validate-hnk-deployment-execution-receipt.mjs",
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
