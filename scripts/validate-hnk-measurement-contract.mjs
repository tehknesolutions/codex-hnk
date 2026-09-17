import fs from "node:fs";
import {
  HNK_MEASUREMENT_CLAIM_BOUNDARY,
  addMeasurementRecord,
  createMeasurementContract,
  measurementContractSummary,
  measurementDescriptiveSummary,
  measurementMatrix,
  validateMeasurementContract,
} from "@hnk/measurement-contract";
import { addExperimentArtifact, createExperimentProtocol } from "@hnk/experiment-protocol";
import { createRuntimeSessionArtifact } from "@hnk/runtime-session-artifact";
import { applySymbolicRuntimeEvent, createSymbolicRuntimeSession } from "@hnk/symbolic-runtime-contract";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function artifact(sessionId, resultState) {
  const createdAt = "2026-09-17T19:00:00Z";
  let session = createSymbolicRuntimeSession({ session_id: sessionId, created_at: createdAt, intention: "Measurement validator", current_state: "BASELINE", target_state: "TARGET" });
  const apply = (type, payload, minute) => {
    session = applySymbolicRuntimeEvent(session, { event_id: `${sessionId}-${type.toLowerCase()}`, type, at: `2026-09-17T19:${String(minute).padStart(2, "0")}:00Z`, ...(payload ? { payload } : {}) });
  };
  apply("SPECIFY", { path_id: "PATH-MEASURE", from_state: "BASELINE", to_state: "TARGET", constraints: ["measure"] }, 1);
  apply("CONSTRUCT", { construction_id: `${sessionId}-construction`, steps: [{ step_id: "step", action: "execute" }] }, 2);
  apply("BIND", { vessel: { vessel_id: `${sessionId}-vessel`, context_type: "VALIDATOR", context_ref: "LOCAL" } }, 3);
  apply("ACTIVATE", undefined, 4);
  apply("OBSERVE", { observation_id: `${sessionId}-observation`, raw: "raw" }, 5);
  apply("FEEDBACK", { feedback_id: `${sessionId}-feedback`, assessment: "recorded", next_action: "CLOSE" }, 6);
  apply("COMPLETE", { result_state: resultState, evidence_scope: "SELF_REPORTED", evidence: [] }, 7);
  return createRuntimeSessionArtifact({
    session,
    exported_at: "2026-09-17T19:10:00Z",
    initial: { session_id: sessionId, created_at: createdAt, intention: "Measurement validator", current_state: "BASELINE", target_state: "TARGET" },
  });
}

let protocol = createExperimentProtocol({
  experiment_id: "MEASUREMENT-VALIDATOR",
  created_at: "2026-09-17T18:00:00Z",
  locked_at: "2026-09-17T18:05:00Z",
  title: "Measurement validator",
  question: "Do typed records differ descriptively?",
  hypothesis: "They may differ descriptively.",
  plan: {
    observed_variables: ["score", "success", "class"],
    controlled_variables: ["same runtime"],
    intervention: "experimental condition",
    control_sessions_required: 1,
    experimental_sessions_required: 1,
    completion_criteria: ["valid records"],
    exclusion_criteria: ["invalid artifact"],
  },
});

let contract = createMeasurementContract(protocol, {
  created_at: "2026-09-17T18:04:00Z",
  locked_at: "2026-09-17T18:05:00Z",
  metrics: [
    { metric_id: "M-SCORE", source_variable: "score", label: "Score", type: "SCALE", unit: "points", collection_method: "self-report", evidence_source: "SELF_REPORT", timepoint: "POST", timepoint_label: null, evaluation_criterion: "Compare descriptive values only.", scale: { min: 0, max: 10, step: 1, anchors: [] } },
    { metric_id: "M-SUCCESS", source_variable: "success", label: "Success", type: "BOOLEAN", unit: null, collection_method: "runtime result review", evidence_source: "RUNTIME_DERIVED", timepoint: "EVENT_BOUNDARY", timepoint_label: "COMPLETE", evaluation_criterion: "Count true and false by role." },
    { metric_id: "M-CLASS", source_variable: "class", label: "Class", type: "CATEGORY", unit: null, collection_method: "observer classification", evidence_source: "OBSERVER_RECORDED", timepoint: "POST", timepoint_label: null, evaluation_criterion: "Count categories by role.", category_options: ["A", "B"] },
  ],
});

if (!validateMeasurementContract(contract, protocol).ok) issues.push("sealed measurement contract must validate against preregistration");
if (!/^[0-9a-f]{64}$/.test(contract.measurement_plan_digest)) issues.push("measurement plan must have SHA-256 digest");

protocol = addExperimentArtifact(protocol, { assignment_id: "CONTROL-1", role: "CONTROL", added_at: "2026-09-17T20:00:00Z", artifact: artifact("measurement-control", "CONTROL_RESULT") });
protocol = addExperimentArtifact(protocol, { assignment_id: "EXPERIMENT-1", role: "EXPERIMENT", added_at: "2026-09-17T20:30:00Z", artifact: artifact("measurement-experiment", "EXPERIMENT_RESULT") });

const record = (measurement_id, assignment_id, metric_id, value) => {
  contract = addMeasurementRecord(contract, protocol, { measurement_id, assignment_id, metric_id, measured_at: "2026-09-17T21:00:00Z", value });
};
record("C-SCORE", "CONTROL-1", "M-SCORE", 3);
record("C-SUCCESS", "CONTROL-1", "M-SUCCESS", true);
record("C-CLASS", "CONTROL-1", "M-CLASS", "A");
record("E-SCORE", "EXPERIMENT-1", "M-SCORE", 8);
record("E-SUCCESS", "EXPERIMENT-1", "M-SUCCESS", true);
record("E-CLASS", "EXPERIMENT-1", "M-CLASS", "B");

const validation = validateMeasurementContract(contract, protocol);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `measurement validation: ${issue}`));
const matrix = measurementMatrix(contract, protocol);
if (matrix.rows.length !== 2 || matrix.rows.some((row) => row.missing_metrics.length !== 0)) issues.push("measurement matrix must cover both assignments without imputation");
const descriptive = measurementDescriptiveSummary(contract, protocol);
const score = descriptive.metrics.find((metric) => metric.metric_id === "M-SCORE");
if (score?.control.mean !== 3 || score?.experiment.mean !== 8) issues.push("descriptive numeric summary mismatch");
if (descriptive.inferential_statistics_performed !== false) issues.push("inferential statistics must remain disabled in V1");
if (descriptive.causal_claim_permitted !== false || descriptive.metaphysical_proof_permitted !== false) issues.push("measurement summary must not grant causal/metaphysical proof");

const summary = measurementContractSummary();
if (summary.contract_id !== "HNK_MEASUREMENT_CONTRACT_V1") issues.push("unexpected Measurement Contract id");
if (!summary.types.includes("NUMBER") || !summary.types.includes("SCALE") || !summary.types.includes("CATEGORY")) issues.push("required metric types missing");
if (summary.plan_locked_before_sessions !== true) issues.push("measurement plan must lock before sessions");
if (summary.observed_variables_exactly_typed !== true) issues.push("observed variables must be exactly typed");
if (summary.claim_boundary !== HNK_MEASUREMENT_CLAIM_BOUNDARY) issues.push("measurement claim boundary drift");

const page = read("apps/web/app/research/measurements/page.tsx");
const client = read("apps/web/app/research/measurements/MeasurementContractLab.tsx");
const route = read("apps/web/app/api/research/measurements/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const questAdapter = read("packages/quest-engine/src/measurement-contract.ts");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Measurement Lab page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Measurement Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Measurement API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Measurement API must declare no automatic persistence");
if (!client.includes("createMeasurementContract")) issues.push("Measurement Lab must seal plans through shared contract");
if (!client.includes("addMeasurementRecord")) issues.push("Measurement Lab must record through shared contract");
if (!client.includes("measurementMatrix") || !client.includes("measurementDescriptiveSummary")) issues.push("Measurement Lab must expose matrix and descriptive summary");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Measurement Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/measurements"')) issues.push("Research hub must link Measurement Lab");
if (!hub.includes("TYPED MEASUREMENT")) issues.push("Research pipeline must include typed measurement stage");
if (!questAdapter.includes('from "@hnk/measurement-contract"')) issues.push("Quest Engine must delegate Measurement Contract to shared package");

if (issues.length) {
  console.error("HNK_MEASUREMENT_CONTRACT_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_MEASUREMENT_CONTRACT_V1_PASS");
console.log(JSON.stringify({
  contract_id: summary.contract_id,
  types: summary.types,
  metrics: contract.metrics.length,
  records: contract.records.length,
  rows: matrix.rows.length,
  inferential_statistics_performed: descriptive.inferential_statistics_performed,
  causal_claim_permitted: descriptive.causal_claim_permitted,
  metaphysical_proof_permitted: descriptive.metaphysical_proof_permitted,
}, null, 2));
