create or replace function hnk_private.validate_day058_completion_v2(p_evidence jsonb,p_expected_source_sha text)
returns void language plpgsql set search_path='' as $$
declare
 s jsonb; d jsonb; cmp jsonb; m jsonb; legacy jsonb;
 k text; r text; i integer; stopped boolean; refs text[]:=array[]::text[];
begin
 if jsonb_typeof(p_evidence) is distinct from 'object' then raise exception 'day058_v2_evidence_object_required'; end if;
 if exists(select 1 from jsonb_object_keys(p_evidence) x where x not in ('protocol_version','source_sha','session_id','mode','scripts','direct_control','comparison','middle','voluntary_completion_confirmed','final_safety_clear_confirmed','safety_stop_occurred','safety_stop_reason')) then raise exception 'day058_v2_unknown_top_field'; end if;
 if p_evidence->>'protocol_version' is distinct from 'HNK-CHOKMAH-D058-V2' then raise exception 'day058_v2_protocol_invalid'; end if;
 if p_evidence->>'source_sha' is distinct from p_expected_source_sha or p_expected_source_sha is distinct from 'e32753a57daab23d378e881451194b0dd77d8aac' then raise exception 'day058_v2_source_sha_invalid'; end if;
 if nullif(btrim(p_evidence->>'session_id'),'') is null then raise exception 'day058_v2_session_required'; end if;
 if coalesce(p_evidence->>'mode','first_completion') not in ('first_completion','revisit') then raise exception 'day058_v2_mode_invalid'; end if;
 if p_evidence->'voluntary_completion_confirmed' is distinct from 'true'::jsonb or p_evidence->'final_safety_clear_confirmed' is distinct from 'true'::jsonb then raise exception 'day058_v2_completion_boundaries_required'; end if;
 if jsonb_typeof(p_evidence->'safety_stop_occurred') is distinct from 'boolean' then raise exception 'day058_v2_safety_stop_flag_invalid'; end if;
 if p_evidence->>'safety_stop_reason' not in ('NONE','PRESSURE_INCREASED','DISCOMFORT','AUTONOMY_CONCERN','OTHER') then raise exception 'day058_v2_safety_reason_invalid'; end if;
 stopped:=(p_evidence->>'safety_stop_occurred')::boolean;
 if stopped and p_evidence->>'safety_stop_reason'='NONE' then raise exception 'day058_v2_safety_reason_required'; end if;
 if not stopped and p_evidence->>'safety_stop_reason'<>'NONE' then raise exception 'day058_v2_safety_reason_without_stop'; end if;

 if jsonb_typeof(p_evidence->'scripts') is distinct from 'array' or jsonb_array_length(p_evidence->'scripts')<>3 then raise exception 'day058_v2_exactly_three_scripts_required'; end if;
 for i in 0..2 loop
  s:=p_evidence->'scripts'->i;
  if jsonb_typeof(s) is distinct from 'object' then raise exception 'day058_v2_script_object_required:%',i+1; end if;
  if exists(select 1 from jsonb_object_keys(s) x where x not in ('index','vault_entry_ref','two_benign_options_confirmed','real_refusal_option_confirmed','self_use_only_confirmed','no_clinical_promise_confirmed','no_covert_command_confirmed','choice_preserved_confirmed','relaxation','clarity','pressure','autonomy')) then raise exception 'day058_v2_script_unknown_field:%',i+1; end if;
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->'index'),false) then raise exception 'day058_v2_script_index_invalid:%',i+1; end if;
  if (s->>'index')::integer<>i+1 then raise exception 'day058_v2_script_index_order_invalid:%',i+1; end if;
  foreach k in array array['two_benign_options_confirmed','real_refusal_option_confirmed','self_use_only_confirmed','no_clinical_promise_confirmed','no_covert_command_confirmed','choice_preserved_confirmed'] loop
   if s->k is distinct from 'true'::jsonb then raise exception 'day058_v2_script_boundary_required:%:%',i+1,k; end if;
  end loop;
  foreach k in array array['relaxation','clarity','pressure','autonomy'] loop
   if not coalesce(hnk_private.jsonb_is_nonnegative_integer(s->k),false) then raise exception 'day058_v2_script_metric_invalid:%:%',i+1,k; end if;
   if (s->>k)::integer>10 then raise exception 'day058_v2_script_metric_invalid:%:%',i+1,k; end if;
  end loop;
  r:=s->>'vault_entry_ref';
  if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day058_v2_script_vault_ref_invalid:%',i+1; end if;
  refs:=array_append(refs,lower(r));
 end loop;

 d:=p_evidence->'direct_control';
 if jsonb_typeof(d) is distinct from 'object' then raise exception 'day058_v2_direct_control_required'; end if;
 if exists(select 1 from jsonb_object_keys(d) x where x not in ('selected_script_index','vault_entry_ref','same_goal_confirmed','separate_moment_confirmed','text_locked_before_result_confirmed','direct_formulation_confirmed','discomfort_allows_abandonment_confirmed','relaxation','clarity','pressure','autonomy')) then raise exception 'day058_v2_direct_control_unknown_field'; end if;
 if not coalesce(hnk_private.jsonb_is_nonnegative_integer(d->'selected_script_index'),false) then raise exception 'day058_v2_selected_script_index_invalid'; end if;
 if (d->>'selected_script_index')::integer not between 1 and 3 then raise exception 'day058_v2_selected_script_index_invalid'; end if;
 foreach k in array array['same_goal_confirmed','separate_moment_confirmed','text_locked_before_result_confirmed','direct_formulation_confirmed','discomfort_allows_abandonment_confirmed'] loop
  if d->k is distinct from 'true'::jsonb then raise exception 'day058_v2_direct_control_boundary_required:%',k; end if;
 end loop;
 foreach k in array array['relaxation','clarity','pressure','autonomy'] loop
  if not coalesce(hnk_private.jsonb_is_nonnegative_integer(d->k),false) then raise exception 'day058_v2_direct_control_metric_invalid:%',k; end if;
  if (d->>k)::integer>10 then raise exception 'day058_v2_direct_control_metric_invalid:%',k; end if;
 end loop;
 r:=d->>'vault_entry_ref';
 if r is null or r!~*'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'day058_v2_direct_control_vault_ref_invalid'; end if;
 refs:=array_append(refs,lower(r));
 if (select count(distinct x) from unnest(refs) x)<>4 then raise exception 'day058_v2_four_distinct_vault_refs_required'; end if;

 cmp:=p_evidence->'comparison';
 if jsonb_typeof(cmp) is distinct from 'object' then raise exception 'day058_v2_comparison_required'; end if;
 if exists(select 1 from jsonb_object_keys(cmp) x where x not in ('completed_confirmed','autonomy_preserved_confirmed','pressure_accepted_as_data_confirmed','obedience_not_success_metric_confirmed','consent_bypass_not_used_confirmed','affective_commercial_sexual_advantage_not_used_confirmed','high_impact_not_used_confirmed','clinical_promise_not_used_confirmed','covert_command_not_used_confirmed','prudence_rule_defined_confirmed')) then raise exception 'day058_v2_comparison_unknown_field'; end if;
 foreach k in array array['completed_confirmed','autonomy_preserved_confirmed','pressure_accepted_as_data_confirmed','obedience_not_success_metric_confirmed','consent_bypass_not_used_confirmed','affective_commercial_sexual_advantage_not_used_confirmed','high_impact_not_used_confirmed','clinical_promise_not_used_confirmed','covert_command_not_used_confirmed','prudence_rule_defined_confirmed'] loop
  if cmp->k is distinct from 'true'::jsonb then raise exception 'day058_v2_comparison_boundary_required:%',k; end if;
 end loop;

 m:=p_evidence->'middle';
 if jsonb_typeof(m) is distinct from 'object' then raise exception 'day058_v2_middle_required'; end if;
 if exists(select 1 from jsonb_object_keys(m) x where x not in ('psalm_10_1_confirmed','he_he_aleph_confirmed','transparent_rewrite_completed_confirmed','refusal_preserved_confirmed','language_sensation_interpretation_separated_confirmed','conscious_return_confirmed','personal_no_consent_bypass_rule_defined_confirmed')) then raise exception 'day058_v2_middle_unknown_field'; end if;
 foreach k in array array['psalm_10_1_confirmed','he_he_aleph_confirmed','transparent_rewrite_completed_confirmed','refusal_preserved_confirmed','language_sensation_interpretation_separated_confirmed','conscious_return_confirmed','personal_no_consent_bypass_rule_defined_confirmed'] loop
  if m->k is distinct from 'true'::jsonb then raise exception 'day058_v2_middle_boundary_required:%',k; end if;
 end loop;

 legacy:=jsonb_build_object(
  'protocol_completed',true,
  'return_confirmed',m->'conscious_return_confirmed',
  'self_use_only',true,
  'three_scripts_completed',true,
  'real_refusal_option_present',true,
  'direct_comparison_completed',d->'direct_formulation_confirmed',
  'comparison_completed',cmp->'completed_confirmed',
  'autonomy_preserved',cmp->'autonomy_preserved_confirmed',
  'no_clinical_promise',cmp->'clinical_promise_not_used_confirmed',
  'no_covert_command',cmp->'covert_command_not_used_confirmed',
  'no_high_impact_use',cmp->'high_impact_not_used_confirmed',
  'vault_saved',true,
  'safety_clear',p_evidence->'final_safety_clear_confirmed',
  'scripts_logged',3
 );
 perform hnk_private.validate_day058_scalar_evidence_v1(legacy);
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
  if v_source_sha is distinct from 'e0b9b51cac81012e4511e6394c6f3dff7f50aaf8' then raise exception 'day059_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day059_scalar_evidence_v1(new.evidence);
 elsif new.day=60 then
  if v_source_sha is distinct from 'e98e8925c8e03555c39b033813999d6a488149a9' then raise exception 'day060_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day060_scalar_evidence_v1(new.evidence);
 else
  if v_source_sha is distinct from '12e4c2da623f2f78d3fea3ff65e23f9446f9784b' then raise exception 'day061_canonical_source_sha_mismatch'; end if; perform hnk_private.validate_day061_scalar_evidence_v1(new.evidence);
 end if;
 return new;
end$$;

do $$ declare v_def text; v_old text; v_new text; begin
 select pg_get_functiondef('hnk_private.validate_completion_contract_v2(text,jsonb,text)'::regprocedure) into v_def;
 if position('when ''day058_v2''' in v_def)=0 then
  v_old:='  else raise exception ''unsupported_completion_validator:%'',p_validator_key;';
  if position(v_old in v_def)=0 then raise exception 'day058_dispatcher_patch_anchor_missing'; end if;
  v_new:='  when ''day058_v2'' then perform hnk_private.validate_day058_completion_v2(p_evidence,p_expected_source_sha);'||E'\n'||v_old;
  v_def:=replace(v_def,v_old,v_new); execute v_def;
 end if;
end$$;

insert into hnk_private.completion_contract_registry(completion_contract_id,quest_definition_id,day,canonical_source_sha,contract_version,validator_key,status)
values('HNK-CHOKMAH-D058-COMP-V2','HNK-CHOKMAH-D058-V2',58,'e32753a57daab23d378e881451194b0dd77d8aac','2.0.0','day058_v2','draft')
on conflict(completion_contract_id) do update set quest_definition_id=excluded.quest_definition_id,day=excluded.day,canonical_source_sha=excluded.canonical_source_sha,contract_version=excluded.contract_version,validator_key=excluded.validator_key,status='draft',updated_at=now();
