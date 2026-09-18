import fs from "node:fs";
import {
  HNK_RESEARCH_ARTIFACT_LIBRARY_BOUNDARY,
  addResearchArtifact,
  claimDossierProjection,
  createResearchArtifactLibrary,
  evidenceSynthesisProjection,
  evidenceSynthesisReport,
  researchArtifactLibraryIndex,
  researchArtifactLibrarySummary,
  resolveReevaluationArtifactBundle,
  reviewedClaimRegistryProjection,
  validateClaimDossier,
  validateEvidenceSynthesis,
  validateResearchArtifactLibrary,
  validateReviewedClaimRegistry,
} from "@hnk/quest-engine";
import { sha256Canonical } from "@hnk/experiment-attestation";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function synthesis(key, sources, label) {
  const signature = sha256Canonical({ key, metric: "M-SCORE" });
  const value = {
    synthesis_id: "HNK_EVIDENCE_SYNTHESIS_V1",
    synthesis_version: "1.0.0",
    authority: "HNK_AUTHORED_EVIDENCE_SYNTHESIS",
    synthesis_key: key,
    title: `Synthesis ${key}`,
    created_at: "2026-09-17T20:00:00Z",
    registries: Array.from({ length: sources }, (_, index) => ({
      source_id: `${key}-SRC-${index + 1}`,
      replication_key: `${key}-REP-${index + 1}`,
      title: `Registry ${index + 1}`,
      question: `${label} question ${index + 1}?`,
      registry_digest: sha256Canonical({ key, index, label }),
      metric_signature_digest: signature,
      metric_id: "M-SCORE",
      metric_label: "Score",
      metric_type: "SCALE",
      unit: "points",
      replication_status: "REPLICATED",
      repeated_direction: "HIGHER",
      total_runs: 2,
      eligible_runs: 2,
      insufficient_runs: 0,
      added_at: `2026-09-17T20:0${index}:00Z`,
    })),
    synthesis_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    automatic_truth_inference: false,
    inferential_statistics_performed: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: "EVIDENCE_SYNTHESIS_MAPS_CONVERGENCE_DIVERGENCE_AND_INSUFFICIENCY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF",
  };
  value.synthesis_digest = sha256Canonical(evidenceSynthesisProjection(value));
  if (!validateEvidenceSynthesis(value).ok) throw new Error("validator synthesis invalid");
  return value;
}

function dossier(claimId, source) {
  const group = evidenceSynthesisReport(source).groups[0];
  const value = {
    dossier_id: "HNK_CLAIM_DOSSIER_V1",
    dossier_version: "1.0.0",
    authority: "HNK_AUTHORED_CLAIM_DOSSIER",
    claim_id: claimId,
    statement: `${claimId} descriptive statement.`,
    scope: "DESCRIPTIVE",
    authored_by: "RESEARCHER",
    created_at: "2026-09-17T21:00:00Z",
    synthesis_binding: { synthesis_key: source.synthesis_key, synthesis_digest: source.synthesis_digest },
    evidence_links: [{
      link_id: `LINK-${claimId}`,
      metric_signature_digest: group.metric_signature_digest,
      metric_id: group.metric_id,
      metric_label: group.metric_label,
      group_status: group.status,
      convergent_direction: group.convergent_direction,
      relation: "CONSISTENT_WITH",
      rationale: "Human-selected relevance.",
      source_questions: group.questions.map((entry) => entry.question),
    }],
    gaps: ["More evidence desirable."],
    conflicts: [],
    notes: [],
    dossier_digest: "",
    human_relevance_classification_required: true,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: "CLAIM_DOSSIER_ORGANIZES_EVIDENCE_RELEVANCE_GAPS_AND_CONFLICTS_NOT_TRUTH_OR_CANON",
  };
  value.dossier_digest = sha256Canonical(claimDossierProjection(value));
  if (!validateClaimDossier(value).ok) throw new Error("validator dossier invalid");
  return value;
}

function reviewedRegistry(sourceDossier) {
  const record = {
    record_id: "ARTIFACT-REVIEWED-1",
    claim_id: sourceDossier.claim_id,
    claim_version: 1,
    statement: sourceDossier.statement,
    scope: sourceDossier.scope,
    classification: "HYPOTHESIS",
    review_outcome: "KEEP_AS_HYPOTHESIS",
    dossier_digest: sourceDossier.dossier_digest,
    review_gate_digest: sha256Canonical({ gate: 1 }),
    synthesis_key: sourceDossier.synthesis_binding.synthesis_key,
    synthesis_digest: sourceDossier.synthesis_binding.synthesis_digest,
    reviewer: "TW-DVF",
    reviewed_at: "2026-09-17T21:30:00Z",
    explicit_human_signal: "KEEP AS HYPOTHESIS",
    review_rationale: "Evidence-scoped review.",
    unresolved_questions: [],
    gaps: [...sourceDossier.gaps],
    conflicts: [],
    registered_at: "2026-09-17T21:40:00Z",
    supersedes_record_id: null,
    record_digest: "",
    human_review_derived: true,
    truth_assessed: false,
    canon_status: "NOT_CANON",
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
  };
  const rp = { ...record }; delete rp.record_digest;
  record.record_digest = sha256Canonical(rp);

  const registry = {
    registry_id: "HNK_REVIEWED_CLAIM_REGISTRY_V1",
    registry_version: "1.0.0",
    authority: "HNK_AUTHORED_REVIEWED_CLAIM_REGISTRY",
    registry_key: "ARTIFACT-REVIEWED",
    title: "Reviewed claims",
    created_at: "2026-09-17T21:40:00Z",
    records: [record],
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    machine_can_decide_review: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: "REVIEWED_CLAIM_REGISTRY_INDEXES_HUMAN_REVIEW_CLASSIFICATIONS_NOT_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON",
  };
  registry.registry_digest = sha256Canonical(reviewedClaimRegistryProjection(registry));
  if (!validateReviewedClaimRegistry(registry).ok) throw new Error("validator reviewed registry invalid");
  return registry;
}

const original = synthesis("ARTIFACT-SYNTH", 1, "original");
const candidate = synthesis("ARTIFACT-SYNTH", 2, "candidate");
const claim = dossier("ARTIFACT-CLAIM", original);
const reviewed = reviewedRegistry(claim);

let library = createResearchArtifactLibrary({
  library_key: "HNK-ARTIFACT-LIBRARY-VALIDATOR",
  title: "Artifact library validator",
  created_at: "2026-09-17T22:00:00Z",
});
library = addResearchArtifact(library, {
  kind: "CLAIM_DOSSIER",
  payload: claim,
  added_at: "2026-09-17T22:01:00Z",
});
library = addResearchArtifact(library, {
  kind: "EVIDENCE_SYNTHESIS",
  payload: original,
  added_at: "2026-09-17T22:02:00Z",
});
library = addResearchArtifact(library, {
  kind: "EVIDENCE_SYNTHESIS",
  payload: candidate,
  added_at: "2026-09-17T22:03:00Z",
});

const validation = validateResearchArtifactLibrary(library);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `library: ${issue}`));

const index = researchArtifactLibraryIndex(library);
if (index.total_artifacts !== 3) issues.push("artifact library must contain three snapshots");
if (index.claim_dossiers !== 1 || index.evidence_syntheses !== 2) issues.push("artifact kind counts incorrect");
if (index.latest_artifacts !== 2) issues.push("latest artifact count must reflect one latest per logical lineage");

const synthesisHistory = index.artifacts
  .filter((artifact) => artifact.kind === "EVIDENCE_SYNTHESIS")
  .sort((a,b)=>a.revision-b.revision);
if (synthesisHistory[0].revision !== 1 || synthesisHistory[1].revision !== 2) issues.push("synthesis revisions must be contiguous");
if (synthesisHistory[1].supersedes_artifact_id !== synthesisHistory[0].artifact_id) issues.push("synthesis supersession chain missing");

const bundle = resolveReevaluationArtifactBundle(library, reviewed);
if (bundle.coverage_complete !== true) issues.push("artifact bundle should have complete coverage");
if (bundle.original_dossiers.length !== 1 || bundle.candidate_syntheses.length !== 1) issues.push("artifact bundle counts incorrect");
if (bundle.candidate_syntheses[0].synthesis_digest !== candidate.synthesis_digest) issues.push("resolver must select highest synthesis library revision");
if (bundle.machine_inferred_relevance !== false) issues.push("artifact resolver must not infer relevance");

const summary = researchArtifactLibrarySummary();
if (summary.library_id !== "HNK_RESEARCH_ARTIFACT_LIBRARY_V1") issues.push("unexpected artifact library id");
if (summary.append_only_revision_history !== true) issues.push("append-only history lock drift");
if (summary.machine_inferred_relevance !== false) issues.push("machine relevance lock drift");
if (summary.claim_boundary !== HNK_RESEARCH_ARTIFACT_LIBRARY_BOUNDARY) issues.push("artifact library boundary drift");

const page = read("apps/web/app/research/artifacts/page.tsx");
const client = read("apps/web/app/research/artifacts/ResearchArtifactLibraryLab.tsx");
const route = read("apps/web/app/api/research/artifacts/route.ts");
const batchClient = read("apps/web/app/research/re-evaluation-batch/ClaimReevaluationBatchScannerLab.tsx");
const hub = read("apps/web/app/research/page.tsx");
const adapter = read("packages/quest-engine/src/research-artifact-library.ts");
const docs = read("docs/architecture/HNK_RESEARCH_ARTIFACT_LIBRARY_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Artifact Library page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Artifact Library Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Artifact Library API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Artifact Library API must declare no automatic persistence");
if (!client.includes("addResearchArtifact")) issues.push("Artifact Library Lab must admit artifacts through shared contract");
if (!client.includes("resolveReevaluationArtifactBundle")) issues.push("Artifact Library Lab must expose re-evaluation bundle resolution");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Artifact Library Lab must not auto-persist in browser storage");
if (!batchClient.includes("parseResearchArtifactLibrary")) issues.push("Batch Scanner must import Artifact Library");
if (!batchClient.includes("resolveReevaluationArtifactBundle")) issues.push("Batch Scanner must resolve inputs from Artifact Library");
if (!hub.includes('href="/research/artifacts"')) issues.push("Research hub must link Artifact Library");
if (!hub.includes("ARTIFACT LIBRARY")) issues.push("Research pipeline must include Artifact Library");
if (!adapter.includes('from "@hnk/research-artifact-library"')) issues.push("Quest Engine must delegate Artifact Library to shared package");
if (!docs.includes("There is no automatic path from the Artifact Library to HNK_CANON")) issues.push("Artifact Library documentation incomplete");

if (issues.length) {
  console.error("HNK_RESEARCH_ARTIFACT_LIBRARY_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_RESEARCH_ARTIFACT_LIBRARY_V1_PASS");
console.log(JSON.stringify({
  library_id: summary.library_id,
  artifacts: index.total_artifacts,
  latest_artifacts: index.latest_artifacts,
  bundle_coverage_complete: bundle.coverage_complete,
  selected_candidate_revision: bundle.resolutions[0].selected_candidate_revision,
  machine_inferred_relevance: bundle.machine_inferred_relevance,
  canon_promotion_permitted: summary.canon_promotion_permitted,
}, null, 2));
