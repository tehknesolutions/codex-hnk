import fs from "node:fs";
import {
  addExperimentArtifact,
  createExperimentAttestation,
  createExperimentProtocol,
  finalizeExperimentProtocol,
  sha256Hex,
  validateExperimentAttestation,
  verifyExperimentAttestation,
} from "@hnk/quest-engine";
import { createRuntimeSessionArtifact } from "@hnk/runtime-session-artifact";
import { applySymbolicRuntimeEvent, createSymbolicRuntimeSession } from "@hnk/symbolic-runtime-contract";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function runtimeArtifact(sessionId, resultState) {
  const createdAt = "2026-09-17T19:00:00Z";
  let session = createSymbolicRuntimeSession({
    session_id: sessionId,
    created_at: createdAt,
    intention: "Registrar uma execução observável.",
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
  apply("SPECIFY", { path_id: "PATH-ATTEST", from_state: "BASELINE", to_state: "TARGET", constraints: ["registro explícito"] }, 1);
  apply("CONSTRUCT", { construction_id: `${sessionId}-construction`, steps: [{ step_id: "step-1", action: "executar" }] }, 2);
  apply("BIND", { vessel: { vessel_id: `${sessionId}-vessel`, context_type: "VALIDATOR", context_ref: "LOCAL" } }, 3);
  apply("ACTIVATE", undefined, 4);
  apply("OBSERVE", { observation_id: `${sessionId}-observation`, raw: `observação ${sessionId}` }, 5);
  apply("FEEDBACK", { feedback_id: `${sessionId}-feedback`, assessment: "registro concluído", next_action: "CLOSE" }, 6);
  apply("COMPLETE", { result_state: resultState, evidence_scope: "SELF_REPORTED", evidence: [{ note: "validator" }] }, 7);
  return createRuntimeSessionArtifact({
    session,
    exported_at: "2026-09-17T19:10:00Z",
    initial: { session_id: sessionId, created_at: createdAt, intention: "Registrar uma execução observável.", current_state: "BASELINE", target_state: "TARGET" },
  });
}

function preregistration() {
  return createExperimentProtocol({
    experiment_id: "EXP-ATTEST-VALIDATOR",
    created_at: "2026-09-17T18:00:00Z",
    locked_at: "2026-09-17T18:05:00Z",
    title: "Attestation validator",
    question: "Os registros diferem?",
    hypothesis: "Pode existir diferença descritiva.",
    plan: {
      observed_variables: ["result_state"],
      controlled_variables: ["runtime contract"],
      intervention: "condição experimental",
      control_sessions_required: 1,
      experimental_sessions_required: 1,
      completion_criteria: ["um artifact válido por papel"],
      exclusion_criteria: ["replay mismatch"],
    },
  });
}

if (sha256Hex("abc") !== "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad") {
  issues.push("SHA-256 implementation failed the standard abc test vector");
}

let protocol = preregistration();
const baseline = createExperimentAttestation(protocol, { generated_at: "2026-09-17T18:06:00Z" });
protocol = addExperimentArtifact(protocol, { assignment_id: "CONTROL-1", role: "CONTROL", added_at: "2026-09-17T20:00:00Z", artifact: runtimeArtifact("att-control", "CONTROL_RESULT") });
protocol = addExperimentArtifact(protocol, { assignment_id: "EXPERIMENT-1", role: "EXPERIMENT", added_at: "2026-09-17T20:30:00Z", artifact: runtimeArtifact("att-experiment", "EXPERIMENT_RESULT") });
protocol = finalizeExperimentProtocol(protocol, {
  completed_at: "2026-09-17T21:00:00Z",
  descriptive_summary: "Estados finais distintos foram registrados.",
  interpretation: "Diferença descritiva sem conclusão causal.",
  limitations: ["amostra mínima"],
});
const finalAttestation = createExperimentAttestation(protocol, { generated_at: "2026-09-17T21:01:00Z" });
const verification = verifyExperimentAttestation(finalAttestation, protocol);

if (baseline.preregistration_digest !== finalAttestation.preregistration_digest) issues.push("preregistration digest drifted after sessions/report");
if (baseline.protocol_snapshot_digest === finalAttestation.protocol_snapshot_digest) issues.push("full snapshot digest should change after sessions/report");
if (finalAttestation.sessions.length !== 2) issues.push(`expected 2 attested sessions, found ${finalAttestation.sessions.length}`);
if (!finalAttestation.report) issues.push("completed protocol must attest final report");
if (!verification.ok) issues.push(...verification.issues.map((issue) => `verification: ${issue}`));
if (finalAttestation.authorship_proof !== false) issues.push("attestation must not claim authorship proof");
if (finalAttestation.trusted_timestamp_proof !== false) issues.push("attestation must not claim trusted timestamp proof");
if (finalAttestation.causal_proof !== false) issues.push("attestation must not claim causal proof");
if (finalAttestation.metaphysical_proof !== false) issues.push("attestation must not claim metaphysical proof");
if (validateExperimentAttestation(finalAttestation).ok !== true) issues.push("final attestation failed self-validation");

const packageSource = read("packages/experiment-attestation/src/index.mjs");
const questAdapter = read("packages/quest-engine/src/experiment-attestation.ts");
const questIndex = read("packages/quest-engine/src/index.ts");
const questPackage = read("packages/quest-engine/package.json");
const lab = read("apps/web/app/research/experiments/ExperimentProtocolLab.tsx");
const panel = read("apps/web/app/research/experiments/ExperimentAttestationPanel.tsx");
const route = read("apps/web/app/api/research/experiments/route.ts");
const docs = read("docs/architecture/HNK_EXPERIMENT_ATTESTATION_V1.md");

if (!packageSource.includes('HNK_EXPERIMENT_ATTESTATION_ALGORITHM = "SHA-256"')) issues.push("shared attestation package must lock SHA-256");
if (!packageSource.includes('HNK_EXPERIMENT_ATTESTATION_SCOPE = "CONTENT_INTEGRITY_ONLY"')) issues.push("attestation scope must remain content-integrity only");
if (!packageSource.includes('timestamp_authority: "NONE"')) issues.push("attestation must declare no trusted timestamp authority");
if (!packageSource.includes('identity_signature: "NONE"')) issues.push("attestation must declare no identity signature");
if (!questAdapter.includes('from "@hnk/experiment-attestation"')) issues.push("Quest Engine must delegate to shared experiment-attestation package");
if (!questIndex.includes('export * from "./experiment-attestation.js"')) issues.push("Quest Engine index must export experiment attestation adapter");
if (!questPackage.includes('"@hnk/experiment-attestation": "workspace:*"')) issues.push("Quest Engine package must depend on experiment-attestation workspace package");
if (!lab.includes("createExperimentAttestation")) issues.push("Experiment Lab must create preregistration attestation at lock time");
if (!lab.includes("baselineAttestation")) issues.push("Experiment Lab must retain in-session preregistration seal for comparison");
if (!panel.includes("verifyExperimentAttestation")) issues.push("Experiment Attestation Panel must verify current protocol content");
if (!panel.includes("compareExperimentAttestations")) issues.push("Experiment Attestation Panel must compare seals");
if (!panel.includes("CONTENT INTEGRITY ONLY")) issues.push("Experiment Attestation Panel must expose integrity-only scope");
if (panel.includes("localStorage") || panel.includes("sessionStorage") || panel.includes("indexedDB")) issues.push("attestation panel must not add automatic browser persistence");
if (!route.includes("experimentAttestationSummary")) issues.push("private experiment API must expose attestation capability summary");
if (!docs.includes("not identity infrastructure") && !docs.includes("not identity")) issues.push("attestation documentation must state identity boundary");

if (issues.length) {
  console.error("HNK_EXPERIMENT_ATTESTATION_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_EXPERIMENT_ATTESTATION_V1_PASS");
console.log(JSON.stringify({
  algorithm: finalAttestation.algorithm,
  scope: finalAttestation.scope,
  preregistration_digest_stable: baseline.preregistration_digest === finalAttestation.preregistration_digest,
  sessions: finalAttestation.sessions.length,
  report_attested: Boolean(finalAttestation.report),
  chain_verified: verification.chain_matches,
  authorship_proof: finalAttestation.authorship_proof,
  trusted_timestamp_proof: finalAttestation.trusted_timestamp_proof,
  causal_proof: finalAttestation.causal_proof,
  metaphysical_proof: finalAttestation.metaphysical_proof,
}, null, 2));
