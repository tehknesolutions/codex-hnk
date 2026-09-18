import test from "node:test";
import assert from "node:assert/strict";
import { createClaimReevaluationQueue } from "@hnk/claim-reevaluation-queue";
import {
  createDeploymentGateRegistry,
  decideHumanDeploymentGate,
  nominateDeploymentCandidate,
} from "@hnk/deployment-gate-registry";
import { sha256Hex } from "@hnk/experiment-attestation";
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
import { createReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";
import {
  createReleaseVerificationRegistry,
  decideHumanReleaseGate,
  registerReleaseVerificationReport,
} from "@hnk/release-verification-registry";
import { verifyResearchReleaseManifest } from "@hnk/reproducibility-verifier";
import {
  createDeploymentExecutionReceipt,
  parseDeploymentExecutionReceipt,
  serializeDeploymentExecutionReceipt,
  validateDeploymentExecutionReceipt,
} from "../src/index.mjs";

const CONTRACT_SOURCE = "export const RECEIPT_FIXTURE = \"V1\";\n";
const VALIDATOR_SOURCE = "console.log(\"PASS\");\n";
const PROVIDER_PAYLOAD = "{\"id\":\"dpl_fixture\",\"state\":\"READY\"}\n";
const COMMIT = "e00d97bbd3d1955e9eb193906c03db3badba2da4";

function releaseManifest() {
  const snapshot = createResearchWorkspaceSnapshot({
    snapshot_key: "RECEIPT-SNAPSHOT",
    label: "Receipt snapshot",
    created_at: "2026-09-18T16:00:00Z",
    artifact_library: createResearchArtifactLibrary({
      library_key: "RECEIPT-LIB",
      title: "Receipt library",
      created_at: "2026-09-18T15:50:00Z",
    }),
    reviewed_claim_registry: createReviewedClaimRegistry({
      registry_key: "RECEIPT-REVIEWED",
      title: "Receipt reviewed",
      created_at: "2026-09-18T15:50:00Z",
    }),
    claim_reevaluation_queue: createClaimReevaluationQueue({
      queue_key: "RECEIPT-QUEUE",
      title: "Receipt queue",
      created_at: "2026-09-18T15:50:00Z",
    }),
  });

  let timeline = createWorkspaceSnapshotRegistry({
    registry_key: "RECEIPT-TIMELINE",
    title: "Receipt timeline",
    created_at: "2026-09-18T15:50:00Z",
  });
  timeline = registerWorkspaceSnapshot(timeline, {
    snapshot,
    registered_at: "2026-09-18T16:01:00Z",
  });
  timeline = moveWorkspaceSnapshotHead(timeline, {
    to_snapshot_digest: snapshot.snapshot_digest,
    moved_at: "2026-09-18T16:02:00Z",
    reason: "Select receipt fixture HEAD",
    explicit_human_signal: "SET RECEIPT HEAD",
  });

  return createResearchReleaseManifest({
    release_key: "RECEIPT-RELEASE-001",
    label: "Receipt release fixture",
    created_at: "2026-09-18T16:03:00Z",
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
      contract_id: "RECEIPT-CONTRACT",
      contract_version: "1.0.0",
      package_name: "@hnk/receipt-contract",
      source_path: "packages/receipt-contract/src/index.mjs",
      source_text: CONTRACT_SOURCE,
    })],
    validators: [createReleaseValidatorBinding({
      validator_id: "RECEIPT-VALIDATOR",
      source_path: "scripts/receipt-validator.mjs",
      source_text: VALIDATOR_SOURCE,
      result: "PASS",
      executed_at: "2026-09-18T16:04:00Z",
      environment: "fixture-node-22",
      evidence_note: "Fixture validator passed.",
    })],
    reproduction: {
      install_command: "corepack pnpm install --frozen-lockfile",
      validation_commands: ["node scripts/receipt-validator.mjs"],
      build_command: "node scripts/build-web-vercel.mjs",
      notes: ["Receipt fixture."],
    },
  });
}

function verificationReport(generatedAt) {
  const manifest = releaseManifest();
  return verifyResearchReleaseManifest(
    manifest,
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
          source_path: "packages/receipt-contract/src/index.mjs",
          source_text: CONTRACT_SOURCE,
        },
        {
          source_path: "scripts/receipt-validator.mjs",
          source_text: VALIDATOR_SOURCE,
        },
      ],
      validator_executions: [{
        validator_id: "RECEIPT-VALIDATOR",
        result: "PASS",
        executed_at: generatedAt,
        environment: "fixture-node-22",
      }],
    },
    { generated_at: generatedAt },
  );
}

function approvedState() {
  const report = verificationReport("2026-09-18T16:05:00Z");

  let releaseRegistry = createReleaseVerificationRegistry({
    registry_key: "RECEIPT-RELEASE-VERIFY",
    title: "Receipt release verification",
    created_at: "2026-09-18T16:05:30Z",
  });
  releaseRegistry = registerReleaseVerificationReport(releaseRegistry, {
    report,
    registered_at: "2026-09-18T16:06:00Z",
  });
  releaseRegistry = decideHumanReleaseGate(releaseRegistry, {
    release_key: report.release_key,
    report_digest: report.report_digest,
    decision: "RELEASE_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T16:07:00Z",
    explicit_human_signal: "ACCEPT RECEIPT RELEASE",
    rationale: "Release accepted; deployment execution remains separate.",
  });

  let deploymentRegistry = createDeploymentGateRegistry({
    registry_key: "RECEIPT-DEPLOY-GATE",
    title: "Receipt deployment gate",
    created_at: "2026-09-18T16:08:00Z",
  });
  deploymentRegistry = nominateDeploymentCandidate(deploymentRegistry, {
    release_verification_registry: releaseRegistry,
    release_key: report.release_key,
    target_environment: "production",
    nominated_by: "TW-DVF",
    nominated_at: "2026-09-18T16:09:00Z",
    explicit_human_signal: "NOMINATE RECEIPT RELEASE",
    rationale: "Nominate accepted release for production.",
  });
  const candidate = deploymentRegistry.candidates[0];
  deploymentRegistry = decideHumanDeploymentGate(deploymentRegistry, {
    release_verification_registry: releaseRegistry,
    candidate_id: candidate.candidate_id,
    decision: "DEPLOYMENT_APPROVED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T16:10:00Z",
    explicit_human_signal: "APPROVE RECEIPT DEPLOYMENT",
    rationale: "Approve exact candidate while current.",
  });

  return { report, releaseRegistry, deploymentRegistry, candidate };
}

function receiptInput(state, result = "SUCCEEDED") {
  return {
    receipt_key: "RECEIPT-EXEC-001",
    created_at: "2026-09-18T16:20:00Z",
    deployment_gate_registry: state.deploymentRegistry,
    release_verification_registry: state.releaseRegistry,
    candidate_id: state.candidate.candidate_id,
    observed_git_commit_sha: COMMIT,
    provider: {
      name: "Vercel",
      deployment_id: "dpl_fixture",
      deployment_url: "https://example.invalid/deployment",
      result,
      provider_payload_text: PROVIDER_PAYLOAD,
    },
    execution: {
      started_at: "2026-09-18T16:15:00Z",
      completed_at: "2026-09-18T16:18:00Z",
      observed_by: "TW-DVF",
      observed_at: "2026-09-18T16:19:00Z",
      evidence_note: "Fixture provider metadata observed after execution.",
    },
  };
}

test("currently approved candidate creates integrity-bound execution receipt", () => {
  const state = approvedState();
  const receipt = createDeploymentExecutionReceipt(receiptInput(state));

  assert.equal(validateDeploymentExecutionReceipt(receipt).ok, true);
  assert.equal(receipt.release_key, state.report.release_key);
  assert.equal(receipt.candidate_id, state.candidate.candidate_id);
  assert.equal(receipt.expected_git_commit_sha, COMMIT);
  assert.equal(receipt.observed_git_commit_sha, COMMIT);
  assert.equal(receipt.provider.result, "SUCCEEDED");
  assert.equal(
    receipt.execution.provider_payload_digest,
    sha256Hex(PROVIDER_PAYLOAD),
  );
  assert.equal(receipt.deployment_authorization_current_at_receipt_creation, true);
  assert.equal(receipt.deployment_execution_recorded, true);
  assert.equal(receipt.deployment_execution_performed_by_contract, false);
  assert.equal(receipt.provider_signature_verified, false);
  assert.equal(receipt.production_readiness_inferred, false);
  assert.equal(receipt.canon_promotion_permitted, false);
});

test("candidate without human deployment approval cannot produce receipt", () => {
  const state = approvedState();
  const unapprovedRegistry = createDeploymentGateRegistry({
    registry_key: "UNAPPROVED-DEPLOY",
    title: "Unapproved deployment",
    created_at: "2026-09-18T16:11:00Z",
  });
  const nominated = nominateDeploymentCandidate(unapprovedRegistry, {
    release_verification_registry: state.releaseRegistry,
    release_key: state.report.release_key,
    target_environment: "production",
    nominated_by: "TW-DVF",
    nominated_at: "2026-09-18T16:12:00Z",
    explicit_human_signal: "NOMINATE ONLY",
    rationale: "Nominate without approval.",
  });

  assert.throws(() => createDeploymentExecutionReceipt({
    ...receiptInput(state),
    deployment_gate_registry: nominated,
    candidate_id: nominated.candidates[0].candidate_id,
  }), /requires currently approved candidate/);
});

test("observed deployed commit must exactly match approved release commit", () => {
  const state = approvedState();
  assert.throws(() => createDeploymentExecutionReceipt({
    ...receiptInput(state),
    observed_git_commit_sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  }), /does not match approved release commit/);
});

test("new verification report stales prior authorization and blocks receipt creation", () => {
  const state = approvedState();
  const newerReport = verificationReport("2026-09-18T16:21:00Z");
  const changedReleaseRegistry = registerReleaseVerificationReport(
    state.releaseRegistry,
    {
      report: newerReport,
      registered_at: "2026-09-18T16:22:00Z",
    },
  );

  assert.throws(() => createDeploymentExecutionReceipt({
    ...receiptInput(state),
    release_verification_registry: changedReleaseRegistry,
  }), /requires currently approved candidate/);
});

test("FAILED execution is a valid factual receipt and never infers readiness", () => {
  const state = approvedState();
  const receipt = createDeploymentExecutionReceipt(
    receiptInput(state, "FAILED"),
  );

  assert.equal(receipt.provider.result, "FAILED");
  assert.equal(receipt.deployment_execution_recorded, true);
  assert.equal(receipt.production_readiness_inferred, false);
  assert.equal(receipt.truth_assessed, false);
});

test("receipt roundtrips and tampering invalidates receipt digest", () => {
  const receipt = createDeploymentExecutionReceipt(receiptInput(approvedState()));
  assert.deepEqual(
    parseDeploymentExecutionReceipt(
      serializeDeploymentExecutionReceipt(receipt),
    ),
    receipt,
  );

  const tampered = JSON.parse(JSON.stringify(receipt));
  tampered.provider.result = "FAILED";
  assert.equal(validateDeploymentExecutionReceipt(tampered).ok, false);
});
