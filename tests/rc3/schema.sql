-- HNK CODEX · TRIAD I RC3 · PostgreSQL 17 CI sandbox
-- Ephemeral CI database only.
\set ON_ERROR_STOP on

drop schema if exists hnk_rc3_ci cascade;
create schema hnk_rc3_ci;

create table hnk_rc3_ci.codex_days(
  day smallint primary key,
  sephira text not null,
  xp integer not null,
  source_sha text not null,
  status text not null check(status in ('reviewed','canon'))
);

create table hnk_rc3_ci.registry(
  completion_contract_id text primary key,
  quest_definition_id text not null,
  day smallint not null,
  canonical_source_sha text not null,
  status text not null check(status in ('draft','active'))
);

create table hnk_rc3_ci.completions(
  user_id uuid not null,
  day smallint not null,
  primary key(user_id,day)
);

create table hnk_rc3_ci.xp_events(
  user_id uuid not null,
  day smallint not null,
  amount integer not null,
  idempotency_key text primary key
);

create table hnk_rc3_ci.receipts(
  user_id uuid not null,
  client_completion_id text not null,
  day smallint not null,
  response jsonb,
  primary key(user_id,client_completion_id)
);

insert into hnk_rc3_ci.codex_days(day,sephira,xp,source_sha,status)
select d::smallint,
       case when d<=73 then 'Chokhmah' else 'Binah' end,
       case when d in (72,73,109) then 500 else 100 end,
       'sha-'||lpad(d::text,3,'0'),
       'reviewed'
from generate_series(37,109)d;

insert into hnk_rc3_ci.registry(
  completion_contract_id,quest_definition_id,day,canonical_source_sha,status
)
select 'HNK-'||upper(case when d<=73 then 'CHOKHMAH' else 'BINAH' end)||'-D'||lpad(d::text,3,'0')||'-COMP-RC3',
       'HNK-'||upper(case when d<=73 then 'CHOKHMAH' else 'BINAH' end)||'-D'||lpad(d::text,3,'0')||'-RC3',
       d::smallint,
       'sha-'||lpad(d::text,3,'0'),
       'draft'
from generate_series(37,109)d;

create or replace function hnk_rc3_ci.gate_day(p_uid uuid,p_day smallint)
returns void language plpgsql set search_path='' as $$
declare n integer;
begin
  if p_day=37 then
    if not exists(select 1 from hnk_rc3_ci.completions where user_id=p_uid and day=36) then raise exception 'previous_day_required'; end if;
  elsif p_day between 38 and 71 then
    if not exists(select 1 from hnk_rc3_ci.completions where user_id=p_uid and day=p_day-1) then raise exception 'previous_day_required'; end if;
  elsif p_day=72 then
    select count(*) into n from hnk_rc3_ci.completions where user_id=p_uid and day between 37 and 71;
    if n<>35 then raise exception 'chokhmah_portal_locked'; end if;
  elsif p_day=73 then
    if not exists(select 1 from hnk_rc3_ci.completions where user_id=p_uid and day=72) then raise exception 'previous_day_required'; end if;
  elsif p_day=74 then
    if not exists(select 1 from hnk_rc3_ci.completions where user_id=p_uid and day=73) then raise exception 'previous_day_required'; end if;
  elsif p_day between 75 and 108 then
    if not exists(select 1 from hnk_rc3_ci.completions where user_id=p_uid and day=p_day-1) then raise exception 'previous_day_required'; end if;
  elsif p_day=109 then
    select count(*) into n from hnk_rc3_ci.completions where user_id=p_uid and day between 74 and 108;
    if n<>35 then raise exception 'binah_portal_locked'; end if;
  end if;
end $$;

create or replace function hnk_rc3_ci.sephirah_state(p_uid uuid,p_day smallint)
returns jsonb language plpgsql set search_path='' as $$
declare s text;a smallint;b smallint;ps smallint;pe smallint;n integer;unlocked boolean;
begin
  if p_day between 37 and 73 then s:='Chokhmah';a:=37;b:=73;ps:=37;pe:=71;
  elsif p_day between 74 and 109 then s:='Binah';a:=74;b:=109;ps:=74;pe:=108;
  else raise exception 'triad_i_day_out_of_range'; end if;
  select count(*) into n from hnk_rc3_ci.completions where user_id=p_uid and day between a and b;
  select count(*)=(pe-ps+1) into unlocked from hnk_rc3_ci.completions where user_id=p_uid and day between ps and pe;
  return jsonb_build_object('sephira',s,'days_completed',n,'days_total',b-a+1,'portal_unlocked',unlocked,'complete',n=(b-a+1));
end $$;

create or replace function hnk_rc3_ci.complete_day(p_uid uuid,p_day smallint,p_contract text,p_quest text,p_sha text,p_client_id text,p_evidence jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare c hnk_rc3_ci.registry%rowtype;x integer;first_completion boolean:=false;r jsonb;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_uid::text||':'||p_client_id,0));
  select response into r from hnk_rc3_ci.receipts where user_id=p_uid and client_completion_id=p_client_id for update;
  if found and r is not null then return r; end if;
  select * into c from hnk_rc3_ci.registry where completion_contract_id=p_contract and status='active';
  if not found then raise exception 'completion_contract_not_found'; end if;
  if c.day<>p_day then raise exception 'completion_contract_day_mismatch'; end if;
  if c.quest_definition_id<>p_quest then raise exception 'quest_definition_mismatch'; end if;
  if c.canonical_source_sha<>p_sha then raise exception 'canonical_source_sha_mismatch'; end if;
  select xp into x from hnk_rc3_ci.codex_days where day=p_day and status='canon' and source_sha=p_sha;
  if x is null then raise exception 'canonical_day_not_found'; end if;
  if p_evidence->>'protocol_version'<>p_quest or p_evidence->>'source_sha'<>p_sha then raise exception 'evidence_identity_mismatch'; end if;
  if coalesce(p_evidence#>>'{jachin,completed}','false')<>'true' or coalesce(p_evidence#>>'{jachin,return_confirmed}','false')<>'true' then raise exception 'evidence_jachin'; end if;
  if coalesce(p_evidence#>>'{boaz,completed}','false')<>'true' or coalesce(p_evidence#>>'{boaz,return_confirmed}','false')<>'true' then raise exception 'evidence_boaz'; end if;
  if coalesce(p_evidence#>>'{equilibrium,completed}','false')<>'true' or coalesce(p_evidence#>>'{equilibrium,return_confirmed}','false')<>'true' then raise exception 'evidence_equilibrium'; end if;
  if coalesce(p_evidence->>'voluntary_completion_confirmed','false')<>'true' then raise exception 'voluntary_completion_required'; end if;
  perform hnk_rc3_ci.gate_day(p_uid,p_day);
  insert into hnk_rc3_ci.receipts(user_id,client_completion_id,day) values(p_uid,p_client_id,p_day) on conflict do nothing;
  insert into hnk_rc3_ci.completions(user_id,day) values(p_uid,p_day) on conflict do nothing returning true into first_completion;
  first_completion:=coalesce(first_completion,false);
  if first_completion then
    insert into hnk_rc3_ci.xp_events(user_id,day,amount,idempotency_key)
    values(p_uid,p_day,x,p_uid::text||':day:'||p_day||':completion:3') on conflict do nothing;
  else x:=0; end if;
  r:=jsonb_build_object('day',p_day,'first_completion',first_completion,'xp_awarded',x,'sephirah_state',hnk_rc3_ci.sephirah_state(p_uid,p_day));
  update hnk_rc3_ci.receipts set response=r where user_id=p_uid and client_completion_id=p_client_id;
  return r;
end $$;
