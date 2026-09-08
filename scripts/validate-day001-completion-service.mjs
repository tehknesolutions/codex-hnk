import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const day = path.join(root, "docs", "experience", "kether", "day-001");
const read = (name) => JSON.parse(fs.readFileSync(path.join(day, name), "utf8"));
const fail = (message) => {
  console.error(`DAY001 COMPLETION SERVICE FAIL: ${message}`);
  process.exitCode = 1;
};

const quest = read("day-001.quest.json");
const completion = read("day-001.completion.schema.json");
const service = read("day-001.completion.service.json");
const request = read("day-001.completion.rpc.request.schema.json");
const response = read("day-001.completion.rpc.response.schema.json");

const completionId = completion.properties?.completion_contract_id?.const;
const questId = quest.id;
const sourceSha = quest.canonical?.source_sha;
const migrationId = "20260908011647_day001_completion_contract_v2";

if (service.quest_definition_id !== questId) fail("service quest_definition_id mismatch");
if (service.completion_contract_id !== completionId) fail("service completion_contract_id mismatch");
if (service.canonical_source_sha !== sourceSha) fail("service canonical_source_sha mismatch");
if (request.properties?.quest_definition_id?.const !== questId) fail("request quest id mismatch");
if (request.properties?.completion_contract_id?.const !== completionId) fail("request completion id mismatch");
if (request.properties?.canonical_source_sha?.const !== sourceSha) fail("request source SHA mismatch");
if (response.properties?.quest_definition_id?.const !== questId) fail("response quest id mismatch");
if (response.properties?.completion_contract_id?.const !== completionId) fail("response completion id mismatch");
if (response.properties?.canonical_source_sha?.const !== sourceSha) fail("response source SHA mismatch");
if (service.day001_rules?.canonical_xp !== quest.canonical?.xp) fail("canonical XP mismatch");
if (service.day001_rules?.first_completion_expected_xp !== quest.canonical?.xp) fail("first completion XP mismatch");
if (service.day001_rules?.replay_expected_xp !== 0) fail("replay XP must be zero");
if (service.transport?.rpc !== "complete_codex_day_v2") fail("unexpected RPC name");
if (service.transport?.deployment_state !== "LIVE") fail("Completion V2 transport must be LIVE");
if (service.deployment?.migration !== migrationId) fail("Completion V2 migration id drift");
if (service.deployment?.public_rpc_security !== "INVOKER") fail("public RPC must remain SECURITY INVOKER");
if (service.deployment?.privileged_impl_schema !== "hnk_private") fail("privileged implementation must remain private");
if (service.deployment?.legacy_rpc_still_enabled !== true) fail("legacy rollout state drift");
if (service.validator_hardening?.json_boolean_types_enforced !== true) fail("strict JSON boolean validation missing");
if (service.validator_hardening?.unknown_fields_rejected !== true) fail("unknown evidence fields must be rejected");
if (service.validator_hardening?.private_prose_in_evidence_rejected !== true) fail("private prose evidence guard missing");
if (service.validator_hardening?.session_id_match_enforced_by_completion_impl !== true) fail("session/evidence identity binding missing");
if (service.migration?.legacy_rpc_must_not_remain_a_v2_bypass !== true) fail("legacy bypass policy missing");
if (service.migration?.v2_server_state !== "ACTIVE") fail("V2 server state must remain ACTIVE");
if (!service.request?.forbidden_authority_fields?.includes("xp_awarded")) fail("client XP authority guard missing");
if (!response.properties?.progression_events) fail("progression events missing from authoritative response");

if (!process.exitCode) console.log("DAY001 COMPLETION SERVICE PASS (V2 live, legacy compatibility gate retained)");
