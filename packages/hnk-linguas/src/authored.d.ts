export type AuthoredCandidateAuthority = 'CANDIDATE';
export type AuthoredCandidateCertainty = 'AUTHORED_DERIVATION'|'AUTHORED_BACK_ANALYSIS';
export type AuthoredCandidateProductivity = 'CLOSED_LIST_ONLY'|'NON_PRODUCTIVE_SINGLE_CANDIDATE';

export type HnkAuthoredCandidate = Readonly<{
  id: string;
  transliteration: string;
  meaning: Readonly<{ pt: string; en: string }>;
  authority: AuthoredCandidateAuthority;
  certainty: AuthoredCandidateCertainty;
  sourceClass: 'AUTHORING_PROPOSAL';
  historicalRecoveryClaim: false;
  lessons: readonly string[];
  morphology: Readonly<{
    schema: string;
    leftState: string;
    rightState: string;
    productivity: AuthoredCandidateProductivity;
  }>;
  provenance: readonly string[];
  notes: readonly string[];
  glyphIds: readonly string[];
  ipaSegments: readonly string[];
  ipa: string;
}>;

export declare const HNK_AUTHORED_REGISTRY_VERSION: string;
export declare const HNK_AUTHORED_REGISTRY_STATUS: 'GOVERNED_AUTHORING_CANDIDATES';
export declare const HNK_AUTHORED_REGISTRY_SOURCE: string;
export declare const HNK_AUTHORED_CANDIDATES: readonly HnkAuthoredCandidate[];
export declare const HNK_AUTHORED_CANDIDATES_BY_FORM: Readonly<Record<string, HnkAuthoredCandidate>>;
export declare const HNK_AUTHORED_REGISTRY_STATS: Readonly<{ candidates: number; cycle1Candidates: number }>;
export declare function getAuthoredCandidate(value: string): HnkAuthoredCandidate | undefined;
export declare function validateHnkAuthoredRegistry(): { ok: boolean; errors: string[] };
