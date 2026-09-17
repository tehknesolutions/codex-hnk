# Comparative Pass 004 — Éliphas Lévi → Golden Dawn → Crowley

Status: `IMPLEMENTED_AS_REFERENCE_CATALOG`

Protocol: `CODEX_ADMISSION_PROTOCOL_V1`

Canon import: `NONE_AUTOMATIC`

## Objective

Track how the modern Western occult Tarot/Hebrew correspondence system changes from Éliphas Lévi through the Golden Dawn Cipher Manuscript lineage and into Crowley's Thoth revision, then convert those changes into explicit Codex admission decisions.

## Historical findings

1. **Lévi** aligns the Hebrew alphabet with the Tarot trumps in alphabetic/numbered order and places the Fool at **Shin**, immediately before Tav/World.
2. The **Golden Dawn Cipher Manuscript** moves the Fool to **Aleph**, shifts the sequence, and interchanges Strength/Justice to align Teth with Leo and Lamed with Libra.
3. **Liber AL vel Legis I:57** states that Tzaddi is not the Star. The verse rejects one inherited attribution but does not itself identify the replacement.
4. In **The Book of Thoth**, Crowley resolves that statement by counterchanging the Emperor and the Star: Tzaddi is assigned to the Emperor and Heh to the Star.
5. The comparison proves that correspondence tables must be stored as **versioned tradition-specific sets**, not as timeless universal key/value facts.

## Codex decisions

### CORE governance admitted

- `HNK-R001-075` — Heh/Tzaddi conflict must remain versioned rather than silently harmonized.
- `HNK-R001-076` — every correspondence set requires an explicit tradition/system identity.
- `HNK-R001-077` — Tarot card number and Hebrew-letter position are distinct dimensions.
- `HNK-R001-079` — a revelatory claim cannot auto-promote a tradition-specific remapping into shared HNK canon.
- `HNK-R001-081` — HNK-authored mappings must be explicitly marked `HNK_AUTHORED` and must not borrow historical authority by resemblance.

### REFERENCE admitted

The specific Lévi, Golden Dawn and Crowley mappings are retained as historical/reference layers. They are not promoted to HNK doctrine.

### CANDIDATE retained

- symmetry as a design heuristic;
- tradition-preserving symbolic redesign;
- Tarot as an optional interface layer rather than mandatory ontology.

### RESEARCH_ONLY

Crowley's phonetic/etymological argument for Tzaddi/Emperor is retained for understanding his internal reasoning but is not treated as reliable historical linguistics or operational HNK evidence.

## HNK architecture consequence

The Correspondence Engine must model at least:

```text
subject
mapping_domain
mapping_value
tradition_id
source_work
source_version_or_recension
author_or_order
historical_layer
status
conflicts_with[]
inherits_from[]
hnk_authorship
hnk_decision
```

A query such as `Tzaddi → Tarot` must therefore be able to return multiple scoped answers, for example Golden Dawn and Thoth, instead of collapsing them into one record.

## Source basis

Primary/reference sources used in this pass:

- Éliphas Lévi, *Dogme et Rituel de la Haute Magie* — https://www.arbredor.com/ebooks/Dogme.pdf
- Aleister Crowley, *Liber AL vel Legis*, I:57 — https://sacred-texts.com/oto/engccxx.htm
- Aleister Crowley, *The Book of Thoth* — https://www.rahoorkhuit.net/library/crowley/equinox/volume3/vol_3_no_05.pdf
- Helen Farley, *A Cultural History of Tarot* — comparative table for Lévi and the Cipher Manuscript.

## Epistemic lock

This pass documents **historical systems and their internal interpretations**. It does not treat Tarot/Hebrew correspondences, revelatory claims, or occult causal mechanisms as independently demonstrated scientific facts.
