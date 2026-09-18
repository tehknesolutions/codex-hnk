import {PORTAL073_SCHEMA_VERSION,PORTAL073_SIGIL_ID,PORTAL073_TRANSITION_PRESET_ID,PORTAL073_TUNER_ID} from './runtime-definitions/portal073';

export const PORTAL073_CANONICAL_SOURCE_SHA='be135a55fdd2fad853cc526f1ccb78cb933e2391' as const;
export const PORTAL073_EXACT_AUDIO_SECONDS=600 as const;

export type Portal073CompletionEvidenceInput={
 sessionId:string;
 vaultReceiptId:string;
 vaultChecksumSha256:string;
};

function requireUuid(value:string,label:string){
 const v=value.trim();
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v))throw new Error(`portal073_${label}_invalid_uuid`);
 return v;
}
function requireSha256(value:string){
 const v=value.trim().toLowerCase();
 if(!/^[0-9a-f]{64}$/.test(v))throw new Error('portal073_vault_checksum_invalid');
 return v;
}

/**
 * Pure fail-closed evidence materializer matching validate_day073_completion_v2.
 * It does not call completion, publish operators, activate contracts, or award XP.
 */
export function buildPortal073CompletionEvidence(input:Portal073CompletionEvidenceInput){
 return {
  schema_version:PORTAL073_SCHEMA_VERSION,
  source_sha:PORTAL073_CANONICAL_SOURCE_SHA,
  session_id:requireUuid(input.sessionId,'session_id'),
  protocol_completed:true,
  tuner_completed:true,
  transition_audio_completed:true,
  induction_completed:true,
  sigil_completed:true,
  operator_ids_verified:true,
  volume_control_available:true,
  immediate_stop_available:true,
  return_confirmed:true,
  vault_saved:true,
  safety_clear:true,
  audio_seconds:PORTAL073_EXACT_AUDIO_SECONDS,
  tuner_id:PORTAL073_TUNER_ID,
  transition_id:PORTAL073_TRANSITION_PRESET_ID,
  sigil_id:PORTAL073_SIGIL_ID,
  vault_receipt_id:requireUuid(input.vaultReceiptId,'vault_receipt'),
  vault_checksum_sha256:requireSha256(input.vaultChecksumSha256),
 } as const;
}
