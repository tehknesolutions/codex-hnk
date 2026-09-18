import fs from "node:fs";
import {
  HNK_PRODUCTION_VERIFICATION_REGISTRY_BOUNDARY,
  createClaimReevaluationQueue,
  createDeploymentExecutionReceipt,
  createDeploymentGateRegistry,
  createPostDeploymentVerification,
  createProductionVerificationRegistry,
  createReleaseContractBinding,
  createReleaseValidatorBinding,
  createReleaseVerificationRegistry,
  createResearchArtifactLibrary,
  createResearchReleaseManifest,
  createResearchWorkspaceSnapshot,
  createReviewedClaimRegistry,
  createWorkspaceSnapshotRegistry,
  decideHumanDeploymentGate,
  decideHumanProductionGate,
  decideHumanReleaseGate,
  moveWorkspaceSnapshotHead,
  nominateDeploymentCandidate,
  productionVerificationRegistryIndex,
  productionVerificationRegistrySummary,
  registerDeploymentExecutionReceipt,
  registerReleaseVerificationReport,
  registerWorkspaceSnapshot,
  validateProductionVerificationRegistry,
  verifyResearchReleaseManifest,
} from "@hnk/quest-engine";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];
const commitSha = "962aa8d89acc27f1841ec8e950ba3a06962a4e0c";
const contractPath = "packages/deployment-execution-receipt/src/index.mjs";
const validatorPath = "scripts/validate-hnk-deployment-execution-receipt.mjs";
const contractSource = read(contractPath);
const validatorSource = read(validatorPath);

const snapshot = createResearchWorkspaceSnapshot({
  snapshot_key: "PRODUCTION-GATE-VALIDATOR-SNAPSHOT",
  label: "Production gate validator snapshot",
  created_at: "2026-09-18T17:00:00Z",
  artifact_library: createResearchArtifactLibrary({
    library_key: "PRODUCTION-GATE-VALIDATOR-LIB",
    title: "Production gate validator library",
    created_at: "2026-09-18T16:50:00Z",
  }),
  reviewed_claim_registry: createReviewedClaimRegistry({
    registry_key: "PRODUCTION-GATE-VALIDATOR-REVIEWED",
    title: "Production gate validator reviewed",
    created_at: "2026-09-18T16:50:00Z",
  }),
  claim_reevaluation_queue: createClaimReevaluationQueue({
    queue_key: "PRODUCTION-GATE-VALIDATOR-QUEUE",
    title: "Production gate validator queue",
    created_at: "2026-09-18T16:50:00Z",
  }),
});

let timeline = createWorkspaceSnapshotRegistry({
  registry_key: "PRODUCTION-GATE-VALIDATOR-TIMELINE",
  title: "Production gate validator timeline",
  created_at: "2026-09-18T16:50:00Z",
});
timeline = registerWorkspaceSnapshot(timeline, {
  snapshot,
  registered_at: "2026-09-18T17:01:00Z",
});
timeline = moveWorkspaceSnapshotHead(timeline, {
  to_snapshot_digest: snapshot.snapshot_digest,
  moved_at: "2026-09-18T17:02:00Z",
  reason: "Select production gate validator HEAD",
  explicit_human_signal: "SET PRODUCTION GATE VALIDATOR HEAD",
});

const manifest = createResearchReleaseManifest({
  release_key: "HNK-PRODUCTION-GATE-VALIDATOR",
  label: "Production gate validator fixture",
  created_at: "2026-09-18T17:03:00Z",
  workspace_snapshot_registry: timeline,
  git: {
    repository_full_name: "tehknesolutions/codex-hnk",
    commit_sha: commitSha,
    ref: "main",
  },
  runtime: {
    node_engine: "22.x",
    package_manager: "pnpm@12.1.0",
  },
  contracts: [createReleaseContractBinding({
    contract_id: "HNK_DEPLOYMENT_EXECUTION_RECEIPT_V1",
    contract_version: "1.0.0",
    package_name: "@hnk/deployment-execution-receipt",
    source_path: contractPath,
    source_text: contractSource,
  })],
  validators: [createReleaseValidatorBinding({
    validator_id: "DEPLOYMENT_EXECUTION_RECEIPT_GATE",
    source_path: validatorPath,
    source_text: validatorSource,
    result: "NOT_EXECUTED",
    executed_at: null,
    environment: "production-gate-fixture",
    evidence_note: "Nested receipt validator execution remains explicitly unclaimed.",
  })],
  reproduction: {
    install_command: "corepack pnpm install --frozen-lockfile",
    validation_commands: ["node scripts/validate-hnk-deployment-execution-receipt.mjs"],
    build_command: "node scripts/build-web-vercel.mjs",
    notes: ["Production gate fixture."],
  },
});

const report = verifyResearchReleaseManifest(manifest, {
  git: {
    repository_full_name: "https://github.com/tehknesolutions/codex-hnk.git",
    commit_sha: commitSha,
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
    validator_id: "DEPLOYMENT_EXECUTION_RECEIPT_GATE",
    result: "NOT_EXECUTED",
    executed_at: null,
    environment: "fixture",
  }],
}, { generated_at: "2026-09-18T17:04:00Z" });

let releaseRegistry = createReleaseVerificationRegistry({
  registry_key: "PRODUCTION-GATE-RELEASE-VERIFY",
  title: "Production gate release verification",
  created_at: "2026-09-18T17:05:00Z",
});
releaseRegistry = registerReleaseVerificationReport(releaseRegistry, {
  report,
  registered_at: "2026-09-18T17:06:00Z",
});
releaseRegistry = decideHumanReleaseGate(releaseRegistry, {
  release_key: report.release_key,
  report_digest: report.report_digest,
  decision: "RELEASE_ACCEPTED",
  reviewer: "TW-DVF",
  decided_at: "2026-09-18T17:07:00Z",
  explicit_human_signal: "ACCEPT PRODUCTION GATE VALIDATOR RELEASE",
  rationale: "Accept release while preserving later deployment/production gates.",
});

let deploymentRegistry = createDeploymentGateRegistry({
  registry_key: "PRODUCTION-GATE-DEPLOY",
  title: "Production gate deployment",
  created_at: "2026-09-18T17:08:00Z",
});
deploymentRegistry = nominateDeploymentCandidate(deploymentRegistry, {
  release_verification_registry: releaseRegistry,
  release_key: report.release_key,
  target_environment: "production",
  nominated_by: "TW-DVF",
  nominated_at: "2026-09-18T17:09:00Z",
  explicit_human_signal: "NOMINATE PRODUCTION GATE VALIDATOR",
  rationale: "Nominate accepted release.",
});
const candidate = deploymentRegistry.candidates[0];
deploymentRegistry = decideHumanDeploymentGate(deploymentRegistry, {
  release_verification_registry: releaseRegistry,
  candidate_id: candidate.candidate_id,
  decision: "DEPLOYMENT_APPROVED",
  reviewer: "TW-DVF",
  decided_at: "2026-09-18T17:10:00Z",
  explicit_human_signal: "APPROVE PRODUCTION GATE VALIDATOR DEPLOY",
  rationale: "Authorize exact candidate.",
});

const receipt = createDeploymentExecutionReceipt({
  receipt_key: "HNK-PRODUCTION-GATE-RECEIPT",
  created_at: "2026-09-18T17:20:00Z",
  deployment_gate_registry: deploymentRegistry,
  release_verification_registry: releaseRegistry,
  candidate_id: candidate.candidate_id,
  observed_git_commit_sha: commitSha,
  provider: {
    name: "Vercel",
    deployment_id: "dpl_production_gate_fixture",
    deployment_url: "https://example.invalid/prod",
    result: "SUCCEEDED",
    provider_payload_text: '{"id":"dpl_production_gate_fixture","state":"READY"}\n',
  },
  execution: {
    started_at: "2026-09-18T17:15:00Z",
    completed_at: "2026-09-18T17:18:00Z",
    observed_by: "TW-DVF",
    observed_at: "2026-09-18T17:19:00Z",
    evidence_note: "Fixture deployment execution observed.",
  },
});

let productionRegistry = createProductionVerificationRegistry({
  registry_key: "HNK-PRODUCTION-GATE-VALIDATOR",
  title: "Production gate validator",
  created_at: "2026-09-18T17:21:00Z",
});
productionRegistry = registerDeploymentExecutionReceipt(productionRegistry, {
  receipt,
  registered_at: "2026-09-18T17:22:00Z",
});

let index = productionVerificationRegistryIndex(productionRegistry);
if (index.production_accepted !== 0) issues.push("SUCCEEDED receipt must not auto-accept production");
if (index.awaiting_verification !== 1) issues.push("new receipt must require post-deployment verification");

productionRegistry = createPostDeploymentVerification(productionRegistry, {
  receipt_digest: receipt.receipt_digest,
  observed_git_commit_sha: commitSha,
  observed_url: "https://example.invalid/prod",
  verified_by: "TW-DVF",
  verified_at: "2026-09-18T17:23:00Z",
  checks: [
    {
      check_id: "URL-200",
      kind: "URL",
      expected: "HTTP 200",
      observed: "HTTP 200",
      result: "PASS",
      evidence_note: "URL response observed.",
      evidence_text: "HTTP/1.1 200 OK",
    },
    {
      check_id: "SMOKE-CORE",
      kind: "SMOKE",
      expected: "core route renders",
      observed: "core route rendered",
      result: "PASS",
      evidence_note: "Core route smoke observed.",
      evidence_text: "core-route-rendered=true",
    },
  ],
});

index = productionVerificationRegistryIndex(productionRegistry);
if (index.production_accepted !== 0) issues.push("PASS verification must not auto-accept production");
if (index.pass_without_acceptance !== 1) issues.push("PASS without acceptance must remain visible");
if (index.pending_human_gate !== 1) issues.push("PASS verification must require Human Production Gate");

const verification = productionRegistry.verifications[0];
productionRegistry = decideHumanProductionGate(productionRegistry, {
  release_key: receipt.release_key,
  target_environment: receipt.target_environment,
  verification_digest: verification.verification_digest,
  decision: "PRODUCTION_ACCEPTED",
  reviewer: "TW-DVF",
  decided_at: "2026-09-18T17:24:00Z",
  explicit_human_signal: "ACCEPT PRODUCTION VALIDATOR FIXTURE",
  rationale: "Explicit human acceptance of latest SUCCEEDED receipt and PASS verification.",
});

const validation = validateProductionVerificationRegistry(productionRegistry);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `production registry: ${issue}`));

index = productionVerificationRegistryIndex(productionRegistry);
if (index.production_accepted !== 1) issues.push("human acceptance of latest PASS state must derive production accepted");
if (index.pending_human_gate !== 0) issues.push("Human Production Gate must close for latest accepted verification");
if (productionRegistry.decisions[0].human_decision !== true) issues.push("production decision must remain human");
if (productionRegistry.decisions[0].machine_can_decide !== false) issues.push("machine must not decide production acceptance");

const summary = productionVerificationRegistrySummary();
if (summary.registry_id !== "HNK_PRODUCTION_VERIFICATION_REGISTRY_V1") issues.push("unexpected production verification registry id");
if (summary.deployment_succeeded_auto_accepts_production !== false) issues.push("SUCCEEDED auto-accept lock drift");
if (summary.post_deployment_pass_auto_accepts_production !== false) issues.push("PASS auto-accept lock drift");
if (summary.new_receipt_reopens_production_gate !== true) issues.push("new receipt reopening rule drift");
if (summary.new_verification_reopens_production_gate !== true) issues.push("new verification reopening rule drift");
if (summary.machine_can_accept_production !== false) issues.push("machine production authority drift");
if (summary.claim_boundary !== HNK_PRODUCTION_VERIFICATION_REGISTRY_BOUNDARY) issues.push("production registry boundary drift");

const page = read("apps/web/app/research/production-verification/page.tsx");
const client = read("apps/web/app/research/production-verification/ProductionVerificationLab.tsx");
const route = read("apps/web/app/api/research/production-verification/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/production-verification-registry.ts");
const docs = read("docs/architecture/HNK_PRODUCTION_VERIFICATION_REGISTRY_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Production Verification page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Production Verification Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Production Verification API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Production Verification API must declare no automatic persistence");
if (!client.includes("registerDeploymentExecutionReceipt")) issues.push("Production Lab must register receipts through shared contract");
if (!client.includes("createPostDeploymentVerification")) issues.push("Production Lab must verify through shared contract");
if (!client.includes("decideHumanProductionGate")) issues.push("Production Lab must decide through shared Human Gate contract");
if (!client.includes("DEPLOYMENT_EXECUTED ≠ PRODUCTION_ACCEPTED")) issues.push("Production Lab must expose execution/acceptance boundary");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Production Verification Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/production-verification"')) issues.push("Research hub must link Production Verification");
if (!hub.includes("HUMAN PRODUCTION GATE")) issues.push("Research pipeline must include Human Production Gate");
if (!adapter.includes('from "@hnk/production-verification-registry"')) issues.push("Quest Engine must delegate Production Verification to shared package");
if (!docs.includes("There is no automatic path from DEPLOYMENT_EXECUTION_RECORDED, SUCCEEDED, PASS or PRODUCTION_ACCEPTED to global production readiness, scientific truth or HNK_CANON")) {
  issues.push("Production Verification documentation must preserve readiness/truth/canon boundary");
}

if (issues.length) {
  console.error("HNK_PRODUCTION_VERIFICATION_REGISTRY_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_PRODUCTION_VERIFICATION_REGISTRY_V1_PASS");
console.log(JSON.stringify({
  registry_id: summary.registry_id,
  receipts: index.receipts,
  verifications: index.verifications,
  decisions: index.decisions,
  production_accepted: index.production_accepted,
  deployment_succeeded_auto_accepts_production:
    productionRegistry.deployment_succeeded_auto_accepts_production,
  post_deployment_pass_auto_accepts_production:
    productionRegistry.post_deployment_pass_auto_accepts_production,
  machine_can_accept_production:
    productionRegistry.machine_can_accept_production,
  production_readiness_inferred:
    productionRegistry.production_readiness_inferred,
  canon_promotion_permitted:
    productionRegistry.canon_promotion_permitted,
}, null, 2));
