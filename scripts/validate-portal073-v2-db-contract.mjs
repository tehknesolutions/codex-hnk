import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260917193000_freeze_day073_generic_progression_v2.sql';
const sql = fs.readFileSync(migrationPath, 'utf8');

const required = [
  ["day073 special branch", /if\s+p_day\s*=\s*73\s+then/i],
  ["generic progression stays outside day073", /else\s+update\s+public\.user_progress[\s\S]*current_day\s*=\s*greatest\(current_day,\s*least\(p_day\s*\+\s*1,\s*365\)\)/i],
  ["day073 suppresses NEXT_DAY_UNLOCKED", /v_new_completion\s+and\s+p_day\s*<>\s*73\s+then\s+v_progression_events\s*:=\s*v_progression_events\s*\|\|\s*'\[\\?"NEXT_DAY_UNLOCKED\\?"\]'/i],
  ["client completion advisory lock", /pg_advisory_xact_lock\([\s\S]*client_completion_id/i],
  ["completion receipt replay", /completion_request_receipts[\s\S]*client_completion_id[\s\S]*for update/i],
  ["day completion exactly once", /on conflict\s*\(user_id,\s*day\)\s*do nothing/i],
  ["xp idempotency key", /on conflict\s*\(idempotency_key\)\s*do nothing/i],
  ["private implementation execute revoked", /revoke execute on function hnk_private\.complete_codex_day_v2_impl[\s\S]*from public, anon, authenticated/i],
];

const forbidden = [
  ["Day073 explicit Day074 unlock", /p_day\s*=\s*73[\s\S]{0,500}(current_day\s*=\s*74|NEXT_DAY_UNLOCKED)/i],
  ["Day073 Binah promotion", /p_day\s*=\s*73[\s\S]{0,700}(current_sephira\s*=\s*'Binah'|initiatory_title\s*=\s*'Teurgo')/i],
];

const failures = [];
for (const [label, re] of required) if (!re.test(sql)) failures.push(`missing: ${label}`);
for (const [label, re] of forbidden) if (re.test(sql)) failures.push(`forbidden: ${label}`);

if (failures.length) {
  console.error('PORTAL073_V2_DB_CONTRACT_FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PORTAL073_V2_DB_CONTRACT_PASS');
console.log('Verified: Day073 frozen progression, completion/XP idempotency primitives, and private EXECUTE revocation.');
