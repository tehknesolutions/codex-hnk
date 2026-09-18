import { researchArtifactLibrarySummary } from "@hnk/quest-engine";
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
    layer: "HNK_RESEARCH_ARTIFACT_LIBRARY_LAB_V1",
    authority: "HNK_AUTHORED_RESEARCH_ARTIFACT_LIBRARY",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: researchArtifactLibrarySummary(),
    boundary: "ARTIFACT_LIBRARY_CATALOGS_VALIDATED_RESEARCH_SNAPSHOTS_WITHOUT_INTERPRETING_TRUTH_RELEVANCE_OR_CANON",
  }, 200, "HNK_RESEARCH_ARTIFACT_LIBRARY_PRIVATE");
}
