import test from "node:test";
import assert from "node:assert/strict";
import {
  addResearchArtifact,
  createResearchArtifactLibrary,
  parseResearchArtifactLibrary,
  queryResearchArtifactLibrary,
  researchArtifactLibraryIndex,
  resolveReevaluationArtifactBundle,
  serializeResearchArtifactLibrary,
  validateResearchArtifactLibrary,
} from "../src/index.mjs";
import { claimDossierProjection, validateClaimDossier } from "@hnk/claim-dossier";
import { evidenceSynthesisProjection, evidenceSynthesisReport, validateEvidenceSynthesis } from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";
import { reviewedClaimRegistryProjection, validateReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";

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
  assert.equal(validateEvidenceSynthesis(value).ok, true);
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
      source_questions: group.questions.map((x)=>x.question),
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
  assert.equal(validateClaimDossier(value).ok, true);
  return value;
}

function reviewedRegistry(items) {
  const records = items.map((item, index) => {
    const record = {
      record_id: `REC-${index+1}`,
      claim_id: item.claim_id,
      claim_version: 1,
      statement: item.statement,
      scope: item.scope,
      classification: "HYPOTHESIS",
      review_outcome: "KEEP_AS_HYPOTHESIS",
      dossier_digest: item.dossier_digest,
      review_gate_digest: sha256Canonical({ gate:item.claim_id }),
      synthesis_key: item.synthesis_binding.synthesis_key,
      synthesis_digest: item.synthesis_binding.synthesis_digest,
      reviewer: "TW-DVF",
      reviewed_at: "2026-09-17T21:30:00Z",
      explicit_human_signal: "KEEP AS HYPOTHESIS",
      review_rationale: "Evidence-scoped review.",
      unresolved_questions: [],
      gaps: [...item.gaps],
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
    const projection={...record}; delete projection.record_digest;
    record.record_digest=sha256Canonical(projection);
    return record;
  });
  const registry={
    registry_id:"HNK_REVIEWED_CLAIM_REGISTRY_V1",
    registry_version:"1.0.0",
    authority:"HNK_AUTHORED_REVIEWED_CLAIM_REGISTRY",
    registry_key:"LIB-REVIEWED",
    title:"Reviewed",
    created_at:"2026-09-17T21:40:00Z",
    records,
    registry_digest:"",
    persistence:"USER_CONTROLLED_FILE_ONLY",
    server_persistence:false,
    browser_persistence:false,
    machine_can_decide_review:false,
    automatic_truth_inference:false,
    automatic_canon_promotion:false,
    canon_promotion_permitted:false,
    causal_claim_permitted:false,
    metaphysical_proof_permitted:false,
    claim_boundary:"REVIEWED_CLAIM_REGISTRY_INDEXES_HUMAN_REVIEW_CLASSIFICATIONS_NOT_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON",
  };
  registry.registry_digest=sha256Canonical(reviewedClaimRegistryProjection(registry));
  assert.equal(validateReviewedClaimRegistry(registry).ok,true);
  return registry;
}

test("library preserves append-only revisions and latest query", () => {
  const s1=synthesis("SYNTH-A",1,"old");
  const s2=synthesis("SYNTH-A",2,"new");
  let library=createResearchArtifactLibrary({library_key:"LIB",title:"Artifacts",created_at:"2026-09-17T22:00:00Z"});
  library=addResearchArtifact(library,{kind:"EVIDENCE_SYNTHESIS",payload:s1,added_at:"2026-09-17T22:01:00Z"});
  library=addResearchArtifact(library,{kind:"EVIDENCE_SYNTHESIS",payload:s2,added_at:"2026-09-17T22:02:00Z"});
  assert.equal(library.artifacts[0].revision,1);
  assert.equal(library.artifacts[1].revision,2);
  assert.equal(library.artifacts[1].supersedes_artifact_id,library.artifacts[0].artifact_id);
  assert.equal(queryResearchArtifactLibrary(library,{kind:"EVIDENCE_SYNTHESIS"}).length,1);
  assert.equal(queryResearchArtifactLibrary(library,{kind:"EVIDENCE_SYNTHESIS",latest_only:false}).length,2);
});

test("library resolves exact original dossiers and latest synthesis per key", () => {
  const a1=synthesis("SYNTH-A",1,"old-a");
  const a2=synthesis("SYNTH-A",2,"new-a");
  const b1=synthesis("SYNTH-B",1,"b");
  const da=dossier("CLAIM-A",a1);
  const db=dossier("CLAIM-B",b1);
  const registry=reviewedRegistry([da,db]);

  let library=createResearchArtifactLibrary({library_key:"LIB",title:"Artifacts",created_at:"2026-09-17T22:00:00Z"});
  for (const [kind,payload,time] of [
    ["CLAIM_DOSSIER",da,"2026-09-17T22:01:00Z"],
    ["CLAIM_DOSSIER",db,"2026-09-17T22:02:00Z"],
    ["EVIDENCE_SYNTHESIS",a1,"2026-09-17T22:03:00Z"],
    ["EVIDENCE_SYNTHESIS",a2,"2026-09-17T22:04:00Z"],
    ["EVIDENCE_SYNTHESIS",b1,"2026-09-17T22:05:00Z"],
  ]) library=addResearchArtifact(library,{kind,payload,added_at:time});

  const bundle=resolveReevaluationArtifactBundle(library,registry);
  assert.equal(bundle.coverage_complete,true);
  assert.equal(bundle.original_dossiers.length,2);
  assert.equal(bundle.candidate_syntheses.length,2);
  assert.equal(bundle.resolutions.find(x=>x.claim_id==="CLAIM-A").selected_candidate_synthesis_digest,a2.synthesis_digest);
  assert.equal(bundle.resolutions.find(x=>x.claim_id==="CLAIM-A").selected_candidate_revision,2);
  assert.equal(bundle.machine_inferred_relevance,false);
});

test("missing artifacts remain explicit and duplicate content/tampering are rejected", () => {
  const s=synthesis("SYNTH-A",1,"a");
  const d=dossier("CLAIM-A",s);
  const registry=reviewedRegistry([d]);
  let library=createResearchArtifactLibrary({library_key:"LIB",title:"Artifacts",created_at:"2026-09-17T22:00:00Z"});
  library=addResearchArtifact(library,{kind:"CLAIM_DOSSIER",payload:d,added_at:"2026-09-17T22:01:00Z"});
  const bundle=resolveReevaluationArtifactBundle(library,registry);
  assert.equal(bundle.coverage_complete,false);
  assert.equal(bundle.synthesis_coverage,0);
  assert.throws(()=>addResearchArtifact(library,{kind:"CLAIM_DOSSIER",payload:d,added_at:"2026-09-17T22:02:00Z"}),/duplicate artifact content digest/);

  assert.equal(validateResearchArtifactLibrary(library).ok,true);
  assert.deepEqual(parseResearchArtifactLibrary(serializeResearchArtifactLibrary(library)),library);
  const tampered=JSON.parse(JSON.stringify(library));
  tampered.artifacts[0].logical_key="OTHER";
  assert.equal(validateResearchArtifactLibrary(tampered).ok,false);
});

test("library index exposes artifact counts without truth/relevance inference", () => {
  const s=synthesis("SYNTH-A",1,"a");
  const d=dossier("CLAIM-A",s);
  let library=createResearchArtifactLibrary({library_key:"LIB",title:"Artifacts",created_at:"2026-09-17T22:00:00Z"});
  library=addResearchArtifact(library,{kind:"CLAIM_DOSSIER",payload:d,added_at:"2026-09-17T22:01:00Z"});
  library=addResearchArtifact(library,{kind:"EVIDENCE_SYNTHESIS",payload:s,added_at:"2026-09-17T22:02:00Z"});
  const index=researchArtifactLibraryIndex(library);
  assert.equal(index.total_artifacts,2);
  assert.equal(index.claim_dossiers,1);
  assert.equal(index.evidence_syntheses,1);
  assert.equal(index.truth_assessed,false);
  assert.equal(index.relevance_inferred,false);
  assert.equal(index.canon_promotion_permitted,false);
});
