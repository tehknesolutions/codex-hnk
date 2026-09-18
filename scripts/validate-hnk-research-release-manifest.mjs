import fs from "node:fs";
import {
  HNK_RESEARCH_RELEASE_MANIFEST_BOUNDARY,
  createClaimReevaluationQueue,
  createReleaseContractBinding,
  createReleaseValidatorBinding,
  createResearchArtifactLibrary,
  createResearchReleaseManifest,
  createResearchWorkspaceSnapshot,
  createReviewedClaimRegistry,
  createWorkspaceSnapshotRegistry,
  moveWorkspaceSnapshotHead,
  registerWorkspaceSnapshot,
  releaseValidatorExecutionStatus,
  researchReleaseManifestSummary,
  validateResearchReleaseManifest,
} from "@hnk/quest-engine";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

const snapshot = createResearchWorkspaceSnapshot({
  snapshot_key: "RELEASE-VALIDATOR-SNAPSHOT",
  label: "Release validator snapshot",
  created_at: "2026-09-18T12:20:00Z",
  artifact_library: createResearchArtifactLibrary({
    library_key: "RELEASE-VALIDATOR-LIB",
    title: "Release validator library",
    created_at: "2026-09-18T12:00:00Z",
  }),
  reviewed_claim_registry: createReviewedClaimRegistry({
    registry_key: "RELEASE-VALIDATOR-REVIEWED",
    title: "Release validator reviewed claims",
    created_at: "2026-09-18T12:00:00Z",
  }),
  claim_reevaluation_queue: createClaimReevaluationQueue({
    queue_key: "RELEASE-VALIDATOR-QUEUE",
    title: "Release validator queue",
    created_at: "2026-09-18T12:00:00Z",
  }),
});

let registry = createWorkspaceSnapshotRegistry({
  registry_key: "RELEASE-VALIDATOR-TIMELINE",
  title: "Release validator timeline",
  created_at: "2026-09-18T12:00:00Z",
});
registry = registerWorkspaceSnapshot(registry, {
  snapshot,
  registered_at: "2026-09-18T12:21:00Z",
});
registry = moveWorkspaceSnapshotHead(registry, {
  to_snapshot_digest: snapshot.snapshot_digest,
  moved_at: "2026-09-18T12:22:00Z",
  reason: "Explicit fixture HEAD for release validator",
  explicit_human_signal: "SET RELEASE VALIDATOR HEAD",
});

const contractSource = read("packages/research-workspace-snapshot-registry/src/index.mjs");
const validatorSource = read("scripts/validate-hnk-workspace-snapshot-registry.mjs");
const buildSource = read("scripts/build-web-vercel.mjs");

const contract = createReleaseContractBinding({
  contract_id: "HNK_WORKSPACE_SNAPSHOT_REGISTRY_V1",
  contract_version: "1.0.0",
  package_name: "@hnk/research-workspace-snapshot-registry",
  source_path: "packages/research-workspace-snapshot-registry/src/index.mjs",
  source_text: contractSource,
});

const staticValidator = createReleaseValidatorBinding({
  validator_id: "WORKSPACE_SNAPSHOT_REGISTRY_GATE",
  source_path: "scripts/validate-hnk-workspace-snapshot-registry.mjs",
  source_text: validatorSource,
  result: "NOT_EXECUTED",
  executed_at: null,
  environment: "release-manifest-fixture",
  evidence_note: "Bound for reproducibility; this gate does not claim that nested validator executed here.",
});

const externalBuild = createReleaseValidatorBinding({
  validator_id: "WEB_BUILD_GATE",
  source_path: "scripts/build-web-vercel.mjs",
  source_text: buildSource,
  result: "INFRASTRUCTURE_BLOCKED",
  executed_at: null,
  environment: "fixture-external-build",
  evidence_note: "Fixture proves that infrastructure-blocked evidence remains non-PASS.",
});

const manifest = createResearchReleaseManifest({
  release_key: "HNK-RESEARCH-RELEASE-VALIDATOR",
  label: "Research release validator fixture",
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
  validators: [staticValidator, externalBuild],
  reproduction: {
    install_command: "corepack pnpm install --frozen-lockfile",
    validation_commands: [
      "node scripts/validate-hnk-workspace-snapshot-registry.mjs",
      "node scripts/validate-hnk-research-release-manifest.mjs",
    ],
    build_command: "node scripts/build-web-vercel.mjs",
    notes: ["Fixture commands are preserved, not implicitly executed by manifest creation."],
  },
});

const validation = validateResearchReleaseManifest(manifest);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `manifest: ${issue}`));

const headRecord = registry.snapshots.find((record) => record.snapshot_digest === registry.head_snapshot_digest);
const headEvent = registry.head_events.at(-1);
if (manifest.workspace_registry_digest !== registry.registry_digest) issues.push("release must bind registry digest");
if (manifest.head_snapshot_digest !== registry.head_snapshot_digest) issues.push("release must bind exact registry HEAD");
if (manifest.head_record_digest !== headRecord.record_digest) issues.push("release must bind HEAD record digest");
if (manifest.head_event_digest !== headEvent.event_digest) issues.push("release must bind HEAD event digest");
if (manifest.validator_execution_status !== "INCOMPLETE") issues.push("blocked/not-executed validators must produce INCOMPLETE");
if (releaseValidatorExecutionStatus([staticValidator, externalBuild]) !== "INCOMPLETE") issues.push("validator status derivation drift");
if (manifest.git.working_tree_status !== "NOT_ASSESSED") issues.push("working tree must not be falsely assessed");
if (manifest.production_readiness_inferred !== false) issues.push("release manifest must not infer production readiness");
if (manifest.authorship_proof !== false || manifest.trusted_timestamp_proof !== false) issues.push("release manifest must not claim authorship or trusted timestamp");
if (manifest.truth_assessed !== false) issues.push("release manifest must not assess truth");
if (manifest.canon_promotion_permitted !== false) issues.push("release manifest must not permit canon promotion");

const tampered = JSON.parse(JSON.stringify(manifest));
tampered.reproduction.build_command = "echo tampered";
if (validateResearchReleaseManifest(tampered).ok) issues.push("manifest digest must detect reproduction-command tampering");

const summary = researchReleaseManifestSummary();
if (summary.release_id !== "HNK_RESEARCH_RELEASE_MANIFEST_V1") issues.push("unexpected release manifest id");
if (summary.binds_workspace_registry_head !== true) issues.push("release HEAD binding lock drift");
if (summary.git_commit_binding !== true) issues.push("Git commit binding lock drift");
if (summary.exact_contract_source_digests !== true) issues.push("contract digest lock drift");
if (summary.exact_validator_source_digests !== true) issues.push("validator digest lock drift");
if (summary.infrastructure_blocked_is_not_pass !== true) issues.push("blocked-is-not-pass rule drift");
if (summary.production_readiness_inferred !== false) issues.push("readiness inference lock drift");
if (summary.claim_boundary !== HNK_RESEARCH_RELEASE_MANIFEST_BOUNDARY) issues.push("release manifest boundary drift");

const page = read("apps/web/app/research/releases/page.tsx");
const client = read("apps/web/app/research/releases/ResearchReleaseManifestLab.tsx");
const route = read("apps/web/app/api/research/releases/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/research-release-manifest.ts");
const docs = read("docs/architecture/HNK_RESEARCH_RELEASE_MANIFEST_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Release Manifest page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Release Manifest Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Release Manifest API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Release Manifest API must declare no automatic persistence");
if (!client.includes("createReleaseContractBinding")) issues.push("Release Lab must bind contract source through shared contract");
if (!client.includes("createReleaseValidatorBinding")) issues.push("Release Lab must bind validator source through shared contract");
if (!client.includes("createResearchReleaseManifest")) issues.push("Release Lab must seal through shared contract");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Release Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/releases"')) issues.push("Research hub must link Release Manifest");
if (!hub.includes("RELEASE MANIFEST")) issues.push("Research pipeline must include Release Manifest");
if (!adapter.includes('from "@hnk/research-release-manifest"')) issues.push("Quest Engine must delegate Release Manifest to shared package");
if (!docs.includes("There is no automatic path from Research Release Manifest to HNK_CANON")) {
  issues.push("Release Manifest documentation must preserve no-auto-canon boundary");
}

if (issues.length) {
  console.error("HNK_RESEARCH_RELEASE_MANIFEST_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_RESEARCH_RELEASE_MANIFEST_V1_PASS");
console.log(JSON.stringify({
  release_id: summary.release_id,
  manifest_digest: manifest.manifest_digest,
  head_snapshot_digest: manifest.head_snapshot_digest,
  contract_bindings: manifest.contracts.length,
  validator_bindings: manifest.validators.length,
  validator_execution_status: manifest.validator_execution_status,
  production_readiness_inferred: manifest.production_readiness_inferred,
  canon_promotion_permitted: manifest.canon_promotion_permitted,
}, null, 2));
