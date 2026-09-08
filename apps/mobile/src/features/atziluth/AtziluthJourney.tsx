import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { ChokmahJourney } from '../chokmah/ChokmahJourney';
import { KetherJourney } from '../kether/KetherJourney';

export function AtziluthJourney() {
  const auth = useHnkAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [currentSephira, setCurrentSephira] = useState('Kether');
  const [title, setTitle] = useState('Neófito');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!auth.client || auth.phase !== 'signed-in') {
      setCurrentDay(1);
      setCurrentSephira('Kether');
      setTitle('Neófito');
      setLoading(false);
      return;
    }

    const { data, error } = await auth.client
      .from('user_progress')
      .select('current_day,current_sephira,initiatory_title')
      .maybeSingle();

    if (!error && data) {
      setCurrentDay(data.current_day ?? 1);
      setCurrentSephira(data.current_sephira ?? 'Kether');
      setTitle(data.initiatory_title ?? 'Neófito');
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
    return <View style={styles.loading}><ActivityIndicator color="#fff2b1" /><Text style={styles.loadingText}>LENDO O EIXO DE ATZILUTH</Text></View>;
  }

  if (currentDay <= 36) return <KetherJourney />;
  if (currentDay <= 73) return <ChokmahJourney />;

  return (
    <View style={styles.threshold}>
      <Text style={styles.eyebrow}>ATZILUTH · LEVEL 3 · {currentSephira.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>A progressão oficial alcançou o Dia {String(currentDay).padStart(3, '0')}. O roteador já reconhece Binah; a experiência do Capítulo 3 será conectada à mesma autoridade server-side sem auto-iniciar o primeiro Dia.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#030406' },
  loadingText: { color: '#887d5d', fontSize: 9, letterSpacing: 1.5 },
  threshold: { flex: 1, backgroundColor: '#050407', padding: 28, justifyContent: 'center' },
  eyebrow: { color: '#806f91', fontSize: 9, letterSpacing: 1.5 },
  title: { color: '#f4eef8', fontSize: 36, fontWeight: '300', marginTop: 10 },
  body: { color: '#9d95a5', fontSize: 14, lineHeight: 22, marginTop: 14, maxWidth: 620 },
});
