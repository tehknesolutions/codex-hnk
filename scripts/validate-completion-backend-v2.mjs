import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationPath = path.join(
  root,
  "supabase",
  "migrations",
  "20260908011647_day001_completion_contract_v2.sql",
);
const sql = fs.readFileSync(migrationPath, "utf8");

const fail = (message) => {
  console.error(`COMPLETION BACKEND V2 FAIL: ${message}`);
  process.exitCode = 1;
};

for (const token of [
  "completion_contract_registry",
  "completion_request_receipts",
  "validate_day001_completion_v2",
  "complete_codex_day_v2_impl",
  "public.complete_codex_day_v2",
  "security invoker",
  "security definer",
  "set search_path = ''",
  "pg_advisory_xact_lock",
  "completion_evidence_session_mismatch",
  "day001_evidence_unknown_field",
  "jsonb_is_nonnegative_integer",
  "jsonb_is_rating_or_null",
  "jsonb_is_opaque_ref_or_null",
  "encrypted_voice_ref_required",
  "on conflict (user_id, day) do nothing",
  "on conflict (idempotency_key) do nothing",
  "KETHER_FIRST_SPARK",
  "NEXT_DAY_UNLOCKED",
  "completion_request_receipts_day_idx",
  "completion_request_receipts_session_idx",
  "completion_request_receipts_contract_idx",
]) {
  if (!sql.toLowerCase().includes(token.toLowerCase())) {
    fail(`missing migration invariant: ${token}`);
  }
}

if (!/create or replace function\s+public\.complete_codex_day_v2[\s\S]*?language sql[\s\S]*?security invoker/i.test(sql)) {
  fail("public V2 RPC must remain SECURITY INVOKER");
}

if (!/create or replace function\s+hnk_private\.complete_codex_day_v2_impl[\s\S]*?security definer[\s\S]*?set search_path\s*=\s*''/i.test(sql)) {
  fail("privileged V2 implementation must remain private, SECURITY DEFINER, with empty search_path");
}

if (/grant execute[\s\S]{0,300}\bto\s+anon\b/i.test(sql)) {
  fail("V2 must never grant execute to anon");
}

if (/revoke\s+(?:all|execute)[\s\S]{0,160}public\.complete_codex_day\s*\(/i.test(sql)) {
  fail("V2 introduction migration must not revoke the legacy RPC before client cutover");
}

if (!/voice_recorded[\s\S]*encrypted_voice_ref_required/i.test(sql)) {
  fail("voice recording/ref conditional validation missing");
}

if (!process.exitCode) {
  console.log("COMPLETION BACKEND V2 PASS (applied migration contract frozen)");
}
