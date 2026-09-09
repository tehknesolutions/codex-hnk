import { HNK40_SPRITE_SHA256, HNK40_STATUS } from '@hnk/glyphs';
import {
  HNK_MASTER_LEXICON,
  HNK_MASTER_LEXICON_STATS,
  HNK_MASTER_LEXICON_STATUS,
  HNK_MASTER_PHRASES,
  type LexiconAuthority,
} from '@hnk/linguas';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HnkGlyphSequence, HnkSacred10x4 } from '../runtime/HnkGlyph';

const AUTHORITY_ORDER: readonly LexiconAuthority[] = [
  'FROZEN',
  'WATCH',
  'CANDIDATE',
  'GATE',
  'BRIDGE',
  'REFERENCE',
];

export default function Hnk40ProofScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.status}>{HNK40_STATUS} · {HNK_MASTER_LEXICON_STATUS}</Text>
        <Text style={styles.title}>HNK40 · Master Lexicon v1</Text>
        <Text style={styles.copy}>
          Expo consome os mesmos G01–G40, SVG Candidate D e registry linguística de
          @hnk/linguas. WATCH, CANDIDATE e GATE permanecem separados do material FROZEN.
        </Text>

        <View style={styles.metrics}>
          <Metric label="formas" value={HNK_MASTER_LEXICON_STATS.lexemes} />
          <Metric label="frases" value={HNK_MASTER_LEXICON_STATS.phrases} />
          <Metric label="glosas" value={HNK_MASTER_LEXICON_STATS.withRecoveredMeaning} />
          <Metric label="sem glosa" value={HNK_MASTER_LEXICON_STATS.withoutRecoveredMeaning} />
        </View>

        <View style={styles.panel}>
          <Text style={styles.heading}>Sacred 10×4</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HnkSacred10x4 size={40} />
          </ScrollView>
        </View>

        {AUTHORITY_ORDER.map((authority) => {
          const entries = HNK_MASTER_LEXICON.filter((entry) => entry.authority === authority);
          if (!entries.length) return null;
          return (
            <View key={authority} style={styles.panel}>
              <Text style={styles.heading}>{authority} · {entries.length}</Text>
              <View style={styles.examples}>
                {entries.map((entry) => (
                  <View key={entry.id} style={styles.card}>
                    <Text style={styles.word}>{entry.transliteration}</Text>
                    <Text style={styles.meaning}>
                      {entry.meaning?.pt ?? 'Glosa não recuperada — preservada sem invenção.'}
                    </Text>
                    <Text style={styles.meta}>
                      IPA {entry.ipa} · {entry.legacyStatus}
                      {entry.lessons.length ? ` · ${entry.lessons.join(', ')}` : ''}
                    </Text>
                    <HnkGlyphSequence
                      glyphIds={entry.glyphIds}
                      size={36}
                      label={entry.transliteration}
                    />
                    <Text style={styles.gids}>{entry.glyphIds.join('·')}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.panel}>
          <Text style={styles.heading}>Frases recuperadas · {HNK_MASTER_PHRASES.length}</Text>
          <View style={styles.examples}>
            {HNK_MASTER_PHRASES.map((phrase) => (
              <View key={phrase.id} style={styles.card}>
                <Text style={styles.word}>{phrase.transliteration}</Text>
                <Text style={styles.meaning}>
                  {phrase.meaning?.pt ?? 'Glosa exata ainda não recuperada.'}
                </Text>
                <HnkGlyphSequence
                  glyphIds={phrase.glyphIds}
                  size={30}
                  label={phrase.transliteration}
                />
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.hash}>Frozen sprite SHA-256: {HNK40_SPRITE_SHA256}</Text>
        <Text style={styles.warning}>PREPRODUCTION · ainda não é VISUAL-CANON-V2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07111F' },
  content: { padding: 22, gap: 18 },
  status: { color: '#E8C676', fontSize: 11, letterSpacing: 1.4 },
  title: { color: '#E8C676', fontSize: 28, fontWeight: '700' },
  copy: { color: '#B8C2CF', fontSize: 15, lineHeight: 23 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: {
    minWidth: 80,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,198,118,0.2)',
    borderRadius: 12,
    backgroundColor: '#0B1626',
  },
  metricValue: { color: '#E8C676', fontSize: 18, fontWeight: '700' },
  metricLabel: { color: '#95A3B5', fontSize: 11 },
  panel: {
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26364A',
    borderRadius: 14,
    backgroundColor: '#091525',
  },
  heading: { color: '#E8C676', fontSize: 20, fontWeight: '600' },
  examples: { gap: 12 },
  card: {
    gap: 5,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,198,118,0.18)',
    borderRadius: 12,
    backgroundColor: '#0B1626',
  },
  word: { color: '#E8C676', fontSize: 18, fontWeight: '700' },
  meaning: { color: '#95A3B5', fontSize: 13 },
  meta: { color: '#718096', fontSize: 10, marginBottom: 7 },
  gids: { color: '#64748B', fontSize: 9, marginTop: 6 },
  hash: { color: '#718096', fontSize: 10 },
  warning: { color: '#F2C66D', fontSize: 11, paddingBottom: 18 },
});
