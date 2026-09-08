import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { CahetelDays037to039Experience } from './CahetelDays037to039Experience';

export function ChokmahCycle01Cahetel() {
  const auth = useHnkAuth();
  const [currentDay, setCurrentDay] = useState(37);
  const [xpTotal, setXpTotal] = useState(0);
  const [title, setTitle] = useState('Iniciado');
  const [displayDay, setDisplayDay] = useState(37);
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
      if (data.current_day >= 37 && data.current_day <= 41) setDisplayDay(data.current_day);
      if (data.current_day > 41) setDisplayDay(41);
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
    return <View style={styles.loading}><ActivityIndicator color="#8ed7ff" /><Text style={styles.loadingText}>ABRINDO A RECEPTIVIDADE DE CAHETEL</Text></View>;
  }

  const completed = Math.max(0, Math.min(5, currentDay - 37));

  return (
    <View style={styles.screen}>
      <View style={styles.rail}>
        <View style={styles.railLine} />
        {[37, 38, 39, 40, 41].map((day, index) => {
          const done = index < completed;
          const available = day <= currentDay;
          const active = displayDay === day;
          const draftOnly = day >= 40;
          return (
            <Pressable key={day} disabled={!available} onPress={() => setDisplayDay(day)} style={styles.nodeWrap}>
              <View style={[styles.node, done && styles.nodeDone, active && styles.nodeActive, !available && styles.nodeLocked, draftOnly && styles.nodeDraft]}>
                <Text style={[styles.nodeText, (done || active) && styles.nodeTextActive]}>{done ? '✓' : day}</Text>
              </View>
              <Text style={[styles.nodeLabel, active && styles.nodeLabelActive]}>{day === 37 ? 'RECEBER' : day === 38 ? 'ACOMPANHAR' : day === 39 ? 'SENTIR' : day === 40 ? 'INDUZIR' : 'INTUIR'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>CHOKMAH · CICLO I · O SOPRO RECEPTIVO DE CAHETEL</Text><Text style={styles.heading}>DIA {String(displayDay).padStart(3, '0')}</Text></View>
        <View style={styles.stats}><Text style={styles.stat}>{title.toUpperCase()}</Text><Text style={styles.stat}>{xpTotal} XP</Text><Text style={styles.stat}>LEVEL 2</Text></View>
      </View>

      {displayDay <= 39 ? <CahetelDays037to039Experience day={displayDay as 37 | 38 | 39} /> : <EditorialDraftGate day={displayDay as 40 | 41} />}
    </View>
  );
}

function EditorialDraftGate({ day }: { day: 40 | 41 }) {
  return (
    <View style={styles.pendingWrap}>
      <View style={styles.pendingCard}>
        <Text style={styles.pendingLabel}>EDITORIAL_DRAFT_PENDING_CANON</Text>
        <Text style={styles.pendingTitle}>Dia {String(day).padStart(3, '0')} já foi escrito, mas ainda não é cânone publicado.</Text>
        <Text style={styles.pendingBody}>O draft está preservado no staging editorial com 705 palavras estruturais exatas. Esta tela não abre Practice Session, não envia evidence e não concede XP até promoção explícita no repositório canônico.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#02050a' },
  loadingText: { color: '#5a89a1', fontSize: 9, letterSpacing: 1.5 },
  rail: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10, backgroundColor: '#030810', position: 'relative' },
  railLine: { position: 'absolute', left: 44, right: 44, top: 33, height: 1, backgroundColor: '#18303d' },
  nodeWrap: { flex: 1, alignItems: 'center', gap: 7 },
  node: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#284653', backgroundColor: '#061018', alignItems: 'center', justifyContent: 'center' },
  nodeDone: { borderColor: '#5292ad', backgroundColor: '#0a202c' },
  nodeActive: { borderColor: '#9ce4ff', backgroundColor: '#123447' },
  nodeLocked: { opacity: 0.3 },
  nodeDraft: { borderStyle: 'dashed' },
  nodeText: { color: '#668695', fontSize: 8, fontWeight: '700' },
  nodeTextActive: { color: '#d9f5ff' },
  nodeLabel: { color: '#4e6974', fontSize: 6, letterSpacing: 0.7 },
  nodeLabelActive: { color: '#82bdd4' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#10232d' },
  eyebrow: { color: '#5f94aa', fontSize: 8, letterSpacing: 1.5 },
  heading: { color: '#e6f7ff', fontSize: 14, letterSpacing: 2.1, marginTop: 5 },
  stats: { alignItems: 'flex-end', gap: 3 },
  stat: { color: '#6f8c98', fontSize: 8, letterSpacing: 1 },
  pendingWrap: { flex: 1, padding: 24, justifyContent: 'center' },
  pendingCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#34596a', borderRadius: 24, padding: 24, backgroundColor: '#050d13', gap: 12 },
  pendingLabel: { color: '#6ca2b7', fontSize: 9, letterSpacing: 1.4, fontWeight: '700' },
  pendingTitle: { color: '#e4f4fb', fontSize: 23, lineHeight: 30, fontWeight: '300' },
  pendingBody: { color: '#89a0aa', fontSize: 13, lineHeight: 21 },
});
