# HNK Chromatic Genesis — Matrix 004 Technical Gate v0.1

Status: RESEARCH / TECHNICAL VALIDATION
Parent: `HNK-CG-MATRIX-004-LEXICAL-CANDIDATES-v0.1.md`
Issue: #373

## 1. Source contracts used

This gate uses the repository's actual executable contracts rather than inferred phonology:

- `packages/hnk-glyphs/src/index.mjs`
- `packages/hnk-linguas/src/index.mjs`
- `packages/hnk-linguas/src/authored.mjs`

`@hnk/glyphs` currently declares HNK40 as `PREPRODUCTION_NOT_OFFICIAL`. Safe transliteration is explicitly mapped to G-IDs, and strict transliteration rejects unresolved units.

The Master Lexicon compiles ordinary lexemes through `transliterationToGlyphIds(...,{strict:true})` and derives IPA by concatenating the phoneme of each resolved glyph. The Authored Registry imports the Master Lexicon and follows the same governed encoding infrastructure.

## 2. Safe transliteration map used

```text
A→G01 /a/   E→G02 /e/   I→G03 /i/   O→G04 /o/   U→G05 /u/
H→G07 /h/   M→G11 /m/   N→G12 /n/   L→G14 /l/   R→G15 /r/
B→G18 /b/   D→G19 /d/   P→G21 /p/   T→G22 /t/   K→G23 /k/
S→G26 /s/   TS→G30 /ts/ V→G31 /v/   Z→G32 /z/   Y→G40 /y/
```

Note: IPA here is the runtime's segment concatenation. It is not syllabified phonetic transcription.

## 3. Exact collision result against inspected registries

The 27 Matrix-004 candidate strings are distinct from the forms explicitly present in the current Master Lexicon excerpt and Authored Registry corpus inspected during this gate. This is a **current-registry exact-form check**, not a universal cross-language uniqueness claim.

No candidate is promoted by this result.

## 4. Strict encodability + runtime IPA

All 27 generated candidates use only safe transliteration units and therefore resolve under the explicit HNK40 safe map.

### E1 — Mind / Arcane Intelligence / Orchestration

- `ZARENU` → `G32 G01 G15 G02 G12 G05` → `/zarenu/`
- `HEVORA` → `G07 G02 G31 G04 G15 G01` → `/hevora/`
- `NOMERI` → `G12 G04 G11 G02 G15 G03` → `/nomeri/`

### E2 — Space / Architecture / Relation

- `TAVERO` → `G22 G01 G31 G02 G15 G04` → `/tavero/`
- `NAREVO` → `G12 G01 G15 G02 G31 G04` → `/narevo/`
- `KOSERA` → `G23 G04 G26 G02 G15 G01` → `/kosera/`

### E3 — Power / Action / Execution

- `DURAKA` → `G19 G05 G15 G01 G23 G01` → `/duraka/`
- `RAVETO` → `G15 G01 G31 G02 G22 G04` → `/raveto/`
- `BODARA` → `G18 G04 G19 G01 G15 G01` → `/bodara/`

### E4 — Life / Adaptation / Evolution

- `NAVIRA` → `G12 G01 G31 G03 G15 G01` → `/navira/`
- `MERUNA` → `G11 G02 G15 G05 G12 G01` → `/meruna/`
- `VARELI` → `G31 G01 G15 G02 G14 G03` → `/vareli/`

### E5 — Consciousness / Knowledge / Illumination

- `SOLENU` → `G26 G04 G14 G02 G12 G05` → `/solenu/`
- `HAREVI` → `G07 G01 G15 G02 G31 G03` → `/harevi/`
- `ZELORA` → `G32 G02 G14 G04 G15 G01` → `/zelora/`

### E6 — unresolved

No form tested. `SEMANTICS_BEFORE_FORM` remains the governing block.

### M1 — Auric / Manifestation / Convergence

- `MALORA` → `G11 G01 G14 G04 G15 G01` → `/malora/`
- `DARUMA` → `G19 G01 G15 G05 G11 G01` → `/daruma/`
- `KAVERA` → `G23 G01 G31 G02 G15 G01` → `/kavera/`

### M2 — Octarine / Meta-transformation

- `TSAVERI` → `G30 G01 G31 G02 G15 G03` → `/tsaveri/`
- `ZYNORA` → `G32 G40 G12 G04 G15 G01` → `/zynora/`
- `HESYRA` → `G07 G02 G26 G40 G15 G01` → `/hesyra/`

### M3 — Titanium / Law / Constraint / Form

- `KETARA` → `G23 G02 G22 G01 G15 G01` → `/ketara/`
- `TADERU` → `G22 G01 G19 G02 G15 G05` → `/taderu/`
- `KORETA` → `G23 G04 G15 G02 G22 G01` → `/koreta/`

### M4 — Obsidian / Void / Potential

- `NOMURA` → `G12 G04 G11 G05 G15 G01` → `/nomura/`
- `HUNERA` → `G07 G05 G12 G02 G15 G01` → `/hunera/`
- `ZOMARI` → `G32 G04 G11 G01 G15 G03` → `/zomari/`

## 5. Technical result

```text
GENERATED_FOR_DEFINED_CONCEPTS = 27
STRICT_SAFE_MAP_ENCODABLE      = 27
UNRESOLVED_TRANSLITERATION     = 0
SEMANTICALLY_WITHHELD_E6       = 3 slots
CANONICALLY_PROMOTED           = 0
```

Therefore the batch passes the **safe transliteration / G-ID encodability gate**.

## 6. Important caveats

1. HNK40 itself remains `PREPRODUCTION_NOT_OFFICIAL`; passing its safe encoder is not final language canon.
2. Runtime IPA is segment concatenation from G-ID phonemes; it does not prove syllable structure, stress, allophony, or full phonotactics.
3. Exact-form collision absence does not prove semantic or cross-language safety.
4. Candidate names still require unwanted-association review and Creator Human Gate.
5. `SOLENU` requires special review because its `SOL` surface sequence may be perceived as externally transparent.
6. `MALORA` requires special review for possible unwanted resonance with Kabbalistic/Hebrew terminology.
7. No candidate receives productive morphology from its apparent substrings.

## 7. Human Gate batch

Technical validation now permits presentation of the following lead set to the Creator:

```text
E1  ZARENU   [alternates: HEVORA, NOMERI]
E2  TAVERO   [alternates: NAREVO, KOSERA]
E3  DURAKA   [alternates: RAVETO, BODARA]
E4  NAVIRA   [alternates: MERUNA, VARELI]
E5  SOLENU   [alternates: HAREVI, ZELORA] [REVIEW_EXTERNAL_RESONANCE]
E6  HOLD_UNRESOLVED
M1  MALORA   [alternates: DARUMA, KAVERA] [REVIEW_EXTERNAL_RESONANCE]
M2  TSAVERI  [alternates: ZYNORA, HESYRA]
M3  KETARA   [alternates: TADERU, KORETA]
M4  NOMURA   [alternates: HUNERA, ZOMARI]
```

Allowed Human Gate actions remain:

- `SELECT_CANDIDATE`
- `REQUEST_NEW_BATCH`
- `REDEFINE_SEMANTICS`
- `HOLD_UNRESOLVED`

Selection does not itself imply ROOT CANON promotion.

## 8. Next gate

After Creator selection:

1. create explicit Chromatic Genesis lexical registry records;
2. bind selected lexemes to their exact G-ID sequences;
3. generate Lexical Glyph artifacts from HNK40;
4. begin independent Mandala-path Energy Glyph generation;
5. combine both only through a governed Composite Sigil contract;
6. record Human Gate decision and provenance;
7. keep E6 unresolved until its semantics exist.
