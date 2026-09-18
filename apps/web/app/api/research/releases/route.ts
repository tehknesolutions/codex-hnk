import { researchReleaseManifestSummary } from "@hnk/quest-engine";
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
    layer: "HNK_RESEARCH_RELEASE_MANIFEST_LAB_V1",
    authority: "HNK_AUTHORED_RESEARCH_RELEASE_MANIFEST",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: researchReleaseManifestSummary(),
    boundary: "RELEASE_MANIFEST_BINDS_RESEARCH_STATE_CODE_CONTRACTS_AND_VALIDATION_EVIDENCE_NOT_TRUTH_AUTHORSHIP_TIME_OR_CANON",
  }, 200, "HNK_RESEARCH_RELEASE_MANIFEST_PRIVATE");
}
