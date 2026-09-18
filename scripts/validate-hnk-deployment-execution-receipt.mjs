import fs from "node:fs";
import {
  HNK_DEPLOYMENT_EXECUTION_RECEIPT_BOUNDARY,
  createClaimReevaluationQueue,
  createDeploymentExecutionReceipt,
  createDeploymentGateRegistry,
  createReleaseContractBinding,
  createReleaseValidatorBinding,
  createReleaseVerificationRegistry,
  createResearchArtifactLibrary,
  createResearchReleaseManifest,
  createResearchWorkspaceSnapshot,
  createReviewedClaimRegistry,
  createWorkspaceSnapshotRegistry,
  decideHumanDeploymentGate,
  decideHumanReleaseGate,
  deploymentExecutionReceiptSummary,
  moveWorkspaceSnapshotHead,
  nominateDeploymentCandidate,
  registerReleaseVerificationReport,
  registerWorkspaceSnapshot,
  validateDeploymentExecutionReceipt,
  verifyResearchReleaseManifest,
} from "@hnk/quest-engine";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];
const commitSha = "e00d97bbd3d1955e9eb193906c03db3badba2da4";
const contractPath = "packages/deployment-gate-registry/src/index.mjs";
const validatorPath = "scripts/validate-hnk-deployment-gate-registry.mjs";
const contractSource = read(contractPath);
const validatorSource = read(validatorPath);

const snapshot = createResearchWorkspaceSnapshot({
  snapshot_key: "DEPLOY-RECEIPT-VALIDATOR-SNAPSHOT",
  label: "Deployment receipt validator snapshot",
  created_at: "2026-09-18T16:00:00Z",
  artifact_library: createResearchArtifactLibrary({
    library_key: "DEPLOY-RECEIPT-VALIDATOR-LIB",
    title: "Deployment receipt validator library",
    created_at: "2026-09-18T15:50:00Z",
  }),
  reviewed_claim_registry: createReviewedClaimRegistry({
    registry_key: "DEPLOY-RECEIPT-VALIDATOR-REVIEWED",
    title: "Deployment receipt validator reviewed",
    created_at: "2026-09-18T15:50:00Z",
  }),
  claim_reevaluation_queue: createClaimReevaluationQueue({
    queue_key: "DEPLOY-RECEIPT-VALIDATOR-QUEUE",
    title: "Deployment receipt validator queue",
    created_at: "2026-09-18T15:50:00Z",
  }),
});

let timeline = createWorkspaceSnapshotRegistry({
  registry_key: "DEPLOY-RECEIPT-VALIDATOR-TIMELINE",
  title: "Deployment receipt validator timeline",
  created_at: "2026-09-18T15:50:00Z",
});
timeline = registerWorkspaceSnapshot(timeline, {
  snapshot,
  registered_at: "2026-09-18T16:01:00Z",
});
timeline = moveWorkspaceSnapshotHead(timeline, {
  to_snapshot_digest: snapshot.snapshot_digest,
  moved_at: "2026-09-18T16:02:00Z",
  reason: "Select deployment receipt validator HEAD",
  explicit_human_signal: "SET DEPLOY RECEIPT VALIDATOR HEAD",
});

const manifest = createResearchReleaseManifest({
  release_key: "HNK-DEPLOY-RECEIPT-VALIDATOR",
  label: "Deployment receipt validator fixture",
  created_at: "2026-09-18T16:03:00Z",
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
    contract_id: "HNK_DEPLOYMENT_GATE_REGISTRY_V1",
    contract_version: "1.0.0",
    package_name: "@hnk/deployment-gate-registry",
    source_path: contractPath,
    source_text: contractSource,
  })],
  validators: [createReleaseValidatorBinding({
    validator_id: "DEPLOYMENT_GATE_REGISTRY_GATE",
    source_path: validatorPath,
    source_text: validatorSource,
    result: "NOT_EXECUTED",
    executed_at: null,
    environment: "deployment-receipt-fixture",
    evidence_note: "Nested deployment gate execution remains explicitly unclaimed.",
  })],
  reproduction: {
    install_command: "corepack pnpm install --frozen-lockfile",
    validation_commands: ["node scripts/validate-hnk-deployment-gate-registry.mjs"],
    build_command: "node scripts/build-web-vercel.mjs",
    notes: ["Deployment receipt fixture."],
  },
});

function report(generatedAt) {
  return verifyResearchReleaseManifest(manifest, {
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
      validator_id: "DEPLOYMENT_GATE_REGISTRY_GATE",
      result: "NOT_EXECUTED",
      executed_at: null,
      environment: "fixture",
    }],
  }, { generated_at: generatedAt });
}

const firstReport = report("2026-09-18T16:04:00Z");
if (firstReport.overall_status !== "MATCH") issues.push("fixture report must be MATCH");

let releaseRegistry = createReleaseVerificationRegistry({
  registry_key: "DEPLOY-RECEIPT-RELEASE-VERIFY",
  title: "Deployment receipt release verification",
  created_at: "2026-09-18T16:05:00Z",
});
releaseRegistry = registerReleaseVerificationReport(releaseRegistry, {
  report: firstReport,
  registered_at: "2026-09-18T16:06:00Z",
});
releaseRegistry = decideHumanReleaseGate(releaseRegistry, {
  release_key: firstReport.release_key,
  report_digest: firstReport.report_digest,
  decision: "RELEASE_ACCEPTED",
  reviewer: "TW-DVF",
  decided_at: "2026-09-18T16:07:00Z",
  explicit_human_signal: "ACCEPT DEPLOY RECEIPT VALIDATOR RELEASE",
  rationale: "Accept release while preserving separate deployment gate.",
});

let deployRegistry = createDeploymentGateRegistry({
  registry_key: "DEPLOY-RECEIPT-GATE",
  title: "Deployment receipt gate",
  created_at: "2026-09-18T16:08:00Z",
});
deployRegistry = nominateDeploymentCandidate(deployRegistry, {
  release_verification_registry: releaseRegistry,
  release_key: firstReport.release_key,
  target_environment: "production",
  nominated_by: "TW-DVF",
  nominated_at: "2026-09-18T16:09:00Z",
  explicit_human_signal: "NOMINATE DEPLOY RECEIPT VALIDATOR",
  rationale: "Nominate accepted release.",
});
const candidate = deployRegistry.candidates[0];
deployRegistry = decideHumanDeploymentGate(deployRegistry, {
  release_verification_registry: releaseRegistry,
  candidate_id: candidate.candidate_id,
  decision: "DEPLOYMENT_APPROVED",
  reviewer: "TW-DVF",
  decided_at: "2026-09-18T16:10:00Z",
  explicit_human_signal: "APPROVE DEPLOY RECEIPT VALIDATOR",
  rationale: "Authorize exact current candidate.",
});

const providerPayload = '{"id":"dpl_validator","readyState":"READY"}\n';
const receipt = createDeploymentExecutionReceipt({
  receipt_key: "HNK-DEPLOY-RECEIPT-VALIDATOR",
  created_at: "2026-09-18T16:20:00Z",
  deployment_gate_registry: deployRegistry,
  release_verification_registry: releaseRegistry,
  candidate_id: candidate.candidate_id,
  observed_git_commit_sha: commitSha,
  provider: {
    name: "Vercel",
    deployment_id: "dpl_validator",
    deployment_url: "https://example.invalid/deployment",
    result: "SUCCEEDED",
    provider_payload_text: providerPayload,
  },
  execution: {
    started_at: "2026-09-18T16:15:00Z",
    completed_at: "2026-09-18T16:18:00Z",
    observed_by: "TW-DVF",
    observed_at: "2026-09-18T16:19:00Z",
    evidence_note: "Fixture provider metadata observed.",
  },
});

const validation = validateDeploymentExecutionReceipt(receipt);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `receipt: ${issue}`));
if (receipt.expected_git_commit_sha !== commitSha) issues.push("receipt must bind expected release commit");
if (receipt.observed_git_commit_sha !== commitSha) issues.push("receipt must bind observed deployment commit");
if (receipt.deployment_authorization_current_at_receipt_creation !== true) issues.push("receipt must require current deployment authorization");
if (receipt.deployment_execution_recorded !== true) issues.push("receipt must record execution observation");
if (receipt.deployment_execution_performed_by_contract !== false) issues.push("receipt contract must not execute deployment");
if (receipt.provider_signature_verified !== false) issues.push("provider signature must remain unverified in V1");
if (receipt.production_readiness_inferred !== false) issues.push("SUCCEEDED must not infer production readiness");
if (receipt.canon_promotion_permitted !== false) issues.push("receipt must not permit canon promotion");

let wrongCommitBlocked = false;
try {
  createDeploymentExecutionReceipt({
    receipt_key: "WRONG-COMMIT",
    created_at: "2026-09-18T16:21:00Z",
    deployment_gate_registry: deployRegistry,
    release_verification_registry: releaseRegistry,
    candidate_id: candidate.candidate_id,
    observed_git_commit_sha: "a".repeat(40),
    provider: {
      name: "Vercel",
      deployment_id: "dpl_wrong",
      result: "FAILED",
      provider_payload_text: providerPayload,
    },
    execution: {
      completed_at: "2026-09-18T16:21:00Z",
      observed_by: "TW-DVF",
      observed_at: "2026-09-18T16:21:00Z",
      evidence_note: "Must fail commit binding.",
    },
  });
} catch {
  wrongCommitBlocked = true;
}
if (!wrongCommitBlocked) issues.push("different deployed commit must be blocked");

const secondReport = report("2026-09-18T16:22:00Z");
const changedReleaseRegistry = registerReleaseVerificationReport(
  releaseRegistry,
  {
    report: secondReport,
    registered_at: "2026-09-18T16:23:00Z",
  },
);

let staleBlocked = false;
try {
  createDeploymentExecutionReceipt({
    receipt_key: "STALE-AUTH",
    created_at: "2026-09-18T16:24:00Z",
    deployment_gate_registry: deployRegistry,
    release_verification_registry: changedReleaseRegistry,
    candidate_id: candidate.candidate_id,
    observed_git_commit_sha: commitSha,
    provider: {
      name: "Vercel",
      deployment_id: "dpl_stale",
      result: "UNKNOWN",
      provider_payload_text: providerPayload,
    },
    execution: {
      completed_at: "2026-09-18T16:24:00Z",
      observed_by: "TW-DVF",
      observed_at: "2026-09-18T16:24:00Z",
      evidence_note: "Must fail stale authorization.",
    },
  });
} catch {
  staleBlocked = true;
}
if (!staleBlocked) issues.push("stale deployment authorization must block receipt creation");

const summary = deploymentExecutionReceiptSummary();
if (summary.receipt_id !== "HNK_DEPLOYMENT_EXECUTION_RECEIPT_V1") issues.push("unexpected deployment receipt id");
if (summary.requires_current_approved_deployment_candidate !== true) issues.push("current authorization rule drift");
if (summary.exact_git_commit_match_required !== true) issues.push("exact commit rule drift");
if (summary.provider_payload_sha256_binding !== true) issues.push("provider payload binding drift");
if (summary.deployment_execution_performed_by_contract !== false) issues.push("execution boundary drift");
if (summary.production_readiness_inferred !== false) issues.push("readiness inference lock drift");
if (summary.claim_boundary !== HNK_DEPLOYMENT_EXECUTION_RECEIPT_BOUNDARY) issues.push("deployment receipt boundary drift");

const page = read("apps/web/app/research/deployment-receipts/page.tsx");
const client = read("apps/web/app/research/deployment-receipts/DeploymentExecutionReceiptLab.tsx");
const route = read("apps/web/app/api/research/deployment-receipts/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/deployment-execution-receipt.ts");
const docs = read("docs/architecture/HNK_DEPLOYMENT_EXECUTION_RECEIPT_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Deployment Receipt page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Deployment Receipt Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Deployment Receipt API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Deployment Receipt API must declare no automatic persistence");
if (!client.includes("createDeploymentExecutionReceipt")) issues.push("Deployment Receipt Lab must create through shared contract");
if (!client.includes("DEPLOYMENT_APPROVED ≠ DEPLOYMENT_EXECUTED")) issues.push("Deployment Receipt Lab must expose approval/execution boundary");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Deployment Receipt Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/deployment-receipts"')) issues.push("Research hub must link Deployment Receipt");
if (!hub.includes("DEPLOYMENT EXECUTION RECEIPT")) issues.push("Research pipeline must include Deployment Execution Receipt");
if (!adapter.includes('from "@hnk/deployment-execution-receipt"')) issues.push("Quest Engine must delegate Deployment Receipt to shared package");
if (!docs.includes("There is no automatic path from DEPLOYMENT_APPROVED, DEPLOYMENT_EXECUTION_RECORDED or SUCCEEDED to production readiness or HNK_CANON")) {
  issues.push("Deployment Receipt documentation must preserve readiness/canon boundary");
}

if (issues.length) {
  console.error("HNK_DEPLOYMENT_EXECUTION_RECEIPT_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_DEPLOYMENT_EXECUTION_RECEIPT_V1_PASS");
console.log(JSON.stringify({
  receipt_id: summary.receipt_id,
  receipt_digest: receipt.receipt_digest,
  provider_result: receipt.provider.result,
  deployment_execution_recorded: receipt.deployment_execution_recorded,
  deployment_execution_performed_by_contract:
    receipt.deployment_execution_performed_by_contract,
  provider_signature_verified: receipt.provider_signature_verified,
  production_readiness_inferred: receipt.production_readiness_inferred,
  canon_promotion_permitted: receipt.canon_promotion_permitted,
}, null, 2));
