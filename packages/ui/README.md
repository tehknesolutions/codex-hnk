# @hnk/ui

Shared visual-system contract for HNK web and native product surfaces.

## Governance

The Kether direction `HNK SACRED EDITORIAL FANTASY` is frozen at the role/principle level by the Visual Bible and Kether Freeze V1.

The concrete token values in this package are **provisional implementation values**, not final approved palette or typography families. This distinction is intentional:

- semantic roles may be reused now;
- values may be refined through formal design review;
- no consumer should hard-code sacred meaning into a hex value or font family;
- no token creates or legitimizes a sacred symbol, sigil, angelic correspondence or doctrinal claim.

## Shared roles

Kether currently exposes:

- fertile void / surface / raised surface;
- primary / secondary / muted text;
- material gold / bright gold;
- origin white;
- sacred-display / editorial-body / system typography roles;
- 3 / 6 / 12 / 24 / 36 / 72 rhythm;
- origin, ring, axis, node and threshold geometry primitives;
- Z0–Z5 depth semantics;
- reduced-motion behavior.

## Web

Import the scoped stylesheet:

`@hnk/ui/styles/kether.css`

Then place `data-hnk-theme="kether"` on the relevant product surface.

## React Native / Expo

Consume the TypeScript export from `@hnk/ui` and map the semantic roles to native style objects. Browser CSS custom properties are not the native contract.

## Rule

A screen can elaborate the direction, but it must not silently fork the direction. Day 001 is the next master consumer of this package.
