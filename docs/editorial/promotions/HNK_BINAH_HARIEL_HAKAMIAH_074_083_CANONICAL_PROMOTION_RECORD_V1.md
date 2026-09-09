# HNK Binah — Hariel 074–078 + Hakamiah 079–083 Canonical Promotion Record V1

Status: **074–078 + 080–082 CANON + IMMUTABLE SYNC / 079 REFERENCE_REVIEW / 083 SAFETY_REVIEW / G7 SEQUENCE-BLOCKED BY DAY 045**  
Scope: Binah · Atziluth · Hariel + Hakamiah · Days 074–083  
Source plan SHA-256: `79cf5b61f0dfb0e67bcba0afcb4ec534e21d5303fc135b9638519022fdecd832`

## Promotion chain

| Day | Candidate blob | Canonical blob | XP | G5 | G6 | G7 |
|---:|---|---|---:|---|---|---|
| 074 | `d717d12eb0c4b1889ead9fdefc6d15ed5c4c22cf` | `41abcd70bb9a5f98736b863883c89ca166c13cb8` | 100 | PASS | PASS | BLOCKED BY 045 |
| 075 | `0b25760d99850179ae1aeb3586623cad1170bbd4` | `48eb5fe1a17ef333623b9bfd23b511f81897a833` | 100 | PASS | PASS | BLOCKED BY 045 |
| 076 | `0dffecfc976659c295c177e46bbd9b9aa97a18d9` | `165821d942795ad7e7f01dec0da1f73c3d84ccdb` | 100 | PASS | PASS | BLOCKED BY 045 |
| 077 | `aa7747f286acbe81b0b9d1c00ddeec182a034526` | `9dbb35e936b49829bd6b99b66017a189678dba13` | 150 | PASS | PASS | BLOCKED BY 045 |
| 078 | `9aae200ee3e47fe31078f898b0e37ffb20a1f8fa` | `7e10777607778e29ada5983ef69ca4871f4ebb24` | 100 | PASS | PASS | BLOCKED BY 045 |
| 079 | `fcc0409efddb1f3cdd8d529297acb59115fb2160` | — | 100 | **REFERENCE_REVIEW** | BLOCKED | BLOCKED |
| 080 | `4e2efbeadda85ced274993f2a27a51f6ed9bb3ab` | `c56b8aa84ac5184ec927a1f8dee9f96d04d00dd8` | 100 | PASS | PASS | BLOCKED BY 045 |
| 081 | `bf9ff4b044acf4b0665aeae7718c04dd8d0b6d11` | `2d578f1f1369b7b71bc2cab861242f1d19d39b61` | 150 | PASS | PASS | BLOCKED BY 045 |
| 082 | `45decd61813fa47ecd97d8e8988539bc3d629810` | `3429025bf627cf6e9954153872e69c777baf8838` | 100 | PASS | PASS | BLOCKED BY 045 |
| 083 | `050089822dd7d54eee341707e4d50d1da8db7dd4` | — | 150 | **SAFETY_REVIEW** | BLOCKED | BLOCKED |

Immutable successor commits used for DB sync:

- Hariel 074–078: `166d109e7292edf0d12574cc85ff132573bca0ff`;
- Hakamiah 080–082: `acd1a38af3a371a8121d14987f3bfde4e11e1d68`.

## Integrity and provenance

The promoted Days preserve the frozen editorial bodies. Promotion changed only `status: draft -> canon` and the provenance marker with the staging blob. Supabase returned the exact Git blob SHA for every promoted Day and records `source_repository = tehknesolutions/codex-hnk`.

The source-repository audit fix introduced by migration `20260909013809_fix_atziluth_import_run_source_repo` is active: successor import runs write the new repository explicitly rather than inheriting the historical default.

## Negative audit of blockers

`public.codex_days` contains no Day 079 or Day 083 after these promotions. The immutable canonical trees used for sync also omit those paths.

### Day 079 — Thurisaz reference review

The Hakamiah batch requires approved Thurisaz asset/version/orientation before final promotion. Traditional symbolism is preserved in the draft, but no canonical visual/orientation is inferred or invented.

### Day 083 — material safety review

The textual ritual uses salt/charcoal. Production disposition must explicitly cover floor safety, cleanup, children/animals, non-blocked exits and accessible fallback. Until that disposition is approved, the Day remains outside canon.

## Runtime disposition

The largest successor Day currently stored in `codex_days` is **082**. The continuous first-completion/XP frontier remains **044** because Day 045 is still blocked by the unresolved Haziel audio carrier/base requirement. Server-authoritative sequencing must continue preventing later stored canon from granting first-completion XP out of order.

## Next action

Proceed to Lauviah 084–088. Day 084 is already flagged `SAFETY_REVIEW` for low-light mirror / real-candle setup; audit Days 085–088 independently and promote only G4-clear Days.
