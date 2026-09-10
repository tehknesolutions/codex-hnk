# @hnk/glyphs

Shared HNK40 runtime for `codex-hnk`. State: **PREPRODUCTION / NOT OFFICIAL VISUAL CANON**.

- G01–G40 is authoritative.
- Candidate D Freeze Pass 1 is frozen 40/40.
- Sprite SHA-256: `87ee43f3785165397752a21eaceffcda8b3240748125062ca275bf8d46234ca4`.
- Candidate PUA: `U+E100–U+E127`, transport only.
- The old `U+E000` portal-token lineage is not reused.
- Safe transliteration never guesses unresolved units; `TS` is atomic (`G30`).

```js
import { transliterationToGlyphIds, getGlyphSvg } from '@hnk/glyphs';
const { glyphIds } = transliterationToGlyphIds('VAMAKALA', { strict:true });
const svg = glyphIds.map(gid => getGlyphSvg(gid)).join('');
```

## Comparative reference layer

The governed research scaffold for cross-language comparison lives in `reference/`.

- `reference/HNK40_REFERENCE_MATRIX_V1.json` mirrors the authoritative G01–G40 runtime fields and reserves reviewed mapping cells for Biblical Hebrew, Koine Greek, Japanese kana and Esperanto.
- `reference/README.md` defines the separation between phonetic, graphemic, semantic, symbolic/initiatic and digital-encoding layers.
- Reference cells remain `PENDING_RESEARCH` until evidence is authored and reviewed; similarity never promotes a reference form into HNK canon.
- ASCII, binary, hexadecimal and candidate PUA are encoding/transport layers, not linguistic equivalents.

The comparative matrix is protected by `test/reference-matrix.test.mjs`, which checks 40/40 identity against the runtime and blocks silent drift or premature reference claims.

Final human promotion remains required before `VISUAL-CANON-V2`.
