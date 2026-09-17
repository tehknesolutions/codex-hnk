import { timingSafeEqual } from "node:crypto";
import { createResearch001Registry } from "@hnk/correspondence-registry";

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

function secureEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function authorized(request: Request): boolean {
  if (process.env.HNK_RESEARCH_LAB_ENABLED !== "true") return false;
  const configuredToken = process.env.HNK_RESEARCH_LAB_TOKEN;
  if (!configuredToken) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;
  return secureEqual(authorization.slice(7), configuredToken);
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-HNK-Data-Scope": "REFERENCE_ONLY",
      "X-HNK-Canon-Import": "NONE_AUTOMATIC",
    },
  });
}

export function GET(request: Request): Response {
  if (process.env.HNK_RESEARCH_LAB_ENABLED !== "true") {
    return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }

  if (!authorized(request)) {
    return new Response(null, {
      status: 401,
      headers: {
        "Cache-Control": "private, no-store",
        "WWW-Authenticate": "Bearer realm=\"HNK Research Lab\"",
      },
    });
  }

  const url = new URL(request.url);
  const subject_id = url.searchParams.get("subject_id") ?? undefined;
  const domain = url.searchParams.get("domain") ?? undefined;
  const tradition_id = url.searchParams.get("tradition_id") ?? undefined;
  const rawDecision = url.searchParams.get("decision") ?? undefined;

  if (rawDecision && !DECISIONS.includes(rawDecision as CorrespondenceDecision)) {
    return json({ error: "INVALID_DECISION", allowed: DECISIONS }, 400);
  }

  const decision = rawDecision as CorrespondenceDecision | undefined;

  if (!subject_id && !domain && !tradition_id && !decision) {
    const audit = registry.validate();
    return json({
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
    return json({
      registry: "HNK_CORRESPONDENCE_REGISTRY_V1",
      scope: "REFERENCE_ONLY",
      query: { subject_id, domain, tradition_id, decision },
      filtered_count: records.length,
      filtered_records: records,
      comparison,
      resolution,
    });
  }

  return json({
    registry: "HNK_CORRESPONDENCE_REGISTRY_V1",
    scope: "REFERENCE_ONLY",
    query: { subject_id, domain, tradition_id, decision },
    count: records.length,
    records,
  });
}
