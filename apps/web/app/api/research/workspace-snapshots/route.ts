import { researchWorkspaceSnapshotSummary } from "@hnk/quest-engine";
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
    layer: "HNK_RESEARCH_WORKSPACE_SNAPSHOT_LAB_V1",
    authority: "HNK_AUTHORED_RESEARCH_WORKSPACE_SNAPSHOT",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: researchWorkspaceSnapshotSummary(),
    boundary: "WORKSPACE_SNAPSHOT_FREEZES_RESEARCH_STATE_NOT_TRUTH_REVIEW_DECISION_OR_CANON",
  }, 200, "HNK_RESEARCH_WORKSPACE_SNAPSHOT_PRIVATE");
}
