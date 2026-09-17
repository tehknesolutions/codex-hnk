import fs from "node:fs";
import {
  HNK_REPLICATION_REGISTRY_BOUNDARY,
  addExperimentArtifact,
  addMeasurementRecord,
  addReplicationLedger,
  createEvidenceLedger,
  createExperimentAttestation,
  createExperimentProtocol,
  createMeasurementContract,
  createReplicationRegistry,
  replicationRegistrySummary,
  replicationReport,
  validateReplicationRegistry,
} from "@hnk/quest-engine";
import { createRuntimeSessionArtifact } from "@hnk/runtime-session-artifact";
import { applySymbolicRuntimeEvent, createSymbolicRuntimeSession } from "@hnk/symbolic-runtime-contract";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function artifact(sessionId, resultState) {
  const createdAt = "2026-09-17T19:00:00Z";
  let session = createSymbolicRuntimeSession({
    session_id: sessionId,
    created_at: createdAt,
    intention: "Replication Registry validator.",
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
  apply("SPECIFY", { path_id: "PATH-REPLICATION", from_state: "BASELINE", to_state: "TARGET", constraints: ["record"] }, 1);
  apply("CONSTRUCT", { construction_id: `${sessionId}-construction`, steps: [{ step_id: "step", action: "execute" }] }, 2);
  apply("BIND", { vessel: { vessel_id: `${sessionId}-vessel`, context_type: "VALIDATOR", context_ref: "LOCAL" } }, 3);
  apply("ACTIVATE", undefined, 4);
  apply("OBSERVE", { observation_id: `${sessionId}-observation`, raw: "raw" }, 5);
  apply("FEEDBACK", { feedback_id: `${sessionId}-feedback`, assessment: "recorded", next_action: "CLOSE" }, 6);
  apply("COMPLETE", { result_state: resultState, evidence_scope: "SELF_REPORTED", evidence: [] }, 7);
  return createRuntimeSessionArtifact({
    session,
    exported_at: "2026-09-17T19:10:00Z",
    initial: {
      session_id: sessionId,
      created_at: createdAt,
      intention: "Replication Registry validator.",
      current_state: "BASELINE",
      target_state: "TARGET",
    },
  });
}

function ledger(experimentId, controlValue, experimentalValue) {
  let protocol = createExperimentProtocol({
    experiment_id: experimentId,
    created_at: "2026-09-17T18:00:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    title: "Replication validator run",
    question: "Does direction repeat descriptively?",
    hypothesis: "Direction may repeat without implying causality.",
    plan: {
      observed_variables: ["score"],
      controlled_variables: ["same runtime", "same metric signature"],
      intervention: "experimental condition",
      control_sessions_required: 1,
      experimental_sessions_required: 1,
      completion_criteria: ["valid run"],
      exclusion_criteria: ["invalid replay"],
    },
  });

  let measurement = createMeasurementContract(protocol, {
    created_at: "2026-09-17T18:04:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    metrics: [{
      metric_id: "M-SCORE",
      source_variable: "score",
      label: "Score",
      type: "SCALE",
      unit: "points",
      collection_method: "Self-report after session",
      evidence_source: "SELF_REPORT",
      timepoint: "POST",
      timepoint_label: null,
      evaluation_criterion: "Compare descriptive CONTROL and EXPERIMENT means only.",
      scale: { min: 0, max: 10, step: 1, anchors: [] },
    }],
  });

  protocol = addExperimentArtifact(protocol, {
    assignment_id: "CONTROL-1",
    role: "CONTROL",
    added_at: "2026-09-17T20:00:00Z",
    artifact: artifact(`${experimentId}-control`, "CONTROL_RESULT"),
  });
  measurement = addMeasurementRecord(measurement, protocol, {
    measurement_id: `${experimentId}-CONTROL-SCORE`,
    assignment_id: "CONTROL-1",
    metric_id: "M-SCORE",
    measured_at: "2026-09-17T20:10:00Z",
    value: controlValue,
  });

  protocol = addExperimentArtifact(protocol, {
    assignment_id: "EXPERIMENT-1",
    role: "EXPERIMENT",
    added_at: "2026-09-17T20:30:00Z",
    artifact: artifact(`${experimentId}-experiment`, "EXPERIMENT_RESULT"),
  });
  measurement = addMeasurementRecord(measurement, protocol, {
    measurement_id: `${experimentId}-EXPERIMENT-SCORE`,
    assignment_id: "EXPERIMENT-1",
    metric_id: "M-SCORE",
    measured_at: "2026-09-17T20:40:00Z",
    value: experimentalValue,
  });

  const attestation = createExperimentAttestation(protocol, {
    generated_at: "2026-09-17T20:45:00Z",
  });
  return createEvidenceLedger(protocol, attestation, measurement, {
    created_at: "2026-09-17T20:46:00Z",
  });
}

const higherA = ledger("REPLICATION-VALIDATOR-A", 3, 7);
const higherB = ledger("REPLICATION-VALIDATOR-B", 4, 8);
const lowerC = ledger("REPLICATION-VALIDATOR-C", 8, 2);

let registry = createReplicationRegistry({
  replication_key: "VALIDATOR-SCORE-DIRECTION",
  title: "Replication Registry validator",
  question: "Does the same descriptive direction repeat across independent experiment IDs?",
  metric_id: "M-SCORE",
  created_at: "2026-09-17T21:00:00Z",
  seed_run_id: "RUN-A",
  seed_added_at: "2026-09-17T21:01:00Z",
  seed_ledger: higherA,
});

let report = replicationReport(registry);
if (report.status !== "SINGLE_RUN" || report.repeated_direction !== "HIGHER") {
  issues.push("first eligible run must produce SINGLE_RUN / HIGHER");
}

registry = addReplicationLedger(registry, {
  run_id: "RUN-B",
  added_at: "2026-09-17T21:02:00Z",
  ledger: higherB,
});
report = replicationReport(registry);
if (report.status !== "REPLICATED") issues.push("two same-direction eligible runs must produce REPLICATED");
if (report.repeated_direction !== "HIGHER") issues.push("repeated direction must be HIGHER");
if (report.direction_counts.HIGHER !== 2) issues.push("HIGHER direction count must be 2");

registry = addReplicationLedger(registry, {
  run_id: "RUN-C",
  added_at: "2026-09-17T21:03:00Z",
  ledger: lowerC,
});
report = replicationReport(registry);
if (report.status !== "MIXED") issues.push("opposed eligible direction must produce MIXED");
if (report.repeated_direction !== null) issues.push("MIXED must not expose a repeated_direction winner");
if (report.truth_assessed !== false) issues.push("Replication Registry must not assess truth");
if (report.causal_claim_permitted !== false || report.metaphysical_proof_permitted !== false) {
  issues.push("Replication Registry must not grant causal/metaphysical proof");
}

const validation = validateReplicationRegistry(registry);
if (!validation.ok) issues.push(...validation.issues.map((issue) => `registry validation: ${issue}`));
if (!/^[0-9a-f]{64}$/.test(registry.metric_signature.signature_digest)) issues.push("metric signature must be SHA-256 bound");
if (!/^[0-9a-f]{64}$/.test(registry.registry_digest)) issues.push("registry must be SHA-256 bound");
if (new Set(registry.runs.map((run) => run.experiment_id)).size !== registry.runs.length) issues.push("experiment IDs must be unique");

const summary = replicationRegistrySummary();
if (summary.registry_id !== "HNK_REPLICATION_REGISTRY_V1") issues.push("unexpected Replication Registry id");
if (summary.replicated_means !== "SAME_DESCRIPTIVE_DIRECTION_IN_AT_LEAST_TWO_ELIGIBLE_RUNS") issues.push("replicated semantics drift");
if (summary.distinct_experiment_ids_required !== true) issues.push("distinct experiment IDs must be required");
if (summary.exact_metric_signature_required !== true) issues.push("exact metric signature must be required");
if (summary.automatic_truth_inference !== false) issues.push("automatic truth inference must remain disabled");
if (summary.inferential_statistics_performed !== false) issues.push("inferential statistics must remain disabled in V1");
if (summary.claim_boundary !== HNK_REPLICATION_REGISTRY_BOUNDARY) issues.push("Replication Registry boundary drift");

const page = read("apps/web/app/research/replications/page.tsx");
const client = read("apps/web/app/research/replications/ReplicationRegistryLab.tsx");
const route = read("apps/web/app/api/research/replications/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const questAdapter = read("packages/quest-engine/src/replication-registry.ts");
const docs = read("docs/architecture/HNK_REPLICATION_REGISTRY_V1.md");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Replication page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Replication Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Replication API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Replication API must declare no automatic persistence");
if (!client.includes("createReplicationRegistry")) issues.push("Replication Lab must create through shared contract");
if (!client.includes("addReplicationLedger")) issues.push("Replication Lab must add runs through shared contract");
if (!client.includes("replicationReport")) issues.push("Replication Lab must expose shared report");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Replication Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/replications"')) issues.push("Research hub must link Replication Registry Lab");
if (!hub.includes("REPLICATION REGISTRY")) issues.push("Research pipeline must include Replication Registry stage");
if (!questAdapter.includes('from "@hnk/replication-registry"')) issues.push("Quest Engine must delegate Replication Registry to shared package");
if (!docs.includes("REPLICATED") || !docs.includes("MIXED") || !docs.includes("truth engine")) issues.push("Replication Registry documentation incomplete");

if (issues.length) {
  console.error("HNK_REPLICATION_REGISTRY_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_REPLICATION_REGISTRY_V1_PASS");
console.log(JSON.stringify({
  registry_id: summary.registry_id,
  runs: report.total_runs,
  eligible_runs: report.eligible_runs,
  final_status: report.status,
  directions: report.direction_counts,
  truth_assessed: report.truth_assessed,
  causal_claim_permitted: report.causal_claim_permitted,
  metaphysical_proof_permitted: report.metaphysical_proof_permitted,
}, null, 2));
