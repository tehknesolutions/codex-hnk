import { claimReevaluationBatchScannerSummary } from "@hnk/quest-engine";
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
    layer: "HNK_CLAIM_REEVALUATION_BATCH_SCANNER_LAB_V1",
    authority: "HNK_AUTHORED_CLAIM_REEVALUATION_BATCH_SCANNER",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: claimReevaluationBatchScannerSummary(),
    boundary: "BATCH_SCANNER_AUTOMATES_CHANGE_DETECTION_COVERAGE_NOT_HUMAN_REVIEW_RECLASSIFICATION_TRUTH_OR_CANON",
  }, 200, "HNK_CLAIM_REEVALUATION_BATCH_SCANNER_PRIVATE");
}
