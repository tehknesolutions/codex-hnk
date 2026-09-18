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
import { verifyResearchReleaseManifest } from "@hnk/reproducibility-verifier";
import {
  createReleaseVerificationRegistry,
  decideHumanReleaseGate,
  parseReleaseVerificationRegistry,
  registerReleaseVerificationReport,
  releaseVerificationRegistryIndex,
  serializeReleaseVerificationRegistry,
  validateReleaseVerificationRegistry,
} from "../src/index.mjs";

const CONTRACT_SOURCE = "export const CONTRACT = \"V1\";\n";
const VALIDATOR_SOURCE = "console.log(\"PASS\");\n";
const COMMIT = "a14e9162020c7d51b87f86727cf714cc810f4e52";

function releaseManifest() {
  const snapshot = createResearchWorkspaceSnapshot({
    snapshot_key: "GATE-SNAPSHOT",
    label: "Gate snapshot",
    created_at: "2026-09-18T14:00:00Z",
    artifact_library: createResearchArtifactLibrary({
      library_key: "GATE-LIB",
      title: "Gate library",
      created_at: "2026-09-18T13:50:00Z",
    }),
    reviewed_claim_registry: createReviewedClaimRegistry({
      registry_key: "GATE-REVIEWED",
      title: "Gate reviewed",
      created_at: "2026-09-18T13:50:00Z",
    }),
    claim_reevaluation_queue: createClaimReevaluationQueue({
      queue_key: "GATE-QUEUE",
      title: "Gate queue",
      created_at: "2026-09-18T13:50:00Z",
    }),
  });

  let timeline = createWorkspaceSnapshotRegistry({
    registry_key: "GATE-TIMELINE",
    title: "Gate timeline",
    created_at: "2026-09-18T13:50:00Z",
  });
  timeline = registerWorkspaceSnapshot(timeline, {
    snapshot,
    registered_at: "2026-09-18T14:01:00Z",
  });
  timeline = moveWorkspaceSnapshotHead(timeline, {
    to_snapshot_digest: snapshot.snapshot_digest,
    moved_at: "2026-09-18T14:02:00Z",
    reason: "Select release gate fixture HEAD",
    explicit_human_signal: "SET GATE HEAD",
  });

  const contract = createReleaseContractBinding({
    contract_id: "GATE-CONTRACT",
    contract_version: "1.0.0",
    package_name: "@hnk/gate-contract",
    source_path: "packages/gate-contract/src/index.mjs",
    source_text: CONTRACT_SOURCE,
  });
  const validator = createReleaseValidatorBinding({
    validator_id: "GATE-VALIDATOR",
    source_path: "scripts/gate-validator.mjs",
    source_text: VALIDATOR_SOURCE,
    result: "PASS",
    executed_at: "2026-09-18T14:03:00Z",
    environment: "fixture-node-22",
    evidence_note: "Fixture validator passed.",
  });

  return createResearchReleaseManifest({
    release_key: "RELEASE-GATE-001",
    label: "Release gate fixture",
    created_at: "2026-09-18T14:04:00Z",
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
    contracts: [contract],
    validators: [validator],
    reproduction: {
      install_command: "corepack pnpm install --frozen-lockfile",
      validation_commands: ["node scripts/gate-validator.mjs"],
      build_command: "node scripts/build-web-vercel.mjs",
      notes: ["Gate fixture."],
    },
  });
}

function verificationReport({ drift = false, generatedAt = "2026-09-18T14:05:00Z" } = {}) {
  const manifest = releaseManifest();
  return verifyResearchReleaseManifest(
    manifest,
    {
      git: {
        repository_full_name: "https://github.com/tehknesolutions/codex-hnk.git",
        commit_sha: drift
          ? "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
          : COMMIT,
        ref: "main",
      },
      runtime: {
        node_engine: "22.x",
        package_manager: "pnpm@12.1.0",
      },
      files: [
        {
          source_path: "packages/gate-contract/src/index.mjs",
          source_text: CONTRACT_SOURCE,
        },
        {
          source_path: "scripts/gate-validator.mjs",
          source_text: VALIDATOR_SOURCE,
        },
      ],
      validator_executions: [
        {
          validator_id: "GATE-VALIDATOR",
          result: "PASS",
          executed_at: generatedAt,
          environment: "fixture-node-22",
        },
      ],
    },
    { generated_at: generatedAt },
  );
}

test("MATCH report registration does not auto-accept release", () => {
  let registry = createReleaseVerificationRegistry({
    registry_key: "RELEASE-VERIFY",
    title: "Release verification registry",
    created_at: "2026-09-18T14:00:00Z",
  });
  const report = verificationReport();

  registry = registerReleaseVerificationReport(registry, {
    report,
    registered_at: "2026-09-18T14:06:00Z",
  });

  const index = releaseVerificationRegistryIndex(registry);
  assert.equal(index.reports, 1);
  assert.equal(index.accepted_releases, 0);
  assert.equal(index.pending_human_gate, 1);
  assert.equal(index.match_reports_without_acceptance, 1);
  assert.equal(index.statuses[0].latest_report_status, "MATCH");
  assert.equal(index.statuses[0].accepted, false);
  assert.equal(registry.match_auto_accepts_release, false);
});

test("explicit human acceptance of specific MATCH report closes latest gate", () => {
  const report = verificationReport();
  let registry = createReleaseVerificationRegistry({
    registry_key: "RELEASE-VERIFY",
    title: "Release verification registry",
    created_at: "2026-09-18T14:00:00Z",
  });
  registry = registerReleaseVerificationReport(registry, {
    report,
    registered_at: "2026-09-18T14:06:00Z",
  });
  registry = decideHumanReleaseGate(registry, {
    release_key: report.release_key,
    report_digest: report.report_digest,
    decision: "RELEASE_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T14:07:00Z",
    explicit_human_signal: "ACCEPT RELEASE",
    rationale: "Explicit human acceptance of the bound MATCH verification report.",
  });

  const index = releaseVerificationRegistryIndex(registry);
  assert.equal(index.accepted_releases, 1);
  assert.equal(index.pending_human_gate, 0);
  assert.equal(index.statuses[0].current_decision, "RELEASE_ACCEPTED");
  assert.equal(index.statuses[0].current_decision_report_digest, report.report_digest);
  assert.equal(index.statuses[0].current_decision_is_on_latest_report, true);
  assert.equal(index.statuses[0].accepted, true);
  assert.equal(registry.decisions[0].human_decision, true);
  assert.equal(registry.decisions[0].machine_can_decide, false);
});

test("new report reopens human gate without deleting prior acceptance", () => {
  const first = verificationReport({ generatedAt: "2026-09-18T14:05:00Z" });
  const second = verificationReport({ generatedAt: "2026-09-18T14:08:00Z" });

  let registry = createReleaseVerificationRegistry({
    registry_key: "RELEASE-VERIFY",
    title: "Release verification registry",
    created_at: "2026-09-18T14:00:00Z",
  });
  registry = registerReleaseVerificationReport(registry, {
    report: first,
    registered_at: "2026-09-18T14:06:00Z",
  });
  registry = decideHumanReleaseGate(registry, {
    release_key: first.release_key,
    report_digest: first.report_digest,
    decision: "RELEASE_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T14:07:00Z",
    explicit_human_signal: "ACCEPT FIRST REPORT",
    rationale: "First report explicitly accepted.",
  });
  registry = registerReleaseVerificationReport(registry, {
    report: second,
    registered_at: "2026-09-18T14:09:00Z",
  });

  const index = releaseVerificationRegistryIndex(registry);
  assert.equal(registry.decisions.length, 1);
  assert.equal(index.statuses[0].report_count, 2);
  assert.equal(index.statuses[0].accepted, false);
  assert.equal(index.statuses[0].human_gate_pending, true);
  assert.equal(index.statuses[0].current_decision_report_digest, first.report_digest);
  assert.equal(index.statuses[0].latest_report_digest, second.report_digest);
});

test("non-MATCH acceptance requires explicit override acknowledgement", () => {
  const report = verificationReport({
    drift: true,
    generatedAt: "2026-09-18T14:10:00Z",
  });
  assert.equal(report.overall_status, "DRIFT");

  let registry = createReleaseVerificationRegistry({
    registry_key: "RELEASE-VERIFY",
    title: "Release verification registry",
    created_at: "2026-09-18T14:00:00Z",
  });
  registry = registerReleaseVerificationReport(registry, {
    report,
    registered_at: "2026-09-18T14:11:00Z",
  });

  assert.throws(() => decideHumanReleaseGate(registry, {
    release_key: report.release_key,
    report_digest: report.report_digest,
    decision: "RELEASE_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T14:12:00Z",
    explicit_human_signal: "ACCEPT WITH DRIFT",
    rationale: "Would require explicit override acknowledgement.",
  }), /non_match_override_acknowledged=true/);

  registry = decideHumanReleaseGate(registry, {
    release_key: report.release_key,
    report_digest: report.report_digest,
    decision: "RELEASE_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T14:13:00Z",
    explicit_human_signal: "ACCEPT WITH EXPLICIT OVERRIDE",
    rationale: "Human explicitly accepts known drift for this release report.",
    non_match_override_acknowledged: true,
  });

  const index = releaseVerificationRegistryIndex(registry);
  assert.equal(index.statuses[0].accepted, true);
  assert.equal(registry.decisions[0].non_match_override_acknowledged, true);
});

test("decision history supersedes non-destructively and can reject after acceptance", () => {
  const report = verificationReport();
  let registry = createReleaseVerificationRegistry({
    registry_key: "RELEASE-VERIFY",
    title: "Release verification registry",
    created_at: "2026-09-18T14:00:00Z",
  });
  registry = registerReleaseVerificationReport(registry, {
    report,
    registered_at: "2026-09-18T14:06:00Z",
  });
  registry = decideHumanReleaseGate(registry, {
    release_key: report.release_key,
    report_digest: report.report_digest,
    decision: "RELEASE_ACCEPTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T14:07:00Z",
    explicit_human_signal: "ACCEPT",
    rationale: "Accepted.",
  });
  registry = decideHumanReleaseGate(registry, {
    release_key: report.release_key,
    report_digest: report.report_digest,
    decision: "RELEASE_REJECTED",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T14:08:00Z",
    explicit_human_signal: "REJECT",
    rationale: "Human later rejects this release state.",
  });

  const index = releaseVerificationRegistryIndex(registry);
  assert.equal(registry.decisions.length, 2);
  assert.equal(
    registry.decisions[1].supersedes_decision_id,
    registry.decisions[0].decision_id,
  );
  assert.equal(index.statuses[0].current_decision, "RELEASE_REJECTED");
  assert.equal(index.statuses[0].accepted, false);
  assert.equal(index.statuses[0].human_gate_pending, false);
});

test("registry roundtrips and report/decision tampering is detected", () => {
  const report = verificationReport();
  let registry = createReleaseVerificationRegistry({
    registry_key: "RELEASE-VERIFY",
    title: "Release verification registry",
    created_at: "2026-09-18T14:00:00Z",
  });
  registry = registerReleaseVerificationReport(registry, {
    report,
    registered_at: "2026-09-18T14:06:00Z",
  });
  registry = decideHumanReleaseGate(registry, {
    release_key: report.release_key,
    report_digest: report.report_digest,
    decision: "RELEASE_HELD",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T14:07:00Z",
    explicit_human_signal: "HOLD RELEASE",
    rationale: "Hold pending external QA.",
  });

  assert.equal(validateReleaseVerificationRegistry(registry).ok, true);
  assert.deepEqual(
    parseReleaseVerificationRegistry(
      serializeReleaseVerificationRegistry(registry),
    ),
    registry,
  );

  const tampered = JSON.parse(JSON.stringify(registry));
  tampered.decisions[0].decision = "RELEASE_ACCEPTED";
  assert.equal(validateReleaseVerificationRegistry(tampered).ok, false);
});

test("duplicate report digest and decision on unknown report fail closed", () => {
  const report = verificationReport();
  let registry = createReleaseVerificationRegistry({
    registry_key: "RELEASE-VERIFY",
    title: "Release verification registry",
    created_at: "2026-09-18T14:00:00Z",
  });
  registry = registerReleaseVerificationReport(registry, {
    report,
    registered_at: "2026-09-18T14:06:00Z",
  });

  assert.throws(() => registerReleaseVerificationReport(registry, {
    report,
    registered_at: "2026-09-18T14:07:00Z",
  }), /already registered/);

  assert.throws(() => decideHumanReleaseGate(registry, {
    release_key: report.release_key,
    report_digest: "a".repeat(64),
    decision: "RELEASE_HELD",
    reviewer: "TW-DVF",
    decided_at: "2026-09-18T14:08:00Z",
    explicit_human_signal: "HOLD UNKNOWN",
    rationale: "Must fail.",
  }), /must be registered/);
});
