import test from "node:test";
import assert from "node:assert/strict";
import {
  addReviewedClaim,
  createReviewedClaimRegistry,
  parseReviewedClaimRegistry,
  queryReviewedClaimRegistry,
  reviewedClaimRegistryIndex,
  serializeReviewedClaimRegistry,
  validateReviewedClaimRegistry,
  verifyReviewedClaimRecord,
} from "../src/index.mjs";
import {
  claimDossierProjection,
  validateClaimDossier,
} from "@hnk/claim-dossier";
import {
  applyHumanEvidenceReview,
  createEvidenceReviewGate,
} from "@hnk/evidence-review-gate";
import { sha256Canonical } from "@hnk/experiment-attestation";

function dossier({
  claimId = "CLAIM-001",
  statement = "The recorded outcome was descriptively higher in the linked evidence.",
  createdAt = "2026-09-17T20:00:00Z",
  gap = "Additional independent evidence remains desirable.",
} = {}) {
  const value = {
    dossier_id: "HNK_CLAIM_DOSSIER_V1",
    dossier_version: "1.0.0",
    authority: "HNK_AUTHORED_CLAIM_DOSSIER",
    claim_id: claimId,
    statement,
    scope: "DESCRIPTIVE",
    authored_by: "RESEARCHER",
    created_at: createdAt,
    synthesis_binding: {
      synthesis_key: "SYNTHESIS-001",
      synthesis_digest: sha256Canonical({ synthesis: claimId, statement }),
    },
    evidence_links: [{
      link_id: `LINK-${claimId}`,
      metric_signature_digest: sha256Canonical({ metric: "M-SCORE" }),
      metric_id: "M-SCORE",
      metric_label: "Score",
      group_status: "CONVERGENT",
      convergent_direction: "HIGHER",
      relation: "CONSISTENT_WITH",
      rationale: "The linked synthesis group converges in the HIGHER descriptive direction.",
      source_questions: ["Does the descriptive direction repeat?"],
    }],
    gaps: [gap],
    conflicts: [],
    notes: ["No causal claim."],
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

function reviewedGate(claim, outcome, suffix = "A") {
  let gate = createEvidenceReviewGate(claim, {
    opened_at: `2026-09-17T21:0${suffix === "A" ? "0" : "2"}:00Z`,
  });
  gate = applyHumanEvidenceReview(gate, claim, {
    outcome,
    reviewer: "TW-DVF",
    reviewed_at: `2026-09-17T21:1${suffix === "A" ? "0" : "2"}:00Z`,
    explicit_human_signal: `HUMAN REVIEW ${suffix}`,
    rationale: `Human rationale ${suffix}.`,
    unresolved_questions: ["Continue collecting independent evidence."],
  });
  return gate;
}

test("review outcome maps to a non-canon reviewed-claim classification", () => {
  const mappings = [
    ["ACCEPT_AS_DESCRIPTIVE_SUMMARY", "DESCRIPTIVE_SUMMARY"],
    ["KEEP_AS_HYPOTHESIS", "HYPOTHESIS"],
    ["REQUEST_MORE_EVIDENCE", "MORE_EVIDENCE_REQUIRED"],
    ["REJECT_AS_UNSUPPORTED_AT_SCOPE", "UNSUPPORTED_AT_SCOPE"],
  ];

  for (const [outcome, expected] of mappings) {
    const claim = dossier({ claimId: `CLAIM-${expected}` });
    const gate = reviewedGate(claim, outcome);
    let registry = createReviewedClaimRegistry({
      registry_key: `REG-${expected}`,
      title: "Reviewed claims",
      created_at: "2026-09-17T22:00:00Z",
    });
    registry = addReviewedClaim(registry, {
      record_id: `REC-${expected}`,
      registered_at: "2026-09-17T22:01:00Z",
      dossier: claim,
      review_gate: gate,
    });

    const record = registry.records[0];
    assert.equal(record.classification, expected);
    assert.equal(record.human_review_derived, true);
    assert.equal(record.truth_assessed, false);
    assert.equal(record.canon_status, "NOT_CANON");
    assert.equal(record.causal_claim_permitted, false);
    assert.equal(record.metaphysical_proof_permitted, false);
    assert.equal(verifyReviewedClaimRecord(record, claim, gate).ok, true);
  }
});

test("same claim requires explicit supersession and preserves immutable history", () => {
  const firstDossier = dossier({
    claimId: "CLAIM-VERSIONED",
    statement: "Version one descriptive statement.",
    createdAt: "2026-09-17T20:00:00Z",
  });
  const firstGate = reviewedGate(firstDossier, "KEEP_AS_HYPOTHESIS", "A");

  let registry = createReviewedClaimRegistry({
    registry_key: "REG-VERSIONED",
    title: "Versioned claims",
    created_at: "2026-09-17T22:00:00Z",
  });
  registry = addReviewedClaim(registry, {
    record_id: "REC-V1",
    registered_at: "2026-09-17T22:01:00Z",
    dossier: firstDossier,
    review_gate: firstGate,
  });

  const secondDossier = dossier({
    claimId: "CLAIM-VERSIONED",
    statement: "Version two descriptive statement after additional review.",
    createdAt: "2026-09-18T20:00:00Z",
    gap: "A narrower unresolved question remains.",
  });
  const secondGate = reviewedGate(secondDossier, "ACCEPT_AS_DESCRIPTIVE_SUMMARY", "B");

  assert.throws(() => addReviewedClaim(registry, {
    record_id: "REC-V2-INVALID",
    registered_at: "2026-09-18T22:01:00Z",
    dossier: secondDossier,
    review_gate: secondGate,
  }), /supersedes_record_id is required/);

  registry = addReviewedClaim(registry, {
    record_id: "REC-V2",
    registered_at: "2026-09-18T22:01:00Z",
    dossier: secondDossier,
    review_gate: secondGate,
    supersedes_record_id: "REC-V1",
  });

  const index = reviewedClaimRegistryIndex(registry);
  assert.equal(index.total_records, 2);
  assert.equal(index.active_claims, 1);
  assert.equal(index.claim_ids, 1);
  assert.equal(index.records.find((record) => record.record_id === "REC-V1").active, false);
  assert.equal(index.records.find((record) => record.record_id === "REC-V1").superseded_by_record_id, "REC-V2");
  assert.equal(index.records.find((record) => record.record_id === "REC-V2").claim_version, 2);
  assert.equal(index.records.find((record) => record.record_id === "REC-V2").active, true);

  const active = queryReviewedClaimRegistry(registry, { claim_id: "CLAIM-VERSIONED" });
  assert.equal(active.length, 1);
  assert.equal(active[0].record_id, "REC-V2");

  const history = queryReviewedClaimRegistry(registry, {
    claim_id: "CLAIM-VERSIONED",
    active_only: false,
  });
  assert.equal(history.length, 2);
});

test("query filters active reviewed claims by classification scope and text", () => {
  const a = dossier({ claimId: "CLAIM-A", statement: "Alpha score summary." });
  const b = dossier({ claimId: "CLAIM-B", statement: "Beta evidence remains incomplete." });
  let registry = createReviewedClaimRegistry({
    registry_key: "REG-QUERY",
    title: "Queryable registry",
    created_at: "2026-09-17T22:00:00Z",
  });

  registry = addReviewedClaim(registry, {
    record_id: "REC-A",
    registered_at: "2026-09-17T22:01:00Z",
    dossier: a,
    review_gate: reviewedGate(a, "ACCEPT_AS_DESCRIPTIVE_SUMMARY"),
  });
  registry = addReviewedClaim(registry, {
    record_id: "REC-B",
    registered_at: "2026-09-17T22:02:00Z",
    dossier: b,
    review_gate: reviewedGate(b, "REQUEST_MORE_EVIDENCE"),
  });

  assert.equal(queryReviewedClaimRegistry(registry, { classification: "DESCRIPTIVE_SUMMARY" }).length, 1);
  assert.equal(queryReviewedClaimRegistry(registry, { classification: "MORE_EVIDENCE_REQUIRED" }).length, 1);
  assert.equal(queryReviewedClaimRegistry(registry, { scope: "DESCRIPTIVE" }).length, 2);
  assert.equal(queryReviewedClaimRegistry(registry, { q: "incomplete" })[0].claim_id, "CLAIM-B");
});

test("duplicate reviewed artifacts and registry tampering are rejected", () => {
  const claim = dossier({ claimId: "CLAIM-DUP" });
  const gate = reviewedGate(claim, "KEEP_AS_HYPOTHESIS");
  let registry = createReviewedClaimRegistry({
    registry_key: "REG-DUP",
    title: "Duplicate guard",
    created_at: "2026-09-17T22:00:00Z",
  });
  registry = addReviewedClaim(registry, {
    record_id: "REC-DUP",
    registered_at: "2026-09-17T22:01:00Z",
    dossier: claim,
    review_gate: gate,
  });

  assert.throws(() => addReviewedClaim(registry, {
    record_id: "REC-DUP-2",
    registered_at: "2026-09-17T22:02:00Z",
    dossier: claim,
    review_gate: gate,
    supersedes_record_id: "REC-DUP",
  }), /dossier .* already registered|review gate .* already registered/);

  assert.equal(validateReviewedClaimRegistry(registry).ok, true);
  assert.deepEqual(parseReviewedClaimRegistry(serializeReviewedClaimRegistry(registry)), registry);

  const tampered = JSON.parse(JSON.stringify(registry));
  tampered.records[0].classification = "DESCRIPTIVE_SUMMARY";
  const validation = validateReviewedClaimRegistry(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.issues.some((issue) =>
    issue.includes("classification does not match") ||
    issue.includes("record_digest mismatch") ||
    issue.includes("registry_digest mismatch")
  ));
});
