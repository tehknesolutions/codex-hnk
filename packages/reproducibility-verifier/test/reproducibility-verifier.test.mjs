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
  parseReproducibilityVerificationReport,
  serializeReproducibilityVerificationReport,
  validateReproducibilityVerificationReport,
  verifyResearchReleaseManifest,
} from "../src/index.mjs";

const CONTRACT_SOURCE = "export const CONTRACT = \"V1\";\n";
const VALIDATOR_SOURCE = "#!/usr/bin/env node\nconsole.log(\"PASS\");\n";
const COMMIT = "04dbc960d7d64cc0efead34041c864497eec798d";

function manifest() {
  const snapshot = createResearchWorkspaceSnapshot({
    snapshot_key: "VERIFY-SNAPSHOT",
    label: "Verifier snapshot",
    created_at: "2026-09-18T13:00:00Z",
    artifact_library: createResearchArtifactLibrary({
      library_key: "VERIFY-LIB",
      title: "Verifier library",
      created_at: "2026-09-18T12:50:00Z",
    }),
    reviewed_claim_registry: createReviewedClaimRegistry({
      registry_key: "VERIFY-REVIEWED",
      title: "Verifier reviewed",
      created_at: "2026-09-18T12:50:00Z",
    }),
    claim_reevaluation_queue: createClaimReevaluationQueue({
      queue_key: "VERIFY-QUEUE",
      title: "Verifier queue",
      created_at: "2026-09-18T12:50:00Z",
    }),
  });

  let registry = createWorkspaceSnapshotRegistry({
    registry_key: "VERIFY-TIMELINE",
    title: "Verifier timeline",
    created_at: "2026-09-18T12:50:00Z",
  });
  registry = registerWorkspaceSnapshot(registry, {
    snapshot,
    registered_at: "2026-09-18T13:01:00Z",
  });
  registry = moveWorkspaceSnapshotHead(registry, {
    to_snapshot_digest: snapshot.snapshot_digest,
    moved_at: "2026-09-18T13:02:00Z",
    reason: "Select verifier fixture HEAD",
    explicit_human_signal: "SET VERIFY HEAD",
  });

  const contract = createReleaseContractBinding({
    contract_id: "VERIFY-CONTRACT",
    contract_version: "1.0.0",
    package_name: "@hnk/verify-contract",
    source_path: "packages/verify-contract/src/index.mjs",
    source_text: CONTRACT_SOURCE,
  });

  const validator = createReleaseValidatorBinding({
    validator_id: "VERIFY-GATE",
    source_path: "scripts/verify-gate.mjs",
    source_text: VALIDATOR_SOURCE,
    result: "PASS",
    executed_at: "2026-09-18T13:03:00Z",
    environment: "fixture-node-22",
    evidence_note: "Fixture validator passed.",
  });

  return createResearchReleaseManifest({
    release_key: "VERIFY-RELEASE",
    label: "Verifier release",
    created_at: "2026-09-18T13:04:00Z",
    workspace_snapshot_registry: registry,
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
      validation_commands: ["node scripts/verify-gate.mjs"],
      build_command: "node scripts/build-web-vercel.mjs",
      notes: ["Fixture only."],
    },
  });
}

function matchingObserved() {
  return {
    git: {
      repository_full_name: "git@github.com:TehkneSolutions/codex-hnk.git",
      commit_sha: COMMIT,
      ref: "main",
    },
    runtime: {
      node_engine: "22.x",
      package_manager: "pnpm@12.1.0",
    },
    files: [
      {
        source_path: "packages/verify-contract/src/index.mjs",
        source_text: CONTRACT_SOURCE,
      },
      {
        source_path: "scripts/verify-gate.mjs",
        source_text: VALIDATOR_SOURCE,
      },
    ],
    validator_executions: [
      {
        validator_id: "VERIFY-GATE",
        result: "PASS",
        executed_at: "2026-09-18T13:10:00Z",
        environment: "fixture-node-22",
      },
    ],
  };
}

test("fully observed project state can produce MATCH without executing reproduction commands", () => {
  const report = verifyResearchReleaseManifest(
    manifest(),
    matchingObserved(),
    { generated_at: "2026-09-18T13:11:00Z" },
  );

  assert.equal(report.overall_status, "MATCH");
  assert.equal(report.counts.DRIFT, 0);
  assert.equal(report.counts.MISSING, 0);
  assert.equal(report.counts.UNVERIFIED, 0);
  assert.ok(report.counts.MATCH > 0);
  assert.equal(report.commands_executed, false);
  assert.equal(report.production_readiness_inferred, false);
  assert.equal(report.truth_assessed, false);
  assert.equal(report.canon_promotion_permitted, false);
});

test("changed contract source is explicit DRIFT", () => {
  const observed = matchingObserved();
  observed.files[0] = {
    ...observed.files[0],
    source_text: "export const CONTRACT = \"V2\";\n",
  };

  const report = verifyResearchReleaseManifest(
    manifest(),
    observed,
    { generated_at: "2026-09-18T13:12:00Z" },
  );

  assert.equal(report.overall_status, "DRIFT");
  const check = report.checks.find((item) => item.check_id === "CONTRACT_SOURCE:VERIFY-CONTRACT");
  assert.equal(check.status, "DRIFT");
});

test("missing expected source file is MISSING when no drift exists", () => {
  const observed = matchingObserved();
  observed.files = observed.files.filter(
    (item) => item.source_path !== "scripts/verify-gate.mjs",
  );

  const report = verifyResearchReleaseManifest(
    manifest(),
    observed,
    { generated_at: "2026-09-18T13:13:00Z" },
  );

  assert.equal(report.overall_status, "MISSING");
  const check = report.checks.find((item) => item.check_id === "VALIDATOR_SOURCE:VERIFY-GATE");
  assert.equal(check.status, "MISSING");
});

test("omitted metadata and validator rerun remain UNVERIFIED rather than guessed", () => {
  const observed = matchingObserved();
  delete observed.git.ref;
  delete observed.runtime.node_engine;
  observed.validator_executions = [];

  const report = verifyResearchReleaseManifest(
    manifest(),
    observed,
    { generated_at: "2026-09-18T13:14:00Z" },
  );

  assert.equal(report.overall_status, "UNVERIFIED");
  assert.ok(report.counts.UNVERIFIED >= 3);
  assert.equal(
    report.checks.find((item) => item.check_id === "GIT:REF").status,
    "UNVERIFIED",
  );
  assert.equal(
    report.checks.find((item) => item.check_id === "VALIDATOR_EXECUTION:VERIFY-GATE").status,
    "UNVERIFIED",
  );
});

test("validator rerun result difference is reproduction DRIFT", () => {
  const observed = matchingObserved();
  observed.validator_executions[0].result = "FAIL";

  const report = verifyResearchReleaseManifest(
    manifest(),
    observed,
    { generated_at: "2026-09-18T13:15:00Z" },
  );

  assert.equal(report.overall_status, "DRIFT");
  assert.equal(
    report.checks.find((item) => item.check_id === "VALIDATOR_EXECUTION:VERIFY-GATE").status,
    "DRIFT",
  );
});

test("report serialization roundtrips and report tampering is detected", () => {
  const report = verifyResearchReleaseManifest(
    manifest(),
    matchingObserved(),
    { generated_at: "2026-09-18T13:16:00Z" },
  );

  assert.equal(validateReproducibilityVerificationReport(report).ok, true);
  assert.deepEqual(
    parseReproducibilityVerificationReport(
      serializeReproducibilityVerificationReport(report),
    ),
    report,
  );

  const tampered = JSON.parse(JSON.stringify(report));
  tampered.checks[0].status = "DRIFT";
  assert.equal(validateReproducibilityVerificationReport(tampered).ok, false);
});

test("duplicate file observations fail closed as ambiguous", () => {
  const observed = matchingObserved();
  observed.files.push({ ...observed.files[0] });

  assert.throws(
    () => verifyResearchReleaseManifest(
      manifest(),
      observed,
      { generated_at: "2026-09-18T13:17:00Z" },
    ),
    /duplicate file observation source_path/,
  );
});
