-- Day074 public RPC remains the authenticated entrypoint while its internal
-- validator stays unreachable from client roles. The existing V2 completion
-- implementation follows the same private-privilege pattern.

alter function public.complete_day074_v1(
  uuid,text,text,text,text,text,timestamptz
) security definer;

revoke all on function hnk_private.validate_day074_completion_v1(jsonb,text)
  from public,anon,authenticated,service_role;

grant usage on schema hnk_private to authenticated;
revoke all on function public.complete_day074_v1(
  uuid,text,text,text,text,text,timestamptz
) from public,anon;
grant execute on function public.complete_day074_v1(
  uuid,text,text,text,text,text,timestamptz
) to authenticated;
