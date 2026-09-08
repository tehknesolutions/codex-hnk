\set ON_ERROR_STOP on
do $$
declare
  u uuid:='11111111-1111-1111-1111-111111111111';
  e jsonb;
  r1 jsonb;
  r2 jsonb;
  caught boolean;
begin
  if (select count(*) from hnk_rc3_ci.codex_days)<>73 then raise exception 'expected_73_candidate_days'; end if;
  if (select count(*) from hnk_rc3_ci.codex_days where status='reviewed')<>73 then raise exception 'candidate_days_not_reviewed'; end if;
  if exists(select 1 from hnk_rc3_ci.codex_days where status='canon') then raise exception 'candidate_day_promoted_by_default'; end if;
  if (select count(*) from hnk_rc3_ci.registry where status='draft')<>73 then raise exception 'candidate_contracts_not_draft'; end if;
  if exists(select 1 from hnk_rc3_ci.registry where status='active') then raise exception 'candidate_contract_active_by_default'; end if;

  insert into hnk_rc3_ci.completions values(u,36);
  update hnk_rc3_ci.codex_days set status='canon' where day=37;
  update hnk_rc3_ci.registry set status='active' where day=37;
  e:=jsonb_build_object('protocol_version','HNK-CHOKHMAH-D037-RC3','source_sha','sha-037','jachin',jsonb_build_object('completed',true,'return_confirmed',true),'boaz',jsonb_build_object('completed',true,'return_confirmed',true),'equilibrium',jsonb_build_object('completed',true,'return_confirmed',true),'voluntary_completion_confirmed',true);
  r1:=hnk_rc3_ci.complete_day(u,37::smallint,'HNK-CHOKHMAH-D037-COMP-RC3','HNK-CHOKHMAH-D037-RC3','sha-037','replay-037',e);
  r2:=hnk_rc3_ci.complete_day(u,37::smallint,'HNK-CHOKHMAH-D037-COMP-RC3','HNK-CHOKHMAH-D037-RC3','sha-037','replay-037',e);
  if (r1->>'xp_awarded')::int<>100 then raise exception 'day37_xp_failure'; end if;
  if r1<>r2 then raise exception 'receipt_replay_not_identical'; end if;
  if (select count(*) from hnk_rc3_ci.xp_events where user_id=u and day=37)<>1 then raise exception 'day37_xp_not_idempotent'; end if;

  update hnk_rc3_ci.codex_days set status='canon' where day=72;
  update hnk_rc3_ci.registry set status='active' where day=72;
  insert into hnk_rc3_ci.completions select u,d::smallint from generate_series(38,70)d on conflict do nothing;
  e:=jsonb_build_object('protocol_version','HNK-CHOKHMAH-D072-RC3','source_sha','sha-072','jachin',jsonb_build_object('completed',true,'return_confirmed',true),'boaz',jsonb_build_object('completed',true,'return_confirmed',true),'equilibrium',jsonb_build_object('completed',true,'return_confirmed',true),'voluntary_completion_confirmed',true);
  caught:=false;
  begin
    perform hnk_rc3_ci.complete_day(u,72::smallint,'HNK-CHOKHMAH-D072-COMP-RC3','HNK-CHOKHMAH-D072-RC3','sha-072','blocked-072',e);
  exception when others then caught:=sqlerrm='chokhmah_portal_locked'; end;
  if not caught then raise exception 'portal72_failed_to_block_34of35'; end if;
  insert into hnk_rc3_ci.completions values(u,71) on conflict do nothing;
  perform hnk_rc3_ci.complete_day(u,72::smallint,'HNK-CHOKHMAH-D072-COMP-RC3','HNK-CHOKHMAH-D072-RC3','sha-072','pass-072',e);

  update hnk_rc3_ci.codex_days set status='canon' where day=109;
  update hnk_rc3_ci.registry set status='active' where day=109;
  insert into hnk_rc3_ci.completions select u,d::smallint from generate_series(74,107)d on conflict do nothing;
  e:=jsonb_build_object('protocol_version','HNK-BINAH-D109-RC3','source_sha','sha-109','jachin',jsonb_build_object('completed',true,'return_confirmed',true),'boaz',jsonb_build_object('completed',true,'return_confirmed',true),'equilibrium',jsonb_build_object('completed',true,'return_confirmed',true),'voluntary_completion_confirmed',true);
  caught:=false;
  begin
    perform hnk_rc3_ci.complete_day(u,109::smallint,'HNK-BINAH-D109-COMP-RC3','HNK-BINAH-D109-RC3','sha-109','blocked-109',e);
  exception when others then caught:=sqlerrm='binah_portal_locked'; end;
  if not caught then raise exception 'portal109_failed_to_block_34of35'; end if;
  insert into hnk_rc3_ci.completions values(u,108) on conflict do nothing;
  perform hnk_rc3_ci.complete_day(u,109::smallint,'HNK-BINAH-D109-COMP-RC3','HNK-BINAH-D109-RC3','sha-109','pass-109',e);

  if hnk_rc3_ci.sephirah_state(u,72::smallint)->>'sephira'<>'Chokhmah' then raise exception 'generic_state_chokhmah_failure'; end if;
  if hnk_rc3_ci.sephirah_state(u,109::smallint)->>'sephira'<>'Binah' then raise exception 'generic_state_binah_failure'; end if;
  raise notice 'RC3 deterministic DB tests PASS';
end
$$;
