# HNK CANON CONTENT RESOLVER V1

Status: APPROVED ARCHITECTURE / GOLDEN DAY 001

## Objective

Guarantee that a Quest phase that declares `source.kind = CANON` renders text that is byte-for-byte derived from the canonical source bundle pinned by `canonical.source_sha`.

The resolver does not paraphrase Canon and does not mix Guide/System copy into canonical blocks.

## Source identity

Day 001 is pinned to:

- repository: `Tehkne-Solutions/hnk-codex-365`
- path: `canon/capitulo-01-kether/dia-001.md`
- blob SHA: `a01d13b43cbddb92236fc1e3b6c2a7e140d87d29`
- editorial version: `1.0`
- canonical counted core: `705` words

## Block extraction

Primary blocks use the existing canonical markers:

`<!-- HNK:COUNT START <id> target=<n> -->`
...
`<!-- HNK:COUNT END -->`

These markers are authoritative for the nine 137/72/26 editorial blocks.

`QR CODE INTERATIVO` and `ESPELHO DA ALMA` are explicit auxiliary sections and are included in the Day 001 manifest as `SECTION` blocks. They are not part of the 705-word counted core.

## Runtime contract

Quest:

`source.kind = CANON` + `source.block_ids` + `canonical.source_sha`

becomes:

`resolveCanonicalBlocks(manifest, { sourceSha, blockIds })`

The resolver rejects:

- source SHA drift;
- missing block IDs;
- duplicate block IDs;
- empty IDs.

It returns exact canonical text plus block SHA-256 and word metadata.

## Voice boundary

Resolved Canon is immutable presentation content.

Guide, Safety, System and User copy are separate channels. Renderers must never concatenate new prose into a Canon block and then label the result `CANON`.

## CI gate

`validate-day001-canon-resolver.mjs` verifies:

1. Quest source SHA equals the manifest blob SHA.
2. Every CANON block referenced by Day 001 exists.
3. Every block SHA-256 matches its exact normalized text.
4. Every counted block matches its 137/72/26 target.
5. The nine counted blocks total exactly 705 words.
6. QR and Espelho remain outside the 705-word counted core.

## Editorial patches

When the Canon changes, the old manifest does not mutate in place.

Required sequence:

Canon edit → new source blob SHA → regenerate block manifest → update Quest source SHA/version → rerun CI gates → release.

This makes editorial changes explicit and auditable.
