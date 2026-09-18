import { releaseVerificationRegistrySummary } from "@hnk/quest-engine";
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
    layer: "HNK_RELEASE_VERIFICATION_REGISTRY_LAB_V1",
    authority: "HNK_AUTHORED_RELEASE_VERIFICATION_REGISTRY",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: releaseVerificationRegistrySummary(),
    boundary: "VERIFICATION_REGISTRY_PRESERVES_REPORT_HISTORY_AND_EXPLICIT_HUMAN_RELEASE_DECISIONS_NOT_TRUTH_READINESS_OR_CANON",
  }, 200, "HNK_RELEASE_VERIFICATION_REGISTRY_PRIVATE");
}
