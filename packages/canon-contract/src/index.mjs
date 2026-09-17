// @ts-nocheck
import canonManifest from "../../../canon/core/research-001-symbolic-architecture-v1.json" with { type: "json" };
import humanGateRegistry from "../../../canon/governance/human-gates/research-001.json" with { type: "json" };
import batchApproval from "../../../canon/governance/human-gates/research-001-batch-001-approval.json" with { type: "json" };

export const HNK_CANON_CONTRACT_ID = "HNK_CANON_CONTRACT_V1";

export const HNK_CANON_KINDS = Object.freeze([
  "STRUCTURAL_PRINCIPLE",
  "RUNTIME_PRIMITIVE",
  "SEMANTIC_PRINCIPLE",
  "RUNTIME_OPERATOR",
  "EVIDENCE_PRIMITIVE",
  "SYMBOLIC_PRIMITIVE",
  "GLYPH_ARCHITECTURE",
  "OPERATIONAL_LOOP",
  "GLYPH_GRAMMAR",
  "INFRASTRUCTURE",
  "RUNTIME_ARCHITECTURE",
  "GOVERNANCE_INFRASTRUCTURE",
  "AUTHORING_PRINCIPLE",
]);

const decisionsBySource = new Map(
  humanGateRegistry.decisions.map((decision) => [decision.source_item_id, Object.freeze({ ...decision })]),
);

export const HNK_CANON_RECORDS = Object.freeze(
  canonManifest.records.map((record) => Object.freeze({
    ...record,
    constraints: Object.freeze([...record.constraints]),
  })),
);

export function getHnkCanonRecord(canonItemId) {
  return HNK_CANON_RECORDS.find((record) => record.canon_item_id === canonItemId);
}

export function getHnkCanonRecordBySource(sourceItemId) {
  return HNK_CANON_RECORDS.find((record) => record.source_item_id === sourceItemId);
}

export function queryHnkCanon(query = {}) {
  const needle = query.q?.trim().toLocaleLowerCase("pt-BR");

  return HNK_CANON_RECORDS.flatMap((record) => {
    if (query.kind && record.kind !== query.kind) return [];
    if (query.source_item_id && record.source_item_id !== query.source_item_id) return [];

    if (needle) {
      const haystack = [
        record.canon_item_id,
        record.source_item_id,
        record.name,
        record.kind,
        record.definition,
        ...record.constraints,
      ].join(" ").toLocaleLowerCase("pt-BR");
      if (!haystack.includes(needle)) return [];
    }

    const decision = decisionsBySource.get(record.source_item_id);
    if (!decision) return [];
    return [{ canon: record, human_gate: decision }];
  });
}

export function hnkCanonSummary() {
  const by_kind = Object.fromEntries(
    HNK_CANON_KINDS.map((kind) => [
      kind,
      HNK_CANON_RECORDS.filter((record) => record.kind === kind).length,
    ]),
  );

  return Object.freeze({
    contract_id: HNK_CANON_CONTRACT_ID,
    canon_id: canonManifest.canon_id,
    status: canonManifest.status,
    authority: canonManifest.authority,
    version: canonManifest.version,
    approved_by: canonManifest.approved_by,
    approved_at: canonManifest.approved_at,
    source_records_preserved: canonManifest.source_records_preserved,
    historical_authority_inherited: canonManifest.historical_authority_inherited,
    records: HNK_CANON_RECORDS.length,
    by_kind: Object.freeze(by_kind),
    human_gate: Object.freeze({
      registry_id: humanGateRegistry.registry_id,
      status: humanGateRegistry.status,
      machine_autopromotion: humanGateRegistry.machine_autopromotion,
      approval_id: batchApproval.approval_id,
      approval_status: batchApproval.status,
      approval_signal: batchApproval.approval_signal,
      human_decision: batchApproval.human_decision,
      machine_can_decide: batchApproval.machine_can_decide,
    }),
  });
}

export function validateHnkCanonContract() {
  const issues = [];
  const canonIds = new Set();
  const sourceIds = new Set();
  const promoted = humanGateRegistry.decisions.filter(
    (decision) => decision.outcome === "PROMOTE_TO_HNK_CANON",
  );
  const promotedIds = new Set(promoted.map((decision) => decision.source_item_id));

  if (canonManifest.status !== "HNK_CANON") issues.push(`unexpected canon status ${canonManifest.status}`);
  if (canonManifest.authority !== "HNK_AUTHORED") issues.push(`unexpected canon authority ${canonManifest.authority}`);
  if (canonManifest.source_records_preserved !== true) issues.push("source_records_preserved must remain true");
  if (canonManifest.historical_authority_inherited !== false) issues.push("historical_authority_inherited must remain false");
  if (humanGateRegistry.machine_autopromotion !== false) issues.push("machine_autopromotion must remain false");
  if (batchApproval.status !== "APPROVED_BY_HUMAN") issues.push(`unexpected approval status ${batchApproval.status}`);
  if (batchApproval.human_decision !== true) issues.push("Human Gate approval must remain human_decision=true");
  if (batchApproval.machine_can_decide !== false) issues.push("machine_can_decide must remain false");
  if (canonManifest.approved_by !== batchApproval.approved_by) issues.push("canon approver does not match Human Gate approval");
  if (canonManifest.approved_at !== batchApproval.approved_at) issues.push("canon approval timestamp does not match Human Gate approval");
  if (HNK_CANON_RECORDS.length !== 22) issues.push(`expected 22 canon records, found ${HNK_CANON_RECORDS.length}`);
  if (promoted.length !== 22) issues.push(`expected 22 Human Gate promotions, found ${promoted.length}`);

  for (const record of HNK_CANON_RECORDS) {
    if (canonIds.has(record.canon_item_id)) issues.push(`duplicate canon_item_id ${record.canon_item_id}`);
    canonIds.add(record.canon_item_id);
    if (sourceIds.has(record.source_item_id)) issues.push(`duplicate source_item_id ${record.source_item_id}`);
    sourceIds.add(record.source_item_id);

    if (!HNK_CANON_KINDS.includes(record.kind)) issues.push(`${record.canon_item_id}: unsupported kind ${record.kind}`);
    if (!record.definition?.trim()) issues.push(`${record.canon_item_id}: definition required`);
    if (!record.constraints?.length) issues.push(`${record.canon_item_id}: at least one constraint required`);
    if (!promotedIds.has(record.source_item_id)) issues.push(`${record.canon_item_id}: missing Human Gate promotion`);

    const decision = decisionsBySource.get(record.source_item_id);
    if (!decision) issues.push(`${record.canon_item_id}: Human Gate decision missing`);
    else {
      if (decision.outcome !== "PROMOTE_TO_HNK_CANON") issues.push(`${record.canon_item_id}: source decision is ${decision.outcome}`);
      if (decision.resulting_status !== "HNK_CANON") issues.push(`${record.canon_item_id}: resulting_status is ${decision.resulting_status}`);
    }
  }

  for (const sourceId of promotedIds) {
    if (!sourceIds.has(sourceId)) issues.push(`Human Gate promotion missing from canon contract: ${sourceId}`);
  }

  return Object.freeze({
    ok: issues.length === 0,
    issues: Object.freeze(issues),
    contract_id: HNK_CANON_CONTRACT_ID,
    records: HNK_CANON_RECORDS.length,
  });
}

export function createHnkCanonConsumerSnapshot(consumerId) {
  if (!consumerId || typeof consumerId !== "string") {
    throw new TypeError("consumerId must be a non-empty string");
  }

  const validation = validateHnkCanonContract();
  if (!validation.ok) {
    throw new Error(`HNK canon contract invalid for ${consumerId}: ${validation.issues.join("; ")}`);
  }

  return Object.freeze({
    consumer_id: consumerId,
    contract_id: HNK_CANON_CONTRACT_ID,
    canon_id: canonManifest.canon_id,
    canon_version: canonManifest.version,
    authority: canonManifest.authority,
    access: "READ_ONLY",
    source_records_preserved: true,
    historical_authority_inherited: false,
    records: HNK_CANON_RECORDS,
  });
}
