import type { HnkAuthoredCandidate } from './authored.js';
import type { HnkLexeme } from './index.js';

export type GrammarCoreV1Component = Readonly<{
  key:string;
  form:string;
  sourceId:string;
  role:string;
  expectedLessons:readonly string[];
  contract:string;
  boundary:string;
  authority:'CANDIDATE';
  productivity:'EXPLICIT_BINDING_REQUIRED';
  sourceEntry:HnkAuthoredCandidate;
}>;

export declare const HNK_GRAMMAR_CORE_V1_VERSION:'1.0.0-candidate';
export declare const HNK_GRAMMAR_CORE_V1_STATUS:'GOVERNED_TRANSVERSAL_COMPONENT_REGISTRY';
export declare const HNK_GRAMMAR_CORE_V1_SOURCE:'SIMPLEWAY_HNK_GRAMMAR_CORE_V1_APPROVED_2026-09-15';
export declare const HNK_GRAMMAR_CORE_V1_COMPONENTS:readonly GrammarCoreV1Component[];
export declare const HNK_GRAMMAR_CORE_V1_BY_FORM:Readonly<Record<string,GrammarCoreV1Component>>;
export declare const HNK_GRAMMAR_CORE_V1_POLICIES:Readonly<{
  predication:Readonly<{
    policy:'CONSTRUCTION_SPECIFIC';
    universalOvertCopula:false;
    universalZeroCopula:false;
    universalZeroSubject:false;
    universalBarePredicate:false;
  }>;
  negation:Readonly<{
    policy:'SCOPED_EXISTING_GOVERNED_USES_ONLY';
    sourceId:'AUTH-004';
    form:'NE';
    sourceEntry:HnkAuthoredCandidate;
    globalRulePromoted:false;
  }>;
  temporality:Readonly<{
    policy:'LEXICAL_SCOPED_FIRST';
    sourceId:'LEX-020';
    form:'PA';
    lexicalMeaning:'yesterday';
    sourceEntry:HnkLexeme;
    genericPastTenseCreated:false;
    tenseMorphologyCreated:false;
  }>;
}>;
export declare const HNK_GRAMMAR_CORE_V1_GOVERNANCE:Readonly<{
  languageAuthority:'@hnk/linguas';
  glyphAuthority:'@hnk/glyphs G-ID';
  componentCandidacyIsCanonicalPromotion:false;
  automaticCycle1Binding:false;
  automaticLessonBinding:false;
  automaticProductivity:false;
  referenceLanguagesSelectForms:false;
  numerologySelectsForms:false;
  hnk3000AutomaticBinding:false;
  parentLexemeGateConsumed:false;
}>;
export declare function getGrammarCoreV1Component(form:string):GrammarCoreV1Component|undefined;
export declare function validateHnkGrammarCoreV1():{ok:boolean;errors:string[]};
