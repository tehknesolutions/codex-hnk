-- Portal073 V2 completion contract — DRAFT/LOCKED only.
-- This migration intentionally does NOT activate Day073, award XP, promote Teurgo/Binah,
-- or unlock Day074. It stages the modern V2 validator behind the existing fail-closed release gate.

create or replace function hnk_private.validate_day073_completion_v2(
  p_evidence jsonb,
  p_expected_source_sha text
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_receipt_id uuid;
  v_receipt_user uuid;
  v_receipt_day smallint;
begin
  if p_evidence is null or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'day073_invalid_evidence';
  end if;

  if nullif(btrim(p_expected_source_sha), '') is null then
    raise exception 'day073_missing_expected_source_sha';
  end if;

  if coalesce((p_evidence->>'protocol_completed')::boolean, false) is not true
     or coalesce((p_evidence->>'tuner_completed')::boolean, false) is not true
     or coalesce((p_evidence->>'transition_audio_completed')::boolean, false) is not true
     or coalesce((p_evidence->>'induction_completed')::boolean, false) is not true
     or coalesce((p_evidence->>'sigil_completed')::boolean, false) is not true
     or coalesce((p_evidence->>'operator_ids_verified')::boolean, false) is not true
     or coalesce((p_evidence->>'volume_control_available')::boolean, false) is not true
     or coalesce((p_evidence->>'immediate_stop_available')::boolean, false) is not true
     or coalesce((p_evidence->>'return_confirmed')::boolean, false) is not true
     or coalesce((p_evidence->>'vault_saved')::boolean, false) is not true
     or coalesce((p_evidence->>'safety_clear')::boolean, false) is not true then
    raise exception 'day073_required_evidence_missing';
  end if;

  if coalesce((p_evidence->>'audio_seconds')::integer, -1) <> 600 then
    raise exception 'day073_audio_seconds_must_equal_600';
  end if;

  if p_evidence->>'tuner_id' <> 'HNK-ANGELIC-TUNER-D073-V1'
     or p_evidence->>'transition_id' <> 'HNK-PORTAL073-CHOKHMAH-BINAH-ACTIVE-V1'
     or p_evidence->>'sigil_id' <> 'HNK-REF-MAGICIAN-MERCURY-V1' then
    raise exception 'day073_operator_identity_mismatch';
  end if;

  if nullif(btrim(p_evidence->>'vault_receipt_id'), '') is null then
    raise exception 'day073_vault_receipt_required';
  end if;

  begin
    v_receipt_id := (p_evidence->>'vault_receipt_id')::uuid;
  exception when invalid_text_representation then
    raise exception 'day073_vault_receipt_invalid_uuid';
  end;

  select j.user_id, j.day
    into v_receipt_user, v_receipt_day
  from public.journal_vault j
  where j.id = v_receipt_id;

  if v_receipt_user is null or v_receipt_day <> 73 then
    raise exception 'day073_vault_receipt_not_found_for_day';
  end if;

  if auth.uid() is null or v_receipt_user <> auth.uid() then
    raise exception 'day073_vault_receipt_user_mismatch';
  end if;
end
$$;

-- Register the validator with the generic V2 dispatcher without activating a completion contract.
create or replace function hnk_private.validate_completion_contract_v2(
  p_validator_key text,
  p_evidence jsonb,
  p_expected_source_sha text
)
returns void
language plpgsql
set search_path = ''
as $$
begin
 case p_validator_key
  when 'day001_v2' then perform hnk_private.validate_day001_completion_v2(p_evidence,p_expected_source_sha);
  when 'day002_v1' then perform hnk_private.validate_day002_completion_v1(p_evidence,p_expected_source_sha);
  when 'day003_v1' then perform hnk_private.validate_day003_completion_v1(p_evidence,p_expected_source_sha);
  when 'day004_v1' then perform hnk_private.validate_day004_completion_v1(p_evidence,p_expected_source_sha);
  when 'day005_v1' then perform hnk_private.validate_day005_completion_v1(p_evidence,p_expected_source_sha);
  when 'day006_v1' then perform hnk_private.validate_day006_completion_v1(p_evidence,p_expected_source_sha);
  when 'day007_v1' then perform hnk_private.validate_day007_completion_v1(p_evidence,p_expected_source_sha);
  when 'day008_v1' then perform hnk_private.validate_day008_completion_v1(p_evidence,p_expected_source_sha);
  when 'day009_v1' then perform hnk_private.validate_day009_completion_v1(p_evidence,p_expected_source_sha);
  when 'day010_v1' then perform hnk_private.validate_day010_completion_v1(p_evidence,p_expected_source_sha);
  when 'day011_v1' then perform hnk_private.validate_day011_completion_v1(p_evidence,p_expected_source_sha);
  when 'day012_v1' then perform hnk_private.validate_day012_completion_v1(p_evidence,p_expected_source_sha);
  when 'day013_v1' then perform hnk_private.validate_day013_completion_v1(p_evidence,p_expected_source_sha);
  when 'day014_v1' then perform hnk_private.validate_day014_completion_v1(p_evidence,p_expected_source_sha);
  when 'day015_v1' then perform hnk_private.validate_day015_completion_v1(p_evidence,p_expected_source_sha);
  when 'day016_v1' then perform hnk_private.validate_day016_completion_v1(p_evidence,p_expected_source_sha);
  when 'day017_v1' then perform hnk_private.validate_day017_completion_v1(p_evidence,p_expected_source_sha);
  when 'day018_v1' then perform hnk_private.validate_day018_completion_v1(p_evidence,p_expected_source_sha);
  when 'day019_v1' then perform hnk_private.validate_day019_completion_v1(p_evidence,p_expected_source_sha);
  when 'day020_v1' then perform hnk_private.validate_day020_completion_v1(p_evidence,p_expected_source_sha);
  when 'day021_v1' then perform hnk_private.validate_day021_completion_v1(p_evidence,p_expected_source_sha);
  when 'day022_v1' then perform hnk_private.validate_day022_completion_v1(p_evidence,p_expected_source_sha);
  when 'day023_v1' then perform hnk_private.validate_day023_completion_v1(p_evidence,p_expected_source_sha);
  when 'day024_v1' then perform hnk_private.validate_day024_completion_v1(p_evidence,p_expected_source_sha);
  when 'day025_v1' then perform hnk_private.validate_day025_completion_v1(p_evidence,p_expected_source_sha);
  when 'day026_v1' then perform hnk_private.validate_day026_completion_v1(p_evidence,p_expected_source_sha);
  when 'day027_v1' then perform hnk_private.validate_day027_completion_v1(p_evidence,p_expected_source_sha);
  when 'day028_v1' then perform hnk_private.validate_day028_completion_v1(p_evidence,p_expected_source_sha);
  when 'day029_v1' then perform hnk_private.validate_day029_completion_v1(p_evidence,p_expected_source_sha);
  when 'day030_v1' then perform hnk_private.validate_day030_completion_v1(p_evidence,p_expected_source_sha);
  when 'day031_v1' then perform hnk_private.validate_day031_completion_v1(p_evidence,p_expected_source_sha);
  when 'day032_v1' then perform hnk_private.validate_day032_completion_v1(p_evidence,p_expected_source_sha);
  when 'day033_v1' then perform hnk_private.validate_day033_completion_v1(p_evidence,p_expected_source_sha);
  when 'day034_v1' then perform hnk_private.validate_day034_completion_v1(p_evidence,p_expected_source_sha);
  when 'day035_v1' then perform hnk_private.validate_day035_completion_v1(p_evidence,p_expected_source_sha);
  when 'day036_v1' then perform hnk_private.validate_day036_completion_v1(p_evidence,p_expected_source_sha);
  when 'day037_v1' then perform hnk_private.validate_day037_completion_v1(p_evidence,p_expected_source_sha);
  when 'day038_v1' then perform hnk_private.validate_day038_completion_v1(p_evidence,p_expected_source_sha);
  when 'day039_v1' then perform hnk_private.validate_day039_completion_v1(p_evidence,p_expected_source_sha);
  when 'day040_v2' then perform hnk_private.validate_day040_completion_v2(p_evidence,p_expected_source_sha);
  when 'day041_v2' then perform hnk_private.validate_day041_completion_v2(p_evidence,p_expected_source_sha);
  when 'day042_v2' then perform hnk_private.validate_day042_completion_v2(p_evidence,p_expected_source_sha);
  when 'day043_v2' then perform hnk_private.validate_day043_completion_v2(p_evidence,p_expected_source_sha);
  when 'day044_v2' then perform hnk_private.validate_day044_completion_v2(p_evidence,p_expected_source_sha);
  when 'day045_v2' then perform hnk_private.validate_day045_completion_v2(p_evidence,p_expected_source_sha);
  when 'day046_v2' then perform hnk_private.validate_day046_completion_v2(p_evidence,p_expected_source_sha);
  when 'day047_v2' then perform hnk_private.validate_day047_completion_v2(p_evidence,p_expected_source_sha);
  when 'day048_v2' then perform hnk_private.validate_day048_completion_v2(p_evidence,p_expected_source_sha);
  when 'day049_v2' then perform hnk_private.validate_day049_completion_v2(p_evidence,p_expected_source_sha);
  when 'day050_v2' then perform hnk_private.validate_day050_completion_v2(p_evidence,p_expected_source_sha);
  when 'day051_v2' then perform hnk_private.validate_day051_completion_v2(p_evidence,p_expected_source_sha);
  when 'day052_v2' then perform hnk_private.validate_day052_completion_v2(p_evidence,p_expected_source_sha);
  when 'day053_v2' then perform hnk_private.validate_day053_completion_v2(p_evidence,p_expected_source_sha);
  when 'day054_v2' then perform hnk_private.validate_day054_completion_v2(p_evidence,p_expected_source_sha);
  when 'day055_v2' then perform hnk_private.validate_day055_completion_v2(p_evidence,p_expected_source_sha);
  when 'day056_v2' then perform hnk_private.validate_day056_completion_v2(p_evidence,p_expected_source_sha);
  when 'day057_v2' then perform hnk_private.validate_day057_completion_v2(p_evidence,p_expected_source_sha);
  when 'day058_v2' then perform hnk_private.validate_day058_completion_v2(p_evidence,p_expected_source_sha);
  when 'day059_v2' then perform hnk_private.validate_day059_completion_v2(p_evidence,p_expected_source_sha);
  when 'day060_v2' then perform hnk_private.validate_day060_completion_v2(p_evidence,p_expected_source_sha);
  when 'day061_v2' then perform hnk_private.validate_day061_completion_v2(p_evidence,p_expected_source_sha);
  when 'day062_v2' then perform hnk_private.validate_day062_completion_v2(p_evidence,p_expected_source_sha);
  when 'day063_v2' then perform hnk_private.validate_day063_completion_v2(p_evidence,p_expected_source_sha);
  when 'day064_v2' then perform hnk_private.validate_day064_completion_v2(p_evidence,p_expected_source_sha);
  when 'day065_v2' then perform hnk_private.validate_day065_completion_v2(p_evidence,p_expected_source_sha);
  when 'day066_v2' then perform hnk_private.validate_day066_completion_v2(p_evidence,p_expected_source_sha);
  when 'day067_v2' then perform hnk_private.validate_day067_completion_v2(p_evidence,p_expected_source_sha);
  when 'day068_v2' then perform hnk_private.validate_day068_completion_v2(p_evidence,p_expected_source_sha);
  when 'day069_v2' then perform hnk_private.validate_day069_completion_v2(p_evidence,p_expected_source_sha);
  when 'day070_v2' then perform hnk_private.validate_day070_completion_v2(p_evidence,p_expected_source_sha);
  when 'day071_v2' then perform hnk_private.validate_day071_completion_v2(p_evidence,p_expected_source_sha);
  when 'day072_v2' then perform hnk_private.validate_day072_completion_v2(p_evidence,p_expected_source_sha);
  when 'day073_v2' then perform hnk_private.validate_day073_completion_v2(p_evidence,p_expected_source_sha);
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end
$$;

-- Deliberately absent:
--   * completion_contract_registry row for day 73
--   * ACTIVE status
--   * +500 XP award path
--   * Teurgo/Binah promotion
--   * Day074 unlock/autostart
