import type { HnkExperimentProtocol } from "@hnk/experiment-protocol";

export declare const HNK_MEASUREMENT_CONTRACT_ID: "HNK_MEASUREMENT_CONTRACT_V1";
export declare const HNK_MEASUREMENT_CONTRACT_VERSION: "1.0.0";
export declare const HNK_MEASUREMENT_CLAIM_BOUNDARY: "MEASUREMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF";
export declare const HNK_MEASUREMENT_TYPES: readonly ["NUMBER", "BOOLEAN", "CATEGORY", "TEXT", "COUNT", "SCALE"];
export declare const HNK_MEASUREMENT_EVIDENCE_SOURCES: readonly ["RUNTIME_DERIVED", "SELF_REPORT", "OBSERVER_RECORDED", "INSTRUMENT", "EXTERNAL_RECORD"];
export declare const HNK_MEASUREMENT_TIMEPOINTS: readonly ["PRE", "DURING", "POST", "FOLLOW_UP", "EVENT_BOUNDARY"];

export type HnkMeasurementType = (typeof HNK_MEASUREMENT_TYPES)[number];
export type HnkMeasurementEvidenceSource = (typeof HNK_MEASUREMENT_EVIDENCE_SOURCES)[number];
export type HnkMeasurementTimepoint = (typeof HNK_MEASUREMENT_TIMEPOINTS)[number];

export interface HnkNumericBounds {
  min: number | null;
  max: number | null;
}

export interface HnkScaleAnchor {
  value: number;
  label: string;
}

export interface HnkScaleDefinition {
  min: number;
  max: number;
  step: number;
  anchors: HnkScaleAnchor[];
}

export interface HnkMeasurementMetric {
  metric_id: string;
  source_variable: string;
  label: string;
  type: HnkMeasurementType;
  unit: string | null;
  collection_method: string;
  evidence_source: HnkMeasurementEvidenceSource;
  timepoint: HnkMeasurementTimepoint;
  timepoint_label: string | null;
  evaluation_criterion: string;
  numeric_bounds: HnkNumericBounds | null;
  category_options: string[];
  scale: HnkScaleDefinition | null;
}

export interface HnkMeasurementRecord {
  measurement_id: string;
  assignment_id: string;
  role: "CONTROL" | "EXPERIMENT";
  session_id: string;
  metric_id: string;
  measured_at: string;
  value: number | boolean | string;
  note: string | null;
}

export interface HnkMeasurementContract {
  contract_id: typeof HNK_MEASUREMENT_CONTRACT_ID;
  contract_version: typeof HNK_MEASUREMENT_CONTRACT_VERSION;
  authority: "HNK_AUTHORED_MEASUREMENT_CONTRACT";
  experiment_id: string;
  experiment_protocol_version: string;
  experiment_preregistration_digest: string;
  created_at: string;
  locked_at: string;
  plan_locked: true;
  observed_variables: string[];
  metrics: HnkMeasurementMetric[];
  measurement_plan_digest: string;
  records: HnkMeasurementRecord[];
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
  claim_boundary: typeof HNK_MEASUREMENT_CLAIM_BOUNDARY;
}

export interface CreateMeasurementContractInput {
  created_at: string;
  locked_at: string;
  metrics: Array<{
    metric_id: string;
    source_variable: string;
    label: string;
    type: HnkMeasurementType;
    unit?: string | null;
    collection_method: string;
    evidence_source: HnkMeasurementEvidenceSource;
    timepoint: HnkMeasurementTimepoint;
    timepoint_label?: string | null;
    evaluation_criterion: string;
    numeric_bounds?: HnkNumericBounds | null;
    category_options?: string[];
    scale?: HnkScaleDefinition | null;
  }>;
}

export interface AddMeasurementRecordInput {
  measurement_id: string;
  assignment_id: string;
  metric_id: string;
  measured_at: string;
  value: number | boolean | string;
  note?: string | null;
}

export interface HnkMeasurementValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export declare function measurementPlanProjection(contract: HnkMeasurementContract): Readonly<Record<string, unknown>>;
export declare function createMeasurementContract(protocol: HnkExperimentProtocol, input: CreateMeasurementContractInput): HnkMeasurementContract;
export declare function validateMeasurementContract(contract: unknown, protocol?: HnkExperimentProtocol | null): HnkMeasurementValidation;
export declare function addMeasurementRecord(contract: HnkMeasurementContract, protocol: HnkExperimentProtocol, input: AddMeasurementRecordInput): HnkMeasurementContract;
export declare function measurementMatrix(contract: HnkMeasurementContract, protocol: HnkExperimentProtocol): Readonly<Record<string, unknown>>;
export declare function measurementDescriptiveSummary(contract: HnkMeasurementContract, protocol: HnkExperimentProtocol): Readonly<Record<string, unknown>>;
export declare function serializeMeasurementContract(contract: HnkMeasurementContract): string;
export declare function parseMeasurementContract(text: string): HnkMeasurementContract;
export declare function measurementContractSummary(): Readonly<Record<string, unknown>>;
