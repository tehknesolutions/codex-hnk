-- HNK CODEX — Attribute Progression Matrix V1 / Kether
-- Applied to Supabase project codex-hnk-app.
-- Full 36-row design matrix lives in docs/progression/attribute-progression-matrix.v1.json.
-- This migration materializes only the 14 rows that can actually award +1.

alter table public.attribute_state
  add constraint attribute_state_hip_v1_range check (hip between 1 and 20),
  add constraint attribute_state_vnt_v1_range check (vnt between 1 and 20),
  add constraint attribute_state_per_v1_range check (per between 1 and 20),
  add constraint attribute_state_sin_v1_range check (sin between 1 and 20),
  add constraint attribute_state_bio_v1_range check (bio between 1 and 20),
  add constraint attribute_state_int_v1_range check ("int" between 1 and 20),
  add constraint attribute_state_dis_v1_range check (dis between 1 and 20);

create table if not exists hnk_private.attribute_progression_gain_rules (
  matrix_version text not null,
  day smallint not null references public.codex_days(day) on delete cascade,
  competency text not null,
  primary_attribute text not null check (primary_attribute in ('HIP','VNT','PER','SIN','BIO','INT','DIS')),
  secondary_attribute text not null check (secondary_attribute in ('HIP','VNT','PER','SIN','BIO','INT','DIS')),
  attribute_gain smallint not null check (attribute_gain = 1),
  source_basis jsonb not null default '{}'::jsonb,
  status text not null default 'frozen' check (status in ('frozen','retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (matrix_version, day),
  check (primary_attribute <> secondary_attribute)
);
revoke all on table hnk_private.attribute_progression_gain_rules from public, anon, authenticated;

insert into hnk_private.attribute_progression_gain_rules
(matrix_version,day,competency,primary_attribute,secondary_attribute,attribute_gain,source_basis,status)
values
('1.0.0',2,'Imobilidade Corporal','DIS','PER',1,'{"type":"CANON_EXPLICIT","note":"middle Ordália explicitly says update Disciplina"}'::jsonb,'frozen'),
('1.0.0',5,'Banimento Inicial por Intenção','VNT','HIP',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT"}'::jsonb,'frozen'),
('1.0.0',6,'O Silêncio da Psuche','PER','DIS',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT"}'::jsonb,'frozen'),
('1.0.0',7,'Dave Elman I','HIP','VNT',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT"}'::jsonb,'frozen'),
('1.0.0',12,'Trataka Primal','PER','DIS',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT"}'::jsonb,'frozen'),
('1.0.0',13,'Triturador de Números','INT','DIS',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT"}'::jsonb,'frozen'),
('1.0.0',17,'Ativação da Glossolália','HIP','SIN',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT","note":"voluntary practice; not recording or intensity"}'::jsonb,'frozen'),
('1.0.0',19,'Análise Vocal no App','INT','HIP',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT","note":"technical observation; no spiritual diagnosis"}'::jsonb,'frozen'),
('1.0.0',22,'Sintonização do Dai Koo Myo','SIN','PER',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT","note":"symbol study completion; not supernatural effect"}'::jsonb,'frozen'),
('1.0.0',24,'Auto-Reiki de Sintonização','BIO','DIS',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT"}'::jsonb,'frozen'),
('1.0.0',27,'Pérola Azul','PER','DIS',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT"}'::jsonb,'frozen'),
('1.0.0',28,'Gneo Geo Astral','INT','PER',1,'{"type":"EXPERIENCE_MATRIX_CHECKPOINT"}'::jsonb,'frozen'),
('1.0.0',32,'Elevador de Esdaile','HIP','PER',1,'{"type":"CANON_EPISTEMIC_CHECKPOINT","note":"latency, markers and voluntary return"}'::jsonb,'frozen'),
('1.0.0',35,'Fechamento Achaiah','SIN','VNT',1,'{"type":"CYCLE_CHECKPOINT","note":"integration/closure; never subjective phenomenon"}'::jsonb,'frozen')
on conflict (matrix_version,day) do update
set competency=excluded.competency,
    primary_attribute=excluded.primary_attribute,
    secondary_attribute=excluded.secondary_attribute,
    attribute_gain=excluded.attribute_gain,
    source_basis=excluded.source_basis,
    status=excluded.status,
    updated_at=now();

create table if not exists public.attribute_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  day smallint not null references public.codex_days(day) on delete cascade,
  attribute_code text not null check (attribute_code in ('HIP','VNT','PER','SIN','BIO','INT','DIS')),
  amount smallint not null check (amount = 1),
  matrix_version text not null,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists attribute_events_user_created_idx on public.attribute_events(user_id,created_at desc);
create index if not exists attribute_events_day_idx on public.attribute_events(day);
alter table public.attribute_events enable row level security;
revoke all on table public.attribute_events from anon, authenticated;
grant select on table public.attribute_events to authenticated;
drop policy if exists attribute_events_select_own on public.attribute_events;
create policy attribute_events_select_own on public.attribute_events
for select to authenticated using ((select auth.uid()) = user_id);

create or replace function hnk_private.apply_attribute_progression_from_xp_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contract_id text := new.metadata ->> 'completion_contract_id';
  v_contract hnk_private.completion_contract_registry%rowtype;
  v_rule hnk_private.attribute_progression_gain_rules%rowtype;
  v_before integer;
  v_event_id bigint;
  v_key text;
begin
  if new.source <> 'canonical_day_completion' or new.day is null or v_contract_id is null then return new; end if;

  select * into v_contract
  from hnk_private.completion_contract_registry
  where completion_contract_id = v_contract_id and day = new.day and status = 'active';
  if not found then return new; end if;

  select * into v_rule
  from hnk_private.attribute_progression_gain_rules
  where matrix_version = '1.0.0' and day = new.day and status = 'frozen';
  if not found then return new; end if;

  insert into public.attribute_state(user_id) values (new.user_id)
  on conflict (user_id) do nothing;

  v_before := case v_rule.primary_attribute
    when 'HIP' then (select hip from public.attribute_state where user_id=new.user_id)
    when 'VNT' then (select vnt from public.attribute_state where user_id=new.user_id)
    when 'PER' then (select per from public.attribute_state where user_id=new.user_id)
    when 'SIN' then (select sin from public.attribute_state where user_id=new.user_id)
    when 'BIO' then (select bio from public.attribute_state where user_id=new.user_id)
    when 'INT' then (select "int" from public.attribute_state where user_id=new.user_id)
    when 'DIS' then (select dis from public.attribute_state where user_id=new.user_id)
  end;
  if v_before >= 20 then return new; end if;

  v_key := new.user_id::text || ':day:' || new.day::text || ':attribute:' || v_rule.primary_attribute || ':matrix:1';
  insert into public.attribute_events(user_id,day,attribute_code,amount,matrix_version,idempotency_key,metadata)
  values (new.user_id,new.day,v_rule.primary_attribute,1,'1.0.0',v_key,
    jsonb_build_object('xp_event_id',new.id,'completion_contract_id',v_contract_id,'quest_definition_id',v_contract.quest_definition_id,'source_basis',v_rule.source_basis,'secondary_attribute',v_rule.secondary_attribute))
  on conflict (idempotency_key) do nothing returning id into v_event_id;
  if v_event_id is null then return new; end if;

  update public.attribute_state
  set hip=case when v_rule.primary_attribute='HIP' then least(20,hip+1) else hip end,
      vnt=case when v_rule.primary_attribute='VNT' then least(20,vnt+1) else vnt end,
      per=case when v_rule.primary_attribute='PER' then least(20,per+1) else per end,
      sin=case when v_rule.primary_attribute='SIN' then least(20,sin+1) else sin end,
      bio=case when v_rule.primary_attribute='BIO' then least(20,bio+1) else bio end,
      "int"=case when v_rule.primary_attribute='INT' then least(20,"int"+1) else "int" end,
      dis=case when v_rule.primary_attribute='DIS' then least(20,dis+1) else dis end,
      updated_at=now()
  where user_id=new.user_id;
  return new;
end;
$$;
revoke all on function hnk_private.apply_attribute_progression_from_xp_event() from public,anon,authenticated;

drop trigger if exists xp_events_apply_attribute_progression_v1 on public.xp_events;
create trigger xp_events_apply_attribute_progression_v1
after insert on public.xp_events
for each row execute function hnk_private.apply_attribute_progression_from_xp_event();
