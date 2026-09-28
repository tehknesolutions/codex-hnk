import fs from 'node:fs';
const sql=fs.readFileSync('supabase/migrations/20260928020000_day074_authoritative_completion.sql','utf8');
const checks=[
 ['rpc',sql.includes('complete_day074_v1')],
 ['auth',sql.includes('auth.uid()')],
 ['exactly three',sql.includes('p_self_accusation_count <> 3')],
 ['portal073 prerequisite',sql.includes('day074_requires_portal073')],
 ['xp 100',sql.includes("100,'day074_first_completion'" )],
 ['xp idempotency',sql.includes("'day074:'||v_user_id::text")],
 ['no private prose payload',!sql.includes('p_statement')&&!sql.includes('p_specificity_answer')],
 ['vault reference only',sql.includes('p_private_vault_entry_ref uuid')],
 ['no auto start',sql.includes("'day075_auto_started',false")],
 ['authenticated only',sql.includes('grant execute')&&sql.includes('to authenticated'))
];
let fail=0;for(const[n,ok]of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)fail++}if(fail)process.exit(1);console.log('DAY074_BACKEND_STATIC_GATE=PASS');
