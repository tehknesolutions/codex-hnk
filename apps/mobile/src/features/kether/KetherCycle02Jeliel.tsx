import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { getKetherCrownState } from '@hnk/supabase-client';
import { useHnkAuth } from '../auth/AuthContext';
import { JelielDay006Experience } from './JelielDay006Experience';

type ProgressState = {
  currentDay: number;
  xpTotal: number;
  initiatoryTitle: string;
};

const DEFAULT_PROGRESS: ProgressState = {
  currentDay: 6,
  xpTotal: 0,
  initiatoryTitle: 'Neófito',
};

export function KetherCycle02Jeliel() {
  const auth = useHnkAuth();
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [fragmentsLit, setFragmentsLit] = useState(1);
  const [loading, setLoading] = useState(true);
  const [displayDay, setDisplayDay] = useState(6);

  const live = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client);

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
      setProgress({
        currentDay: data.current_day,
        xpTotal: data.xp_total,
        initiatoryTitle: data.initiatory_title,
      });
      if (data.current_day >= 6 && data.current_day <= 10) setDisplayDay(data.current_day);
      if (data.current_day > 10) setDisplayDay(10);
    }

    try {
      const crown = await getKetherCrownState(auth.client);
      if (typeof crown === 'object' && crown !== null && !Array.isArray(crown)) {
        const value = (crown as Record<string, unknown>).fragments_lit;
        if (typeof value === 'number') setFragmentsLit(value);
      }
    } catch {
      // Crown remains presentation-only here; canonical Day gating still lives on the server.
    }

    setLoading(false);
  }, [auth.client, auth.phase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => void refresh(), 6000);
    return () => clearInterval(id);
  }, [live, refresh]);

  if (loading && live) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#efe0a2" />
        <Text style={styles.loadingText}>ABRINDO O SILÊNCIO DE JELIEL</Text>
      </View>
    );
  }

  const completedInCycle = Math.max(0, Math.min(5, progress.currentDay - 6));

  return (
    <View style={styles.screen}>
      <View style={styles.rail}>
        <View style={styles.railLine} />
        {[6, 7, 8, 9, 10].map((day, index) => {
          const done = index < completedInCycle;
          const available = day <= progress.currentDay;
          const active = displayDay === day;
          return (
            <Pressable
              key={day}
              disabled={!available}
              onPress={() => setDisplayDay(day)}
              style={styles.nodeWrap}
            >
              <View style={[styles.node, done && styles.nodeDone, active && styles.nodeActive, !available && styles.nodeLocked]}>
                <Text style={[styles.nodeText, (done || active) && styles.nodeTextActive]}>{done ? '✓' : day}</Text>
              </View>
              <Text style={[styles.nodeLabel, active && styles.nodeLabelActive]}>
                {day === 6 ? 'ESCUTAR' : day === 7 ? 'SOLTAR' : day === 8 ? 'DESCER' : day === 9 ? 'RECORDAR' : 'ANCORAR'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>KETHER · CICLO II · O SILÊNCIO DE JELIEL</Text>
          <Text style={styles.heading}>DIA {String(displayDay).padStart(3, '0')}</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.stat}>{progress.initiatoryTitle.toUpperCase()}</Text>
          <Text style={styles.stat}>{progress.xpTotal} XP</Text>
          <Text style={styles.stat}>COROA · {fragmentsLit}/7</Text>
        </View>
      </View>

      {displayDay === 6 ? (
        <JelielDay006Experience />
      ) : (
        <View style={styles.pending}>
          <Text style={styles.pendingEyebrow}>RUNTIME CONTRACT READY</Text>
          <Text style={styles.pendingTitle}>DIA {String(displayDay).padStart(3, '0')}</Text>
          <Text style={styles.pendingBody}>
            O contrato executável deste Dia já está congelado no catálogo de Jeliel. A experiência visual específica será conectada à mesma Day Runtime Shell na próxima unidade de produção; nenhum conteúdo canônico será inventado para preencher a lacuna.
          </Text>
        </View>
      )}
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
  nodeText: { color: '#696b72', fontSize: 9, fontWeight: '700' },
  nodeTextActive: { color: '#f1dda0' },
  nodeLabel: { color: '#51535a', fontSize: 6, letterSpacing: 0.8 },
  nodeLabelActive: { color: '#a99864' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#17181b' },
  eyebrow: { color: '#786d49', fontSize: 8, letterSpacing: 1.5 },
  heading: { color: '#e8dfc2', fontSize: 14, letterSpacing: 2.1, marginTop: 5 },
  stats: { alignItems: 'flex-end', gap: 3 },
  stat: { color: '#777970', fontSize: 8, letterSpacing: 1 },
  pending: { margin: 24, borderWidth: 1, borderColor: '#292a2f', borderRadius: 24, padding: 24, backgroundColor: '#08090d' },
  pendingEyebrow: { color: '#8d7f4f', fontSize: 8, letterSpacing: 1.4 },
  pendingTitle: { color: '#f2e8ca', fontSize: 26, fontWeight: '300', marginTop: 8 },
  pendingBody: { color: '#8f918d', fontSize: 13, lineHeight: 21, marginTop: 12 },
});
