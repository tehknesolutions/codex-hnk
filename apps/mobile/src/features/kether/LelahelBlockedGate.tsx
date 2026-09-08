import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { loadCanonicalDay, type CanonicalDaySnapshot } from './canonical-day';
import { CanonicalText, RuntimeCard, RuntimeNotice, runtimeTextStyles } from './KetherRuntimePrimitives';

type BlockedDay = 28 | 30;

const BLOCKERS = {
  28: {
    status: 'REFERENCE_PENDING',
    issue: '#3',
    title: 'Gneo Geo / Circuito 8 ainda não possui referência canônica executável',
    body: 'A fonte recuperada menciona Estrela Goética Dupla, Cockpit Astral, centro de comando e oito circuitos, mas não fixa geometria, funções, ordem de navegação ou provenance suficiente para o app inventar uma versão.',
    missing: 'geometria canônica · 8 circuitos · nomes/funções · ordem · provenance',
  },
  30: {
    status: 'AUDIO_PENDING',
    issue: '#4',
    title: 'Par ASMR Kether / controle neutro ainda não está aprovado',
    body: 'A primeira conclusão exige ACTIVE e CONTROL versionados, com duração/loudness comparáveis. Nenhuma frequência, preset ou faixa substituta será escolhida pelo cliente para fabricar uma prática completa.',
    missing: 'asset ACTIVE · asset CONTROL · checksum · loudness · cache/offline · QA de playback',
  },
} as const;

export function LelahelBlockedGate({ day }: { day: BlockedDay }) {
  const auth = useHnkAuth();
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const blocker = BLOCKERS[day];

  useEffect(() => {
    let active = true;
    setCanon(null);
    setError(null);
    if (!auth.client || auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(auth.client, day)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [auth.client, auth.phase, day]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>KETHER · LELAHEL {day - 25}/5 · DIA {String(day).padStart(3, '0')}</Text>
        <Text style={styles.title}>{canon?.title ?? `DIA ${String(day).padStart(3, '0')}`}</Text>
        <Text style={styles.status}>{blocker.status}</Text>
      </View>

      {error ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">{error}</RuntimeNotice> : null}

      <RuntimeCard label="BLOQUEIO DE PRODUÇÃO" title={blocker.title}>
        <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
        <Text style={runtimeTextStyles.body}>{blocker.body}</Text>
        <RuntimeNotice title={`TRACKING · ISSUE ${blocker.issue}`}>{blocker.missing}</RuntimeNotice>
        <RuntimeNotice title="REGRA DE INTEGRIDADE">Este gate não cria Practice Session, não concede XP, não marca completion e não permite saltar para o Dia seguinte. Leitura do cânone permanece disponível.</RuntimeNotice>
      </RuntimeCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, gap: 18, paddingBottom: 80 },
  header: { gap: 6 },
  eyebrow: { color: '#847748', fontSize: 9, letterSpacing: 1.5 },
  title: { color: '#f2ead1', fontSize: 28, lineHeight: 34, fontWeight: '300' },
  status: { color: '#d7a36d', fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
});
