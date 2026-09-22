import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "apps/web/public");
fs.mkdirSync(outDir, { recursive: true });

const contextChecks = [
  "package.json",
  "pnpm-workspace.yaml",
  "apps/web/package.json",
  "apps/web/vercel.json",
  "scripts/qa-release-vercel-executor.mjs",
];

const context = {
  schemaVersion: "HNK-VERCEL-CONTEXT-V1",
  cwd: root,
  node: process.version,
  platform: process.platform,
  path: process.env.PATH ?? "",
  npmExecPath: process.env.npm_execpath ?? "",
  checks: Object.fromEntries(contextChecks.map((relative) => [relative, fs.existsSync(path.join(root, relative))])),
  vercel: {
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
    ref: process.env.VERCEL_GIT_COMMIT_REF ?? "",
  },
};

console.log("HNK_RELEASE_CONTEXT=" + JSON.stringify(context));
fs.writeFileSync(path.join(outDir, "qa-release-context.json"), JSON.stringify(context, null, 2) + "\n");

function run(label, command, args, { required = true } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 16 * 1024 * 1024,
    shell: process.platform === "win32",
  });
  const exitCode = result.status ?? -1;
  const text = [
    `LABEL=${label}`,
    `COMMAND=${command} ${args.join(" ")}`,
    `REQUIRED=${required}`,
    `EXIT_CODE=${exitCode}`,
    `SPAWN_ERROR=${result.error?.message ?? ""}`,
    "",
    result.stdout ?? "",
    result.stderr ?? "",
  ].join("\n");
  const lines = text.split(/\r?\n/);
  fs.writeFileSync(path.join(outDir, `qa-${label}.txt`), lines.slice(Math.max(0, lines.length - 240)).join("\n") + "\n");
  return { exitCode, required, spawnError: result.error?.message ?? null };
}

const results = {
  web_typecheck: run("release-web-typecheck", "pnpm", ["--filter", "@hnk/web", "typecheck"]),
  web_build: run("release-web-build", "pnpm", ["--filter", "@hnk/web", "build"]),
};

fs.writeFileSync(
  path.join(outDir, "qa-release-summary.json"),
  JSON.stringify({ schemaVersion: "HNK-RELEASE-QA-V1", executed: true, context, results }, null, 2) + "\n",
);

const failedRequired = Object.entries(results).filter(([, result]) => result.required && result.exitCode !== 0);
if (failedRequired.length > 0) {
  console.error(`HNK release QA failed: ${failedRequired.map(([name, result]) => `${name}=${result.exitCode}${result.spawnError ? ` (${result.spawnError})` : ""}`).join(", ")}`);
  process.exit(1);
}

console.log("HNK release QA passed.");
