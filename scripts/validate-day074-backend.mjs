import fs from 'node:fs';
const sql=fs.readFileSync('supabase/migrations/20260928020000_day074_authoritative_completion.sql','utf8');
const checks=[
 ['rpc',sql.includes('complete_day074_v1')],
 ['authenticated',sql.includes('auth.uid()')&&sql.includes('to authenticated')],
 ['exactly three',sql.includes('day074_exactly_three_entries_required')],
 ['portal073 prerequisite',sql.includes('day074_requires_portal073')],
 ['canonical source',sql.includes('canonical_source_sha_stale')],
 ['xp from canonical day',sql.includes('select xp,source_sha')],
 ['xp idempotency',sql.includes("v_uid::text||':day:74:completion:")],
 ['completion idempotency',sql.includes('pg_advisory_xact_lock')&&sql.includes('completion_request_receipts')],
 ['existing schema',sql.includes('day,completion_version,local_record_hash')],
 ['no private prose payload',!sql.includes('p_statement')&&!sql.includes('p_specificity_answer')],
 ['vault reference',sql.includes('private_vault_entry_ref')],
 ['no auto start',sql.includes("'day075_auto_started',false")],
 ['fail closed evidence',sql.includes('practice_record_no_private_prose_confirmed')]
];
let fail=0;
for(const [name,ok] of checks){console.log((ok?'PASS ':'FAIL ')+name);if(!ok)fail++}
if(fail)process.exit(1);
console.log('DAY074_BACKEND_STATIC_GATE=PASS');
