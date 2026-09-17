import {
  assessClaimDossier,
  validateClaimDossier,
} from "@hnk/claim-dossier";
import { sha256Canonical } from "@hnk/experiment-attestation";

export const HNK_EVIDENCE_REVIEW_GATE_ID = "HNK_EVIDENCE_REVIEW_GATE_V1";
export const HNK_EVIDENCE_REVIEW_GATE_VERSION = "1.0.0";
export const HNK_EVIDENCE_REVIEW_GATE_BOUNDARY =
  "HUMAN_REVIEW_MAY_CLASSIFY_CLAIM_STATUS_BUT_CANNOT_AUTO_ESTABLISH_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON";
export const HNK_EVIDENCE_REVIEW_OUTCOMES = Object.freeze([
  "ACCEPT_AS_DESCRIPTIVE_SUMMARY",
  "KEEP_AS_HYPOTHESIS",
  "REQUEST_MORE_EVIDENCE",
  "REJECT_AS_UNSUPPORTED_AT_SCOPE",
]);

const HEX_64 = /^[0-9a-f]{64}$/;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function nonEmpty(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function cleanString(value, field) {
  if (!nonEmpty(value)) throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}

function cleanStringArray(values, field) {
  if (values === undefined) return [];
  if (!Array.isArray(values)) throw new TypeError(`${field} must be an array`);
  return values.map((value, index) => cleanString(value, `${field}[${index}]`));
}

function gateDigest(gate) {
  return sha256Canonical(evidenceReviewGateProjection(gate));
}

export function evidenceReviewGateProjection(gate) {
  const projected = clone(gate);
  delete projected.gate_digest;
  return deepFreeze(projected);
}

export function createEvidenceReviewGate(dossier, input) {
  const dossierValidation = validateClaimDossier(dossier);
  if (!dossierValidation.ok) {
    throw new Error(`invalid claim dossier: ${dossierValidation.issues.join("; ")}`);
  }
  const assessment = assessClaimDossier(dossier);
  if (!assessment.ready_for_human_review) {
    throw new Error(`claim dossier is not ready for human review: ${assessment.blocking_reasons.join(", ")}`);
  }
  if (!input || typeof input !== "object") throw new TypeError("evidence review gate input required");

  const gate = {
    gate_id: HNK_EVIDENCE_REVIEW_GATE_ID,
    gate_version: HNK_EVIDENCE_REVIEW_GATE_VERSION,
    authority: "HNK_HUMAN_EVIDENCE_REVIEW_GATE",
    claim_id: dossier.claim_id,
    dossier_digest: dossier.dossier_digest,
    opened_at: cleanString(input.opened_at, "opened_at"),
    status: "PENDING_HUMAN_REVIEW",
    review: null,
    gate_digest: "",
    machine_can_decide: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_EVIDENCE_REVIEW_GATE_BOUNDARY,
  };
  gate.gate_digest = gateDigest(gate);
  const validation = validateEvidenceReviewGate(gate);
  if (!validation.ok) throw new Error(`invalid evidence review gate: ${validation.issues.join("; ")}`);
  return deepFreeze(gate);
}

export function applyHumanEvidenceReview(gate, dossier, input) {
  const verification = verifyEvidenceReviewGate(gate, dossier);
  if (!verification.ok) {
    throw new Error(`cannot review invalid or mismatched gate: ${verification.issues.join("; ")}`);
  }
  if (gate.status !== "PENDING_HUMAN_REVIEW" || gate.review !== null) {
    throw new Error("evidence review gate has already been decided");
  }
  if (!input || typeof input !== "object") throw new TypeError("human review input required");
  if (!HNK_EVIDENCE_REVIEW_OUTCOMES.includes(input.outcome)) {
    throw new RangeError(`invalid evidence review outcome ${input.outcome}`);
  }

  const next = clone(gate);
  next.status = "REVIEWED";
  next.review = {
    outcome: input.outcome,
    reviewer: cleanString(input.reviewer, "reviewer"),
    reviewed_at: cleanString(input.reviewed_at, "reviewed_at"),
    explicit_human_signal: cleanString(input.explicit_human_signal, "explicit_human_signal"),
    rationale: cleanString(input.rationale, "rationale"),
    unresolved_questions: cleanStringArray(input.unresolved_questions, "unresolved_questions"),
    human_decision: true,
  };
  next.gate_digest = gateDigest(next);

  const validation = validateEvidenceReviewGate(next);
  if (!validation.ok) throw new Error(`human review produced invalid gate: ${validation.issues.join("; ")}`);
  return deepFreeze(next);
}

function validateReview(review, issues) {
  if (!review || typeof review !== "object") {
    issues.push("review must be an object when status is REVIEWED");
    return;
  }
  if (!HNK_EVIDENCE_REVIEW_OUTCOMES.includes(review.outcome)) {
    issues.push(`invalid review outcome ${review.outcome}`);
  }
  for (const field of ["reviewer", "reviewed_at", "explicit_human_signal", "rationale"]) {
    if (!nonEmpty(review[field])) issues.push(`review.${field} required`);
  }
  if (!Array.isArray(review.unresolved_questions) || review.unresolved_questions.some((value) => !nonEmpty(value))) {
    issues.push("review.unresolved_questions must contain only non-empty strings");
  }
  if (review.human_decision !== true) issues.push("review.human_decision must be true");
}

export function validateEvidenceReviewGate(gate) {
  const issues = [];
  if (!gate || typeof gate !== "object") {
    return deepFreeze({ ok: false, issues: ["gate must be an object"] });
  }
  if (gate.gate_id !== HNK_EVIDENCE_REVIEW_GATE_ID) issues.push(`unexpected gate_id ${gate.gate_id}`);
  if (gate.gate_version !== HNK_EVIDENCE_REVIEW_GATE_VERSION) issues.push(`unexpected gate_version ${gate.gate_version}`);
  if (gate.authority !== "HNK_HUMAN_EVIDENCE_REVIEW_GATE") issues.push(`unexpected authority ${gate.authority}`);
  if (!nonEmpty(gate.claim_id)) issues.push("claim_id required");
  if (!HEX_64.test(gate.dossier_digest ?? "")) issues.push("dossier_digest must be SHA-256 hex");
  if (!nonEmpty(gate.opened_at)) issues.push("opened_at required");

  if (!["PENDING_HUMAN_REVIEW", "REVIEWED"].includes(gate.status)) {
    issues.push(`invalid gate status ${gate.status}`);
  }
  if (gate.status === "PENDING_HUMAN_REVIEW" && gate.review !== null) {
    issues.push("pending gate must not contain a review");
  }
  if (gate.status === "REVIEWED") validateReview(gate.review, issues);

  if (gate.machine_can_decide !== false) issues.push("machine_can_decide must remain false");
  if (gate.automatic_truth_inference !== false) issues.push("automatic_truth_inference must remain false");
  if (gate.automatic_canon_promotion !== false) issues.push("automatic_canon_promotion must remain false");
  if (gate.canon_promotion_permitted !== false) issues.push("canon_promotion_permitted must remain false");
  if (gate.causal_claim_permitted !== false) issues.push("causal_claim_permitted must remain false");
  if (gate.metaphysical_proof_permitted !== false) issues.push("metaphysical_proof_permitted must remain false");
  if (gate.claim_boundary !== HNK_EVIDENCE_REVIEW_GATE_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${gate.claim_boundary}`);
  }

  if (!HEX_64.test(gate.gate_digest ?? "")) {
    issues.push("gate_digest must be SHA-256 hex");
  } else if (gateDigest(gate) !== gate.gate_digest) {
    issues.push("gate_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function verifyEvidenceReviewGate(gate, dossier) {
  const issues = [];
  const gateValidation = validateEvidenceReviewGate(gate);
  if (!gateValidation.ok) issues.push(...gateValidation.issues);
  const dossierValidation = validateClaimDossier(dossier);
  if (!dossierValidation.ok) issues.push(...dossierValidation.issues.map((issue) => `dossier: ${issue}`));
  if (
    gate.claim_id !== dossier.claim_id ||
    gate.dossier_digest !== dossier.dossier_digest
  ) {
    issues.push("review gate does not bind to supplied claim dossier");
  }
  return deepFreeze({ ok: issues.length === 0, issues });
}

export function serializeEvidenceReviewGate(gate) {
  const validation = validateEvidenceReviewGate(gate);
  if (!validation.ok) throw new Error(`cannot serialize invalid evidence review gate: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(gate, null, 2)}\n`;
}

export function parseEvidenceReviewGate(text) {
  if (!nonEmpty(text)) throw new TypeError("evidence review gate JSON text required");
  let gate;
  try {
    gate = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid evidence review gate JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }
  const validation = validateEvidenceReviewGate(gate);
  if (!validation.ok) throw new Error(`invalid evidence review gate: ${validation.issues.join("; ")}`);
  return deepFreeze(gate);
}

export function evidenceReviewGateSummary() {
  return deepFreeze({
    gate_id: HNK_EVIDENCE_REVIEW_GATE_ID,
    version: HNK_EVIDENCE_REVIEW_GATE_VERSION,
    outcomes: [...HNK_EVIDENCE_REVIEW_OUTCOMES],
    pending_status: "PENDING_HUMAN_REVIEW",
    reviewed_status: "REVIEWED",
    explicit_human_signal_required: true,
    human_decision_required: true,
    machine_can_decide: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_EVIDENCE_REVIEW_GATE_BOUNDARY,
  });
}
