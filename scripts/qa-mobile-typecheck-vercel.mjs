import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';

mkdirSync('apps/web/public',{recursive:true});
const run=spawnSync('corepack',['pnpm','--filter','@hnk/mobile','typecheck'],{encoding:'utf8',shell:false});
const output=`${run.stdout??''}${run.stderr??''}`;
writeFileSync('apps/web/public/mobile-typecheck.txt',output||'NO_DIAGNOSTICS\n');
writeFileSync('apps/web/public/mobile-typecheck-exit.txt',`${run.status ?? 255}\n`);
console.log(`MOBILE_TYPECHECK_EXIT=${run.status ?? 255}`);
const web=spawnSync('corepack',['pnpm','--filter','@hnk/web','exec','next','build','--webpack'],{stdio:'inherit',shell:false});
process.exit(web.status ?? 1);
