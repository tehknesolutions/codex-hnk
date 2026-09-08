-- HNK CODEX — Day 002 Completion Contract V1 (reviewed, intentionally inactive)
-- Applied to Supabase project codex-hnk-app as migration 20260908164103.
-- The contract remains reviewed until AUDIO-002-BINAURAL-528 receives an
-- approved profile id and a follow-up activation migration binds that id.

insert into hnk_private.completion_contract_registry (
  completion_contract_id, quest_definition_id, day, canonical_source_sha,
  contract_version, validator_key, status
) values (
  'HNK-KETHER-D002-COMP-V1', 'HNK-KETHER-D002-V1', 2,
  '71019573414493ee9e5521f4d27ed744748c0d2b', '1', 'day002_v1', 'reviewed'
)
on conflict (completion_contract_id) do update
set quest_definition_id = excluded.quest_definition_id,
    day = excluded.day,
    canonical_source_sha = excluded.canonical_source_sha,
    contract_version = excluded.contract_version,
    validator_key = excluded.validator_key,
    status = 'reviewed',
    updated_at = now();

create or replace function hnk_private.validate_day002_completion_v1(
  p_evidence jsonb,
  p_expected_source_sha text
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_key text;
  v_item text;
  v_allowed_phenomenology constant text[] := array[
    'MOVEMENT_IMPULSES','ITCHING','CALM','AGITATION',
    'BODY_SENSATIONS','SILENCE','NOTHING_SPECIAL','OTHER'
  ];
begin
  if p_evidence is null or p_evidence = '{}'::jsonb or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'evidence_required';
  end if;

  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array[
      'protocol_version','source_sha','session_id','mode','jachin','audio_528_binaural',
      'boaz','middle','phenomenology','soul_mirror','attribute_progression',
      'voluntary_completion_confirmed','safety_stop_occurred'
    ]) then raise exception 'day002_evidence_unknown_field'; end if;
  end loop;

  if jsonb_typeof(p_evidence -> 'protocol_version') <> 'string'
     or p_evidence ->> 'protocol_version' <> 'HNK-KETHER-D002-V1'
  then raise exception 'completion_evidence_protocol_mismatch'; end if;

  if jsonb_typeof(p_evidence -> 'source_sha') <> 'string'
     or p_evidence ->> 'source_sha' <> p_expected_source_sha
  then raise exception 'completion_evidence_source_sha_mismatch'; end if;

  if jsonb_typeof(p_evidence -> 'session_id') <> 'string'
     or nullif(btrim(p_evidence ->> 'session_id'), '') is null
  then raise exception 'day002_session_id_required'; end if;

  if p_evidence ? 'mode' and (
    jsonb_typeof(p_evidence -> 'mode') <> 'string'
    or p_evidence ->> 'mode' not in ('first_completion','revisit')
  ) then raise exception 'day002_mode_invalid'; end if;

  if jsonb_typeof(p_evidence -> 'jachin') <> 'object' then raise exception 'day002_jachin_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'jachin') loop
    if v_key <> all(array['completed','duration_seconds','comfort_rating','return_confirmed'])
    then raise exception 'day002_jachin_unknown_field'; end if;
  end loop;
  if p_evidence #> '{jachin,completed}' <> 'true'::jsonb
     or p_evidence #> '{jachin,return_confirmed}' <> 'true'::jsonb
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{jachin,duration_seconds}')
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{jachin,comfort_rating}')
  then raise exception 'day002_jachin_incomplete'; end if;

  if jsonb_typeof(p_evidence -> 'audio_528_binaural') <> 'object' then raise exception 'day002_audio_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'audio_528_binaural') loop
    if v_key <> all(array['started','profile_id','duration_seconds','stopped_for_discomfort'])
    then raise exception 'day002_audio_unknown_field'; end if;
  end loop;
  if p_evidence #> '{audio_528_binaural,started}' <> 'true'::jsonb
     or jsonb_typeof(p_evidence #> '{audio_528_binaural,profile_id}') <> 'string'
     or nullif(btrim(p_evidence #>> '{audio_528_binaural,profile_id}'), '') is null
  then raise exception 'day002_audio_incomplete'; end if;
  if p_evidence #> '{audio_528_binaural,duration_seconds}' is not null
     and p_evidence #> '{audio_528_binaural,duration_seconds}' <> 'null'::jsonb
     and not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{audio_528_binaural,duration_seconds}')
  then raise exception 'day002_audio_duration_invalid'; end if;
  if p_evidence #> '{audio_528_binaural,stopped_for_discomfort}' is not null
     and jsonb_typeof(p_evidence #> '{audio_528_binaural,stopped_for_discomfort}') <> 'boolean'
  then raise exception 'day002_audio_stop_invalid'; end if;

  if jsonb_typeof(p_evidence -> 'boaz') <> 'object' then raise exception 'day002_boaz_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'boaz') loop
    if v_key <> all(array['completed','duration_seconds','impulse_count','first_five_minutes_reflection_completed','comfort_rating','vault_entry_ref','return_confirmed'])
    then raise exception 'day002_boaz_unknown_field'; end if;
  end loop;
  if p_evidence #> '{boaz,completed}' <> 'true'::jsonb
     or p_evidence #> '{boaz,first_five_minutes_reflection_completed}' <> 'true'::jsonb
     or p_evidence #> '{boaz,return_confirmed}' <> 'true'::jsonb
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{boaz,duration_seconds}')
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{boaz,impulse_count}')
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{boaz,comfort_rating}')
     or not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence #> '{boaz,vault_entry_ref}')
  then raise exception 'day002_boaz_incomplete'; end if;

  if jsonb_typeof(p_evidence -> 'middle') <> 'object' then raise exception 'day002_middle_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'middle') loop
    if v_key <> all(array['completed','duration_seconds','comfort_rating','return_confirmed'])
    then raise exception 'day002_middle_unknown_field'; end if;
  end loop;
  if p_evidence #> '{middle,completed}' <> 'true'::jsonb
     or p_evidence #> '{middle,return_confirmed}' <> 'true'::jsonb
     or not hnk_private.jsonb_is_nonnegative_integer(p_evidence #> '{middle,duration_seconds}')
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{middle,comfort_rating}')
  then raise exception 'day002_middle_incomplete'; end if;

  if p_evidence ? 'phenomenology' then
    if jsonb_typeof(p_evidence -> 'phenomenology') <> 'array' then raise exception 'day002_phenomenology_invalid'; end if;
    if jsonb_array_length(p_evidence -> 'phenomenology') <> (
      select count(distinct value) from jsonb_array_elements_text(p_evidence -> 'phenomenology')
    ) then raise exception 'day002_phenomenology_duplicate'; end if;
    for v_item in select value from jsonb_array_elements_text(p_evidence -> 'phenomenology') loop
      if v_item <> all(v_allowed_phenomenology) then raise exception 'day002_phenomenology_invalid'; end if;
    end loop;
  end if;

  if jsonb_typeof(p_evidence -> 'soul_mirror') <> 'object' then raise exception 'day002_soul_mirror_incomplete'; end if;
  for v_key in select jsonb_object_keys(p_evidence -> 'soul_mirror') loop
    if v_key <> all(array['completed','difficulty_rating','vault_entry_ref'])
    then raise exception 'day002_soul_mirror_unknown_field'; end if;
  end loop;
  if p_evidence #> '{soul_mirror,completed}' <> 'true'::jsonb
     or not hnk_private.jsonb_is_rating_or_null(p_evidence #> '{soul_mirror,difficulty_rating}')
     or not hnk_private.jsonb_is_opaque_ref_or_null(p_evidence #> '{soul_mirror,vault_entry_ref}')
  then raise exception 'day002_soul_mirror_incomplete'; end if;

  if p_evidence ? 'attribute_progression' then
    if jsonb_typeof(p_evidence -> 'attribute_progression') <> 'object'
       or p_evidence #> '{attribute_progression,dis_gain_applied}' <> 'false'::jsonb
       or p_evidence #>> '{attribute_progression,reason}' <> 'ATTRIBUTE_PROGRESSION_MATRIX_V1_PENDING'
    then raise exception 'day002_attribute_progression_invalid'; end if;
    for v_key in select jsonb_object_keys(p_evidence -> 'attribute_progression') loop
      if v_key <> all(array['dis_gain_applied','reason']) then raise exception 'day002_attribute_progression_unknown_field'; end if;
    end loop;
  end if;

  if p_evidence -> 'voluntary_completion_confirmed' <> 'true'::jsonb then raise exception 'voluntary_completion_required'; end if;
  if p_evidence ? 'safety_stop_occurred' and jsonb_typeof(p_evidence -> 'safety_stop_occurred') <> 'boolean'
  then raise exception 'day002_safety_stop_invalid'; end if;
end;
$$;

revoke all on function hnk_private.validate_day002_completion_v1(jsonb, text) from public, anon, authenticated;
