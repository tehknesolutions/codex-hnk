import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "apps/web/public");
fs.mkdirSync(outDir, { recursive: true });

function run(label, command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 16 * 1024 * 1024,
  });
  const text = [
    `LABEL=${label}`,
    `COMMAND=${command} ${args.join(" ")}`,
    `EXIT_CODE=${result.status ?? -1}`,
    "",
    result.stdout ?? "",
    result.stderr ?? "",
  ].join("\n");
  const lines = text.split(/\r?\n/);
  fs.writeFileSync(
    path.join(outDir, `qa-${label}.txt`),
    lines.slice(Math.max(0, lines.length - 240)).join("\n") + "\n",
  );
  return result.status ?? -1;
}

const envText = [
  `NODE=${process.version}`,
  `PLATFORM=${process.platform}`,
  `ARCH=${process.arch}`,
  `VERCEL_GIT_COMMIT_SHA=${process.env.VERCEL_GIT_COMMIT_SHA ?? ""}`,
  `VERCEL_GIT_COMMIT_REF=${process.env.VERCEL_GIT_COMMIT_REF ?? ""}`,
].join("\n") + "\n";
fs.writeFileSync(path.join(outDir, "qa-executor-env.txt"), envText);

const results = {
  day045_validator: run(
    "day045-validator",
    process.execPath,
    ["scripts/validate-day045-runtime-integration.mjs"],
  ),
  web_typecheck: run(
    "web-typecheck",
    "corepack",
    ["pnpm", "--filter", "@hnk/web", "typecheck"],
  ),
  mobile_typecheck: run(
    "mobile-typecheck",
    "corepack",
    ["pnpm", "--filter", "@hnk/mobile", "typecheck"],
  ),
  mobile_build: run(
    "mobile-build",
    "corepack",
    ["pnpm", "--filter", "@hnk/mobile", "build"],
  ),
};

fs.writeFileSync(
  path.join(outDir, "qa-day045-summary.json"),
  JSON.stringify({ executed: true, results }, null, 2) + "\n",
);

const webBuild = spawnSync(
  "corepack",
  ["pnpm", "--filter", "@hnk/web", "build"],
  {
    cwd: root,
    encoding: "utf8",
    env: process.env,
    stdio: "inherit",
  },
);
process.exit(webBuild.status ?? 1);
