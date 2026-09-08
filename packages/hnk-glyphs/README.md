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

Final human promotion remains required before `VISUAL-CANON-V2`.
