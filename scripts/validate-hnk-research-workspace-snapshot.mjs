import fs from "node:fs";
import {
  HNK_RESEARCH_WORKSPACE_SNAPSHOT_BOUNDARY,
  compareResearchWorkspaceSnapshots,
  createClaimReevaluationQueue,
  createResearchArtifactLibrary,
  createResearchWorkspaceSnapshot,
  createReviewedClaimRegistry,
  researchWorkspaceSnapshotSummary,
  restoreResearchWorkspaceSnapshot,
  validateResearchWorkspaceSnapshot,
} from "@hnk/quest-engine";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

const artifactLibrary = createResearchArtifactLibrary({
  library_key: "WORKSPACE-VALIDATOR-LIBRARY",
  title: "Workspace validator library",
  created_at: "2026-09-18T01:00:00Z",
});
const reviewedRegistry = createReviewedClaimRegistry({
  registry_key: "WORKSPACE-VALIDATOR-REVIEWED",
  title: "Workspace validator reviewed claims",
  created_at: "2026-09-18T01:00:00Z",
});
const queue = createClaimReevaluationQueue({
  queue_key: "WORKSPACE-VALIDATOR-QUEUE",
  title: "Workspace validator queue",
  created_at: "2026-09-18T01:00:00Z",
});

const first = createResearchWorkspaceSnapshot({
  snapshot_key: "WORKSPACE-CHECKPOINT-001",
  label: "Workspace checkpoint 001",
  created_at: "2026-09-18T01:10:00Z",
  artifact_library: artifactLibrary,
  reviewed_claim_registry: reviewedRegistry,
  claim_reevaluation_queue: queue,
});

const firstValidation = validateResearchWorkspaceSnapshot(first);
if (!firstValidation.ok) issues.push(...firstValidation.issues.map((issue) => `first: ${issue}`));

if (first.component_digests.artifact_library !== artifactLibrary.library_digest) {
  issues.push("workspace root must bind artifact library digest");
}
if (first.component_digests.reviewed_claim_registry !== reviewedRegistry.registry_digest) {
  issues.push("workspace root must bind reviewed claim registry digest");
}
if (first.component_digests.claim_reevaluation_queue !== queue.queue_digest) {
  issues.push("workspace root must bind re-evaluation queue digest");
}
if (first.immutable_checkpoint !== true) issues.push("workspace snapshot must remain immutable");
if (first.automatic_truth_inference !== false) issues.push("workspace snapshot truth lock drift");
if (first.machine_can_decide_review !== false) issues.push("workspace snapshot review authority lock drift");
if (first.canon_promotion_permitted !== false) issues.push("workspace snapshot canon lock drift");

const changedQueue = createClaimReevaluationQueue({
  queue_key: "WORKSPACE-VALIDATOR-QUEUE",
  title: "Workspace validator queue changed",
  created_at: "2026-09-18T01:00:00Z",
});

const second = createResearchWorkspaceSnapshot({
  snapshot_key: "WORKSPACE-CHECKPOINT-002",
  label: "Workspace checkpoint 002",
  created_at: "2026-09-18T01:20:00Z",
  parent_snapshot_digest: first.snapshot_digest,
  artifact_library: artifactLibrary,
  reviewed_claim_registry: reviewedRegistry,
  claim_reevaluation_queue: changedQueue,
});

const comparison = compareResearchWorkspaceSnapshots(first, second);
if (comparison.lineage_relation !== "LEFT_PARENT_OF_RIGHT") {
  issues.push("direct parent lineage must be detected");
}
if (comparison.changed_components.length !== 1 || comparison.changed_components[0] !== "CLAIM_REEVALUATION_QUEUE") {
  issues.push("component comparison must isolate changed queue");
}
if (comparison.truth_assessed !== false || comparison.canon_promotion_permitted !== false) {
  issues.push("workspace comparison must not assess truth or permit canon promotion");
}

const restored = restoreResearchWorkspaceSnapshot(first);
if (restored.exact_component_restore !== true) issues.push("workspace restore must be exact");
if (restored.server_write_performed !== false || restored.browser_persistence_performed !== false) {
  issues.push("workspace restore must not perform automatic persistence");
}
if (restored.artifact_library.library_digest !== artifactLibrary.library_digest) {
  issues.push("workspace restore artifact library drift");
}
if (restored.reviewed_claim_registry.registry_digest !== reviewedRegistry.registry_digest) {
  issues.push("workspace restore reviewed registry drift");
}
if (restored.claim_reevaluation_queue.queue_digest !== queue.queue_digest) {
  issues.push("workspace restore queue drift");
}

const tampered = JSON.parse(JSON.stringify(first));
tampered.label = "Tampered checkpoint";
if (validateResearchWorkspaceSnapshot(tampered).ok) {
  issues.push("workspace root digest must detect tampering");
}

const summary = researchWorkspaceSnapshotSummary();
if (summary.snapshot_id !== "HNK_RESEARCH_WORKSPACE_SNAPSHOT_V1") issues.push("unexpected workspace snapshot id");
if (summary.root_digest !== "SHA-256") issues.push("workspace snapshot root digest drift");
if (summary.component_digest_binding !== true) issues.push("workspace component binding lock drift");
if (summary.exact_component_restore !== true) issues.push("workspace exact restore capability drift");
if (summary.claim_boundary !== HNK_RESEARCH_WORKSPACE_SNAPSHOT_BOUNDARY) issues.push("workspace boundary drift");

const page = read("apps/web/app/research/workspace-snapshots/page.tsx");
const client = read("apps/web/app/research/workspace-snapshots/ResearchWorkspaceSnapshotLab.tsx");
const route = read("apps/web/app/api/research/workspace-snapshots/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/research-workspace-snapshot.ts");
const docs = read("docs/architecture/HNK_RESEARCH_WORKSPACE_SNAPSHOT_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Workspace Snapshot page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Workspace Snapshot Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Workspace Snapshot API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Workspace Snapshot API must declare no automatic persistence");
if (!client.includes("createResearchWorkspaceSnapshot")) issues.push("Workspace Snapshot Lab must create through shared contract");
if (!client.includes("compareResearchWorkspaceSnapshots")) issues.push("Workspace Snapshot Lab must compare through shared contract");
if (!client.includes("restoreResearchWorkspaceSnapshot")) issues.push("Workspace Snapshot Lab must restore through shared contract");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Workspace Snapshot Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/workspace-snapshots"')) issues.push("Research hub must link Workspace Snapshot");
if (!hub.includes("WORKSPACE SNAPSHOT")) issues.push("Research pipeline must include Workspace Snapshot");
if (!adapter.includes('from "@hnk/research-workspace-snapshot"')) issues.push("Quest Engine must delegate Workspace Snapshot to shared package");
if (!docs.includes("There is no automatic path from a Research Workspace Snapshot to HNK_CANON")) {
  issues.push("Workspace Snapshot documentation must preserve no-auto-canon boundary");
}

if (issues.length) {
  console.error("HNK_RESEARCH_WORKSPACE_SNAPSHOT_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_RESEARCH_WORKSPACE_SNAPSHOT_V1_PASS");
console.log(JSON.stringify({
  snapshot_id: summary.snapshot_id,
  root_digest: first.snapshot_digest,
  parent_relation: comparison.lineage_relation,
  changed_components: comparison.changed_components,
  exact_component_restore: restored.exact_component_restore,
  automatic_truth_inference: first.automatic_truth_inference,
  canon_promotion_permitted: first.canon_promotion_permitted,
}, null, 2));
