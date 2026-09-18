import { deploymentGateRegistrySummary } from "@hnk/quest-engine";
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
    layer: "HNK_DEPLOYMENT_GATE_LAB_V1",
    authority: "HNK_AUTHORED_DEPLOYMENT_GATE_REGISTRY",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: deploymentGateRegistrySummary(),
    boundary: "DEPLOYMENT_GATE_BINDS_EXPLICIT_HUMAN_DEPLOYMENT_AUTHORIZATION_TO_CURRENT_ACCEPTED_RELEASE_STATE_NOT_EXECUTION_READINESS_TRUTH_OR_CANON",
  }, 200, "HNK_DEPLOYMENT_GATE_PRIVATE");
}
