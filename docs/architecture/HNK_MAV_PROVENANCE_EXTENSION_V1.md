# HNK/MAV Provenance Extension V1

Status: PROPOSED IMPLEMENTATION
Authority: HNK-authored proposal following approved TW decisions
Upstream: CODEX_ADMISSION_PROTOCOL_V1, HNK_HUMAN_GATE_PROTOCOL_V1

## Purpose

Extend the existing Codex epistemic layers without replacing them. The extension distinguishes creator-authored HNK definitions from external factual claims and preserves TW testimony and interpretation as first-class provenance.

## Additional provenance classes

- TW_TESTIMONY — an autobiographical report by TW about an experience or event.
- TW_INTERPRETATION — meaning or causal reading assigned by TW to evidence or experience.
- TRANSCENDENTAL_INTERPRETATION — spiritual/metaphysical interpretation; not automatically an external fact.
- HNK_AUTHORED_DEFINITION — meaning constituted by TW's authorial authority inside HNK.
- HNK_AUTHORED_CANON — HNK material explicitly approved through the applicable Human Gate.
- EXTERNAL_FACT_CLAIM — historical, scientific, linguistic, biblical-textual or empirical claim requiring evidence appropriate to its domain.
- OPEN_HYPOTHESIS — proposition retained for testing without truth promotion.

## Authority boundary

HNK authorial authority determines HNK-internal meaning when TW explicitly defines or approves it. It does not automatically establish an external factual claim.

External evidence may challenge an external premise used by HNK while not redefining an HNK-authored internal meaning.

## Compatibility

These classes complement, not replace:
SOURCE_FACT, SOURCE_DOCTRINE, SOURCE_CORRESPONDENCE, SOURCE_INTERPRETATION, UNVERIFIED_SOURCE_CLAIM, OUR_STRUCTURAL_INFERENCE, HNK_REFERENCE, HNK_CANDIDATE and HNK_CANON.

## Rule

Observation, testimony, interpretation, hypothesis and canon must remain distinguishable in storage and review. No transformation between them is implicit.
