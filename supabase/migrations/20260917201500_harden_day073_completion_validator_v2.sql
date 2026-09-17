-- Portal073 V2 strict validator, fail-closed release hardening.
-- This migration does NOT publish operators or activate a completion contract.

create or replace function hnk_private.validate_day073_completion_v2(
  p_evidence jsonb,
  p_expected_source_sha text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_allowed_keys constant text[] := array[
    'schema_version','source_sha','session_id',
    'protocol_completed','tuner_completed','transition_audio_completed',
    'induction_completed','sigil_completed','operator_ids_verified',
    'volume_control_available','immediate_stop_available','return_confirmed',
    'vault_saved','safety_clear','audio_seconds',
    'tuner_id','transition_id','sigil_id',
    'vault_receipt_id','vault_checksum_sha256'
  ];
  v_required_true constant text[] := array[
    'protocol_completed','tuner_completed','transition_audio_completed',
    'induction_completed','sigil_completed','operator_ids_verified',
    'volume_control_available','immediate_stop_available','return_confirmed',
    'vault_saved','safety_clear'
  ];
  v_key text;
  v_receipt_id uuid;
  v_receipt_user uuid;
  v_receipt_day smallint;
  v_receipt_checksum text;
begin
  if p_evidence is null or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'day073_invalid_evidence';
  end if;

  if exists (
    select 1 from jsonb_object_keys(p_evidence) as k(key)
    where not (k.key = any(v_allowed_keys))
  ) then
    raise exception 'day073_unknown_evidence_field';
  end if;

  if p_evidence->>'schema_version' is distinct from 'HNK-PORTAL-073-EVIDENCE-V1' then
    raise exception 'day073_schema_version_mismatch';
  end if;

  if nullif(btrim(p_expected_source_sha), '') is null
     or p_expected_source_sha <> 'be135a55fdd2fad853cc526f1ccb78cb933e2391'
     or p_evidence->>'source_sha' is distinct from p_expected_source_sha then
    raise exception 'day073_source_sha_mismatch';
  end if;

  begin
    perform (p_evidence->>'session_id')::uuid;
  exception when invalid_text_representation or null_value_not_allowed then
    raise exception 'day073_session_id_invalid_uuid';
  end;
  if nullif(btrim(coalesce(p_evidence->>'session_id','')), '') is null then
    raise exception 'day073_session_id_invalid_uuid';
  end if;

  foreach v_key in array v_required_true loop
    if jsonb_typeof(p_evidence->v_key) is distinct from 'boolean'
       or p_evidence->v_key is distinct from 'true'::jsonb then
      raise exception 'day073_required_evidence_missing';
    end if;
  end loop;

  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'audio_seconds'), false)
     or (p_evidence->>'audio_seconds')::integer <> 600 then
    raise exception 'day073_audio_seconds_must_equal_600';
  end if;

  if p_evidence->>'tuner_id' is distinct from 'HNK-ANGELIC-TUNER-D073-V1'
     or p_evidence->>'transition_id' is distinct from 'HNK-PORTAL073-CHOKHMAH-BINAH-ACTIVE-V1'
     or p_evidence->>'sigil_id' is distinct from 'HNK-REF-MAGICIAN-MERCURY-V1' then
    raise exception 'day073_operator_identity_mismatch';
  end if;

  if p_evidence ? 'diary_plaintext'
     or p_evidence ? 'notes_plaintext'
     or p_evidence ? 'journal_plaintext' then
    raise exception 'day073_plaintext_evidence_forbidden';
  end if;

  if nullif(btrim(coalesce(p_evidence->>'vault_receipt_id','')), '') is null then
    raise exception 'day073_vault_receipt_required';
  end if;
  begin
    v_receipt_id := (p_evidence->>'vault_receipt_id')::uuid;
  exception when invalid_text_representation then
    raise exception 'day073_vault_receipt_invalid_uuid';
  end;

  if coalesce(p_evidence->>'vault_checksum_sha256','') !~ '^[a-fA-F0-9]{64}$' then
    raise exception 'day073_vault_checksum_invalid';
  end if;

  select j.user_id,j.day,j.checksum_sha256
    into v_receipt_user,v_receipt_day,v_receipt_checksum
  from public.journal_vault j
  where j.id=v_receipt_id
    and nullif(btrim(j.ciphertext),'') is not null
    and nullif(btrim(j.nonce),'') is not null
    and nullif(btrim(coalesce(j.aad,'')),'') is not null
    and nullif(btrim(j.crypto_alg),'') is not null
    and j.crypto_version > 0
    and coalesce(j.checksum_sha256,'') ~ '^[a-fA-F0-9]{64}$';

  if v_receipt_user is null or v_receipt_day <> 73 then
    raise exception 'day073_vault_receipt_not_found_for_day';
  end if;
  if auth.uid() is null or v_receipt_user <> auth.uid() then
    raise exception 'day073_vault_receipt_user_mismatch';
  end if;
  if lower(v_receipt_checksum) <> lower(p_evidence->>'vault_checksum_sha256') then
    raise exception 'day073_vault_receipt_checksum_mismatch';
  end if;
end
$function$;

revoke execute on function hnk_private.validate_day073_completion_v2(jsonb,text)
  from public, anon, authenticated, service_role;
