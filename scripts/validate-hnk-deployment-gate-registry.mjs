import fs from "node:fs";
import {
  HNK_DEPLOYMENT_GATE_REGISTRY_BOUNDARY,
  createClaimReevaluationQueue,
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
  deploymentGateRegistrySummary,
  evaluateDeploymentCandidate,
  moveWorkspaceSnapshotHead,
  nominateDeploymentCandidate,
  registerReleaseVerificationReport,
  registerWorkspaceSnapshot,
  validateDeploymentGateRegistry,
  verifyResearchReleaseManifest,
} from "@hnk/quest-engine";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

const contractPath = "packages/release-verification-registry/src/index.mjs";
const validatorPath = "scripts/validate-hnk-release-verification-registry.mjs";
const contractSource = read(contractPath);
const validatorSource = read(validatorPath);
const commitSha = "6204049d75eabdae4961be102f890bbea140addd";

const snapshot = createResearchWorkspaceSnapshot({
  snapshot_key: "DEPLOY-GATE-VALIDATOR-SNAPSHOT",
  label: "Deploy gate validator snapshot",
  created_at: "2026-09-18T15:00:00Z",
  artifact_library: createResearchArtifactLibrary({
    library_key: "DEPLOY-GATE-VALIDATOR-LIB",
    title: "Deploy gate validator library",
    created_at: "2026-09-18T14:50:00Z",
  }),
  reviewed_claim_registry: createReviewedClaimRegistry({
    registry_key: "DEPLOY-GATE-VALIDATOR-REVIEWED",
    title: "Deploy gate validator reviewed",
    created_at: "2026-09-18T14:50:00Z",
  }),
  claim_reevaluation_queue: createClaimReevaluationQueue({
    queue_key: "DEPLOY-GATE-VALIDATOR-QUEUE",
    title: "Deploy gate validator queue",
    created_at: "2026-09-18T14:50:00Z",
  }),
});

let timeline = createWorkspaceSnapshotRegistry({
  registry_key: "DEPLOY-GATE-VALIDATOR-TIMELINE",
  title: "Deploy gate validator timeline",
  created_at: "2026-09-18T14:50:00Z",
});
timeline = registerWorkspaceSnapshot(timeline, {
  snapshot,
  registered_at: "2026-09-18T15:01:00Z",
});
timeline = moveWorkspaceSnapshotHead(timeline, {
  to_snapshot_digest: snapshot.snapshot_digest,
  moved_at: "2026-09-18T15:02:00Z",
  reason: "Select deployment gate validator HEAD",
  explicit_human_signal: "SET DEPLOY GATE VALIDATOR HEAD",
});

const manifest = createResearchReleaseManifest({
  release_key: "HNK-DEPLOY-GATE-VALIDATOR",
  label: "Deployment gate validator fixture",
  created_at: "2026-09-18T15:03:00Z",
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
    contract_id: "HNK_RELEASE_VERIFICATION_REGISTRY_V1",
    contract_version: "1.0.0",
    package_name: "@hnk/release-verification-registry",
    source_path: contractPath,
    source_text: contractSource,
  })],
  validators: [createReleaseValidatorBinding({
    validator_id: "RELEASE_VERIFICATION_REGISTRY_GATE",
    source_path: validatorPath,
    source_text: validatorSource,
    result: "NOT_EXECUTED",
    executed_at: null,
    environment: "deployment-gate-fixture",
    evidence_note: "Nested validator execution remains explicitly unclaimed.",
  })],
  reproduction: {
    install_command: "corepack pnpm install --frozen-lockfile",
    validation_commands: ["node scripts/validate-hnk-release-verification-registry.mjs"],
    build_command: "node scripts/build-web-vercel.mjs",
    notes: ["Deployment gate fixture."],
  },
});

function makeReport(generatedAt) {
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
      validator_id: "RELEASE_VERIFICATION_REGISTRY_GATE",
      result: "NOT_EXECUTED",
      executed_at: null,
      environment: "fixture",
    }],
  }, { generated_at: generatedAt });
}

const firstReport = makeReport("2026-09-18T15:04:00Z");
if (firstReport.overall_status !== "MATCH") issues.push("fixture report must be MATCH");

let releaseRegistry = createReleaseVerificationRegistry({
  registry_key: "DEPLOY-GATE-RELEASE-VERIFY",
  title: "Deployment gate release verification",
  created_at: "2026-09-18T15:05:00Z",
});
releaseRegistry = registerReleaseVerificationReport(releaseRegistry, {
  report: firstReport,
  registered_at: "2026-09-18T15:06:00Z",
});
releaseRegistry = decideHumanReleaseGate(releaseRegistry, {
  release_key: firstReport.release_key,
  report_digest: firstReport.report_digest,
  decision: "RELEASE_ACCEPTED",
  reviewer: "TW-DVF",
  decided_at: "2026-09-18T15:07:00Z",
  explicit_human_signal: "ACCEPT DEPLOY GATE VALIDATOR RELEASE",
  rationale: "Accept release while keeping deployment authorization separate.",
});

let deployRegistry = createDeploymentGateRegistry({
  registry_key: "HNK-DEPLOY-GATE-VALIDATOR",
  title: "Deployment gate validator",
  created_at: "2026-09-18T15:08:00Z",
});
deployRegistry = nominateDeploymentCandidate(deployRegistry, {
  release_verification_registry: releaseRegistry,
  release_key: firstReport.release_key,
  target_environment: "production",
  nominated_by: "TW-DVF",
  nominated_at: "2026-09-18T15:09:00Z",
  explicit_human_signal: "NOMINATE VALIDATOR RELEASE",
  rationale: "Human nomination after release acceptance.",
});

const candidate = deployRegistry.candidates[0];
let evaluation = evaluateDeploymentCandidate(
  deployRegistry,
  releaseRegistry,
  candidate.candidate_id,
);
if (evaluation.eligibility_status !== "ELIGIBLE") issues.push("new candidate must be ELIGIBLE");
if (evaluation.approved_for_deployment !== false) issues.push("RELEASE_ACCEPTED/candidacy must not auto-approve deployment");
if (deployRegistry.release_accepted_auto_approves_deployment !== false) issues.push("release auto-approval lock drift");
if (deployRegistry.machine_can_approve_deployment !== false) issues.push("machine deployment authority drift");

deployRegistry = decideHumanDeploymentGate(deployRegistry, {
  release_verification_registry: releaseRegistry,
  candidate_id: candidate.candidate_id,
  decision: "DEPLOYMENT_APPROVED",
  reviewer: "TW-DVF",
  decided_at: "2026-09-18T15:10:00Z",
  explicit_human_signal: "APPROVE VALIDATOR DEPLOYMENT",
  rationale: "Explicit human deployment authorization for current eligible candidate.",
});

evaluation = evaluateDeploymentCandidate(
  deployRegistry,
  releaseRegistry,
  candidate.candidate_id,
);
if (evaluation.approved_for_deployment !== true) issues.push("eligible candidate plus human approval must derive current deployment authorization");
if (evaluation.deployment_executed !== false) issues.push("deployment gate must never execute deployment");

const secondReport = makeReport("2026-09-18T15:11:00Z");
releaseRegistry = registerReleaseVerificationReport(releaseRegistry, {
  report: secondReport,
  registered_at: "2026-09-18T15:12:00Z",
});

evaluation = evaluateDeploymentCandidate(
  deployRegistry,
  releaseRegistry,
  candidate.candidate_id,
);
if (evaluation.eligibility_status !== "STALE_RELEASE_STATE") issues.push("new verification report must stale prior deployment candidate");
if (evaluation.approved_for_deployment !== false) issues.push("stale candidate must lose current deployment authorization");

let staleApprovalBlocked = false;
try {
  decideHumanDeploymentGate(deployRegistry, {
    release_verification_registry: releaseRegistry,
    candidate_id: candidate.candidate_id,
    decision: "DEPLOYMENT_APPROVED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T15:13:00Z",
    explicit_human_signal: "REAPPROVE STALE",
    rationale: "Must fail.",
  });
} catch {
  staleApprovalBlocked = true;
}
if (!staleApprovalBlocked) issues.push("stale candidate must not be approvable");

const validation = validateDeploymentGateRegistry(deployRegistry);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `deployment registry: ${issue}`));

const summary = deploymentGateRegistrySummary();
if (summary.registry_id !== "HNK_DEPLOYMENT_GATE_REGISTRY_V1") issues.push("unexpected deployment gate registry id");
if (summary.candidate_requires_current_release_acceptance !== true) issues.push("candidate release-acceptance rule drift");
if (summary.deployment_approval_requires_current_candidate_eligibility !== true) issues.push("deployment eligibility rule drift");
if (summary.release_accepted_auto_approves_deployment !== false) issues.push("RELEASE_ACCEPTED boundary drift");
if (summary.machine_can_nominate !== false) issues.push("machine nomination lock drift");
if (summary.machine_can_approve_deployment !== false) issues.push("machine approval lock drift");
if (summary.deployment_execution_performed_by_registry !== false) issues.push("deployment execution boundary drift");
if (summary.claim_boundary !== HNK_DEPLOYMENT_GATE_REGISTRY_BOUNDARY) issues.push("deployment gate boundary drift");

const page = read("apps/web/app/research/deployment-gate/page.tsx");
const client = read("apps/web/app/research/deployment-gate/DeploymentGateLab.tsx");
const route = read("apps/web/app/api/research/deployment-gate/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/deployment-gate-registry.ts");
const docs = read("docs/architecture/HNK_DEPLOYMENT_GATE_REGISTRY_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Deployment Gate page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Deployment Gate Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Deployment Gate API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Deployment Gate API must declare no automatic persistence");
if (!client.includes("nominateDeploymentCandidate")) issues.push("Deployment Lab must nominate through shared contract");
if (!client.includes("decideHumanDeploymentGate")) issues.push("Deployment Lab must decide through shared Human Gate contract");
if (!client.includes("RELEASE_ACCEPTED ≠ DEPLOYMENT_APPROVED")) issues.push("Deployment Lab must expose release/deployment authority boundary");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Deployment Gate Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/deployment-gate"')) issues.push("Research hub must link Deployment Gate");
if (!hub.includes("HUMAN DEPLOYMENT GATE")) issues.push("Research pipeline must include Human Deployment Gate");
if (!adapter.includes('from "@hnk/deployment-gate-registry"')) issues.push("Quest Engine must delegate Deployment Gate to shared package");
if (!docs.includes("There is no automatic path from RELEASE_ACCEPTED or DEPLOYMENT_APPROVED to deployment execution, scientific truth, production readiness, or HNK_CANON")) {
  issues.push("Deployment Gate documentation must preserve execution/readiness/truth/canon boundaries");
}

if (issues.length) {
  console.error("HNK_DEPLOYMENT_GATE_REGISTRY_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_DEPLOYMENT_GATE_REGISTRY_V1_PASS");
console.log(JSON.stringify({
  registry_id: summary.registry_id,
  candidate_id: candidate.candidate_id,
  stale_after_new_report: evaluation.eligibility_status,
  current_approved_for_deployment: evaluation.approved_for_deployment,
  release_accepted_auto_approves_deployment: deployRegistry.release_accepted_auto_approves_deployment,
  machine_can_approve_deployment: deployRegistry.machine_can_approve_deployment,
  deployment_execution_performed_by_registry: deployRegistry.deployment_execution_performed_by_registry,
  canon_promotion_permitted: deployRegistry.canon_promotion_permitted,
}, null, 2));
