import {
  CANON_REGISTRY_KINDS,
  canonRegistrySummary,
  queryCanonRegistry,
  validateCanonRegistry,
  type CanonRegistryKind,
} from "../../../../lib/research/canon-registry";
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
  const source_item_id = url.searchParams.get("source_item_id") ?? undefined;
  const rawKind = url.searchParams.get("kind") ?? undefined;

  if (rawKind && !CANON_REGISTRY_KINDS.includes(rawKind as CanonRegistryKind)) {
    return researchJson({ error: "INVALID_CANON_KIND", allowed: CANON_REGISTRY_KINDS }, 400, "HNK_CANON_READ_ONLY");
  }

  const kind = rawKind as CanonRegistryKind | undefined;
  const validation = validateCanonRegistry();
  const summary = canonRegistrySummary();
  const records = queryCanonRegistry({ q, kind, source_item_id });

  return researchJson({
    layer: "HNK_CANON_REGISTRY_V1",
    authority: "HNK_AUTHORED",
    access: "READ_ONLY",
    validation,
    summary,
    query: { q, kind, source_item_id },
    count: records.length,
    records,
  }, 200, "HNK_CANON_READ_ONLY");
}
