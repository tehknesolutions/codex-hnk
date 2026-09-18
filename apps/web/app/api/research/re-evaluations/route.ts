import { claimReevaluationQueueSummary } from "@hnk/quest-engine";
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
    layer: "HNK_CLAIM_REEVALUATION_QUEUE_LAB_V1",
    authority: "HNK_AUTHORED_CLAIM_REEVALUATION_QUEUE",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: claimReevaluationQueueSummary(),
    boundary: "REEVALUATION_QUEUE_DETECTS_EVIDENCE_SNAPSHOT_CHANGE_NOT_NEW_TRUTH_CLASSIFICATION_OR_CANON",
  }, 200, "HNK_CLAIM_REEVALUATION_QUEUE_PRIVATE");
}
