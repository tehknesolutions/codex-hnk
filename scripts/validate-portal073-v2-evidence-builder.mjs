import fs from 'node:fs';
const p='apps/mobile/src/features/chokmah/portal073-completion-evidence.ts';
const s=fs.readFileSync(p,'utf8');
const required=[
"HNK-PORTAL-073-EVIDENCE-V1",
"be135a55fdd2fad853cc526f1ccb78cb933e2391",
"PORTAL073_EXACT_AUDIO_SECONDS=600",
"protocol_completed:true","tuner_completed:true","transition_audio_completed:true","induction_completed:true","sigil_completed:true","operator_ids_verified:true",
"volume_control_available:true","immediate_stop_available:true","return_confirmed:true","vault_saved:true","safety_clear:true",
"tuner_id:PORTAL073_TUNER_ID","transition_id:PORTAL073_TRANSITION_PRESET_ID","sigil_id:PORTAL073_SIGIL_ID",
"vault_receipt_id:requireUuid","vault_checksum_sha256:requireSha256"
];
const missing=required.filter(x=>!s.includes(x));
if(missing.length)throw new Error('PORTAL073_V2_EVIDENCE_BUILDER_FAIL '+missing.join(','));
if(/complete_codex_day|PORTAL073_PRODUCTION_ENABLED\s*=\s*true|NEXT_DAY_UNLOCKED/.test(s))throw new Error('PORTAL073_V2_EVIDENCE_BUILDER_FAIL forbidden_release_side_effect');
console.log('PORTAL073_V2_EVIDENCE_BUILDER_STATIC_PASS');
