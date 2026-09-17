import test from "node:test";
import assert from "node:assert/strict";
import {
  assessClaimDossier,
  createClaimDossier,
  parseClaimDossier,
  serializeClaimDossier,
  validateClaimDossier,
  verifyClaimDossierAgainstSynthesis,
} from "../src/index.mjs";
import {
  addSynthesisRegistry,
  createEvidenceSynthesis,
  evidenceSynthesisReport,
} from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  replicationRegistryProjection,
  validateReplicationRegistry,
} from "@hnk/replication-registry";

function metricSignature() {
  const base = {
    metric_id: "M-SCORE",
    metric_type: "SCALE",
    label: "Score",
    unit: "points",
    evidence_source: "SELF_REPORT",
    timepoint: "POST",
    evaluation_criterion: "Descriptive direction only.",
  };
  return { ...base, signature_digest: sha256Canonical(base) };
}

function registry(key, direction) {
  const signature = metricSignature();
  const pair = direction === "HIGHER" ? [3, 7] : [7, 3];
  const runs = [1, 2].map((n) => ({
    run_id: `${key}-R${n}`,
    experiment_id: `${key}-E${n}`,
    ledger_digest: sha256Canonical({ key, n }),
    added_at: "2026-09-17T20:00:00Z",
    metric_signature_digest: signature.signature_digest,
    control: { n: 1, aggregate: pair[0] },
    experiment: { n: 1, aggregate: pair[1] },
    direction,
    eligible: true,
    insufficiency_reasons: [],
  }));
  const value = {
    registry_id: "HNK_REPLICATION_REGISTRY_V1",
    registry_version: "1.0.0",
    authority: "HNK_AUTHORED_REPLICATION_REGISTRY",
    replication_key: key,
    title: `Registry ${key}`,
    question: `Does ${key} show the same descriptive direction?`,
    metric_signature: signature,
    created_at: "2026-09-17T19:00:00Z",
    runs,
    registry_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    automatic_truth_inference: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: "REPLICATION_REGISTRY_DESCRIBES_REPEATABILITY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF",
  };
  value.registry_digest = sha256Canonical(replicationRegistryProjection(value));
  assert.equal(validateReplicationRegistry(value).ok, true);
  return value;
}

function synthesis() {
  let value = createEvidenceSynthesis({
    synthesis_key: "CLAIM-SYNTHESIS",
    title: "Claim dossier synthesis",
    created_at: "2026-09-17T21:00:00Z",
    seed_source_id: "SRC-A",
    seed_added_at: "2026-09-17T21:01:00Z",
    seed_registry: registry("A", "HIGHER"),
  });
  value = addSynthesisRegistry(value, {
    source_id: "SRC-B",
    added_at: "2026-09-17T21:02:00Z",
    registry: registry("B", "HIGHER"),
  });
  return value;
}

test("dossier binds a claim to an exact synthesis group without deciding truth", () => {
  const source = synthesis();
  const group = evidenceSynthesisReport(source).groups[0];
  const dossier = createClaimDossier({
    claim_id: "CLAIM-001",
    statement: "The recorded score was descriptively higher under the experimental condition in the linked evidence.",
    scope: "DESCRIPTIVE",
    authored_by: "HUMAN-REVIEWER",
    created_at: "2026-09-17T22:00:00Z",
    synthesis: source,
    evidence_links: [{
      link_id: "LINK-001",
      metric_signature_digest: group.metric_signature_digest,
      relation: "CONSISTENT_WITH",
      rationale: "The synthesis group is convergent in the HIGHER direction.",
    }],
    gaps: ["Small number of independent registries."],
    conflicts: [],
    notes: ["No causal claim is made."],
  });

  assert.equal(validateClaimDossier(dossier).ok, true);
  assert.equal(verifyClaimDossierAgainstSynthesis(dossier, source).ok, true);
  assert.equal(dossier.evidence_links[0].group_status, "CONVERGENT");
  assert.equal(dossier.evidence_links[0].convergent_direction, "HIGHER");

  const assessment = assessClaimDossier(dossier);
  assert.equal(assessment.ready_for_human_review, true);
  assert.equal(assessment.relation_counts.CONSISTENT_WITH, 1);
  assert.equal(assessment.truth_assessed, false);
  assert.equal(assessment.canon_promotion_permitted, false);
  assert.deepEqual(parseClaimDossier(serializeClaimDossier(dossier)), dossier);
});

test("dossier preserves inconsistent and unresolved relations instead of resolving them", () => {
  const source = synthesis();
  const group = evidenceSynthesisReport(source).groups[0];
  const dossier = createClaimDossier({
    claim_id: "CLAIM-002",
    statement: "A stronger claim than the evidence directly supports.",
    scope: "EXPLORATORY_INTERPRETATION",
    authored_by: "HUMAN-REVIEWER",
    created_at: "2026-09-17T22:00:00Z",
    synthesis: source,
    evidence_links: [{
      link_id: "LINK-002",
      metric_signature_digest: group.metric_signature_digest,
      relation: "UNRESOLVED",
      rationale: "The synthesis is descriptive and does not establish the stronger interpretation.",
    }],
    gaps: ["No causal design."],
    conflicts: ["Claim wording extends beyond the measured construct."],
  });
  const assessment = assessClaimDossier(dossier);
  assert.equal(assessment.unresolved_links.length, 1);
  assert.equal(assessment.gaps.length, 1);
  assert.equal(assessment.conflicts.length, 1);
});

test("dossier detects synthesis drift and content tampering", () => {
  const source = synthesis();
  const group = evidenceSynthesisReport(source).groups[0];
  const dossier = createClaimDossier({
    claim_id: "CLAIM-003",
    statement: "Descriptive claim.",
    scope: "DESCRIPTIVE",
    authored_by: "HUMAN-REVIEWER",
    created_at: "2026-09-17T22:00:00Z",
    synthesis: source,
    evidence_links: [{
      link_id: "LINK-003",
      metric_signature_digest: group.metric_signature_digest,
      relation: "CONTEXT_ONLY",
      rationale: "Context only.",
    }],
  });

  const tampered = JSON.parse(JSON.stringify(dossier));
  tampered.statement = "Tampered";
  assert.equal(validateClaimDossier(tampered).ok, false);
  assert.ok(validateClaimDossier(tampered).issues.some((issue) => issue.includes("dossier_digest mismatch")));

  const changedSource = JSON.parse(JSON.stringify(source));
  changedSource.synthesis_digest = "0".repeat(64);
  assert.equal(verifyClaimDossierAgainstSynthesis(dossier, changedSource).ok, false);
});
