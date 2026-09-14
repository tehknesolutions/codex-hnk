create or replace function hnk_private.enforce_chokmah_day072_scalar_evidence()
returns trigger language plpgsql security definer set search_path='' as $fn$
declare existing boolean; v_source_sha text; v_source_status text;
begin
 if new.day<>72 or new.state not in ('evidence_pending','complete') then return new; end if;
 select exists(select 1 from public.day_completions dc where dc.user_id=new.user_id and dc.day=72) into existing;
 if existing then return new; end if;
 select cd.source_sha,cd.status into v_source_sha,v_source_status from public.codex_days cd where cd.day=72;
 if v_source_status is distinct from 'canon' then raise exception 'day072_canonical_day_not_available'; end if;
 if v_source_sha is distinct from '44c11fee26aef72ebb686ab5f8fd8f27f1239cb2' then raise exception 'day072_canonical_source_sha_mismatch'; end if;
 if new.evidence->>'protocol_version'='HNK-CHOKMAH-D072-V2' then perform hnk_private.validate_day072_completion_v2(new.evidence,v_source_sha); else perform hnk_private.validate_day072_scalar_evidence_v1(new.evidence); end if;
 return new;
end $fn$;
