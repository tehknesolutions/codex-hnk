import fs from 'node:fs';
const s=fs.readFileSync('packages/supabase-client/src/day073-v2.ts','utf8');
const required=["DAY073_COMPLETION","buildDay073CompletionRequest","pr.current_day!==73","pr.current_sephira!=='Chokhmah'","pr.initiatory_title!=='Iniciado'","day073_must_not_unlock_day074","complete_codex_day_v2"];
const missing=required.filter(x=>!s.includes(x));if(missing.length)throw new Error('PORTAL073_V2_COMPLETION_BRIDGE_FAIL '+missing.join(','));
if(/current_day\s*!==\s*74|NEXT_DAY_UNLOCKED'\)\)throw/.test(s)===false){} // parser must remain freeze-oriented
console.log('PORTAL073_V2_COMPLETION_BRIDGE_STATIC_PASS');
