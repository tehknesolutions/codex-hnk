import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const checks = [
  "package.json",
  "pnpm-workspace.yaml",
  "apps/web/package.json",
  "apps/web/vercel.json",
  "scripts/qa-release-vercel-executor.mjs",
];

const report = {
  schemaVersion: "HNK-VERCEL-CONTEXT-PROBE-V1",
  cwd,
  node: process.version,
  platform: process.platform,
  path: process.env.PATH ?? "",
  npmExecPath: process.env.npm_execpath ?? "",
  npmNodeExecPath: process.env.npm_node_execpath ?? "",
  vercel: {
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
    ref: process.env.VERCEL_GIT_COMMIT_REF ?? "",
  },
  checks: Object.fromEntries(checks.map((relative) => [relative, fs.existsSync(path.join(cwd, relative))])),
  parentChecks: Object.fromEntries(checks.map((relative) => [relative, fs.existsSync(path.resolve(cwd, "../..", relative))])),
};

console.log(JSON.stringify(report, null, 2));

if (!report.checks["package.json"] || !report.checks["pnpm-workspace.yaml"] || !report.checks["apps/web/package.json"]) {
  console.error("HNK_VERCEL_CONTEXT_INVALID");
  process.exit(2);
}

console.log("HNK_VERCEL_CONTEXT_OK");
