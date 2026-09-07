import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const checks = [
  "validate-day001-contract.mjs",
  "validate-day001-renderer.mjs",
  "validate-day001-canon-resolver.mjs",
  "validate-practice-contract.mjs",
  "validate-day001-completion-service.mjs",
  "validate-completion-backend-draft.mjs",
];

for (const check of checks) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", check)], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error(`DAY001 GOLDEN FAIL: ${check}`);
    process.exit(result.status ?? 1);
  }
}

const canonicalSource = process.env.HNK_DAY001_CANON_SOURCE;
if (canonicalSource) {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts", "verify-day001-canon-source.mjs"), canonicalSource],
    { cwd: root, stdio: "inherit" },
  );
  if (result.status !== 0) {
    console.error("DAY001 GOLDEN FAIL: raw canonical source verification");
    process.exit(result.status ?? 1);
  }
} else {
  console.log("DAY001 GOLDEN: raw-source verification skipped (set HNK_DAY001_CANON_SOURCE to enable)");
}

console.log("DAY001 GOLDEN PASS");
