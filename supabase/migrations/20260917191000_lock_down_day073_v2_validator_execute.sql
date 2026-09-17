-- Portal073 V2 validator is an internal dispatcher target only.
-- PostgreSQL grants EXECUTE on new functions to PUBLIC by default; keep this
-- validator unreachable from client roles. The privileged completion
-- implementation may invoke it internally as its owner.
revoke execute on function hnk_private.validate_day073_completion_v2(jsonb,text)
from public, anon, authenticated, service_role;
