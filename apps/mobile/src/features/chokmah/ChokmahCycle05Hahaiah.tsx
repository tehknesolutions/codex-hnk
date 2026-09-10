import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { HahaiahDay057PartnerExperiment } from './HahaiahDay057PartnerExperiment';
import { HahaiahDay058LanguageExperience } from './HahaiahDay058LanguageExperience';
import { HahaiahDay059BluePearlExperience } from './HahaiahDay059BluePearlExperience';
import { HahaiahDay060SocialObservationExperience } from './HahaiahDay060SocialObservationExperience';
import { HahaiahDay061DigitalGovernanceExperience } from './HahaiahDay061DigitalGovernanceExperience';

const HAHAIAH_DAYS = [57, 58, 59, 60, 61] as const;
type HahaiahDay = (typeof HAHAIAH_DAYS)[number];

export function ChokmahCycle05Hahaiah() {
  const auth = useHnkAuth();
  const [currentDay, setCurrentDay] = useState(57);
  const [xpTotal, setXpTotal] = useState(0);
  const [title, setTitle] = useState('Iniciado');
  const [displayDay, setDisplayDay] = useState<HahaiahDay>(57);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!auth.client || auth.phase !== 'signed-in') { setLoading(false); return; }
    const { data, error } = await auth.client.from('user_progress').select('current_day,xp_total,initiatory_title').maybeSingle();
    if (!error && data) {
      setCurrentDay(data.current_day);
      setXpTotal(data.xp_total);
      setTitle(data.initiatory_title);
      if (data.current_day >= 57 && data.current_day <= 61) setDisplayDay(data.current_day as HahaiahDay);
      if (data.current_day > 61) setDisplayDay(61);
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
    return <View style={styles.loading}><ActivityIndicator color="#9fc6ff" /><Text style={styles.loadingText}>ABRINDO O CICLO DE HAHAIAH</Text></View>;
  }

  const completed = Math.max(0, Math.min(5, currentDay - 57));

  return (
    <View style={styles.screen}>
      <View style={styles.rail}>
        <View style={styles.railLine} />
        {HAHAIAH_DAYS.map((day, index) => {
          const done = index < completed;
          const available = day <= currentDay;
          const active = displayDay === day;
          return (
            <Pressable key={day} disabled={!available} onPress={() => setDisplayDay(day)} style={styles.nodeWrap}>
              <View style={[styles.node, done && styles.nodeDone, active && styles.nodeActive, !available && styles.nodeLocked]}>
                <Text style={[styles.nodeText, (done || active) && styles.nodeTextActive]}>{done ? '✓' : day}</Text>
              </View>
              <Text style={[styles.nodeLabel, active && styles.nodeLabelActive]}>{day === 57 ? 'PARCEIRO' : day === 58 ? 'LINGUAGEM' : day === 59 ? 'PÉROLA' : day === 60 ? 'SOCIAL' : 'DIGITAL'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>CHOKMAH · CICLO V · RELAÇÃO E DISCERNIMENTO DE HAHAIAH</Text><Text style={styles.heading}>DIA {String(displayDay).padStart(3, '0')}</Text></View>
        <View style={styles.stats}><Text style={styles.stat}>{title.toUpperCase()}</Text><Text style={styles.stat}>{xpTotal} XP</Text><Text style={styles.stat}>LEVEL 2</Text></View>
      </View>

      {displayDay === 57 ? <HahaiahDay057PartnerExperiment /> : null}
      {displayDay === 58 ? <HahaiahDay058LanguageExperience /> : null}
      {displayDay === 59 ? <HahaiahDay059BluePearlExperience /> : null}
      {displayDay === 60 ? <HahaiahDay060SocialObservationExperience /> : null}
      {displayDay === 61 ? <HahaiahDay061DigitalGovernanceExperience /> : null}
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
  nodeText: { color: '#71879b', fontSize: 8, fontWeight: '700' },
  nodeTextActive: { color: '#e2f2ff' },
  nodeLabel: { color: '#526b80', fontSize: 6, letterSpacing: 0.7 },
  nodeLabelActive: { color: '#8fb5d7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#12263a' },
  eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 },
  heading: { color: '#e8f4ff', fontSize: 14, letterSpacing: 2.1, marginTop: 5 },
  stats: { alignItems: 'flex-end', gap: 3 },
  stat: { color: '#72899c', fontSize: 8, letterSpacing: 1 },
});
