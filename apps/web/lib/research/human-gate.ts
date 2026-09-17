import gateRegistry from "../../../../canon/governance/human-gates/research-001.json";
import recommendationBatch from "../../../../canon/governance/human-gates/research-001-batch-001.json";
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

export interface HumanGateRecommendation {
  source_item_id: string;
  recommendation: HumanGateOutcome;
  rationale: string;
  constraints: string[];
  authority: "NON_BINDING_MACHINE_RECOMMENDATION";
  human_gate_status: "AWAITING_EXPLICIT_HUMAN_APPROVAL";
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

interface HumanGateRecommendationBatch {
  batch_id: string;
  protocol: string;
  status: string;
  source_registry: string;
  recommendation_authority: "NON_BINDING_MACHINE_RECOMMENDATION";
  canon_import: "NONE";
  machine_can_decide: false;
  explicit_human_approval_required: true;
  scope: string;
  summary: Partial<Record<HumanGateOutcome, number>>;
  items: HumanGateRecommendation[];
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
    recommendation?: HumanGateRecommendation;
    decision?: HumanGateDecisionRecord;
  };
}

const registry = gateRegistry as HumanGateRegistry;
const batch = recommendationBatch as HumanGateRecommendationBatch;
const candidates = queryAdmissionItems({ decision: "CANDIDATE" });
const decisionsByItem = new Map(registry.decisions.map((decision) => [decision.source_item_id, decision]));
const recommendationsByItem = new Map(batch.items.map((recommendation) => [recommendation.source_item_id, recommendation]));

export function queryHumanGateQueue(query: HumanGateQuery = {}): HumanGateReviewItem[] {
  const needle = query.q?.trim().toLocaleLowerCase("pt-BR");

  return candidates.flatMap((item) => {
    if (query.item_id && item.id !== query.item_id) return [];
    if (query.hnk_value && item.hnk_value !== query.hnk_value) return [];

    const recommendation = recommendationsByItem.get(item.id);

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
        recommendation?.recommendation ?? "",
        recommendation?.rationale ?? "",
        ...(recommendation?.constraints ?? []),
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
        ...(recommendation ? { recommendation } : {}),
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
  const by_recommendation = Object.fromEntries(
    HUMAN_GATE_OUTCOMES.map((outcome) => [
      outcome,
      batch.items.filter((item) => item.recommendation === outcome).length,
    ]),
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
    recommendation_batch: {
      batch_id: batch.batch_id,
      status: batch.status,
      authority: batch.recommendation_authority,
      canon_import: batch.canon_import,
      machine_can_decide: batch.machine_can_decide,
      explicit_human_approval_required: batch.explicit_human_approval_required,
      by_recommendation,
    },
  };
}

export function validateHumanGateRuntime() {
  const issues: string[] = [];
  const sourceIds = new Set<string>();
  const candidateIds = new Set(candidates.map((candidate) => candidate.id));
  const recommendationIds = new Set(batch.items.map((recommendation) => recommendation.source_item_id));

  if (registry.protocol !== "HNK_HUMAN_GATE_PROTOCOL_V1") issues.push(`unexpected protocol ${registry.protocol}`);
  if (registry.canon_import !== "EXPLICIT_HUMAN_APPROVAL_ONLY") issues.push("canon_import must be EXPLICIT_HUMAN_APPROVAL_ONLY");
  if (registry.machine_autopromotion !== false) issues.push("machine_autopromotion must remain false");
  if (registry.non_destructive_history !== true) issues.push("non_destructive_history must remain true");

  if (batch.protocol !== registry.protocol) issues.push(`recommendation batch protocol mismatch: ${batch.protocol}`);
  if (batch.status !== "PROPOSED_AWAITING_HUMAN_APPROVAL") issues.push(`unexpected recommendation batch status ${batch.status}`);
  if (batch.recommendation_authority !== "NON_BINDING_MACHINE_RECOMMENDATION") issues.push("recommendation authority must remain non-binding");
  if (batch.canon_import !== "NONE") issues.push("recommendation batch cannot import canon");
  if (batch.machine_can_decide !== false) issues.push("recommendation batch machine_can_decide must remain false");
  if (batch.explicit_human_approval_required !== true) issues.push("recommendation batch must require explicit human approval");
  if (batch.items.length !== candidates.length) issues.push(`recommendation batch must cover all candidates: ${batch.items.length}/${candidates.length}`);

  for (const candidateId of candidateIds) {
    if (!recommendationIds.has(candidateId)) issues.push(`recommendation missing for ${candidateId}`);
  }
  for (const recommendation of batch.items) {
    if (!candidateIds.has(recommendation.source_item_id)) issues.push(`recommendation source is not a candidate: ${recommendation.source_item_id}`);
    if (!HUMAN_GATE_OUTCOMES.includes(recommendation.recommendation)) issues.push(`${recommendation.source_item_id}: invalid recommendation`);
    if (recommendation.authority !== "NON_BINDING_MACHINE_RECOMMENDATION") issues.push(`${recommendation.source_item_id}: recommendation authority drift`);
    if (recommendation.human_gate_status !== "AWAITING_EXPLICIT_HUMAN_APPROVAL") issues.push(`${recommendation.source_item_id}: recommendation Human Gate status drift`);
    if (!recommendation.rationale.trim()) issues.push(`${recommendation.source_item_id}: recommendation rationale required`);
    if (!recommendation.constraints.length) issues.push(`${recommendation.source_item_id}: recommendation constraint required`);
  }

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
