import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const checks = [
  "validate-day001-contract.mjs",
  "validate-day001-renderer.mjs",
  "validate-day001-canon-resolver.mjs",
  "validate-practice-contract.mjs",
  "validate-day001-completion-service.mjs",
  "validate-completion-backend-v2.mjs",
  "validate-day001-visual-contract.mjs",
  "validate-day001-assets.mjs",
  "validate-day001-editorial.mjs",
  "validate-day001-quest-pack.mjs",
  "validate-day001-runtime-integration.mjs",
];

const summary = [];
let failed = false;

for (const check of checks) {
  console.log(`\n::group::DAY001 GOLDEN CHECK · ${check}`);
  const result = spawnSync(process.execPath, [path.join(root, "scripts", check)], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  const ok = result.status === 0;
  summary.push({ check, ok, status: result.status, signal: result.signal });
  console.log(`DAY001 GOLDEN ${ok ? "PASS" : "FAIL"}: ${check}`);
  console.log("::endgroup::");
  if (!ok) failed = true;
}

console.log("\nDAY001 GOLDEN VALIDATOR SUMMARY");
for (const item of summary) {
  console.log(`${item.ok ? "PASS" : "FAIL"} · ${item.check}${item.ok ? "" : ` · status=${item.status ?? "null"} · signal=${item.signal ?? "none"}`}`);
}

const canonicalSource = process.env.HNK_DAY001_CANON_SOURCE;
if (canonicalSource) {
  console.log("\n::group::DAY001 GOLDEN CHECK · raw canonical source verification");
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts", "verify-day001-canon-source.mjs"), canonicalSource],
    { cwd: root, encoding: "utf8" },
  );
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  const ok = result.status === 0;
  console.log(`DAY001 GOLDEN ${ok ? "PASS" : "FAIL"}: raw canonical source verification`);
  console.log("::endgroup::");
  if (!ok) failed = true;
} else {
  console.log("DAY001 GOLDEN: raw-source verification skipped (set HNK_DAY001_CANON_SOURCE to enable)");
}

if (failed) {
  console.error("DAY001 GOLDEN FAIL: see validator summary above");
  process.exit(1);
}

console.log("DAY001 GOLDEN PASS");
