create or replace function hnk_private.validate_day041_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare a jsonb; o jsonb; m jsonb; soul jsonb; r text; k text; legacy jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day041_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','active','open','middle','soul_mirror','voluntary_completion_confirmed')) then raise exception 'day041_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D041-V2' then raise exception 'day041_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'f163bc7437efb0dfa70cdc5171e9a2e6acd7fdad' then raise exception 'day041_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day041_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day041_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day041_v2_voluntary_completion_required'; end if;
 a:=p_evidence->'active'; if jsonb_typeof(a) is distinct from 'object' then raise exception 'day041_v2_active_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) x where x not in ('duration_seconds','question_defined_confirmed','question_non_urgent_confirmed','immediate_safety_decision_absent_confirmed','voluntary_autoinduction_confirmed','compulsive_question_repetition_avoided_confirmed','content_present','content_count','latency_seconds','absence_is_valid_confirmed','content_before_interpretation_confirmed','interpretation_delayed_confirmed','alternative_recorded_confirmed','verification_before_action_defined_confirmed','confidence','return_complete_confirmed','vault_entry_ref')) then raise exception 'day041_v2_active_unknown_field'; end if;
 if a->'duration_seconds' is distinct from '420'::jsonb then raise exception 'day041_v2_active_420_required'; end if;
 if jsonb_typeof(a->'content_present') is distinct from 'boolean' then raise exception 'day041_v2_active_content_presence_invalid'; end if;
 foreach k in array array['content_count','latency_seconds','confidence'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->k),false) then raise exception 'day041_v2_active_scalar_invalid:%',k; end if; end loop;
 if (a->>'latency_seconds')::int>420 or (a->>'confidence')::int>10 then raise exception 'day041_v2_active_scalar_invalid'; end if;
 if not (a->>'content_present')::boolean and (a->>'content_count')::int<>0 then raise exception 'day041_v2_active_absent_content_count_must_be_zero'; end if;
 if a->'question_defined_confirmed' is distinct from 'true'::jsonb or a->'question_non_urgent_confirmed' is distinct from 'true'::jsonb or a->'immediate_safety_decision_absent_confirmed' is distinct from 'true'::jsonb or a->'voluntary_autoinduction_confirmed' is distinct from 'true'::jsonb or a->'compulsive_question_repetition_avoided_confirmed' is distinct from 'true'::jsonb or a->'absence_is_valid_confirmed' is distinct from 'true'::jsonb or a->'content_before_interpretation_confirmed' is distinct from 'true'::jsonb or a->'interpretation_delayed_confirmed' is distinct from 'true'::jsonb or a->'alternative_recorded_confirmed' is distinct from 'true'::jsonb or a->'verification_before_action_defined_confirmed' is distinct from 'true'::jsonb or a->'return_complete_confirmed' is distinct from 'true'::jsonb then raise exception 'day041_v2_active_boundaries_required'; end if;
 r:=a->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day041_v2_active_vault_ref_invalid'; end if;
 o:=p_evidence->'open'; if jsonb_typeof(o) is distinct from 'object' then raise exception 'day041_v2_open_required'; end if;
 if exists(select 1 from jsonb_object_keys(o) x where x not in ('duration_seconds','specific_question_absent_confirmed','similar_posture_procedure_confirmed','content_present','content_count','latency_seconds','absence_is_valid_confirmed','connection_seeking_avoided_confirmed','active_open_comparison_completed','difference_not_external_source_proof_confirmed','alternative_explanation_recorded_confirmed','safe_verification_defined_confirmed','dangerous_decision_avoided_confirmed','diagnosis_avoided_confirmed','accusation_avoided_confirmed','concrete_evidence_preserved_confirmed','confidence','vault_entry_ref')) then raise exception 'day041_v2_open_unknown_field'; end if;
 if o->'duration_seconds' is distinct from '420'::jsonb then raise exception 'day041_v2_open_420_required'; end if;
 if jsonb_typeof(o->'content_present') is distinct from 'boolean' then raise exception 'day041_v2_open_content_presence_invalid'; end if;
 foreach k in array array['content_count','latency_seconds','confidence'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(o->k),false) then raise exception 'day041_v2_open_scalar_invalid:%',k; end if; end loop;
 if (o->>'latency_seconds')::int>420 or (o->>'confidence')::int>10 then raise exception 'day041_v2_open_scalar_invalid'; end if;
 if not (o->>'content_present')::boolean and (o->>'content_count')::int<>0 then raise exception 'day041_v2_open_absent_content_count_must_be_zero'; end if;
 if o->'specific_question_absent_confirmed' is distinct from 'true'::jsonb or o->'similar_posture_procedure_confirmed' is distinct from 'true'::jsonb or o->'absence_is_valid_confirmed' is distinct from 'true'::jsonb or o->'connection_seeking_avoided_confirmed' is distinct from 'true'::jsonb or o->'active_open_comparison_completed' is distinct from 'true'::jsonb or o->'difference_not_external_source_proof_confirmed' is distinct from 'true'::jsonb or o->'alternative_explanation_recorded_confirmed' is distinct from 'true'::jsonb or o->'safe_verification_defined_confirmed' is distinct from 'true'::jsonb or o->'dangerous_decision_avoided_confirmed' is distinct from 'true'::jsonb or o->'diagnosis_avoided_confirmed' is distinct from 'true'::jsonb or o->'accusation_avoided_confirmed' is distinct from 'true'::jsonb or o->'concrete_evidence_preserved_confirmed' is distinct from 'true'::jsonb then raise exception 'day041_v2_open_boundaries_required'; end if;
 r:=o->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day041_v2_open_vault_ref_invalid'; end if;
 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day041_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('duration_seconds','psalm_11_7_confirmed','kaph_he_tav_confirmed','question_presented_without_demanding_answer_confirmed','content_modality_before_interpretation_confirmed','voluntary_return_confirmed','eyes_opened_confirmed','three_real_objects_named_confirmed','four_field_record_completed','silence_valid_confirmed','uncertainty_valid_confirmed','thanks_to_god_confirmed','objective_revelation_not_claimed_confirmed','high_stakes_action_deferred_until_concrete_evidence_confirmed','vault_entry_ref')) then raise exception 'day041_v2_middle_unknown_field'; end if;
 if m->'duration_seconds' is distinct from '300'::jsonb then raise exception 'day041_v2_middle_300_required'; end if;
 if m->'psalm_11_7_confirmed' is distinct from 'true'::jsonb or m->'kaph_he_tav_confirmed' is distinct from 'true'::jsonb or m->'question_presented_without_demanding_answer_confirmed' is distinct from 'true'::jsonb or m->'content_modality_before_interpretation_confirmed' is distinct from 'true'::jsonb or m->'voluntary_return_confirmed' is distinct from 'true'::jsonb or m->'eyes_opened_confirmed' is distinct from 'true'::jsonb or m->'three_real_objects_named_confirmed' is distinct from 'true'::jsonb or m->'four_field_record_completed' is distinct from 'true'::jsonb or m->'silence_valid_confirmed' is distinct from 'true'::jsonb or m->'uncertainty_valid_confirmed' is distinct from 'true'::jsonb or m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or m->'objective_revelation_not_claimed_confirmed' is distinct from 'true'::jsonb or m->'high_stakes_action_deferred_until_concrete_evidence_confirmed' is distinct from 'true'::jsonb then raise exception 'day041_v2_middle_boundaries_required'; end if;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day041_v2_middle_vault_ref_invalid'; end if;
 soul:=p_evidence->'soul_mirror'; if jsonb_typeof(soul) is distinct from 'object' or soul->'completed' is distinct from 'true'::jsonb then raise exception 'day041_v2_soul_required'; end if;
 if exists(select 1 from jsonb_object_keys(soul) x where x not in ('completed','vault_entry_ref')) then raise exception 'day041_v2_soul_unknown_field'; end if;
 r:=soul->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day041_v2_soul_vault_ref_invalid'; end if;
 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',true,'question_defined',true,'active_reception_completed',true,'open_reception_completed',true,'interpretation_delayed',true,'alternative_recorded',true,'verification_defined',true,'active_reception_seconds',420,'open_reception_seconds',420,'active_content_present',(a->>'content_present')::boolean,'open_content_present',(o->>'content_present')::boolean);
 perform hnk_private.validate_day041_scalar_evidence_v1(legacy);
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
   if new.evidence->>'protocol_version'='HNK-CHOKMAH-D041-V2' then perform hnk_private.validate_day041_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day041_scalar_evidence_v1(new.evidence); end if;
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
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D041-COMP-V2','HNK-CHOKMAH-D041-V2',41,'f163bc7437efb0dfa70cdc5171e9a2e6acd7fdad','2.0.0','day041_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
