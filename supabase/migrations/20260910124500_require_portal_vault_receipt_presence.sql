-- Portal completion must reference a real encrypted Vault row owned by the
-- authenticated user for the same Portal Day. A non-empty receipt string alone
-- is not completion evidence.

create or replace function hnk_private.assert_portal_completion_evidence(
  p_day smallint,
  p_evidence jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cfg hnk_private.portal_operator_sets%rowtype;
  v_source_sha text;
  v_source_status text;
  v_uid uuid := auth.uid();
  v_vault_receipt text;
begin
  if p_day not in (73, 109) then
    return;
  end if;

  select * into v_cfg
  from hnk_private.portal_operator_sets
  where portal_day = p_day;

  if not found or v_cfg.status <> 'published' then
    raise exception 'portal_operators_not_published';
  end if;

  if p_evidence is null or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'portal_structural_evidence_required';
  end if;

  if coalesce(p_evidence ->> 'schema_version', '') <> v_cfg.evidence_schema_version then
    raise exception 'portal_evidence_schema_mismatch';
  end if;

  if coalesce(p_evidence ->> 'tuner_preset_id', '') <> v_cfg.tuner_preset_id
     or coalesce(p_evidence ->> 'transition_preset_id', '') <> v_cfg.transition_preset_id
     or coalesce(p_evidence ->> 'sigil_asset_id', '') <> v_cfg.sigil_asset_id then
    raise exception 'portal_operator_version_mismatch';
  end if;

  if coalesce(p_evidence ->> 'induction_completed', 'false') <> 'true' then
    raise exception 'portal_induction_required';
  end if;

  if coalesce(p_evidence ->> 'return_gate_confirmed', 'false') <> 'true' then
    raise exception 'portal_return_gate_required';
  end if;

  v_vault_receipt := nullif(btrim(coalesce(p_evidence ->> 'vault_receipt', '')), '');
  if v_vault_receipt is null then
    raise exception 'portal_encrypted_vault_receipt_required';
  end if;

  if v_uid is null then
    raise exception 'authentication_required';
  end if;

  if not exists (
    select 1
    from public.journal_vault v
    where v.id::text = v_vault_receipt
      and v.user_id = v_uid
      and v.day = p_day
      and nullif(btrim(v.ciphertext), '') is not null
      and nullif(btrim(v.nonce), '') is not null
      and nullif(btrim(coalesce(v.aad, '')), '') is not null
      and nullif(btrim(v.crypto_alg), '') is not null
      and v.crypto_version > 0
      and coalesce(v.checksum_sha256, '') ~ '^[a-fA-F0-9]{64}$'
  ) then
    raise exception 'portal_encrypted_vault_receipt_not_found';
  end if;

  if p_evidence ? 'diary_plaintext'
     or p_evidence ? 'notes_plaintext'
     or p_evidence ? 'journal_plaintext' then
    raise exception 'portal_plaintext_evidence_forbidden';
  end if;

  if p_day = 73 then
    select source_sha, status into v_source_sha, v_source_status
    from public.codex_days where day = 73;

    if v_source_status is distinct from 'canon' then
      raise exception 'portal073_canonical_day_not_available';
    end if;

    if v_source_sha is distinct from 'be135a55fdd2fad853cc526f1ccb78cb933e2391' then
      raise exception 'portal073_canonical_source_sha_mismatch';
    end if;

    if p_evidence->'tuner_completed' is distinct from 'true'::jsonb
       or p_evidence->'transition_audio_completed' is distinct from 'true'::jsonb
       or p_evidence->'sigil_completed' is distinct from 'true'::jsonb
       or p_evidence->'operator_ids_verified' is distinct from 'true'::jsonb
       or p_evidence->'volume_control_available' is distinct from 'true'::jsonb
       or p_evidence->'immediate_stop_available' is distinct from 'true'::jsonb
       or p_evidence->'safety_clear' is distinct from 'true'::jsonb
    then
      raise exception 'portal073_required_operator_checkpoint_missing';
    end if;

    if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'audio_seconds'), false)
       or (p_evidence->>'audio_seconds')::integer <> 600 then
      raise exception 'portal073_audio_duration_mismatch';
    end if;
  end if;
end;
$$;

revoke all on function hnk_private.assert_portal_completion_evidence(smallint, jsonb)
from public, anon, authenticated;
