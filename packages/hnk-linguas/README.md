# @hnk/linguas

Recovered HNK language registry for the current HNK-LÍNGUAS workstream.

This package keeps structural authority and linguistic authority separate:

- `@hnk/glyphs` owns G01–G40, IPA, Candidate D SVG and candidate PUA.
- `@hnk/linguas` owns recovered lexical forms, phrases, lesson links and authority classes.

Authority classes are deliberately not flattened:

- `FROZEN`
- `WATCH`
- `CANDIDATE`
- `GATE`
- `BRIDGE`
- `REFERENCE`

Unknown glosses remain `null`. No lexical meaning is inferred from visual form.

`KALIFORNIA` is an explicit BRIDGE using G25 `/f/`; this does not expand the global safe transliteration parser.

Visual status remains inherited from `@hnk/glyphs`: `PREPRODUCTION_NOT_OFFICIAL` until final human visual promotion.
