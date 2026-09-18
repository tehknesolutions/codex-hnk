import fs from 'node:fs';
const s=fs.readFileSync('apps/mobile/src/features/chokmah/Day073PortalExperienceMobile.tsx','utf8');
const required=["buildPortal073CompletionEvidence","sealEvidenceReady=published&&operators&&ready&&seconds===TARGET&&induction&&sigil&&returned&&safe&&Boolean(receipt)&&Boolean(checksum)","portal073_preseal_validated__completion_not_sent","VALIDAR PRÉ-SELO · SEM ENVIAR"];
const missing=required.filter(x=>!s.includes(x));
if(missing.length)throw new Error('PORTAL073_MOBILE_PRESEAL_FAIL '+missing.join(','));
if(/sealDay073V2|complete_codex_day_v2/.test(s))throw new Error('PORTAL073_MOBILE_PRESEAL_FAIL completion_must_remain_disconnected');
console.log('PORTAL073_MOBILE_PRESEAL_STATIC_PASS');
