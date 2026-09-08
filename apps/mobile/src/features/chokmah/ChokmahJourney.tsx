import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { ChokmahCycle01Cahetel } from './ChokmahCycle01Cahetel';

export function ChokmahJourney() {
  const auth = useHnkAuth();
  const [currentDay, setCurrentDay] = useState(37);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!auth.client || auth.phase !== 'signed-in') {
      setCurrentDay(37);
      setLoading(false);
      return;
    }
    const { data, error } = await auth.client.from('user_progress').select('current_day').maybeSingle();
    if (!error) setCurrentDay(data?.current_day ?? 37);
    setLoading(false);
  }, [auth.client, auth.phase]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!auth.client || auth.phase !== 'signed-in') return;
    const id = setInterval(() => void refresh(), 4000);
    return () => clearInterval(id);
  }, [auth.client, auth.phase, refresh]);

  if (loading && auth.phase === 'signed-in') {
    return <View style={styles.loading}><ActivityIndicator color="#8ed7ff" /><Text style={styles.loadingText}>LENDO A ROTA DE CHOKMAH</Text></View>;
  }

  if (currentDay <= 41) return <ChokmahCycle01Cahetel />;

  return (
    <View style={styles.threshold}>
      <Text style={styles.eyebrow}>CHOKMAH · ESTEIRA EDITORIAL</Text>
      <Text style={styles.title}>DIA {String(Math.min(currentDay, 73)).padStart(3, '0')}</Text>
      <Text style={styles.body}>A progressão server-side alcançou este ponto, mas o próximo ciclo só será executável depois que seu conteúdo passar de draft para cânone e receber runtime validado.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#02050a' },
  loadingText: { color: '#5a89a1', fontSize: 9, letterSpacing: 1.5 },
  threshold: { flex: 1, backgroundColor: '#02050a', padding: 28, justifyContent: 'center' },
  eyebrow: { color: '#5f94aa', fontSize: 9, letterSpacing: 1.5 },
  title: { color: '#e6f7ff', fontSize: 34, fontWeight: '300', marginTop: 10 },
  body: { color: '#89a0aa', fontSize: 14, lineHeight: 22, marginTop: 14, maxWidth: 620 },
});
