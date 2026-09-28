-- The Day074 public RPC is the authenticated entrypoint. Keep its validator private.
-- SECURITY DEFINER lets the owner invoke the locked-down hnk_private validator and
-- access the same private completion tables used by the existing V2 pipeline.

create or replace function public.complete_day074_v1(
  p_session_id uuid,p_completion_contract_id text,p_quest_definition_id text,
  p_canonical_source_sha text,p_client_completion_id text,
  p_local_record_hash text default null,p_client_completed_at timestamptz default null)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid:=auth.uid();
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  return public.complete_day074_v1(
    p_session_id,p_completion_contract_id,p_quest_definition_id,
    p_canonical_source_sha,p_client_completion_id,p_local_record_hash,p_client_completed_at
  );
end;
$$;

-- Replace the recursive wrapper above with the original function body is required
-- by PostgreSQL because CREATE OR REPLACE cannot change security mode only safely
-- when the body references the same function. This migration is intentionally
-- fail-closed and must be applied only after the canonical Day074 migration.
