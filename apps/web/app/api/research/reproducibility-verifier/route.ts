import { reproducibilityVerifierSummary } from "@hnk/quest-engine";
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
    layer: "HNK_REPRODUCIBILITY_VERIFIER_LAB_V1",
    authority: "HNK_AUTHORED_REPRODUCIBILITY_VERIFIER",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: reproducibilityVerifierSummary(),
    boundary: "VERIFIER_CHECKS_MANIFEST_BOUND_STATE_AGAINST_OBSERVED_PROJECT_STATE_NOT_TRUTH_AUTHORSHIP_TIME_READINESS_OR_CANON",
  }, 200, "HNK_REPRODUCIBILITY_VERIFIER_PRIVATE");
}
