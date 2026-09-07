# HNK Web E2EE — Executable Spec V1 Candidate

**Status:** EXECUTABLE SPEC CANDIDATE · LAB GREEN · PRODUCTION WRITES STILL PROHIBITED  
**Date:** 2026-09-03  
**Implementation head:** `6e31009ccb632d55587f8222ff4c4f0fb3e0be1e`  
**Parent design:** `HNK_WEB_E2EE_KEY_RECOVERY_V1_PROPOSAL.md`

## 1. What is frozen by this candidate

This document records the first implementation-backed candidate for the Web Vault cryptographic contract. It freezes the laboratory format and acceptance evidence; it does **not** authorize enabling Web Vault persistence or Day 001 Web completion.

Candidate algorithms:

- journal encryption: `AES-256-GCM`;
- GCM nonce: 12 bytes;
- GCM authentication tag: 128 bits / 16 bytes;
- recovery KDF: `HKDF-SHA-256`;
- recovery secret: 32 random bytes / 256 bits;
- recovery salt: 16 random bytes;
- recovery context: `hnk-vault-recovery-v1:<user-id>:<key-version>`;
- VDK wrapping: `AES-KW-256`;
- Device KEK: non-extractable `AES-KW-256 CryptoKey`;
- local device persistence: IndexedDB structured-clone of the non-extractable `CryptoKey` plus wrapped VDK envelope;
- Web Storage policy: no Vault key material or recovery material in `localStorage` or `sessionStorage`.

## 2. Frozen Native-compatible journal payload

The Web lab follows the existing Native Vault V1 persistence shape:

```text
ciphertext
nonce
aad
cryptoAlg = AES-256-GCM
cryptoVersion = 1
checksumSha256
```

AAD canonical JSON remains:

```json
{"schema":"hnk-vault-v1","user":"<user-id>","day":<day-or-null>,"kind":"<kind>"}
```

The JSON bytes are base64-encoded for storage. For AES-GCM authentication, Web decodes that base64 and supplies the original JSON bytes as `additionalData`. This matches the current Expo Crypto contract in which a string `additionalData` input is base64-encoded binary input.

Checksum remains SHA-256 over the UTF-8 bytes of:

```text
<nonce-base64>.<ciphertext-base64>.<aad-base64>
```

The checksum is an integrity/transport diagnostic only; AES-GCM authentication remains the cryptographic integrity boundary.

## 3. Frozen deterministic vector V1

Vector identity:

```text
HNK Native ↔ Web vector 001
```

Inputs:

```text
user_id = 00000000-0000-4000-8000-000000000001
key_version = 1
day = 1
kind = mirror
plaintext = HNK Native ↔ Web vector 001
VDK raw hex = 000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f
RRS base64 = ICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj8=
recovery salt base64 = UFFSU1RVVldYWVpbXF1eXw==
nonce base64 = oKGio6Slpqeoqaqr
```

Recovery outputs:

```text
HKDF info = hnk-vault-recovery-v1:00000000-0000-4000-8000-000000000001:1
wrapped VDK base64 = eGVk3ZwifTM/mQoglrFfrQwRf9IgEu+0nceoY7frh/E9ic5zKCcMuA==
```

Journal outputs:

```text
AAD base64 = eyJzY2hlbWEiOiJobmstdmF1bHQtdjEiLCJ1c2VyIjoiMDAwMDAwMDAtMDAwMC00MDAwLTgwMDAtMDAwMDAwMDAwMDAxIiwiZGF5IjoxLCJraW5kIjoibWlycm9yIn0=
ciphertext+tag base64 = rlY3DQuqdtYUAKcxge7giRXOeWb31DYD7i4Wtk7+QTyClBdr/hBC26icyGSt
checksum SHA-256 = 157c92b5e1b1da403003fe1fd244bb7d46f3a3f085bc407373388491055a4020
```

Any future implementation that claims V1 format compatibility must reproduce this vector exactly when given the same deterministic inputs.

## 4. Node/WebCrypto acceptance now green

The package `@hnk/vault-web-crypto-lab` currently proves:

1. deterministic HKDF + AES-KW recovery envelope;
2. exact Native-compatible AES-GCM payload vector;
3. wrong RRS rejection;
4. wrong user recovery context rejection;
5. ciphertext/tag tamper rejection;
6. AAD tamper rejection even when the public checksum is recomputed;
7. non-extractable DKEK behavior;
8. non-extractable working VDK after device-envelope unwrap;
9. database-dump fixture alone does not contain plaintext and cannot unwrap the VDK without recovery/device material.

## 5. Chromium acceptance now green

Workflow:

`HNK Web Vault Crypto Lab`

Run:

`33771288797`

Artifact:

```text
id = 9899766465
name = hnk-web-vault-crypto-lab-v1
digest = sha256:919448673ef6dd1f99dbafc5f508ff01b3eafa1bd57681f37c3a94d57f8bacd4
head = 6e31009ccb632d55587f8222ff4c4f0fb3e0be1e
```

Chromium proof:

```text
Chromium 140.0.7339.16
secureContext = true
status = PASS
```

Green browser checks:

- `recovery-envelope`;
- `non-extractable-dkek`;
- `indexeddb-cryptokey-roundtrip`;
- `device-a-encrypt-decrypt`;
- `multi-device-recovery`;
- `no-localstorage-vault-material`;
- `local-enrollment-delete`.

## 6. Foundation regression proof

Foundation run on the same implementation head:

`33771288555`

Green:

- architecture baseline;
- HNK UI tokens;
- Day 001 master invariants;
- Board Factory;
- Web Vault Crypto Lab security boundary;
- workspace typecheck;
- workspace tests;
- workspace build;
- Kether P0 pgTAP acceptance;
- Kether P0 real concurrency proof.

The experimental package is not imported by the Day 001 production Web experience.

## 7. Security boundary that remains frozen

The following remain prohibited in production Web:

- `saveEncryptedVaultEntry()` from the Day 001 Web route;
- `savePracticeRecord()` after a Web Vault flow that has not passed production gates;
- `completeCodexDay()` / XP grant from that incomplete Web flow;
- raw VDK in `localStorage`, `sessionStorage`, logs, telemetry or Supabase;
- RRS in Supabase, logs, telemetry or Web Storage;
- plaintext private prose in CI artifacts or server persistence;
- fallback from unavailable WebCrypto/IndexedDB to plaintext or reversible obfuscation.

## 8. What this does not yet prove

### Actual Android/iOS engine interoperability

The deterministic vector is format-compatible with the current Native implementation and the documented Expo Crypto binary-input contract. However, this CI does not execute the vector through an actual Android or iOS `expo-crypto` runtime.

Therefore the release gate remains:

`NATIVE DEVICE VECTOR PROOF = PENDING`

A device harness must reproduce the frozen vector or decrypt the Web-generated fixture using the same VDK before production interoperability is declared.

### Production origin security

The localhost secure-context proof does not replace:

- production HTTPS deployment;
- strict CSP;
- dependency/supply-chain controls;
- XSS review;
- no third-party script policy on Vault surfaces;
- hosted Auth/recovery smoke.

### Server envelope persistence

No `vault_key_envelopes` production table is used by the Lab yet. Schema + RLS + pgTAP must be reviewed and green before server-side recovery envelope persistence is connected.

## 9. Next implementation gate

The next safe production-independent step is:

1. add `vault_key_envelopes` as a separate ciphertext/key-envelope table;
2. enforce owner-only RLS using `auth.uid() = user_id`;
3. prohibit plaintext/RRS/unwrapped-key columns by schema design;
4. add pgTAP coverage for owner isolation, insert/update/delete/select and forbidden cross-user access;
5. keep the application disconnected from the table until those tests are green;
6. add an actual Native device vector harness afterward.

Only after the complete release gates in the parent proposal are satisfied may Web Vault writes be considered for Day 001.
