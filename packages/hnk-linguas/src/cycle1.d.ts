export type LexiconAuthority = 'FROZEN'|'WATCH'|'CANDIDATE'|'GATE'|'BRIDGE'|'REFERENCE';
export type Cycle1LessonId = 'L01'|'L02'|'L03'|'L04'|'L05'|'L06'|'L07';
export type Cycle1Sphere = 'Kether'|'Chokhmah'|'Binah'|'Chesed'|'Gevurah'|'Yesod'|'Malkuth';
export type Cycle1BoundLexeme = Readonly<{
  id: string;
  transliteration: string;
  authority: LexiconAuthority;
  lessons: readonly string[];
}>;
export type Cycle1Coverage = Readonly<{
  lessonId: Cycle1LessonId;
  sphere: Cycle1Sphere;
  lexemeCount: number;
  phraseCount: number;
  lexemeIds: readonly string[];
  phraseIds: readonly string[];
  authorityCounts: Readonly<Record<LexiconAuthority,number>>;
  sourceState: 'RECOVERED_BINDINGS_PRESENT'|'NO_RECOVERED_LEXEMES';
}>;

export const HNK_CYCLE1_VOCABULARY_TARGET: 144;
export const HNK_CYCLE1_VOCABULARY_TARGET_SOURCE: 'HNK_CYCLE_1_NUMEROLOGICAL_CONTRACT_V1';
export const HNK_CYCLE1_LESSONS: readonly Readonly<{lessonId:Cycle1LessonId;sphere:Cycle1Sphere}>[];
export const HNK_CYCLE1_LANGUAGE_COVERAGE: readonly Cycle1Coverage[];
export const HNK_CYCLE1_BOUND_LEXEMES: readonly Cycle1BoundLexeme[];
export const HNK_CYCLE1_UNBOUND_LEXEMES: readonly Cycle1BoundLexeme[];
export const HNK_CYCLE1_EMPTY_LESSONS: readonly Cycle1LessonId[];
export const HNK_CYCLE1_LANGUAGE_GATE: Readonly<{
  decision: 'READY_FOR_COMPLETION_REVIEW'|'HOLD_INCOMPLETE_BINDING';
  vocabularyTarget: number;
  registryBoundForms: number;
  registryUnboundForms: number;
  provisionalBindingGap: number;
  provisionalBindingRatio: number;
  emptyLessons: readonly Cycle1LessonId[];
  unboundForms: readonly string[];
  interpretation: string;
  nonInventionRule: string;
}>;
export function validateCycle1LanguageCoverage(): {ok:boolean;errors:string[]};
