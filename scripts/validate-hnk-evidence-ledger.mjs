import fs from "node:fs";
import {
  HNK_EVIDENCE_LEDGER_BOUNDARY,
  addEvidenceClaim,
  addExperimentArtifact,
  addMeasurementRecord,
  createEvidenceLedger,
  createExperimentAttestation,
  createExperimentProtocol,
  createMeasurementContract,
  evidenceLedgerIndex,
  evidenceLedgerSummary,
  evaluateEvidenceClaim,
  validateEvidenceLedger,
  verifyEvidenceLedger,
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
    intention: "Evidence Ledger validator.",
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
  apply("SPECIFY", { path_id: "PATH-EVIDENCE", from_state: "BASELINE", to_state: "TARGET", constraints: ["record"] }, 1);
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
      intention: "Evidence Ledger validator.",
      current_state: "BASELINE",
      target_state: "TARGET",
    },
  });
}

let protocol = createExperimentProtocol({
  experiment_id: "EVIDENCE-VALIDATOR",
  created_at: "2026-09-17T18:00:00Z",
  locked_at: "2026-09-17T18:05:00Z",
  title: "Evidence Ledger validator",
  question: "Are declared evidence requirements present?",
  hypothesis: "Coverage can be represented without assessing truth.",
  plan: {
    observed_variables: ["score"],
    controlled_variables: ["same runtime"],
    intervention: "experimental condition",
    control_sessions_required: 1,
    experimental_sessions_required: 1,
    completion_criteria: ["valid artifacts"],
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
    evaluation_criterion: "Compare descriptive coverage only.",
    scale: { min: 0, max: 10, step: 1, anchors: [] },
  }],
});

protocol = addExperimentArtifact(protocol, {
  assignment_id: "CONTROL-1",
  role: "CONTROL",
  added_at: "2026-09-17T20:00:00Z",
  artifact: artifact("evidence-validator-control", "CONTROL_RESULT"),
});
protocol = addExperimentArtifact(protocol, {
  assignment_id: "EXPERIMENT-1",
  role: "EXPERIMENT",
  added_at: "2026-09-17T20:30:00Z",
  artifact: artifact("evidence-validator-experiment", "EXPERIMENT_RESULT"),
});

measurement = addMeasurementRecord(measurement, protocol, {
  measurement_id: "C-SCORE",
  assignment_id: "CONTROL-1",
  metric_id: "M-SCORE",
  measured_at: "2026-09-17T20:10:00Z",
  value: 4,
});
measurement = addMeasurementRecord(measurement, protocol, {
  measurement_id: "E-SCORE",
  assignment_id: "EXPERIMENT-1",
  metric_id: "M-SCORE",
  measured_at: "2026-09-17T20:40:00Z",
  value: 7,
});

const attestation = createExperimentAttestation(protocol, {
  generated_at: "2026-09-17T20:45:00Z",
});
let ledger = createEvidenceLedger(protocol, attestation, measurement, {
  created_at: "2026-09-17T20:46:00Z",
});

if (!validateEvidenceLedger(ledger).ok) issues.push("Evidence Ledger must validate after source binding");
const verification = verifyEvidenceLedger(ledger, protocol, attestation, measurement);
if (!verification.ok || !verification.sources_match || !verification.attestation_matches || !verification.measurement_matches) {
  issues.push("Evidence Ledger must verify all linked sources");
}

ledger = addEvidenceClaim(ledger, {
  claim_id: "CLAIM-COMPLETE",
  statement: "Both roles contain the preregistered score metric.",
  scope: "DESCRIPTIVE",
  created_at: "2026-09-17T20:47:00Z",
  requirements: [
    { requirement_id: "REQ-A", kind: "ATTESTATION_INTEGRITY" },
    { requirement_id: "REQ-C", kind: "METRIC_ROLE_RECORDS", role: "CONTROL", metric_id: "M-SCORE", min_count: 1 },
    { requirement_id: "REQ-E", kind: "METRIC_ROLE_RECORDS", role: "EXPERIMENT", metric_id: "M-SCORE", min_count: 1 },
  ],
});
const complete = evaluateEvidenceClaim(ledger, "CLAIM-COMPLETE");
if (complete.coverage_status !== "COMPLETE_FOR_DECLARED_REQUIREMENTS") issues.push("complete claim coverage was not recognized");
if (complete.truth_assessed !== false) issues.push("Evidence Ledger must never auto-assess truth");

ledger = addEvidenceClaim(ledger, {
  claim_id: "CLAIM-INSUFFICIENT",
  statement: "Three experimental score records are required for this declared evidence threshold.",
  scope: "DESCRIPTIVE",
  created_at: "2026-09-17T20:48:00Z",
  requirements: [
    { requirement_id: "REQ-THREE", kind: "METRIC_ROLE_RECORDS", role: "EXPERIMENT", metric_id: "M-SCORE", min_count: 3 },
  ],
});
const insufficient = evaluateEvidenceClaim(ledger, "CLAIM-INSUFFICIENT");
if (insufficient.coverage_status !== "INSUFFICIENT") issues.push("missing evidence must surface as INSUFFICIENT");
if (insufficient.missing_requirements[0] !== "REQ-THREE") issues.push("missing requirement id must be explicit");

const index = evidenceLedgerIndex(ledger);
if (index.evidence.sessions !== 2 || index.evidence.measurements !== 2) issues.push("Evidence index counts are incorrect");
if (index.automatic_truth_inference !== false) issues.push("automatic truth inference must remain disabled");

const summary = evidenceLedgerSummary();
if (summary.ledger_id !== "HNK_EVIDENCE_LEDGER_V1") issues.push("unexpected Evidence Ledger id");
if (summary.explicit_insufficiency !== true) issues.push("explicit insufficiency must be enabled");
if (summary.automatic_truth_inference !== false) issues.push("summary must disable automatic truth inference");
if (summary.causal_claim_permitted !== false || summary.metaphysical_proof_permitted !== false) issues.push("ledger must not grant causal/metaphysical proof");
if (summary.claim_boundary !== HNK_EVIDENCE_LEDGER_BOUNDARY) issues.push("Evidence Ledger boundary drift");

const page = read("apps/web/app/research/evidence/page.tsx");
const client = read("apps/web/app/research/evidence/EvidenceLedgerLab.tsx");
const route = read("apps/web/app/api/research/evidence/route.ts");
const hub = read("apps/web/app/research/page.tsx");
const questAdapter = read("packages/quest-engine/src/evidence-ledger.ts");

if (!page.includes("researchLabEnabled()") || !page.includes("notFound()")) issues.push("Evidence Ledger page must fail closed");
if (!page.includes('robots: { index: false, follow: false }')) issues.push("Evidence Ledger Lab must remain noindex/nofollow");
if (!route.includes("researchLabAuthorized(request)")) issues.push("Evidence Ledger API must require Bearer authorization");
if (!route.includes('persistence: "NONE_AUTOMATIC"')) issues.push("Evidence Ledger API must declare no automatic persistence");
if (!client.includes("createEvidenceLedger")) issues.push("Evidence Ledger Lab must use shared contract");
if (!client.includes("addEvidenceClaim")) issues.push("Evidence Ledger Lab must add claims through shared contract");
if (!client.includes("evidenceLedgerIndex")) issues.push("Evidence Ledger Lab must expose evidence index");
if (client.includes("localStorage") || client.includes("sessionStorage") || client.includes("indexedDB")) issues.push("Evidence Ledger Lab must not auto-persist in browser storage");
if (!hub.includes('href="/research/evidence"')) issues.push("Research hub must link Evidence Ledger Lab");
if (!hub.includes("EVIDENCE LEDGER")) issues.push("Research pipeline must include Evidence Ledger stage");
if (!questAdapter.includes('from "@hnk/evidence-ledger"')) issues.push("Quest Engine must delegate Evidence Ledger to shared package");

if (issues.length) {
  console.error("HNK_EVIDENCE_LEDGER_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_EVIDENCE_LEDGER_V1_PASS");
console.log(JSON.stringify({
  ledger_id: summary.ledger_id,
  evidence_entries: ledger.evidence_entries.length,
  claims: ledger.claims.length,
  complete_status: complete.coverage_status,
  insufficient_status: insufficient.coverage_status,
  truth_assessed: complete.truth_assessed,
  causal_claim_permitted: summary.causal_claim_permitted,
  metaphysical_proof_permitted: summary.metaphysical_proof_permitted,
}, null, 2));
