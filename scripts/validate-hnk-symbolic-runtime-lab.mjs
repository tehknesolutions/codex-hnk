import fs from "node:fs";
import { symbolicRuntimeSummary } from "@hnk/symbolic-runtime-contract";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const issues = [];
const page = read("apps/web/app/research/runtime/page.tsx");
const client = read("apps/web/app/research/runtime/SymbolicRuntimeLab.tsx");
const route = read("apps/web/app/api/research/runtime/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const css = read("apps/web/app/research/runtime/runtime.module.css");
const summary = symbolicRuntimeSummary();

if (!summary.canon_contract_ok) issues.push("symbolic runtime upstream canon contract is invalid");
if (summary.canon_dependencies !== 16) issues.push(`expected 16 canon dependencies, found ${summary.canon_dependencies}`);
if (summary.events !== 13) issues.push(`expected 13 runtime events, found ${summary.events}`);
if (summary.metaphysical_efficacy_claimed !== false) issues.push("runtime must not claim metaphysical efficacy as software fact");
if (summary.evidence_scoped_results !== true) issues.push("runtime results must remain evidence scoped");

if (!page.includes("researchLabEnabled()")) issues.push("runtime page must fail closed when research lab is disabled");
if (!page.includes("notFound()")) issues.push("runtime page must use notFound fail-closed behavior");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("runtime page must remain noindex/nofollow");

if (!route.includes("researchLabEnabled()")) issues.push("runtime API must check researchLabEnabled");
if (!route.includes("researchLabAuthorized(request)")) issues.push("runtime API must require Bearer authorization");
if (!route.includes('persistence: "NONE"')) issues.push("runtime API must declare no persistence");
if (!route.includes('execution: "CLIENT_SIDE_DETERMINISTIC_REDUCER"')) issues.push("runtime API must declare client-side deterministic execution");
if (!route.includes('"RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF"')) issues.push("runtime API must expose epistemic boundary");

if (!client.includes('from "@hnk/quest-engine"')) issues.push("runtime client must consume the shared Quest Engine adapter");
if (!client.includes("createSymbolicRuntimeSession")) issues.push("runtime client must create shared-contract sessions");
if (!client.includes("applySymbolicRuntimeEvent")) issues.push("runtime client must use shared deterministic reducer");
if (!client.includes('Authorization: `Bearer ${token}`')) issues.push("runtime client must authenticate private handshake with Bearer token");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("runtime lab must not persist session data in browser storage");
if (!client.includes("Observação bruta") || !client.includes("Interpretação opcional")) issues.push("runtime UI must keep observation and interpretation visibly separate");
if (!client.includes("evidenceScope")) issues.push("runtime UI must expose evidence scope");
if (!client.includes("claim_boundary")) issues.push("runtime UI must render result claim boundary");
if (!client.includes('event("SPECIFY"') || !client.includes('event("CONSTRUCT"') || !client.includes('event("BIND"') || !client.includes('event("ACTIVATE"') || !client.includes('event("OBSERVE"') || !client.includes('event("FEEDBACK"') || !client.includes('event("COMPLETE"')) issues.push("runtime UI missing required guided lifecycle events");

if (!hub.includes('href="/research/runtime"')) issues.push("Research Lab hub must link Symbolic Runtime Lab");
if (!hub.includes("SYMBOLIC RUNTIME")) issues.push("Research Lab pipeline must include symbolic runtime");
if (!css.includes(".workspace") || !css.includes("@media")) issues.push("runtime lab must include responsive workspace styling");

if (issues.length) {
  console.error("HNK_SYMBOLIC_RUNTIME_LAB_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_SYMBOLIC_RUNTIME_LAB_V1_PASS");
console.log(JSON.stringify({
  private: true,
  persistence: "NONE",
  canon_dependencies: summary.canon_dependencies,
  runtime_events: summary.events,
  client_side_reducer: true,
  evidence_scoped_results: summary.evidence_scoped_results,
  metaphysical_efficacy_claimed: summary.metaphysical_efficacy_claimed,
}, null, 2));
