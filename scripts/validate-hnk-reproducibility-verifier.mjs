import fs from "node:fs";
import {
  HNK_REPRODUCIBILITY_VERIFIER_BOUNDARY,
  createClaimReevaluationQueue,
  createReleaseContractBinding,
  createReleaseValidatorBinding,
  createResearchArtifactLibrary,
  createResearchReleaseManifest,
  createResearchWorkspaceSnapshot,
  createReviewedClaimRegistry,
  createWorkspaceSnapshotRegistry,
  moveWorkspaceSnapshotHead,
  registerWorkspaceSnapshot,
  reproducibilityVerifierSummary,
  validateReproducibilityVerificationReport,
  verifyResearchReleaseManifest,
} from "@hnk/quest-engine";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

const snapshot = createResearchWorkspaceSnapshot({
  snapshot_key: "REPRO-VERIFY-SNAPSHOT",
  label: "Repro verifier snapshot",
  created_at: "2026-09-18T13:00:00Z",
  artifact_library: createResearchArtifactLibrary({
    library_key: "REPRO-VERIFY-LIB",
    title: "Repro verifier library",
    created_at: "2026-09-18T12:50:00Z",
  }),
  reviewed_claim_registry: createReviewedClaimRegistry({
    registry_key: "REPRO-VERIFY-REVIEWED",
    title: "Repro verifier reviewed",
    created_at: "2026-09-18T12:50:00Z",
  }),
  claim_reevaluation_queue: createClaimReevaluationQueue({
    queue_key: "REPRO-VERIFY-QUEUE",
    title: "Repro verifier queue",
    created_at: "2026-09-18T12:50:00Z",
  }),
});

let registry = createWorkspaceSnapshotRegistry({
  registry_key: "REPRO-VERIFY-TIMELINE",
  title: "Repro verifier timeline",
  created_at: "2026-09-18T12:50:00Z",
});
registry = registerWorkspaceSnapshot(registry, {
  snapshot,
  registered_at: "2026-09-18T13:01:00Z",
});
registry = moveWorkspaceSnapshotHead(registry, {
  to_snapshot_digest: snapshot.snapshot_digest,
  moved_at: "2026-09-18T13:02:00Z",
  reason: "Select verifier gate HEAD",
  explicit_human_signal: "SET REPRO VERIFY HEAD",
});

const contractPath = "packages/research-release-manifest/src/index.mjs";
const validatorPath = "scripts/validate-hnk-research-release-manifest.mjs";
const contractSource = read(contractPath);
const validatorSource = read(validatorPath);

const contract = createReleaseContractBinding({
  contract_id: "HNK_RESEARCH_RELEASE_MANIFEST_V1",
  contract_version: "1.0.0",
  package_name: "@hnk/research-release-manifest",
  source_path: contractPath,
  source_text: contractSource,
});
const validator = createReleaseValidatorBinding({
  validator_id: "RESEARCH_RELEASE_MANIFEST_GATE",
  source_path: validatorPath,
  source_text: validatorSource,
  result: "NOT_EXECUTED",
  executed_at: null,
  environment: "repro-verifier-fixture",
  evidence_note: "Historical result deliberately preserved as NOT_EXECUTED for verifier fixture.",
});

const manifest = createResearchReleaseManifest({
  release_key: "HNK-REPRO-VERIFY-RELEASE",
  label: "Repro verifier fixture release",
  created_at: "2026-09-18T13:03:00Z",
  workspace_snapshot_registry: registry,
  git: {
    repository_full_name: "tehknesolutions/codex-hnk",
    commit_sha: "04dbc960d7d64cc0efead34041c864497eec798d",
    ref: "main",
  },
  runtime: {
    node_engine: "22.x",
    package_manager: "pnpm@12.1.0",
  },
  contracts: [contract],
  validators: [validator],
  reproduction: {
    install_command: "corepack pnpm install --frozen-lockfile",
    validation_commands: ["node scripts/validate-hnk-research-release-manifest.mjs"],
    build_command: "node scripts/build-web-vercel.mjs",
    notes: ["Verifier fixture only."],
  },
});

const observedMatch = {
  git: {
    repository_full_name: "https://github.com/tehknesolutions/codex-hnk.git",
    commit_sha: "04dbc960d7d64cc0efead34041c864497eec798d",
    ref: "main",
  },
  runtime: {
    node_engine: "22.x",
    package_manager: "pnpm@12.1.0",
  },
  files: [
    { source_path: contractPath, source_text: contractSource },
    { source_path: validatorPath, source_text: validatorSource },
  ],
  validator_executions: [
    { validator_id: "RESEARCH_RELEASE_MANIFEST_GATE", result: "NOT_EXECUTED", executed_at: null, environment: "fixture" },
  ],
};

const match = verifyResearchReleaseManifest(manifest, observedMatch, {
  generated_at: "2026-09-18T13:04:00Z",
});
if (!validateReproducibilityVerificationReport(match).ok) issues.push("MATCH report must validate");
if (match.overall_status !== "MATCH") issues.push("fully observed fixture must produce MATCH");
if (match.commands_executed !== false) issues.push("verifier contract must never auto-execute commands");
if (match.production_readiness_inferred !== false) issues.push("verifier must not infer production readiness");

const driftObserved = structuredClone(observedMatch);
driftObserved.files[0].source_text += "\n// drift";
const drift = verifyResearchReleaseManifest(manifest, driftObserved, {
  generated_at: "2026-09-18T13:05:00Z",
});
if (drift.overall_status !== "DRIFT") issues.push("modified expected source must produce DRIFT");

const missingObserved = structuredClone(observedMatch);
missingObserved.files = missingObserved.files.filter((entry) => entry.source_path !== validatorPath);
const missing = verifyResearchReleaseManifest(manifest, missingObserved, {
  generated_at: "2026-09-18T13:06:00Z",
});
if (missing.overall_status !== "MISSING") issues.push("absent expected source must produce MISSING");

const unverifiedObserved = structuredClone(observedMatch);
unverifiedObserved.git.ref = null;
unverifiedObserved.validator_executions = [];
const unverified = verifyResearchReleaseManifest(manifest, unverifiedObserved, {
  generated_at: "2026-09-18T13:07:00Z",
});
if (unverified.overall_status !== "UNVERIFIED") issues.push("absent metadata/execution observation must remain UNVERIFIED");

const summary = reproducibilityVerifierSummary();
if (summary.verifier_id !== "HNK_REPRODUCIBILITY_VERIFIER_V1") issues.push("unexpected verifier id");
if (summary.drift_precedence !== "DRIFT>MISSING>UNVERIFIED>MATCH") issues.push("status precedence drift");
if (summary.automatic_command_execution !== false) issues.push("automatic command execution lock drift");
if (summary.production_readiness_inferred !== false) issues.push("production readiness lock drift");
if (summary.claim_boundary !== HNK_REPRODUCIBILITY_VERIFIER_BOUNDARY) issues.push("verifier boundary drift");

const page = read("apps/web/app/research/reproducibility-verifier/page.tsx");
const client = read("apps/web/app/research/reproducibility-verifier/ReproducibilityVerifierLab.tsx");
const route = read("apps/web/app/api/research/reproducibility-verifier/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/reproducibility-verifier.ts");
const cli = read("scripts/verify-hnk-research-release.mjs");
const docs = read("docs/architecture/HNK_REPRODUCIBILITY_VERIFIER_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Verifier page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Verifier Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Verifier API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Verifier API must declare no automatic persistence");
if (!client.includes("verifyResearchReleaseManifest")) issues.push("Verifier Lab must verify through shared contract");
if (!client.includes("MATCH") || !client.includes("DRIFT") || !client.includes("MISSING") || !client.includes("UNVERIFIED")) issues.push("Verifier Lab must expose all four statuses");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Verifier Lab must not auto-persist in browser storage");
if (!cli.includes('execFileSync("git"')) issues.push("CLI must observe Git state from real project copy");
if (!cli.includes("safeReadSource")) issues.push("CLI must read bound source files");
if (cli.includes("execSync(manifest") || cli.includes("validation_commands.map")) issues.push("CLI must not auto-execute manifest commands");
if (!hub.includes('href="/research/reproducibility-verifier"')) issues.push("Research hub must link Reproducibility Verifier");
if (!hub.includes("REPRODUCIBILITY VERIFIER")) issues.push("Research pipeline must include Reproducibility Verifier");
if (!adapter.includes('from "@hnk/reproducibility-verifier"')) issues.push("Quest Engine must delegate verifier to shared package");
if (!docs.includes("There is no automatic path from a MATCH verification report to production readiness or HNK_CANON")) {
  issues.push("Verifier documentation must preserve no-readiness/no-auto-canon boundary");
}

if (issues.length) {
  console.error("HNK_REPRODUCIBILITY_VERIFIER_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_REPRODUCIBILITY_VERIFIER_V1_PASS");
console.log(JSON.stringify({
  verifier_id: summary.verifier_id,
  match_status: match.overall_status,
  drift_status: drift.overall_status,
  missing_status: missing.overall_status,
  unverified_status: unverified.overall_status,
  commands_executed: match.commands_executed,
  production_readiness_inferred: match.production_readiness_inferred,
  canon_promotion_permitted: match.canon_promotion_permitted,
}, null, 2));
