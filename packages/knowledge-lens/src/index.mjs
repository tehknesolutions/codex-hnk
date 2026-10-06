const levels = [
  { id: 'keter', label: 'KETHER', day_range: '001—036', structural_state: 'acquired', executable_days: 36 },
  { id: 'chokhmah', label: 'CHOKHMAH', day_range: '037—072', structural_state: 'active', executable_days: 36 },
  { id: 'binah', label: 'BINAH', day_range: '073+', structural_state: 'dormant', executable_days: 0 },
];

const unavailableEvidence = () => ({
  status: 'UNAVAILABLE',
  coverage_label: null,
  evidence_count: 0,
  missing_requirements: Object.freeze([]),
  truth_assessed: false,
  causal_claim_permitted: false,
  metaphysical_proof_permitted: false,
});

export function projectKnowledgeLens({ level_id } = {}) {
  const level = levels.find((candidate) => candidate.id === level_id);
  const limitations = level
    ? ['NO_CONFIRMED_CANON_BINDING', 'NO_CONFIRMED_CLAIM_BINDING', 'NO_CONFIRMED_EVIDENCE_BINDING', 'NO_CONFIRMED_CORRESPONDENCE_BINDING']
    : ['UNKNOWN_TREE_LEVEL', 'NO_CONFIRMED_CANON_BINDING', 'NO_CONFIRMED_CLAIM_BINDING', 'NO_CONFIRMED_EVIDENCE_BINDING', 'NO_CONFIRMED_CORRESPONDENCE_BINDING'];

  return Object.freeze({
    subject: Object.freeze(level ? {
      level_id: level.id,
      label: level.label,
      day_range: level.day_range,
      executable_days: level.executable_days,
      structural_state: level.structural_state,
    } : {
      level_id: null,
      label: 'UNAVAILABLE',
      day_range: null,
      executable_days: 0,
      structural_state: 'unavailable',
    }),
    canon: Object.freeze({ status: 'UNAVAILABLE', authority: null, note: null }),
    claims: Object.freeze({ status: 'UNAVAILABLE', count: 0, items: Object.freeze([]) }),
    evidence: Object.freeze(unavailableEvidence()),
    correspondences: Object.freeze({ status: 'UNAVAILABLE', record_count: 0, domains: Object.freeze([]), traditions: Object.freeze([]), gaps: Object.freeze([]), conflicts: Object.freeze([]) }),
    limitations: Object.freeze(limitations),
  });
}
