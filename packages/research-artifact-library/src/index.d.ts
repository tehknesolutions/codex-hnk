import type { HnkClaimDossier } from "@hnk/claim-dossier";
import type { HnkEvidenceSynthesis } from "@hnk/evidence-synthesis";
import type { HnkReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";

export declare const HNK_RESEARCH_ARTIFACT_LIBRARY_ID: "HNK_RESEARCH_ARTIFACT_LIBRARY_V1";
export declare const HNK_RESEARCH_ARTIFACT_LIBRARY_VERSION: "1.0.0";
export declare const HNK_RESEARCH_ARTIFACT_LIBRARY_BOUNDARY: "ARTIFACT_LIBRARY_CATALOGS_VALIDATED_RESEARCH_SNAPSHOTS_WITHOUT_INTERPRETING_TRUTH_RELEVANCE_OR_CANON";
export declare const HNK_RESEARCH_ARTIFACT_KINDS: readonly ["CLAIM_DOSSIER", "EVIDENCE_SYNTHESIS"];

export type HnkResearchArtifactKind = (typeof HNK_RESEARCH_ARTIFACT_KINDS)[number];
export type HnkResearchArtifactPayload = HnkClaimDossier | HnkEvidenceSynthesis;

export interface HnkResearchArtifactRecord {
  artifact_id: string;
  kind: HnkResearchArtifactKind;
  logical_key: string;
  revision: number;
  content_digest: string;
  source_created_at: string;
  added_at: string;
  supersedes_artifact_id: string | null;
  payload: HnkResearchArtifactPayload;
  artifact_digest: string;
}

export interface HnkResearchArtifactLibrary {
  library_id: typeof HNK_RESEARCH_ARTIFACT_LIBRARY_ID;
  library_version: typeof HNK_RESEARCH_ARTIFACT_LIBRARY_VERSION;
  authority: "HNK_AUTHORED_RESEARCH_ARTIFACT_LIBRARY";
  library_key: string;
  title: string;
  created_at: string;
  artifacts: HnkResearchArtifactRecord[];
  library_digest: string;
  persistence: "USER_CONTROLLED_FILE_ONLY";
  server_persistence: false;
  browser_persistence: false;
  immutable_history: true;
  latest_selection_rule: "HIGHEST_LIBRARY_REVISION_PER_KIND_AND_LOGICAL_KEY";
  automatic_truth_inference: false;
  automatic_relevance_inference: false;
  automatic_canon_promotion: false;
  canon_promotion_permitted: false;
  claim_boundary: typeof HNK_RESEARCH_ARTIFACT_LIBRARY_BOUNDARY;
}

export interface CreateResearchArtifactLibraryInput {
  library_key: string;
  title: string;
  created_at: string;
}

export interface AddResearchArtifactInput {
  kind: HnkResearchArtifactKind;
  payload: HnkResearchArtifactPayload;
  added_at: string;
}

export interface ResearchArtifactLibraryValidation {
  ok: boolean;
  issues: ReadonlyArray<string>;
}

export interface ResearchArtifactLibraryQuery {
  q?: string;
  kind?: HnkResearchArtifactKind;
  logical_key?: string;
  content_digest?: string;
  latest_only?: boolean;
}

export interface HnkResearchArtifactLibraryEntry extends HnkResearchArtifactRecord {
  latest: boolean;
  superseded_by_artifact_id: string | null;
}

export interface ResearchArtifactLibraryIndex {
  library_key: string;
  total_artifacts: number;
  claim_dossiers: number;
  evidence_syntheses: number;
  logical_keys: number;
  latest_artifacts: number;
  artifacts: ReadonlyArray<HnkResearchArtifactLibraryEntry>;
  truth_assessed: false;
  relevance_inferred: false;
  canon_promotion_permitted: false;
}

export interface HnkReevaluationArtifactResolution {
  claim_id: string;
  reviewed_record_id: string;
  dossier_digest: string;
  synthesis_key: string;
  original_synthesis_digest: string;
  dossier_found: boolean;
  candidate_synthesis_found: boolean;
  selected_candidate_synthesis_digest: string | null;
  selected_candidate_revision: number | null;
}

export interface HnkReevaluationArtifactBundle {
  reviewed_registry_key: string;
  original_dossiers: HnkClaimDossier[];
  candidate_syntheses: HnkEvidenceSynthesis[];
  resolutions: HnkReevaluationArtifactResolution[];
  active_claims: number;
  dossier_coverage: number;
  synthesis_coverage: number;
  coverage_complete: boolean;
  machine_inferred_relevance: false;
  candidate_selection_rule: "HIGHEST_LIBRARY_REVISION_PER_SYNTHESIS_KEY";
}

export declare function researchArtifactLibraryProjection(library: HnkResearchArtifactLibrary): Readonly<Record<string, unknown>>;
export declare function createResearchArtifactLibrary(input: CreateResearchArtifactLibraryInput): HnkResearchArtifactLibrary;
export declare function addResearchArtifact(library: HnkResearchArtifactLibrary, input: AddResearchArtifactInput): HnkResearchArtifactLibrary;
export declare function validateResearchArtifactLibrary(library: unknown): ResearchArtifactLibraryValidation;
export declare function researchArtifactLibraryIndex(library: HnkResearchArtifactLibrary): ResearchArtifactLibraryIndex;
export declare function queryResearchArtifactLibrary(library: HnkResearchArtifactLibrary, query?: ResearchArtifactLibraryQuery): ReadonlyArray<HnkResearchArtifactLibraryEntry>;
export declare function resolveReevaluationArtifactBundle(library: HnkResearchArtifactLibrary, reviewedRegistry: HnkReviewedClaimRegistry): HnkReevaluationArtifactBundle;
export declare function serializeResearchArtifactLibrary(library: HnkResearchArtifactLibrary): string;
export declare function parseResearchArtifactLibrary(text: string): HnkResearchArtifactLibrary;
export declare function researchArtifactLibrarySummary(): Readonly<Record<string, unknown>>;
