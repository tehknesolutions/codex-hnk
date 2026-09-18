import {
  validateClaimDossier,
} from "@hnk/claim-dossier";
import {
  evidenceSynthesisReport,
  validateEvidenceSynthesis,
} from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  queryReviewedClaimRegistry,
  validateReviewedClaimRegistry,
} from "@hnk/reviewed-claim-registry";

export const HNK_CLAIM_REEVALUATION_QUEUE_ID = "HNK_CLAIM_REEVALUATION_QUEUE_V1";
export const HNK_CLAIM_REEVALUATION_QUEUE_VERSION = "1.0.0";
export const HNK_CLAIM_REEVALUATION_QUEUE_BOUNDARY =
  "REEVALUATION_QUEUE_DETECTS_EVIDENCE_SNAPSHOT_CHANGE_NOT_NEW_TRUTH_CLASSIFICATION_OR_CANON";
export const HNK_REEVALUATION_REASONS = Object.freeze([
  "SYNTHESIS_SNAPSHOT_CHANGED",
  "LINKED_GROUP_MISSING",
  "LINKED_GROUP_STATUS_CHANGED",
  "LINKED_GROUP_DIRECTION_CHANGED",
  "SOURCE_QUESTIONS_CHANGED",
  "UNCLASSIFIED_NEW_GROUPS_PRESENT",
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

function sortedUnique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function queueDigest(queue) {
  return sha256Canonical(claimReevaluationQueueProjection(queue));
}

function itemProjection(item) {
  const projected = clone(item);
  delete projected.item_digest;
  return projected;
}

function itemDigest(item) {
  return sha256Canonical(itemProjection(item));
}

function activeRecordForClaim(registry, claimId) {
  const records = queryReviewedClaimRegistry(registry, {
    claim_id: claimId,
    active_only: true,
  });
  if (records.length !== 1) {
    throw new Error(
      records.length === 0
        ? `active reviewed claim ${claimId} not found`
        : `multiple active reviewed claims found for ${claimId}`,
    );
  }
  return records[0];
}

function validateInputs(input) {
  if (!input || typeof input !== "object") throw new TypeError("claim re-evaluation input required");

  const registryValidation = validateReviewedClaimRegistry(input.reviewed_registry);
  if (!registryValidation.ok) {
    throw new Error(`invalid reviewed claim registry: ${registryValidation.issues.join("; ")}`);
  }

  const dossierValidation = validateClaimDossier(input.original_dossier);
  if (!dossierValidation.ok) {
    throw new Error(`invalid original claim dossier: ${dossierValidation.issues.join("; ")}`);
  }

  const synthesisValidation = validateEvidenceSynthesis(input.candidate_synthesis);
  if (!synthesisValidation.ok) {
    throw new Error(`invalid candidate evidence synthesis: ${synthesisValidation.issues.join("; ")}`);
  }

  return activeRecordForClaim(
    input.reviewed_registry,
    cleanString(input.claim_id, "claim_id"),
  );
}

function ensureOriginalBinding(activeRecord, dossier) {
  if (
    dossier.claim_id !== activeRecord.claim_id ||
    dossier.dossier_digest !== activeRecord.dossier_digest ||
    dossier.statement !== activeRecord.statement ||
    dossier.scope !== activeRecord.scope
  ) {
    throw new Error("original dossier does not match active reviewed claim record");
  }

  if (
    dossier.synthesis_binding.synthesis_key !== activeRecord.synthesis_key ||
    dossier.synthesis_binding.synthesis_digest !== activeRecord.synthesis_digest
  ) {
    throw new Error("original dossier synthesis binding does not match active reviewed claim record");
  }
}

function groupQuestions(group) {
  return sortedUnique(group.questions.map((entry) => entry.question));
}

function linkedGroupChanges(dossier, candidateSynthesis) {
  const candidateReport = evidenceSynthesisReport(candidateSynthesis);
  const bySignature = new Map(
    candidateReport.groups.map((group) => [group.metric_signature_digest, group]),
  );

  const changes = dossier.evidence_links.map((link) => {
    const candidate = bySignature.get(link.metric_signature_digest) ?? null;
    const oldQuestions = sortedUnique(link.source_questions);
    const newQuestions = candidate ? groupQuestions(candidate) : [];
    const reasons = [];

    if (!candidate) {
      reasons.push("LINKED_GROUP_MISSING");
    } else {
      if (link.group_status !== candidate.status) {
        reasons.push("LINKED_GROUP_STATUS_CHANGED");
      }
      if (link.convergent_direction !== candidate.convergent_direction) {
        reasons.push("LINKED_GROUP_DIRECTION_CHANGED");
      }
      if (JSON.stringify(oldQuestions) !== JSON.stringify(newQuestions)) {
        reasons.push("SOURCE_QUESTIONS_CHANGED");
      }
    }

    return {
      metric_signature_digest: link.metric_signature_digest,
      metric_id: link.metric_id,
      old_group_status: link.group_status,
      new_group_status: candidate?.status ?? null,
      old_direction: link.convergent_direction,
      new_direction: candidate?.convergent_direction ?? null,
      old_source_questions: oldQuestions,
      new_source_questions: newQuestions,
      changes: reasons,
    };
  });

  const linkedSignatures = new Set(dossier.evidence_links.map((link) => link.metric_signature_digest));
  const unclassifiedNewGroups = candidateReport.groups
    .map((group) => group.metric_signature_digest)
    .filter((digest) => !linkedSignatures.has(digest))
    .sort((a, b) => a.localeCompare(b));

  return { changes, unclassifiedNewGroups };
}

export function claimReevaluationQueueProjection(queue) {
  const projected = clone(queue);
  delete projected.queue_digest;
  return deepFreeze(projected);
}

export function createClaimReevaluationQueue(input) {
  if (!input || typeof input !== "object") throw new TypeError("claim re-evaluation queue input required");

  const queue = {
    queue_id: HNK_CLAIM_REEVALUATION_QUEUE_ID,
    queue_version: HNK_CLAIM_REEVALUATION_QUEUE_VERSION,
    authority: "HNK_AUTHORED_CLAIM_REEVALUATION_QUEUE",
    queue_key: cleanString(input.queue_key, "queue_key"),
    title: cleanString(input.title, "title"),
    created_at: cleanString(input.created_at, "created_at"),
    items: [],
    queue_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    machine_can_decide_review: false,
    machine_can_change_classification: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_CLAIM_REEVALUATION_QUEUE_BOUNDARY,
  };
  queue.queue_digest = queueDigest(queue);

  const validation = validateClaimReevaluationQueue(queue);
  if (!validation.ok) throw new Error(`invalid claim re-evaluation queue: ${validation.issues.join("; ")}`);
  return deepFreeze(queue);
}

export function assessClaimReevaluation(input) {
  const activeRecord = validateInputs(input);
  ensureOriginalBinding(activeRecord, input.original_dossier);

  if (input.candidate_synthesis.synthesis_key !== activeRecord.synthesis_key) {
    throw new Error(
      `candidate synthesis key ${input.candidate_synthesis.synthesis_key} does not match reviewed synthesis key ${activeRecord.synthesis_key}`,
    );
  }

  const snapshotChanged =
    input.candidate_synthesis.synthesis_digest !== activeRecord.synthesis_digest;

  const { changes, unclassifiedNewGroups } = linkedGroupChanges(
    input.original_dossier,
    input.candidate_synthesis,
  );

  const reasons = [];
  if (snapshotChanged) reasons.push("SYNTHESIS_SNAPSHOT_CHANGED");

  for (const change of changes) {
    for (const reason of change.changes) {
      if (!reasons.includes(reason)) reasons.push(reason);
    }
  }

  if (unclassifiedNewGroups.length > 0) {
    reasons.push("UNCLASSIFIED_NEW_GROUPS_PRESENT");
  }

  const reviewDue = snapshotChanged;

  return deepFreeze({
    claim_id: activeRecord.claim_id,
    reviewed_record_id: activeRecord.record_id,
    previous_claim_version: activeRecord.claim_version,
    previous_classification: activeRecord.classification,
    original_synthesis_key: activeRecord.synthesis_key,
    original_synthesis_digest: activeRecord.synthesis_digest,
    candidate_synthesis_key: input.candidate_synthesis.synthesis_key,
    candidate_synthesis_digest: input.candidate_synthesis.synthesis_digest,
    review_due: reviewDue,
    reasons: reviewDue ? reasons : [],
    linked_group_changes: reviewDue ? changes : [],
    unclassified_new_group_signatures: reviewDue ? unclassifiedNewGroups : [],
    machine_changed_classification: false,
    machine_can_resolve: false,
    human_review_required: reviewDue,
    next_workflow: reviewDue
      ? "CREATE_NEW_CLAIM_DOSSIER_AND_HUMAN_REVIEW"
      : "NONE",
  });
}

export function addClaimReevaluation(queue, input) {
  const queueValidation = validateClaimReevaluationQueue(queue);
  if (!queueValidation.ok) {
    throw new Error(`cannot extend invalid claim re-evaluation queue: ${queueValidation.issues.join("; ")}`);
  }

  const assessment = assessClaimReevaluation(input);
  if (!assessment.review_due) {
    throw new Error("NO_REEVALUATION_REQUIRED");
  }

  if (
    queue.items.some(
      (item) =>
        item.reviewed_record_id === assessment.reviewed_record_id &&
        item.candidate_synthesis_digest === assessment.candidate_synthesis_digest,
    )
  ) {
    throw new Error("duplicate re-evaluation candidate");
  }

  const item = {
    ...clone(assessment),
    item_id: cleanString(input.item_id, "item_id"),
    detected_at: cleanString(input.detected_at, "detected_at"),
    status: "REVIEW_DUE",
    original_dossier_digest: input.original_dossier.dossier_digest,
    item_digest: "",
  };
  item.item_digest = itemDigest(item);

  if (queue.items.some((entry) => entry.item_id === item.item_id)) {
    throw new Error(`duplicate item_id ${item.item_id}`);
  }

  const next = clone(queue);
  next.items.push(item);
  next.queue_digest = queueDigest(next);

  const validation = validateClaimReevaluationQueue(next);
  if (!validation.ok) {
    throw new Error(`re-evaluation item produced invalid queue: ${validation.issues.join("; ")}`);
  }
  return deepFreeze(next);
}

function validateLinkedChange(change, issues, itemId) {
  if (!change || typeof change !== "object") {
    issues.push(`${itemId}: linked_group_change must be object`);
    return;
  }
  for (const field of ["metric_signature_digest", "metric_id", "old_group_status"]) {
    if (!nonEmpty(change[field])) issues.push(`${itemId}: linked_group_change.${field} required`);
  }
  if (!HEX_64.test(change.metric_signature_digest ?? "")) {
    issues.push(`${itemId}: linked group metric signature must be SHA-256 hex`);
  }
  if (change.new_group_status !== null && !nonEmpty(change.new_group_status)) {
    issues.push(`${itemId}: new_group_status must be null or non-empty`);
  }
  for (const field of ["old_source_questions", "new_source_questions", "changes"]) {
    if (!Array.isArray(change[field])) issues.push(`${itemId}: linked_group_change.${field} must be array`);
  }
  if (
    Array.isArray(change.changes) &&
    change.changes.some((reason) => !HNK_REEVALUATION_REASONS.includes(reason))
  ) {
    issues.push(`${itemId}: linked group contains invalid reason`);
  }
}

function validateItem(item, issues, seen) {
  if (!item || typeof item !== "object") {
    issues.push("queue item must be object");
    return;
  }

  for (const field of [
    "item_id",
    "claim_id",
    "reviewed_record_id",
    "previous_classification",
    "original_synthesis_key",
    "candidate_synthesis_key",
    "detected_at",
    "status",
    "next_workflow",
  ]) {
    if (!nonEmpty(item[field])) issues.push(`queue item ${field} required`);
  }

  if (!Number.isInteger(item.previous_claim_version) || item.previous_claim_version < 1) {
    issues.push(`${item.item_id}: previous_claim_version must be integer >= 1`);
  }

  for (const field of [
    "original_synthesis_digest",
    "candidate_synthesis_digest",
    "original_dossier_digest",
    "item_digest",
  ]) {
    if (!HEX_64.test(item[field] ?? "")) {
      issues.push(`${item.item_id}: ${field} must be SHA-256 hex`);
    }
  }

  if (item.original_synthesis_key !== item.candidate_synthesis_key) {
    issues.push(`${item.item_id}: candidate synthesis key must match original synthesis key`);
  }
  if (item.original_synthesis_digest === item.candidate_synthesis_digest) {
    issues.push(`${item.item_id}: REVIEW_DUE requires changed synthesis digest`);
  }
  if (item.review_due !== true || item.status !== "REVIEW_DUE") {
    issues.push(`${item.item_id}: queue items must remain REVIEW_DUE`);
  }
  if (!Array.isArray(item.reasons) || !item.reasons.includes("SYNTHESIS_SNAPSHOT_CHANGED")) {
    issues.push(`${item.item_id}: synthesis snapshot change reason required`);
  }
  if (
    Array.isArray(item.reasons) &&
    item.reasons.some((reason) => !HNK_REEVALUATION_REASONS.includes(reason))
  ) {
    issues.push(`${item.item_id}: invalid re-evaluation reason`);
  }
  if (!Array.isArray(item.linked_group_changes)) {
    issues.push(`${item.item_id}: linked_group_changes must be array`);
  } else {
    for (const change of item.linked_group_changes) validateLinkedChange(change, issues, item.item_id);
  }
  if (
    !Array.isArray(item.unclassified_new_group_signatures) ||
    item.unclassified_new_group_signatures.some((digest) => !HEX_64.test(digest))
  ) {
    issues.push(`${item.item_id}: unclassified_new_group_signatures must be SHA-256 digests`);
  }

  if (item.machine_changed_classification !== false) {
    issues.push(`${item.item_id}: machine_changed_classification must remain false`);
  }
  if (item.machine_can_resolve !== false) {
    issues.push(`${item.item_id}: machine_can_resolve must remain false`);
  }
  if (item.human_review_required !== true) {
    issues.push(`${item.item_id}: human_review_required must remain true`);
  }
  if (item.next_workflow !== "CREATE_NEW_CLAIM_DOSSIER_AND_HUMAN_REVIEW") {
    issues.push(`${item.item_id}: unexpected next_workflow ${item.next_workflow}`);
  }

  if (HEX_64.test(item.item_digest ?? "") && itemDigest(item) !== item.item_digest) {
    issues.push(`${item.item_id}: item_digest mismatch`);
  }

  const pairKey = `${item.reviewed_record_id}::${item.candidate_synthesis_digest}`;
  if (seen.items.has(item.item_id)) issues.push(`duplicate item_id ${item.item_id}`);
  seen.items.add(item.item_id);
  if (seen.pairs.has(pairKey)) issues.push(`duplicate re-evaluation pair ${pairKey}`);
  seen.pairs.add(pairKey);
}

export function validateClaimReevaluationQueue(queue) {
  const issues = [];
  if (!queue || typeof queue !== "object") {
    return deepFreeze({ ok: false, issues: ["queue must be object"] });
  }

  if (queue.queue_id !== HNK_CLAIM_REEVALUATION_QUEUE_ID) {
    issues.push(`unexpected queue_id ${queue.queue_id}`);
  }
  if (queue.queue_version !== HNK_CLAIM_REEVALUATION_QUEUE_VERSION) {
    issues.push(`unexpected queue_version ${queue.queue_version}`);
  }
  if (queue.authority !== "HNK_AUTHORED_CLAIM_REEVALUATION_QUEUE") {
    issues.push(`unexpected authority ${queue.authority}`);
  }
  for (const field of ["queue_key", "title", "created_at"]) {
    if (!nonEmpty(queue[field])) issues.push(`${field} required`);
  }

  if (!Array.isArray(queue.items)) {
    issues.push("items must be array");
  } else {
    const seen = { items: new Set(), pairs: new Set() };
    for (const item of queue.items) validateItem(item, issues, seen);
  }

  if (queue.persistence !== "USER_CONTROLLED_FILE_ONLY") {
    issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  }
  if (queue.server_persistence !== false) issues.push("server_persistence must remain false");
  if (queue.browser_persistence !== false) issues.push("browser_persistence must remain false");
  if (queue.machine_can_decide_review !== false) issues.push("machine_can_decide_review must remain false");
  if (queue.machine_can_change_classification !== false) {
    issues.push("machine_can_change_classification must remain false");
  }
  if (queue.automatic_truth_inference !== false) issues.push("automatic_truth_inference must remain false");
  if (queue.automatic_canon_promotion !== false) issues.push("automatic_canon_promotion must remain false");
  if (queue.canon_promotion_permitted !== false) issues.push("canon_promotion_permitted must remain false");
  if (queue.claim_boundary !== HNK_CLAIM_REEVALUATION_QUEUE_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${queue.claim_boundary}`);
  }

  if (!HEX_64.test(queue.queue_digest ?? "")) {
    issues.push("queue_digest must be SHA-256 hex");
  } else if (queueDigest(queue) !== queue.queue_digest) {
    issues.push("queue_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function claimReevaluationQueueIndex(queue) {
  const validation = validateClaimReevaluationQueue(queue);
  if (!validation.ok) {
    throw new Error(`cannot index invalid claim re-evaluation queue: ${validation.issues.join("; ")}`);
  }

  const reasonCounts = Object.fromEntries(
    HNK_REEVALUATION_REASONS.map((reason) => [
      reason,
      queue.items.filter((item) => item.reasons.includes(reason)).length,
    ]),
  );

  return deepFreeze({
    queue_key: queue.queue_key,
    review_due: queue.items.length,
    claim_ids: new Set(queue.items.map((item) => item.claim_id)).size,
    reason_counts: reasonCounts,
    items: clone(queue.items),
    truth_assessed: false,
    classifications_changed_by_machine: false,
    canon_promotion_permitted: false,
  });
}

export function serializeClaimReevaluationQueue(queue) {
  const validation = validateClaimReevaluationQueue(queue);
  if (!validation.ok) {
    throw new Error(`cannot serialize invalid claim re-evaluation queue: ${validation.issues.join("; ")}`);
  }
  return `${JSON.stringify(queue, null, 2)}\n`;
}

export function parseClaimReevaluationQueue(text) {
  if (!nonEmpty(text)) throw new TypeError("claim re-evaluation queue JSON text required");
  let queue;
  try {
    queue = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid claim re-evaluation queue JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateClaimReevaluationQueue(queue);
  if (!validation.ok) {
    throw new Error(`invalid claim re-evaluation queue: ${validation.issues.join("; ")}`);
  }
  return deepFreeze(queue);
}

export function claimReevaluationQueueSummary() {
  return deepFreeze({
    queue_id: HNK_CLAIM_REEVALUATION_QUEUE_ID,
    version: HNK_CLAIM_REEVALUATION_QUEUE_VERSION,
    reasons: [...HNK_REEVALUATION_REASONS],
    trigger: "SAME_SYNTHESIS_KEY_WITH_CHANGED_SYNTHESIS_DIGEST",
    linked_group_comparison: true,
    new_groups_flagged_as_unclassified_not_relevant: true,
    review_due_status: "REVIEW_DUE",
    next_workflow: "CREATE_NEW_CLAIM_DOSSIER_AND_HUMAN_REVIEW",
    machine_can_decide_review: false,
    machine_can_change_classification: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_CLAIM_REEVALUATION_QUEUE_BOUNDARY,
  });
}
