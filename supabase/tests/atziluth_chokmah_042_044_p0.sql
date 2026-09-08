-- Haziel 042-044 P0 adversarial QA.
-- Designed for a disposable/local Supabase database. Entire fixture rolls back.

begin;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  ('66666666-6666-6666-6666-666666666666','00000000-0000-0000-0000-000000000000','authenticated','authenticated','haziel-a@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now()),
  ('77777777-7777-7777-7777-777777777777','00000000-0000-0000-0000-000000000000','authenticated','authenticated','haziel-b@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());

insert into public.user_progress(user_id,xp_total,initiatory_grade,initiatory_title,current_day,current_chapter,current_sephira)
values
  ('66666666-6666-6666-6666-666666666666',0,2,'Iniciado',42,2,'Chokmah'),
  ('77777777-7777-7777-7777-777777777777',0,2,'Iniciado',42,2,'Chokmah');

insert into public.day_completions(user_id,day,completion_version)
values ('66666666-6666-6666-6666-666666666666',41,'qa-fixture');

insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,evidence) values
  ('f0000000-0000-0000-0000-000000000042','66666666-6666-6666-6666-666666666666',42,'haziel-42','canonical','active','{}'::jsonb),
  ('f0000000-0000-0000-0000-000000000043','66666666-6666-6666-6666-666666666666',43,'haziel-43','canonical','active','{}'::jsonb),
  ('f0000000-0000-0000-0000-000000000044','66666666-6666-6666-6666-666666666666',44,'haziel-44','canonical','active','{}'::jsonb),
  ('f1000000-0000-0000-0000-000000000042','77777777-7777-7777-7777-777777777777',42,'haziel-fake-revisit','revisit','active','{}'::jsonb);

do $$ begin
  begin
    update public.practice_sessions set evidence='{"protocol_completed":true}'::jsonb,state='evidence_pending' where id='f0000000-0000-0000-0000-000000000042'::uuid;
    raise exception 'qa_expected_day042_missing_field_rejection';
  exception when others then
    if sqlerrm='qa_expected_day042_missing_field_rejection' then raise; end if;
    if sqlerrm <> 'day042_required_flag_missing' then raise; end if;
  end;
end $$;

do $$ begin
  begin
    update public.practice_sessions
    set evidence='{"protocol_completed":true,"return_confirmed":true,"massage_completed":true,"residual_completed":true,"control_completed":true,"comparison_completed":true,"interpretation_separated":true,"safety_clear":true,"frontal_sensation_present":false,"control_sensation_present":false,"massage_seconds":180,"residual_seconds":300,"control_seconds":300,"private_note":"forbidden"}'::jsonb,state='evidence_pending'
    where id='f0000000-0000-0000-0000-000000000042'::uuid;
    raise exception 'qa_expected_day042_unknown_field_rejection';
  exception when others then
    if sqlerrm='qa_expected_day042_unknown_field_rejection' then raise; end if;
    if sqlerrm <> 'day042_evidence_unknown_field' then raise; end if;
  end;
end $$;

do $$ begin
  begin
    update public.practice_sessions set evidence='{"protocol_completed":true}'::jsonb,state='evidence_pending' where id='f1000000-0000-0000-0000-000000000042'::uuid;
    raise exception 'qa_expected_fake_revisit_rejection';
  exception when others then
    if sqlerrm='qa_expected_fake_revisit_rejection' then raise; end if;
    if sqlerrm <> 'day042_required_flag_missing' then raise; end if;
  end;
end $$;

update public.practice_sessions
set evidence='{"protocol_completed":true,"return_confirmed":true,"massage_completed":true,"residual_completed":true,"control_completed":true,"comparison_completed":true,"interpretation_separated":true,"safety_clear":true,"frontal_sensation_present":false,"control_sensation_present":false,"massage_seconds":180,"residual_seconds":300,"control_seconds":300}'::jsonb,state='evidence_pending'
where id='f0000000-0000-0000-0000-000000000042'::uuid;

set local role authenticated;
set local request.jwt.claim.sub='66666666-6666-6666-6666-666666666666';
do $$ declare v jsonb; begin
  v := public.complete_codex_day(42::smallint,'f0000000-0000-0000-0000-000000000042'::uuid,'qa42',now());
  if (v->>'xp_awarded')::int <> 100 then raise exception 'qa_day042_xp_mismatch'; end if;
end $$;
reset role;

update public.practice_sessions
set evidence='{"protocol_completed":true,"return_confirmed":true,"blue_completed":true,"gray_completed":true,"comparison_completed":true,"interpretation_separated":true,"clairvoyance_not_claimed":true,"safety_clear":true,"blue_content_present":false,"gray_content_present":false,"blue_seconds":600,"gray_seconds":600}'::jsonb,state='evidence_pending'
where id='f0000000-0000-0000-0000-000000000043'::uuid;

set local role authenticated;
set local request.jwt.claim.sub='66666666-6666-6666-6666-666666666666';
do $$ declare v jsonb; begin
  v := public.complete_codex_day(43::smallint,'f0000000-0000-0000-0000-000000000043'::uuid,'qa43',now());
  if (v->>'xp_awarded')::int <> 150 then raise exception 'qa_day043_xp_mismatch'; end if;
end $$;
reset role;

do $$ begin
  begin
    update public.practice_sessions
    set evidence='{"protocol_completed":true,"return_confirmed":true,"active_script_completed":true,"neutral_comparison_completed":true,"ethical_review_completed":true,"autonomy_preserved":true,"truisms_logged":6,"suggestions_logged":3,"script":"forbidden"}'::jsonb,state='evidence_pending'
    where id='f0000000-0000-0000-0000-000000000044'::uuid;
    raise exception 'qa_expected_day044_private_text_rejection';
  exception when others then
    if sqlerrm='qa_expected_day044_private_text_rejection' then raise; end if;
    if sqlerrm <> 'day044_evidence_unknown_field' then raise; end if;
  end;
end $$;

update public.practice_sessions
set evidence='{"protocol_completed":true,"return_confirmed":true,"active_script_completed":true,"neutral_comparison_completed":true,"ethical_review_completed":true,"autonomy_preserved":true,"truisms_logged":6,"suggestions_logged":3}'::jsonb,state='evidence_pending'
where id='f0000000-0000-0000-0000-000000000044'::uuid;

set local role authenticated;
set local request.jwt.claim.sub='66666666-6666-6666-6666-666666666666';
do $$ declare v jsonb; v_xp int; v_day smallint; begin
  v := public.complete_codex_day(44::smallint,'f0000000-0000-0000-0000-000000000044'::uuid,'qa44',now());
  if (v->>'xp_awarded')::int <> 150 then raise exception 'qa_day044_xp_mismatch'; end if;
  select xp_total,current_day into v_xp,v_day from public.user_progress where user_id='66666666-6666-6666-6666-666666666666';
  if v_xp <> 400 then raise exception 'qa_haziel_xp_total_mismatch'; end if;
  if v_day <> 45 then raise exception 'qa_haziel_current_day_mismatch'; end if;
  begin
    perform public.complete_codex_day(45::smallint,'f0000000-0000-0000-0000-000000000044'::uuid,'qa45',now());
    raise exception 'qa_expected_day045_canonical_block';
  exception when others then
    if sqlerrm='qa_expected_day045_canonical_block' then raise; end if;
    if sqlerrm <> 'canonical_day_not_found' then raise; end if;
  end;
end $$;
reset role;

do $$ begin
  if has_function_privilege('authenticated','hnk_private.validate_day042_scalar_evidence_v1(jsonb)','EXECUTE') then raise exception 'qa_day042_validator_exposed'; end if;
  if has_function_privilege('authenticated','hnk_private.validate_day043_scalar_evidence_v1(jsonb)','EXECUTE') then raise exception 'qa_day043_validator_exposed'; end if;
  if has_function_privilege('authenticated','hnk_private.validate_day044_scalar_evidence_v1(jsonb)','EXECUTE') then raise exception 'qa_day044_validator_exposed'; end if;
end $$;

rollback;
