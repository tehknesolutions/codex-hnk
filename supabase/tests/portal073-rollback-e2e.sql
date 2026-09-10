-- Portal 073 rollback E2E.
-- Destructive-looking fixtures are transaction-local and MUST be rolled back.
-- Covers valid evidence, negative evidence cases, canonical +500 XP exactly once,
-- Iniciado -> Teurgo, retry idempotency, Binah/Day074 unlock and no Day074 auto-start.

begin;

do $$
declare
  u uuid := gen_random_uuid();
  s uuid := gen_random_uuid();
  v uuid := gen_random_uuid();
  ev jsonb;
  r1 jsonb;
  r2 jsonb;
  xp_count integer;
  xp_sum integer;
  completion_count integer;
  day74_sessions integer;
  p public.user_progress%rowtype;
  rejected boolean;
begin
  insert into auth.users(id,aud,role,email,created_at,updated_at)
  values (u,'authenticated','authenticated','portal073-e2e-'||u::text||'@invalid.example',now(),now());

  perform set_config('request.jwt.claim.sub', u::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub',u::text,'role','authenticated')::text, true);

  insert into public.user_progress(user_id,xp_total,initiatory_grade,initiatory_title,current_day,current_chapter,current_sephira)
  values (u,0,2,'Iniciado',73,2,'Chokmah');

  insert into public.day_completions(user_id,day,completion_version)
  select u, gs::smallint, 'e2e-prior' from generate_series(37,72) gs;

  insert into public.journal_vault(id,user_id,day,ciphertext,nonce,aad,crypto_alg,crypto_version,checksum_sha256,client_created_at)
  values (v,u,73,'e2e-ciphertext','e2e-nonce','e2e-aad','AES-256-GCM',1,repeat('a',64),now());

  ev := jsonb_build_object(
    'schema_version','HNK-PORTAL-073-EVIDENCE-V1',
    'tuner_preset_id','HNK-ANGELIC-TUNER-D073-V1',
    'transition_preset_id','HNK-PORTAL073-CHOKMAH-BINAH-ACTIVE-V1',
    'sigil_asset_id','HNK-REF-MAGICIAN-MERCURY-V1',
    'induction_completed',true,
    'return_gate_confirmed',true,
    'vault_receipt',v::text,
    'tuner_completed',true,
    'transition_audio_completed',true,
    'sigil_completed',true,
    'operator_ids_verified',true,
    'volume_control_available',true,
    'immediate_stop_available',true,
    'safety_clear',true,
    'audio_seconds',600
  );

  update hnk_private.portal_operator_sets set status='published',updated_at=now() where portal_day=73;

  -- Negative structural-evidence matrix.
  rejected := false;
  begin
    perform hnk_private.assert_portal_completion_evidence(73::smallint, ev || jsonb_build_object('audio_seconds',599));
  exception when others then
    if sqlerrm = 'portal073_audio_duration_mismatch' then rejected := true; else raise; end if;
  end;
  if not rejected then raise exception 'P73_E2E_expected_audio_599_rejection'; end if;

  rejected := false;
  begin
    perform hnk_private.assert_portal_completion_evidence(73::smallint, ev - 'sigil_completed');
  exception when others then
    if sqlerrm = 'portal073_required_operator_checkpoint_missing' then rejected := true; else raise; end if;
  end;
  if not rejected then raise exception 'P73_E2E_expected_missing_sigil_rejection'; end if;

  rejected := false;
  begin
    perform hnk_private.assert_portal_completion_evidence(73::smallint, ev || jsonb_build_object('transition_preset_id','WRONG'));
  exception when others then
    if sqlerrm = 'portal_operator_version_mismatch' then rejected := true; else raise; end if;
  end;
  if not rejected then raise exception 'P73_E2E_expected_operator_mismatch_rejection'; end if;

  rejected := false;
  begin
    perform hnk_private.assert_portal_completion_evidence(73::smallint, ev || jsonb_build_object('diary_plaintext','forbidden'));
  exception when others then
    if sqlerrm = 'portal_plaintext_evidence_forbidden' then rejected := true; else raise; end if;
  end;
  if not rejected then raise exception 'P73_E2E_expected_plaintext_rejection'; end if;

  rejected := false;
  begin
    perform hnk_private.assert_portal_completion_evidence(73::smallint, ev || jsonb_build_object('vault_receipt',gen_random_uuid()::text));
  exception when others then
    if sqlerrm = 'portal_encrypted_vault_receipt_not_found' then rejected := true; else raise; end if;
  end;
  if not rejected then raise exception 'P73_E2E_expected_fake_vault_receipt_rejection'; end if;

  perform hnk_private.assert_portal_completion_evidence(73::smallint, ev);

  insert into public.practice_sessions(id,user_id,day,client_session_id,mode,state,duration_seconds,metrics,evidence,started_at,ended_at)
  values (s,u,73,'portal073-e2e-'||s::text,'first_completion','evidence_pending',600,'{}'::jsonb,ev,now(),now());

  r1 := public.complete_codex_day(73::smallint,s,repeat('b',64),now());
  if (r1->>'first_completion')::boolean is distinct from true then raise exception 'P73_E2E_first_completion_not_true'; end if;
  if (r1->>'xp_awarded')::integer <> 500 then raise exception 'P73_E2E_first_xp_not_500'; end if;
  if (r1->>'initiatory_grade')::integer <> 3 then raise exception 'P73_E2E_grade_not_3'; end if;
  if r1->>'initiatory_title' <> 'Teurgo' then raise exception 'P73_E2E_title_not_Teurgo'; end if;

  r2 := public.complete_codex_day(73::smallint,s,repeat('b',64),now());
  if (r2->>'first_completion')::boolean is distinct from false then raise exception 'P73_E2E_retry_first_completion_not_false'; end if;
  if (r2->>'xp_awarded')::integer <> 0 then raise exception 'P73_E2E_retry_xp_not_zero'; end if;

  select count(*)::integer into completion_count from public.day_completions where user_id=u and day=73;
  if completion_count <> 1 then raise exception 'P73_E2E_completion_count_%', completion_count; end if;

  select count(*)::integer,coalesce(sum(amount),0)::integer into xp_count,xp_sum
  from public.xp_events where user_id=u and day=73 and source='canonical_day_completion';
  if xp_count <> 1 or xp_sum <> 500 then raise exception 'P73_E2E_xp_events_count_%_sum_%',xp_count,xp_sum; end if;

  select * into p from public.user_progress where user_id=u;
  if p.xp_total <> 500 or p.initiatory_grade <> 3 or p.initiatory_title <> 'Teurgo'
     or p.current_day <> 74 or p.current_chapter <> 3 or p.current_sephira <> 'Binah'
  then raise exception 'P73_E2E_progression_mismatch'; end if;

  select count(*)::integer into day74_sessions from public.practice_sessions where user_id=u and day=74;
  if day74_sessions <> 0 then raise exception 'P73_E2E_day074_auto_started'; end if;
end;
$$;

rollback;

-- Expected persisted state after execution:
-- P73_RPC_ROLLBACK_E2E_PASS / portal_operator_sets(73).status = approved
select 'P73_RPC_ROLLBACK_E2E_PASS' as e2e_status,
       (select status from hnk_private.portal_operator_sets where portal_day=73) as persisted_operator_status;
