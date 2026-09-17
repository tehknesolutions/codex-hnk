import {
  evidenceSynthesisReport,
  validateEvidenceSynthesis,
} from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";

export const HNK_CLAIM_DOSSIER_ID = "HNK_CLAIM_DOSSIER_V1";
export const HNK_CLAIM_DOSSIER_VERSION = "1.0.0";
export const HNK_CLAIM_DOSSIER_BOUNDARY =
  "CLAIM_DOSSIER_ORGANIZES_EVIDENCE_RELEVANCE_GAPS_AND_CONFLICTS_NOT_TRUTH_OR_CANON";
export const HNK_CLAIM_SCOPES = Object.freeze([
  "DESCRIPTIVE",
  "PROCESS_INTEGRITY",
  "EXPLORATORY_INTERPRETATION",
]);
export const HNK_CLAIM_EVIDENCE_RELATIONS = Object.freeze([
  "CONSISTENT_WITH",
  "INCONSISTENT_WITH",
  "CONTEXT_ONLY",
  "UNRESOLVED",
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

function dossierDigest(dossier) {
  return sha256Canonical(claimDossierProjection(dossier));
}

function reportGroupMap(synthesis) {
  const report = evidenceSynthesisReport(synthesis);
  return new Map(report.groups.map((group) => [group.metric_signature_digest, group]));
}

function normalizeEvidenceLink(input, group, index) {
  if (!input || typeof input !== "object") throw new TypeError(`evidence_links[${index}] must be an object`);
  if (!HNK_CLAIM_EVIDENCE_RELATIONS.includes(input.relation)) {
    throw new RangeError(`evidence_links[${index}].relation is invalid: ${input.relation}`);
  }
  return {
    link_id: cleanString(input.link_id, `evidence_links[${index}].link_id`),
    metric_signature_digest: group.metric_signature_digest,
    metric_id: group.metric_id,
    metric_label: group.metric_label,
    group_status: group.status,
    convergent_direction: group.convergent_direction,
    relation: input.relation,
    rationale: cleanString(input.rationale, `evidence_links[${index}].rationale`),
    source_questions: [...new Set(group.questions.map((item) => item.question))],
  };
}

export function claimDossierProjection(dossier) {
  const projected = clone(dossier);
  delete projected.dossier_digest;
  return deepFreeze(projected);
}

export function createClaimDossier(input) {
  if (!input || typeof input !== "object") throw new TypeError("claim dossier input required");
  const synthesisValidation = validateEvidenceSynthesis(input.synthesis);
  if (!synthesisValidation.ok) {
    throw new Error(`invalid evidence synthesis: ${synthesisValidation.issues.join("; ")}`);
  }
  if (!HNK_CLAIM_SCOPES.includes(input.scope)) {
    throw new RangeError(`invalid claim scope ${input.scope}`);
  }
  if (!Array.isArray(input.evidence_links) || input.evidence_links.length === 0) {
    throw new TypeError("at least one evidence link is required");
  }

  const groups = reportGroupMap(input.synthesis);
  const evidenceLinks = input.evidence_links.map((link, index) => {
    const digest = cleanString(link.metric_signature_digest, `evidence_links[${index}].metric_signature_digest`);
    const group = groups.get(digest);
    if (!group) throw new Error(`evidence link ${digest} does not exist in synthesis ${input.synthesis.synthesis_key}`);
    return normalizeEvidenceLink(link, group, index);
  });

  if (new Set(evidenceLinks.map((link) => link.link_id)).size !== evidenceLinks.length) {
    throw new Error("evidence link_id values must be unique");
  }
  if (new Set(evidenceLinks.map((link) => link.metric_signature_digest)).size !== evidenceLinks.length) {
    throw new Error("a metric synthesis group may be linked only once per claim dossier");
  }

  const dossier = {
    dossier_id: HNK_CLAIM_DOSSIER_ID,
    dossier_version: HNK_CLAIM_DOSSIER_VERSION,
    authority: "HNK_AUTHORED_CLAIM_DOSSIER",
    claim_id: cleanString(input.claim_id, "claim_id"),
    statement: cleanString(input.statement, "statement"),
    scope: input.scope,
    authored_by: cleanString(input.authored_by, "authored_by"),
    created_at: cleanString(input.created_at, "created_at"),
    synthesis_binding: {
      synthesis_key: input.synthesis.synthesis_key,
      synthesis_digest: input.synthesis.synthesis_digest,
    },
    evidence_links: evidenceLinks,
    gaps: cleanStringArray(input.gaps, "gaps"),
    conflicts: cleanStringArray(input.conflicts, "conflicts"),
    notes: cleanStringArray(input.notes, "notes"),
    dossier_digest: "",
    human_relevance_classification_required: true,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_CLAIM_DOSSIER_BOUNDARY,
  };
  dossier.dossier_digest = dossierDigest(dossier);

  const validation = validateClaimDossier(dossier);
  if (!validation.ok) throw new Error(`invalid claim dossier: ${validation.issues.join("; ")}`);
  return deepFreeze(dossier);
}

function validateEvidenceLink(link, issues, seenIds, seenSignatures) {
  if (!link || typeof link !== "object") {
    issues.push("evidence link must be an object");
    return;
  }
  for (const field of ["link_id", "metric_signature_digest", "metric_id", "metric_label", "group_status", "relation", "rationale"]) {
    if (!nonEmpty(link[field])) issues.push(`evidence link ${field} required`);
  }
  if (!HEX_64.test(link.metric_signature_digest ?? "")) {
    issues.push(`${link.link_id}: metric_signature_digest must be SHA-256 hex`);
  }
  if (!["INSUFFICIENT", "SINGLE_REGISTRY_SIGNAL", "CONVERGENT", "DIVERGENT", "MIXED"].includes(link.group_status)) {
    issues.push(`${link.link_id}: invalid group_status ${link.group_status}`);
  }
  if (!HNK_CLAIM_EVIDENCE_RELATIONS.includes(link.relation)) {
    issues.push(`${link.link_id}: invalid relation ${link.relation}`);
  }
  if (link.convergent_direction !== null && !["HIGHER", "LOWER", "EQUAL"].includes(link.convergent_direction)) {
    issues.push(`${link.link_id}: invalid convergent_direction ${link.convergent_direction}`);
  }
  if (link.group_status !== "CONVERGENT" && link.group_status !== "SINGLE_REGISTRY_SIGNAL" && link.convergent_direction !== null) {
    issues.push(`${link.link_id}: only CONVERGENT or SINGLE_REGISTRY_SIGNAL may expose convergent_direction`);
  }
  if (link.group_status === "CONVERGENT" && link.convergent_direction === null) {
    issues.push(`${link.link_id}: CONVERGENT group must expose convergent_direction`);
  }
  if (!Array.isArray(link.source_questions) || link.source_questions.some((q) => !nonEmpty(q))) {
    issues.push(`${link.link_id}: source_questions must contain non-empty strings`);
  }
  if (seenIds.has(link.link_id)) issues.push(`duplicate link_id ${link.link_id}`);
  seenIds.add(link.link_id);
  if (seenSignatures.has(link.metric_signature_digest)) {
    issues.push(`duplicate metric_signature_digest ${link.metric_signature_digest}`);
  }
  seenSignatures.add(link.metric_signature_digest);
}

export function validateClaimDossier(dossier) {
  const issues = [];
  if (!dossier || typeof dossier !== "object") {
    return deepFreeze({ ok: false, issues: ["dossier must be an object"] });
  }
  if (dossier.dossier_id !== HNK_CLAIM_DOSSIER_ID) issues.push(`unexpected dossier_id ${dossier.dossier_id}`);
  if (dossier.dossier_version !== HNK_CLAIM_DOSSIER_VERSION) issues.push(`unexpected dossier_version ${dossier.dossier_version}`);
  if (dossier.authority !== "HNK_AUTHORED_CLAIM_DOSSIER") issues.push(`unexpected authority ${dossier.authority}`);
  for (const field of ["claim_id", "statement", "authored_by", "created_at"]) {
    if (!nonEmpty(dossier[field])) issues.push(`${field} required`);
  }
  if (!HNK_CLAIM_SCOPES.includes(dossier.scope)) issues.push(`invalid claim scope ${dossier.scope}`);
  if (!dossier.synthesis_binding || typeof dossier.synthesis_binding !== "object") {
    issues.push("synthesis_binding required");
  } else {
    if (!nonEmpty(dossier.synthesis_binding.synthesis_key)) issues.push("synthesis_binding.synthesis_key required");
    if (!HEX_64.test(dossier.synthesis_binding.synthesis_digest ?? "")) issues.push("synthesis_binding.synthesis_digest must be SHA-256 hex");
  }
  if (!Array.isArray(dossier.evidence_links) || dossier.evidence_links.length === 0) {
    issues.push("at least one evidence link required");
  } else {
    const ids = new Set();
    const signatures = new Set();
    for (const link of dossier.evidence_links) validateEvidenceLink(link, issues, ids, signatures);
  }
  for (const field of ["gaps", "conflicts", "notes"]) {
    if (!Array.isArray(dossier[field]) || dossier[field].some((value) => !nonEmpty(value))) {
      issues.push(`${field} must contain only non-empty strings`);
    }
  }
  if (dossier.human_relevance_classification_required !== true) issues.push("human_relevance_classification_required must remain true");
  if (dossier.automatic_truth_inference !== false) issues.push("automatic_truth_inference must remain false");
  if (dossier.automatic_canon_promotion !== false) issues.push("automatic_canon_promotion must remain false");
  if (dossier.causal_claim_permitted !== false) issues.push("causal_claim_permitted must remain false");
  if (dossier.metaphysical_proof_permitted !== false) issues.push("metaphysical_proof_permitted must remain false");
  if (dossier.claim_boundary !== HNK_CLAIM_DOSSIER_BOUNDARY) issues.push(`unexpected claim_boundary ${dossier.claim_boundary}`);
  if (!HEX_64.test(dossier.dossier_digest ?? "")) {
    issues.push("dossier_digest must be SHA-256 hex");
  } else if (dossierDigest(dossier) !== dossier.dossier_digest) {
    issues.push("dossier_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function verifyClaimDossierAgainstSynthesis(dossier, synthesis) {
  const issues = [];
  const dossierValidation = validateClaimDossier(dossier);
  if (!dossierValidation.ok) issues.push(...dossierValidation.issues);
  const synthesisValidation = validateEvidenceSynthesis(synthesis);
  if (!synthesisValidation.ok) issues.push(...synthesisValidation.issues.map((issue) => `synthesis: ${issue}`));

  if (
    dossier.synthesis_binding?.synthesis_key !== synthesis.synthesis_key ||
    dossier.synthesis_binding?.synthesis_digest !== synthesis.synthesis_digest
  ) {
    issues.push("dossier synthesis binding does not match supplied synthesis");
  }

  if (synthesisValidation.ok) {
    const groups = reportGroupMap(synthesis);
    for (const link of dossier.evidence_links ?? []) {
      const group = groups.get(link.metric_signature_digest);
      if (!group) {
        issues.push(`${link.link_id}: linked metric group missing from synthesis`);
        continue;
      }
      if (
        link.metric_id !== group.metric_id ||
        link.metric_label !== group.metric_label ||
        link.group_status !== group.status ||
        link.convergent_direction !== group.convergent_direction ||
        JSON.stringify(link.source_questions) !== JSON.stringify([...new Set(group.questions.map((item) => item.question))])
      ) {
        issues.push(`${link.link_id}: linked synthesis group snapshot drift`);
      }
    }
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function assessClaimDossier(dossier) {
  const validation = validateClaimDossier(dossier);
  if (!validation.ok) throw new Error(`cannot assess invalid claim dossier: ${validation.issues.join("; ")}`);

  const relationCounts = Object.fromEntries(
    HNK_CLAIM_EVIDENCE_RELATIONS.map((relation) => [
      relation,
      dossier.evidence_links.filter((link) => link.relation === relation).length,
    ]),
  );
  const statuses = ["INSUFFICIENT", "SINGLE_REGISTRY_SIGNAL", "CONVERGENT", "DIVERGENT", "MIXED"];
  const groupStatusCounts = Object.fromEntries(
    statuses.map((status) => [
      status,
      dossier.evidence_links.filter((link) => link.group_status === status).length,
    ]),
  );
  const unresolvedLinks = dossier.evidence_links
    .filter((link) => link.relation === "UNRESOLVED")
    .map((link) => link.link_id);

  const blockingReasons = [];
  if (dossier.evidence_links.length === 0) blockingReasons.push("NO_EVIDENCE_LINKS");

  return deepFreeze({
    claim_id: dossier.claim_id,
    linked_groups: dossier.evidence_links.length,
    relation_counts: relationCounts,
    group_status_counts: groupStatusCounts,
    unresolved_links: unresolvedLinks,
    gaps: [...dossier.gaps],
    conflicts: [...dossier.conflicts],
    ready_for_human_review: blockingReasons.length === 0,
    blocking_reasons: blockingReasons,
    truth_assessed: false,
    canon_promotion_permitted: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
  });
}

export function serializeClaimDossier(dossier) {
  const validation = validateClaimDossier(dossier);
  if (!validation.ok) throw new Error(`cannot serialize invalid claim dossier: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(dossier, null, 2)}\n`;
}

export function parseClaimDossier(text) {
  if (!nonEmpty(text)) throw new TypeError("claim dossier JSON text required");
  let dossier;
  try {
    dossier = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid claim dossier JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }
  const validation = validateClaimDossier(dossier);
  if (!validation.ok) throw new Error(`invalid claim dossier: ${validation.issues.join("; ")}`);
  return deepFreeze(dossier);
}

export function claimDossierSummary() {
  return deepFreeze({
    dossier_id: HNK_CLAIM_DOSSIER_ID,
    version: HNK_CLAIM_DOSSIER_VERSION,
    scopes: [...HNK_CLAIM_SCOPES],
    evidence_relations: [...HNK_CLAIM_EVIDENCE_RELATIONS],
    evidence_source: "HNK_EVIDENCE_SYNTHESIS_V1",
    human_relevance_classification_required: true,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_CLAIM_DOSSIER_BOUNDARY,
  });
}
