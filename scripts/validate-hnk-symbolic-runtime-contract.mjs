import fs from "node:fs";
import {
  HNK_SYMBOLIC_RUNTIME_CANON_SOURCES,
  HNK_SYMBOLIC_RUNTIME_CONTRACT_ID,
  HNK_SYMBOLIC_RUNTIME_EVENTS,
  HNK_SYMBOLIC_RUNTIME_PHASES,
  applySymbolicRuntimeEvent,
  createSymbolicRuntimeSession,
  symbolicRuntimeSummary,
  validateSymbolicRuntimeSession,
} from "../packages/symbolic-runtime-contract/src/index.mjs";

const issues = [];
const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const readJson = (path) => JSON.parse(read(path));

const pkg = readJson("packages/symbolic-runtime-contract/package.json");
const questPkg = readJson("packages/quest-engine/package.json");
const questIndex = read("packages/quest-engine/src/index.ts");
const questAdapter = read("packages/quest-engine/src/symbolic-runtime.ts");

if (pkg.name !== "@hnk/symbolic-runtime-contract") issues.push(`unexpected package name ${pkg.name}`);
if (pkg.version !== "1.0.0") issues.push(`unexpected package version ${pkg.version}`);
if (pkg.dependencies?.["@hnk/canon-contract"] !== "workspace:*") issues.push("symbolic runtime must consume @hnk/canon-contract");
if (questPkg.dependencies?.["@hnk/symbolic-runtime-contract"] !== "workspace:*") issues.push("quest-engine must consume @hnk/symbolic-runtime-contract");
if (!questIndex.includes('export * from "./symbolic-runtime.js";')) issues.push("quest-engine index must export symbolic runtime adapter");
if (!questAdapter.includes('from "@hnk/symbolic-runtime-contract"')) issues.push("quest symbolic runtime adapter must delegate to shared contract");

const summary = symbolicRuntimeSummary();
if (summary.contract_id !== HNK_SYMBOLIC_RUNTIME_CONTRACT_ID) issues.push(`contract id drift: ${summary.contract_id}`);
if (!summary.canon_contract_ok) issues.push("upstream HNK canon contract is not valid");
if (summary.canon_dependencies !== 16) issues.push(`expected 16 canon dependencies, found ${summary.canon_dependencies}`);
if (HNK_SYMBOLIC_RUNTIME_CANON_SOURCES.length !== 16) issues.push(`expected 16 canon source ids, found ${HNK_SYMBOLIC_RUNTIME_CANON_SOURCES.length}`);
if (HNK_SYMBOLIC_RUNTIME_PHASES.length !== 8) issues.push(`expected 8 runtime phases, found ${HNK_SYMBOLIC_RUNTIME_PHASES.length}`);
if (HNK_SYMBOLIC_RUNTIME_EVENTS.length !== 13) issues.push(`expected 13 runtime events, found ${HNK_SYMBOLIC_RUNTIME_EVENTS.length}`);
if (summary.deterministic_reducer !== true) issues.push("runtime must remain deterministic");
if (summary.caller_supplied_ids_and_timestamps !== true) issues.push("runtime ids/timestamps must remain caller supplied");
if (summary.evidence_scoped_results !== true) issues.push("runtime results must remain evidence scoped");
if (summary.metaphysical_efficacy_claimed !== false) issues.push("runtime must not claim metaphysical efficacy as an implementation fact");

let session = createSymbolicRuntimeSession({
  session_id: "VALIDATE-SRT-001",
  created_at: "2026-09-17T17:30:00Z",
  intention: "Validate deterministic symbolic runtime flow.",
  current_state: "A",
  target_state: "B",
});

const events = [
  { event_id: "E01", type: "GENERATE", at: "2026-09-17T17:30:01Z", payload: { candidate_id: "C1", label: "P1", rationale: "validator" } },
  { event_id: "E02", type: "SPECIFY", at: "2026-09-17T17:30:02Z", payload: { path_id: "P1", from_state: "A", to_state: "B", constraints: ["OBSERVABLE_ONLY"] } },
  { event_id: "E03", type: "CONSTRUCT", at: "2026-09-17T17:30:03Z", payload: { construction_id: "BUILD1", steps: [{ step_id: "S1", action: "Execute validation step" }] } },
  { event_id: "E04", type: "BIND", at: "2026-09-17T17:30:04Z", payload: { symbolic_key: { key_id: "KEY1", reference: "G01" }, vessel: { vessel_id: "VESSEL1", context_type: "VALIDATOR", context_ref: "validate-hnk-symbolic-runtime-contract" } } },
  { event_id: "E05", type: "ACTIVATE", at: "2026-09-17T17:30:05Z" },
  { event_id: "E06", type: "OBSERVE", at: "2026-09-17T17:30:06Z", payload: { observation_id: "OBS1", raw: "Validator reached observation phase.", interpretation: "Fixture path remains coherent." } },
  { event_id: "E07", type: "FEEDBACK", at: "2026-09-17T17:30:07Z", payload: { feedback_id: "FB1", assessment: "Fixture matches target.", next_action: "CLOSE" } },
  { event_id: "E08", type: "COMPLETE", at: "2026-09-17T17:30:08Z", payload: { result_state: "B", evidence_scope: "SYSTEM_MEASURED", evidence: [{ validator: "PASS" }] } },
];

for (const event of events) session = applySymbolicRuntimeEvent(session, event);
const validation = validateSymbolicRuntimeSession(session);
if (!validation.ok) issues.push(`happy-path session invalid: ${validation.issues.join(" | ")}`);
if (session.phase !== "CLOSED") issues.push(`happy path must close, found ${session.phase}`);
if (session.current_state !== "B") issues.push(`happy path result state mismatch: ${session.current_state}`);
if (session.events.length !== 8) issues.push(`expected 8 logged events, found ${session.events.length}`);
if (session.result?.claim_boundary !== "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF") issues.push("result claim boundary drift");

let bypassBlocked = false;
try {
  const fresh = createSymbolicRuntimeSession({
    session_id: "VALIDATE-SRT-002",
    created_at: "2026-09-17T17:31:00Z",
    intention: "Attempt forbidden completion.",
    current_state: "A",
    target_state: "B",
  });
  applySymbolicRuntimeEvent(fresh, {
    event_id: "E01",
    type: "COMPLETE",
    at: "2026-09-17T17:31:01Z",
    payload: { result_state: "B", evidence_scope: "OBSERVED" },
  });
} catch {
  bypassBlocked = true;
}
if (!bypassBlocked) issues.push("runtime allowed completion without specification/construction/observation/feedback");

if (issues.length) {
  console.error("HNK_SYMBOLIC_RUNTIME_CONTRACT_V1_FAIL");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("HNK_SYMBOLIC_RUNTIME_CONTRACT_V1_PASS");
console.log(JSON.stringify({
  contract_id: summary.contract_id,
  canon_dependencies: summary.canon_dependencies,
  phases: summary.phases,
  events: summary.events,
  happy_path_events: session.events.length,
  final_phase: session.phase,
  evidence_scope: session.result.evidence_scope,
  bypass_blocked: bypassBlocked,
}, null, 2));
