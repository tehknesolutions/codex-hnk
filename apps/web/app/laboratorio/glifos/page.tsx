import Link from 'next/link';
import matrix from '../../../../../packages/hnk-glyphs/reference/HNK40_REFERENCE_MATRIX_V1.json';
import recovery from '../../../../../data/lab/hnk-glyph-registry.gap.v1.json';

export default function GlyphRegistryPage(){
 return <main className="constellation-stage">
  <header className="constellation-head"><Link href="/laboratorio">← Grimório</Link><div><p>HNK · GLYPH REGISTRY</p><h1>HNK-40</h1></div><span>{matrix.entries.length}/{matrix.glyph_count} estruturais</span></header>
  <section className="constellation-book">
   <article className="constellation-page"><p className="folio-kicker">AUTORIDADE RECUPERADA</p><h2>{matrix.matrix_id}</h2><p>IDs e fonemas dos 40 glifos estão materializados. A autoridade visual recuperada é <b>{recovery.visual_authority.status}</b>; este registry não transforma PUA candidata em semântica Unicode nem inventa equivalências ainda pendentes.</p><p className="constellation-rule">HNK-40 ≠ HENUVOKODAN · Visual Canon V2 não reivindica recuperação do alfabeto legado perdido.</p></article>
   <article className="constellation-page relation-page"><p className="folio-kicker">40 RAÍZES</p><h2>Inventário estrutural</h2><div className="relation-scroll">{matrix.entries.map(g=><div className="relation-card" key={g.glyph_id}><header><span>{g.glyph_id}</span><b>{g.world_id}</b></header><p><strong>{g.phoneme_ipa}</strong>{g.safe_transliteration ? <> · {g.safe_transliteration}</> : null}</p><p><code>{g.candidate_pua}</code> · coluna {g.protoglyph_column}</p><small>{g.digital.encoding_status}</small></div>)}</div></article>
  </section>
  <section className="constellation-book"><article className="constellation-page"><p className="folio-kicker">VISUAL CANON</p><h2>{recovery.visual_authority.status}</h2><p>40 raízes · sprite <code>{recovery.visual_authority.sprite_sha256}</code></p><p>Ordered set <code>{recovery.visual_authority.ordered_set_sha256}</code></p></article><article className="constellation-page"><p className="folio-kicker">FONT ATTESTATION</p><h2>{recovery.font_attestation.family} {recovery.font_attestation.version}</h2><p>{recovery.font_attestation.glyph_mappings} mappings: {recovery.font_attestation.inventory.roots} roots + {recovery.font_attestation.inventory.mx1} MX1.</p><p className="constellation-rule">A atestação verifica o build; não significa que os binários estejam publicados neste repositório.</p></article></section>
 </main>
}
