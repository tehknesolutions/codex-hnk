import type { HnkExperimentAttestation } from "@hnk/experiment-attestation";
import type { HnkExperimentProtocol } from "@hnk/experiment-protocol";
import type { HnkMeasurementContract } from "@hnk/measurement-contract";

export declare const HNK_EVIDENCE_LEDGER_ID: "HNK_EVIDENCE_LEDGER_V1";
export declare const HNK_EVIDENCE_LEDGER_VERSION: "1.0.0";
export declare const HNK_EVIDENCE_LEDGER_BOUNDARY: "EVIDENCE_LEDGER_TRACKS_COVERAGE_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF";
export declare const HNK_EVIDENCE_KINDS: readonly ["PREREGISTRATION", "SESSION_ARTIFACT", "MEASUREMENT_RECORD", "FINAL_REPORT"];
export declare const HNK_EVIDENCE_CLAIM_SCOPES: readonly ["DESCRIPTIVE", "PROCESS_INTEGRITY", "EXPLORATORY_INTERPRETATION"];
export declare const HNK_EVIDENCE_REQUIREMENT_KINDS: readonly ["ATTESTATION_INTEGRITY", "SESSION_ROLE_COUNT", "METRIC_ROLE_RECORDS", "METRIC_ANY_RECORDS", "REPORT_PRESENT"];
export declare const HNK_EVIDENCE_COVERAGE_STATUSES: readonly ["COMPLETE_FOR_DECLARED_REQUIREMENTS", "PARTIAL", "INSUFFICIENT"];

export type HnkEvidenceKind = (typeof HNK_EVIDENCE_KINDS)[number];
export type HnkEvidenceClaimScope = (typeof HNK_EVIDENCE_CLAIM_SCOPES)[number];
export type HnkEvidenceRequirementKind = (typeof HNK_EVIDENCE_REQUIREMENT_KINDS)[number];
export type HnkEvidenceCoverageStatus = (typeof HNK_EVIDENCE_COVERAGE_STATUSES)[number];

export interface HnkEvidenceEntry {
  evidence_id: string;
  kind: HnkEvidenceKind;
  digest: string;
  assignment_id: string | null;
  role: "CONTROL" | "EXPERIMENT" | null;
  session_id: string | null;
  metric_id: string | null;
  measurement_id: string | null;
  evidence_source: string | null;
  timepoint: string | null;
  measured_at: string | null;
  metadata: Readonly<Record<string, unknown>>;
}

export interface HnkEvidenceRequirement {
  requirement_id: string;
  kind: HnkEvidenceRequirementKind;
  role?: "CONTROL" | "EXPERIMENT" | null;
  metric_id?: string | null;
  min_count?: number | null;
}

export interface HnkEvidenceClaim {
  claim_id: string;
  statement: string;
  scope: HnkEvidenceClaimScope;
  created_at: string;
  requirements: HnkEvidenceRequirement[];
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
}

export interface HnkEvidenceLedger {
  ledger_id: typeof HNK_EVIDENCE_LEDGER_ID;
  ledger_version: typeof HNK_EVIDENCE_LEDGER_VERSION;
  authority: "HNK_AUTHORED_EVIDENCE_LEDGER";
  experiment_id: string;
  created_at: string;
  bindings: {
    experiment_protocol_version: string;
    preregistration_digest: string;
    protocol_snapshot_digest: string;
    attestation_chain_head: string;
    measurement_plan_digest: string;
    measurement_contract_digest: string;
  };
  attestation_integrity_verified: true;
  evidence_entries: HnkEvidenceEntry[];
  claims: HnkEvidenceClaim[];
  ledger_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  automatic_truth_inference: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
  claim_boundary: typeof HNK_EVIDENCE_LEDGER_BOUNDARY;
}

export interface EvidenceLedgerValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface EvidenceLedgerVerification extends EvidenceLedgerValidation {
  sources_match: boolean;
  attestation_matches: boolean;
  measurement_matches: boolean;
}

export interface EvidenceRequirementEvaluation {
  requirement_id: string;
  kind: HnkEvidenceRequirementKind;
  satisfied: boolean;
  observed_count: number | null;
  required_count: number | null;
  note: string;
}

export interface EvidenceClaimEvaluation {
  claim_id: string;
  statement: string;
  scope: HnkEvidenceClaimScope;
  coverage_status: HnkEvidenceCoverageStatus;
  satisfied_requirements: number;
  total_requirements: number;
  missing_requirements: string[];
  requirements: EvidenceRequirementEvaluation[];
  truth_assessed: false;
  causal_claim_permitted: false;
  metaphysical_proof_permitted: false;
}

export declare function evidenceLedgerProjection(ledger: HnkEvidenceLedger): Readonly<Record<string, unknown>>;
export declare function createEvidenceLedger(protocol: HnkExperimentProtocol, attestation: HnkExperimentAttestation, measurement: HnkMeasurementContract, input?: { created_at?: string }): HnkEvidenceLedger;
export declare function validateEvidenceLedger(ledger: unknown): EvidenceLedgerValidation;
export declare function verifyEvidenceLedger(ledger: HnkEvidenceLedger, protocol: HnkExperimentProtocol, attestation: HnkExperimentAttestation, measurement: HnkMeasurementContract): EvidenceLedgerVerification;
export declare function addEvidenceClaim(ledger: HnkEvidenceLedger, input: { claim_id: string; statement: string; scope: HnkEvidenceClaimScope; created_at: string; requirements: HnkEvidenceRequirement[] }): HnkEvidenceLedger;
export declare function evaluateEvidenceClaim(ledger: HnkEvidenceLedger, claimOrId: HnkEvidenceClaim | string): EvidenceClaimEvaluation;
export declare function evidenceLedgerIndex(ledger: HnkEvidenceLedger): Readonly<Record<string, unknown>>;
export declare function serializeEvidenceLedger(ledger: HnkEvidenceLedger): string;
export declare function parseEvidenceLedger(text: string): HnkEvidenceLedger;
export declare function evidenceLedgerSummary(): Readonly<Record<string, unknown>>;
