import { View, Text, StyleSheet } from 'react-native';
import { RuntimeNotice } from './KetherRuntimePrimitives';

export function MahasiahDay025Experience() {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>KETHER · MAHASIAH 5/5 · DIA 025</Text>
      <Text style={styles.title}>AR NATIVO NECESSÁRIO</Text>
      <RuntimeNotice title="SEM FALLBACK 2D">A conclusão canônica do Dia 025 exige ARCore/ARKit com âncora espacial e quatro pontos. A versão Web preserva leitura e explicação, mas não finge equivalência prática.</RuntimeNotice>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406', padding: 28, justifyContent: 'center', gap: 14 },
  eyebrow: { color: '#8d7f4f', fontSize: 9, letterSpacing: 1.5 },
  title: { color: '#f2e8ca', fontSize: 28, fontWeight: '300' },
});
