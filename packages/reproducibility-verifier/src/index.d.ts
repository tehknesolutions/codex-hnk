import type {
  HnkResearchReleaseManifest,
  HnkReleaseValidatorExecutionStatus,
} from "@hnk/research-release-manifest";

export declare const HNK_REPRODUCIBILITY_VERIFIER_ID: "HNK_REPRODUCIBILITY_VERIFIER_V1";
export declare const HNK_REPRODUCIBILITY_VERIFIER_VERSION: "1.0.0";
export declare const HNK_REPRODUCIBILITY_VERIFIER_BOUNDARY: "VERIFIER_CHECKS_MANIFEST_BOUND_STATE_AGAINST_OBSERVED_PROJECT_STATE_NOT_TRUTH_AUTHORSHIP_TIME_READINESS_OR_CANON";
export declare const HNK_REPRODUCIBILITY_STATUSES: readonly ["MATCH", "DRIFT", "MISSING", "UNVERIFIED"];

export type HnkReproducibilityStatus = (typeof HNK_REPRODUCIBILITY_STATUSES)[number];

export interface HnkVerificationFileObservation {
  source_path: string;
  source_text: string;
}

export interface HnkReproducibilityObservedState {
  git?: {
    repository_full_name?: string | null;
    commit_sha?: string | null;
    ref?: string | null;
  };
  runtime?: {
    node_engine?: string | null;
    package_manager?: string | null;
  };
  files?: HnkVerificationFileObservation[];
}

export interface HnkReproducibilityCheck {
  check_id: string;
  category:
    | "MANIFEST"
    | "WORKSPACE"
    | "GIT"
    | "RUNTIME"
    | "CONTRACT_SOURCE"
    | "VALIDATOR_SOURCE"
    | "VALIDATOR_EXECUTION"
    | "REPRODUCTION";
  subject: string;
  expected: string | null;
  observed: string | null;
  status: HnkReproducibilityStatus;
  note: string;
}

export interface HnkReproducibilityVerificationReport {
  verifier_id: typeof HNK_REPRODUCIBILITY_VERIFIER_ID;
  verifier_version: typeof HNK_REPRODUCIBILITY_VERIFIER_VERSION;
  authority: "HNK_AUTHORED_REPRODUCIBILITY_VERIFIER";
  generated_at: string;
  release_key: string;
  manifest_digest: string;
  recorded_validator_execution_status: HnkReleaseValidatorExecutionStatus;
  overall_status: HnkReproducibilityStatus;
  counts: {
    MATCH: number;
    DRIFT: number;
    MISSING: number;
    UNVERIFIED: number;
  };
  checks: HnkReproducibilityCheck[];
  report_digest: string;
  commands_executed: false;
  filesystem_scanned_by_contract: false;
  content_integrity_scope: true;
  authorship_proof: false;
  trusted_timestamp_proof: false;
  truth_assessed: false;
  production_readiness_inferred: false;
  machine_can_decide_review: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_REPRODUCIBILITY_VERIFIER_BOUNDARY;
}

export interface ReproducibilityVerificationValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export declare function reproducibilityVerificationReportProjection(report: HnkReproducibilityVerificationReport): Readonly<Record<string, unknown>>;
export declare function verifyResearchReleaseManifest(
  manifest: HnkResearchReleaseManifest,
  observed: HnkReproducibilityObservedState,
  input?: { generated_at?: string },
): HnkReproducibilityVerificationReport;
export declare function validateReproducibilityVerificationReport(report: unknown): ReproducibilityVerificationValidation;
export declare function serializeReproducibilityVerificationReport(report: HnkReproducibilityVerificationReport): string;
export declare function parseReproducibilityVerificationReport(text: string): HnkReproducibilityVerificationReport;
export declare function reproducibilityVerifierSummary(): Readonly<Record<string, unknown>>;
