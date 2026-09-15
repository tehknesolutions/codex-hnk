export const HNK_PARENT_LEXEME_REGISTRY_VERSION = '1.0.0-candidate';
export const HNK_PARENT_LEXEME_REGISTRY_STATUS = 'GOVERNED_AUTHORED_CANDIDATES_PENDING_AUTHORED_MJS_INTEGRATION';

export const HNK_PARENT_LEXEME_CANDIDATES = Object.freeze([
  Object.freeze({
    id: 'PARENT-AUTH-001',
    transliteration: 'DARUNO',
    meaning: Object.freeze({ pt: 'pai; progenitor humano masculino', en: 'father; male human parent' }),
    glyphIds: Object.freeze(['G19','G01','G15','G05','G12','G04']),
    ipa: '/da.ru.no/',
    authority: 'CANDIDATE',
    certainty: 'AUTHORED_PRIMITIVE',
    sourceClass: 'AUTHORING_PROPOSAL',
    historicalRecoveryClaim: false,
    lessons: Object.freeze([]),
    morphology: Object.freeze({ schema: 'PRIMITIVE_AUTHORED_PARENT_LEXEME', productivity: 'NON_PRODUCTIVE_SINGLE_CANDIDATE' }),
    provenance: Object.freeze(['simpleway-hnk/proposals/language/HNK_PARENT_LEXEME_HONORIFIC_PAIR_HUMAN_GATE_V1.json','simpleway-hnk/proposals/language/HNK_PARENT_LEXEME_SELECTED_FORM_REGISTRATION_HUMAN_GATE_V1.json']),
    notes: Object.freeze(['Selected by explicit human gate.','Does not derive from NEKUVO and creates no productive gender or parent morphology.','PAPA historical evidence is preserved separately and is not the core father lexeme.','Theological titles are outside this entry.'])
  }),
  Object.freeze({
    id: 'PARENT-AUTH-002',
    transliteration: 'NELARA',
    meaning: Object.freeze({ pt: 'mãe; progenitora humana feminina', en: 'mother; female human parent' }),
    glyphIds: Object.freeze(['G12','G02','G14','G01','G15','G01']),
    ipa: '/ne.la.ra/',
    authority: 'CANDIDATE',
    certainty: 'AUTHORED_PRIMITIVE',
    sourceClass: 'AUTHORING_PROPOSAL',
    historicalRecoveryClaim: false,
    lessons: Object.freeze([]),
    morphology: Object.freeze({ schema: 'PRIMITIVE_AUTHORED_PARENT_LEXEME', productivity: 'NON_PRODUCTIVE_SINGLE_CANDIDATE' }),
    provenance: Object.freeze(['simpleway-hnk/proposals/language/HNK_PARENT_LEXEME_HONORIFIC_PAIR_HUMAN_GATE_V1.json','simpleway-hnk/proposals/language/HNK_PARENT_LEXEME_SELECTED_FORM_REGISTRATION_HUMAN_GATE_V1.json']),
    notes: Object.freeze(['Selected by explicit human gate.','Does not derive from NEKUVO and creates no productive gender or parent morphology.','MAMA historical evidence is preserved separately and is not the core mother lexeme.','Theological titles are outside this entry.'])
  })
]);

export const HNK_PARENT_LEXEME_BY_FORM = Object.freeze(Object.fromEntries(HNK_PARENT_LEXEME_CANDIDATES.map((entry) => [entry.transliteration, entry])));
