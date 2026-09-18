import { deploymentExecutionReceiptSummary } from "@hnk/quest-engine";
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
    layer: "HNK_DEPLOYMENT_EXECUTION_RECEIPT_LAB_V1",
    authority: "HNK_AUTHORED_DEPLOYMENT_EXECUTION_RECEIPT",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: deploymentExecutionReceiptSummary(),
    boundary: "DEPLOYMENT_RECEIPT_ATTESTS_RECORDED_EXECUTION_METADATA_AGAINST_CURRENT_HUMAN_AUTHORIZATION_NOT_PROVIDER_SIGNATURE_READINESS_TRUTH_OR_CANON",
  }, 200, "HNK_DEPLOYMENT_EXECUTION_RECEIPT_PRIVATE");
}
