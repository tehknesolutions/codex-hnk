-- version: 20260913223249
-- name: fix_day063_uuid_validation_v2
create or replace function hnk_private.jsonb_is_uuid(p_value jsonb)
returns boolean
language sql
immutable
set search_path=''
as $$
 select coalesce(jsonb_typeof(p_value)='string' and trim(both '"' from p_value::text) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',false)
$$;
