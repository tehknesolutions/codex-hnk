import test from "node:test";
import assert from "node:assert/strict";
import { createClaimReevaluationQueue } from "@hnk/claim-reevaluation-queue";
import {
  createDeploymentExecutionReceipt,
} from "@hnk/deployment-execution-receipt";
import {
  createDeploymentGateRegistry,
  decideHumanDeploymentGate,
  nominateDeploymentCandidate,
} from "@hnk/deployment-gate-registry";
import { createResearchArtifactLibrary } from "@hnk/research-artifact-library";
import {
  createReleaseContractBinding,
  createReleaseValidatorBinding,
  createResearchReleaseManifest,
} from "@hnk/research-release-manifest";
import { createResearchWorkspaceSnapshot } from "@hnk/research-workspace-snapshot";
import {
  createWorkspaceSnapshotRegistry,
  moveWorkspaceSnapshotHead,
  registerWorkspaceSnapshot,
} from "@hnk/research-workspace-snapshot-registry";
import {
  createReleaseVerificationRegistry,
  decideHumanReleaseGate,
  registerReleaseVerificationReport,
} from "@hnk/release-verification-registry";
import { createReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";
import { verifyResearchReleaseManifest } from "@hnk/reproducibility-verifier";
import {
  createPostDeploymentVerification,
  createProductionVerificationRegistry,
  decideHumanProductionGate,
  parseProductionVerificationRegistry,
  productionVerificationRegistryIndex,
  registerDeploymentExecutionReceipt,
  serializeProductionVerificationRegistry,
  validateProductionVerificationRegistry,
} from "../src/index.mjs";

const CONTRACT_SOURCE = "export const PROD_FIXTURE = \"V1\";\n";
const VALIDATOR_SOURCE = "console.log(\"PASS\");\n";
const COMMIT = "962aa8d89acc27f1841ec8e950ba3a06962a4e0c";

function manifest() {
  const snapshot = createResearchWorkspaceSnapshot({
    snapshot_key: "PROD-SNAPSHOT",
    label: "Production snapshot",
    created_at: "2026-09-18T17:00:00Z",
    artifact_library: createResearchArtifactLibrary({
      library_key: "PROD-LIB",
      title: "Production library",
      created_at: "2026-09-18T16:50:00Z",
    }),
    reviewed_claim_registry: createReviewedClaimRegistry({
      registry_key: "PROD-REVIEWED",
      title: "Production reviewed",
      created_at: "2026-09-18T16:50:00Z",
    }),
    claim_reevaluation_queue: createClaimReevaluationQueue({
      queue_key: "PROD-QUEUE",
      title: "Production queue",
      created_at: "2026-09-18T16:50:00Z",
    }),
  });

  let timeline = createWorkspaceSnapshotRegistry({
    registry_key: "PROD-TIMELINE",
    title: "Production timeline",
    created_at: "2026-09-18T16:50:00Z",
  });
  timeline = registerWorkspaceSnapshot(timeline, {
    snapshot,
    registered_at: "2026-09-18T17:01:00Z",
  });
  timeline = moveWorkspaceSnapshotHead(timeline, {
    to_snapshot_digest: snapshot.snapshot_digest,
    moved_at: "2026-09-18T17:02:00Z",
    reason: "Select production fixture HEAD",
    explicit_human_signal: "SET PROD HEAD",
  });

  return createResearchReleaseManifest({
    release_key: "PROD-RELEASE-001",
    label: "Production release fixture",
    created_at: "2026-09-18T17:03:00Z",
    workspace_snapshot_registry: timeline,
    git: {
      repository_full_name: "tehknesolutions/codex-hnk",
      commit_sha: COMMIT,
      ref: "main",
    },
    runtime: {
      node_engine: "22.x",
      package_manager: "pnpm@12.1.0",
    },
    contracts: [createReleaseContractBinding({
      contract_id: "PROD-CONTRACT",
      contract_version: "1.0.0",
      package_name: "@hnk/prod-contract",
      source_path: "packages/prod-contract/src/index.mjs",
      source_text: CONTRACT_SOURCE,
    })],
    validators: [createReleaseValidatorBinding({
      validator_id: "PROD-VALIDATOR",
      source_path: "scripts/prod-validator.mjs",
      source_text: VALIDATOR_SOURCE,
      result: "PASS",
      executed_at: "2026-09-18T17:04:00Z",
      environment: "fixture-node-22",
      evidence_note: "Production fixture validator passed.",
    })],
    reproduction: {
      install_command: "corepack pnpm install --frozen-lockfile",
      validation_commands: ["node scripts/prod-validator.mjs"],
      build_command: "node scripts/build-web-vercel.mjs",
      notes: ["Production fixture."],
    },
  });
}

function verificationReport(generatedAt) {
  const release = manifest();
  return verifyResearchReleaseManifest(
    release,
    {
      git: {
        repository_full_name: "https://github.com/tehknesolutions/codex-hnk.git",
        commit_sha: COMMIT,
        ref: "main",
      },
      runtime: {
        node_engine: "22.x",
        package_manager: "pnpm@12.1.0",
      },
      files: [
        {
          source_path: "packages/prod-contract/src/index.mjs",
          source_text: CONTRACT_SOURCE,
        },
        {
          source_path: "scripts/prod-validator.mjs",
          source_text: VALIDATOR_SOURCE,
        },
      ],
      validator_executions: [{
        validator_id: "PROD-VALIDATOR",
        result: "PASS",
        executed_at: generatedAt,
        environment: "fixture-node-22",
      }],
    },
    { generated_at: generatedAt },
  );
}

function executionReceipt(receiptKey = "PROD-RECEIPT-001") {
  const report = verificationReport("2026-09-18T17:05:00Z");

  let releaseRegistry = createReleaseVerificationRegistry({
    registry_key: "PROD-RELEASE-VERIFY",
    title: "Production release verification",
    created_at: "2026-09-18T17:05:30Z",
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
    explicit_human_signal: "ACCEPT PROD RELEASE",
    rationale: "Accept release while keeping production acceptance separate.",
  });

  let deployRegistry = createDeploymentGateRegistry({
    registry_key: "PROD-DEPLOY-GATE",
    title: "Production deployment gate",
    created_at: "2026-09-18T17:08:00Z",
  });
  deployRegistry = nominateDeploymentCandidate(deployRegistry, {
    release_verification_registry: releaseRegistry,
    release_key: report.release_key,
    target_environment: "production",
    nominated_by: "TW-DVF",
    nominated_at: "2026-09-18T17:09:00Z",
    explicit_human_signal: "NOMINATE PROD RELEASE",
    rationale: "Nominate release for production.",
  });
  const candidate = deployRegistry.candidates[0];
  deployRegistry = decideHumanDeploymentGate(deployRegistry, {
    release_verification_registry: releaseRegistry,
    candidate_id: candidate.candidate_id,
    decision: "DEPLOYMENT_APPROVED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T17:10:00Z",
    explicit_human_signal: "APPROVE PROD DEPLOYMENT",
    rationale: "Authorize exact production candidate.",
  });

  return createDeploymentExecutionReceipt({
    receipt_key: receiptKey,
    created_at: "2026-09-18T17:20:00Z",
    deployment_gate_registry: deployRegistry,
    release_verification_registry: releaseRegistry,
    candidate_id: candidate.candidate_id,
    observed_git_commit_sha: COMMIT,
    provider: {
      name: "Vercel",
      deployment_id: receiptKey.toLowerCase(),
      deployment_url: "https://example.invalid/prod",
      result: "SUCCEEDED",
      provider_payload_text: `{"receipt":"${receiptKey}","state":"READY"}\n`,
    },
    execution: {
      started_at: "2026-09-18T17:15:00Z",
      completed_at: "2026-09-18T17:18:00Z",
      observed_by: "TW-DVF",
      observed_at: "2026-09-18T17:19:00Z",
      evidence_note: "Observed fixture deployment execution.",
    },
  });
}

function passChecks(suffix = "A") {
  return [
    {
      check_id: `URL-${suffix}`,
      kind: "URL",
      expected: "HTTP 200",
      observed: "HTTP 200",
      result: "PASS",
      evidence_note: "Production URL responded as expected.",
      evidence_text: `url-evidence-${suffix}`,
    },
    {
      check_id: `SMOKE-${suffix}`,
      kind: "SMOKE",
      expected: "Core route renders",
      observed: "Core route rendered",
      result: "PASS",
      evidence_note: "Core smoke behavior observed.",
      evidence_text: `smoke-evidence-${suffix}`,
    },
  ];
}

test("SUCCEEDED deployment receipt does not auto-accept production", () => {
  const receipt = executionReceipt();
  let registry = createProductionVerificationRegistry({
    registry_key: "PROD-VERIFY",
    title: "Production verification registry",
    created_at: "2026-09-18T17:21:00Z",
  });
  registry = registerDeploymentExecutionReceipt(registry, {
    receipt,
    registered_at: "2026-09-18T17:22:00Z",
  });

  const index = productionVerificationRegistryIndex(registry);
  assert.equal(index.receipts, 1);
  assert.equal(index.production_accepted, 0);
  assert.equal(index.awaiting_verification, 1);
  assert.equal(registry.deployment_succeeded_auto_accepts_production, false);
});

test("PASS post-deployment verification still requires explicit human production decision", () => {
  const receipt = executionReceipt();
  let registry = createProductionVerificationRegistry({
    registry_key: "PROD-VERIFY",
    title: "Production verification registry",
    created_at: "2026-09-18T17:21:00Z",
  });
  registry = registerDeploymentExecutionReceipt(registry, {
    receipt,
    registered_at: "2026-09-18T17:22:00Z",
  });
  registry = createPostDeploymentVerification(registry, {
    receipt_digest: receipt.receipt_digest,
    observed_git_commit_sha: COMMIT,
    observed_url: "https://example.invalid/prod",
    verified_by: "TW-DVF",
    verified_at: "2026-09-18T17:23:00Z",
    checks: passChecks(),
  });

  const index = productionVerificationRegistryIndex(registry);
  assert.equal(index.states[0].latest_verification_status, "PASS");
  assert.equal(index.pass_without_acceptance, 1);
  assert.equal(index.pending_human_gate, 1);
  assert.equal(index.production_accepted, 0);
  assert.equal(registry.post_deployment_pass_auto_accepts_production, false);
});

test("explicit human production acceptance closes gate only for latest PASS verification", () => {
  const receipt = executionReceipt();
  let registry = createProductionVerificationRegistry({
    registry_key: "PROD-VERIFY",
    title: "Production verification registry",
    created_at: "2026-09-18T17:21:00Z",
  });
  registry = registerDeploymentExecutionReceipt(registry, {
    receipt,
    registered_at: "2026-09-18T17:22:00Z",
  });
  registry = createPostDeploymentVerification(registry, {
    receipt_digest: receipt.receipt_digest,
    observed_git_commit_sha: COMMIT,
    observed_url: "https://example.invalid/prod",
    verified_by: "TW-DVF",
    verified_at: "2026-09-18T17:23:00Z",
    checks: passChecks(),
  });
  const verification = registry.verifications[0];

  registry = decideHumanProductionGate(registry, {
    release_key: receipt.release_key,
    target_environment: receipt.target_environment,
    verification_digest: verification.verification_digest,
    decision: "PRODUCTION_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T17:24:00Z",
    explicit_human_signal: "ACCEPT PRODUCTION",
    rationale: "Explicitly accept latest succeeded deployment with PASS post-deployment verification.",
  });

  const index = productionVerificationRegistryIndex(registry);
  assert.equal(index.production_accepted, 1);
  assert.equal(index.pending_human_gate, 0);
  assert.equal(index.states[0].production_accepted, true);
  assert.equal(registry.decisions[0].human_decision, true);
  assert.equal(registry.decisions[0].machine_can_decide, false);
});

test("FAIL verification cannot be PRODUCTION_ACCEPTED", () => {
  const receipt = executionReceipt();
  let registry = createProductionVerificationRegistry({
    registry_key: "PROD-VERIFY",
    title: "Production verification registry",
    created_at: "2026-09-18T17:21:00Z",
  });
  registry = registerDeploymentExecutionReceipt(registry, {
    receipt,
    registered_at: "2026-09-18T17:22:00Z",
  });
  registry = createPostDeploymentVerification(registry, {
    receipt_digest: receipt.receipt_digest,
    observed_git_commit_sha: COMMIT,
    observed_url: "https://example.invalid/prod",
    verified_by: "TW-DVF",
    verified_at: "2026-09-18T17:23:00Z",
    checks: [{
      check_id: "HEALTH-FAIL",
      kind: "HEALTH",
      expected: "healthy",
      observed: "500",
      result: "FAIL",
      evidence_note: "Health endpoint failed.",
      evidence_text: "health=500",
    }],
  });

  assert.equal(registry.verifications[0].overall_status, "FAIL");
  assert.throws(() => decideHumanProductionGate(registry, {
    release_key: receipt.release_key,
    target_environment: receipt.target_environment,
    verification_digest: registry.verifications[0].verification_digest,
    decision: "PRODUCTION_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T17:24:00Z",
    explicit_human_signal: "ACCEPT FAILED PROD",
    rationale: "Must fail.",
  }), /requires SUCCEEDED receipt and PASS verification/);
});

test("new verification reopens production gate without deleting prior acceptance", () => {
  const receipt = executionReceipt();
  let registry = createProductionVerificationRegistry({
    registry_key: "PROD-VERIFY",
    title: "Production verification registry",
    created_at: "2026-09-18T17:21:00Z",
  });
  registry = registerDeploymentExecutionReceipt(registry, {
    receipt,
    registered_at: "2026-09-18T17:22:00Z",
  });
  registry = createPostDeploymentVerification(registry, {
    receipt_digest: receipt.receipt_digest,
    observed_git_commit_sha: COMMIT,
    observed_url: "https://example.invalid/prod",
    verified_by: "TW-DVF",
    verified_at: "2026-09-18T17:23:00Z",
    checks: passChecks("A"),
  });
  registry = decideHumanProductionGate(registry, {
    release_key: receipt.release_key,
    target_environment: receipt.target_environment,
    verification_digest: registry.verifications[0].verification_digest,
    decision: "PRODUCTION_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T17:24:00Z",
    explicit_human_signal: "ACCEPT PROD A",
    rationale: "Accept first post-deployment verification.",
  });

  registry = createPostDeploymentVerification(registry, {
    receipt_digest: receipt.receipt_digest,
    observed_git_commit_sha: COMMIT,
    observed_url: "https://example.invalid/prod",
    verified_by: "TW-DVF",
    verified_at: "2026-09-18T17:25:00Z",
    checks: passChecks("B"),
  });

  const index = productionVerificationRegistryIndex(registry);
  assert.equal(registry.decisions.length, 1);
  assert.equal(index.states[0].production_accepted, false);
  assert.equal(index.states[0].human_production_gate_pending, true);
  assert.equal(index.pass_without_acceptance, 1);
});

test("new deployment receipt reopens verification and invalidates current production acceptance", () => {
  const firstReceipt = executionReceipt("PROD-RECEIPT-A");
  const secondReceipt = executionReceipt("PROD-RECEIPT-B");

  let registry = createProductionVerificationRegistry({
    registry_key: "PROD-VERIFY",
    title: "Production verification registry",
    created_at: "2026-09-18T17:21:00Z",
  });
  registry = registerDeploymentExecutionReceipt(registry, {
    receipt: firstReceipt,
    registered_at: "2026-09-18T17:22:00Z",
  });
  registry = createPostDeploymentVerification(registry, {
    receipt_digest: firstReceipt.receipt_digest,
    observed_git_commit_sha: COMMIT,
    observed_url: "https://example.invalid/prod",
    verified_by: "TW-DVF",
    verified_at: "2026-09-18T17:23:00Z",
    checks: passChecks("A"),
  });
  registry = decideHumanProductionGate(registry, {
    release_key: firstReceipt.release_key,
    target_environment: firstReceipt.target_environment,
    verification_digest: registry.verifications[0].verification_digest,
    decision: "PRODUCTION_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T17:24:00Z",
    explicit_human_signal: "ACCEPT PROD A",
    rationale: "Accept first receipt.",
  });

  registry = registerDeploymentExecutionReceipt(registry, {
    receipt: secondReceipt,
    registered_at: "2026-09-18T17:26:00Z",
  });

  const index = productionVerificationRegistryIndex(registry);
  assert.equal(index.states[0].latest_receipt_digest, secondReceipt.receipt_digest);
  assert.equal(index.states[0].production_accepted, false);
  assert.equal(index.states[0].verification_required, true);
  assert.equal(index.awaiting_verification, 1);
  assert.equal(registry.decisions.length, 1);
});

test("post-deployment observed commit must match receipt commit", () => {
  const receipt = executionReceipt();
  let registry = createProductionVerificationRegistry({
    registry_key: "PROD-VERIFY",
    title: "Production verification registry",
    created_at: "2026-09-18T17:21:00Z",
  });
  registry = registerDeploymentExecutionReceipt(registry, {
    receipt,
    registered_at: "2026-09-18T17:22:00Z",
  });

  assert.throws(() => createPostDeploymentVerification(registry, {
    receipt_digest: receipt.receipt_digest,
    observed_git_commit_sha: "a".repeat(40),
    observed_url: "https://example.invalid/prod",
    verified_by: "TW-DVF",
    verified_at: "2026-09-18T17:23:00Z",
    checks: passChecks(),
  }), /does not match receipt commit/);
});

test("registry roundtrips and tampering is detected", () => {
  const receipt = executionReceipt();
  let registry = createProductionVerificationRegistry({
    registry_key: "PROD-VERIFY",
    title: "Production verification registry",
    created_at: "2026-09-18T17:21:00Z",
  });
  registry = registerDeploymentExecutionReceipt(registry, {
    receipt,
    registered_at: "2026-09-18T17:22:00Z",
  });
  registry = createPostDeploymentVerification(registry, {
    receipt_digest: receipt.receipt_digest,
    observed_git_commit_sha: COMMIT,
    observed_url: "https://example.invalid/prod",
    verified_by: "TW-DVF",
    verified_at: "2026-09-18T17:23:00Z",
    checks: passChecks(),
  });

  assert.equal(validateProductionVerificationRegistry(registry).ok, true);
  assert.deepEqual(
    parseProductionVerificationRegistry(
      serializeProductionVerificationRegistry(registry),
    ),
    registry,
  );

  const tampered = JSON.parse(JSON.stringify(registry));
  tampered.verifications[0].checks[0].result = "FAIL";
  assert.equal(validateProductionVerificationRegistry(tampered).ok, false);
});
