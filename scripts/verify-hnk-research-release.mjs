#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { parseResearchReleaseManifest } from "@hnk/research-release-manifest";
import {
  serializeReproducibilityVerificationReport,
  verifyResearchReleaseManifest,
} from "@hnk/reproducibility-verifier";

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const manifestPath = argValue("--manifest") ?? process.argv[2];
const root = path.resolve(argValue("--root") ?? process.cwd());
const out = argValue("--out");
const strict = process.argv.includes("--strict");

if (!manifestPath) {
  console.error("Usage: node scripts/verify-hnk-research-release.mjs --manifest <file> [--root <repo>] [--out <report.json>] [--strict]");
  process.exit(64);
}

function git(args) {
  try {
    return execFileSync("git", ["-C", root, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function readPackageManager() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    return typeof pkg.packageManager === "string" ? pkg.packageManager : null;
  } catch {
    return null;
  }
}

function safeReadSource(sourcePath) {
  const absolute = path.resolve(root, sourcePath);
  const rootPrefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (absolute !== root && !absolute.startsWith(rootPrefix)) return null;
  try {
    return fs.readFileSync(absolute, "utf8");
  } catch {
    return null;
  }
}

const manifest = parseResearchReleaseManifest(
  fs.readFileSync(path.resolve(manifestPath), "utf8"),
);

const sourcePaths = new Set([
  ...manifest.contracts.map((entry) => entry.source_path),
  ...manifest.validators.map((entry) => entry.source_path),
]);

const files = [];
for (const sourcePath of sourcePaths) {
  const sourceText = safeReadSource(sourcePath);
  if (sourceText !== null) files.push({ source_path: sourcePath, source_text: sourceText });
}

const branch = git(["symbolic-ref", "--short", "HEAD"]);
const observed = {
  git: {
    repository_full_name: git(["config", "--get", "remote.origin.url"]),
    commit_sha: git(["rev-parse", "HEAD"]),
    ref: branch,
  },
  runtime: {
    node_engine: `${process.versions.node.split(".")[0]}.x`,
    package_manager: readPackageManager(),
  },
  files,
  validator_executions: [],
};

const report = verifyResearchReleaseManifest(manifest, observed, {
  generated_at: new Date().toISOString(),
});

const serialized = serializeReproducibilityVerificationReport(report);
if (out) fs.writeFileSync(path.resolve(out), serialized, "utf8");

console.log(serialized.trim());
console.error(
  `HNK_REPRODUCIBILITY_VERIFIER_V1 ${report.overall_status} MATCH=${report.counts.MATCH} DRIFT=${report.counts.DRIFT} MISSING=${report.counts.MISSING} UNVERIFIED=${report.counts.UNVERIFIED}`,
);

if (report.overall_status === "DRIFT" || report.overall_status === "MISSING") {
  process.exitCode = 1;
} else if (strict && report.overall_status !== "MATCH") {
  process.exitCode = 2;
}
