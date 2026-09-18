import { workspaceSnapshotRegistrySummary } from "@hnk/quest-engine";
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
    layer: "HNK_WORKSPACE_SNAPSHOT_REGISTRY_LAB_V1",
    authority: "HNK_AUTHORED_WORKSPACE_SNAPSHOT_REGISTRY",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: workspaceSnapshotRegistrySummary(),
    boundary: "SNAPSHOT_REGISTRY_CATALOGS_CHECKPOINT_LINEAGE_AND_HEAD_POINTER_NOT_TRUTH_REVIEW_DECISION_OR_CANON",
  }, 200, "HNK_WORKSPACE_SNAPSHOT_REGISTRY_PRIVATE");
}
