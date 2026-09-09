import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { HazielDays042to044Experience } from './HazielDays042to044Experience';
import { HazielDay045AudioExperience } from './HazielDay045AudioExperience';

const HAZIEL_DAYS = [42, 43, 44, 45, 46] as const;
type HazielDay = (typeof HAZIEL_DAYS)[number];

export function ChokmahCycle02Haziel() {
  const auth = useHnkAuth();
  const [currentDay, setCurrentDay] = useState(42);
  const [xpTotal, setXpTotal] = useState(0);
  const [title, setTitle] = useState('Iniciado');
  const [displayDay, setDisplayDay] = useState<HazielDay>(42);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!auth.client || auth.phase !== 'signed-in') {
      setLoading(false);
      return;
    }
    const { data, error } = await auth.client
      .from('user_progress')
      .select('current_day,xp_total,initiatory_title')
      .maybeSingle();

    if (!error && data) {
      setCurrentDay(data.current_day);
      setXpTotal(data.xp_total);
      setTitle(data.initiatory_title);
      if (data.current_day >= 42 && data.current_day <= 46) setDisplayDay(data.current_day as HazielDay);
      if (data.current_day > 46) setDisplayDay(46);
    }
    setLoading(false);
  }, [auth.client, auth.phase]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!auth.client || auth.phase !== 'signed-in') return;
    const id = setInterval(() => void refresh(), 4000);
    return () => clearInterval(id);
  }, [auth.client, auth.phase, refresh]);

  if (loading && auth.phase === 'signed-in') {
    return <View style={styles.loading}><ActivityIndicator color="#9fc6ff" /><Text style={styles.loadingText}>ABRINDO O ESPELHO DE HAZIEL</Text></View>;
  }

  const completed = Math.max(0, Math.min(4, currentDay - 42));

  return (
    <View style={styles.screen}>
      <View style={styles.rail}>
        <View style={styles.railLine} />
        {HAZIEL_DAYS.map((day, index) => {
          const executable = day <= 45;
          const done = executable && index < completed;
          const available = day <= currentDay;
          const active = displayDay === day;
          const blocked = day >= 46;
          return (
            <Pressable key={day} disabled={!available} onPress={() => setDisplayDay(day)} style={styles.nodeWrap}>
              <View style={[styles.node, done && styles.nodeDone, active && styles.nodeActive, !available && styles.nodeLocked, blocked && styles.nodeBlocked]}>
                <Text style={[styles.nodeText, (done || active) && styles.nodeTextActive]}>{done ? '✓' : day}</Text>
              </View>
              <Text style={[styles.nodeLabel, active && styles.nodeLabelActive]}>{day === 42 ? 'FRONTAL' : day === 43 ? 'PÉROLA' : day === 44 ? 'TRUÍSMOS' : day === 45 ? 'ÁUDIO' : 'VEGETAL'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>CHOKMAH · CICLO II · O ESPELHO RECEPTIVO DE HAZIEL</Text><Text style={styles.heading}>DIA {String(displayDay).padStart(3, '0')}</Text></View>
        <View style={styles.stats}><Text style={styles.stat}>{title.toUpperCase()}</Text><Text style={styles.stat}>{xpTotal} XP</Text><Text style={styles.stat}>LEVEL 2</Text></View>
      </View>

      {displayDay <= 44 ? <HazielDays042to044Experience day={displayDay as 42 | 43 | 44} /> : null}
      {displayDay === 45 ? <HazielDay045AudioExperience /> : null}
      {displayDay === 46 ? <Day046RuntimePending /> : null}
    </View>
  );
}

function Day046RuntimePending() {
  return (
    <View style={styles.blockWrap}>
      <View style={styles.blockCard}>
        <Text style={styles.blockLabel}>CANONICAL_STORAGE_READY · G7_RUNTIME_PENDING</Text>
        <Text style={styles.blockTitle}>Dia 046 está canônico e sequencialmente elegível após o selo do Dia 045.</Text>
        <Text style={styles.blockBody}>O antigo blocker AUDIO_PRESET_PENDING foi removido. Esta tela permanece sem Practice Session porque a experiência específica do Dia 046 ainda não foi implementada no Mobile. O runtime não inventa uma experiência genérica apenas porque o conteúdo existe no banco.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#02050a' },
  loadingText: { color: '#6585a5', fontSize: 9, letterSpacing: 1.5 },
  rail: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10, backgroundColor: '#030810', position: 'relative' },
  railLine: { position: 'absolute', left: 44, right: 44, top: 33, height: 1, backgroundColor: '#1d3046' },
  nodeWrap: { flex: 1, alignItems: 'center', gap: 7 },
  node: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#334861', backgroundColor: '#07101a', alignItems: 'center', justifyContent: 'center' },
  nodeDone: { borderColor: '#5f87b7', backgroundColor: '#0b2034' },
  nodeActive: { borderColor: '#9fcfff', backgroundColor: '#17334d' },
  nodeLocked: { opacity: 0.3 },
  nodeBlocked: { borderStyle: 'dashed' },
  nodeText: { color: '#71879b', fontSize: 8, fontWeight: '700' },
  nodeTextActive: { color: '#e2f2ff' },
  nodeLabel: { color: '#526b80', fontSize: 6, letterSpacing: 0.7 },
  nodeLabelActive: { color: '#8fb5d7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#12263a' },
  eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 },
  heading: { color: '#e8f4ff', fontSize: 14, letterSpacing: 2.1, marginTop: 5 },
  stats: { alignItems: 'flex-end', gap: 3 },
  stat: { color: '#72899c', fontSize: 8, letterSpacing: 1 },
  blockWrap: { flex: 1, padding: 24, justifyContent: 'center' },
  blockCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#46627c', borderRadius: 24, padding: 24, backgroundColor: '#050d16', gap: 12 },
  blockLabel: { color: '#86a9c7', fontSize: 9, letterSpacing: 1.4, fontWeight: '700' },
  blockTitle: { color: '#e6f2fc', fontSize: 23, lineHeight: 30, fontWeight: '300' },
  blockBody: { color: '#91a4b4', fontSize: 13, lineHeight: 21 },
});
