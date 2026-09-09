# HNK Gneo Geo — Source Recovery V1

**Status:** `SOURCE_RECOVERED / PROVENANCE_PENDING / NOT_CANON`  
**Tracking:** Issue #3 · Kether Day 028 / Chokmah Day 066  
**Recovered candidate asset:** `assets/candidates/gneo-geo/cockpit-gneo-geo-recovered-v1.svg`

## 1. Why this record exists

The migration audit previously treated Gneo Geo / Circuito 8 as an under-specified canonical reference. A deeper search through the HNK project history recovered concrete material that had not yet been promoted into the new repository.

The recovery materially reduces the blocker, but it does not justify claiming that every recovered construction is byte-identical to an original Bluefluke plate. Provenance therefore remains open.

## 2. Recovered project sources

The project history records all of the following:

1. a conceptual Day 028 operator: **Estrela Goética Dupla / Cockpit Astral Gneo Geo**, with the practitioner seated at the center and "sintonizando os 8 circuitos";
2. a separate list of the **8 Circuitos da Consciência**:
   1. Biossobrevivência Oral;
   2. Emocional / Territorial;
   3. Neurosemântica;
   4. Doméstica / Sócio-Sexual;
   5. Neurosômica;
   6. Metaprogramação;
   7. Morfogenética;
   8. Rede Quântica;
3. a project asset manifest distinguishing Bluefluke reference plates:
   - Level 7: Estrela Goética / Cockpit do Duplo Astral;
   - Level 8: Espíritos Locais / 8 Circuitos;
   - Level 10: Cockpit Gneo Geo / Pérola Azul;
4. an earlier generated `cockpit_gneo_geo.svg` with two opposed triangles inside a circular field and the Pérola Azul centered;
5. a later HNK card schematic with exact coordinates for a double-star cockpit, cardinal axes and eight numbered cockpit nodes.

## 3. Recovered geometry

The source-recovery candidate preserves the later project schematic coordinates:

### Frame

```text
viewBox: 0 0 500 265
circle: center (250,132), radius 105
```

### Mirrored Goetic triangles

```text
upper-oriented triangle: 250,27 → 335,178 → 165,178
lower-oriented triangle: 250,237 → 165,86 → 335,86
```

### Cardinal axes

```text
vertical:   (250,12) → (250,252)
horizontal: (130,132) → (370,132)
```

This is sufficient to reproduce the recovered HNK project geometry deterministically. It is not yet sufficient to claim original-publication provenance.

## 4. Recovered cockpit slots

The same project schematic labels eight **cockpit nodes**:

| Node | Recovered label | Recovered center |
|---:|---|---|
| 1 | Superconsciência | `(290,100)` |
| 2 | Consciência | `(250,170)` |
| 3 | Subconsciente | `(210,100)` |
| 4 | Multi-Sigilo | `(250,120)` |
| 5 | Temperamento | `(180,140)` |
| 6 | Tarefa Principal | `(250,48)` |
| 7 | Longevidade | `(320,140)` |
| 8 | Nome / Circuito 8 | `(250,92)` |

The numbered slots provide a stable display taxonomy. The recovered source does **not** prove that numerical display order is the required runtime navigation order.

## 5. Critical distinction — cockpit nodes are not the eight consciousness circuits

The recovery exposes a prior ambiguity that must not be carried into canon.

There are two separate eight-part structures in the project history:

### A. Eight cockpit nodes

`Superconsciência / Consciência / Subconsciente / Multi-Sigilo / Temperamento / Tarefa Principal / Longevidade / Nome-Circuito 8`

### B. Eight Circuits of Consciousness

`Biossobrevivência Oral / Emocional-Territorial / Neurosemântica / Doméstica-Sócio-Sexual / Neurosômica / Metaprogramação / Morfogenética / Rede Quântica`

The project history associates **Circuito 8** specifically with **Rede Quântica**, while the cockpit schematic's node 8 is labeled `Nome / Circuito 8`.

No recovered source reviewed here establishes a one-to-one mapping between all eight cockpit nodes and all eight consciousness circuits. Production must not invent such a mapping.

## 6. Relationship among Gneo Geo terms

The recovered material supports this conservative terminology:

- **Estrela Goética Dupla:** the opposed/mirrored-star geometry used by the cockpit visualization;
- **Cockpit Astral / Cockpit Gneo Geo:** the control-space visualization built around that geometry;
- **Pérola Azul:** a distinct central/focal operator appearing in the Level 10 Gneo Geo material and in an earlier HNK SVG;
- **Circuito 8 / Rede Quântica:** the eighth item in the separate consciousness-circuit sequence;
- **8 cockpit nodes:** numbered information/control positions in a recovered HNK schematic.

These relationships are sufficient to prevent conflating the terms, but not to claim a final canonical runtime semantics for each node.

## 7. Recovered candidate asset

`assets/candidates/gneo-geo/cockpit-gneo-geo-recovered-v1.svg` reconstructs only the source-supported core:

- circular field;
- two opposed triangles;
- north/south/east/west axes;
- eight node positions and labels.

It deliberately does not add inferred connections, path arrows, circuit-to-node mapping, ritual effects or a canonical navigation sequence.

## 8. What Issue #3 can now mark as recovered

```text
Gneo Geo name / cockpit relationship         RECOVERED
Double-star project geometry                 RECOVERED
Geometry orientation by coordinates          RECOVERED
Eight cockpit node labels                    RECOVERED
Eight cockpit node positions                 RECOVERED
Eight consciousness-circuit names/order      RECOVERED
Circuit 8 = Rede Quântica label              RECOVERED
```

## 9. What remains unresolved

```text
original Bluefluke plate provenance/license  PENDING
canonical choice among recovered variants    PENDING
exact Pérola Azul placement in final asset   PENDING
runtime navigation order between nodes       PENDING
node-by-node functional behavior              PENDING
mapping of 8 circuits ↔ 8 cockpit nodes       NOT ESTABLISHED
production master + registry/checksum         PENDING
visual/runtime QA                             PENDING
```

## 10. Canonical rule

The recovered SVG is a **project-source reconstruction**, not an assertion of historical originality. It may be used for internal review and implementation fixtures. It must not enter `assets/canon/` or unblock final runtime until provenance and the remaining semantic choices are explicitly frozen.

## 11. Impact on Days 028 and 066

The Day 028/066 blocker is no longer accurately described as "geometry absent" or "eight labels absent." Those pieces are now recovered.

The blocker should now be tracked as:

> **SOURCE RECOVERED / CANONICAL PROVENANCE + SEMANTICS PENDING**

This materially narrows the work required before the Day can become canonical/runtime-enabled without inventing missing structure.
