import fs from "node:fs";
import {
  applySymbolicRuntimeEvent,
  createSymbolicRuntimeSession,
} from "@hnk/symbolic-runtime-contract";
import {
  compareRuntimeSessionArtifacts,
  createRuntimeSessionArtifact,
  parseRuntimeSessionArtifact,
  replayRuntimeSessionArtifact,
  runtimeSessionArtifactSummary,
  serializeRuntimeSessionArtifact,
  validateRuntimeSessionArtifact,
} from "@hnk/runtime-session-artifact";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const issues = [];

function build(resultState) {
  const initial = {
    session_id: `validator-${resultState}`,
    created_at: "2026-09-17T18:00:00.000Z",
    intention: "Validate reproducible HNK runtime artifacts.",
    current_state: "STATE-0",
    target_state: "STATE-1",
  };
  let session = createSymbolicRuntimeSession(initial);
  const events = [
    { event_id: "e1", type: "SPECIFY", at: "2026-09-17T18:01:00.000Z", payload: { path_id: "PATH-1", from_state: "STATE-0", to_state: "STATE-1", constraints: ["OBSERVE"] } },
    { event_id: "e2", type: "CONSTRUCT", at: "2026-09-17T18:02:00.000Z", payload: { construction_id: "C-1", steps: [{ step_id: "S-1", action: "Execute observable test" }] } },
    { event_id: "e3", type: "BIND", at: "2026-09-17T18:03:00.000Z", payload: { vessel: { vessel_id: "V-1", context_type: "VALIDATOR", context_ref: "LOCAL" } } },
    { event_id: "e4", type: "ACTIVATE", at: "2026-09-17T18:04:00.000Z" },
    { event_id: "e5", type: "OBSERVE", at: "2026-09-17T18:05:00.000Z", payload: { observation_id: "O-1", raw: "Observed validator event", interpretation: "Separate interpretation" } },
    { event_id: "e6", type: "FEEDBACK", at: "2026-09-17T18:06:00.000Z", payload: { feedback_id: "F-1", assessment: "Validator feedback", next_action: "CLOSE" } },
    { event_id: "e7", type: "COMPLETE", at: "2026-09-17T18:07:00.000Z", payload: { result_state: resultState, evidence_scope: "SYSTEM_MEASURED", evidence: [{ validator: true }] } },
  ];
  for (const event of events) session = applySymbolicRuntimeEvent(session, event);
  return { initial, session };
}

const summary = runtimeSessionArtifactSummary();
if (summary.deterministic_replay !== true) issues.push("artifact contract must guarantee deterministic replay");
if (summary.comparison !== true) issues.push("artifact contract must expose comparison");
if (summary.server_persistence !== false || summary.browser_persistence !== false) issues.push("artifact contract must not imply automatic persistence");
if (summary.claim_boundary !== "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF") issues.push("artifact claim boundary drift");

try {
  const leftBuilt = build("RESULT-A");
  const rightBuilt = build("RESULT-B");
  const left = createRuntimeSessionArtifact({ ...leftBuilt, exported_at: "2026-09-17T18:08:00.000Z" });
  const right = createRuntimeSessionArtifact({ ...rightBuilt, exported_at: "2026-09-17T18:09:00.000Z" });

  if (!validateRuntimeSessionArtifact(left).ok) issues.push("valid artifact rejected");
  const parsed = parseRuntimeSessionArtifact(serializeRuntimeSessionArtifact(left));
  const replay = replayRuntimeSessionArtifact(parsed);
  if (!replay.ok || !replay.matches_snapshot) issues.push("deterministic replay mismatch");

  const comparison = compareRuntimeSessionArtifacts(left, right);
  if (!comparison.compatible) issues.push("compatible artifacts reported incompatible");
  if (!comparison.same_event_sequence) issues.push("identical event sequences reported different");
  if (!comparison.differences.includes("result_state")) issues.push("comparison failed to expose result_state difference");

  const tampered = JSON.parse(JSON.stringify(left));
  tampered.session.result.result_state = "TAMPERED";
  tampered.session.current_state = "TAMPERED";
  if (validateRuntimeSessionArtifact(tampered).ok) issues.push("tampered snapshot passed artifact validation");
} catch (error) {
  issues.push(`artifact runtime test failed: ${error instanceof Error ? error.message : String(error)}`);
}

const panel = read("apps/web/app/research/runtime/RuntimeArtifactPanel.tsx");
const lab = read("apps/web/app/research/runtime/SymbolicRuntimeLab.tsx");
const adapter = read("packages/quest-engine/src/runtime-session-artifact.ts");
const questIndex = read("packages/quest-engine/src/index.ts");

if (!panel.includes("createRuntimeSessionArtifact")) issues.push("Runtime Artifact Panel must export through shared artifact contract");
if (!panel.includes("parseRuntimeSessionArtifact")) issues.push("Runtime Artifact Panel must validate imported JSON");
if (!panel.includes("replayRuntimeSessionArtifact")) issues.push("Runtime Artifact Panel must expose deterministic replay");
if (!panel.includes("compareRuntimeSessionArtifacts")) issues.push("Runtime Artifact Panel must support side-by-side comparison");
if (!panel.includes("new Blob")) issues.push("Runtime Artifact Panel must provide user-controlled JSON download");
if (!panel.includes('type="file"')) issues.push("Runtime Artifact Panel must provide local file import");
if (panel.includes("localStorage") || panel.includes("sessionStorage") || panel.includes("indexedDB")) issues.push("artifact panel must not persist artifacts in browser storage");
if (!lab.includes("<RuntimeArtifactPanel")) issues.push("Symbolic Runtime Lab must mount Runtime Artifact Panel");
if (!adapter.includes('from "@hnk/runtime-session-artifact"')) issues.push("Quest Engine artifact adapter must delegate to shared package");
if (!questIndex.includes('export * from "./runtime-session-artifact.js"')) issues.push("Quest Engine must re-export artifact adapter");

if (issues.length) {
  console.error("HNK_RUNTIME_SESSION_ARTIFACT_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_RUNTIME_SESSION_ARTIFACT_V1_PASS");
console.log(JSON.stringify({
  artifact_id: summary.artifact_id,
  deterministic_replay: summary.deterministic_replay,
  comparison: summary.comparison,
  server_persistence: summary.server_persistence,
  browser_persistence: summary.browser_persistence,
  claim_boundary: summary.claim_boundary,
}, null, 2));
