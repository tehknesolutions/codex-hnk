# DAY 001 — Canonical Amendment V1

Status: `PREPARED_SOURCE_WRITE_PENDING`  
Target repository: `Tehkne-Solutions/hnk-codex-365`  
Target path: `canon/capitulo-01-kether/dia-001.md`  
Current source blob: `a01d13b43cbddb92236fc1e3b6c2a7e140d87d29`  
Scope: `middle-ordalia` only  
Protocol: preserve the 705-word counted core and the 137/72/26 pillar discipline.

## Reason

The current Middle Pillar Ordália makes a vocal recording sound mandatory and ties that recording to an additional 150 XP. The frozen Day 001 product contract requires the vocal practice itself, makes recording opt-in, and awards exactly one idempotent +150 XP event on first canonical completion.

This amendment changes no metaphysical doctrine and does not alter the other eight counted blocks.

## Replace the 26-word Middle Ordália

Current counted block:

> Valide agora o seu primeiro registro vocal de glossolália no cofre criptografado do aplicativo HNK para receber mais cento e cinquenta pontos de experiência do Codex.

Proposed counted block — **26 words**:

> Registre, se desejar, sua prática vocal no cofre criptografado do HNK; a gravação é opcional, e a conclusão do Dia não depende dela nem de intensidade.

## Invariants after amendment

- `middle-ordalia` remains exactly 26 words under the HNK structural counter.
- Day 001 counted core remains 705 words.
- Voice practice remains part of the Middle Pillar execution.
- Recording remains optional and explicit opt-in.
- No automatic upload or transcription is introduced.
- Private audio, when saved, belongs to the encrypted Vault path.
- Recording grants no XP.
- Day 001 first canonical completion remains exactly +150 XP and idempotent.
- No subjective phenomenon or intensity becomes a completion requirement.

## Release action

After the canonical source is amended, the migration repository must refresh:

1. canonical source Git blob SHA;
2. `day-001.canon-blocks.json` block hash for `middle-ordalia`;
3. Quest/evidence/completion source bindings that pin the old source SHA;
4. `day-001.checksums.json`;
5. raw-source Golden Gate verification.

Until that source write occurs, `EDITORIAL-001-VOICE` remains an explicit release blocker.
