import { sha256Canonical } from "@hnk/experiment-attestation";
import {
  replicationReport,
  validateReplicationRegistry,
} from "@hnk/replication-registry";

export const HNK_EVIDENCE_SYNTHESIS_ID = "HNK_EVIDENCE_SYNTHESIS_V1";
export const HNK_EVIDENCE_SYNTHESIS_VERSION = "1.0.0";
export const HNK_EVIDENCE_SYNTHESIS_BOUNDARY =
  "EVIDENCE_SYNTHESIS_MAPS_CONVERGENCE_DIVERGENCE_AND_INSUFFICIENCY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF";
export const HNK_SYNTHESIS_GROUP_STATUSES = Object.freeze([
  "INSUFFICIENT",
  "SINGLE_REGISTRY_SIGNAL",
  "CONVERGENT",
  "DIVERGENT",
  "MIXED",
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

function synthesisDigest(synthesis) {
  return sha256Canonical(evidenceSynthesisProjection(synthesis));
}

function registryEntry(registry, sourceId, addedAt) {
  const validation = validateReplicationRegistry(registry);
  if (!validation.ok) {
    throw new Error(`invalid replication registry: ${validation.issues.join("; ")}`);
  }
  const report = replicationReport(registry);

  return deepFreeze({
    source_id: cleanString(sourceId, "source_id"),
    replication_key: registry.replication_key,
    title: registry.title,
    question: registry.question,
    registry_digest: registry.registry_digest,
    metric_signature_digest: registry.metric_signature.signature_digest,
    metric_id: registry.metric_signature.metric_id,
    metric_label: registry.metric_signature.label,
    metric_type: registry.metric_signature.metric_type,
    unit: registry.metric_signature.unit ?? null,
    replication_status: report.status,
    repeated_direction: report.repeated_direction,
    total_runs: report.total_runs,
    eligible_runs: report.eligible_runs,
    insufficient_runs: report.insufficient_runs,
    added_at: cleanString(addedAt, "added_at"),
  });
}

export function evidenceSynthesisProjection(synthesis) {
  const projected = clone(synthesis);
  delete projected.synthesis_digest;
  return deepFreeze(projected);
}

export function createEvidenceSynthesis(input) {
  if (!input || typeof input !== "object") throw new TypeError("evidence synthesis input required");
  const synthesis = {
    synthesis_id: HNK_EVIDENCE_SYNTHESIS_ID,
    synthesis_version: HNK_EVIDENCE_SYNTHESIS_VERSION,
    authority: "HNK_AUTHORED_EVIDENCE_SYNTHESIS",
    synthesis_key: cleanString(input.synthesis_key, "synthesis_key"),
    title: cleanString(input.title, "title"),
    created_at: cleanString(input.created_at, "created_at"),
    registries: [
      registryEntry(
        input.seed_registry,
        input.seed_source_id,
        input.seed_added_at,
      ),
    ],
    synthesis_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    automatic_truth_inference: false,
    inferential_statistics_performed: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_EVIDENCE_SYNTHESIS_BOUNDARY,
  };
  synthesis.synthesis_digest = synthesisDigest(synthesis);
  const validation = validateEvidenceSynthesis(synthesis);
  if (!validation.ok) throw new Error(`invalid evidence synthesis: ${validation.issues.join("; ")}`);
  return deepFreeze(synthesis);
}

export function addSynthesisRegistry(synthesis, input) {
  const validation = validateEvidenceSynthesis(synthesis);
  if (!validation.ok) throw new Error(`cannot extend invalid evidence synthesis: ${validation.issues.join("; ")}`);
  if (!input || typeof input !== "object") throw new TypeError("synthesis registry input required");

  const entry = registryEntry(input.registry, input.source_id, input.added_at);

  if (synthesis.registries.some((item) => item.source_id === entry.source_id)) {
    throw new Error(`duplicate source_id ${entry.source_id}`);
  }
  if (synthesis.registries.some((item) => item.registry_digest === entry.registry_digest)) {
    throw new Error(`replication registry ${entry.registry_digest} already included`);
  }
  if (synthesis.registries.some((item) => item.replication_key === entry.replication_key)) {
    throw new Error(
      `replication_key ${entry.replication_key} already included; one synthesis cannot count multiple snapshots of the same registry as independent sources`,
    );
  }

  const next = clone(synthesis);
  next.registries.push(clone(entry));
  next.synthesis_digest = synthesisDigest(next);
  const nextValidation = validateEvidenceSynthesis(next);
  if (!nextValidation.ok) throw new Error(`registry produced invalid evidence synthesis: ${nextValidation.issues.join("; ")}`);
  return deepFreeze(next);
}

function validateRegistryEntry(entry, issues, seen) {
  if (!entry || typeof entry !== "object") {
    issues.push("registry entry must be an object");
    return;
  }
  for (const field of [
    "source_id",
    "replication_key",
    "title",
    "question",
    "metric_id",
    "metric_label",
    "metric_type",
    "replication_status",
    "added_at",
  ]) {
    if (!nonEmpty(entry[field])) issues.push(`registry entry ${field} required`);
  }
  for (const field of ["registry_digest", "metric_signature_digest"]) {
    if (!HEX_64.test(entry[field] ?? "")) issues.push(`${entry.source_id}: ${field} must be SHA-256 hex`);
  }
  if (!["INSUFFICIENT", "SINGLE_RUN", "REPLICATED", "MIXED"].includes(entry.replication_status)) {
    issues.push(`${entry.source_id}: invalid replication_status ${entry.replication_status}`);
  }
  if (
    entry.repeated_direction !== null &&
    !["HIGHER", "LOWER", "EQUAL"].includes(entry.repeated_direction)
  ) {
    issues.push(`${entry.source_id}: invalid repeated_direction ${entry.repeated_direction}`);
  }
  if (!Number.isInteger(entry.total_runs) || entry.total_runs < 1) {
    issues.push(`${entry.source_id}: total_runs must be integer >= 1`);
  }
  if (!Number.isInteger(entry.eligible_runs) || entry.eligible_runs < 0) {
    issues.push(`${entry.source_id}: eligible_runs must be integer >= 0`);
  }
  if (!Number.isInteger(entry.insufficient_runs) || entry.insufficient_runs < 0) {
    issues.push(`${entry.source_id}: insufficient_runs must be integer >= 0`);
  }
  if (entry.eligible_runs + entry.insufficient_runs !== entry.total_runs) {
    issues.push(`${entry.source_id}: eligible + insufficient must equal total_runs`);
  }

  if (entry.replication_status === "INSUFFICIENT") {
    if (entry.eligible_runs !== 0) issues.push(`${entry.source_id}: INSUFFICIENT must have zero eligible runs`);
    if (entry.repeated_direction !== null) issues.push(`${entry.source_id}: INSUFFICIENT must not have repeated_direction`);
  }
  if (entry.replication_status === "SINGLE_RUN") {
    if (entry.eligible_runs !== 1) issues.push(`${entry.source_id}: SINGLE_RUN must have exactly one eligible run`);
    if (entry.repeated_direction === null) issues.push(`${entry.source_id}: SINGLE_RUN must expose its descriptive direction`);
  }
  if (entry.replication_status === "REPLICATED") {
    if (entry.eligible_runs < 2) issues.push(`${entry.source_id}: REPLICATED requires at least two eligible runs`);
    if (entry.repeated_direction === null) issues.push(`${entry.source_id}: REPLICATED requires repeated_direction`);
  }
  if (entry.replication_status === "MIXED" && entry.repeated_direction !== null) {
    issues.push(`${entry.source_id}: MIXED must not expose repeated_direction`);
  }

  for (const [key, value] of [
    ["source_id", entry.source_id],
    ["replication_key", entry.replication_key],
    ["registry_digest", entry.registry_digest],
  ]) {
    if (seen[key].has(value)) issues.push(`duplicate ${key} ${value}`);
    seen[key].add(value);
  }
}

export function validateEvidenceSynthesis(synthesis) {
  const issues = [];
  if (!synthesis || typeof synthesis !== "object") {
    return deepFreeze({ ok: false, issues: ["synthesis must be an object"] });
  }
  if (synthesis.synthesis_id !== HNK_EVIDENCE_SYNTHESIS_ID) {
    issues.push(`unexpected synthesis_id ${synthesis.synthesis_id}`);
  }
  if (synthesis.synthesis_version !== HNK_EVIDENCE_SYNTHESIS_VERSION) {
    issues.push(`unexpected synthesis_version ${synthesis.synthesis_version}`);
  }
  if (synthesis.authority !== "HNK_AUTHORED_EVIDENCE_SYNTHESIS") {
    issues.push(`unexpected authority ${synthesis.authority}`);
  }
  for (const field of ["synthesis_key", "title", "created_at"]) {
    if (!nonEmpty(synthesis[field])) issues.push(`${field} required`);
  }
  if (synthesis.persistence !== "USER_CONTROLLED_FILE_ONLY") {
    issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  }
  if (synthesis.server_persistence !== false) issues.push("server_persistence must remain false");
  if (synthesis.browser_persistence !== false) issues.push("browser_persistence must remain false");
  if (synthesis.automatic_truth_inference !== false) issues.push("automatic_truth_inference must remain false");
  if (synthesis.inferential_statistics_performed !== false) issues.push("inferential_statistics_performed must remain false");
  if (synthesis.causal_claim_permitted !== false) issues.push("causal_claim_permitted must remain false");
  if (synthesis.metaphysical_proof_permitted !== false) issues.push("metaphysical_proof_permitted must remain false");
  if (synthesis.claim_boundary !== HNK_EVIDENCE_SYNTHESIS_BOUNDARY) {
    issues.push(`unexpected claim_boundary ${synthesis.claim_boundary}`);
  }

  if (!Array.isArray(synthesis.registries) || synthesis.registries.length === 0) {
    issues.push("at least one replication registry required");
  } else {
    const seen = {
      source_id: new Set(),
      replication_key: new Set(),
      registry_digest: new Set(),
    };
    for (const entry of synthesis.registries) validateRegistryEntry(entry, issues, seen);
  }

  if (!HEX_64.test(synthesis.synthesis_digest ?? "")) {
    issues.push("synthesis_digest must be SHA-256 hex");
  } else if (synthesisDigest(synthesis) !== synthesis.synthesis_digest) {
    issues.push("synthesis_digest mismatch");
  }

  return deepFreeze({ ok: issues.length === 0, issues });
}

function groupStatus(entries) {
  const replicated = entries.filter((entry) => entry.replication_status === "REPLICATED");
  const mixed = entries.filter((entry) => entry.replication_status === "MIXED");
  const directions = [...new Set(replicated.map((entry) => entry.repeated_direction).filter(Boolean))];

  if (mixed.length > 0) {
    return { status: "MIXED", convergent_direction: null };
  }
  if (replicated.length >= 2 && directions.length === 1) {
    return { status: "CONVERGENT", convergent_direction: directions[0] };
  }
  if (replicated.length >= 2 && directions.length > 1) {
    return { status: "DIVERGENT", convergent_direction: null };
  }
  if (replicated.length === 1) {
    return { status: "SINGLE_REGISTRY_SIGNAL", convergent_direction: replicated[0].repeated_direction };
  }
  return { status: "INSUFFICIENT", convergent_direction: null };
}

export function evidenceSynthesisReport(synthesis) {
  const validation = validateEvidenceSynthesis(synthesis);
  if (!validation.ok) throw new Error(`cannot report invalid evidence synthesis: ${validation.issues.join("; ")}`);

  const bySignature = new Map();
  for (const entry of synthesis.registries) {
    const current = bySignature.get(entry.metric_signature_digest) ?? [];
    current.push(entry);
    bySignature.set(entry.metric_signature_digest, current);
  }

  const groups = [...bySignature.entries()]
    .map(([signatureDigest, entries]) => {
      const { status, convergent_direction } = groupStatus(entries);
      const first = entries[0];
      const replicatedDirectionCounts = {
        HIGHER: entries.filter(
          (entry) => entry.replication_status === "REPLICATED" && entry.repeated_direction === "HIGHER",
        ).length,
        LOWER: entries.filter(
          (entry) => entry.replication_status === "REPLICATED" && entry.repeated_direction === "LOWER",
        ).length,
        EQUAL: entries.filter(
          (entry) => entry.replication_status === "REPLICATED" && entry.repeated_direction === "EQUAL",
        ).length,
      };

      return {
        metric_signature_digest: signatureDigest,
        metric_id: first.metric_id,
        metric_label: first.metric_label,
        metric_type: first.metric_type,
        unit: first.unit,
        registries: entries.length,
        replicated_registries: entries.filter((entry) => entry.replication_status === "REPLICATED").length,
        mixed_registries: entries.filter((entry) => entry.replication_status === "MIXED").length,
        single_run_registries: entries.filter((entry) => entry.replication_status === "SINGLE_RUN").length,
        insufficient_registries: entries.filter((entry) => entry.replication_status === "INSUFFICIENT").length,
        replicated_direction_counts: replicatedDirectionCounts,
        status,
        convergent_direction,
        questions: entries.map((entry) => ({
          replication_key: entry.replication_key,
          question: entry.question,
          replication_status: entry.replication_status,
          repeated_direction: entry.repeated_direction,
        })),
      };
    })
    .sort((a, b) => a.metric_id.localeCompare(b.metric_id) || a.metric_signature_digest.localeCompare(b.metric_signature_digest));

  const groupStatusCounts = Object.fromEntries(
    HNK_SYNTHESIS_GROUP_STATUSES.map((status) => [
      status,
      groups.filter((group) => group.status === status).length,
    ]),
  );

  return deepFreeze({
    synthesis_key: synthesis.synthesis_key,
    total_registries: synthesis.registries.length,
    metric_groups: groups.length,
    groups,
    group_status_counts: groupStatusCounts,
    truth_assessed: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    inferential_statistics_performed: false,
    claim_boundary: synthesis.claim_boundary,
  });
}

export function serializeEvidenceSynthesis(synthesis) {
  const validation = validateEvidenceSynthesis(synthesis);
  if (!validation.ok) throw new Error(`cannot serialize invalid evidence synthesis: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(synthesis, null, 2)}\n`;
}

export function parseEvidenceSynthesis(text) {
  if (!nonEmpty(text)) throw new TypeError("evidence synthesis JSON text required");
  let synthesis;
  try {
    synthesis = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid evidence synthesis JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }
  const validation = validateEvidenceSynthesis(synthesis);
  if (!validation.ok) throw new Error(`invalid evidence synthesis: ${validation.issues.join("; ")}`);
  return deepFreeze(synthesis);
}

export function evidenceSynthesisSummary() {
  return deepFreeze({
    synthesis_id: HNK_EVIDENCE_SYNTHESIS_ID,
    version: HNK_EVIDENCE_SYNTHESIS_VERSION,
    group_statuses: [...HNK_SYNTHESIS_GROUP_STATUSES],
    grouping_key: "EXACT_METRIC_SIGNATURE_DIGEST",
    heterogeneous_metric_signatures_allowed: true,
    duplicate_replication_keys_allowed: false,
    mixed_and_insufficient_preserved: true,
    convergence_rule: "AT_LEAST_TWO_REPLICATED_REGISTRIES_WITH_ONE_SHARED_DIRECTION_AND_NO_MIXED_REGISTRY",
    divergence_rule: "AT_LEAST_TWO_REPLICATED_REGISTRIES_WITH_MORE_THAN_ONE_DIRECTION_AND_NO_MIXED_REGISTRY",
    automatic_truth_inference: false,
    inferential_statistics_performed: false,
    server_persistence: false,
    browser_persistence: false,
    causal_claim_permitted: false,
    metaphysical_proof_permitted: false,
    claim_boundary: HNK_EVIDENCE_SYNTHESIS_BOUNDARY,
  });
}
