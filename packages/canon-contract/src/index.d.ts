export const HNK_CANON_CONTRACT_ID: "HNK_CANON_CONTRACT_V1";

export const HNK_CANON_KINDS: readonly [
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
  "AUTHORING_PRINCIPLE"
];

export type HnkCanonKind = (typeof HNK_CANON_KINDS)[number];

export interface HnkCanonRecord {
  readonly canon_item_id: string;
  readonly source_item_id: string;
  readonly name: string;
  readonly kind: HnkCanonKind;
  readonly definition: string;
  readonly constraints: readonly string[];
  readonly version: string;
}

export interface HnkCanonDecision {
  readonly gate_id: string;
  readonly source_item_id: string;
  readonly outcome: "PROMOTE_TO_HNK_CANON" | string;
  readonly approved_by: string;
  readonly approved_at: string;
  readonly rationale: string;
  readonly source_item_version: string;
  readonly resulting_status: "HNK_CANON" | string;
  readonly notes?: string;
}

export interface HnkCanonEntry {
  readonly canon: HnkCanonRecord;
  readonly human_gate: HnkCanonDecision;
}

export interface HnkCanonQuery {
  readonly q?: string;
  readonly kind?: HnkCanonKind;
  readonly source_item_id?: string;
}

export interface HnkCanonValidation {
  readonly ok: boolean;
  readonly issues: readonly string[];
  readonly contract_id: typeof HNK_CANON_CONTRACT_ID;
  readonly records: number;
}

export interface HnkCanonConsumerSnapshot {
  readonly consumer_id: string;
  readonly contract_id: typeof HNK_CANON_CONTRACT_ID;
  readonly canon_id: string;
  readonly canon_version: string;
  readonly authority: "HNK_AUTHORED";
  readonly access: "READ_ONLY";
  readonly source_records_preserved: true;
  readonly historical_authority_inherited: false;
  readonly records: readonly HnkCanonRecord[];
}

export const HNK_CANON_RECORDS: readonly HnkCanonRecord[];

export function getHnkCanonRecord(canonItemId: string): HnkCanonRecord | undefined;
export function getHnkCanonRecordBySource(sourceItemId: string): HnkCanonRecord | undefined;
export function queryHnkCanon(query?: HnkCanonQuery): HnkCanonEntry[];
export function hnkCanonSummary(): Readonly<{
  contract_id: typeof HNK_CANON_CONTRACT_ID;
  canon_id: string;
  status: "HNK_CANON";
  authority: "HNK_AUTHORED";
  version: string;
  approved_by: string;
  approved_at: string;
  source_records_preserved: true;
  historical_authority_inherited: false;
  records: number;
  by_kind: Readonly<Record<HnkCanonKind, number>>;
  human_gate: Readonly<{
    registry_id: string;
    status: string;
    machine_autopromotion: false;
    approval_id: string;
    approval_status: "APPROVED_BY_HUMAN";
    approval_signal: string;
    human_decision: true;
    machine_can_decide: false;
  }>;
}>;
export function validateHnkCanonContract(): HnkCanonValidation;
export function createHnkCanonConsumerSnapshot(consumerId: string): HnkCanonConsumerSnapshot;
