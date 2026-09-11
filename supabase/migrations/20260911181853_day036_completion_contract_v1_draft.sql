create or replace function hnk_private.validate_day036_completion_v1_structure(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare r text; n numeric; k text; v_o jsonb; v_p jsonb; v_b jsonb; v_r jsonb; v_m jsonb; v_s jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day036_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','operators','portal_condition_completed','base_condition_completed','portal_base_comparison_completed','return_confirmed','review_001_035_completed','consolidated_competencies_count','fragile_competencies_count','attribute_evidence_count','premature_promotion_criterion_declared','kether_synthesis_completed','journal_update_confirmed','safety_blocking_state','portal','baseline','review','middle','soul_mirror','voluntary_completion_confirmed','safety_stop_occurred')) then raise exception 'day036_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-KETHER-D036-V1' then raise exception 'day036_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'cfb52771830f1f004c9eded69fb91846da313607' then raise exception 'day036_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day036_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day036_mode_invalid'; end if;
 if p_evidence->'portal_condition_completed' is distinct from 'true'::jsonb or p_evidence->'base_condition_completed' is distinct from 'true'::jsonb or p_evidence->'portal_base_comparison_completed' is distinct from 'true'::jsonb or p_evidence->'return_confirmed' is distinct from 'true'::jsonb or p_evidence->'review_001_035_completed' is distinct from 'true'::jsonb or p_evidence->'premature_promotion_criterion_declared' is distinct from 'true'::jsonb or p_evidence->'kether_synthesis_completed' is distinct from 'true'::jsonb or p_evidence->'journal_update_confirmed' is distinct from 'true'::jsonb or p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day036_legacy_portal_boundaries_required'; end if;
 if p_evidence->'safety_blocking_state' is distinct from 'false'::jsonb then raise exception 'day036_safety_blocking_state'; end if;
 if not(p_evidence?'safety_stop_occurred') or jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day036_safety_stop_invalid'; end if;
 foreach k in array array['consolidated_competencies_count','fragile_competencies_count','attribute_evidence_count'] loop if jsonb_typeof(p_evidence->k) is distinct from 'number' then raise exception 'day036_review_count_invalid'; end if; n:=(p_evidence->>k)::numeric; if n<>trunc(n) then raise exception 'day036_review_count_invalid'; end if; end loop;
 if (p_evidence->>'consolidated_competencies_count')::numeric < 3 or (p_evidence->>'consolidated_competencies_count')::numeric > 35 then raise exception 'day036_consolidated_count_invalid'; end if;
 if (p_evidence->>'fragile_competencies_count')::numeric < 3 or (p_evidence->>'fragile_competencies_count')::numeric > 35 then raise exception 'day036_fragile_count_invalid'; end if;
 if (p_evidence->>'attribute_evidence_count')::numeric is distinct from 7::numeric then raise exception 'day036_attribute_evidence_7_required'; end if;

 v_o:=p_evidence->'operators'; if jsonb_typeof(v_o) is distinct from 'object' then raise exception 'day036_operators_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_o) x where x not in ('tuner_id','transition_preset_id','audio_checksum_sha256','sigil_id','sigil_master_id','sigil_checksum_sha256')) then raise exception 'day036_operator_unknown_field'; end if;
 if v_o->>'tuner_id' is distinct from 'hnk.tuner.kether.v1' or v_o->>'transition_preset_id' is distinct from 'hnk.audio.kether_chokmah.transition.v1' or v_o->>'audio_checksum_sha256' is distinct from '5289f4b32bb1c1094b16471e262c8abb1886d7d77e595efc2605869a316a8168' or v_o->>'sigil_id' is distinct from 'hnk.kether.sigil.v1' or v_o->>'sigil_master_id' is distinct from 'hnk.kether.sigil.v1.master' or v_o->>'sigil_checksum_sha256' is distinct from '7792ad999497f502d29c4377d3497c02241421701e5762ed247c5351fb24320a' then raise exception 'day036_operator_version_mismatch'; end if;

 v_p:=p_evidence->'portal'; if jsonb_typeof(v_p) is distinct from 'object' then raise exception 'day036_portal_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_p) x where x not in ('audio_effective_seconds','induction_completed','orientation_preserved_confirmed','memory_continuity_preserved_confirmed','sigil_completed','gnosis_seconds','depth_score','silence_score','continuity_score','sigil_stability_score','distraction_count','sequence_failure_count','recovery_count','clarity_score','return_confirmed','portal_vault_entry_ref')) then raise exception 'day036_portal_unknown_field'; end if;
 if v_p->'induction_completed' is distinct from 'true'::jsonb or v_p->'orientation_preserved_confirmed' is distinct from 'true'::jsonb or v_p->'memory_continuity_preserved_confirmed' is distinct from 'true'::jsonb or v_p->'sigil_completed' is distinct from 'true'::jsonb or v_p->'return_confirmed' is distinct from 'true'::jsonb then raise exception 'day036_portal_boundaries_required'; end if;
 if jsonb_typeof(v_p->'audio_effective_seconds') is distinct from 'number' or (v_p->>'audio_effective_seconds')::numeric is distinct from 720::numeric then raise exception 'day036_portal_audio_720_required'; end if;
 if jsonb_typeof(v_p->'gnosis_seconds') is distinct from 'number' or (v_p->>'gnosis_seconds')::numeric is distinct from 300::numeric then raise exception 'day036_portal_gnosis_300_required'; end if;
 foreach k in array array['depth_score','silence_score','continuity_score','sigil_stability_score','clarity_score'] loop if jsonb_typeof(v_p->k) is distinct from 'number' then raise exception 'day036_portal_score_invalid'; end if; n:=(v_p->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day036_portal_score_invalid'; end if; end loop;
 foreach k in array array['distraction_count','sequence_failure_count','recovery_count'] loop if jsonb_typeof(v_p->k) is distinct from 'number' then raise exception 'day036_portal_count_invalid'; end if; n:=(v_p->>k)::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day036_portal_count_invalid'; end if; end loop;
 r:=v_p->>'portal_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day036_portal_vault_ref_invalid'; end if;

 v_b:=p_evidence->'baseline'; if jsonb_typeof(v_b) is distinct from 'object' then raise exception 'day036_baseline_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_b) x where x not in ('induction_completed','tuner_absent_confirmed','transition_audio_absent_confirmed','sigil_absent_confirmed','same_or_comparable_posture_time_duration_confirmed','gnosis_seconds','depth_score','silence_score','continuity_score','orientation_score','clarity_score','distraction_count','return_confirmed','baseline_vault_entry_ref')) then raise exception 'day036_baseline_unknown_field'; end if;
 if v_b->'induction_completed' is distinct from 'true'::jsonb or v_b->'tuner_absent_confirmed' is distinct from 'true'::jsonb or v_b->'transition_audio_absent_confirmed' is distinct from 'true'::jsonb or v_b->'sigil_absent_confirmed' is distinct from 'true'::jsonb or v_b->'same_or_comparable_posture_time_duration_confirmed' is distinct from 'true'::jsonb or v_b->'return_confirmed' is distinct from 'true'::jsonb then raise exception 'day036_baseline_boundaries_required'; end if;
 if jsonb_typeof(v_b->'gnosis_seconds') is distinct from 'number' or (v_b->>'gnosis_seconds')::numeric is distinct from 300::numeric then raise exception 'day036_baseline_gnosis_300_required'; end if;
 foreach k in array array['depth_score','silence_score','continuity_score','orientation_score','clarity_score'] loop if jsonb_typeof(v_b->k) is distinct from 'number' then raise exception 'day036_baseline_score_invalid'; end if; n:=(v_b->>k)::numeric; if n<>trunc(n) or n<0 or n>10 then raise exception 'day036_baseline_score_invalid'; end if; end loop;
 if jsonb_typeof(v_b->'distraction_count') is distinct from 'number' then raise exception 'day036_baseline_distractions_invalid'; end if; n:=(v_b->>'distraction_count')::numeric; if n<>trunc(n) or n<0 or n>9999 then raise exception 'day036_baseline_distractions_invalid'; end if;
 r:=v_b->>'baseline_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day036_baseline_vault_ref_invalid'; end if;

 v_r:=p_evidence->'review'; if jsonb_typeof(v_r) is distinct from 'object' then raise exception 'day036_review_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_r) x where x not in ('old_records_unaltered_confirmed','review_vault_entry_ref')) then raise exception 'day036_review_unknown_field'; end if;
 if v_r->'old_records_unaltered_confirmed' is distinct from 'true'::jsonb then raise exception 'day036_old_records_integrity_required'; end if;
 r:=v_r->>'review_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day036_review_vault_ref_invalid'; end if;

 v_m:=p_evidence->'middle'; if jsonb_typeof(v_m) is distinct from 'object' then raise exception 'day036_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_m) x where x not in ('audio_effective_seconds','induction_completed','sigil_completed','gnosis_seconds','responsibility_not_superiority_confirmed','return_confirmed','functional_capacity_intact_confirmed','journal_update_confirmed','kether_synthesis_completed','investigable_remainder_declared','chokmah_discipline_declared','middle_vault_entry_ref')) then raise exception 'day036_middle_unknown_field'; end if;
 if v_m->'induction_completed' is distinct from 'true'::jsonb or v_m->'sigil_completed' is distinct from 'true'::jsonb or v_m->'responsibility_not_superiority_confirmed' is distinct from 'true'::jsonb or v_m->'return_confirmed' is distinct from 'true'::jsonb or v_m->'functional_capacity_intact_confirmed' is distinct from 'true'::jsonb or v_m->'journal_update_confirmed' is distinct from 'true'::jsonb or v_m->'kether_synthesis_completed' is distinct from 'true'::jsonb or v_m->'investigable_remainder_declared' is distinct from 'true'::jsonb or v_m->'chokmah_discipline_declared' is distinct from 'true'::jsonb then raise exception 'day036_middle_boundaries_required'; end if;
 if jsonb_typeof(v_m->'audio_effective_seconds') is distinct from 'number' or (v_m->>'audio_effective_seconds')::numeric is distinct from 720::numeric then raise exception 'day036_middle_audio_720_required'; end if;
 if jsonb_typeof(v_m->'gnosis_seconds') is distinct from 'number' or (v_m->>'gnosis_seconds')::numeric is distinct from 300::numeric then raise exception 'day036_middle_gnosis_300_required'; end if;
 r:=v_m->>'middle_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day036_middle_vault_ref_invalid'; end if;

 v_s:=p_evidence->'soul_mirror'; if jsonb_typeof(v_s) is distinct from 'object' then raise exception 'day036_soul_mirror_required'; end if;
 if exists(select 1 from jsonb_object_keys(v_s) x where x not in ('completed','comparison_vault_entry_ref')) then raise exception 'day036_soul_unknown_field'; end if;
 if v_s->'completed' is distinct from 'true'::jsonb then raise exception 'day036_soul_mirror_required'; end if;
 r:=v_s->>'comparison_vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day036_soul_vault_ref_invalid'; end if;
end$$;

create or replace function hnk_private.assert_day036_operator_publication_v1()
returns void language plpgsql set search_path='' as $$
declare a public.asset_registry%rowtype;
begin
 select * into a from public.asset_registry where asset_key='hnk.tuner.kether.v1' order by updated_at desc limit 1;
 if not found or a.approval_state is distinct from 'approved' or coalesce((a.metadata->>'published_component_pending')::boolean,true) then raise exception 'day036_tuner_component_not_published'; end if;
 select * into a from public.asset_registry where asset_key='hnk.kether.sigil.v1.master' order by updated_at desc limit 1;
 if not found or a.approval_state is distinct from 'approved' or a.checksum_sha256 is distinct from '7792ad999497f502d29c4377d3497c02241421701e5762ed247c5351fb24320a' or coalesce((a.metadata->>'published_asset_pending')::boolean,true) or a.published_at is null then raise exception 'day036_sigil_asset_not_published'; end if;
 select * into a from public.asset_registry where asset_key='hnk.audio.kether_chokmah.transition.v1' order by updated_at desc limit 1;
 if not found or a.approval_state is distinct from 'approved' or a.checksum_sha256 is distinct from '5289f4b32bb1c1094b16471e262c8abb1886d7d77e595efc2605869a316a8168' or coalesce((a.metadata->>'published')::boolean,false) is not true or coalesce((a.metadata->>'listening_qa_pending')::boolean,true) or coalesce((a.metadata->>'duration_seconds')::integer,0) <> 720 or a.storage_path is null or a.published_at is null then raise exception 'day036_transition_audio_not_published'; end if;
end$$;

create or replace function hnk_private.validate_day036_completion_v1(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
begin
 perform hnk_private.validate_day036_completion_v1_structure(p_evidence,p_expected_source_sha);
 perform hnk_private.assert_day036_operator_publication_v1();
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
  else raise exception 'unsupported_completion_validator:%',p_validator_key;
 end case;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-KETHER-D036-COMP-V1','HNK-KETHER-D036-V1',36,'cfb52771830f1f004c9eded69fb91846da313607','1.0.0','day036_v1','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
