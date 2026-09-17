import { timingSafeEqual } from "node:crypto";

export const RESEARCH_LAB_CACHE_CONTROL = "private, no-store";

function secureEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function researchLabEnabled(): boolean {
  return process.env.HNK_RESEARCH_LAB_ENABLED === "true";
}

export function researchLabAuthorized(request: Request): boolean {
  if (!researchLabEnabled()) return false;

  const configuredToken = process.env.HNK_RESEARCH_LAB_TOKEN;
  if (!configuredToken) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  return secureEqual(authorization.slice(7), configuredToken);
}

export function researchNotFound(): Response {
  return new Response(null, {
    status: 404,
    headers: { "Cache-Control": RESEARCH_LAB_CACHE_CONTROL },
  });
}

export function researchUnauthorized(): Response {
  return new Response(null, {
    status: 401,
    headers: {
      "Cache-Control": RESEARCH_LAB_CACHE_CONTROL,
      "WWW-Authenticate": 'Bearer realm="HNK Research Lab"',
    },
  });
}

export function researchJson(
  body: unknown,
  status = 200,
  dataScope = "REFERENCE_ONLY",
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": RESEARCH_LAB_CACHE_CONTROL,
      "X-HNK-Data-Scope": dataScope,
      "X-HNK-Canon-Import": "NONE_AUTOMATIC",
    },
  });
}
