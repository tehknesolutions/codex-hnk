import { HNK_MASTER_LEXICON, HNK_MASTER_PHRASES } from './index.mjs';

export const HNK_CYCLE1_VOCABULARY_TARGET = 144;
export const HNK_CYCLE1_VOCABULARY_TARGET_SOURCE = 'HNK_CYCLE_1_NUMEROLOGICAL_CONTRACT_V1';

export const HNK_CYCLE1_LESSONS = Object.freeze([
  Object.freeze({ lessonId:'L01', sphere:'Kether' }),
  Object.freeze({ lessonId:'L02', sphere:'Chokhmah' }),
  Object.freeze({ lessonId:'L03', sphere:'Binah' }),
  Object.freeze({ lessonId:'L04', sphere:'Chesed' }),
  Object.freeze({ lessonId:'L05', sphere:'Gevurah' }),
  Object.freeze({ lessonId:'L06', sphere:'Yesod' }),
  Object.freeze({ lessonId:'L07', sphere:'Malkuth' }),
]);

// Curriculum rebinds are intentionally separate from recovered source provenance.
// A rebind expands where an already-governed lexeme may be taught without rewriting
// the lessons array recovered in the Master Lexicon itself.
export const HNK_CYCLE1_CURRICULUM_REBINDS = Object.freeze({
  L01: Object.freeze(['LEX-013']), // VALI = work / trabalhar (FROZEN in source registry)
  L02: Object.freeze([]),
  L03: Object.freeze([]),
  L04: Object.freeze([]),
  L05: Object.freeze([]),
  L06: Object.freeze([]),
  L07: Object.freeze([]),
});

const AUTHORITY_ORDER = Object.freeze(['FROZEN','WATCH','CANDIDATE','GATE','BRIDGE','REFERENCE']);
const CYCLE1_IDS = new Set(HNK_CYCLE1_LESSONS.map((lesson) => lesson.lessonId));

function authorityCounts(entries) {
  return Object.freeze(Object.fromEntries(
    AUTHORITY_ORDER.map((authority) => [authority, entries.filter((entry) => entry.authority === authority).length]),
  ));
}

function isBoundToLesson(entry, lessonId) {
  return entry.lessons.includes(lessonId) || HNK_CYCLE1_CURRICULUM_REBINDS[lessonId].includes(entry.id);
}

export const HNK_CYCLE1_LANGUAGE_COVERAGE = Object.freeze(HNK_CYCLE1_LESSONS.map((lesson) => {
  const lexemes = HNK_MASTER_LEXICON.filter((entry) => isBoundToLesson(entry, lesson.lessonId));
  const phrases = HNK_MASTER_PHRASES.filter((entry) => entry.lessons.includes(lesson.lessonId));
  const recoveredLexemeIds = lexemes.filter((entry) => entry.lessons.includes(lesson.lessonId)).map((entry) => entry.id);
  const governedRebindLexemeIds = lexemes.filter((entry) => !entry.lessons.includes(lesson.lessonId)).map((entry) => entry.id);
  return Object.freeze({
    ...lesson,
    lexemeCount: lexemes.length,
    phraseCount: phrases.length,
    lexemeIds: Object.freeze(lexemes.map((entry) => entry.id)),
    recoveredLexemeIds: Object.freeze(recoveredLexemeIds),
    governedRebindLexemeIds: Object.freeze(governedRebindLexemeIds),
    phraseIds: Object.freeze(phrases.map((entry) => entry.id)),
    authorityCounts: authorityCounts(lexemes),
    sourceState: lexemes.length > 0 ? 'RECOVERED_OR_GOVERNED_BINDINGS_PRESENT' : 'NO_RECOVERED_LEXEMES',
  });
}));

export const HNK_CYCLE1_BOUND_LEXEMES = Object.freeze(
  HNK_MASTER_LEXICON.filter((entry) => entry.lessons.some((lessonId) => CYCLE1_IDS.has(lessonId))),
);
export const HNK_CYCLE1_UNBOUND_LEXEMES = Object.freeze(
  HNK_MASTER_LEXICON.filter((entry) => !entry.lessons.some((lessonId) => CYCLE1_IDS.has(lessonId))),
);
export const HNK_CYCLE1_EMPTY_LESSONS = Object.freeze(
  HNK_CYCLE1_LANGUAGE_COVERAGE.filter((lesson) => lesson.lexemeCount === 0).map((lesson) => lesson.lessonId),
);

export const HNK_CYCLE1_LANGUAGE_GATE = Object.freeze({
  decision: HNK_CYCLE1_BOUND_LEXEMES.length >= HNK_CYCLE1_VOCABULARY_TARGET && HNK_CYCLE1_EMPTY_LESSONS.length === 0
    ? 'READY_FOR_COMPLETION_REVIEW'
    : 'HOLD_INCOMPLETE_BINDING',
  vocabularyTarget: HNK_CYCLE1_VOCABULARY_TARGET,
  registryBoundForms: HNK_CYCLE1_BOUND_LEXEMES.length,
  registryUnboundForms: HNK_CYCLE1_UNBOUND_LEXEMES.length,
  provisionalBindingGap: Math.max(0, HNK_CYCLE1_VOCABULARY_TARGET - HNK_CYCLE1_BOUND_LEXEMES.length),
  provisionalBindingRatio: Number((HNK_CYCLE1_BOUND_LEXEMES.length / HNK_CYCLE1_VOCABULARY_TARGET).toFixed(4)),
  emptyLessons: HNK_CYCLE1_EMPTY_LESSONS,
  unboundForms: Object.freeze(HNK_CYCLE1_UNBOUND_LEXEMES.map((entry) => entry.transliteration)),
  curriculumRebinds: HNK_CYCLE1_CURRICULUM_REBINDS,
  interpretation: 'Registry-bound forms are a recovery metric, not a claim that each form equals one curricular vocabulary slot. Curriculum rebinds do not rewrite recovered lexicon provenance.',
  nonInventionRule: 'L05-L07 remain empty until source-backed HNK forms are recovered or explicitly authored and promoted through governance.',
});

export function validateCycle1LanguageCoverage() {
  const errors = [];
  const expectedTree = ['L01:Kether','L02:Chokhmah','L03:Binah','L04:Chesed','L05:Gevurah','L06:Yesod','L07:Malkuth'];
  const actualTree = HNK_CYCLE1_LESSONS.map((lesson) => `${lesson.lessonId}:${lesson.sphere}`);
  if (JSON.stringify(actualTree) !== JSON.stringify(expectedTree)) errors.push('Cycle 1 lesson/sphere mapping drift');
  if (HNK_CYCLE1_VOCABULARY_TARGET !== 144) errors.push('Cycle 1 vocabulary target drift');
  if (HNK_CYCLE1_BOUND_LEXEMES.length !== 31) errors.push(`Expected 31 cycle-bound recovered forms, got ${HNK_CYCLE1_BOUND_LEXEMES.length}`);
  if (HNK_CYCLE1_UNBOUND_LEXEMES.length !== 2) errors.push(`Expected 2 unbound recovered forms, got ${HNK_CYCLE1_UNBOUND_LEXEMES.length}`);
  if (JSON.stringify(HNK_CYCLE1_EMPTY_LESSONS) !== JSON.stringify(['L05','L06','L07'])) errors.push('Empty lesson boundary drift');
  if (JSON.stringify(HNK_CYCLE1_CURRICULUM_REBINDS.L01) !== JSON.stringify(['LEX-013'])) errors.push('L01 curriculum rebind drift');
  const expectedCounts = {L01:10,L02:11,L03:8,L04:9,L05:0,L06:0,L07:0};
  for (const lesson of HNK_CYCLE1_LANGUAGE_COVERAGE) {
    if (lesson.lexemeCount !== expectedCounts[lesson.lessonId]) errors.push(`${lesson.lessonId} lexeme-count drift`);
  }
  const l01 = HNK_CYCLE1_LANGUAGE_COVERAGE.find((lesson) => lesson.lessonId === 'L01');
  if (JSON.stringify(l01.governedRebindLexemeIds) !== JSON.stringify(['LEX-013'])) errors.push('L01 governed rebind provenance drift');
  if (HNK_CYCLE1_LANGUAGE_GATE.decision !== 'HOLD_INCOMPLETE_BINDING') errors.push('Incomplete Cycle 1 must remain HOLD');
  return { ok: errors.length === 0, errors };
}
