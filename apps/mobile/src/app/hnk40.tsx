import { HNK40_SPRITE_SHA256, HNK40_STATUS } from '@hnk/glyphs';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HnkSacred10x4, HnkWord } from '../runtime/HnkGlyph';

const RECOVERED_EXAMPLES = [
  ['VAMAKALA', 'apelido / nome familiar'],
  ['SARADAYA', 'origem / local de nascimento'],
  ['VALIVAN', 'escritório'],
  ['PARAZAMO', 'escola / domínio de estudo'],
  ['HENUVOKODAN', 'nome do idioma / sistema'],
] as const;

export default function Hnk40ProofScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.status}>{HNK40_STATUS} · CANDIDATE D FREEZE PASS 1</Text>
        <Text style={styles.title}>HNK40 · Shared Runtime Proof</Text>
        <Text style={styles.copy}>
          Esta superfície Expo consome os mesmos G01–G40, IPA, SVG e parser de
          transliteração de @hnk/glyphs. O app mobile não mantém cópia própria do alfabeto.
        </Text>

        <View style={styles.panel}>
          <Text style={styles.heading}>Sacred 10×4</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HnkSacred10x4 size={40} />
          </ScrollView>
        </View>

        <View style={styles.panel}>
          <Text style={styles.heading}>Corpus HNK recuperado</Text>
          <View style={styles.examples}>
            {RECOVERED_EXAMPLES.map(([word, meaning]) => (
              <View key={word} style={styles.card}>
                <Text style={styles.word}>{word}</Text>
                <Text style={styles.meaning}>{meaning}</Text>
                <HnkWord transliteration={word} size={48} strict />
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#07111F' },
  content: { padding: 22, gap: 18 },
  status: { color: '#E8C676', fontSize: 11, letterSpacing: 1.4 },
  title: { color: '#E8C676', fontSize: 28, fontWeight: '700' },
  copy: { color: '#B8C2CF', fontSize: 15, lineHeight: 23 },
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
  word: { color: '#E8C676', fontSize: 19, fontWeight: '700' },
  meaning: { color: '#95A3B5', fontSize: 13, marginBottom: 8 },
  hash: { color: '#718096', fontSize: 10 },
  warning: { color: '#F2C66D', fontSize: 11, paddingBottom: 18 },
});
