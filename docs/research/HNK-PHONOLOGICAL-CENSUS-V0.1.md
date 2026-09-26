# HNK PHONOLOGICAL CENSUS V0.1

Status: RESEARCH BASELINE / NON-CANONICAL ANALYSIS
Date: 2026-09-26
Parent: HNK-RESEARCH GENESIS V0.1
Authority: evidence-first; this document does not promote phonemes or glyphs

## 1. Purpose

Establish the first auditable phonological baseline for Genesis before any new fundamental glyph inventory is proposed.

The census separates four questions that were previously easy to conflate:

1. What forms are actually present in governed HNK linguistic registries?
2. Which transliteration units are accepted by the current runtime?
3. Which IPA values are mechanically assigned by the current G01–G40 runtime?
4. Which sounds are actually evidenced as HNK-core requirements rather than merely available in the legacy 40-slot runtime?

## 2. Source classes inspected

Primary current sources:

- `packages/hnk-linguas/src/index.mjs` — recovered master lexicon and recovered phrases.
- `packages/hnk-linguas/src/authored.mjs` — governed authored candidates.
- `packages/hnk-linguas/src/parent-lexemes.mjs` — governed parent candidates.
- `packages/hnk-glyphs/src/index.mjs` — current HNK40 IPA inventory and safe transliteration parser.
- `packages/hnk-glyphs/README.md` and `reference/README.md` — current visual/phonological/reference governance.

The master lexicon currently contains 33 recovered/governed lexemes and 7 recovered phrases. Its authority classes are intentionally heterogeneous and MUST NOT be flattened. Authored forms are candidates, not recovered historical forms.

## 3. Critical distinction: runtime inventory != evidenced language inventory

The current HNK40 runtime exposes 40 IPA slots:

`/a e i o u ə h ʔ ʕ ħ m n ŋ l r j w b d g p t k q f s ʃ x θ ts v z ʒ ð tʃ dʒ sˤ tˤ ɣ y/`

However, the safe transliteration parser exposes only 20 ordinary transliteration units:

`A E I O U H M N L R B D P T K S TS V Z Y`

with these current runtime values:

| Unit | Legacy G-ID | Runtime IPA |
|---|---|---|
| A | G01 | /a/ |
| E | G02 | /e/ |
| I | G03 | /i/ |
| O | G04 | /o/ |
| U | G05 | /u/ |
| H | G07 | /h/ |
| M | G11 | /m/ |
| N | G12 | /n/ |
| L | G14 | /l/ |
| R | G15 | /r/ |
| B | G18 | /b/ |
| D | G19 | /d/ |
| P | G21 | /p/ |
| T | G22 | /t/ |
| K | G23 | /k/ |
| S | G26 | /s/ |
| TS | G30 | /ts/ |
| V | G31 | /v/ |
| Z | G32 | /z/ |
| Y | G40 | /y/ |

This yields the first major Genesis finding:

> **40 legacy runtime phoneme slots are not evidence that HNK requires 40 fundamental phonological units.**

The runtime itself already distinguishes a smaller safe transliteration surface from the full 40-slot inventory.

## 4. Bridge-only evidence

`KALIFORNIA` is explicitly registered as a `BRIDGE` and uses G25 `/f/` through an explicit glyph override. The linguistic README explicitly states that this does not expand the global safe transliteration parser.

Therefore `/f/` is classified in this census as:

`EXTERNAL/BRIDGE EVIDENCE — NOT YET HNK-CORE`

This distinction is a concrete precedent for the Genesis proposal of **Core HNK + Extended/Transcription HNK**.

## 5. Current evidence tiers

### Tier A — recovered core-surface evidence

The recovered master lexicon and phrases are encoded predominantly through the 20-unit safe transliteration surface. Their presence demonstrates usage of the corresponding current runtime segments, but does not by itself prove that every legacy IPA assignment is the final desired phonological analysis.

Research status: `OBSERVED_FORM + LEGACY_RUNTIME_IPA`.

### Tier B — governed authored candidates

The authored registry contains candidate forms including `KUVAN`, `VALA`, `KUON`, `NE`, the spoken numerals `BIZO` through `ZOKA`, `KALA`, `AN`, `EN`, `KU`, `KE`, `ZAMI`, and a much larger HNK3000 candidate set.

These forms increase distributional evidence for the safe transliteration units, but their `CANDIDATE` authority MUST NOT be converted into historical/canonical phonology automatically.

Research status: `CANDIDATE_FORM + LEGACY_RUNTIME_IPA`.

### Tier C — explicitly selected candidates with direct IPA records

`DARUNO` and `NELARA` are governed parent candidates with explicit `/da.ru.no/` and `/ne.la.ra/` records. These provide useful evidence for syllabic segmentation patterns while remaining `CANDIDATE`.

Research status: `CANDIDATE_WITH_EXPLICIT_IPA`.

### Tier D — unused/insufficiently attested HNK40 slots

The legacy HNK40 inventory contains values not exposed by the safe parser, including `/ə ʔ ʕ ħ ŋ j w g q ʃ x θ ʒ ð tʃ dʒ sˤ tˤ ɣ/` and `/f/` outside the bridge exception.

Their existence in HNK40 is not sufficient evidence that Genesis must preserve them as HNK-core phonemes.

Research status: `LEGACY_RUNTIME_CAPABILITY / CORE STATUS UNRESOLVED`.

## 6. Immediate structural observations

The governed corpus strongly favors sequences that are visually compatible with open syllable/mora-like parsing, e.g. candidate records such as:

- `DARUNO -> /da.ru.no/`
- `NELARA -> /ne.la.ra/`

and many authored forms shaped like `CV.CV`, `CV.CV.CV`, or related vowel-rich patterns.

However, Genesis MUST NOT yet canonize a universal `(C)V` syllable rule. Recovered forms such as `AN`, `EN`, `ON`, `KUVAN`, and longer compounds demonstrate that word edges, codas, morphology, or alternative segmentation need explicit analysis.

Likewise, `TS` is currently atomic in the transliteration runtime (`G30 /ts/`), so it must be counted as one current segment rather than `T+S` when auditing legacy encoding.

## 7. Y is a high-priority audit item

The current safe parser maps Latin `Y` to G40 `/y/` (IPA close front rounded vowel), not to G16 `/j/`.

Because many recent authored candidates contain `Y` (for example `NYPOSA`, `KYMERU`, `DYTYMA`, `KYVUMA`, `DYSANE`, `KEVYPO`, `SYNONU`, `PABYSO`), Genesis MUST verify whether:

1. `/y/` was intentionally selected as the HNK sound;
2. `Y` was used as an orthographic design symbol while another pronunciation was intended;
3. candidate-generation and runtime phonology drifted apart.

Until reviewed, `Y -> /y/` is a **legacy runtime fact**, not a newly promoted Genesis phonological law.

## 8. What the census can already reject

V0.1 rejects these assumptions:

- `40 glyphs => 40 required HNK phonemes`;
- every HNK40 IPA slot belongs to Core HNK;
- bridge phonemes automatically expand Core HNK;
- candidate vocabulary automatically promotes phonology;
- Latin-looking transliteration guarantees the expected Portuguese/English pronunciation;
- visual/numerological correspondence may select a phoneme.

## 9. Working inventory for the next gate

### Core-surface candidates for audit

`A E I O U H M N L R B D P T K S TS V Z Y`

Count: **20 current safe transliteration units**.

This is NOT a proposal that Genesis must contain 20 glyphs. It is the smallest current parser-backed surface that deserves complete corpus coverage analysis first.

### Extension/bridge evidence

`F -> /f/` through `KALIFORNIA` only.

### Legacy HNK40 units requiring attestation review

`/ə ʔ ʕ ħ ŋ j w g q ʃ x θ ʒ ð tʃ dʒ sˤ tˤ ɣ/`

Their future status may become CORE, EXTENSION, SYMBOLIC/OTHER, DEPRECATED, or remain UNRESOLVED. No decision is made here.

## 10. Next computational pass

The next pass MUST produce a machine-readable corpus census with, for every governed form:

- source ID;
- transliteration;
- authority;
- certainty;
- source class;
- current glyph-ID sequence;
- current IPA sequence;
- token counts;
- candidate syllabification(s);
- phoneme frequency contribution;
- core/bridge/runtime-only classification;
- unresolved pronunciation flags.

It must then calculate separately:

1. recovered-only phoneme coverage;
2. recovered + governed-candidate coverage;
3. bridge coverage;
4. full HNK40 runtime coverage;
5. unattested runtime capacity;
6. frequency by token and by lexeme;
7. positional distribution (initial/medial/final);
8. candidate CV/CVC/V/VC and mora patterns.

## 11. Gate decision

`PHONOLOGICAL_CENSUS_V0_1 = OPEN`

We have enough evidence to reject the historical 40-slot count as a phonological requirement, but **not enough evidence yet to canonize the final Core HNK phoneme inventory**.

The correct next action is corpus-wide machine extraction followed by human review of ambiguous units, with `Y` and the non-safe HNK40 slots prioritized.
