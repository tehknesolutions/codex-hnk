import { reviewedClaimRegistrySummary } from "@hnk/quest-engine";
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
    layer: "HNK_REVIEWED_CLAIM_REGISTRY_LAB_V1",
    authority: "HNK_AUTHORED_REVIEWED_CLAIM_REGISTRY",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: reviewedClaimRegistrySummary(),
    boundary: "REVIEWED_CLAIM_REGISTRY_INDEXES_HUMAN_REVIEW_CLASSIFICATIONS_NOT_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON",
  }, 200, "HNK_REVIEWED_CLAIM_REGISTRY_PRIVATE");
}
