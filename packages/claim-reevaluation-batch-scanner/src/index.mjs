import {
  validateClaimDossier,
} from "@hnk/claim-dossier";
import {
  addClaimReevaluation,
  assessClaimReevaluation,
  validateClaimReevaluationQueue,
} from "@hnk/claim-reevaluation-queue";
import {
  validateEvidenceSynthesis,
} from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  queryReviewedClaimRegistry,
  validateReviewedClaimRegistry,
} from "@hnk/reviewed-claim-registry";

export const HNK_CLAIM_REEVALUATION_BATCH_SCANNER_ID =
  "HNK_CLAIM_REEVALUATION_BATCH_SCANNER_V1";
export const HNK_CLAIM_REEVALUATION_BATCH_SCANNER_VERSION = "1.0.0";
export const HNK_CLAIM_REEVALUATION_BATCH_SCANNER_BOUNDARY =
  "BATCH_SCANNER_AUTOMATES_CHANGE_DETECTION_COVERAGE_NOT_HUMAN_REVIEW_RECLASSIFICATION_TRUTH_OR_CANON";
export const HNK_BATCH_SCAN_STATUSES = Object.freeze([
  "CURRENT",
  "REVIEW_DUE",
  "MISSING_ORIGINAL_DOSSIER",
  "MISSING_CANDIDATE_SYNTHESIS",
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

function scanDigest(scan) {
  return sha256Canonical(batchScanProjection(scan));
}

function activeReviewedRecords(registry) {
  return [...queryReviewedClaimRegistry(registry, { active_only: true })]
    .sort((a, b) =>
      a.claim_id.localeCompare(b.claim_id) ||
      a.claim_version - b.claim_version ||
      a.record_id.localeCompare(b.record_id)
    );
}

function validateOriginalDossierAgainstRecord(record, dossier) {
  if (
    dossier.claim_id !== record.claim_id ||
    dossier.dossier_digest !== record.dossier_digest ||
    dossier.statement !== record.statement ||
    dossier.scope !== record.scope
  ) {
    throw new Error(
      `original dossier ${dossier.dossier_digest} does not match active reviewed record ${record.record_id}`,
    );
  }

  if (
    dossier.synthesis_binding.synthesis_key !== record.synthesis_key ||
    dossier.synthesis_binding.synthesis_digest !== record.synthesis_digest
  ) {
    throw new Error(
      `original dossier synthesis binding does not match active reviewed record ${record.record_id}`,
    );
  }
}

function prepareInputs(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("claim re-evaluation batch scan input required");
  }

  const registryValidation = validateReviewedClaimRegistry(input.reviewed_registry);
  if (!registryValidation.ok) {
    throw new Error(
      `invalid reviewed claim registry: ${registryValidation.issues.join("; ")}`,
    );
  }

  if (!Array.isArray(input.original_dossiers)) {
    throw new TypeError("original_dossiers must be an array");
  }
  if (!Array.isArray(input.candidate_syntheses)) {
    throw new TypeError("candidate_syntheses must be an array");
  }

  const dossierByDigest = new Map();
  for (const dossier of input.original_dossiers) {
    const validation = validateClaimDossier(dossier);
    if (!validation.ok) {
      throw new Error(
        `invalid original dossier: ${validation.issues.join("; ")}`,
      );
    }
    if (dossierByDigest.has(dossier.dossier_digest)) {
      throw new Error(`duplicate original dossier digest ${dossier.dossier_digest}`);
    }
    dossierByDigest.set(dossier.dossier_digest, dossier);
  }

  const synthesisByKey = new Map();
  for (const synthesis of input.candidate_syntheses) {
    const validation = validateEvidenceSynthesis(synthesis);
    if (!validation.ok) {
      throw new Error(
        `invalid candidate synthesis: ${validation.issues.join("; ")}`,
      );
    }
    if (synthesisByKey.has(synthesis.synthesis_key)) {
      throw new Error(
        `duplicate candidate synthesis key ${synthesis.synthesis_key}; batch scan requires one explicit candidate snapshot per synthesis key`,
      );
    }
    synthesisByKey.set(synthesis.synthesis_key, synthesis);
  }

  return {
    scannedAt: cleanString(input.scanned_at, "scanned_at"),
    activeRecords: activeReviewedRecords(input.reviewed_registry),
    dossierByDigest,
    synthesisByKey,
  };
}

export function batchScanProjection(scan) {
  const projected = clone(scan);
  delete projected.scan_digest;
  return deepFreeze(projected);
}

export function scanClaimReevaluationBatch(input) {
  const prepared = prepareInputs(input);
  const usedDossierDigests = new Set();
  const usedSynthesisKeys = new Set();
  const results = [];

  for (const record of prepared.activeRecords) {
    const dossier = prepared.dossierByDigest.get(record.dossier_digest) ?? null;
    const candidate = prepared.synthesisByKey.get(record.synthesis_key) ?? null;

    if (dossier) {
      validateOriginalDossierAgainstRecord(record, dossier);
      usedDossierDigests.add(dossier.dossier_digest);
    }
    if (candidate) {
      usedSynthesisKeys.add(candidate.synthesis_key);
    }

    if (!dossier) {
      results.push({
        claim_id: record.claim_id,
        reviewed_record_id: record.record_id,
        claim_version: record.claim_version,
        previous_classification: record.classification,
        synthesis_key: record.synthesis_key,
        original_synthesis_digest: record.synthesis_digest,
        status: "MISSING_ORIGINAL_DOSSIER",
        original_dossier_digest: null,
        candidate_synthesis_digest: candidate?.synthesis_digest ?? null,
        assessment: null,
      });
      continue;
    }

    if (!candidate) {
      results.push({
        claim_id: record.claim_id,
        reviewed_record_id: record.record_id,
        claim_version: record.claim_version,
        previous_classification: record.classification,
        synthesis_key: record.synthesis_key,
        original_synthesis_digest: record.synthesis_digest,
        status: "MISSING_CANDIDATE_SYNTHESIS",
        original_dossier_digest: dossier.dossier_digest,
        candidate_synthesis_digest: null,
        assessment: null,
      });
      continue;
    }

    const assessment = assessClaimReevaluation({
      reviewed_registry: input.reviewed_registry,
      claim_id: record.claim_id,
      original_dossier: dossier,
      candidate_synthesis: candidate,
    });

    results.push({
      claim_id: record.claim_id,
      reviewed_record_id: record.record_id,
      claim_version: record.claim_version,
      previous_classification: record.classification,
      synthesis_key: record.synthesis_key,
      original_synthesis_digest: record.synthesis_digest,
      status: assessment.review_due ? "REVIEW_DUE" : "CURRENT",
      original_dossier_digest: dossier.dossier_digest,
      candidate_synthesis_digest: candidate.synthesis_digest,
      assessment,
    });
  }

  const statusCounts = Object.fromEntries(
    HNK_BATCH_SCAN_STATUSES.map((status) => [
      status,
      results.filter((result) => result.status === status).length,
    ]),
  );

  const unresolved =
    statusCounts.MISSING_ORIGINAL_DOSSIER +
    statusCounts.MISSING_CANDIDATE_SYNTHESIS;

  const scan = {
    scan_id: HNK_CLAIM_REEVALUATION_BATCH_SCANNER_ID,
    scan_version: HNK_CLAIM_REEVALUATION_BATCH_SCANNER_VERSION,
    authority: "HNK_AUTHORED_CLAIM_REEVALUATION_BATCH_SCANNER",
    scanned_at: prepared.scannedAt,
    reviewed_registry_key: input.reviewed_registry.registry_key,
    reviewed_registry_digest: input.reviewed_registry.registry_digest,
    active_claims: prepared.activeRecords.length,
    dossier_inputs: input.original_dossiers.length,
    synthesis_inputs: input.candidate_syntheses.length,
    coverage_complete: unresolved === 0,
    results,
    status_counts: statusCounts,
    unused_dossier_digests: [...prepared.dossierByDigest.keys()]
      .filter((digest) => !usedDossierDigests.has(digest))
      .sort((a, b) => a.localeCompare(b)),
    unused_candidate_synthesis_keys: [...prepared.synthesisByKey.keys()]
      .filter((key) => !usedSynthesisKeys.has(key))
      .sort((a, b) => a.localeCompare(b)),
    scan_digest: "",
    machine_can_decide_review: false,
    machine_can_change_classification: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_CLAIM_REEVALUATION_BATCH_SCANNER_BOUNDARY,
  };
  scan.scan_digest = scanDigest(scan);

  const validation = validateClaimReevaluationBatchScan(scan);
  if (!validation.ok) {
    throw new Error(
      `invalid claim re-evaluation batch scan: ${validation.issues.join("; ")}`,
    );
  }

  return deepFreeze(scan);
}

export function materializeClaimReevaluationBatch(queue, input) {
  const queueValidation = validateClaimReevaluationQueue(queue);
  if (!queueValidation.ok) {
    throw new Error(
      `cannot materialize into invalid re-evaluation queue: ${queueValidation.issues.join("; ")}`,
    );
  }

  const scan = scanClaimReevaluationBatch(input);
  const dossierByDigest = new Map(
    input.original_dossiers.map((dossier) => [dossier.dossier_digest, dossier]),
  );
  const synthesisByKey = new Map(
    input.candidate_syntheses.map((synthesis) => [synthesis.synthesis_key, synthesis]),
  );

  const existingPairs = new Set(
    queue.items.map(
      (item) => `${item.reviewed_record_id}::${item.candidate_synthesis_digest}`,
    ),
  );

  let nextQueue = queue;
  let added = 0;
  let skippedExisting = 0;

  for (const result of scan.results) {
    if (result.status !== "REVIEW_DUE" || !result.assessment) continue;

    const pairKey =
      `${result.reviewed_record_id}::${result.candidate_synthesis_digest}`;

    if (existingPairs.has(pairKey)) {
      skippedExisting += 1;
      continue;
    }

    const dossier = result.original_dossier_digest
      ? dossierByDigest.get(result.original_dossier_digest)
      : null;
    const candidate = synthesisByKey.get(result.synthesis_key) ?? null;

    if (!dossier || !candidate) {
      throw new Error(
        `materialization invariant failure for ${result.claim_id}: required dossier or synthesis disappeared`,
      );
    }

    const deterministicId = sha256Canonical({
      reviewed_record_id: result.reviewed_record_id,
      candidate_synthesis_digest: result.candidate_synthesis_digest,
    }).slice(0, 24);

    nextQueue = addClaimReevaluation(nextQueue, {
      item_id: `BATCH-REEVAL-${deterministicId}`,
      detected_at: scan.scanned_at,
      reviewed_registry: input.reviewed_registry,
      claim_id: result.claim_id,
      original_dossier: dossier,
      candidate_synthesis: candidate,
    });

    existingPairs.add(pairKey);
    added += 1;
  }

  const unresolvedCoverage =
    scan.status_counts.MISSING_ORIGINAL_DOSSIER +
    scan.status_counts.MISSING_CANDIDATE_SYNTHESIS;

  return deepFreeze({
    queue: nextQueue,
    scan,
    review_due_found: scan.status_counts.REVIEW_DUE,
    added,
    skipped_existing: skippedExisting,
    unresolved_coverage: unresolvedCoverage,
    machine_changed_classifications: false,
    human_review_required_for_added_items: true,
  });
}

function validateResult(result, issues, seenRecords) {
  if (!result || typeof result !== "object") {
    issues.push("scan result must be object");
    return;
  }

  for (const field of [
    "claim_id",
    "reviewed_record_id",
    "previous_classification",
    "synthesis_key",
    "original_synthesis_digest",
    "status",
  ]) {
    if (!nonEmpty(result[field])) {
      issues.push(`scan result ${field} required`);
    }
  }

  if (!Number.isInteger(result.claim_version) || result.claim_version < 1) {
    issues.push(`${result.reviewed_record_id}: claim_version must be integer >= 1`);
  }
  if (!HNK_BATCH_SCAN_STATUSES.includes(result.status)) {
    issues.push(`${result.reviewed_record_id}: invalid scan status ${result.status}`);
  }
  if (!HEX_64.test(result.original_synthesis_digest ?? "")) {
    issues.push(`${result.reviewed_record_id}: original_synthesis_digest must be SHA-256 hex`);
  }
  if (
    result.original_dossier_digest !== null &&
    !HEX_64.test(result.original_dossier_digest ?? "")
  ) {
    issues.push(`${result.reviewed_record_id}: original_dossier_digest must be SHA-256 hex or null`);
  }
  if (
    result.candidate_synthesis_digest !== null &&
    !HEX_64.test(result.candidate_synthesis_digest ?? "")
  ) {
    issues.push(`${result.reviewed_record_id}: candidate_synthesis_digest must be SHA-256 hex or null`);
  }

  if (result.status === "MISSING_ORIGINAL_DOSSIER") {
    if (result.original_dossier_digest !== null || result.assessment !== null) {
      issues.push(`${result.reviewed_record_id}: missing dossier result must not contain dossier digest/assessment`);
    }
  } else if (result.status === "MISSING_CANDIDATE_SYNTHESIS") {
    if (!result.original_dossier_digest || result.candidate_synthesis_digest !== null || result.assessment !== null) {
      issues.push(`${result.reviewed_record_id}: missing candidate result shape invalid`);
    }
  } else {
    if (!result.original_dossier_digest || !result.candidate_synthesis_digest || !result.assessment) {
      issues.push(`${result.reviewed_record_id}: CURRENT/REVIEW_DUE requires dossier, candidate, and assessment`);
    } else {
      if (result.assessment.claim_id !== result.claim_id) {
        issues.push(`${result.reviewed_record_id}: assessment claim_id drift`);
      }
      if (result.assessment.reviewed_record_id !== result.reviewed_record_id) {
        issues.push(`${result.reviewed_record_id}: assessment reviewed_record_id drift`);
      }
      if (result.assessment.previous_classification !== result.previous_classification) {
        issues.push(`${result.reviewed_record_id}: previous classification drift`);
      }
      if (result.assessment.machine_changed_classification !== false) {
        issues.push(`${result.reviewed_record_id}: machine classification change forbidden`);
      }
      if (result.status === "REVIEW_DUE" && result.assessment.review_due !== true) {
        issues.push(`${result.reviewed_record_id}: REVIEW_DUE must bind review_due=true assessment`);
      }
      if (result.status === "CURRENT" && result.assessment.review_due !== false) {
        issues.push(`${result.reviewed_record_id}: CURRENT must bind review_due=false assessment`);
      }
    }
  }

  if (seenRecords.has(result.reviewed_record_id)) {
    issues.push(`duplicate reviewed_record_id ${result.reviewed_record_id}`);
  }
  seenRecords.add(result.reviewed_record_id);
}

export function validateClaimReevaluationBatchScan(scan) {
  const issues = [];
  if (!scan || typeof scan !== "object") {
    return deepFreeze({ ok: false, issues: ["scan must be object"] });
  }

  if (scan.scan_id !== HNK_CLAIM_REEVALUATION_BATCH_SCANNER_ID) {
    issues.push(`unexpected scan_id ${scan.scan_id}`);
  }
  if (scan.scan_version !== HNK_CLAIM_REEVALUATION_BATCH_SCANNER_VERSION) {
    issues.push(`unexpected scan_version ${scan.scan_version}`);
  }
  if (scan.authority !== "HNK_AUTHORED_CLAIM_REEVALUATION_BATCH_SCANNER") {
    issues.push(`unexpected authority ${scan.authority}`);
  }

  for (const field of ["scanned_at", "reviewed_registry_key"]) {
    if (!nonEmpty(scan[field])) issues.push(`${field} required`);
  }
  if (!HEX_64.test(scan.reviewed_registry_digest ?? "")) {
    issues.push("reviewed_registry_digest must be SHA-256 hex");
  }

  for (const field of ["active_claims", "dossier_inputs", "synthesis_inputs"]) {
    if (!Number.isInteger(scan[field]) || scan[field] < 0) {
      issues.push(`${field} must be integer >= 0`);
    }
  }

  if (!Array.isArray(scan.results)) {
    issues.push("results must be array");
  } else {
    const seenRecords = new Set();
    for (const result of scan.results) validateResult(result, issues, seenRecords);
    if (scan.results.length !== scan.active_claims) {
      issues.push("results length must equal active_claims");
    }
  }

  if (!scan.status_counts || typeof scan.status_counts !== "object") {
    issues.push("status_counts required");
  } else {
    let total = 0;
    for (const status of HNK_BATCH_SCAN_STATUSES) {
      const count = scan.status_counts[status];
      if (!Number.isInteger(count) || count < 0) {
        issues.push(`status_counts.${status} must be integer >= 0`);
      } else {
        total += count;
      }
    }
    if (total !== scan.active_claims) {
      issues.push("status_counts total must equal active_claims");
    }

    const unresolved =
      (scan.status_counts.MISSING_ORIGINAL_DOSSIER ?? 0) +
      (scan.status_counts.MISSING_CANDIDATE_SYNTHESIS ?? 0);
    if (scan.coverage_complete !== (unresolved === 0)) {
      issues.push("coverage_complete does not match missing-input statuses");
    }
  }

  for (const field of ["unused_dossier_digests", "unused_candidate_synthesis_keys"]) {
    if (!Array.isArray(scan[field])) issues.push(`${field} must be array`);
  }
  if (
    Array.isArray(scan.unused_dossier_digests) &&
    scan.unused_dossier_digests.some((digest) => !HEX_64.test(digest))
  ) {
    issues.push("unused_dossier_digests must contain SHA-256 digests");
  }
  if (
    Array.isArray(scan.unused_candidate_synthesis_keys) &&
    scan.unused_candidate_synthesis_keys.some((key) => !nonEmpty(key))
  ) {
    issues.push("unused_candidate_synthesis_keys must contain non-empty strings");
  }

  if (scan.machine_can_decide_review !== false) {
    issues.push("machine_can_decide_review must remain false");
  }
  if (scan.machine_can_change_classification !== false) {
    issues.push("machine_can_change_classification must remain false");
  }
  if (scan.automatic_truth_inference !== false) {
    issues.push("automatic_truth_inference must remain false");
  }
  if (scan.automatic_canon_promotion !== false) {
    issues.push("automatic_canon_promotion must remain false");
  }
  if (scan.canon_promotion_permitted !== false) {
    issues.push("canon_promotion_permitted must remain false");
  }
  if (scan.claim_boundary !== HNK_CLAIM_REEVALUATION_BATCH_SCANNER_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${scan.claim_boundary}`);
  }

  if (!HEX_64.test(scan.scan_digest ?? "")) {
    issues.push("scan_digest must be SHA-256 hex");
  } else if (scanDigest(scan) !== scan.scan_digest) {
    issues.push("scan_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function serializeClaimReevaluationBatchScan(scan) {
  const validation = validateClaimReevaluationBatchScan(scan);
  if (!validation.ok) {
    throw new Error(
      `cannot serialize invalid claim re-evaluation batch scan: ${validation.issues.join("; ")}`,
    );
  }
  return `${JSON.stringify(scan, null, 2)}\n`;
}

export function parseClaimReevaluationBatchScan(text) {
  if (!nonEmpty(text)) {
    throw new TypeError("claim re-evaluation batch scan JSON text required");
  }

  let scan;
  try {
    scan = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(
      `invalid claim re-evaluation batch scan JSON: ${error instanceof Error ? error.message : "parse failed"}`,
    );
  }

  const validation = validateClaimReevaluationBatchScan(scan);
  if (!validation.ok) {
    throw new Error(
      `invalid claim re-evaluation batch scan: ${validation.issues.join("; ")}`,
    );
  }
  return deepFreeze(scan);
}

export function claimReevaluationBatchScannerSummary() {
  return deepFreeze({
    scanner_id: HNK_CLAIM_REEVALUATION_BATCH_SCANNER_ID,
    version: HNK_CLAIM_REEVALUATION_BATCH_SCANNER_VERSION,
    statuses: [...HNK_BATCH_SCAN_STATUSES],
    scope: "ALL_ACTIVE_REVIEWED_CLAIMS",
    dossier_match: "EXACT_DOSSIER_DIGEST",
    candidate_match: "EXACT_SYNTHESIS_KEY",
    duplicate_candidate_keys_rejected: true,
    incomplete_input_coverage_preserved: true,
    idempotent_queue_materialization: true,
    new_groups_flagged_as_unclassified_not_relevant: true,
    machine_can_decide_review: false,
    machine_can_change_classification: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_CLAIM_REEVALUATION_BATCH_SCANNER_BOUNDARY,
  });
}
