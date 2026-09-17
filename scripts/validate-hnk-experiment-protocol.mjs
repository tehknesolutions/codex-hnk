import fs from "node:fs";
import {
  addExperimentArtifact,
  createExperimentProtocol,
  experimentProtocolSummary,
  finalizeExperimentProtocol,
  validateExperimentProtocol,
} from "@hnk/experiment-protocol";
import { createRuntimeSessionArtifact } from "@hnk/runtime-session-artifact";
import { applySymbolicRuntimeEvent, createSymbolicRuntimeSession } from "@hnk/symbolic-runtime-contract";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function artifact(sessionId, resultState) {
  const createdAt = "2026-09-17T19:00:00Z";
  let session = createSymbolicRuntimeSession({
    session_id: sessionId,
    created_at: createdAt,
    intention: "Validar Experiment Protocol V1.",
    current_state: "BASELINE",
    target_state: "TARGET",
  });
  const apply = (type, payload, minute) => {
    session = applySymbolicRuntimeEvent(session, {
      event_id: `${sessionId}-${type.toLowerCase()}`,
      type,
      at: `2026-09-17T19:${String(minute).padStart(2, "0")}:00Z`,
      ...(payload ? { payload } : {}),
    });
  };
  apply("SPECIFY", { path_id: "PATH-VALIDATOR", from_state: "BASELINE", to_state: "TARGET", constraints: ["record only"] }, 1);
  apply("CONSTRUCT", { construction_id: `${sessionId}-construction`, steps: [{ step_id: "step-1", action: "execute" }] }, 2);
  apply("BIND", { vessel: { vessel_id: `${sessionId}-vessel`, context_type: "VALIDATOR", context_ref: "LOCAL" } }, 3);
  apply("ACTIVATE", undefined, 4);
  apply("OBSERVE", { observation_id: `${sessionId}-observation`, raw: `raw ${sessionId}` }, 5);
  apply("FEEDBACK", { feedback_id: `${sessionId}-feedback`, assessment: "recorded", next_action: "CLOSE" }, 6);
  apply("COMPLETE", { result_state: resultState, evidence_scope: "SELF_REPORTED", evidence: [] }, 7);
  return createRuntimeSessionArtifact({
    session,
    exported_at: "2026-09-17T19:10:00Z",
    initial: { session_id: sessionId, created_at: createdAt, intention: "Validar Experiment Protocol V1.", current_state: "BASELINE", target_state: "TARGET" },
  });
}

const summary = experimentProtocolSummary();
if (summary.protocol_id !== "HNK_EXPERIMENT_PROTOCOL_V1") issues.push("unexpected experiment protocol id");
if (summary.preregistration_required !== true) issues.push("preregistration must be required");
if (summary.control_required !== true) issues.push("control must be required");
if (summary.deterministic_artifact_replay_required !== true) issues.push("artifact replay must be required");
if (summary.causal_claim_permitted !== false) issues.push("causal claims must not be granted by protocol");
if (summary.metaphysical_proof_permitted !== false) issues.push("metaphysical proof must not be granted by protocol");

let protocol = createExperimentProtocol({
  experiment_id: "VALIDATOR-EXP-001",
  created_at: "2026-09-17T18:00:00Z",
  locked_at: "2026-09-17T18:00:00Z",
  title: "Validator experiment",
  question: "Do the recorded conditions differ?",
  hypothesis: "They may differ descriptively.",
  plan: {
    observed_variables: ["result_state"],
    controlled_variables: ["runtime contract"],
    intervention: "condition only in experiment role",
    control_sessions_required: 1,
    experimental_sessions_required: 1,
    completion_criteria: ["one valid replaying artifact per role"],
    exclusion_criteria: ["replay mismatch"],
  },
});
if (protocol.status !== "PREREGISTERED" || protocol.sessions.length !== 0) issues.push("protocol must begin preregistered and empty");

protocol = addExperimentArtifact(protocol, { assignment_id: "CONTROL-1", role: "CONTROL", added_at: "2026-09-17T20:00:00Z", artifact: artifact("control-session", "CONTROL_RESULT") });
if (protocol.status !== "IN_PROGRESS") issues.push(`expected IN_PROGRESS after control, found ${protocol.status}`);
protocol = addExperimentArtifact(protocol, { assignment_id: "EXPERIMENT-1", role: "EXPERIMENT", added_at: "2026-09-17T20:30:00Z", artifact: artifact("experiment-session", "EXPERIMENT_RESULT") });
if (protocol.status !== "READY_TO_FINALIZE") issues.push(`expected READY_TO_FINALIZE, found ${protocol.status}`);

protocol = finalizeExperimentProtocol(protocol, {
  completed_at: "2026-09-17T21:00:00Z",
  descriptive_summary: "The two stored result_state values differ.",
  interpretation: "The difference is descriptive and does not establish cause.",
  limitations: ["minimal sample", "self-reported evidence scope"],
});
const validation = validateExperimentProtocol(protocol);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `final protocol: ${issue}`));
if (protocol.report?.causal_claim_permitted !== false) issues.push("completed report must keep causal_claim_permitted false");
if (protocol.report?.metaphysical_proof_permitted !== false) issues.push("completed report must keep metaphysical_proof_permitted false");

const page = read("apps/web/app/research/experiments/page.tsx");
const client = read("apps/web/app/research/experiments/ExperimentProtocolLab.tsx");
const route = read("apps/web/app/api/research/experiments/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const questAdapter = read("packages/quest-engine/src/experiment-protocol.ts");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Experiment Lab page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Experiment Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Experiment API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Experiment API must declare no automatic persistence");
if (!client.includes("createExperimentProtocol")) issues.push("Experiment Lab must preregister through shared contract");
if (!client.includes("addExperimentArtifact")) issues.push("Experiment Lab must admit artifacts through shared contract");
if (!client.includes("finalizeExperimentProtocol")) issues.push("Experiment Lab must finalize through shared contract");
if (!client.includes('importArtifact(event, "CONTROL")') || !client.includes('importArtifact(event, "EXPERIMENT")')) issues.push("Experiment Lab must expose control and experiment roles");
if (!client.includes("Resumo descritivo") || !client.includes("Interpretação")) issues.push("Experiment Lab must visibly separate descriptive report and interpretation");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Experiment Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/experiments"')) issues.push("Research hub must link Experiment Lab");
if (!hub.includes("PREREGISTERED EXPERIMENT")) issues.push("Research pipeline must include preregistered experiment stage");
if (!questAdapter.includes('from "@hnk/experiment-protocol"')) issues.push("Quest Engine must delegate experiment protocol to shared package");

if (issues.length) {
  console.error("HNK_EXPERIMENT_PROTOCOL_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_EXPERIMENT_PROTOCOL_V1_PASS");
console.log(JSON.stringify({
  protocol_id: summary.protocol_id,
  preregistration_required: summary.preregistration_required,
  roles: summary.roles,
  completed_status: protocol.status,
  sessions: protocol.sessions.length,
  server_persistence: summary.server_persistence,
  browser_persistence: summary.browser_persistence,
  causal_claim_permitted: summary.causal_claim_permitted,
  metaphysical_proof_permitted: summary.metaphysical_proof_permitted,
}, null, 2));
