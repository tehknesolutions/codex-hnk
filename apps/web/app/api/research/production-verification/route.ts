import { productionVerificationRegistrySummary } from "@hnk/quest-engine";
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
    layer: "HNK_PRODUCTION_VERIFICATION_LAB_V1",
    authority: "HNK_AUTHORED_PRODUCTION_VERIFICATION_REGISTRY",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: productionVerificationRegistrySummary(),
    boundary: "PRODUCTION_REGISTRY_PRESERVES_DEPLOYMENT_RECEIPTS_POST_DEPLOYMENT_OBSERVATIONS_AND_EXPLICIT_HUMAN_PRODUCTION_DECISIONS_NOT_GLOBAL_READINESS_TRUTH_OR_CANON",
  }, 200, "HNK_PRODUCTION_VERIFICATION_PRIVATE");
}
