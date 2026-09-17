import { replicationRegistrySummary } from "@hnk/quest-engine";
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
    layer: "HNK_REPLICATION_REGISTRY_LAB_V1",
    authority: "HNK_AUTHORED_REPLICATION_REGISTRY",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: replicationRegistrySummary(),
    boundary: "REPLICATION_REGISTRY_DESCRIBES_REPEATABILITY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF",
  }, 200, "HNK_REPLICATION_REGISTRY_PRIVATE");
}
