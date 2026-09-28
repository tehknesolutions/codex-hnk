# CODEX-HNK — Visual Target V1 QA Matrix

## Purpose

Convert the 12-source dissection into repeatable review criteria.

## Source coverage

| Source | Primary QA question |
|---|---|
| VS-01 | Does Knowledge Map preserve book/map/matrix hierarchy? |
| VS-02 | Does Home preserve macrocosm, three spheres, tree, metrics and portal grid? |
| VS-03 | Does Personal Codex preserve identity, tree, timeline and mission hierarchy? |
| VS-04/06/07/08 | Does Practice preserve the common mission anatomy across visual variants? |
| VS-05 | Does Portal Mode preserve monumental first-fold composition? |
| VS-09 | Does Day preserve the sequential chamber/storyboard model? |
| VS-10 | Does Henuvokodan preserve glyph/system distinction? |
| VS-11 | Does Journey preserve onboarding → practice → reflection → reward → progression? |
| VS-12 | Does the implementation expose reusable tokens/components/motion rather than a flattened mockup? |

## Review layers

### L1 — Silhouette
- major blocks occupy the expected regions;
- portal/hero mass is preserved;
- central visual focus is obvious;
- side rails do not overpower the main artifact.

### L2 — Hierarchy
- title > section > body > metadata;
- primary CTA is visually dominant;
- symbolic content does not compete with action;
- supporting navigation remains secondary.

### L3 — Materiality
- gold behaves as hierarchy/light;
- parchment behaves as manuscript/document;
- dark cosmic field behaves as depth;
- artwork retains atmospheric depth.

### L4 — Geometry
- circles, triangles, tree, matrix and sigils remain structurally recognizable;
- glyphs are not replaced with arbitrary iconography;
- radial systems preserve alignment.

### L5 — Interaction
- every visible CTA has a real state;
- tree nodes expose state;
- practice controls are interactive;
- progress is data-driven;
- navigation works independently of artwork.

### L6 — Responsive
- no horizontal overflow;
- semantic sequence preserved;
- mobile cards become a narrative stack;
- primary action remains reachable;
- artwork is cropped intentionally rather than accidentally.

### L7 — Accessibility
- keyboard navigation;
- focus-visible;
- semantic headings;
- alt text;
- accessible names for functional glyphs;
- decorative glyphs hidden from assistive technology;
- reduced motion.

### L8 — Performance
- original PNGs are source-only;
- production images have derived optimized formats;
- below-fold artwork lazy loads;
- no giant background containing semantic UI;
- no unnecessary simultaneous decoding.

## Pass criteria

A visual implementation is not considered faithful merely because colors match.

Minimum pass requires:

```
silhouette
+
hierarchy
+
composition
+
materiality
+
semantic interaction
+
responsive equivalence
```

## Regression protocol

For each visual milestone:

1. Capture desktop.
2. Capture mobile.
3. Compare against the relevant VS source.
4. Check source-to-component mapping.
5. Check semantic content outside artwork.
6. Check keyboard/focus.
7. Check reduced motion.
8. Check image/network weight.
9. Record deviations.
10. Update the implementation issue/PR.

## Explicit deviations

A deviation is acceptable only when documented as one of:

- functional requirement;
- accessibility requirement;
- responsive requirement;
- performance requirement;
- canonical semantic requirement.

Aesthetic drift without reason is not an accepted deviation.
