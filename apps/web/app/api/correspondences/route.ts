import { createResearch001Registry } from "@hnk/correspondence-registry";
import {
  researchJson,
  researchLabAuthorized,
  researchLabEnabled,
  researchNotFound,
  researchUnauthorized,
} from "../../../lib/research/auth";

type CorrespondenceDecision =
  | "REFERENCE"
  | "CANDIDATE"
  | "CANON"
  | "RESEARCH_ONLY"
  | "EXCLUDE_OPERATIONALLY";

const registry = createResearch001Registry();

export const runtime = "nodejs";

const DECISIONS: readonly CorrespondenceDecision[] = [
  "REFERENCE",
  "CANDIDATE",
  "CANON",
  "RESEARCH_ONLY",
  "EXCLUDE_OPERATIONALLY",
];

export function GET(request: Request): Response {
  if (!researchLabEnabled()) return researchNotFound();
  if (!researchLabAuthorized(request)) return researchUnauthorized();

  const url = new URL(request.url);
  const subject_id = url.searchParams.get("subject_id") ?? undefined;
  const domain = url.searchParams.get("domain") ?? undefined;
  const tradition_id = url.searchParams.get("tradition_id") ?? undefined;
  const rawDecision = url.searchParams.get("decision") ?? undefined;

  if (rawDecision && !DECISIONS.includes(rawDecision as CorrespondenceDecision)) {
    return researchJson({ error: "INVALID_DECISION", allowed: DECISIONS }, 400);
  }

  const decision = rawDecision as CorrespondenceDecision | undefined;

  if (!subject_id && !domain && !tradition_id && !decision) {
    const audit = registry.validate();
    return researchJson({
      registry: "HNK_CORRESPONDENCE_REGISTRY_V1",
      scope: "REFERENCE_ONLY",
      canon_import: "NONE_AUTOMATIC",
      validation: audit,
      coverage: registry.coverage(),
      gaps: registry.gaps,
    });
  }

  const records = registry.query({ subject_id, domain, tradition_id, decision });

  if (subject_id && domain) {
    const comparison = registry.compare(subject_id, domain);
    const resolution = registry.resolve({ subject_id, domain, tradition_id });
    return researchJson({
      registry: "HNK_CORRESPONDENCE_REGISTRY_V1",
      scope: "REFERENCE_ONLY",
      query: { subject_id, domain, tradition_id, decision },
      filtered_count: records.length,
      filtered_records: records,
      comparison,
      resolution,
    });
  }

  return researchJson({
    registry: "HNK_CORRESPONDENCE_REGISTRY_V1",
    scope: "REFERENCE_ONLY",
    query: { subject_id, domain, tradition_id, decision },
    count: records.length,
    records,
  });
}
