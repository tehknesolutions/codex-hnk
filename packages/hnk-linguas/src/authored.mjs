import { getGlyph, transliterationToGlyphIds } from '@hnk/glyphs';
import { HNK_MASTER_LEXICON } from './index.mjs';

export const HNK_AUTHORED_REGISTRY_VERSION = '1.3.0-candidate';
export const HNK_AUTHORED_REGISTRY_STATUS = 'GOVERNED_AUTHORING_CANDIDATES';
export const HNK_AUTHORED_REGISTRY_SOURCE = 'SIMPLEWAY_HNK_AUTHORING_2026-09-09';

const RAW_AUTHORED_CANDIDATES = [
  {
    id: 'AUTH-001',
    transliteration: 'KUVAN',
    meaning: {
      pt: 'variável interrogativa locativa; equivalente funcional aproximado de onde / em que lugar',
      en: 'locative interrogative variable; approximate functional equivalent of where / in what place',
    },
    authority: 'CANDIDATE',
    certainty: 'AUTHORED_DERIVATION',
    sourceClass: 'AUTHORING_PROPOSAL',
    historicalRecoveryClaim: false,
    lessons: ['L01'],
    morphology: {
      schema: 'KU + VAN',
      leftState: 'RECOVERED_FORM_COMPONENT_INFERRED_ROLE',
      rightState: 'RECOVERED_RECURRING_SEGMENT_INFERRED_LOCATIVE_ROLE',
      productivity: 'CLOSED_LIST_ONLY',
    },
    provenance: [
      'simpleway-hnk/proposals/language/HNK_KUVAN_LOCATIVE_INTERROGATIVE_PROPOSAL_V1.json',
      'simpleway-hnk/proposals/language/HNK_COMPOSITIONAL_INTERROGATIVE_RULE_V1.json',
    ],
    notes: [
      'New governed authorship; not recovered historical HNK.',
      'Starts at CANDIDATE and must not be promoted silently.',
      'Does not retroactively define KU as WHERE or VAN as globally productive.',
    ],
  },
  {
    id: 'AUTH-002',
    transliteration: 'VALA',
    meaning: {
      pt: 'atividade / ação realizada; núcleo nominal genérico de atividade',
      en: 'activity / performed action; generic activity nominal head',
    },
    authority: 'CANDIDATE',
    certainty: 'AUTHORED_BACK_ANALYSIS',
    sourceClass: 'AUTHORING_PROPOSAL',
    historicalRecoveryClaim: false,
    lessons: ['L01'],
    morphology: {
      schema: 'BACK_ANALYSIS: VAMAVALA + VALI family evidence -> VALA',
      leftState: 'VAMAVALA_WATCH_CONTAINS_VALA_ACTIVITY_DOMAIN',
      rightState: 'VALI_FROZEN_ACTION_WORK_DOMAIN',
      productivity: 'NON_PRODUCTIVE_SINGLE_CANDIDATE',
    },
    provenance: [
      'simpleway-hnk/proposals/language/HNK_VALA_ACTIVITY_NOUN_PROPOSAL_V1.json',
      'simpleway-hnk/proposals/language/HNK_MORPHOLOGY_HYPOTHESES_V1.md',
    ],
    notes: [
      'New governed authorship; VALA is not claimed as a recovered historical morpheme.',
      'Does not establish A=noun or I=verb as universal morphology.',
      'Primary test use is L01 OPI 6 through the contextual frame EN KU VALA KE.',
    ],
  },
  {
    id: 'AUTH-003',
    transliteration: 'KUON',
    meaning: {
      pt: 'qual pessoa / quem; variável interrogativa de referente humano em teste',
      en: 'which person / who; human-referent interrogative variable under test',
    },
    authority: 'CANDIDATE',
    certainty: 'AUTHORED_DERIVATION_WITH_GATED_COMPONENT',
    sourceClass: 'AUTHORING_PROPOSAL',
    historicalRecoveryClaim: false,
    lessons: ['L01'],
    morphology: {
      schema: 'KU + ON',
      leftState: 'RECOVERED_FORM_COMPONENT_INFERRED_CONTENT_SELECTOR_ROLE',
      rightState: 'LEX-026_ON_GATE_PRONOUN_REFERENT_UNDER_TEST',
      productivity: 'CLOSED_LIST_ONLY',
    },
    provenance: [
      'simpleway-hnk/proposals/language/HNK_KUON_PERSON_INTERROGATIVE_PROPOSAL_V1.json',
      'simpleway-hnk/curriculum/cycle-01/L01-kether/recovery/opi-007.archaeology.v2.json',
    ],
    notes: [
      'New governed authorship; not recovered historical HNK.',
      'Depends on ON remaining GATE; this candidate does not promote ON.',
      'Does not retroactively define KU as WHO or ON as a generic person noun.',
      'First test use is L01 OPI 7 only.',
    ],
  },
  {
    id: 'AUTH-004',
    transliteration: 'NE',
    meaning: {
      pt: 'operador de negação / ausência em uso iniciante governado',
      en: 'negation / absence operator for governed beginner use',
    },
    authority: 'CANDIDATE',
    certainty: 'AUTHORED_PRIMITIVE',
    sourceClass: 'AUTHORING_PROPOSAL',
    historicalRecoveryClaim: false,
    lessons: ['L01'],
    morphology: {
      schema: 'PRIMITIVE_AUTHORED',
      leftState: 'SEMANTICS_DEFINED_BEFORE_FORM_SELECTION',
      rightState: 'NO_RECOVERED_COMPONENTS_CLAIMED',
      productivity: 'CLOSED_LIST_ONLY',
    },
    provenance: [
      'simpleway-hnk/proposals/language/HNK_NE_NEGATION_ABSENCE_PROPOSAL_V1.json',
      'simpleway-hnk/proposals/language/HNK_NEGATION_EXISTENCE_MICROGRAMMAR_V1.json',
      'simpleway-hnk/curriculum/cycle-01/L01-kether/validation/opi-002-negation-candidate-human-batch.v1.json',
    ],
    notes: [
      'New governed primitive; not recovered historical HNK.',
      'First approved course use is NE VAMAKALA for absence of a nickname in L01 OPI 2.',
      'Does not create a HAVE verb and does not define historical HNK negation.',
      'Global productivity is not granted; each broader usage requires separate governance.',
    ],
  },
];

function compileCandidate(raw) {
  const glyphIds = transliterationToGlyphIds(raw.transliteration, { strict: true }).glyphIds.filter((id) => id !== 'SPACE');
  const ipaSegments = glyphIds.map((glyphId) => getGlyph(glyphId).phonemeIpa);
  return Object.freeze({
    ...raw,
    meaning: Object.freeze({ ...raw.meaning }),
    lessons: Object.freeze([...raw.lessons]),
    morphology: Object.freeze({ ...raw.morphology }),
    provenance: Object.freeze([...raw.provenance]),
    notes: Object.freeze([...raw.notes]),
    glyphIds: Object.freeze(glyphIds),
    ipaSegments: Object.freeze(ipaSegments),
    ipa: ipaSegments.join(''),
  });
}

export const HNK_AUTHORED_CANDIDATES = Object.freeze(RAW_AUTHORED_CANDIDATES.map(compileCandidate));
export const HNK_AUTHORED_CANDIDATES_BY_FORM = Object.freeze(
  Object.fromEntries(HNK_AUTHORED_CANDIDATES.map((entry) => [entry.transliteration, entry])),
);

export const HNK_AUTHORED_REGISTRY_STATS = Object.freeze({
  candidates: HNK_AUTHORED_CANDIDATES.length,
  cycle1Candidates: HNK_AUTHORED_CANDIDATES.filter((entry) => entry.lessons.some((lesson) => /^L0[1-7]$/.test(lesson))).length,
});

export function getAuthoredCandidate(value) {
  return typeof value === 'string' ? HNK_AUTHORED_CANDIDATES_BY_FORM[value.trim().toUpperCase()] : undefined;
}

export function validateHnkAuthoredRegistry() {
  const errors = [];
  const recoveredForms = new Set(HNK_MASTER_LEXICON.map((entry) => entry.transliteration));
  const ids = new Set();
  const forms = new Set();

  for (const entry of HNK_AUTHORED_CANDIDATES) {
    if (entry.authority !== 'CANDIDATE') errors.push(`${entry.id} must start at CANDIDATE`);
    if (entry.sourceClass !== 'AUTHORING_PROPOSAL') errors.push(`${entry.id} sourceClass drift`);
    if (entry.historicalRecoveryClaim !== false) errors.push(`${entry.id} must not claim historical recovery`);
    if (ids.has(entry.id)) errors.push(`Duplicate authored id ${entry.id}`);
    if (forms.has(entry.transliteration)) errors.push(`Duplicate authored form ${entry.transliteration}`);
    if (recoveredForms.has(entry.transliteration)) errors.push(`Authored candidate collides with recovered Master Lexicon: ${entry.transliteration}`);
    ids.add(entry.id);
    forms.add(entry.transliteration);
    const roundTrip = transliterationToGlyphIds(entry.transliteration, { strict: true }).glyphIds.filter((id) => id !== 'SPACE');
    if (JSON.stringify(roundTrip) !== JSON.stringify(entry.glyphIds)) errors.push(`${entry.id} HNK40 round-trip drift`);
  }

  const kuvan = HNK_AUTHORED_CANDIDATES_BY_FORM.KUVAN;
  if (!kuvan) errors.push('KUVAN candidate missing');
  else {
    if (JSON.stringify(kuvan.glyphIds) !== JSON.stringify(['G23','G05','G31','G01','G12'])) errors.push('KUVAN glyph sequence drift');
    if (kuvan.morphology.productivity !== 'CLOSED_LIST_ONLY') errors.push('KUVAN productivity gate drift');
    if (!kuvan.lessons.includes('L01')) errors.push('KUVAN L01 binding missing');
  }

  const vala = HNK_AUTHORED_CANDIDATES_BY_FORM.VALA;
  if (!vala) errors.push('VALA candidate missing');
  else {
    if (JSON.stringify(vala.glyphIds) !== JSON.stringify(['G31','G01','G14','G01'])) errors.push('VALA glyph sequence drift');
    if (vala.morphology.productivity !== 'NON_PRODUCTIVE_SINGLE_CANDIDATE') errors.push('VALA productivity gate drift');
    if (!vala.lessons.includes('L01')) errors.push('VALA L01 binding missing');
    if (vala.historicalRecoveryClaim !== false) errors.push('VALA recovery boundary drift');
  }

  const kuon = HNK_AUTHORED_CANDIDATES_BY_FORM.KUON;
  if (!kuon) errors.push('KUON candidate missing');
  else {
    if (JSON.stringify(kuon.glyphIds) !== JSON.stringify(['G23','G05','G04','G12'])) errors.push('KUON glyph sequence drift');
    if (kuon.morphology.productivity !== 'CLOSED_LIST_ONLY') errors.push('KUON productivity gate drift');
    if (kuon.certainty !== 'AUTHORED_DERIVATION_WITH_GATED_COMPONENT') errors.push('KUON gated-component certainty drift');
    if (!kuon.lessons.includes('L01')) errors.push('KUON L01 binding missing');
    if (kuon.historicalRecoveryClaim !== false) errors.push('KUON recovery boundary drift');
  }

  const ne = HNK_AUTHORED_CANDIDATES_BY_FORM.NE;
  if (!ne) errors.push('NE candidate missing');
  else {
    if (JSON.stringify(ne.glyphIds) !== JSON.stringify(['G12','G02'])) errors.push('NE glyph sequence drift');
    if (ne.certainty !== 'AUTHORED_PRIMITIVE') errors.push('NE certainty drift');
    if (ne.morphology.schema !== 'PRIMITIVE_AUTHORED') errors.push('NE formation drift');
    if (ne.morphology.productivity !== 'CLOSED_LIST_ONLY') errors.push('NE productivity gate drift');
    if (!ne.lessons.includes('L01')) errors.push('NE L01 binding missing');
    if (ne.historicalRecoveryClaim !== false) errors.push('NE recovery boundary drift');
  }

  return { ok: errors.length === 0, errors };
}
