import test from "node:test";
import assert from "node:assert/strict";
import { createClaimReevaluationQueue } from "@hnk/claim-reevaluation-queue";
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
  createDeploymentGateRegistry,
  decideHumanDeploymentGate,
  deploymentGateRegistryIndex,
  evaluateDeploymentCandidate,
  nominateDeploymentCandidate,
  parseDeploymentGateRegistry,
  serializeDeploymentGateRegistry,
  validateDeploymentGateRegistry,
} from "../src/index.mjs";

const CONTRACT_SOURCE = "export const DEPLOY_FIXTURE = \"V1\";\n";
const VALIDATOR_SOURCE = "console.log(\"PASS\");\n";
const COMMIT = "6204049d75eabdae4961be102f890bbea140addd";

function manifest() {
  const snapshot = createResearchWorkspaceSnapshot({
    snapshot_key: "DEPLOY-SNAPSHOT",
    label: "Deploy snapshot",
    created_at: "2026-09-18T15:00:00Z",
    artifact_library: createResearchArtifactLibrary({
      library_key: "DEPLOY-LIB",
      title: "Deploy library",
      created_at: "2026-09-18T14:50:00Z",
    }),
    reviewed_claim_registry: createReviewedClaimRegistry({
      registry_key: "DEPLOY-REVIEWED",
      title: "Deploy reviewed",
      created_at: "2026-09-18T14:50:00Z",
    }),
    claim_reevaluation_queue: createClaimReevaluationQueue({
      queue_key: "DEPLOY-QUEUE",
      title: "Deploy queue",
      created_at: "2026-09-18T14:50:00Z",
    }),
  });

  let timeline = createWorkspaceSnapshotRegistry({
    registry_key: "DEPLOY-TIMELINE",
    title: "Deploy timeline",
    created_at: "2026-09-18T14:50:00Z",
  });
  timeline = registerWorkspaceSnapshot(timeline, {
    snapshot,
    registered_at: "2026-09-18T15:01:00Z",
  });
  timeline = moveWorkspaceSnapshotHead(timeline, {
    to_snapshot_digest: snapshot.snapshot_digest,
    moved_at: "2026-09-18T15:02:00Z",
    reason: "Select deploy fixture HEAD",
    explicit_human_signal: "SET DEPLOY HEAD",
  });

  return createResearchReleaseManifest({
    release_key: "DEPLOY-RELEASE-001",
    label: "Deploy release fixture",
    created_at: "2026-09-18T15:03:00Z",
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
      contract_id: "DEPLOY-CONTRACT",
      contract_version: "1.0.0",
      package_name: "@hnk/deploy-contract",
      source_path: "packages/deploy-contract/src/index.mjs",
      source_text: CONTRACT_SOURCE,
    })],
    validators: [createReleaseValidatorBinding({
      validator_id: "DEPLOY-VALIDATOR",
      source_path: "scripts/deploy-validator.mjs",
      source_text: VALIDATOR_SOURCE,
      result: "PASS",
      executed_at: "2026-09-18T15:04:00Z",
      environment: "fixture-node-22",
      evidence_note: "Fixture validator passed.",
    })],
    reproduction: {
      install_command: "corepack pnpm install --frozen-lockfile",
      validation_commands: ["node scripts/deploy-validator.mjs"],
      build_command: "node scripts/build-web-vercel.mjs",
      notes: ["Deploy fixture only."],
    },
  });
}

function report(generatedAt) {
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
          source_path: "packages/deploy-contract/src/index.mjs",
          source_text: CONTRACT_SOURCE,
        },
        {
          source_path: "scripts/deploy-validator.mjs",
          source_text: VALIDATOR_SOURCE,
        },
      ],
      validator_executions: [
        {
          validator_id: "DEPLOY-VALIDATOR",
          result: "PASS",
          executed_at: generatedAt,
          environment: "fixture-node-22",
        },
      ],
    },
    { generated_at: generatedAt },
  );
}

function acceptedReleaseRegistry() {
  const verificationReport = report("2026-09-18T15:05:00Z");
  let registry = createReleaseVerificationRegistry({
    registry_key: "DEPLOY-RELEASE-VERIFY",
    title: "Deploy release verification",
    created_at: "2026-09-18T15:05:30Z",
  });
  registry = registerReleaseVerificationReport(registry, {
    report: verificationReport,
    registered_at: "2026-09-18T15:06:00Z",
  });
  registry = decideHumanReleaseGate(registry, {
    release_key: verificationReport.release_key,
    report_digest: verificationReport.report_digest,
    decision: "RELEASE_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T15:07:00Z",
    explicit_human_signal: "ACCEPT RELEASE FOR DEPLOYMENT CANDIDACY",
    rationale: "Release accepted; deployment remains a separate gate.",
  });
  return { registry, verificationReport };
}

function deploymentRegistry() {
  return createDeploymentGateRegistry({
    registry_key: "DEPLOY-GATE",
    title: "Deployment gate registry",
    created_at: "2026-09-18T15:08:00Z",
  });
}

function nominate(registry, releaseVerificationRegistry) {
  return nominateDeploymentCandidate(registry, {
    release_verification_registry: releaseVerificationRegistry,
    release_key: "DEPLOY-RELEASE-001",
    target_environment: "production",
    nominated_by: "TW-DVF",
    nominated_at: "2026-09-18T15:09:00Z",
    explicit_human_signal: "NOMINATE FOR PRODUCTION",
    rationale: "Nominate accepted release as a deployment candidate without deploying it.",
  });
}

test("RELEASE_ACCEPTED does not auto-approve deployment", () => {
  const { registry: releaseRegistry } = acceptedReleaseRegistry();
  let deploy = deploymentRegistry();
  deploy = nominate(deploy, releaseRegistry);

  const candidate = deploy.candidates[0];
  const evaluation = evaluateDeploymentCandidate(
    deploy,
    releaseRegistry,
    candidate.candidate_id,
  );

  assert.equal(evaluation.eligibility_status, "ELIGIBLE");
  assert.equal(evaluation.release_accepted, true);
  assert.equal(evaluation.approved_for_deployment, false);
  assert.equal(evaluation.human_deployment_gate_pending, true);
  assert.equal(deploy.release_accepted_auto_approves_deployment, false);
  assert.equal(deploy.machine_can_approve_deployment, false);
  assert.equal(candidate.deployment_executed, false);
});

test("unaccepted release cannot be nominated for deployment", () => {
  const verificationReport = report("2026-09-18T15:10:00Z");
  let releaseRegistry = createReleaseVerificationRegistry({
    registry_key: "UNACCEPTED",
    title: "Unaccepted release registry",
    created_at: "2026-09-18T15:10:30Z",
  });
  releaseRegistry = registerReleaseVerificationReport(releaseRegistry, {
    report: verificationReport,
    registered_at: "2026-09-18T15:11:00Z",
  });

  assert.throws(
    () => nominate(deploymentRegistry(), releaseRegistry),
    /must be currently RELEASE_ACCEPTED/,
  );
});

test("explicit human deployment approval authorizes only current eligible candidate", () => {
  const { registry: releaseRegistry } = acceptedReleaseRegistry();
  let deploy = nominate(deploymentRegistry(), releaseRegistry);
  const candidate = deploy.candidates[0];

  deploy = decideHumanDeploymentGate(deploy, {
    release_verification_registry: releaseRegistry,
    candidate_id: candidate.candidate_id,
    decision: "DEPLOYMENT_APPROVED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T15:12:00Z",
    explicit_human_signal: "APPROVE DEPLOYMENT",
    rationale: "Explicitly authorize this exact eligible candidate for production deployment.",
  });

  const evaluation = evaluateDeploymentCandidate(
    deploy,
    releaseRegistry,
    candidate.candidate_id,
  );
  assert.equal(evaluation.eligibility_status, "ELIGIBLE");
  assert.equal(evaluation.latest_deployment_decision, "DEPLOYMENT_APPROVED");
  assert.equal(evaluation.approved_for_deployment, true);
  assert.equal(evaluation.deployment_executed, false);
  assert.equal(deploy.decisions[0].human_decision, true);
  assert.equal(deploy.decisions[0].machine_can_decide, false);
});

test("new release verification report makes prior deployment candidate stale", () => {
  const { registry: acceptedRegistry } = acceptedReleaseRegistry();
  let deploy = nominate(deploymentRegistry(), acceptedRegistry);
  const candidate = deploy.candidates[0];

  deploy = decideHumanDeploymentGate(deploy, {
    release_verification_registry: acceptedRegistry,
    candidate_id: candidate.candidate_id,
    decision: "DEPLOYMENT_APPROVED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T15:12:00Z",
    explicit_human_signal: "APPROVE DEPLOYMENT",
    rationale: "Approve current candidate.",
  });

  const newerReport = report("2026-09-18T15:13:00Z");
  let changedReleaseRegistry = registerReleaseVerificationReport(
    acceptedRegistry,
    {
      report: newerReport,
      registered_at: "2026-09-18T15:14:00Z",
    },
  );

  const stale = evaluateDeploymentCandidate(
    deploy,
    changedReleaseRegistry,
    candidate.candidate_id,
  );
  assert.equal(stale.eligibility_status, "STALE_RELEASE_STATE");
  assert.equal(stale.release_accepted, false);
  assert.equal(stale.approved_for_deployment, false);

  assert.throws(
    () => decideHumanDeploymentGate(deploy, {
      release_verification_registry: changedReleaseRegistry,
      candidate_id: candidate.candidate_id,
      decision: "DEPLOYMENT_APPROVED",
      reviewer: "TW-DVF",
      decided_at: "2026-09-18T15:15:00Z",
      explicit_human_signal: "REAPPROVE STALE CANDIDATE",
      rationale: "Must fail because release evidence changed.",
    }),
    /requires ELIGIBLE candidate/,
  );

  changedReleaseRegistry = decideHumanReleaseGate(changedReleaseRegistry, {
    release_key: newerReport.release_key,
    report_digest: newerReport.report_digest,
    decision: "RELEASE_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T15:16:00Z",
    explicit_human_signal: "ACCEPT NEW REPORT",
    rationale: "Accept new report; old deployment candidate must still remain stale.",
  });

  const stillStale = evaluateDeploymentCandidate(
    deploy,
    changedReleaseRegistry,
    candidate.candidate_id,
  );
  assert.equal(stillStale.eligibility_status, "STALE_RELEASE_STATE");
  assert.equal(stillStale.release_accepted, true);
  assert.equal(stillStale.approved_for_deployment, false);
});

test("deployment decision history is non-destructive and latest decision controls authorization", () => {
  const { registry: releaseRegistry } = acceptedReleaseRegistry();
  let deploy = nominate(deploymentRegistry(), releaseRegistry);
  const candidate = deploy.candidates[0];

  deploy = decideHumanDeploymentGate(deploy, {
    release_verification_registry: releaseRegistry,
    candidate_id: candidate.candidate_id,
    decision: "DEPLOYMENT_APPROVED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T15:12:00Z",
    explicit_human_signal: "APPROVE",
    rationale: "Approve candidate.",
  });
  deploy = decideHumanDeploymentGate(deploy, {
    release_verification_registry: releaseRegistry,
    candidate_id: candidate.candidate_id,
    decision: "DEPLOYMENT_HELD",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T15:13:00Z",
    explicit_human_signal: "HOLD",
    rationale: "Hold deployment without deleting prior approval.",
  });

  assert.equal(deploy.decisions.length, 2);
  assert.equal(
    deploy.decisions[1].supersedes_deployment_decision_id,
    deploy.decisions[0].deployment_decision_id,
  );

  const evaluation = evaluateDeploymentCandidate(
    deploy,
    releaseRegistry,
    candidate.candidate_id,
  );
  assert.equal(evaluation.latest_deployment_decision, "DEPLOYMENT_HELD");
  assert.equal(evaluation.approved_for_deployment, false);

  const index = deploymentGateRegistryIndex(deploy);
  assert.equal(index.recorded_approvals, 0);
  assert.equal(index.recorded_holds, 1);
  assert.equal(index.decisions, 2);
});

test("registry roundtrips and candidate/decision tampering is detected", () => {
  const { registry: releaseRegistry } = acceptedReleaseRegistry();
  let deploy = nominate(deploymentRegistry(), releaseRegistry);
  const candidate = deploy.candidates[0];

  deploy = decideHumanDeploymentGate(deploy, {
    release_verification_registry: releaseRegistry,
    candidate_id: candidate.candidate_id,
    decision: "DEPLOYMENT_REJECTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T15:12:00Z",
    explicit_human_signal: "REJECT DEPLOYMENT",
    rationale: "Reject deployment while preserving candidate history.",
  });

  assert.equal(validateDeploymentGateRegistry(deploy).ok, true);
  assert.deepEqual(
    parseDeploymentGateRegistry(serializeDeploymentGateRegistry(deploy)),
    deploy,
  );

  const tampered = JSON.parse(JSON.stringify(deploy));
  tampered.decisions[0].decision = "DEPLOYMENT_APPROVED";
  assert.equal(validateDeploymentGateRegistry(tampered).ok, false);
});

test("unknown candidate evaluation is explicit and never authorized", () => {
  const { registry: releaseRegistry } = acceptedReleaseRegistry();
  const evaluation = evaluateDeploymentCandidate(
    deploymentRegistry(),
    releaseRegistry,
    "UNKNOWN-CANDIDATE",
  );

  assert.equal(evaluation.eligibility_status, "CANDIDATE_NOT_FOUND");
  assert.equal(evaluation.approved_for_deployment, false);
  assert.equal(evaluation.deployment_executed, false);
});
