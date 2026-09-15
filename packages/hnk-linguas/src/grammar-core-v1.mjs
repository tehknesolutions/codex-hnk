import { HNK_AUTHORED_CANDIDATES, getAuthoredCandidate } from './authored.mjs';
import { getLexeme } from './index.mjs';

export const HNK_GRAMMAR_CORE_V1_VERSION = '1.0.0-candidate';
export const HNK_GRAMMAR_CORE_V1_STATUS = 'GOVERNED_TRANSVERSAL_COMPONENT_REGISTRY';
export const HNK_GRAMMAR_CORE_V1_SOURCE = 'SIMPLEWAY_HNK_GRAMMAR_CORE_V1_APPROVED_2026-09-15';

const COMPONENT_SPECS = Object.freeze([
  Object.freeze({
    key:'KUVAN_LOCATIVE_INTERROGATIVE', form:'KUVAN', sourceId:'AUTH-001',
    role:'LOCATIVE_CONTENT_INTERROGATIVE', expectedLessons:Object.freeze(['L01','L02']),
    contract:'SCOPED_CLOSED_LIST_LOCATIVE_CONTENT_INTERROGATIVE',
    boundary:'NO_GLOBAL_VAN_PRODUCTIVITY_NO_ARBITRARY_KU_PLUS_X_GENERATION',
  }),
  Object.freeze({
    key:'AN_FIRST_PERSON', form:'AN', sourceId:'AUTH-016',
    role:'FIRST_PERSON_REFERENT', expectedLessons:Object.freeze(['L01','L02']),
    contract:'SCOPED_FIRST_PERSON_REFERENT',
    boundary:'NO_COMPLETE_PRONOUN_OR_PERSON_NUMBER_PARADIGM',
  }),
  Object.freeze({
    key:'EN_SECOND_PERSON', form:'EN', sourceId:'AUTH-017',
    role:'SECOND_PERSON_REFERENT', expectedLessons:Object.freeze(['L01','L02']),
    contract:'SCOPED_SECOND_PERSON_REFERENT',
    boundary:'SUBJECT_VS_POSSESSIVE_REMAINS_UNRESOLVED_OUTSIDE_GOVERNED_CONSTRUCTIONS',
  }),
  Object.freeze({
    key:'KU_CONTENT_INTERROGATIVE', form:'KU', sourceId:'AUTH-018',
    role:'CONTENT_INTERROGATIVE_SELECTOR', expectedLessons:Object.freeze(['L01','L02']),
    contract:'SCOPED_CONTENT_INTERROGATIVE_SELECTOR',
    boundary:'NO_SINGLE_UNIVERSAL_WH_GLOSS_NO_UNGOVERNED_PRODUCTIVITY',
  }),
  Object.freeze({
    key:'KE_YES_NO_OPERATOR', form:'KE', sourceId:'AUTH-019',
    role:'YES_NO_INTERROGATIVE_MARKER', expectedLessons:Object.freeze(['L01','L02']),
    contract:'CLAUSE_FINAL_POSITION_IS_THE_EVIDENCE_LED_CANDIDATE_POSITION',
    boundary:'NO_UNIVERSAL_INTERROGATIVE_GRAMMAR_REQUIRES_EXPLICIT_BINDING_PER_CONSTRUCTION',
  }),
]);

function resolveAuthored(spec) {
  const entry = getAuthoredCandidate(spec.form);
  if (!entry) throw new Error(`Grammar Core V1 source missing: ${spec.form}`);
  if (entry.id !== spec.sourceId) throw new Error(`Grammar Core V1 source ID drift for ${spec.form}: ${entry.id}`);
  if (entry.authority !== 'CANDIDATE') throw new Error(`Grammar Core V1 authority drift for ${spec.form}: ${entry.authority}`);
  if (JSON.stringify(entry.lessons) !== JSON.stringify(spec.expectedLessons)) throw new Error(`Grammar Core V1 lesson-scope drift for ${spec.form}`);
  return entry;
}

export const HNK_GRAMMAR_CORE_V1_COMPONENTS = Object.freeze(COMPONENT_SPECS.map((spec) => Object.freeze({
  ...spec,
  authority:'CANDIDATE',
  productivity:'EXPLICIT_BINDING_REQUIRED',
  sourceEntry:resolveAuthored(spec),
})));

export const HNK_GRAMMAR_CORE_V1_BY_FORM = Object.freeze(Object.fromEntries(
  HNK_GRAMMAR_CORE_V1_COMPONENTS.map((component) => [component.form, component]),
));

const negationEntry = getAuthoredCandidate('NE');
if (!negationEntry || negationEntry.id !== 'AUTH-004' || negationEntry.authority !== 'CANDIDATE') throw new Error('Grammar Core V1 NE supporting-evidence drift');
const temporalEntry = getLexeme('PA');
if (!temporalEntry || temporalEntry.id !== 'LEX-020' || temporalEntry.authority !== 'WATCH') throw new Error('Grammar Core V1 PA supporting-evidence drift');

export const HNK_GRAMMAR_CORE_V1_POLICIES = Object.freeze({
  predication:Object.freeze({
    policy:'CONSTRUCTION_SPECIFIC',
    universalOvertCopula:false,
    universalZeroCopula:false,
    universalZeroSubject:false,
    universalBarePredicate:false,
  }),
  negation:Object.freeze({
    policy:'SCOPED_EXISTING_GOVERNED_USES_ONLY',
    sourceId:'AUTH-004',
    form:'NE',
    sourceEntry:negationEntry,
    globalRulePromoted:false,
  }),
  temporality:Object.freeze({
    policy:'LEXICAL_SCOPED_FIRST',
    sourceId:'LEX-020',
    form:'PA',
    lexicalMeaning:'yesterday',
    sourceEntry:temporalEntry,
    genericPastTenseCreated:false,
    tenseMorphologyCreated:false,
  }),
});

export const HNK_GRAMMAR_CORE_V1_GOVERNANCE = Object.freeze({
  languageAuthority:'@hnk/linguas',
  glyphAuthority:'@hnk/glyphs G-ID',
  componentCandidacyIsCanonicalPromotion:false,
  automaticCycle1Binding:false,
  automaticLessonBinding:false,
  automaticProductivity:false,
  referenceLanguagesSelectForms:false,
  numerologySelectsForms:false,
  hnk3000AutomaticBinding:false,
  parentLexemeGateConsumed:false,
});

export function getGrammarCoreV1Component(form) {
  return typeof form === 'string' ? HNK_GRAMMAR_CORE_V1_BY_FORM[form.trim().toUpperCase()] : undefined;
}

export function validateHnkGrammarCoreV1() {
  const errors = [];
  const expectedForms = ['KUVAN','AN','EN','KU','KE'];
  const actualForms = HNK_GRAMMAR_CORE_V1_COMPONENTS.map((component) => component.form);
  if (JSON.stringify(actualForms) !== JSON.stringify(expectedForms)) errors.push('Grammar Core V1 component-order drift');
  if (new Set(actualForms).size !== actualForms.length) errors.push('Grammar Core V1 duplicate component form');
  if (new Set(HNK_GRAMMAR_CORE_V1_COMPONENTS.map((component) => component.sourceId)).size !== HNK_GRAMMAR_CORE_V1_COMPONENTS.length) errors.push('Grammar Core V1 duplicate source ID');
  for (const component of HNK_GRAMMAR_CORE_V1_COMPONENTS) {
    const authored = getAuthoredCandidate(component.form);
    if (authored !== component.sourceEntry) errors.push(`${component.form} must reference the existing authored object`);
    if (authored?.id !== component.sourceId) errors.push(`${component.form} source ID drift`);
    if (authored?.authority !== 'CANDIDATE') errors.push(`${component.form} authority must remain CANDIDATE`);
    if (JSON.stringify(authored?.lessons) !== JSON.stringify(component.expectedLessons)) errors.push(`${component.form} lesson scope drift`);
    const duplicates = HNK_AUTHORED_CANDIDATES.filter((entry) => entry.transliteration === component.form);
    if (duplicates.length !== 1) errors.push(`${component.form} must exist exactly once in authored registry`);
  }
  if (HNK_GRAMMAR_CORE_V1_POLICIES.predication.policy !== 'CONSTRUCTION_SPECIFIC') errors.push('Predication policy drift');
  if (HNK_GRAMMAR_CORE_V1_POLICIES.negation.sourceEntry !== negationEntry || negationEntry.id !== 'AUTH-004') errors.push('NE support-reference drift');
  if (HNK_GRAMMAR_CORE_V1_POLICIES.temporality.sourceEntry !== temporalEntry || temporalEntry.id !== 'LEX-020') errors.push('PA support-reference drift');
  if (HNK_GRAMMAR_CORE_V1_POLICIES.negation.globalRulePromoted !== false) errors.push('Global negation must remain unpromoted');
  if (HNK_GRAMMAR_CORE_V1_POLICIES.temporality.genericPastTenseCreated !== false) errors.push('Generic past tense must remain uncreated');
  if (HNK_GRAMMAR_CORE_V1_GOVERNANCE.automaticCycle1Binding !== false) errors.push('Automatic Cycle 1 binding must remain false');
  if (HNK_GRAMMAR_CORE_V1_GOVERNANCE.automaticProductivity !== false) errors.push('Automatic productivity must remain false');
  return { ok: errors.length === 0, errors };
}
