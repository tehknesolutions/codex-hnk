create or replace function hnk_private.validate_day059_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare
 b jsonb; g jsonb; c jsonb; m jsonb; legacy jsonb; k text; stopped boolean; r text;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day059_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','blue','gray','comparison','middle','private_vault_entry_ref','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day059_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D059-V2' then raise exception 'day059_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'e0b9b51cac81012e4511e6394c6f3dff7f50aaf8' then raise exception 'day059_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day059_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day059_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day059_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day059_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','OCULAR_DISCOMFORT','HEADACHE','VERTIGO','ANXIETY_INCREASED','DISORIENTATION','OTHER') then raise exception 'day059_v2_safety_reason_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean;
 if stopped and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day059_v2_safety_reason_required'; end if;
 if not stopped and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day059_v2_safety_reason_without_stop'; end if;
 if p_evidence ? 'private_vault_entry_ref' then
  r:=p_evidence->>'private_vault_entry_ref';
  if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day059_v2_private_vault_ref_invalid'; end if;
 end if;

 b:=p_evidence->'blue';
 if jsonb_typeof(b) is distinct from 'object' then raise exception 'day059_v2_blue_required'; end if;
 if exists(select 1 from jsonb_object_keys(b) x where x not in ('measured_seconds','image_present','return_count','sharpness','brightness','ocular_effort','silence','blue_pearl_focus_confirmed','thoughts_released_without_force_confirmed','no_eye_pressure_confirmed','no_forced_brightness_or_silence_confirmed')) then raise exception 'day059_v2_blue_unknown_field'; end if;
 foreach k in array array['blue_pearl_focus_confirmed','thoughts_released_without_force_confirmed','no_eye_pressure_confirmed','no_forced_brightness_or_silence_confirmed'] loop if b->k is distinct from 'true'::jsonb then raise exception 'day059_v2_blue_boundary_required:%',k; end if; end loop;
 if jsonb_typeof(b->'image_present') is distinct from 'boolean' then raise exception 'day059_v2_blue_image_presence_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(b->'measured_seconds'),false) or (b->>'measured_seconds')::integer<900 then raise exception 'day059_v2_blue_900_seconds_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(b->'return_count'),false) then raise exception 'day059_v2_blue_return_count_invalid'; end if;
 foreach k in array array['sharpness','brightness','ocular_effort','silence'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(b->k),false) or (b->>k)::integer>10 then raise exception 'day059_v2_blue_metric_invalid:%',k; end if; end loop;

 g:=p_evidence->'gray';
 if jsonb_typeof(g) is distinct from 'object' then raise exception 'day059_v2_gray_required'; end if;
 if exists(select 1 from jsonb_object_keys(g) x where x not in ('measured_seconds','image_present','return_count','sharpness','brightness','ocular_effort','expectation','neutral_gray_point_confirmed','same_posture_confirmed','same_environment_confirmed','control_not_sabotaged_confirmed')) then raise exception 'day059_v2_gray_unknown_field'; end if;
 foreach k in array array['neutral_gray_point_confirmed','same_posture_confirmed','same_environment_confirmed','control_not_sabotaged_confirmed'] loop if g->k is distinct from 'true'::jsonb then raise exception 'day059_v2_gray_boundary_required:%',k; end if; end loop;
 if jsonb_typeof(g->'image_present') is distinct from 'boolean' then raise exception 'day059_v2_gray_image_presence_invalid'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(g->'measured_seconds'),false) or (g->>'measured_seconds')::integer<900 then raise exception 'day059_v2_gray_900_seconds_required'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(g->'return_count'),false) then raise exception 'day059_v2_gray_return_count_invalid'; end if;
 foreach k in array array['sharpness','brightness','ocular_effort','expectation'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(g->k),false) or (g->>k)::integer>10 then raise exception 'day059_v2_gray_metric_invalid:%',k; end if; end loop;

 c:=p_evidence->'comparison';
 if jsonb_typeof(c) is distinct from 'object' then raise exception 'day059_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('completed_confirmed','compared_only_after_both_confirmed','interpretation_separated_confirmed','clairvoyance_not_claimed_confirmed','reason_preserved_confirmed','difference_not_external_mechanism_proof_confirmed','absence_valid_confirmed','high_impact_not_used_confirmed')) then raise exception 'day059_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','compared_only_after_both_confirmed','interpretation_separated_confirmed','clairvoyance_not_claimed_confirmed','reason_preserved_confirmed','difference_not_external_mechanism_proof_confirmed','absence_valid_confirmed','high_impact_not_used_confirmed'] loop if c->k is distinct from 'true'::jsonb then raise exception 'day059_v2_comparison_boundary_required:%',k; end if; end loop;

 m:=p_evidence->'middle';
 if jsonb_typeof(m) is distinct from 'object' then raise exception 'day059_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_10_1_confirmed','he_he_aleph_confirmed','instrumental_observation_named_confirmed','sensation_named_confirmed','traditional_symbol_named_confirmed','open_hypothesis_named_confirmed','thanks_to_god_confirmed','conscious_return_confirmed','grounding_three_objects_confirmed')) then raise exception 'day059_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_10_1_confirmed','he_he_aleph_confirmed','instrumental_observation_named_confirmed','sensation_named_confirmed','traditional_symbol_named_confirmed','open_hypothesis_named_confirmed','thanks_to_god_confirmed','conscious_return_confirmed','grounding_three_objects_confirmed'] loop if m->k is distinct from 'true'::jsonb then raise exception 'day059_v2_middle_boundary_required:%',k; end if; end loop;

 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'conscious_return_confirmed','blue_completed',true,'gray_completed',true,'comparison_completed',c->'completed_confirmed','interpretation_separated',c->'interpretation_separated_confirmed','clarivoyance_not_claimed',c->'clairvoyance_not_claimed_confirmed','reason_preserved',c->'reason_preserved_confirmed','safety_clear',p_evidence->'final_safety_clear_confirmed','blue_image_present',b->'image_present','gray_image_present',g->'image_present','blue_seconds',b->'measured_seconds','gray_seconds',g->'measured_seconds');
 perform hnk_private.validate_day059_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_hahaiah_057_061_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day not in (57,58,59,60,61) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
 if v_status is distinct from 'canon' then raise exception 'hahaiah_canonical_day_not_available'; end if;
 if new.day=57 then
  if v_source_sha is distinct from 'deb6305d38b89a4168ad5cff083d2b96e7a7fec4' then raise exception 'day057_canonical_source_sha_mismatch'; end if;
  if new.evidence->>'protocol_version'='HNK-CHOKMAH-D057-V2' then perform hnk_private.validate_day057_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day057_scalar_evidence_v1(new.evidence); end if;
 elsif new.day=58 then
  if v_source_sha is distinct from 'e32753a57daab23d378e881451194b0dd77d8aac' then raise exception 'day058_canonical_source_sha_mismatch'; end if;
  if new.evidence->>'protocol_version'='HNK-CHOKMAH-D058-V2' then perform hnk_private.validate_day058_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day058_scalar_evidence_v1(new.evidence); end if;
 elsif new.day=59 then
  if v_source_sha is distinct from 'e0b9b51cac81012e4511e6394c6f3dff7f50aaf8' then raise exception 'day059_canonical_source_sha_mismatch'; end if;
  if new.evidence->>'protocol_version'='HNK-CHOKMAH-D059-V2' then perform hnk_private.validate_day059_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day059_scalar_evidence_v1(new.evidence); end if;
 elsif new.day=60 then
  if v_source_sha is distinct from 'e98e8925c8e03555c39b033813999d6a488149a9' then raise exception 'day060_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day060_scalar_evidence_v1(new.evidence);
 else
  if v_source_sha is distinct from '12e4c2da623f2f78d3fea3ff65e23f9446f9784b' then raise exception 'day061_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day061_scalar_evidence_v1(new.evidence);
 end if;
 return new;
end$$;

do $$ declare v_def text; v_old text; v_new text; begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day059_v2''' in v_def)=0 then
  v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
  if position(v_old in v_def)=0 then raise exception 'day059_dispatcher_patch_anchor_missing'; end if;
  v_new:='  when ''day059_v2'' then perform hnk_private.validate_day059_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
  v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D059-COMP-V2','HNK-CHOKMAH-D059-V2',59,'e0b9b51cac81012e4511e6394c6f3dff7f50aaf8','2.0.0','day059_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
