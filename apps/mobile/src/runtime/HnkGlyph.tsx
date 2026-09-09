import type { StyleProp, ViewStyle } from 'react-native';
import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  HNK40_SACRED_10X4,
  getGlyphSvg,
  transliterationToGlyphIds,
  type GlyphId,
} from '@hnk/glyphs';

const DEFAULT_COLOR = '#E8C676';
const SAFE_HEX_COLOR = /^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/;

function normalizeColor(value: string) {
  return SAFE_HEX_COLOR.test(value) ? value : DEFAULT_COLOR;
}

function getMobileGlyphXml(glyphId: GlyphId, color: string, label?: string) {
  const safeColor = normalizeColor(color);
  return getGlyphSvg(glyphId, { ariaLabel: label ?? glyphId })
    .replaceAll('currentColor', safeColor)
    .replace(/\sstyle="color:[^"]*"/, '');
}

export type HnkGlyphProps = {
  glyphId: GlyphId;
  size?: number;
  color?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function HnkGlyph({
  glyphId,
  size = 48,
  color = DEFAULT_COLOR,
  label,
  style,
}: HnkGlyphProps) {
  return (
    <View
      accessibilityLabel={label ?? glyphId}
      style={[{ width: size, height: size }, style]}
    >
      <SvgXml
        xml={getMobileGlyphXml(glyphId, color, label)}
        width={size}
        height={size}
      />
    </View>
  );
}

export type HnkGlyphSequenceProps = {
  glyphIds: readonly (GlyphId | 'SPACE')[];
  size?: number;
  color?: string;
  gap?: number;
  label?: string;
};

export function HnkGlyphSequence({
  glyphIds,
  size = 48,
  color = DEFAULT_COLOR,
  gap = 2,
  label,
}: HnkGlyphSequenceProps) {
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap }}
    >
      {glyphIds.map((glyphId, index) =>
        glyphId === 'SPACE' ? (
          <View key={`space-${index}`} style={{ width: size * 0.45 }} />
        ) : (
          <HnkGlyph
            key={`${glyphId}-${index}`}
            glyphId={glyphId}
            size={size}
            color={color}
          />
        ),
      )}
    </View>
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
  color = DEFAULT_COLOR,
  gap = 2,
  strict = false,
}: HnkWordProps) {
  const parsed = transliterationToGlyphIds(transliteration, {
    includeSpaces: true,
    strict,
  });

  return (
    <View
      accessible
      accessibilityLabel={transliteration}
      style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap }}
    >
      {parsed.glyphIds.map((glyphId, index) =>
        glyphId === 'SPACE' ? (
          <View key={`space-${index}`} style={{ width: size * 0.45 }} />
        ) : (
          <HnkGlyph
            key={`${glyphId}-${index}`}
            glyphId={glyphId}
            size={size}
            color={color}
          />
        ),
      )}
      {parsed.unresolved.length > 0 ? (
        <Text style={{ color: '#F2C66D', fontSize: 11 }}>
          {' '}[unresolved: {parsed.unresolved.map((item) => item.source).join(', ')}]
        </Text>
      ) : null}
    </View>
  );
}

export function HnkSacred10x4({ size = 42 }: { size?: number }) {
  return (
    <View style={{ gap: 8 }}>
      {HNK40_SACRED_10X4.map((row, rowIndex) => (
        <View key={`row-${rowIndex + 1}`} style={{ flexDirection: 'row', gap: 6 }}>
          {row.map((entry) => (
            <View
              key={entry.glyphId}
              style={{
                width: Math.max(size + 16, 62),
                alignItems: 'center',
                gap: 3,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: 'rgba(232,198,118,0.25)',
                borderRadius: 10,
              }}
            >
              <HnkGlyph glyphId={entry.glyphId} size={size} />
              <Text style={{ color: '#EEF2F7', fontSize: 10 }}>{entry.glyphId}</Text>
              <Text style={{ color: '#93A1B4', fontSize: 10 }}>{entry.phonemeIpa}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
