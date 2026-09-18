import fs from 'node:fs';
const p='apps/mobile/src/features/chokmah/Day073PortalExperienceMobile.tsx';
const s=fs.readFileSync(p,'utf8');
const required=["PORTAL073_TUNER_ID==='HNK-ANGELIC-TUNER-D073-V1'","PORTAL073_TRANSITION_PRESET_ID===HNK_PORTAL073_ACTIVE_PRESET_V1.id","PORTAL073_SIGIL_ID==='HNK-REF-MAGICIAN-MERCURY-V1'","const executable=published&&operators&&ready"];
const missing=required.filter(x=>!s.includes(x));
if(missing.length) throw new Error('PORTAL073_MOBILE_OPERATOR_GATE_FAIL '+missing.join(','));
console.log('PORTAL073_MOBILE_OPERATOR_GATE_PASS');
