import { getExecutableDays, hnkTreeLevels } from '../../visual-contract/src/tree.mjs';
import { VERIFIED_KNOWLEDGE_LENS_BINDINGS, correspondenceSubjectBinding } from './bindings.mjs';

const freezeStrings = (values) => Object.freeze([...new Set(values.filter(Boolean))].sort());
const reasonStrings = (values = []) => freezeStrings(values.map((item) => typeof item === 'string' ? item : item?.reason ?? item?.id));

const unavailableEvidence = () => ({
  status: 'UNAVAILABLE', coverage_label: null, evidence_count: 0,
  missing_requirements: Object.freeze([]), truth_assessed: false,
  causal_claim_permitted: false, metaphysical_proof_permitted: false,
});
const unavailableCorrespondences = () => Object.freeze({
  status: 'UNAVAILABLE', record_count: 0, domains: Object.freeze([]), traditions: Object.freeze([]),
  gaps: Object.freeze([]), conflicts: Object.freeze([]),
});

function projectCorrespondences({ levelId, registry, bindings, limitations }) {
  const subjectId = correspondenceSubjectBinding(bindings, levelId);
  if (!subjectId || !registry) return unavailableCorrespondences();

  const validation = registry.validate?.();
  if (!validation?.ok) {
    limitations.push('CORRESPONDENCE_REGISTRY_INVALID');
    return Object.freeze({ ...unavailableCorrespondences(), status: 'UNRESOLVED' });
  }

  const records = registry.query?.({ subject_id: subjectId }) ?? [];
  const conflicts = reasonStrings(registry.conflicts?.({ subject_id: subjectId }) ?? []);
  const coverage = registry.coverage?.({ subject_id: subjectId });
  const gaps = reasonStrings(coverage?.gaps ?? []);
  const status = conflicts.length > 0 ? 'UNRESOLVED' : gaps.length > 0 ? 'PARTIAL' : records.length > 0 ? 'CONFIRMED' : 'UNAVAILABLE';

  return Object.freeze({
    status,
    record_count: records.length,
    domains: freezeStrings(records.map((record) => record.domain)),
    traditions: freezeStrings(records.map((record) => record.tradition_id)),
    gaps,
    conflicts,
  });
}

export function projectKnowledgeLens({ level_id, correspondence_registry, bindings = VERIFIED_KNOWLEDGE_LENS_BINDINGS } = {}) {
  const level = hnkTreeLevels.find((candidate) => candidate.id === level_id);
  const limitations = level
    ? ['NO_CONFIRMED_CANON_BINDING', 'NO_CONFIRMED_CLAIM_BINDING', 'NO_CONFIRMED_EVIDENCE_BINDING']
    : ['UNKNOWN_TREE_LEVEL', 'NO_CONFIRMED_CANON_BINDING', 'NO_CONFIRMED_CLAIM_BINDING', 'NO_CONFIRMED_EVIDENCE_BINDING'];

  const hasCorrespondenceBinding = Boolean(level && correspondenceSubjectBinding(bindings, level.id));
  if (!hasCorrespondenceBinding) limitations.push('NO_CONFIRMED_CORRESPONDENCE_BINDING');
  const correspondences = level
    ? projectCorrespondences({ levelId: level.id, registry: correspondence_registry, bindings, limitations })
    : unavailableCorrespondences();

  return Object.freeze({
    subject: Object.freeze(level ? {
      level_id: level.id, label: level.label, day_range: level.dayRange,
      executable_days: getExecutableDays(level.id).length, structural_state: level.state,
    } : {
      level_id: null, label: 'UNAVAILABLE', day_range: null, executable_days: 0, structural_state: 'unavailable',
    }),
    canon: Object.freeze({ status: 'UNAVAILABLE', authority: null, note: null }),
    claims: Object.freeze({ status: 'UNAVAILABLE', count: 0, items: Object.freeze([]) }),
    evidence: Object.freeze(unavailableEvidence()),
    correspondences,
    limitations: Object.freeze(limitations),
  });
}
