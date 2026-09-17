import { symbolicRuntimeSummary } from "@hnk/quest-engine";
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

  const summary = symbolicRuntimeSummary();

  return researchJson({
    layer: "HNK_SYMBOLIC_RUNTIME_LAB_V1",
    authority: "HNK_AUTHORED_CANON_BACKED_RUNTIME",
    access: "PRIVATE_EPHEMERAL_CLIENT_SESSION",
    persistence: "NONE",
    execution: "CLIENT_SIDE_DETERMINISTIC_REDUCER",
    summary,
    boundary: "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF",
  }, 200, "HNK_RUNTIME_EPHEMERAL");
}
