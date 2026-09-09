export type LexiconAuthority = 'FROZEN'|'WATCH'|'CANDIDATE'|'GATE'|'BRIDGE'|'REFERENCE';
export type Cycle1LessonId = 'L01'|'L02'|'L03'|'L04'|'L05'|'L06'|'L07';
export type Cycle1Sphere = 'Kether'|'Chokhmah'|'Binah'|'Chesed'|'Gevurah'|'Yesod'|'Malkuth';
export type Cycle1BoundLexeme = Readonly<{
  id: string;
  transliteration: string;
  authority: LexiconAuthority;
  lessons: readonly string[];
}>;
export type Cycle1AuthoredCandidate = Readonly<{
  id: string;
  transliteration: string;
  authority: 'CANDIDATE';
  lessons: readonly string[];
}>;
export type Cycle1Coverage = Readonly<{
  lessonId: Cycle1LessonId;
  sphere: Cycle1Sphere;
  lexemeCount: number;
  phraseCount: number;
  authoredCandidateCount: number;
  languageAssetCount: number;
  lexemeIds: readonly string[];
  recoveredLexemeIds: readonly string[];
  governedRebindLexemeIds: readonly string[];
  authoredCandidateIds: readonly string[];
  phraseIds: readonly string[];
  authorityCounts: Readonly<Record<LexiconAuthority,number>>;
  sourceState: 'RECOVERED_GOVERNED_OR_AUTHORED_ASSETS_PRESENT'|'NO_GOVERNED_LANGUAGE_ASSETS';
}>;

export const HNK_CYCLE1_VOCABULARY_TARGET: 144;
export const HNK_CYCLE1_VOCABULARY_TARGET_SOURCE: 'HNK_CYCLE_1_NUMEROLOGICAL_CONTRACT_V1';
export const HNK_CYCLE1_LESSONS: readonly Readonly<{lessonId:Cycle1LessonId;sphere:Cycle1Sphere}>[];
export const HNK_CYCLE1_CURRICULUM_REBINDS: Readonly<Record<Cycle1LessonId,readonly string[]>>;
export const HNK_CYCLE1_AUTHORED_CANDIDATES: readonly Cycle1AuthoredCandidate[];
export const HNK_CYCLE1_LANGUAGE_COVERAGE: readonly Cycle1Coverage[];
export const HNK_CYCLE1_BOUND_LEXEMES: readonly Cycle1BoundLexeme[];
export const HNK_CYCLE1_UNBOUND_LEXEMES: readonly Cycle1BoundLexeme[];
export const HNK_CYCLE1_EMPTY_LESSONS: readonly Cycle1LessonId[];
export const HNK_CYCLE1_LANGUAGE_GATE: Readonly<{
  decision: 'READY_FOR_COMPLETION_REVIEW'|'HOLD_INCOMPLETE_BINDING';
  vocabularyTarget: number;
  registryBoundRecoveredForms: number;
  registryUnboundRecoveredForms: number;
  authoredCandidateForms: number;
  governedUniqueLanguageAssets: number;
  recoveredProxyGap: number;
  recoveredProxyRatio: number;
  governedAssetProxyGap: number;
  governedAssetProxyRatio: number;
  emptyLessons: readonly Cycle1LessonId[];
  unboundRecoveredForms: readonly string[];
  authoredCandidateFormsList: readonly string[];
  curriculumRebinds: Readonly<Record<Cycle1LessonId,readonly string[]>>;
  interpretation: string;
  nonInventionRule: string;
}>;
export function validateCycle1LanguageCoverage(): {ok:boolean;errors:string[]};
