import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { KetherCycle01 } from './KetherCycle01';
import { KetherCycle02Jeliel } from './KetherCycle02Jeliel';
import { KetherCycle03Sitael } from './KetherCycle03Sitael';
import { KetherCycle04Elemiah } from './KetherCycle04Elemiah';
import { KetherCycle05Mahasiah } from './KetherCycle05Mahasiah';
import { KetherCycle06Lelahel } from './KetherCycle06Lelahel';
import { KetherCycle07Achaiah } from './KetherCycle07Achaiah';

export function KetherJourney() {
  const auth = useHnkAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!auth.client || auth.phase !== 'signed-in') {
      setCurrentDay(1);
      setLoading(false);
      return;
    }

    const { data, error } = await auth.client
      .from('user_progress')
      .select('current_day')
      .maybeSingle();

    if (!error) setCurrentDay(data?.current_day ?? 1);
    setLoading(false);
  }, [auth.client, auth.phase]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!auth.client || auth.phase !== 'signed-in') return;
    const id = setInterval(() => void refresh(), 4000);
    return () => clearInterval(id);
  }, [auth.client, auth.phase, refresh]);

  if (loading && auth.phase === 'signed-in') {
    return <View style={styles.loading}><ActivityIndicator color="#efe0a2" /><Text style={styles.loadingText}>LENDO A ROTA DE KETHER</Text></View>;
  }

  if (currentDay <= 5) return <KetherCycle01 />;
  if (currentDay <= 10) return <KetherCycle02Jeliel />;
  if (currentDay <= 15) return <KetherCycle03Sitael />;
  if (currentDay <= 20) return <KetherCycle04Elemiah />;
  if (currentDay <= 25) return <KetherCycle05Mahasiah />;
  if (currentDay <= 30) return <KetherCycle06Lelahel />;
  if (currentDay <= 35) return <KetherCycle07Achaiah />;

  return (
    <View style={styles.threshold}>
      <Text style={styles.eyebrow}>KETHER · COROA 7/7 · PORTAL DISPONÍVEL</Text>
      <Text style={styles.title}>PORTAL 036</Text>
      <Text style={styles.body}>Os Dias 001–035 chegaram ao limiar do Portal. Coroa 7/7 não promove Grau: o estado canônico permanece Neófito até a conclusão válida do Dia 036 no backend.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#030406' },
  loadingText: { color: '#786d49', fontSize: 9, letterSpacing: 1.5 },
  threshold: { flex: 1, backgroundColor: '#030406', padding: 28, justifyContent: 'center' },
  eyebrow: { color: '#8d7f4f', fontSize: 9, letterSpacing: 1.5 },
  title: { color: '#f2e8ca', fontSize: 34, fontWeight: '300', marginTop: 10 },
  body: { color: '#8f918d', fontSize: 14, lineHeight: 22, marginTop: 14, maxWidth: 620 },
});
