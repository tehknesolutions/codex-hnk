import { experimentAttestationSummary, experimentProtocolSummary } from "@hnk/quest-engine";
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
    layer: "HNK_EXPERIMENT_PROTOCOL_LAB_V1",
    authority: "HNK_AUTHORED_EXPERIMENT_PROTOCOL",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: experimentProtocolSummary(),
    attestation: experimentAttestationSummary(),
    boundary: "EXPERIMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF",
  }, 200, "HNK_EXPERIMENT_PROTOCOL_PRIVATE");
}
