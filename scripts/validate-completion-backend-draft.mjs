import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "docs", "backend-drafts");
const sqlPath = path.join(base, "20260907_complete_codex_day_v2.sql");
const testPath = path.join(base, "20260907_complete_codex_day_v2_pgtap.sql");

const sql = fs.readFileSync(sqlPath, "utf8");
const test = fs.readFileSync(testPath, "utf8");

const fail = (message) => {
  console.error(`COMPLETION BACKEND DRAFT FAIL: ${message}`);
  process.exitCode = 1;
};

for (const token of [
  "completion_contract_registry",
  "completion_request_receipts",
  "validate_day001_completion_v2",
  "complete_codex_day_v2",
  "canonical_source_sha_stale",
  "day001_boaz_distractions_incomplete",
  "client_completion_id_conflict",
  "pg_advisory_xact_lock",
  "on conflict (user_id, day) do nothing",
  "on conflict (idempotency_key) do nothing",
  "KETHER_FIRST_SPARK",
  "NEXT_DAY_UNLOCKED",
]) {
  if (!sql.includes(token)) fail(`missing SQL invariant: ${token}`);
}

if (!/recording is intentionally NOT required/i.test(sql)) {
  fail("Day 001 voice recording optionality is not documented in SQL");
}

if (/grant execute[\s\S]{0,250}to anon/i.test(sql)) {
  fail("draft must never grant completion RPC to anon");
}

if (/revoke all on function public\.complete_codex_day\(/i.test(sql)) {
  fail("draft must not revoke legacy RPC during introduction of V2");
}

for (const token of [
  "V2-XP-001",
  "V2-REPLAY-001",
  "V2-REPLAY-002",
  "V2-EVD-001",
  "V2-CTR-003",
]) {
  if (!test.includes(token)) fail(`missing pgTAP scenario: ${token}`);
}

if (!process.exitCode) console.log("COMPLETION BACKEND DRAFT PASS");
