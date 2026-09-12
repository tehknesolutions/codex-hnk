create or replace function hnk_private.validate_day043_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare b jsonb; g jsonb; m jsonb; soul jsonb; r text; k text; stopped boolean; reason text; legacy jsonb; mode_text text;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day043_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','blue','gray','middle','soul_mirror','voluntary_completion_confirmed','final_protocol_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day043_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D043-V2' then raise exception 'day043_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'f1c8fa153f91ab0e7b3536c8b900ea438fa3b616' then raise exception 'day043_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day043_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day043_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day043_v2_voluntary_completion_required'; end if;
 if p_evidence->'final_protocol_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day043_v2_final_safety_clear_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day043_v2_safety_stop_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean; reason:=p_evidence->>'safety_stop_reason';
 if reason not in ('NONE','EYE_PAIN','HEADACHE','PERSISTENT_FLASHES_EYES_OPEN','PERSISTENT_VISUAL_CHANGE','OTHER_DISCOMFORT') then raise exception 'day043_v2_safety_reason_invalid'; end if;
 if stopped and reason='NONE' then raise exception 'day043_v2_safety_reason_required'; end if;
 if not stopped and reason<>'NONE' then raise exception 'day043_v2_safety_reason_without_stop'; end if;
 b:=p_evidence->'blue'; if jsonb_typeof(b) is distinct from 'object' then raise exception 'day043_v2_blue_required'; end if;
 if exists(select 1 from jsonb_object_keys(b) x where x not in ('duration_seconds','dark_safe_environment_confirmed','eyes_closed_without_squeezing_confirmed','gaze_at_rest_confirmed','eye_chasing_absent_confirmed','content_present','content_mode','latency_seconds','brightness','sharpness','max_duration_seconds','disappearance_count','reconstruction_count','movement_present','eye_effort','external_object_not_claimed_confirmed','clairvoyance_not_claimed_confirmed','returned_oriented_confirmed','vault_entry_ref')) then raise exception 'day043_v2_blue_unknown_field'; end if;
 if b->'duration_seconds' is distinct from '600'::jsonb then raise exception 'day043_v2_blue_600_required'; end if;
 if jsonb_typeof(b->'content_present') is distinct from 'boolean' or jsonb_typeof(b->'movement_present') is distinct from 'boolean' then raise exception 'day043_v2_blue_presence_flag_invalid'; end if;
 mode_text:=b->>'content_mode'; if mode_text not in ('ABSENT','DELIBERATE','SPONTANEOUS','MIXED') then raise exception 'day043_v2_blue_content_mode_invalid'; end if;
 if not (b->>'content_present')::boolean and mode_text<>'ABSENT' then raise exception 'day043_v2_blue_absent_content_requires_absent_mode'; end if;
 if (b->>'content_present')::boolean and mode_text='ABSENT' then raise exception 'day043_v2_blue_present_content_requires_non_absent_mode'; end if;
 foreach k in array array['latency_seconds','brightness','sharpness','max_duration_seconds','disappearance_count','reconstruction_count','eye_effort'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(b->k),false) then raise exception 'day043_v2_blue_scalar_invalid:%',k; end if; end loop;
 if (b->>'latency_seconds')::int>600 or (b->>'brightness')::int>10 or (b->>'sharpness')::int>10 or (b->>'max_duration_seconds')::int>600 or (b->>'disappearance_count')::int>9999 or (b->>'reconstruction_count')::int>9999 or (b->>'eye_effort')::int>10 then raise exception 'day043_v2_blue_scalar_invalid'; end if;
 if not (b->>'content_present')::boolean and ((b->>'brightness')::int<>0 or (b->>'sharpness')::int<>0 or (b->>'max_duration_seconds')::int<>0 or (b->>'movement_present')::boolean) then raise exception 'day043_v2_blue_absent_content_metrics_must_be_zero'; end if;
 if b->'dark_safe_environment_confirmed' is distinct from 'true'::jsonb or b->'eyes_closed_without_squeezing_confirmed' is distinct from 'true'::jsonb or b->'gaze_at_rest_confirmed' is distinct from 'true'::jsonb or b->'eye_chasing_absent_confirmed' is distinct from 'true'::jsonb or b->'external_object_not_claimed_confirmed' is distinct from 'true'::jsonb or b->'clairvoyance_not_claimed_confirmed' is distinct from 'true'::jsonb or b->'returned_oriented_confirmed' is distinct from 'true'::jsonb then raise exception 'day043_v2_blue_boundaries_required'; end if;
 r:=b->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day043_v2_blue_vault_ref_invalid'; end if;
 g:=p_evidence->'gray'; if jsonb_typeof(g) is distinct from 'object' then raise exception 'day043_v2_gray_required'; end if;
 if exists(select 1 from jsonb_object_keys(g) x where x not in ('duration_seconds','same_size_position_confirmed','control_not_sabotaged_confirmed','content_present','content_mode','latency_seconds','brightness','sharpness','stability','recovery_count','movement_present','eye_effort','three_real_objects_named_confirmed','comparison_after_separate_records_confirmed','alternative_explanations_recorded_confirmed','difference_not_external_or_astral_proof_confirmed','vault_entry_ref')) then raise exception 'day043_v2_gray_unknown_field'; end if;
 if g->'duration_seconds' is distinct from '600'::jsonb then raise exception 'day043_v2_gray_600_required'; end if;
 if jsonb_typeof(g->'content_present') is distinct from 'boolean' or jsonb_typeof(g->'movement_present') is distinct from 'boolean' then raise exception 'day043_v2_gray_presence_flag_invalid'; end if;
 mode_text:=g->>'content_mode'; if mode_text not in ('ABSENT','DELIBERATE','SPONTANEOUS','MIXED') then raise exception 'day043_v2_gray_content_mode_invalid'; end if;
 if not (g->>'content_present')::boolean and mode_text<>'ABSENT' then raise exception 'day043_v2_gray_absent_content_requires_absent_mode'; end if;
 if (g->>'content_present')::boolean and mode_text='ABSENT' then raise exception 'day043_v2_gray_present_content_requires_non_absent_mode'; end if;
 foreach k in array array['latency_seconds','brightness','sharpness','stability','recovery_count','eye_effort'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(g->k),false) then raise exception 'day043_v2_gray_scalar_invalid:%',k; end if; end loop;
 if (g->>'latency_seconds')::int>600 or (g->>'brightness')::int>10 or (g->>'sharpness')::int>10 or (g->>'stability')::int>10 or (g->>'recovery_count')::int>9999 or (g->>'eye_effort')::int>10 then raise exception 'day043_v2_gray_scalar_invalid'; end if;
 if not (g->>'content_present')::boolean and ((g->>'brightness')::int<>0 or (g->>'sharpness')::int<>0 or (g->>'stability')::int<>0 or (g->>'movement_present')::boolean) then raise exception 'day043_v2_gray_absent_content_metrics_must_be_zero'; end if;
 if g->'same_size_position_confirmed' is distinct from 'true'::jsonb or g->'control_not_sabotaged_confirmed' is distinct from 'true'::jsonb or g->'three_real_objects_named_confirmed' is distinct from 'true'::jsonb or g->'comparison_after_separate_records_confirmed' is distinct from 'true'::jsonb or g->'alternative_explanations_recorded_confirmed' is distinct from 'true'::jsonb or g->'difference_not_external_or_astral_proof_confirmed' is distinct from 'true'::jsonb then raise exception 'day043_v2_gray_boundaries_required'; end if;
 r:=g->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day043_v2_gray_vault_ref_invalid'; end if;
 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day043_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('duration_seconds','psalm_25_6_confirmed','he_zayin_yod_confirmed','face_relaxed_confirmed','eye_chasing_absent_confirmed','content_present','content_mode','deliberate_spontaneous_interpretation_unknown_separated_confirmed','eyes_opened_gradually_confirmed','three_real_objects_named_confirmed','thanks_to_god_confirmed','clairvoyance_not_claimed_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day043_v2_middle_unknown_field'; end if;
 if m->'duration_seconds' is distinct from '600'::jsonb then raise exception 'day043_v2_middle_600_required'; end if;
 if jsonb_typeof(m->'content_present') is distinct from 'boolean' then raise exception 'day043_v2_middle_presence_flag_invalid'; end if;
 mode_text:=m->>'content_mode'; if mode_text not in ('ABSENT','DELIBERATE','SPONTANEOUS','MIXED') then raise exception 'day043_v2_middle_content_mode_invalid'; end if;
 if not (m->>'content_present')::boolean and mode_text<>'ABSENT' then raise exception 'day043_v2_middle_absent_content_requires_absent_mode'; end if;
 if (m->>'content_present')::boolean and mode_text='ABSENT' then raise exception 'day043_v2_middle_present_content_requires_non_absent_mode'; end if;
 if m->'psalm_25_6_confirmed' is distinct from 'true'::jsonb or m->'he_zayin_yod_confirmed' is distinct from 'true'::jsonb or m->'face_relaxed_confirmed' is distinct from 'true'::jsonb or m->'eye_chasing_absent_confirmed' is distinct from 'true'::jsonb or m->'deliberate_spontaneous_interpretation_unknown_separated_confirmed' is distinct from 'true'::jsonb or m->'eyes_opened_gradually_confirmed' is distinct from 'true'::jsonb or m->'three_real_objects_named_confirmed' is distinct from 'true'::jsonb or m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or m->'clairvoyance_not_claimed_confirmed' is distinct from 'true'::jsonb or m->'functional_return_confirmed' is distinct from 'true'::jsonb then raise exception 'day043_v2_middle_boundaries_required'; end if;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day043_v2_middle_vault_ref_invalid'; end if;
 soul:=p_evidence->'soul_mirror'; if jsonb_typeof(soul) is distinct from 'object' or soul->'completed' is distinct from 'true'::jsonb then raise exception 'day043_v2_soul_required'; end if;
 if exists(select 1 from jsonb_object_keys(soul) x where x not in ('completed','vault_entry_ref')) then raise exception 'day043_v2_soul_unknown_field'; end if;
 r:=soul->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day043_v2_soul_vault_ref_invalid'; end if;
 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','blue_completed',true,'gray_completed',true,'comparison_completed',g->'comparison_after_separate_records_confirmed','interpretation_separated',m->'deliberate_spontaneous_interpretation_unknown_separated_confirmed','clairvoyance_not_claimed',b->'clairvoyance_not_claimed_confirmed','safety_clear',p_evidence->'final_protocol_safety_clear_confirmed','blue_content_present',b->'content_present','gray_content_present',g->'content_present','blue_seconds',600,'gray_seconds',600);
 perform hnk_private.validate_day043_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_haziel_042_044_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day not in (42,43,44) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
 if v_status is distinct from 'canon' then raise exception 'haziel_canonical_day_not_available'; end if;
 if new.day=42 then
   if v_source_sha is distinct from 'b7f4da850f8c724cf48e980bd30882283efbb822' then raise exception 'day042_canonical_source_sha_mismatch'; end if;
   if new.evidence->>'protocol_version'='HNK-CHOKMAH-D042-V2' then perform hnk_private.validate_day042_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day042_scalar_evidence_v1(new.evidence); end if;
 elsif new.day=43 then
   if v_source_sha is distinct from 'f1c8fa153f91ab0e7b3536c8b900ea438fa3b616' then raise exception 'day043_canonical_source_sha_mismatch'; end if;
   if new.evidence->>'protocol_version'='HNK-CHOKMAH-D043-V2' then perform hnk_private.validate_day043_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day043_scalar_evidence_v1(new.evidence); end if;
 else
   if v_source_sha is distinct from '94e25ad0e1e4413f3b72caab6e8bd762d6e5bbd9' then raise exception 'day044_canonical_source_sha_mismatch'; end if;
   perform hnk_private.validate_day044_scalar_evidence_v1(new.evidence);
 end if;
 return new;
end$$;

create or replace function hnk_private.validate_completion_contract_v2(p_validator_key text,p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
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
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D043-COMP-V2','HNK-CHOKMAH-D043-V2',43,'f1c8fa153f91ab0e7b3536c8b900ea438fa3b616','2.0.0','day043_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
