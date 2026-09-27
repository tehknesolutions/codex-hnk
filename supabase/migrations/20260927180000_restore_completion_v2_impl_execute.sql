-- Restore the privilege chain required by the public SECURITY INVOKER wrapper.
-- The implementation remains private-schema only and is not exposed to anon/public.

revoke all on function hnk_private.complete_codex_day_v2_impl(
  smallint, uuid, text, text, text, text, text, timestamptz
) from public, anon, authenticated;

grant usage on schema hnk_private to authenticated;

grant execute on function hnk_private.complete_codex_day_v2_impl(
  smallint, uuid, text, text, text, text, text, timestamptz
) to authenticated;

revoke all on function public.complete_codex_day_v2(
  smallint, uuid, text, text, text, text, text, timestamptz
) from public, anon, authenticated;

grant execute on function public.complete_codex_day_v2(
  smallint, uuid, text, text, text, text, text, timestamptz
) to authenticated;
