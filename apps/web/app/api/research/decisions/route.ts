import {
  ADMISSION_DECISIONS,
  HNK_VALUES,
  admissionSummary,
  decisionLayerFor,
  queryAdmissionItems,
  validateAdmissionDecisionLayer,
  type AdmissionDecision,
  type HnkValue,
} from "../../../../lib/research/admission";
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

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const item_id = url.searchParams.get("item_id") ?? undefined;
  const rawDecision = url.searchParams.get("decision") ?? undefined;
  const rawValue = url.searchParams.get("hnk_value") ?? undefined;

  if (rawDecision && !ADMISSION_DECISIONS.includes(rawDecision as AdmissionDecision)) {
    return researchJson({ error: "INVALID_DECISION", allowed: ADMISSION_DECISIONS }, 400, "CODEX_DECISION_LAYER");
  }

  if (rawValue && !HNK_VALUES.includes(rawValue as HnkValue)) {
    return researchJson({ error: "INVALID_HNK_VALUE", allowed: HNK_VALUES }, 400, "CODEX_DECISION_LAYER");
  }

  const decision = rawDecision as AdmissionDecision | undefined;
  const hnk_value = rawValue as HnkValue | undefined;
  const validation = validateAdmissionDecisionLayer();

  if (!q && !item_id && !decision && !hnk_value) {
    return researchJson({
      layer: "HNK_CODEX_DECISION_LAYER_V1",
      protocol: "CODEX_ADMISSION_PROTOCOL_V1",
      canon_import: "NONE_AUTOMATIC",
      archive_policy: "PRESERVE_RESEARCH_RECORD",
      validation,
      summary: admissionSummary(),
      filters: {
        decisions: ADMISSION_DECISIONS,
        hnk_values: HNK_VALUES,
      },
    }, 200, "CODEX_DECISION_LAYER");
  }

  const matched = queryAdmissionItems({ q, item_id, decision, hnk_value });
  const records = matched.map((item) => ({
    ...item,
    decision_layer: decisionLayerFor(item),
  }));

  return researchJson({
    layer: "HNK_CODEX_DECISION_LAYER_V1",
    protocol: "CODEX_ADMISSION_PROTOCOL_V1",
    canon_import: "NONE_AUTOMATIC",
    archive_policy: "PRESERVE_RESEARCH_RECORD",
    query: { q, item_id, decision, hnk_value },
    count: records.length,
    records,
  }, 200, "CODEX_DECISION_LAYER");
}
