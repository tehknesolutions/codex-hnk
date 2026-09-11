create or replace function hnk_private.validate_day037_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare j jsonb; b jsonb; m jsonb; s jsonb; k text; n numeric; r text;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day037_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','jachin','boaz','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day037_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D037-V1' then raise exception 'day037_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '3f61ac6495fbc438e87785d1929b0a32941976d2' then raise exception 'day037_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day037_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day037_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day037_voluntary_completion_required'; end if;
 if not(p_evidence?'safety_stop_occurred') or jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day037_safety_stop_invalid'; end if;

 j:=p_evidence->'jachin'; if jsonb_typeof(j) is distinct from 'object' then raise exception 'day037_jachin_required'; end if;
 if exists(select 1 from jsonb_object_keys(j) x where x not in ('observation_seconds','open_reception_seconds','eyes_open_confirmed','comfortable_posture_confirmed','visual_count','auditory_count','kinesthetic_count','olfactory_count','gustatory_count','total_perception_count','automatic_label_count','distraction_count','attention_recovery_seconds','direct_sensory_description_before_interpretation_confirmed','observe_vs_explain_distinction_recorded_confirmed','vault_entry_ref')) then raise exception 'day037_jachin_unknown_field'; end if;
 if j->'observation_seconds' is distinct from '420'::jsonb or j->'open_reception_seconds' is distinct from '60'::jsonb then raise exception 'day037_jachin_timing_required'; end if;
 if j->'eyes_open_confirmed' is distinct from 'true'::jsonb or j->'comfortable_posture_confirmed' is distinct from 'true'::jsonb or j->'direct_sensory_description_before_interpretation_confirmed' is distinct from 'true'::jsonb or j->'observe_vs_explain_distinction_recorded_confirmed' is distinct from 'true'::jsonb then raise exception 'day037_jachin_boundaries_required'; end if;
 foreach k in array array['visual_count','auditory_count','kinesthetic_count','olfactory_count','gustatory_count','total_perception_count','automatic_label_count','distraction_count','attention_recovery_seconds'] loop if jsonb_typeof(j->k) is distinct from 'number' then raise exception 'day037_jachin_count_invalid'; end if; n:=(j->>k)::numeric; if n<>trunc(n) or n<0 then raise exception 'day037_jachin_count_invalid'; end if; end loop;
 if (j->>'visual_count')::int<5 then raise exception 'day037_visual_minimum_5_required'; end if; if (j->>'auditory_count')::int<4 then raise exception 'day037_auditory_minimum_4_required'; end if; if (j->>'kinesthetic_count')::int<3 then raise exception 'day037_kinesthetic_minimum_3_required'; end if; if (j->>'olfactory_count')::int<2 then raise exception 'day037_olfactory_minimum_2_required'; end if; if (j->>'gustatory_count')::int<1 then raise exception 'day037_gustatory_minimum_1_required'; end if;
 if (j->>'total_perception_count')::int<>20 then raise exception 'day037_total_perceptions_20_required'; end if;
 if (j->>'visual_count')::int+(j->>'auditory_count')::int+(j->>'kinesthetic_count')::int+(j->>'olfactory_count')::int+(j->>'gustatory_count')::int<20 then raise exception 'day037_modality_counts_must_cover_20_perceptions'; end if;
 if (j->>'automatic_label_count')::int>20 or (j->>'distraction_count')::int>9999 or (j->>'attention_recovery_seconds')::int>3600 then raise exception 'day037_jachin_count_invalid'; end if;
 r:=j->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day037_jachin_vault_ref_invalid'; end if;

 b:=p_evidence->'boaz'; if jsonb_typeof(b) is distinct from 'object' then raise exception 'day037_boaz_required'; end if;
 if exists(select 1 from jsonb_object_keys(b) x where x not in ('duration_seconds','different_environment_confirmed','similar_duration_confirmed','three_layer_structure_confirmed','sensory_data_first_confirmed','three_breath_delay_confirmed','external_cause_kept_as_hypothesis_confirmed','alternative_hypothesis_required_confirmed','certainty_seeking_avoided_confirmed','records_compared_count','premature_inferences_marked_confirmed','confidence_changes_recorded_confirmed','certainty_blocking_criterion_declared_confirmed','vault_entry_ref')) then raise exception 'day037_boaz_unknown_field'; end if;
 if b->'different_environment_confirmed' is distinct from 'true'::jsonb or b->'similar_duration_confirmed' is distinct from 'true'::jsonb or b->'three_layer_structure_confirmed' is distinct from 'true'::jsonb or b->'sensory_data_first_confirmed' is distinct from 'true'::jsonb or b->'three_breath_delay_confirmed' is distinct from 'true'::jsonb or b->'external_cause_kept_as_hypothesis_confirmed' is distinct from 'true'::jsonb or b->'alternative_hypothesis_required_confirmed' is distinct from 'true'::jsonb or b->'certainty_seeking_avoided_confirmed' is distinct from 'true'::jsonb or b->'premature_inferences_marked_confirmed' is distinct from 'true'::jsonb or b->'confidence_changes_recorded_confirmed' is distinct from 'true'::jsonb or b->'certainty_blocking_criterion_declared_confirmed' is distinct from 'true'::jsonb then raise exception 'day037_boaz_boundaries_required'; end if;
 if jsonb_typeof(b->'duration_seconds') is distinct from 'number' or (b->>'duration_seconds')::numeric<>trunc((b->>'duration_seconds')::numeric) or (b->>'duration_seconds')::int<1 or (b->>'duration_seconds')::int>7200 then raise exception 'day037_boaz_duration_invalid'; end if;
 if b->'records_compared_count' is distinct from '10'::jsonb then raise exception 'day037_records_compared_10_required'; end if;
 r:=b->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day037_boaz_vault_ref_invalid'; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day037_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('vakog_unlabeled_seconds','prayer_for_discernment_confirmed','cahetel_vibration_confirmed','psalm_11_7_confirmed','e1_e5_classification_completed','perceived_interpreted_unknown_triplet_completed','unknown_preserved_confirmed','thanks_to_god_confirmed','functional_return_confirmed','twenty_perceptions_saved_confirmed','personal_discernment_rule_declared_confirmed','vault_entry_ref')) then raise exception 'day037_middle_unknown_field'; end if;
 if m->'vakog_unlabeled_seconds' is distinct from '300'::jsonb then raise exception 'day037_middle_300_required'; end if;
 if m->'prayer_for_discernment_confirmed' is distinct from 'true'::jsonb or m->'cahetel_vibration_confirmed' is distinct from 'true'::jsonb or m->'psalm_11_7_confirmed' is distinct from 'true'::jsonb or m->'e1_e5_classification_completed' is distinct from 'true'::jsonb or m->'perceived_interpreted_unknown_triplet_completed' is distinct from 'true'::jsonb or m->'unknown_preserved_confirmed' is distinct from 'true'::jsonb or m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or m->'functional_return_confirmed' is distinct from 'true'::jsonb or m->'twenty_perceptions_saved_confirmed' is distinct from 'true'::jsonb or m->'personal_discernment_rule_declared_confirmed' is distinct from 'true'::jsonb then raise exception 'day037_middle_boundaries_required'; end if;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day037_middle_vault_ref_invalid'; end if;

 s:=p_evidence->'soul_mirror'; if jsonb_typeof(s) is distinct from 'object' or s->'completed' is distinct from 'true'::jsonb then raise exception 'day037_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(s) x where x not in ('completed','vault_entry_ref')) then raise exception 'day037_soul_unknown_field'; end if;
 r:=s->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day037_soul_vault_ref_invalid'; end if;
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
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

create or replace function hnk_private.enforce_day037_initiatory_entry_gate()
returns trigger language plpgsql security definer set search_path='' as $$
declare p public.user_progress%rowtype;
begin
 if new.day<>37 then return new; end if;
 if not exists(select 1 from public.day_completions dc where dc.user_id=new.user_id and dc.day=36) then raise exception 'day037_requires_day036_completion'; end if;
 select * into p from public.user_progress up where up.user_id=new.user_id;
 if not found or p.initiatory_grade<>2 or p.initiatory_title is distinct from 'Iniciado' or p.current_chapter<>2 or p.current_sephira is distinct from 'Chokmah' then raise exception 'day037_requires_chokmah_initiatory_state'; end if;
 return new;
end$$;
drop trigger if exists trg_day037_initiatory_entry_gate on public.day_completions;
create trigger trg_day037_initiatory_entry_gate before insert or update on public.day_completions for each row execute function hnk_private.enforce_day037_initiatory_entry_gate();

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D037-COMP-V1','HNK-CHOKMAH-D037-V1',37,'3f61ac6495fbc438e87785d1929b0a32941976d2','1.0.0','day037_v1','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
