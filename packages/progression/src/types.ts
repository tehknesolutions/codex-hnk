export type AttributeCode = "HIP" | "VNT" | "PER" | "SIN" | "BIO" | "INT" | "DIS";

export interface AttributeProgressionRow {
  day: number;
  label: string;
  quest_id?: string;
  primary_attribute: AttributeCode;
  secondary_attribute: AttributeCode;
  attribute_gain: 0 | 1;
  source_basis: { type: string; note?: string };
  status: string;
}

export interface AttributeProgressionMatrix {
  id: "HNK-ATTRIBUTE-PROGRESSION-MATRIX-V1";
  version: "1.0.0";
  status: "FROZEN_V1";
  attribute_scale: { min: 1; max: 20; onboarding_base: 5; onboarding_extra_pool: 15 };
  rows: AttributeProgressionRow[];
}

export type AttributeState = Record<AttributeCode, number>;

export interface AttributeGainResult {
  attribute: AttributeCode;
  requestedGain: 0 | 1;
  appliedGain: 0 | 1;
  before: number;
  after: number;
  reason: "APPLIED" | "ZERO_GAIN" | "CAP_REACHED";
}
