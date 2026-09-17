-- Rollback-only structural tests for Portal073 V2 strict validator.
begin;

do $$
declare
  v_def text := pg_get_functiondef('hnk_private.validate_day073_completion_v2(jsonb,text)'::regprocedure);
begin
  if position('day073_unknown_evidence_field' in v_def)=0 then raise exception 'missing_unknown_field_gate'; end if;
  if position('HNK-PORTAL-073-EVIDENCE-V1' in v_def)=0 then raise exception 'missing_schema_lock'; end if;
  if position('be135a55fdd2fad853cc526f1ccb78cb933e2391' in v_def)=0 then raise exception 'missing_source_lock'; end if;
  if position('vault_checksum_sha256' in v_def)=0 or position('day073_vault_receipt_checksum_mismatch' in v_def)=0 then raise exception 'missing_vault_checksum_binding'; end if;
  if position('jsonb_is_nonnegative_integer' in v_def)=0 then raise exception 'missing_strict_audio_integer_gate'; end if;
end $$;

select 'PORTAL073_V2_STRICT_VALIDATOR_STRUCTURE_PASS' as marker;
rollback;
