-- Static/transactional guard for the V2 dual-lock contract.
begin;
do $$
declare d text := pg_get_functiondef('hnk_private.complete_codex_day_v2_impl(smallint,uuid,text,text,text,text,text,timestamptz)'::regprocedure);
begin
 if position("v_uid::text || ':day:' || p_day::text" in d)=0 then raise exception 'missing_user_day_lock'; end if;
 if position("v_uid::text || ':' || p_client_completion_id" in d)=0 then raise exception 'missing_client_completion_lock'; end if;
 if position('if p_day = 73 then' in d)=0 or position('p_day <> 73' in d)=0 then raise exception 'portal073_freeze_regressed'; end if;
end $$;
select 'V2_USER_DAY_SERIALIZATION_STRUCTURE_PASS' marker;
rollback;