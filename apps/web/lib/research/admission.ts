import research001Catalog from "../../../../canon/references/research-001-kabbalah-hermetica/catalog.json";
import comparative004Catalog from "../../../../canon/references/research-001-kabbalah-hermetica/comparative-pass-004/catalog.json";

export const ADMISSION_DECISIONS = [
  "CORE",
  "REFERENCE",
  "CANDIDATE",
  "RESEARCH_ONLY",
  "EXCLUDE_OPERATIONALLY",
] as const;

export const HNK_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;

export type AdmissionDecision = (typeof ADMISSION_DECISIONS)[number];
export type HnkValue = (typeof HNK_VALUES)[number];

export interface AdmissionSource {
  title: string;
  author?: string;
  type?: string;
  url?: string;
}

export interface AdmissionItem {
  id: string;
  name: string;
  description: string;
  source_basis: string;
  historical_layer: string;
  classification: string;
  primary_decision: AdmissionDecision;
  hnk_value: HnkValue;
  admission_reason: string;
  risk_or_limit: string;
  provenance_status: string;
  version: string;
  tags?: string[];
  conflicts?: string[];
  dependencies?: string[];
  source_gap?: boolean;
  notes?: string;
  sources?: AdmissionSource[];
}

interface AdmissionCatalog {
  catalog_id: string;
  title: string;
  status: string;
  protocol: string;
  canon_import: string;
  items: AdmissionItem[];
}

export type OperationalPolicy =
  | "ADMITTED_GOVERNANCE"
  | "REFERENCE_ONLY"
  | "AWAITING_HUMAN_GATE"
  | "QUARANTINED_RESEARCH"
  | "BLOCKED_FROM_RUNTIME";

export interface DecisionLayerView {
  operational_policy: OperationalPolicy;
  human_gate_required: boolean;
  archive_policy: "PRESERVE_RESEARCH_RECORD";
  canon_import: "NONE_AUTOMATIC";
  hnk_proposal?: {
    origin: "HNK_CANDIDATE_FROM_RESEARCH";
    proposal: string;
    rationale: string;
    status: "AWAITING_HUMAN_GATE";
  };
}

export interface AdmissionQuery {
  q?: string;
  item_id?: string;
  decision?: AdmissionDecision;
  hnk_value?: HnkValue;
}

const catalogs = [research001Catalog, comparative004Catalog] as unknown as AdmissionCatalog[];
const items = catalogs.flatMap((catalog) => catalog.items);

function policyFor(decision: AdmissionDecision): OperationalPolicy {
  switch (decision) {
    case "CORE": return "ADMITTED_GOVERNANCE";
    case "REFERENCE": return "REFERENCE_ONLY";
    case "CANDIDATE": return "AWAITING_HUMAN_GATE";
    case "RESEARCH_ONLY": return "QUARANTINED_RESEARCH";
    case "EXCLUDE_OPERATIONALLY": return "BLOCKED_FROM_RUNTIME";
  }
}

export function decisionLayerFor(item: AdmissionItem): DecisionLayerView {
  const view: DecisionLayerView = {
    operational_policy: policyFor(item.primary_decision),
    human_gate_required: item.primary_decision === "CANDIDATE",
    archive_policy: "PRESERVE_RESEARCH_RECORD",
    canon_import: "NONE_AUTOMATIC",
  };

  if (item.primary_decision === "CANDIDATE") {
    view.hnk_proposal = {
      origin: "HNK_CANDIDATE_FROM_RESEARCH",
      proposal: item.description,
      rationale: item.admission_reason,
      status: "AWAITING_HUMAN_GATE",
    };
  }

  return view;
}

export function queryAdmissionItems(query: AdmissionQuery): AdmissionItem[] {
  const needle = query.q?.trim().toLocaleLowerCase("pt-BR");

  return items.filter((item) => {
    if (query.item_id && item.id !== query.item_id) return false;
    if (query.decision && item.primary_decision !== query.decision) return false;
    if (query.hnk_value && item.hnk_value !== query.hnk_value) return false;

    if (needle) {
      const haystack = [
        item.id,
        item.name,
        item.description,
        item.source_basis,
        item.historical_layer,
        item.classification,
        item.admission_reason,
        item.risk_or_limit,
        item.provenance_status,
        ...(item.tags ?? []),
      ].join(" ").toLocaleLowerCase("pt-BR");
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });
}

export function admissionSummary() {
  const by_decision = Object.fromEntries(
    ADMISSION_DECISIONS.map((decision) => [
      decision,
      items.filter((item) => item.primary_decision === decision).length,
    ]),
  );

  const by_value = Object.fromEntries(
    HNK_VALUES.map((value) => [
      value,
      items.filter((item) => item.hnk_value === value).length,
    ]),
  );

  return {
    catalogs: catalogs.length,
    items: items.length,
    by_decision,
    by_value,
    human_gate_pending: items.filter((item) => item.primary_decision === "CANDIDATE").length,
    operationally_blocked: items.filter((item) => item.primary_decision === "EXCLUDE_OPERATIONALLY").length,
  };
}

export function validateAdmissionDecisionLayer() {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const catalog of catalogs) {
    if (catalog.protocol !== "CODEX_ADMISSION_PROTOCOL_V1") {
      issues.push(`${catalog.catalog_id}: unexpected protocol ${catalog.protocol}`);
    }
    if (catalog.canon_import !== "NONE_AUTOMATIC") {
      issues.push(`${catalog.catalog_id}: canon_import must remain NONE_AUTOMATIC`);
    }
  }

  for (const item of items) {
    if (ids.has(item.id)) issues.push(`duplicate item id: ${item.id}`);
    ids.add(item.id);

    if (!ADMISSION_DECISIONS.includes(item.primary_decision)) {
      issues.push(`${item.id}: invalid decision ${item.primary_decision}`);
    }
    if (!HNK_VALUES.includes(item.hnk_value)) {
      issues.push(`${item.id}: invalid hnk_value ${item.hnk_value}`);
    }
    if (!item.admission_reason.trim()) issues.push(`${item.id}: admission_reason required`);
    if (!item.risk_or_limit.trim()) issues.push(`${item.id}: risk_or_limit required`);

    const layer = decisionLayerFor(item);
    if (item.primary_decision === "CANDIDATE" && !layer.human_gate_required) {
      issues.push(`${item.id}: candidate must require Human Gate`);
    }
    if (item.primary_decision === "EXCLUDE_OPERATIONALLY" && layer.operational_policy !== "BLOCKED_FROM_RUNTIME") {
      issues.push(`${item.id}: excluded item must be blocked from runtime`);
    }
    if (layer.archive_policy !== "PRESERVE_RESEARCH_RECORD") {
      issues.push(`${item.id}: research records must be preserved non-destructively`);
    }
  }

  if (items.length !== 84) issues.push(`Research 001 expected 84 catalog items, found ${items.length}`);

  return { ok: issues.length === 0, issues };
}

export function allAdmissionItems(): readonly AdmissionItem[] {
  return items;
}
