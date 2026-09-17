import type { HnkExperimentProtocol } from "@hnk/experiment-protocol";

export declare const HNK_EXPERIMENT_ATTESTATION_ID: "HNK_EXPERIMENT_ATTESTATION_V1";
export declare const HNK_EXPERIMENT_ATTESTATION_VERSION: "1.0.0";
export declare const HNK_EXPERIMENT_ATTESTATION_ALGORITHM: "SHA-256";
export declare const HNK_EXPERIMENT_ATTESTATION_SCOPE: "CONTENT_INTEGRITY_ONLY";
export declare const HNK_EXPERIMENT_ATTESTATION_BOUNDARY: "ATTESTATION_BINDS_CONTENT_NOT_AUTHORSHIP_TIME_CAUSALITY_OR_METAPHYSICAL_PROOF";

export interface ExperimentAttestationSessionEntry {
  kind: "SESSION";
  ordinal: number;
  assignment_id: string;
  role: string;
  added_at: string;
  session_id: string;
  artifact_digest: string;
  previous_digest: string;
  chain_digest: string;
}

export interface ExperimentAttestationReportEntry {
  kind: "REPORT";
  completed_at: string;
  report_digest: string;
  previous_digest: string;
  chain_digest: string;
}

export interface HnkExperimentAttestation {
  attestation_id: typeof HNK_EXPERIMENT_ATTESTATION_ID;
  attestation_version: typeof HNK_EXPERIMENT_ATTESTATION_VERSION;
  algorithm: typeof HNK_EXPERIMENT_ATTESTATION_ALGORITHM;
  scope: typeof HNK_EXPERIMENT_ATTESTATION_SCOPE;
  generated_at: string;
  experiment_id: string;
  protocol_id: string;
  protocol_version: string;
  protocol_status: string;
  preregistration_digest: string;
  protocol_snapshot_digest: string;
  sessions: ReadonlyArray<ExperimentAttestationSessionEntry>;
  report: ExperimentAttestationReportEntry | null;
  chain_head: string;
  timestamp_authority: "NONE";
  identity_signature: "NONE";
  authorship_proof: false;
  trusted_timestamp_proof: false;
  causal_proof: false;
  metaphysical_proof: false;
  claim_boundary: typeof HNK_EXPERIMENT_ATTESTATION_BOUNDARY;
}

export interface ExperimentAttestationValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface ExperimentAttestationVerification extends ExperimentAttestationValidation {
  preregistration_matches: boolean;
  snapshot_matches: boolean;
  chain_matches: boolean;
}

export interface ExperimentAttestationComparison {
  same_experiment: boolean;
  same_preregistration: boolean;
  same_snapshot: boolean;
  same_chain_head: boolean;
  left_status: string;
  right_status: string;
  left_sessions: number;
  right_sessions: number;
  left_has_report: boolean;
  right_has_report: boolean;
}

export declare function canonicalJson(value: unknown): string;
export declare function sha256Hex(text: string): string;
export declare function sha256Canonical(value: unknown): string;
export declare function experimentPreregistrationProjection(protocol: HnkExperimentProtocol): Readonly<Record<string, unknown>>;
export declare function createExperimentAttestation(protocol: HnkExperimentProtocol, input?: { generated_at?: string }): HnkExperimentAttestation;
export declare function validateExperimentAttestation(attestation: unknown): ExperimentAttestationValidation;
export declare function verifyExperimentAttestation(attestation: HnkExperimentAttestation, protocol: HnkExperimentProtocol): ExperimentAttestationVerification;
export declare function compareExperimentAttestations(left: HnkExperimentAttestation, right: HnkExperimentAttestation): ExperimentAttestationComparison;
export declare function serializeExperimentAttestation(attestation: HnkExperimentAttestation): string;
export declare function parseExperimentAttestation(text: string): HnkExperimentAttestation;
export declare function experimentAttestationSummary(): Readonly<Record<string, unknown>>;
