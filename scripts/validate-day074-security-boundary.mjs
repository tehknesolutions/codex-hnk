import fs from 'node:fs';
const sql=fs.readFileSync('supabase/migrations/20260928023000_day074_security_definer_boundary.sql','utf8');
const checks=[
 ['security definer',sql.includes('alter function public.complete_day074_v1')&&sql.includes('security definer')],
 ['validator locked',sql.includes('revoke all on function hnk_private.validate_day074_completion_v1')],
 ['authenticated execute',sql.includes('grant execute on function public.complete_day074_v1')],
 ['no recursive wrapper',!sql.includes('create or replace function public.complete_day074_v1')],
 ['private schema usage',sql.includes('grant usage on schema hnk_private to authenticated')]
];
let fail=0; for(const [name,ok] of checks){console.log((ok?'PASS ':'FAIL ')+name);if(!ok)fail++}
if(fail)process.exit(1);
console.log('DAY074_SECURITY_BOUNDARY_GATE=PASS');
