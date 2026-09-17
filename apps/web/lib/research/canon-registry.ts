import canonManifest from "../../../../canon/core/research-001-symbolic-architecture-v1.json";
import humanGateRegistry from "../../../../canon/governance/human-gates/research-001.json";
import batchApproval from "../../../../canon/governance/human-gates/research-001-batch-001-approval.json";

export const CANON_REGISTRY_KINDS = [
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
] as const;

export type CanonRegistryKind = (typeof CANON_REGISTRY_KINDS)[number];

export interface CanonRegistryRecord {
  canon_item_id: string;
  source_item_id: string;
  name: string;
  kind: CanonRegistryKind;
  definition: string;
  constraints: string[];
  version: string;
}

interface CanonManifest {
  canon_id: string;
  status: "HNK_CANON";
  authority: "HNK_AUTHORED";
  source_human_gate: string;
  source_batch: string;
  approved_by: string;
  approved_at: string;
  version: string;
  source_records_preserved: true;
  historical_authority_inherited: false;
  records: CanonRegistryRecord[];
}

interface HumanGateDecision {
  gate_id: string;
  source_item_id: string;
  outcome: string;
  approved_by: string;
  approved_at: string;
  rationale: string;
  source_item_version: string;
  resulting_status: string;
  notes?: string;
}

interface HumanGateRegistry {
  registry_id: string;
  protocol: string;
  status: string;
  machine_autopromotion: false;
  decisions: HumanGateDecision[];
}

interface BatchApproval {
  approval_id: string;
  status: "APPROVED_BY_HUMAN";
  approved_by: string;
  approved_at: string;
  approval_signal: string;
  human_decision: true;
  machine_can_decide: false;
  decision_count: number;
}

export interface CanonRegistryQuery {
  q?: string;
  kind?: CanonRegistryKind;
  source_item_id?: string;
}

export interface CanonRegistryEntry {
  canon: CanonRegistryRecord;
  human_gate: HumanGateDecision;
}

const manifest = canonManifest as CanonManifest;
const gate = humanGateRegistry as HumanGateRegistry;
const approval = batchApproval as BatchApproval;
const decisionsBySource = new Map(gate.decisions.map((decision) => [decision.source_item_id, decision]));

export function queryCanonRegistry(query: CanonRegistryQuery = {}): CanonRegistryEntry[] {
  const needle = query.q?.trim().toLocaleLowerCase("pt-BR");

  return manifest.records.flatMap((record) => {
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
    return [{ canon: record, human_gate: decision } satisfies CanonRegistryEntry];
  });
}

export function canonRegistrySummary() {
  const by_kind = Object.fromEntries(
    CANON_REGISTRY_KINDS.map((kind) => [kind, manifest.records.filter((record) => record.kind === kind).length]),
  );

  return {
    canon_id: manifest.canon_id,
    status: manifest.status,
    authority: manifest.authority,
    version: manifest.version,
    approved_by: manifest.approved_by,
    approved_at: manifest.approved_at,
    source_records_preserved: manifest.source_records_preserved,
    historical_authority_inherited: manifest.historical_authority_inherited,
    records: manifest.records.length,
    by_kind,
    human_gate: {
      registry_id: gate.registry_id,
      status: gate.status,
      machine_autopromotion: gate.machine_autopromotion,
      approval_id: approval.approval_id,
      approval_status: approval.status,
      approval_signal: approval.approval_signal,
      human_decision: approval.human_decision,
      machine_can_decide: approval.machine_can_decide,
    },
  };
}

export function validateCanonRegistry() {
  const issues: string[] = [];
  const canonIds = new Set<string>();
  const sourceIds = new Set<string>();
  const promoted = gate.decisions.filter((decision) => decision.outcome === "PROMOTE_TO_HNK_CANON");
  const promotedIds = new Set(promoted.map((decision) => decision.source_item_id));

  if (manifest.status !== "HNK_CANON") issues.push(`unexpected canon status ${manifest.status}`);
  if (manifest.authority !== "HNK_AUTHORED") issues.push(`unexpected canon authority ${manifest.authority}`);
  if (manifest.source_records_preserved !== true) issues.push("source_records_preserved must remain true");
  if (manifest.historical_authority_inherited !== false) issues.push("historical_authority_inherited must remain false");
  if (approval.status !== "APPROVED_BY_HUMAN") issues.push(`unexpected Human Gate approval status ${approval.status}`);
  if (approval.human_decision !== true) issues.push("Human Gate approval must remain human_decision=true");
  if (approval.machine_can_decide !== false) issues.push("machine_can_decide must remain false");
  if (manifest.approved_by !== approval.approved_by) issues.push("canon approver does not match Human Gate approval");
  if (manifest.approved_at !== approval.approved_at) issues.push("canon approval timestamp does not match Human Gate approval");
  if (manifest.records.length !== 22) issues.push(`expected 22 canon records, found ${manifest.records.length}`);
  if (promoted.length !== 22) issues.push(`expected 22 Human Gate promotions, found ${promoted.length}`);

  for (const record of manifest.records) {
    if (canonIds.has(record.canon_item_id)) issues.push(`duplicate canon_item_id ${record.canon_item_id}`);
    canonIds.add(record.canon_item_id);
    if (sourceIds.has(record.source_item_id)) issues.push(`duplicate source_item_id ${record.source_item_id}`);
    sourceIds.add(record.source_item_id);

    if (!CANON_REGISTRY_KINDS.includes(record.kind)) issues.push(`${record.canon_item_id}: unsupported kind ${record.kind}`);
    if (!record.definition.trim()) issues.push(`${record.canon_item_id}: definition required`);
    if (!record.constraints.length) issues.push(`${record.canon_item_id}: at least one constraint required`);
    if (!promotedIds.has(record.source_item_id)) issues.push(`${record.canon_item_id}: missing Human Gate promotion`);

    const decision = decisionsBySource.get(record.source_item_id);
    if (!decision) issues.push(`${record.canon_item_id}: Human Gate decision missing`);
    else {
      if (decision.outcome !== "PROMOTE_TO_HNK_CANON") issues.push(`${record.canon_item_id}: source decision is ${decision.outcome}`);
      if (decision.resulting_status !== "HNK_CANON") issues.push(`${record.canon_item_id}: source decision resulting_status is ${decision.resulting_status}`);
    }
  }

  for (const sourceId of promotedIds) {
    if (!sourceIds.has(sourceId)) issues.push(`Human Gate promotion missing from Canon Registry: ${sourceId}`);
  }

  return { ok: issues.length === 0, issues };
}
