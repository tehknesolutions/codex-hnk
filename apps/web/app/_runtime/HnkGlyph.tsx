import type { CSSProperties } from 'react';
import {
  HNK40_SACRED_10X4,
  getGlyphSvg,
  transliterationToGlyphIds,
  type GlyphId,
} from '@hnk/glyphs';

export type HnkGlyphProps = {
  glyphId: GlyphId;
  size?: number;
  color?: string;
  label?: string;
  className?: string;
};

export function HnkGlyph({
  glyphId,
  size = 48,
  color = 'currentColor',
  label,
  className,
}: HnkGlyphProps) {
  const svg = getGlyphSvg(glyphId, { ariaLabel: label ?? glyphId }).replace(
    '<svg ',
    `<svg width="${size}" height="${size}" `,
  );

  const style: CSSProperties = {
    display: 'inline-grid',
    placeItems: 'center',
    width: size,
    height: size,
    color,
    lineHeight: 0,
    flex: '0 0 auto',
  };

  return (
    <span
      className={className}
      data-hnk-glyph={glyphId}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export type HnkWordProps = {
  transliteration: string;
  size?: number;
  color?: string;
  gap?: number;
  strict?: boolean;
};

export function HnkWord({
  transliteration,
  size = 48,
  color = 'currentColor',
  gap = 2,
  strict = false,
}: HnkWordProps) {
  const parsed = transliterationToGlyphIds(transliteration, {
    includeSpaces: true,
    strict,
  });

  return (
    <span
      aria-label={transliteration}
      data-hnk-transliteration={transliteration}
      data-hnk-unresolved={parsed.unresolved.map((item) => item.source).join('')}
      style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap }}
    >
      {parsed.glyphIds.map((glyphId, index) =>
        glyphId === 'SPACE' ? (
          <span key={`space-${index}`} aria-hidden="true" style={{ width: size * 0.45 }} />
        ) : (
          <HnkGlyph
            key={`${glyphId}-${index}`}
            glyphId={glyphId}
            size={size}
            color={color}
          />
        ),
      )}
    </span>
  );
}

export function HnkSacred10x4({ size = 44 }: { size?: number }) {
  return (
    <div
      data-hnk-sacred-10x4
      style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
    >
      {HNK40_SACRED_10X4.flat().map((entry) => (
        <div
          key={entry.glyphId}
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 4,
            padding: 8,
            border: '1px solid rgba(232,198,118,.25)',
            borderRadius: 10,
          }}
        >
          <HnkGlyph glyphId={entry.glyphId} size={size} color="#e8c676" />
          <small>{entry.glyphId}</small>
          <small style={{ opacity: 0.72 }}>{entry.phonemeIpa}</small>
        </div>
      ))}
    </div>
  );
}
