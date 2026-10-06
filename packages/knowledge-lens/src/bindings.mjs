// Intentionally empty until repository identifiers prove a cross-domain join.
// Presence of related labels or path values is not sufficient authority.
export const VERIFIED_KNOWLEDGE_LENS_BINDINGS = Object.freeze({});

export function correspondenceSubjectBinding(bindings, levelId) {
  const binding = bindings?.[levelId];
  const subjectId = binding?.correspondence_subject_id;
  return typeof subjectId === 'string' && subjectId.length > 0 ? subjectId : null;
}
