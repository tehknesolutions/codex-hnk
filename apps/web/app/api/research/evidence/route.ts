import { evidenceLedgerSummary } from "@hnk/quest-engine";
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
    layer: "HNK_EVIDENCE_LEDGER_LAB_V1",
    authority: "HNK_AUTHORED_EVIDENCE_LEDGER",
    access: "PRIVATE_USER_CONTROLLED_FILE_ONLY",
    persistence: "NONE_AUTOMATIC",
    summary: evidenceLedgerSummary(),
    boundary: "EVIDENCE_LEDGER_TRACKS_COVERAGE_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF",
  }, 200, "HNK_EVIDENCE_LEDGER_PRIVATE");
}
