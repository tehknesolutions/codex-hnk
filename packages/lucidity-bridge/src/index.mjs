import { validateClaimDossier } from '@hnk/claim-dossier';
import { validateEvidenceReviewGate, verifyEvidenceReviewGate } from '@hnk/evidence-review-gate';
import { assertLucidityRecord, createLucidityRecord } from '@hnk/lucidity-contract';
import { createLucidityTransition } from '@hnk/lucidity-telemetry';

export const HNK_LUCIDITY_BRIDGE_ID = 'HNK_LUCIDITY_EVIDENCE_BRIDGE_V1';

function ref(kind, id, digest = null) { return Object.freeze({ kind, id, ...(digest ? { digest } : {}) }); }

export function bridgeClaimDossierToLucidity(dossier, options = {}) {
  const validation = validateClaimDossier(dossier);
  if (!validation.ok) throw new Error(`invalid claim dossier: ${validation.issues.join('; ')}`);
  const evidenceRefs = dossier.evidence_links.map((link) => ref('CLAIM_EVIDENCE_LINK', link.link_id, link.metric_signature_digest));
  const record = createLucidityRecord({ subjectId: dossier.claim_id, subjectType: 'claim', state: evidenceRefs.length > 0 ? 'EVIDENCE_ATTACHED' : 'SOURCE_BACKED', axes: options.axes ?? ['DOUBT', 'PROVE'], sourceRefs: [ref('CLAIM_DOSSIER', dossier.claim_id, dossier.dossier_digest)], evidenceRefs, provenance: { bridgeId: HNK_LUCIDITY_BRIDGE_ID, dossierAuthority: dossier.authority, automaticTruthInference: dossier.automatic_truth_inference, automaticCanonPromotion: dossier.automatic_canon_promotion } });
  assertLucidityRecord(record); return record;
}

export function bridgeHumanReviewToLucidity(dossier, gate, options = {}) {
  const gateValidation = validateEvidenceReviewGate(gate);
  if (!gateValidation.ok) throw new Error(`invalid evidence review gate: ${gateValidation.issues.join('; ')}`);
  const binding = verifyEvidenceReviewGate(gate, dossier);
  if (!binding.ok) throw new Error(`review gate mismatch: ${binding.issues.join('; ')}`);
  const base = bridgeClaimDossierToLucidity(dossier, options);
  if (gate.status !== 'REVIEWED' || gate.review?.human_decision !== true) return base;
  const record = createLucidityRecord({ ...base, state: 'REVIEWED', reviewRefs: [ref('HUMAN_EVIDENCE_REVIEW', gate.claim_id, gate.gate_digest)], provenance: { ...base.provenance, humanDecision: true, reviewOutcome: gate.review.outcome, machineCanDecide: gate.machine_can_decide, automaticCanonPromotion: gate.automatic_canon_promotion } });
  assertLucidityRecord(record); return record;
}

export function attachExplicitCanonDecision(record, decision) {
  assertLucidityRecord(record);
  if (record.state !== 'REVIEWED') throw new Error('explicit canon decision requires REVIEWED lucidity state');
  if (!decision || decision.explicitHumanDecision !== true) throw new Error('explicit canon decision requires explicitHumanDecision=true');
  if (!decision.canonRef) throw new Error('explicit canon decision requires canonRef');
  if (!['APPROVE', 'REJECT'].includes(decision.outcome)) throw new Error('canon outcome must be APPROVE or REJECT');
  const next = createLucidityRecord({ ...record, state: decision.outcome === 'APPROVE' ? 'CANON_APPROVED' : 'CANON_REJECTED', canonRefs: [decision.canonRef], provenance: { ...record.provenance, canonDecisionBy: decision.decidedBy ?? null, canonDecisionAt: decision.decidedAt ?? null, canonDecisionExplicit: true } });
  assertLucidityRecord(next); return next;
}

function eventMeta(meta, fallbackActor) {
  if (!meta?.eventId || !meta?.occurredAt) throw new Error('telemetry eventId and occurredAt are required');
  return { eventId: meta.eventId, actorId: meta.actorId ?? fallbackActor, occurredAt: meta.occurredAt, causationId: meta.causationId ?? null, correlationId: meta.correlationId ?? null };
}

export function transitionClaimDossierToLucidity(previousRecord, dossier, options = {}, telemetry) {
  const next = bridgeClaimDossierToLucidity(dossier, options);
  const meta = eventMeta(telemetry, dossier.authored_by ?? 'UNKNOWN');
  const event = createLucidityTransition({ ...meta, subjectId: next.subjectId, from: previousRecord, to: next, reason: telemetry.reason ?? 'Claim dossier bridged to Lucidity.', evidenceRefs: next.evidenceRefs });
  return Object.freeze({ record: next, event });
}

export function transitionHumanReviewToLucidity(previousRecord, dossier, gate, options = {}, telemetry) {
  const next = bridgeHumanReviewToLucidity(dossier, gate, options);
  if (next.state === previousRecord.state) return Object.freeze({ record: next, event: null });
  const meta = eventMeta(telemetry, gate.review?.reviewer ?? 'HUMAN_REVIEWER');
  const event = createLucidityTransition({ ...meta, subjectId: next.subjectId, from: previousRecord, to: next, reason: telemetry.reason ?? 'Human evidence review changed Lucidity state.', reviewRefs: next.reviewRefs });
  return Object.freeze({ record: next, event });
}

export function transitionExplicitCanonDecision(previousRecord, decision, telemetry) {
  const next = attachExplicitCanonDecision(previousRecord, decision);
  const meta = eventMeta(telemetry, decision.decidedBy ?? 'HUMAN_CANON_AUTHORITY');
  const event = createLucidityTransition({ ...meta, subjectId: next.subjectId, from: previousRecord, to: next, reason: telemetry.reason ?? 'Explicit human canon decision changed Lucidity state.', canonRefs: next.canonRefs });
  return Object.freeze({ record: next, event });
}
