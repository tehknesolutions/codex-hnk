import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260917193000_freeze_day073_generic_progression_v2.sql';
const sql = fs.readFileSync(migrationPath, 'utf8');

const mustContain = [
  "if p_day = 73 then",
  "set xp_total = xp_total + v_awarded_xp,",
  "if v_new_completion and p_day <> 73 then v_progression_events := v_progression_events || '[\"NEXT_DAY_UNLOCKED\"]'::jsonb; end if;",
  "revoke execute on function hnk_private.complete_codex_day_v2_impl",
  "from public, anon, authenticated;",
];
for (const needle of mustContain) {
  if (!sql.includes(needle)) throw new Error(`PORTAL073_V2_FREEZE_MISSING: ${needle}`);
}
const day73Block = sql.match(/if p_day = 73 then([\s\S]*?)else/);
if (!day73Block) throw new Error('PORTAL073_V2_FREEZE_DAY73_BRANCH_MISSING');
for (const forbidden of ['current_day =', 'current_chapter =', 'current_sephira =', 'initiatory_grade =', 'initiatory_title =']) {
  if (day73Block[1].includes(forbidden)) throw new Error(`PORTAL073_V2_FREEZE_FORBIDDEN_PROGRESSION: ${forbidden}`);
}
if (sql.includes("p_day = 73 then v_progression_events := v_progression_events || '[\"NEXT_DAY_UNLOCKED\"]'")) {
  throw new Error('PORTAL073_V2_FREEZE_NEXT_DAY_EVENT_PRESENT');
}
console.log('PORTAL073_V2_FROZEN_PROGRESSION_STATIC_PASS');
