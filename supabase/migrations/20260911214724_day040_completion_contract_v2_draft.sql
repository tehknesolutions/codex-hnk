create or replace function hnk_private.validate_day040_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare v jsonb; s jsonb; m jsonb; soul jsonb; r text; stopped boolean; reason text; legacy jsonb; k text;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day040_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','verbal','silent','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day040_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D040-V2' then raise exception 'day040_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '7a26302a35aa87b309e94abf516834019df29737' then raise exception 'day040_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day040_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day040_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day040_v2_voluntary_completion_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day040_v2_safety_stop_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean; reason:=p_evidence->>'safety_stop_reason';
 if reason not in ('NONE','EYE_PAIN','HEADACHE','DIZZINESS','PERSISTENT_VISUAL_CHANGE','RISING_ANXIETY','OTHER_DISCOMFORT') then raise exception 'day040_v2_safety_reason_invalid'; end if;
 if stopped and reason='NONE' then raise exception 'day040_v2_safety_reason_required'; end if;
 if not stopped and reason<>'NONE' then raise exception 'day040_v2_safety_reason_without_stop'; end if;

 v:=p_evidence->'verbal'; if jsonb_typeof(v) is distinct from 'object' then raise exception 'day040_v2_verbal_required'; end if;
 if exists(select 1 from jsonb_object_keys(v) x where x not in ('duration_seconds','truisms_count','suggestions_count','clear_wall_confirmed','micro_point_imagined_confirmed','eye_elevation_effort_absent_confirmed','normal_blinking_confirmed','suggestions_permissive_confirmed','suggestions_rejectable_confirmed','voluntary_eye_opening_confirmed','body_movement_return_supported_confirmed','phenomenon_not_required_confirmed','eyelid_heaviness','ocular_tension','comfort','subjective_depth','voluntary_interruption_count','vault_entry_ref')) then raise exception 'day040_v2_verbal_unknown_field'; end if;
 if v->'duration_seconds' is distinct from '360'::jsonb then raise exception 'day040_v2_verbal_360_required'; end if;
 foreach k in array array['truisms_count','suggestions_count','eyelid_heaviness','ocular_tension','comfort','subjective_depth','voluntary_interruption_count'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(v->k),false) then raise exception 'day040_v2_verbal_scalar_invalid:%',k; end if; end loop;
 if (v->>'eyelid_heaviness')::int>10 or (v->>'ocular_tension')::int>10 or (v->>'comfort')::int>10 or (v->>'subjective_depth')::int>10 or (v->>'voluntary_interruption_count')::int>9999 then raise exception 'day040_v2_verbal_scalar_invalid'; end if;
 if v->'clear_wall_confirmed' is distinct from 'true'::jsonb or v->'micro_point_imagined_confirmed' is distinct from 'true'::jsonb or v->'eye_elevation_effort_absent_confirmed' is distinct from 'true'::jsonb or v->'normal_blinking_confirmed' is distinct from 'true'::jsonb or v->'suggestions_permissive_confirmed' is distinct from 'true'::jsonb or v->'suggestions_rejectable_confirmed' is distinct from 'true'::jsonb or v->'voluntary_eye_opening_confirmed' is distinct from 'true'::jsonb or v->'body_movement_return_supported_confirmed' is distinct from 'true'::jsonb or v->'phenomenon_not_required_confirmed' is distinct from 'true'::jsonb then raise exception 'day040_v2_verbal_boundaries_required'; end if;
 r:=v->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day040_v2_verbal_vault_ref_invalid'; end if;

 s:=p_evidence->'silent'; if jsonb_typeof(s) is distinct from 'object' then raise exception 'day040_v2_silent_required'; end if;
 if exists(select 1 from jsonb_object_keys(s) x where x not in ('duration_seconds','same_or_comparable_wall_confirmed','silent_observation_confirmed','natural_breathing_confirmed','pacing_absent_confirmed','leading_absent_confirmed','normal_blinking_confirmed','voluntary_stop_supported_confirmed','three_real_objects_named_confirmed','preselected_winner_absent_confirmed','eyelid_heaviness','ocular_tension','comfort','attention_stability','subjective_depth','vault_entry_ref')) then raise exception 'day040_v2_silent_unknown_field'; end if;
 if s->'duration_seconds' is distinct from '360'::jsonb then raise exception 'day040_v2_silent_360_required'; end if;
 foreach k in array array['eyelid_heaviness','ocular_tension','comfort','attention_stability','subjective_depth'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->k),false) or (s->>k)::int>10 then raise exception 'day040_v2_silent_scalar_invalid:%',k; end if; end loop;
 if s->'same_or_comparable_wall_confirmed' is distinct from 'true'::jsonb or s->'silent_observation_confirmed' is distinct from 'true'::jsonb or s->'natural_breathing_confirmed' is distinct from 'true'::jsonb or s->'pacing_absent_confirmed' is distinct from 'true'::jsonb or s->'leading_absent_confirmed' is distinct from 'true'::jsonb or s->'normal_blinking_confirmed' is distinct from 'true'::jsonb or s->'voluntary_stop_supported_confirmed' is distinct from 'true'::jsonb or s->'three_real_objects_named_confirmed' is distinct from 'true'::jsonb or s->'preselected_winner_absent_confirmed' is distinct from 'true'::jsonb then raise exception 'day040_v2_silent_boundaries_required'; end if;
 r:=s->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day040_v2_silent_vault_ref_invalid'; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day040_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_11_7_confirmed','kaph_he_tav_confirmed','three_breath_focus_confirmed','truisms_count','suggestions_count','eyes_not_forced_confirmed','response_not_required_confirmed','eyes_opened_voluntarily_confirmed','three_real_objects_named_confirmed','hands_feet_moved_confirmed','thanks_to_god_confirmed','autonomy_rule_declared_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day040_v2_middle_unknown_field'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(m->'truisms_count'),false) or (m->>'truisms_count')::int<3 or not coalesce(hnk_private.jsonb_is_nonnegative_integer(m->'suggestions_count'),false) or (m->>'suggestions_count')::int<1 then raise exception 'day040_v2_middle_counts_required'; end if;
 if m->'psalm_11_7_confirmed' is distinct from 'true'::jsonb or m->'kaph_he_tav_confirmed' is distinct from 'true'::jsonb or m->'three_breath_focus_confirmed' is distinct from 'true'::jsonb or m->'eyes_not_forced_confirmed' is distinct from 'true'::jsonb or m->'response_not_required_confirmed' is distinct from 'true'::jsonb or m->'eyes_opened_voluntarily_confirmed' is distinct from 'true'::jsonb or m->'three_real_objects_named_confirmed' is distinct from 'true'::jsonb or m->'hands_feet_moved_confirmed' is distinct from 'true'::jsonb or m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or m->'autonomy_rule_declared_confirmed' is distinct from 'true'::jsonb or m->'functional_return_confirmed' is distinct from 'true'::jsonb then raise exception 'day040_v2_middle_boundaries_required'; end if;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day040_v2_middle_vault_ref_invalid'; end if;

 soul:=p_evidence->'soul_mirror'; if jsonb_typeof(soul) is distinct from 'object' or soul->'completed' is distinct from 'true'::jsonb then raise exception 'day040_v2_soul_required'; end if;
 if exists(select 1 from jsonb_object_keys(soul) x where x not in ('completed','vault_entry_ref')) then raise exception 'day040_v2_soul_unknown_field'; end if;
 r:=soul->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day040_v2_soul_vault_ref_invalid'; end if;

 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',true,'verbal_condition_completed',true,'silent_condition_completed',true,'comparison_completed',true,'autonomy_preserved',true,'verbal_seconds',(v->>'duration_seconds')::int,'silent_seconds',(s->>'duration_seconds')::int,'truisms_logged',(v->>'truisms_count')::int,'suggestions_logged',(v->>'suggestions_count')::int);
 perform hnk_private.validate_day040_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.enforce_cahetel_040_041_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing_completion boolean; v_source_sha text; v_status text;
begin
 if new.day not in (40,41) or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=new.day) into v_existing_completion;
 if v_existing_completion then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=new.day;
 if v_status is distinct from 'canon' then raise exception 'cahetel_canonical_day_not_available'; end if;
 if new.day=40 then
   if v_source_sha is distinct from '7a26302a35aa87b309e94abf516834019df29737' then raise exception 'day040_canonical_source_sha_mismatch'; end if;
   if new.evidence->>'protocol_version'='HNK-CHOKMAH-D040-V2' then perform hnk_private.validate_day040_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day040_scalar_evidence_v1(new.evidence); end if;
 else
   if v_source_sha is distinct from 'f163bc7437efb0dfa70cdc5171e9a2e6acd7fdad' then raise exception 'day041_canonical_source_sha_mismatch'; end if;
   perform hnk_private.validate_day041_scalar_evidence_v1(new.evidence);
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
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D040-COMP-V2','HNK-CHOKMAH-D040-V2',40,'7a26302a35aa87b309e94abf516834019df29737','2.0.0','day040_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
