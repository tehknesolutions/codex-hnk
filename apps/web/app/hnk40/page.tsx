import { HNK40_SPRITE_SHA256, HNK40_STATUS } from '@hnk/glyphs';
import { HnkSacred10x4, HnkWord } from '../_runtime/HnkGlyph';

const RECOVERED_EXAMPLES = [
  ['VAMAKALA', 'apelido / nome familiar'],
  ['SARADAYA', 'origem / local de nascimento'],
  ['VALIVAN', 'escritório'],
  ['PARAZAMO', 'escola / domínio de estudo'],
  ['HENUVOKODAN', 'nome do idioma / sistema'],
] as const;

export default function Hnk40ProofPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#07111f',
        color: '#eef2f7',
        padding: '32px clamp(18px, 5vw, 72px)',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <p style={{ color: '#e8c676', letterSpacing: '.14em', fontSize: 12 }}>
          {HNK40_STATUS} · CANDIDATE D FREEZE PASS 1
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#e8c676', letterSpacing: '.08em' }}>
          HNK40 · Shared Runtime Proof
        </h1>
        <p style={{ maxWidth: 880, lineHeight: 1.65, color: '#b8c2cf' }}>
          Esta superfície Web consome G01–G40, IPA, transliteração segura e as formas SVG
          diretamente de <code>@hnk/glyphs</code>. Nenhum desenho ou mapa fonético é duplicado
          neste app. A camada visual continua em pré-produção e ainda não é VISUAL-CANON-V2.
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Sacred 10×4</h2>
          <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
            <div style={{ minWidth: 920 }}>
              <HnkSacred10x4 size={46} />
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Corpus HNK recuperado</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {RECOVERED_EXAMPLES.map(([word, meaning]) => (
              <article
                key={word}
                style={{
                  border: '1px solid rgba(232,198,118,.18)',
                  borderRadius: 12,
                  padding: 16,
                  background: '#0b1626',
                }}
              >
                <strong style={{ color: '#e8c676', fontSize: 20 }}>{word}</strong>
                <div style={{ color: '#95a3b5', margin: '3px 0 12px' }}>{meaning}</div>
                <HnkWord transliteration={word} size={54} color="#e8c676" strict />
              </article>
            ))}
          </div>
        </section>

        <footer style={{ marginTop: 24, color: '#718096', fontSize: 12 }}>
          Frozen sprite SHA-256: <code>{HNK40_SPRITE_SHA256}</code>
        </footer>
      </div>
    </main>
  );
}

const sectionStyle = {
  marginTop: 28,
  padding: 20,
  border: '1px solid #26364a',
  borderRadius: 14,
  background: '#091525',
} as const;

const headingStyle = {
  color: '#e8c676',
  fontFamily: 'Georgia, serif',
  letterSpacing: '.05em',
} as const;
