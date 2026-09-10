import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const has = (s, n) => s.includes(n);
let failed = 0;
const check = (label, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'} CHOKMAH-PORTAL · ${label}`); if (!ok) failed += 1; };

const journey = read('apps/mobile/src/features/chokmah/ChokmahJourney.tsx');
const d72def = read('apps/mobile/src/features/chokmah/runtime-definitions/portal.ts');
const d72 = read('apps/mobile/src/features/chokmah/ChokmahDay072BlackMirrorExperience.tsx');
const d72db = read('supabase/migrations/20260910121500_enforce_chokmah_day072_scalar_evidence.sql');
const p73def = read('apps/mobile/src/features/chokmah/runtime-definitions/portal073.ts');
const p73 = read('apps/mobile/src/features/chokmah/ChokmahPortal073Experience.tsx');
const sigil = read('apps/mobile/src/features/chokmah/MagicianMercurySigilV1.tsx');
const audio = read('packages/audio-contract/src/portal073.ts');
const audioIndex = read('packages/audio-contract/src/index.ts');
const portalAdapter = read('packages/supabase-client/src/portal-practice-record.ts');
const runtime = read('apps/mobile/src/features/kether/useHnkDayRuntime.ts');
const p73db = read('supabase/migrations/20260910124500_require_portal_vault_receipt_presence.sql');
const serialization = read('supabase/migrations/20260910130000_serialize_day_completion_by_user_day.sql');
const e2e = read('supabase/tests/portal073-rollback-e2e.sql');
const freeze = read('docs/experience/chokmah/HNK_CHOKMAH_PORTAL_073_OPERATOR_FREEZE_V1.md');

check('Journey routes Day072 and Day073 explicitly', has(journey, 'ChokmahDay072BlackMirrorExperience') && has(journey, 'ChokmahPortal073Experience') && has(journey, 'currentDay === 72') && has(journey, 'currentDay === 73'));
check('Day072 contract requires exact 15 minutes and Return Gate', has(d72def, 'minimums: { active_seconds: 900 }') && has(d72, 'target={900}') && has(d72, 'visual_preregister_saved') && has(d72, 'setReturnConfirmed'));
check('Day072 keeps visual prose in encrypted Vault before interpretation', has(d72, "kind: 'portal072-visual-preregister'") && has(d72, 'saveEncryptedVaultEntry') && has(d72, 'interpretation_separated') && !has(d72db, 'raw_observation'));
check('Day072 server binds exact canonical SHA and exactly 900 seconds', has(d72db, '44c11fee26aef72ebb686ab5f8fd8f27f1239cb2') && has(d72db, 'seconds <> 900') && has(d72db, 'day072_fifteen_minutes_required'));

check('Portal073 production remains fail-closed until publication QA', has(p73def, 'PORTAL073_PRODUCTION_ENABLED = false') && has(p73, '!productionEnabled') && has(p73, 'NENHUM XP / NENHUMA PROMOÇÃO'));
check('Portal073 binds exact operator IDs from freeze', [
  'HNK-ANGELIC-TUNER-D073-V1',
  'HNK-PORTAL073-CHOKMAH-BINAH-ACTIVE-V1',
  'HNK-REF-MAGICIAN-MERCURY-V1',
  'HNK-PORTAL-073-EVIDENCE-V1',
].every((id) => has(p73def, id) && has(freeze, id)));
check('Portal073 ritual uses ACTIVE only; CONTROL remains contract/QA material', has(p73, 'HNK_PORTAL073_ACTIVE_PRESET_V1') && !has(p73, 'HNK_PORTAL073_CONTROL_PRESET_V1'));
check('Portal073 audio renderer is deterministic and exported', has(audio, 'createPortal073ActiveLoopWavBytes') && has(audio, 'createPortal073ControlLoopWavBytes') && has(audioIndex, 'createPortal073ActiveLoopWavBytes') && has(audioIndex, 'createPortal073ControlLoopWavBytes'));
check('Portal073 frozen audio hashes are pinned', has(audio, 'c8cc0b02bd8c41479eeb5b2788cf26bb951a7ad4e7c6562f6eb88bfab5e8e43b') && has(audio, '7c8c4fb511883ac4b17fc475d4303ee1a922b4b186fc204760bafe50b9b1fc7c'));
check('Portal073 playback has no autoplay and counts only reported playback', has(p73, 'playerStatus.playing') && has(p73, 'audioSeconds >= TARGET_SECONDS') && has(p73, 'player.play()') && !has(p73, 'autoplay: true'));
check('Dave Elman is a checkpoint without invented canonical script', has(p73, 'Autoindução Dave Elman') && has(p73, 'SEM TEXTO INVENTADO') && has(p73, 'induction_completed'));
check('Magician sigil preserves canonical ID, checksum and upright geometry', has(sigil, 'HNK-REF-MAGICIAN-MERCURY-V1') && has(sigil, '8c7b95f81aee0689ec3497380c4c3841634ca311dbfa09eed50c757809a97209') && has(sigil, 'M78 58 Q120 18 162 58') && has(p73, 'MagicianMercurySigilV1'));
check('Portal073 Return Gate precedes encrypted Vault receipt', has(p73, "phase === 'return'") && has(p73, 'setReturnConfirmed') && has(p73, "phase === 'vault'") && has(p73, 'entry.id') && has(p73, 'vault_receipt'));
check('Portal plaintext never enters structural evidence', has(portalAdapter, 'portal_plaintext_evidence_forbidden') && has(portalAdapter, 'PORTAL_STRING_KEYS') && !has(p73, 'diary_plaintext:') && !has(p73, 'notes_plaintext:') && !has(p73, 'journal_plaintext:'));
check('Portal-only string evidence does not weaken ordinary Practice Record', has(runtime, 'portalRemoteEvidence') && has(runtime, 'savePortalPracticeRecord') && has(runtime, 'multiple_remote_evidence_adapters_forbidden') && has(portalAdapter, "'schema_version'") && has(portalAdapter, "'vault_receipt'"));
check('Portal073 server binds canonical SHA and exact 600 seconds', has(p73db, 'be135a55fdd2fad853cc526f1ccb78cb933e2391') && has(p73db, 'portal073_audio_duration_mismatch') && has(p73db, "::integer <> 600"));
check('Portal073 server requires operator execution + stop/volume + safety', ['tuner_completed','transition_audio_completed','sigil_completed','operator_ids_verified','volume_control_available','immediate_stop_available','safety_clear'].every((field) => has(p73db, field)));
check('Portal receipt must resolve to same-user same-day encrypted Vault row', has(p73db, 'portal_encrypted_vault_receipt_not_found') && has(p73db, 'v.user_id = v_uid') && has(p73db, 'v.day = p_day') && has(p73db, 'v.id::text = v_vault_receipt') && has(p73db, "checksum_sha256, '') ~ '^[a-fA-F0-9]{64}$'"));
check('Completion RPC serializes distinct sessions per user/day before v_existing', has(serialization, 'pg_advisory_xact_lock') && has(serialization, "hashtextextended(v_uid::text || ':day:' || p_day::text, 0)") && serialization.indexOf('pg_advisory_xact_lock') < serialization.indexOf('into v_existing'));
check('Completion keeps UNIQUE/ON CONFLICT idempotency behind advisory serialization', has(serialization, 'on conflict (user_id, day) do nothing') && has(serialization, "':completion:v3'") && has(serialization, 'on conflict (idempotency_key) do nothing'));
check('Rollback E2E covers reward, same-session retry, distinct-session replay, Teurgo and no Day074 auto-start', has(e2e, 'P73_RPC_ROLLBACK_E2E_PASS') && has(e2e, 's2 uuid := gen_random_uuid()') && has(e2e, 'P73_E2E_second_session_first_completion_not_false') && has(e2e, 'P73_E2E_second_session_xp_not_zero') && has(e2e, "xp_awarded')::integer <> 500") && has(e2e, "initiatory_title <> 'Teurgo'") && has(e2e, 'P73_E2E_day074_auto_started'));

if (failed) process.exit(1);
console.log('PASS CHOKMAH-PORTAL · Days 072-073 structural runtime, Vault and serialized completion contracts valid; Day073 production remains fail-closed');
