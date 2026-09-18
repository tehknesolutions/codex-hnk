import fs from "node:fs";
import {
  HNK_RELEASE_VERIFICATION_REGISTRY_BOUNDARY,
  createClaimReevaluationQueue,
  createReleaseContractBinding,
  createReleaseValidatorBinding,
  createReleaseVerificationRegistry,
  createResearchArtifactLibrary,
  createResearchReleaseManifest,
  createResearchWorkspaceSnapshot,
  createReviewedClaimRegistry,
  createWorkspaceSnapshotRegistry,
  decideHumanReleaseGate,
  moveWorkspaceSnapshotHead,
  registerReleaseVerificationReport,
  registerWorkspaceSnapshot,
  releaseVerificationRegistryIndex,
  releaseVerificationRegistrySummary,
  validateReleaseVerificationRegistry,
  verifyResearchReleaseManifest,
} from "@hnk/quest-engine";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

const snapshot = createResearchWorkspaceSnapshot({
  snapshot_key: "RELEASE-GATE-VALIDATOR-SNAPSHOT",
  label: "Release gate validator snapshot",
  created_at: "2026-09-18T14:00:00Z",
  artifact_library: createResearchArtifactLibrary({
    library_key: "RELEASE-GATE-VALIDATOR-LIB",
    title: "Release gate validator library",
    created_at: "2026-09-18T13:50:00Z",
  }),
  reviewed_claim_registry: createReviewedClaimRegistry({
    registry_key: "RELEASE-GATE-VALIDATOR-REVIEWED",
    title: "Release gate validator reviewed",
    created_at: "2026-09-18T13:50:00Z",
  }),
  claim_reevaluation_queue: createClaimReevaluationQueue({
    queue_key: "RELEASE-GATE-VALIDATOR-QUEUE",
    title: "Release gate validator queue",
    created_at: "2026-09-18T13:50:00Z",
  }),
});

let timeline = createWorkspaceSnapshotRegistry({
  registry_key: "RELEASE-GATE-VALIDATOR-TIMELINE",
  title: "Release gate validator timeline",
  created_at: "2026-09-18T13:50:00Z",
});
timeline = registerWorkspaceSnapshot(timeline, {
  snapshot,
  registered_at: "2026-09-18T14:01:00Z",
});
timeline = moveWorkspaceSnapshotHead(timeline, {
  to_snapshot_digest: snapshot.snapshot_digest,
  moved_at: "2026-09-18T14:02:00Z",
  reason: "Select release gate validator HEAD",
  explicit_human_signal: "SET RELEASE GATE VALIDATOR HEAD",
});

const contractPath = "packages/reproducibility-verifier/src/index.mjs";
const validatorPath = "scripts/validate-hnk-reproducibility-verifier.mjs";
const contractSource = read(contractPath);
const validatorSource = read(validatorPath);

const releaseManifest = createResearchReleaseManifest({
  release_key: "HNK-RELEASE-GATE-VALIDATOR",
  label: "Release gate validator fixture",
  created_at: "2026-09-18T14:03:00Z",
  workspace_snapshot_registry: timeline,
  git: {
    repository_full_name: "tehknesolutions/codex-hnk",
    commit_sha: "a14e9162020c7d51b87f86727cf714cc810f4e52",
    ref: "main",
  },
  runtime: {
    node_engine: "22.x",
    package_manager: "pnpm@12.1.0",
  },
  contracts: [createReleaseContractBinding({
    contract_id: "HNK_REPRODUCIBILITY_VERIFIER_V1",
    contract_version: "1.0.0",
    package_name: "@hnk/reproducibility-verifier",
    source_path: contractPath,
    source_text: contractSource,
  })],
  validators: [createReleaseValidatorBinding({
    validator_id: "REPRODUCIBILITY_VERIFIER_GATE",
    source_path: validatorPath,
    source_text: validatorSource,
    result: "NOT_EXECUTED",
    executed_at: null,
    environment: "release-gate-fixture",
    evidence_note: "Fixture keeps historical nested validator execution unclaimed.",
  })],
  reproduction: {
    install_command: "corepack pnpm install --frozen-lockfile",
    validation_commands: ["node scripts/validate-hnk-reproducibility-verifier.mjs"],
    build_command: "node scripts/build-web-vercel.mjs",
    notes: ["Release gate fixture."],
  },
});

const report = verifyResearchReleaseManifest(releaseManifest, {
  git: {
    repository_full_name: "https://github.com/tehknesolutions/codex-hnk.git",
    commit_sha: "a14e9162020c7d51b87f86727cf714cc810f4e52",
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
  validator_executions: [{
    validator_id: "REPRODUCIBILITY_VERIFIER_GATE",
    result: "NOT_EXECUTED",
    executed_at: null,
    environment: "fixture",
  }],
}, {
  generated_at: "2026-09-18T14:04:00Z",
});

if (report.overall_status !== "MATCH") issues.push("fixture Verification Report must be MATCH");

let registry = createReleaseVerificationRegistry({
  registry_key: "HNK-RELEASE-VERIFICATION-VALIDATOR",
  title: "Release verification validator",
  created_at: "2026-09-18T14:05:00Z",
});
registry = registerReleaseVerificationReport(registry, {
  report,
  registered_at: "2026-09-18T14:06:00Z",
});

let index = releaseVerificationRegistryIndex(registry);
if (index.accepted_releases !== 0) issues.push("MATCH must not auto-accept release");
if (index.pending_human_gate !== 1) issues.push("new report must require human release gate");
if (index.match_reports_without_acceptance !== 1) issues.push("MATCH without human acceptance must remain visible");

registry = decideHumanReleaseGate(registry, {
  release_key: report.release_key,
  report_digest: report.report_digest,
  decision: "RELEASE_ACCEPTED",
  reviewer: "TW-DVF",
  decided_at: "2026-09-18T14:07:00Z",
  explicit_human_signal: "ACCEPT RELEASE VALIDATOR FIXTURE",
  rationale: "Explicit human acceptance of this exact MATCH report.",
});

const validation = validateReleaseVerificationRegistry(registry);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `registry: ${issue}`));

index = releaseVerificationRegistryIndex(registry);
if (index.accepted_releases !== 1) issues.push("explicit human acceptance must derive accepted release");
if (index.pending_human_gate !== 0) issues.push("human gate must close for latest accepted report");
if (registry.decisions[0].human_decision !== true) issues.push("release decision must remain human-derived");
if (registry.decisions[0].machine_can_decide !== false) issues.push("machine must not decide release gate");

const summary = releaseVerificationRegistrySummary();
if (summary.registry_id !== "HNK_RELEASE_VERIFICATION_REGISTRY_V1") issues.push("unexpected release verification registry id");
if (summary.match_auto_accepts_release !== false) issues.push("MATCH auto-accept lock drift");
if (summary.human_release_gate_required !== true) issues.push("human release gate lock drift");
if (summary.latest_report_reopens_gate !== true) issues.push("latest-report gate reopening rule drift");
if (summary.machine_can_accept_release !== false) issues.push("machine release authority drift");
if (summary.claim_boundary !== HNK_RELEASE_VERIFICATION_REGISTRY_BOUNDARY) issues.push("release verification boundary drift");

const page = read("apps/web/app/research/release-verification-registry/page.tsx");
const client = read("apps/web/app/research/release-verification-registry/ReleaseVerificationRegistryLab.tsx");
const route = read("apps/web/app/api/research/release-verification-registry/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/release-verification-registry.ts");
const docs = read("docs/architecture/HNK_RELEASE_VERIFICATION_REGISTRY_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Release Verification Registry page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Release Verification Registry must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Release Verification Registry API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Release Verification Registry API must declare no automatic persistence");
if (!client.includes("registerReleaseVerificationReport")) issues.push("Release Lab must register reports through shared contract");
if (!client.includes("decideHumanReleaseGate")) issues.push("Release Lab must decide through shared Human Gate contract");
if (!client.includes("MATCH ≠ AUTO ACCEPT")) issues.push("Release Lab must make MATCH/non-approval boundary visible");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Release Verification Registry must not auto-persist in browser storage");
if (!hub.includes('href="/research/release-verification-registry"')) issues.push("Research hub must link Release Verification Registry");
if (!hub.includes("HUMAN RELEASE GATE")) issues.push("Research pipeline must include Human Release Gate");
if (!adapter.includes('from "@hnk/release-verification-registry"')) issues.push("Quest Engine must delegate Release Verification Registry to shared package");
if (!docs.includes("There is no automatic path from MATCH, RELEASE_ACCEPTED, or the Verification Registry to HNK_CANON")) {
  issues.push("Release Verification Registry documentation must preserve no-auto-canon boundary");
}

if (issues.length) {
  console.error("HNK_RELEASE_VERIFICATION_REGISTRY_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_RELEASE_VERIFICATION_REGISTRY_V1_PASS");
console.log(JSON.stringify({
  registry_id: summary.registry_id,
  report_status: report.overall_status,
  reports: index.reports,
  decisions: index.decisions,
  accepted_releases: index.accepted_releases,
  pending_human_gate: index.pending_human_gate,
  match_auto_accepts_release: registry.match_auto_accepts_release,
  machine_can_accept_release: registry.machine_can_accept_release,
  canon_promotion_permitted: registry.canon_promotion_permitted,
}, null, 2));
