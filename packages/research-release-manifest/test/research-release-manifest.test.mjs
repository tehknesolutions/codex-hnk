import test from "node:test";
import assert from "node:assert/strict";
import { createClaimReevaluationQueue } from "@hnk/claim-reevaluation-queue";
import { sha256Hex } from "@hnk/experiment-attestation";
import { createResearchArtifactLibrary } from "@hnk/research-artifact-library";
import { createResearchWorkspaceSnapshot } from "@hnk/research-workspace-snapshot";
import {
  createWorkspaceSnapshotRegistry,
  moveWorkspaceSnapshotHead,
  registerWorkspaceSnapshot,
} from "@hnk/research-workspace-snapshot-registry";
import { createReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";
import {
  createReleaseContractBinding,
  createReleaseValidatorBinding,
  createResearchReleaseManifest,
  parseResearchReleaseManifest,
  releaseValidatorExecutionStatus,
  serializeResearchReleaseManifest,
  validateResearchReleaseManifest,
} from "../src/index.mjs";

function headedRegistry() {
  const snapshot = createResearchWorkspaceSnapshot({
    snapshot_key: "RELEASE-SNAPSHOT-001",
    label: "Release snapshot 001",
    created_at: "2026-09-18T12:20:00Z",
    artifact_library: createResearchArtifactLibrary({
      library_key: "RELEASE-LIB",
      title: "Release library",
      created_at: "2026-09-18T12:00:00Z",
    }),
    reviewed_claim_registry: createReviewedClaimRegistry({
      registry_key: "RELEASE-REVIEWED",
      title: "Release reviewed",
      created_at: "2026-09-18T12:00:00Z",
    }),
    claim_reevaluation_queue: createClaimReevaluationQueue({
      queue_key: "RELEASE-QUEUE",
      title: "Release queue",
      created_at: "2026-09-18T12:00:00Z",
    }),
  });

  let registry = createWorkspaceSnapshotRegistry({
    registry_key: "RELEASE-TIMELINE",
    title: "Release timeline",
    created_at: "2026-09-18T12:00:00Z",
  });

  registry = registerWorkspaceSnapshot(registry, {
    snapshot,
    registered_at: "2026-09-18T12:21:00Z",
  });

  registry = moveWorkspaceSnapshotHead(registry, {
    to_snapshot_digest: snapshot.snapshot_digest,
    moved_at: "2026-09-18T12:22:00Z",
    reason: "Human-selected release checkpoint",
    explicit_human_signal: "SET RELEASE HEAD",
  });

  return registry;
}

function bindings() {
  const contractSource = "\nexport const CONTRACT = \"V1\";\n";
  const validatorSource = "#!/usr/bin/env node\nconsole.log('PASS');\n";

  const contract = createReleaseContractBinding({
    contract_id: "HNK_RESEARCH_WORKSPACE_SNAPSHOT_V1",
    contract_version: "1.0.0",
    package_name: "@hnk/research-workspace-snapshot",
    source_path: "packages/research-workspace-snapshot/src/index.mjs",
    source_text: contractSource,
  });

  const pass = createReleaseValidatorBinding({
    validator_id: "WORKSPACE_SNAPSHOT_GATE",
    source_path: "scripts/validate-hnk-research-workspace-snapshot.mjs",
    source_text: validatorSource,
    result: "PASS",
    executed_at: "2026-09-18T12:30:00Z",
    environment: "node-22-local-fixture",
    evidence_note: "Fixture validator executed successfully.",
  });

  const blocked = createReleaseValidatorBinding({
    validator_id: "PRODUCTION_BUILD",
    source_path: "scripts/build-web-vercel.mjs",
    source_text: "console.log('build');\n",
    result: "INFRASTRUCTURE_BLOCKED",
    executed_at: null,
    environment: "vercel-preview",
    evidence_note: "External environment did not yield an attributable validator result.",
  });

  return { contractSource, validatorSource, contract, pass, blocked };
}

function manifestWith(validators) {
  const { contract } = bindings();
  return createResearchReleaseManifest({
    release_key: "HNK-RESEARCH-RELEASE-001",
    label: "Research release 001",
    created_at: "2026-09-18T12:40:00Z",
    workspace_snapshot_registry: headedRegistry(),
    git: {
      repository_full_name: "tehknesolutions/codex-hnk",
      commit_sha: "19e93546423a740f462c10ae2d714e7b9025508a",
      ref: "main",
    },
    runtime: {
      node_engine: "22.x",
      package_manager: "pnpm@12.1.0",
    },
    contracts: [contract],
    validators,
    reproduction: {
      install_command: "corepack pnpm install --frozen-lockfile",
      validation_commands: [
        "node scripts/validate-hnk-research-workspace-snapshot.mjs",
        "node scripts/validate-hnk-workspace-snapshot-registry.mjs",
      ],
      build_command: "node scripts/build-web-vercel.mjs",
      notes: ["Use the exact Git commit bound by this manifest."],
    },
  });
}

test("source bindings hash exact bytes including surrounding whitespace", () => {
  const { contractSource, validatorSource, contract, pass } = bindings();
  assert.equal(contract.content_digest, sha256Hex(contractSource));
  assert.equal(pass.content_digest, sha256Hex(validatorSource));
  assert.notEqual(contract.content_digest, sha256Hex(contractSource.trim()));
});

test("release manifest binds explicit registry HEAD, Git commit, contracts, validators and commands", () => {
  const { pass, blocked } = bindings();
  const manifest = manifestWith([pass, blocked]);
  const registry = manifest.workspace_snapshot_registry;
  const headRecord = registry.snapshots.find(
    (record) => record.snapshot_digest === registry.head_snapshot_digest,
  );
  const headEvent = registry.head_events.at(-1);

  assert.equal(validateResearchReleaseManifest(manifest).ok, true);
  assert.equal(manifest.workspace_registry_digest, registry.registry_digest);
  assert.equal(manifest.head_snapshot_digest, registry.head_snapshot_digest);
  assert.equal(manifest.head_record_digest, headRecord.record_digest);
  assert.equal(manifest.head_event_digest, headEvent.event_digest);
  assert.equal(manifest.git.working_tree_status, "NOT_ASSESSED");
  assert.equal(manifest.validator_execution_status, "INCOMPLETE");
  assert.equal(manifest.production_readiness_inferred, false);
  assert.equal(manifest.authorship_proof, false);
  assert.equal(manifest.trusted_timestamp_proof, false);
  assert.equal(manifest.truth_assessed, false);
  assert.equal(manifest.canon_promotion_permitted, false);
});

test("validator execution status distinguishes pass failure and incomplete evidence", () => {
  const { pass, blocked } = bindings();
  const fail = createReleaseValidatorBinding({
    validator_id: "FAIL-GATE",
    source_path: "scripts/fail.mjs",
    source_text: "process.exit(1);\n",
    result: "FAIL",
    executed_at: "2026-09-18T12:31:00Z",
    environment: "fixture",
    evidence_note: "Fixture failure.",
  });

  assert.equal(releaseValidatorExecutionStatus([pass]), "COMPLETE_PASS");
  assert.equal(releaseValidatorExecutionStatus([pass, blocked]), "INCOMPLETE");
  assert.equal(releaseValidatorExecutionStatus([pass, fail]), "HAS_FAILURE");
  assert.equal(releaseValidatorExecutionStatus([]), "INCOMPLETE");
});

test("serialization roundtrips and tampering breaks manifest integrity", () => {
  const { pass, blocked } = bindings();
  const manifest = manifestWith([pass, blocked]);

  assert.deepEqual(
    parseResearchReleaseManifest(serializeResearchReleaseManifest(manifest)),
    manifest,
  );

  const tampered = JSON.parse(JSON.stringify(manifest));
  tampered.git.commit_sha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const validation = validateResearchReleaseManifest(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) => issue.includes("manifest_digest mismatch")));
});

test("release creation fails closed when registry HEAD is unset", () => {
  const registry = createWorkspaceSnapshotRegistry({
    registry_key: "NO-HEAD",
    title: "No HEAD",
    created_at: "2026-09-18T12:00:00Z",
  });
  const { contract, pass } = bindings();

  assert.throws(() => createResearchReleaseManifest({
    release_key: "INVALID-RELEASE",
    label: "Invalid release",
    created_at: "2026-09-18T12:40:00Z",
    workspace_snapshot_registry: registry,
    git: {
      repository_full_name: "tehknesolutions/codex-hnk",
      commit_sha: "19e93546423a740f462c10ae2d714e7b9025508a",
      ref: "main",
    },
    runtime: {
      node_engine: "22.x",
      package_manager: "pnpm@12.1.0",
    },
    contracts: [contract],
    validators: [pass],
    reproduction: {
      install_command: "pnpm install",
      validation_commands: ["pnpm test"],
      build_command: "pnpm build",
    },
  }), /HEAD must be explicitly set/);
});

test("PASS and FAIL validator states require execution timestamps", () => {
  assert.throws(() => createReleaseValidatorBinding({
    validator_id: "MISSING-TIME",
    source_path: "scripts/missing-time.mjs",
    source_text: "console.log('x');",
    result: "PASS",
    executed_at: null,
    environment: "fixture",
    evidence_note: "Missing time must fail.",
  }), /executed_at required/);
});
