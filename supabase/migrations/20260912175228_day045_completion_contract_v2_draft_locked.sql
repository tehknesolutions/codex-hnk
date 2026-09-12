create or replace function hnk_private.validate_day045_evidence_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare a jsonb; c jsonb; s jsonb; cmp jsonb; m jsonb; soul jsonb; r text; k text; legacy jsonb;
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day045_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','active','control','post_silence','comparison','middle','soul_mirror','voluntary_completion_confirmed','final_safety_clear_confirmed')) then raise exception 'day045_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D045-V2' then raise exception 'day045_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from '67e6d708444ae1fd62713ebebfb8da4d79a100e5' then raise exception 'day045_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day045_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day045_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb then raise exception 'day045_v2_voluntary_completion_required'; end if;
 if p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day045_v2_final_safety_required'; end if;

 a:=p_evidence->'active'; if jsonb_typeof(a) is distinct from 'object' then raise exception 'day045_v2_active_required'; end if;
 if exists(select 1 from jsonb_object_keys(a) x where x not in ('preset_id','duration_seconds','left_hz','right_hz','difference_hz','headphones_comfortable_confirmed','volume_comfortable_confirmed','explicit_start_confirmed','autoplay_absent_confirmed','immediate_stop_available_confirmed','posture_stable_confirmed','distractions','returns','comfort','focus','sleepiness','internal_images_present','interruption_count','auditory_safety_clear_confirmed','playback_not_neural_measurement_confirmed','vault_entry_ref')) then raise exception 'day045_v2_active_unknown_field'; end if;
 if a->>'preset_id' is distinct from 'HNK-HAZIEL-D045-ACTIVE-V1' or a->'duration_seconds' is distinct from '600'::jsonb or a->'left_hz' is distinct from '432'::jsonb or a->'right_hz' is distinct from '444'::jsonb or a->'difference_hz' is distinct from '12'::jsonb then raise exception 'day045_v2_active_preset_mismatch'; end if;
 if jsonb_typeof(a->'internal_images_present') is distinct from 'boolean' then raise exception 'day045_v2_active_image_flag_invalid'; end if;
 foreach k in array array['distractions','returns','comfort','focus','sleepiness','interruption_count'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(a->k),false) then raise exception 'day045_v2_active_scalar_invalid:%',k; end if; end loop;
 if (a->>'comfort')::int>10 or (a->>'focus')::int>10 or (a->>'sleepiness')::int>10 or (a->>'distractions')::int>9999 or (a->>'returns')::int>9999 or (a->>'interruption_count')::int>9999 then raise exception 'day045_v2_active_scalar_invalid'; end if;
 if a->'headphones_comfortable_confirmed' is distinct from 'true'::jsonb or a->'volume_comfortable_confirmed' is distinct from 'true'::jsonb or a->'explicit_start_confirmed' is distinct from 'true'::jsonb or a->'autoplay_absent_confirmed' is distinct from 'true'::jsonb or a->'immediate_stop_available_confirmed' is distinct from 'true'::jsonb or a->'posture_stable_confirmed' is distinct from 'true'::jsonb or a->'auditory_safety_clear_confirmed' is distinct from 'true'::jsonb or a->'playback_not_neural_measurement_confirmed' is distinct from 'true'::jsonb then raise exception 'day045_v2_active_boundaries_required'; end if;
 r:=a->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day045_v2_active_vault_ref_invalid'; end if;

 c:=p_evidence->'control'; if jsonb_typeof(c) is distinct from 'object' then raise exception 'day045_v2_control_required'; end if;
 if exists(select 1 from jsonb_object_keys(c) x where x not in ('preset_id','duration_seconds','left_hz','right_hz','difference_hz','rest_before_control_confirmed','comparable_loudness_confirmed','comparable_context_confirmed','same_task_confirmed','preselected_winner_absent_confirmed','distractions','returns','comfort','focus','sleepiness','expectation','preference','internal_images_present','interruption_count','auditory_safety_clear_confirmed','playback_not_neural_measurement_confirmed','vault_entry_ref')) then raise exception 'day045_v2_control_unknown_field'; end if;
 if c->>'preset_id' is distinct from 'HNK-HAZIEL-D045-CONTROL-V1' or c->'duration_seconds' is distinct from '600'::jsonb or c->'left_hz' is distinct from '432'::jsonb or c->'right_hz' is distinct from '432'::jsonb or c->'difference_hz' is distinct from '0'::jsonb then raise exception 'day045_v2_control_preset_mismatch'; end if;
 if jsonb_typeof(c->'internal_images_present') is distinct from 'boolean' then raise exception 'day045_v2_control_image_flag_invalid'; end if;
 foreach k in array array['distractions','returns','comfort','focus','sleepiness','expectation','preference','interruption_count'] loop if not coalesce(hnk_private.jsonb_is_nonnegative_integer(c->k),false) then raise exception 'day045_v2_control_scalar_invalid:%',k; end if; end loop;
 if (c->>'comfort')::int>10 or (c->>'focus')::int>10 or (c->>'sleepiness')::int>10 or (c->>'expectation')::int>10 or (c->>'preference')::int>10 or (c->>'distractions')::int>9999 or (c->>'returns')::int>9999 or (c->>'interruption_count')::int>9999 then raise exception 'day045_v2_control_scalar_invalid'; end if;
 if c->'rest_before_control_confirmed' is distinct from 'true'::jsonb or c->'comparable_loudness_confirmed' is distinct from 'true'::jsonb or c->'comparable_context_confirmed' is distinct from 'true'::jsonb or c->'same_task_confirmed' is distinct from 'true'::jsonb or c->'preselected_winner_absent_confirmed' is distinct from 'true'::jsonb or c->'auditory_safety_clear_confirmed' is distinct from 'true'::jsonb or c->'playback_not_neural_measurement_confirmed' is distinct from 'true'::jsonb then raise exception 'day045_v2_control_boundaries_required'; end if;
 r:=c->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day045_v2_control_vault_ref_invalid'; end if;

 s:=p_evidence->'post_silence'; if jsonb_typeof(s) is distinct from 'object' then raise exception 'day045_v2_post_silence_required'; end if;
 if exists(select 1 from jsonb_object_keys(s) x where x not in ('duration_seconds','audio_stopped_confirmed','headphones_removed_confirmed','completed_confirmed')) then raise exception 'day045_v2_post_silence_unknown_field'; end if;
 if s->'duration_seconds' is distinct from '60'::jsonb or s->'audio_stopped_confirmed' is distinct from 'true'::jsonb or s->'headphones_removed_confirmed' is distinct from 'true'::jsonb or s->'completed_confirmed' is distinct from 'true'::jsonb then raise exception 'day045_v2_post_silence_60_required'; end if;

 cmp:=p_evidence->'comparison'; if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day045_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','interpretation_separated_confirmed','possible_competing_variables_recorded_confirmed','causality_not_claimed_confirmed','neural_state_not_claimed_confirmed','therapy_or_healing_not_claimed_confirmed','initiatic_superiority_not_claimed_confirmed','higher_volume_not_deeper_confirmed','vault_entry_ref')) then raise exception 'day045_v2_comparison_unknown_field'; end if;
 if cmp->'completed_confirmed' is distinct from 'true'::jsonb or cmp->'interpretation_separated_confirmed' is distinct from 'true'::jsonb or cmp->'possible_competing_variables_recorded_confirmed' is distinct from 'true'::jsonb or cmp->'causality_not_claimed_confirmed' is distinct from 'true'::jsonb or cmp->'neural_state_not_claimed_confirmed' is distinct from 'true'::jsonb or cmp->'therapy_or_healing_not_claimed_confirmed' is distinct from 'true'::jsonb or cmp->'initiatic_superiority_not_claimed_confirmed' is distinct from 'true'::jsonb or cmp->'higher_volume_not_deeper_confirmed' is distinct from 'true'::jsonb then raise exception 'day045_v2_comparison_boundaries_required'; end if;
 r:=cmp->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day045_v2_comparison_vault_ref_invalid'; end if;

 m:=p_evidence->'middle'; if jsonb_typeof(m) is distinct from 'object' then raise exception 'day045_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_25_6_confirmed','he_zayin_yod_confirmed','technology_not_spiritual_authority_confirmed','played_perceived_unknown_separated_confirmed','thanks_to_god_confirmed','functional_return_confirmed','vault_entry_ref')) then raise exception 'day045_v2_middle_unknown_field'; end if;
 if m->'psalm_25_6_confirmed' is distinct from 'true'::jsonb or m->'he_zayin_yod_confirmed' is distinct from 'true'::jsonb or m->'technology_not_spiritual_authority_confirmed' is distinct from 'true'::jsonb or m->'played_perceived_unknown_separated_confirmed' is distinct from 'true'::jsonb or m->'thanks_to_god_confirmed' is distinct from 'true'::jsonb or m->'functional_return_confirmed' is distinct from 'true'::jsonb then raise exception 'day045_v2_middle_boundaries_required'; end if;
 r:=m->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day045_v2_middle_vault_ref_invalid'; end if;

 soul:=p_evidence->'soul_mirror'; if jsonb_typeof(soul) is distinct from 'object' or soul->'completed' is distinct from 'true'::jsonb then raise exception 'day045_v2_soul_required'; end if;
 if exists(select 1 from jsonb_object_keys(soul) x where x not in ('completed','vault_entry_ref')) then raise exception 'day045_v2_soul_unknown_field'; end if;
 r:=soul->>'vault_entry_ref'; if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day045_v2_soul_vault_ref_invalid'; end if;

 legacy:=jsonb_build_object('protocol_completed',true,'return_confirmed',m->'functional_return_confirmed','active_completed',true,'control_completed',true,'rest_confirmed',c->'rest_before_control_confirmed','post_silence_completed',s->'completed_confirmed','comparison_completed',cmp->'completed_confirmed','interpretation_separated',cmp->'interpretation_separated_confirmed','safety_clear',p_evidence->'final_safety_clear_confirmed','active_seconds',600,'control_seconds',600,'post_silence_seconds',60);
 perform hnk_private.validate_day045_scalar_evidence_v1(legacy);
end$$;

create or replace function hnk_private.assert_day045_audio_publication_gate_v1()
returns void language plpgsql set search_path='' as $$
declare a record; c record;
begin
 select * into a from public.asset_registry where asset_key='hnk.haziel.day045.active.v1';
 if not found then raise exception 'day045_active_audio_registry_missing'; end if;
 select * into c from public.asset_registry where asset_key='hnk.haziel.day045.control.v1';
 if not found then raise exception 'day045_control_audio_registry_missing'; end if;
 if a.model_version is distinct from 'HNK-HAZIEL-D045-ACTIVE-V1' or a.duration_seconds is distinct from 600::numeric or a.metadata->>'reference_render_sha256' is distinct from '33b8e3567cba0ad1f05d080c437eecfe51e1993dba0d20ecfe6f600bb52f42a3' or a.metadata->>'left_hz' is distinct from '432' or a.metadata->>'right_hz' is distinct from '444' or a.metadata->>'difference_hz' is distinct from '12' then raise exception 'day045_active_audio_authority_mismatch'; end if;
 if c.model_version is distinct from 'HNK-HAZIEL-D045-CONTROL-V1' or c.duration_seconds is distinct from 600::numeric or c.metadata->>'reference_render_sha256' is distinct from '012100633f1548d00e62a79b0e7a0cd67a8121d198f38c1e758cf30bdaec3002' or c.metadata->>'left_hz' is distinct from '432' or c.metadata->>'right_hz' is distinct from '432' or c.metadata->>'difference_hz' is distinct from '0' then raise exception 'day045_control_audio_authority_mismatch'; end if;
 if a.approval_state is distinct from 'published' or a.published_at is null or nullif(btrim(a.storage_path),'') is null or a.checksum_sha256 !~* '^[0-9a-f]{64}$' or coalesce(a.metadata->>'published','false')<>'true' or coalesce(a.metadata->>'master_asset_pending','true')<>'false' or coalesce(a.metadata->>'runtime_publication_qa_pending','true')<>'false' or coalesce(a.metadata->>'listening_qa_pending','true')<>'false' or coalesce(a.metadata->>'device_qa_pending','true')<>'false' then raise exception 'day045_audio_publication_pending:active'; end if;
 if c.approval_state is distinct from 'published' or c.published_at is null or nullif(btrim(c.storage_path),'') is null or c.checksum_sha256 !~* '^[0-9a-f]{64}$' or coalesce(c.metadata->>'published','false')<>'true' or coalesce(c.metadata->>'master_asset_pending','true')<>'false' or coalesce(c.metadata->>'runtime_publication_qa_pending','true')<>'false' or coalesce(c.metadata->>'listening_qa_pending','true')<>'false' or coalesce(c.metadata->>'device_qa_pending','true')<>'false' then raise exception 'day045_audio_publication_pending:control'; end if;
end$$;

create or replace function hnk_private.validate_day045_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
begin
 perform hnk_private.validate_day045_evidence_v2(p_evidence,p_expected_source_sha);
 perform hnk_private.assert_day045_audio_publication_gate_v1();
end$$;

create or replace function hnk_private.enforce_haziel_045_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_existing boolean; v_source_sha text; v_status text;
begin
 if new.day<>45 or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions where user_id=new.user_id and day=45) into v_existing;
 if v_existing then return new; end if;
 select source_sha,status into v_source_sha,v_status from public.codex_days where day=45;
 if v_status is distinct from 'canon' then raise exception 'haziel_day045_canonical_not_available'; end if;
 if v_source_sha is distinct from '67e6d708444ae1fd62713ebebfb8da4d79a100e5' then raise exception 'day045_canonical_source_sha_mismatch'; end if;
 if new.evidence->>'protocol_version'='HNK-CHOKMAH-D045-V2' then
   perform hnk_private.validate_day045_evidence_v2(new.evidence,v_source_sha);
   if new.state='complete' then perform hnk_private.assert_day045_audio_publication_gate_v1(); end if;
 else
   perform hnk_private.validate_day045_scalar_evidence_v1(new.evidence);
 end if;
 return new;
end$$;

do $$
declare v_def text; v_old text; v_new text;
begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day045_v2''' in v_def)=0 then
   v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
   if position(v_old in v_def)=0 then raise exception 'day045_dispatcher_patch_anchor_missing'; end if;
   v_new:='  when ''day045_v2'' then perform hnk_private.validate_day045_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
   v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D045-COMP-V2','HNK-CHOKMAH-D045-V2',45,'67e6d708444ae1fd62713ebebfb8da4d79a100e5','2.0.0','day045_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();