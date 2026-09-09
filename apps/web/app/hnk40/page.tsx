import { HNK40_SPRITE_SHA256, HNK40_STATUS } from '@hnk/glyphs';
import {
  HNK_MASTER_LEXICON,
  HNK_MASTER_LEXICON_STATS,
  HNK_MASTER_LEXICON_STATUS,
  HNK_MASTER_LEXICON_VERSION,
  HNK_MASTER_PHRASES,
  type LexiconAuthority,
} from '@hnk/linguas';
import { HnkGlyphSequence, HnkSacred10x4 } from '../_runtime/HnkGlyph';

const AUTHORITY_ORDER: readonly LexiconAuthority[] = [
  'FROZEN',
  'WATCH',
  'CANDIDATE',
  'GATE',
  'BRIDGE',
  'REFERENCE',
];

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
          {HNK40_STATUS} · {HNK_MASTER_LEXICON_STATUS}
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#e8c676', letterSpacing: '.08em' }}>
          HNK40 · Master Lexicon v1
        </h1>
        <p style={{ maxWidth: 920, lineHeight: 1.65, color: '#b8c2cf' }}>
          Web consome o mesmo runtime G01–G40 e a mesma registry linguística compartilhada.
          A forma transliterada é a entrada humana; G-ID é a autoridade estrutural; SVG Candidate D
          continua em pré-produção e não é VISUAL-CANON-V2.
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Registry auditável</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, color: '#b8c2cf' }}>
            <Stat label="versão" value={HNK_MASTER_LEXICON_VERSION} />
            <Stat label="formas" value={String(HNK_MASTER_LEXICON_STATS.lexemes)} />
            <Stat label="frases" value={String(HNK_MASTER_LEXICON_STATS.phrases)} />
            <Stat label="com glosa" value={String(HNK_MASTER_LEXICON_STATS.withRecoveredMeaning)} />
            <Stat label="sem glosa" value={String(HNK_MASTER_LEXICON_STATS.withoutRecoveredMeaning)} />
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Sacred 10×4</h2>
          <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
            <div style={{ minWidth: 920 }}>
              <HnkSacred10x4 size={46} />
            </div>
          </div>
        </section>

        {AUTHORITY_ORDER.map((authority) => {
          const entries = HNK_MASTER_LEXICON.filter((entry) => entry.authority === authority);
          if (!entries.length) return null;
          return (
            <section key={authority} style={sectionStyle}>
              <h2 style={headingStyle}>
                {authority} · {entries.length}
              </h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {entries.map((entry) => (
                  <article key={entry.id} style={cardStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 10 }}>
                      <strong style={{ color: '#e8c676', fontSize: 20 }}>
                        {entry.transliteration}
                      </strong>
                      <code style={{ color: '#8fa4ba' }}>{entry.id}</code>
                    </div>
                    <div style={{ color: '#95a3b5', margin: '3px 0 5px' }}>
                      {entry.meaning?.pt ?? 'Glosa não recuperada — preservada sem invenção.'}
                    </div>
                    <div style={{ color: '#718096', fontSize: 12, marginBottom: 12 }}>
                      IPA {entry.ipa} · {entry.legacyStatus}
                      {entry.lessons.length ? ` · ${entry.lessons.join(', ')}` : ''}
                    </div>
                    <HnkGlyphSequence
                      glyphIds={entry.glyphIds}
                      size={44}
                      color="#e8c676"
                      label={entry.transliteration}
                    />
                    <div style={{ color: '#64748b', fontSize: 11, marginTop: 8 }}>
                      {entry.glyphIds.join('·')}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Frases recuperadas · {HNK_MASTER_PHRASES.length}</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {HNK_MASTER_PHRASES.map((phrase) => (
              <article key={phrase.id} style={cardStyle}>
                <strong style={{ color: '#e8c676', fontSize: 18 }}>{phrase.transliteration}</strong>
                <div style={{ color: '#95a3b5', margin: '5px 0 10px' }}>
                  {phrase.meaning?.pt ?? 'Glosa exata ainda não recuperada.'}
                </div>
                <HnkGlyphSequence
                  glyphIds={phrase.glyphIds}
                  size={36}
                  color="#e8c676"
                  label={phrase.transliteration}
                />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        border: '1px solid rgba(232,198,118,.22)',
        borderRadius: 999,
        padding: '7px 11px',
        background: '#0b1626',
      }}
    >
      <strong style={{ color: '#e8c676' }}>{value}</strong> {label}
    </span>
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

const cardStyle = {
  border: '1px solid rgba(232,198,118,.18)',
  borderRadius: 12,
  padding: 16,
  background: '#0b1626',
} as const;
