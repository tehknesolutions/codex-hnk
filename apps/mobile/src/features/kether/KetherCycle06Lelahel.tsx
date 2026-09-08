import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { getKetherCrownState } from '@hnk/supabase-client';
import { useHnkAuth } from '../auth/AuthContext';
import { LelahelBlockedGate } from './LelahelBlockedGate';
import { LelahelExecutableExperience } from './LelahelExecutableExperience';

export function KetherCycle06Lelahel() {
  const auth = useHnkAuth();
  const [currentDay, setCurrentDay] = useState(26);
  const [xpTotal, setXpTotal] = useState(0);
  const [title, setTitle] = useState('Neófito');
  const [fragmentsLit, setFragmentsLit] = useState(5);
  const [displayDay, setDisplayDay] = useState(26);
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
      if (data.current_day >= 26 && data.current_day <= 30) setDisplayDay(data.current_day);
      if (data.current_day > 30) setDisplayDay(30);
    }

    try {
      const crown = await getKetherCrownState(auth.client);
      if (typeof crown === 'object' && crown !== null && !Array.isArray(crown)) {
        const value = (crown as Record<string, unknown>).fragments_lit;
        if (typeof value === 'number') setFragmentsLit(value);
      }
    } catch {
      // Presentation only; canonical progression remains server-owned.
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
    return <View style={styles.loading}><ActivityIndicator color="#efe0a2" /><Text style={styles.loadingText}>ABRINDO O RESPLENDOR DE LELAHEL</Text></View>;
  }

  const completed = Math.max(0, Math.min(5, currentDay - 26));
  return (
    <View style={styles.screen}>
      <View style={styles.rail}>
        <View style={styles.railLine} />
        {[26, 27, 28, 29, 30].map((day, index) => {
          const done = index < completed;
          const available = day <= currentDay;
          const active = displayDay === day;
          return (
            <Pressable key={day} disabled={!available} onPress={() => setDisplayDay(day)} style={styles.nodeWrap}>
              <View style={[styles.node, done && styles.nodeDone, active && styles.nodeActive, !available && styles.nodeLocked]}>
                <Text style={[styles.nodeText, (done || active) && styles.nodeTextActive]}>{done ? '✓' : day}</Text>
              </View>
              <Text style={[styles.nodeLabel, active && styles.nodeLabelActive]}>{day === 26 ? 'LOCALIZAR' : day === 27 ? 'ESTABILIZAR' : day === 28 ? 'NAVEGAR' : day === 29 ? 'TRANSMUTAR' : 'MODULAR'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>KETHER · CICLO VI · O RESPLENDOR DE LELAHEL</Text><Text style={styles.heading}>DIA {String(displayDay).padStart(3, '0')}</Text></View>
        <View style={styles.stats}><Text style={styles.stat}>{title.toUpperCase()}</Text><Text style={styles.stat}>{xpTotal} XP</Text><Text style={styles.stat}>COROA · {fragmentsLit}/7</Text></View>
      </View>

      {displayDay === 28 || displayDay === 30
        ? <LelahelBlockedGate day={displayDay} />
        : <LelahelExecutableExperience day={displayDay as 26 | 27 | 29} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#030406' },
  loadingText: { color: '#786d49', fontSize: 9, letterSpacing: 1.5 },
  rail: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10, backgroundColor: '#050609', position: 'relative' },
  railLine: { position: 'absolute', left: 44, right: 44, top: 33, height: 1, backgroundColor: '#25262a' },
  nodeWrap: { flex: 1, alignItems: 'center', gap: 7 },
  node: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#35363a', backgroundColor: '#08090d', alignItems: 'center', justifyContent: 'center' },
  nodeDone: { borderColor: '#776838', backgroundColor: '#171308' },
  nodeActive: { borderColor: '#ddc97a', backgroundColor: '#2b2512' },
  nodeLocked: { opacity: 0.3 },
  nodeText: { color: '#696b72', fontSize: 8, fontWeight: '700' },
  nodeTextActive: { color: '#f1dda0' },
  nodeLabel: { color: '#51535a', fontSize: 6, letterSpacing: 0.6 },
  nodeLabelActive: { color: '#a99864' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#17181b' },
  eyebrow: { color: '#786d49', fontSize: 8, letterSpacing: 1.4 },
  heading: { color: '#e8dfc2', fontSize: 14, letterSpacing: 2.1, marginTop: 5 },
  stats: { alignItems: 'flex-end', gap: 3 },
  stat: { color: '#777970', fontSize: 8, letterSpacing: 1 },
});
