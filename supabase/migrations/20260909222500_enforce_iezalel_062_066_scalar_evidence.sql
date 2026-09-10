-- Strict first-completion evidence for canonical Iezalel Days 062-066.
-- Private narrative remains in Vault; Gneo Geo is pinned to the canonical master ID.

create or replace function hnk_private.validate_day062_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day062_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','interpretation_separated','external_message_not_claimed','ear_safety_respected','risk_context_avoided','persistent_voice_not_reinforced','safety_clear','earplugs_used','active_sound_present','control_sound_present','active_seconds','control_seconds']) then raise exception 'day062_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb or p_evidence->'return_confirmed' is distinct from 'true'::jsonb or p_evidence->'active_completed' is distinct from 'true'::jsonb or p_evidence->'control_completed' is distinct from 'true'::jsonb or p_evidence->'comparison_completed' is distinct from 'true'::jsonb or p_evidence->'interpretation_separated' is distinct from 'true'::jsonb or p_evidence->'external_message_not_claimed' is distinct from 'true'::jsonb or p_evidence->'ear_safety_respected' is distinct from 'true'::jsonb or p_evidence->'risk_context_avoided' is distinct from 'true'::jsonb or p_evidence->'persistent_voice_not_reinforced' is distinct from 'true'::jsonb or p_evidence->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day062_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'earplugs_used') is distinct from 'boolean' or jsonb_typeof(p_evidence->'active_sound_present') is distinct from 'boolean' or jsonb_typeof(p_evidence->'control_sound_present') is distinct from 'boolean' then raise exception 'day062_presence_flag_invalid'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'active_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_seconds'),false) or (p_evidence->>'active_seconds')::integer < 1 or (p_evidence->>'control_seconds')::integer < 1 then raise exception 'day062_duration_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day063_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day063_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array['protocol_completed','return_confirmed','criticism_preregistered','caricature_completed','neutral_reframe_completed','comparison_completed','action_reviewed','external_voice_not_reinforced','self_insult_not_added','vault_saved','safety_clear','action_needed']) then raise exception 'day063_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb or p_evidence->'return_confirmed' is distinct from 'true'::jsonb or p_evidence->'criticism_preregistered' is distinct from 'true'::jsonb or p_evidence->'caricature_completed' is distinct from 'true'::jsonb or p_evidence->'neutral_reframe_completed' is distinct from 'true'::jsonb or p_evidence->'comparison_completed' is distinct from 'true'::jsonb or p_evidence->'action_reviewed' is distinct from 'true'::jsonb or p_evidence->'external_voice_not_reinforced' is distinct from 'true'::jsonb or p_evidence->'self_insult_not_added' is distinct from 'true'::jsonb or p_evidence->'vault_saved' is distinct from 'true'::jsonb or p_evidence->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day063_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'action_needed') is distinct from 'boolean' then raise exception 'day063_action_flag_invalid'; end if;
end; $$;

create or replace function hnk_private.validate_day064_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text; v_vocal integer; v_active integer; v_control integer;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day064_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array['protocol_completed','return_confirmed','vocalization_completed','active_writing_completed','control_writing_completed','comparison_completed','content_classified','automatic_authority_not_claimed','high_impact_decision_suspended','threatening_content_not_reinforced','vault_saved','safety_clear','vocal_seconds','active_write_seconds','control_write_seconds']) then raise exception 'day064_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb or p_evidence->'return_confirmed' is distinct from 'true'::jsonb or p_evidence->'vocalization_completed' is distinct from 'true'::jsonb or p_evidence->'active_writing_completed' is distinct from 'true'::jsonb or p_evidence->'control_writing_completed' is distinct from 'true'::jsonb or p_evidence->'comparison_completed' is distinct from 'true'::jsonb or p_evidence->'content_classified' is distinct from 'true'::jsonb or p_evidence->'automatic_authority_not_claimed' is distinct from 'true'::jsonb or p_evidence->'high_impact_decision_suspended' is distinct from 'true'::jsonb or p_evidence->'threatening_content_not_reinforced' is distinct from 'true'::jsonb or p_evidence->'vault_saved' is distinct from 'true'::jsonb or p_evidence->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day064_required_flag_missing'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'vocal_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'active_write_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_write_seconds'),false) then raise exception 'day064_duration_invalid'; end if;
  v_vocal := (p_evidence->>'vocal_seconds')::integer; v_active := (p_evidence->>'active_write_seconds')::integer; v_control := (p_evidence->>'control_write_seconds')::integer;
  if v_vocal < 1 or v_vocal > 600 or v_active < 300 or v_control < 300 then raise exception 'day064_duration_out_of_contract'; end if;
end; $$;

create or replace function hnk_private.validate_day065_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day065_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','photo_not_uploaded','third_party_identity_not_stored','third_party_symptoms_not_collected','cure_not_claimed','remote_effect_not_claimed','professional_care_not_replaced','concrete_care_considered','safety_clear','photo_used_locally','consent_applicable','consent_confirmed_if_applicable','active_effect_present','control_effect_present','active_seconds','control_seconds']) then raise exception 'day065_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb or p_evidence->'return_confirmed' is distinct from 'true'::jsonb or p_evidence->'active_completed' is distinct from 'true'::jsonb or p_evidence->'control_completed' is distinct from 'true'::jsonb or p_evidence->'comparison_completed' is distinct from 'true'::jsonb or p_evidence->'photo_not_uploaded' is distinct from 'true'::jsonb or p_evidence->'third_party_identity_not_stored' is distinct from 'true'::jsonb or p_evidence->'third_party_symptoms_not_collected' is distinct from 'true'::jsonb or p_evidence->'cure_not_claimed' is distinct from 'true'::jsonb or p_evidence->'remote_effect_not_claimed' is distinct from 'true'::jsonb or p_evidence->'professional_care_not_replaced' is distinct from 'true'::jsonb or p_evidence->'concrete_care_considered' is distinct from 'true'::jsonb or p_evidence->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day065_required_flag_missing'; end if;
  if jsonb_typeof(p_evidence->'photo_used_locally') is distinct from 'boolean' or jsonb_typeof(p_evidence->'consent_applicable') is distinct from 'boolean' or jsonb_typeof(p_evidence->'consent_confirmed_if_applicable') is distinct from 'boolean' or jsonb_typeof(p_evidence->'active_effect_present') is distinct from 'boolean' or jsonb_typeof(p_evidence->'control_effect_present') is distinct from 'boolean' then raise exception 'day065_presence_flag_invalid'; end if;
  if p_evidence->'consent_applicable' = 'true'::jsonb and p_evidence->'consent_confirmed_if_applicable' is distinct from 'true'::jsonb then raise exception 'day065_consent_required'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'active_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_seconds'),false) or (p_evidence->>'active_seconds')::integer < 1 or (p_evidence->>'control_seconds')::integer < 1 then raise exception 'day065_duration_incomplete'; end if;
end; $$;

create or replace function hnk_private.validate_day066_scalar_evidence_v1(p_evidence jsonb)
returns void language plpgsql set search_path = '' as $$
declare v_key text;
begin
  if p_evidence is null or p_evidence='{}'::jsonb or jsonb_typeof(p_evidence)<>'object' then raise exception 'day066_evidence_required'; end if;
  for v_key in select jsonb_object_keys(p_evidence) loop
    if v_key <> all(array['protocol_completed','return_confirmed','active_completed','control_completed','comparison_completed','master_verified','pearl_centered','eight_nodes_preserved','nodes_circuits_kept_distinct','no_route_invented','external_travel_not_claimed','orientation_restored','safety_clear','gneo_master_id','active_seconds','control_seconds']) then raise exception 'day066_evidence_unknown_field'; end if;
  end loop;
  if p_evidence->'protocol_completed' is distinct from 'true'::jsonb or p_evidence->'return_confirmed' is distinct from 'true'::jsonb or p_evidence->'active_completed' is distinct from 'true'::jsonb or p_evidence->'control_completed' is distinct from 'true'::jsonb or p_evidence->'comparison_completed' is distinct from 'true'::jsonb or p_evidence->'master_verified' is distinct from 'true'::jsonb or p_evidence->'pearl_centered' is distinct from 'true'::jsonb or p_evidence->'eight_nodes_preserved' is distinct from 'true'::jsonb or p_evidence->'nodes_circuits_kept_distinct' is distinct from 'true'::jsonb or p_evidence->'no_route_invented' is distinct from 'true'::jsonb or p_evidence->'external_travel_not_claimed' is distinct from 'true'::jsonb or p_evidence->'orientation_restored' is distinct from 'true'::jsonb or p_evidence->'safety_clear' is distinct from 'true'::jsonb then raise exception 'day066_required_flag_missing'; end if;
  if p_evidence->>'gneo_master_id' is distinct from 'cockpit-gneo-geo-hnk-master-v1.svg' then raise exception 'day066_gneo_master_mismatch'; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'active_seconds'),false) or not coalesce(hnk_private.jsonb_is_nonnegative_integer(p_evidence->'control_seconds'),false) or (p_evidence->>'active_seconds')::integer < 1 or (p_evidence->>'control_seconds')::integer < 1 then raise exception 'day066_duration_incomplete'; end if;
end; $$;

revoke all on function hnk_private.validate_day062_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day063_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day064_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day065_scalar_evidence_v1(jsonb) from public, anon, authenticated;
revoke all on function hnk_private.validate_day066_scalar_evidence_v1(jsonb) from public, anon, authenticated;

create or replace function hnk_private.enforce_iezalel_062_066_scalar_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
  if new.day not in (62,63,64,65,66) or new.state not in ('evidence_pending','complete') then return new; end if;
  select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
  if v_existing then return new; end if;
  select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
  if v_status is distinct from 'canon' then raise exception 'iezalel_canonical_day_not_available'; end if;
  if new.day=62 then
    if v_source_sha is distinct from '56a8aaafbd2d602324ecfb9c06da39563fefaaf6' then raise exception 'day062_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day062_scalar_evidence_v1(new.evidence);
  elsif new.day=63 then
    if v_source_sha is distinct from 'b9c9872ddf618aff3f515f601b3abfd611dace46' then raise exception 'day063_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day063_scalar_evidence_v1(new.evidence);
  elsif new.day=64 then
    if v_source_sha is distinct from 'fb05d22be494099a5a1d3e1e0f5480ecc6c072cb' then raise exception 'day064_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day064_scalar_evidence_v1(new.evidence);
  elsif new.day=65 then
    if v_source_sha is distinct from '8d8cd2a39fb05be283b8326fa258ed547b40f442' then raise exception 'day065_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day065_scalar_evidence_v1(new.evidence);
  else
    if v_source_sha is distinct from 'a6d48785ee355f734cadda61b0bb3810b125bf5e' then raise exception 'day066_canonical_source_sha_mismatch'; end if;
    perform hnk_private.validate_day066_scalar_evidence_v1(new.evidence);
  end if;
  return new;
end; $$;

revoke all on function hnk_private.enforce_iezalel_062_066_scalar_evidence() from public, anon, authenticated;

drop trigger if exists practice_sessions_enforce_iezalel_062_066_evidence on public.practice_sessions;
create trigger practice_sessions_enforce_iezalel_062_066_evidence before insert or update of state,evidence,day,user_id on public.practice_sessions for each row execute function hnk_private.enforce_iezalel_062_066_scalar_evidence();
