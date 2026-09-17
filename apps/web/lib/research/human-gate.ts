import gateRegistry from "../../../../canon/governance/human-gates/research-001.json";
import {
  HNK_VALUES,
  decisionLayerFor,
  queryAdmissionItems,
  type AdmissionItem,
  type HnkValue,
} from "./admission";

export const HUMAN_GATE_OUTCOMES = [
  "PROMOTE_TO_HNK_CANON",
  "KEEP_AS_CANDIDATE",
  "RECLASSIFY_AS_REFERENCE",
  "MOVE_TO_RESEARCH_ONLY",
  "EXCLUDE_OPERATIONALLY",
] as const;

export type HumanGateOutcome = (typeof HUMAN_GATE_OUTCOMES)[number];

export interface HumanGateDecisionRecord {
  gate_id: string;
  source_item_id: string;
  outcome: HumanGateOutcome;
  approved_by: string;
  approved_at: string;
  rationale: string;
  source_item_version: string;
  resulting_status: string;
  constraints?: string[];
  conflicts_acknowledged?: string[];
  dependencies_acknowledged?: string[];
  notes?: string;
}

interface HumanGateRegistry {
  registry_id: string;
  protocol: string;
  source_research: string;
  source_catalogs: string[];
  status: string;
  canon_import: string;
  machine_autopromotion: boolean;
  non_destructive_history: boolean;
  decisions: HumanGateDecisionRecord[];
}

export interface HumanGateQuery {
  q?: string;
  item_id?: string;
  hnk_value?: HnkValue;
  state?: "PENDING" | "DECIDED" | "ALL";
}

export interface HumanGateReviewItem {
  item: AdmissionItem;
  decision_layer: ReturnType<typeof decisionLayerFor>;
  human_gate: {
    state: "PENDING" | "DECIDED";
    machine_can_decide: false;
    explicit_human_approval_required: true;
    allowed_outcomes: readonly HumanGateOutcome[];
    decision?: HumanGateDecisionRecord;
  };
}

const registry = gateRegistry as HumanGateRegistry;
const candidates = queryAdmissionItems({ decision: "CANDIDATE" });
const decisionsByItem = new Map(registry.decisions.map((decision) => [decision.source_item_id, decision]));

export function queryHumanGateQueue(query: HumanGateQuery = {}): HumanGateReviewItem[] {
  const needle = query.q?.trim().toLocaleLowerCase("pt-BR");

  return candidates.flatMap((item) => {
    if (query.item_id && item.id !== query.item_id) return [];
    if (query.hnk_value && item.hnk_value !== query.hnk_value) return [];

    if (needle) {
      const haystack = [
        item.id,
        item.name,
        item.description,
        item.admission_reason,
        item.risk_or_limit,
        item.source_basis,
        item.historical_layer,
        item.provenance_status,
        ...(item.tags ?? []),
      ].join(" ").toLocaleLowerCase("pt-BR");
      if (!haystack.includes(needle)) return [];
    }

    const decision = decisionsByItem.get(item.id);
    const state = decision ? "DECIDED" : "PENDING";
    if (query.state && query.state !== "ALL" && query.state !== state) return [];

    return [{
      item,
      decision_layer: decisionLayerFor(item),
      human_gate: {
        state,
        machine_can_decide: false,
        explicit_human_approval_required: true,
        allowed_outcomes: HUMAN_GATE_OUTCOMES,
        ...(decision ? { decision } : {}),
      },
    } satisfies HumanGateReviewItem];
  });
}

export function humanGateSummary() {
  const decided = candidates.filter((item) => decisionsByItem.has(item.id)).length;
  const pending = candidates.length - decided;
  const by_value = Object.fromEntries(
    HNK_VALUES.map((value) => [value, candidates.filter((item) => item.hnk_value === value).length]),
  );

  return {
    registry_id: registry.registry_id,
    protocol: registry.protocol,
    status: registry.status,
    canon_import: registry.canon_import,
    machine_autopromotion: registry.machine_autopromotion,
    non_destructive_history: registry.non_destructive_history,
    candidates: candidates.length,
    decided,
    pending,
    by_value,
  };
}

export function validateHumanGateRuntime() {
  const issues: string[] = [];
  const sourceIds = new Set<string>();

  if (registry.protocol !== "HNK_HUMAN_GATE_PROTOCOL_V1") issues.push(`unexpected protocol ${registry.protocol}`);
  if (registry.canon_import !== "EXPLICIT_HUMAN_APPROVAL_ONLY") issues.push("canon_import must be EXPLICIT_HUMAN_APPROVAL_ONLY");
  if (registry.machine_autopromotion !== false) issues.push("machine_autopromotion must remain false");
  if (registry.non_destructive_history !== true) issues.push("non_destructive_history must remain true");

  for (const decision of registry.decisions) {
    if (sourceIds.has(decision.source_item_id)) issues.push(`duplicate decision for ${decision.source_item_id}`);
    sourceIds.add(decision.source_item_id);

    const item = candidates.find((candidate) => candidate.id === decision.source_item_id);
    if (!item) issues.push(`${decision.gate_id}: source candidate not found`);
    if (!HUMAN_GATE_OUTCOMES.includes(decision.outcome)) issues.push(`${decision.gate_id}: invalid outcome`);
    if (!decision.approved_by.trim()) issues.push(`${decision.gate_id}: approved_by required`);
    if (!decision.rationale.trim()) issues.push(`${decision.gate_id}: rationale required`);
    if (item && decision.source_item_version !== item.version) issues.push(`${decision.gate_id}: source version mismatch`);
  }

  return { ok: issues.length === 0, issues };
}
