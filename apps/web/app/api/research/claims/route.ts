import {
  claimDossierSummary,
  evidenceReviewGateSummary,
} from "@hnk/quest-engine";
import {
  researchJson,
  researchLabAuthorized,
  researchLabEnabled,
  researchNotFound,
  researchUnauthorized,
} from "../../../../lib/research/auth";

export const runtime = "nodejs";

export function GET(request: Request): Response {
  if (!researchLabEnabled()) return researchNotFound();
  if (!researchLabAuthorized(request)) return researchUnauthorized();

  return researchJson({
    layer: "HNK_CLAIM_DOSSIER_EVIDENCE_REVIEW_GATE_LAB_V1",
    authority: "HNK_HUMAN_EVIDENCE_REVIEW_GATE",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    dossier: claimDossierSummary(),
    review_gate: evidenceReviewGateSummary(),
    boundary: "HUMAN_REVIEW_MAY_CLASSIFY_CLAIM_STATUS_BUT_CANNOT_AUTO_ESTABLISH_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON",
  }, 200, "HNK_CLAIM_REVIEW_PRIVATE");
}
