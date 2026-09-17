import { HNK_VALUES, type HnkValue } from "../../../../lib/research/admission";
import {
  humanGateSummary,
  queryHumanGateQueue,
  validateHumanGateRuntime,
} from "../../../../lib/research/human-gate";
import {
  researchJson,
  researchLabAuthorized,
  researchLabEnabled,
  researchNotFound,
  researchUnauthorized,
} from "../../../../lib/research/auth";

export const runtime = "nodejs";

const STATES = ["PENDING", "DECIDED", "ALL"] as const;
type HumanGateState = (typeof STATES)[number];

export function GET(request: Request): Response {
  if (!researchLabEnabled()) return researchNotFound();
  if (!researchLabAuthorized(request)) return researchUnauthorized();

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const item_id = url.searchParams.get("item_id") ?? undefined;
  const rawValue = url.searchParams.get("hnk_value") ?? undefined;
  const rawState = url.searchParams.get("state") ?? "PENDING";

  if (rawValue && !HNK_VALUES.includes(rawValue as HnkValue)) {
    return researchJson({ error: "INVALID_HNK_VALUE", allowed: HNK_VALUES }, 400, "HNK_HUMAN_GATE");
  }
  if (!STATES.includes(rawState as HumanGateState)) {
    return researchJson({ error: "INVALID_HUMAN_GATE_STATE", allowed: STATES }, 400, "HNK_HUMAN_GATE");
  }

  const hnk_value = rawValue as HnkValue | undefined;
  const state = rawState as HumanGateState;
  const validation = validateHumanGateRuntime();
  const summary = humanGateSummary();

  if (!q && !item_id && !hnk_value && state === "PENDING") {
    const records = queryHumanGateQueue({ state });
    return researchJson({
      layer: "HNK_HUMAN_GATE_V1",
      protocol: "HNK_HUMAN_GATE_PROTOCOL_V1",
      canon_import: "EXPLICIT_HUMAN_APPROVAL_ONLY",
      machine_autopromotion: false,
      validation,
      summary,
      query: { state },
      count: records.length,
      records,
    }, 200, "HNK_HUMAN_GATE");
  }

  const records = queryHumanGateQueue({ q, item_id, hnk_value, state });
  return researchJson({
    layer: "HNK_HUMAN_GATE_V1",
    protocol: "HNK_HUMAN_GATE_PROTOCOL_V1",
    canon_import: "EXPLICIT_HUMAN_APPROVAL_ONLY",
    machine_autopromotion: false,
    validation,
    summary,
    query: { q, item_id, hnk_value, state },
    count: records.length,
    records,
  }, 200, "HNK_HUMAN_GATE");
}
